import type { User as FirebaseUser } from 'firebase/auth';
import type { House } from '@/types';
import { deleteAuthUser } from './authService';
import { deleteHouse, leaveHouse } from './houseService';
import { deleteUserProfile } from './userService';

/**
 * Deletes all of the user's data and their auth account. The caller must reauthenticate
 * first: deleteUser fails without a recent sign-in, and by then the data would be gone.
 *
 * - Admin: the whole house is deleted (the admin cannot leave it).
 * - Resident: leaves the house.
 */
export async function deleteAccount(user: FirebaseUser, house: House | null): Promise<void> {
  if (house) {
    if (house.ownerId === user.uid) await deleteHouse(house, user.uid);
    else await leaveHouse(house.id, user.uid);
  }

  await deleteUserProfile(user.uid);
  await deleteAuthUser(user);
}
