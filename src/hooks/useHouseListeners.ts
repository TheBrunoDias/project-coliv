'use client';

import type { FirestoreError } from 'firebase/firestore';
import { useEffect } from 'react';
import { subscribeToGroups } from '@/services/groupService';
import { isConfirmedMember, subscribeToHouse, subscribeToMembers } from '@/services/houseService';
import { subscribeToNotices } from '@/services/noticeService';
import { subscribeToPurchases } from '@/services/purchaseService';
import { subscribeToTasks } from '@/services/taskService';
import { clearUserHouse } from '@/services/userService';
import { useHouseStore } from '@/store/useHouseStore';

/**
 * Keeps useHouseStore in sync with the user's house. If the house was deleted or the
 * user was removed from it, clears their `houseId` so they are sent to onboarding.
 */
export function useHouseListeners(houseId: string, uid: string) {
  useEffect(() => {
    const { setHouse, setMembers, setGroups, setTasks, setPurchases, setNotices, reset } =
      useHouseStore.getState();
    let unsubscribers: (() => void)[] = [];
    let active = true;
    let checking = false;

    function unsubscribeAll() {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      unsubscribers = [];
    }

    // Something suggests we are no longer a member; confirm with the server before acting,
    // because listeners can run ahead of a create/join batch that is still being committed.
    async function checkMembership() {
      if (checking) return;
      checking = true;
      unsubscribeAll();
      try {
        const isMember = await isConfirmedMember(houseId, uid);
        if (!active) return;
        if (isMember) subscribe();
        else await clearUserHouse(uid);
      } catch (error) {
        console.error('Failed to verify house membership', error);
      } finally {
        checking = false;
      }
    }

    function handleError(error: FirestoreError) {
      // Reads are denied once the user is no longer a member
      if (error.code === 'permission-denied') void checkMembership();
      else console.error('House listener failed', error);
    }

    function subscribe() {
      unsubscribers = [
        subscribeToHouse(
          houseId,
          (house, fromCache) => {
            if (house) setHouse(house);
            else if (!fromCache) void checkMembership();
          },
          handleError,
        ),
        subscribeToMembers(
          houseId,
          (members, fromCache) => {
            setMembers(members);
            if (!fromCache && !members.some((member) => member.userId === uid)) {
              void checkMembership();
            }
          },
          handleError,
        ),
        subscribeToGroups(houseId, setGroups, handleError),
        subscribeToTasks(houseId, setTasks, handleError),
        subscribeToPurchases(houseId, setPurchases, handleError),
        subscribeToNotices(houseId, setNotices, handleError),
      ];
    }

    subscribe();

    return () => {
      active = false;
      unsubscribeAll();
      reset();
    };
  }, [houseId, uid]);
}
