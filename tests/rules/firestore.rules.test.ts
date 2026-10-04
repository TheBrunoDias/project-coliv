import { readFileSync } from 'node:fs';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  type Firestore,
} from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

const HOUSE_ID = 'house1';
const CODE = 'abcdefghjk23';
const NEW_CODE = 'mnpqrstuvw45';

let env: RulesTestEnvironment;

const dbAs = (uid: string) => env.authenticatedContext(uid).firestore() as unknown as Firestore;

async function seed(write: (db: Firestore) => Promise<void>) {
  await env.withSecurityRulesDisabled((context) =>
    write(context.firestore() as unknown as Firestore),
  );
}

async function seedUser(uid: string, houseId: string | null = null) {
  await seed((db) =>
    setDoc(doc(db, 'users', uid), {
      uid,
      displayName: uid,
      email: `${uid}@test.com`,
      houseId,
      createdAt: new Date(),
    }),
  );
}

/** admin owns HOUSE_ID; `residents` are members too. */
async function seedHouse(admin: string, residents: string[] = []) {
  await seedUser(admin, HOUSE_ID);
  for (const resident of residents) await seedUser(resident, HOUSE_ID);
  await seed(async (db) => {
    await setDoc(doc(db, 'houses', HOUSE_ID), {
      id: HOUSE_ID,
      name: 'Casa',
      ownerId: admin,
      inviteCode: CODE,
      createdAt: new Date(),
    });
    await setDoc(doc(db, 'invites', CODE), {
      houseId: HOUSE_ID,
      houseName: 'Casa',
      createdAt: new Date(),
    });
    for (const uid of [admin, ...residents]) {
      await setDoc(doc(db, 'houses', HOUSE_ID, 'members', uid), {
        userId: uid,
        displayName: uid,
        groupIds: [],
        joinedAt: new Date(),
      });
    }
  });
}

function createHouseBatch(db: Firestore, uid: string, houseId = HOUSE_ID, code = CODE) {
  const batch = writeBatch(db);
  batch.set(doc(db, 'houses', houseId), {
    id: houseId,
    name: 'Casa',
    ownerId: uid,
    inviteCode: code,
    createdAt: serverTimestamp(),
  });
  batch.set(doc(db, 'invites', code), {
    houseId,
    houseName: 'Casa',
    createdAt: serverTimestamp(),
  });
  batch.set(doc(db, 'houses', houseId, 'members', uid), {
    userId: uid,
    displayName: uid,
    groupIds: [],
    joinedAt: serverTimestamp(),
  });
  batch.update(doc(db, 'users', uid), { houseId });
  return batch;
}

function joinBatch(db: Firestore, uid: string, inviteCode: string, houseId = HOUSE_ID) {
  const batch = writeBatch(db);
  batch.set(doc(db, 'houses', houseId, 'members', uid), {
    userId: uid,
    displayName: uid,
    groupIds: [],
    joinedAt: serverTimestamp(),
    inviteCode,
  });
  batch.update(doc(db, 'users', uid), { houseId });
  return batch;
}

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-coliv',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  });
});

afterAll(async () => {
  await env.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
});

describe('users', () => {
  it('lets a user create and read only their own profile', async () => {
    await assertSucceeds(
      setDoc(doc(dbAs('ana'), 'users', 'ana'), {
        uid: 'ana',
        displayName: 'Ana',
        email: 'ana@test.com',
        houseId: null,
        createdAt: serverTimestamp(),
      }),
    );
    await assertFails(getDoc(doc(dbAs('bia'), 'users', 'ana')));
  });

  it('lets a user delete their own profile only after leaving their house', async () => {
    await seedHouse('admin', ['ana']);
    await seedUser('bia');
    await assertFails(deleteDoc(doc(dbAs('ana'), 'users', 'ana')));
    await assertFails(deleteDoc(doc(dbAs('ana'), 'users', 'bia')));
    await assertSucceeds(deleteDoc(doc(dbAs('bia'), 'users', 'bia')));
  });

  it('does not let a user point houseId at a house they are not a member of', async () => {
    await seedHouse('admin');
    await seedUser('ana');
    await assertFails(updateDoc(doc(dbAs('ana'), 'users', 'ana'), { houseId: HOUSE_ID }));
  });
});

describe('creating a house', () => {
  it('succeeds for a user without a house', async () => {
    await seedUser('ana');
    await assertSucceeds(createHouseBatch(dbAs('ana'), 'ana').commit());
  });

  it('fails for a user who already has a house', async () => {
    await seedHouse('admin');
    await assertFails(createHouseBatch(dbAs('admin'), 'admin', 'house2', NEW_CODE).commit());
  });
});

describe('joining via invite', () => {
  it('succeeds with the current invite code', async () => {
    await seedHouse('admin');
    await seedUser('ana');
    await assertSucceeds(getDoc(doc(dbAs('ana'), 'invites', CODE)));
    await assertSucceeds(joinBatch(dbAs('ana'), 'ana', CODE).commit());
    await assertSucceeds(getDoc(doc(dbAs('ana'), 'houses', HOUSE_ID)));
  });

  it('fails with a wrong invite code', async () => {
    await seedHouse('admin');
    await seedUser('ana');
    await assertFails(joinBatch(dbAs('ana'), 'ana', NEW_CODE).commit());
  });

  it('fails while the user is in another house', async () => {
    await seedHouse('admin');
    await seedUser('ana', 'otherHouse');
    await assertFails(joinBatch(dbAs('ana'), 'ana', CODE).commit());
  });

  it('does not let anyone list invites or read a house they are not in', async () => {
    await seedHouse('admin');
    await seedUser('ana');
    await assertFails(getDocs(collection(dbAs('ana'), 'invites')));
    await assertFails(getDoc(doc(dbAs('ana'), 'houses', HOUSE_ID)));
    await assertFails(getDocs(collection(dbAs('ana'), 'houses', HOUSE_ID, 'members')));
  });
});

describe('house settings', () => {
  function regenerateBatch(db: Firestore) {
    const batch = writeBatch(db);
    batch.set(doc(db, 'invites', NEW_CODE), {
      houseId: HOUSE_ID,
      houseName: 'Casa',
      createdAt: serverTimestamp(),
    });
    batch.delete(doc(db, 'invites', CODE));
    batch.update(doc(db, 'houses', HOUSE_ID), { inviteCode: NEW_CODE });
    return batch;
  }

  it('lets the admin regenerate the invite code', async () => {
    await seedHouse('admin');
    await assertSucceeds(regenerateBatch(dbAs('admin')).commit());
  });

  it('does not let a resident regenerate the invite code or rename the house', async () => {
    await seedHouse('admin', ['ana']);
    await assertFails(regenerateBatch(dbAs('ana')).commit());
    await assertFails(updateDoc(doc(dbAs('ana'), 'houses', HOUSE_ID), { name: 'Minha' }));
  });

  it('does not let the admin change the code without invalidating the old invite', async () => {
    await seedHouse('admin');
    const db = dbAs('admin');
    const batch = writeBatch(db);
    batch.set(doc(db, 'invites', NEW_CODE), {
      houseId: HOUSE_ID,
      houseName: 'Casa',
      createdAt: serverTimestamp(),
    });
    batch.update(doc(db, 'houses', HOUSE_ID), { inviteCode: NEW_CODE });
    await assertFails(batch.commit());
  });

  it('lets the admin rename the house and its invite together', async () => {
    await seedHouse('admin');
    const db = dbAs('admin');
    const batch = writeBatch(db);
    batch.update(doc(db, 'houses', HOUSE_ID), { name: 'Nova Casa' });
    batch.update(doc(db, 'invites', CODE), { houseName: 'Nova Casa' });
    await assertSucceeds(batch.commit());
  });

  it('does not let the admin transfer ownership', async () => {
    await seedHouse('admin', ['ana']);
    await assertFails(updateDoc(doc(dbAs('admin'), 'houses', HOUSE_ID), { ownerId: 'ana' }));
  });
});

describe('leaving and removing members', () => {
  it('lets a resident leave', async () => {
    await seedHouse('admin', ['ana']);
    const db = dbAs('ana');
    const batch = writeBatch(db);
    batch.delete(doc(db, 'houses', HOUSE_ID, 'members', 'ana'));
    batch.update(doc(db, 'users', 'ana'), { houseId: null });
    await assertSucceeds(batch.commit());
  });

  it('does not let the admin leave without deleting the house', async () => {
    await seedHouse('admin', ['ana']);
    await assertFails(deleteDoc(doc(dbAs('admin'), 'houses', HOUSE_ID, 'members', 'admin')));
  });

  it('lets the admin remove a resident, but not a resident remove someone else', async () => {
    await seedHouse('admin', ['ana', 'bia']);
    await assertFails(deleteDoc(doc(dbAs('ana'), 'houses', HOUSE_ID, 'members', 'bia')));
    await assertSucceeds(deleteDoc(doc(dbAs('admin'), 'houses', HOUSE_ID, 'members', 'bia')));
  });

  it('lets the admin delete the whole house', async () => {
    await seedHouse('admin', ['ana']);
    await seed((db) => setDoc(doc(db, 'houses', HOUSE_ID, 'groups', 'g1'), { id: 'g1', name: 'Quarto 1' }));
    const db = dbAs('admin');

    await assertSucceeds(deleteDoc(doc(db, 'houses', HOUSE_ID, 'groups', 'g1')));
    await assertSucceeds(deleteDoc(doc(db, 'houses', HOUSE_ID, 'members', 'ana')));

    const batch = writeBatch(db);
    batch.delete(doc(db, 'invites', CODE));
    batch.delete(doc(db, 'houses', HOUSE_ID, 'members', 'admin'));
    batch.delete(doc(db, 'houses', HOUSE_ID));
    batch.update(doc(db, 'users', 'admin'), { houseId: null });
    await assertSucceeds(batch.commit());

    await env.withSecurityRulesDisabled(async (context) => {
      const house = await getDoc(doc(context.firestore(), 'houses', HOUSE_ID));
      expect(house.exists()).toBe(false);
    });
  });

  it('does not let a resident delete the house', async () => {
    await seedHouse('admin', ['ana']);
    await assertFails(deleteDoc(doc(dbAs('ana'), 'houses', HOUSE_ID)));
  });
});

describe('groups', () => {
  it('lets only the admin create groups and assign members', async () => {
    await seedHouse('admin', ['ana']);
    const group = { id: 'g1', name: 'Quarto 1', createdAt: serverTimestamp() };

    await assertFails(setDoc(doc(dbAs('ana'), 'houses', HOUSE_ID, 'groups', 'g1'), group));
    await assertSucceeds(setDoc(doc(dbAs('admin'), 'houses', HOUSE_ID, 'groups', 'g1'), group));

    const anaMember = (uid: string) => doc(dbAs(uid), 'houses', HOUSE_ID, 'members', 'ana');
    await assertFails(updateDoc(anaMember('ana'), { groupIds: arrayUnion('g1') }));
    await assertSucceeds(updateDoc(anaMember('admin'), { groupIds: arrayUnion('g1') }));
  });

  it('lets the admin delete a group and remove it from members', async () => {
    await seedHouse('admin', ['ana']);
    await seed(async (db) => {
      await setDoc(doc(db, 'houses', HOUSE_ID, 'groups', 'g1'), { id: 'g1', name: 'Quarto 1' });
      await updateDoc(doc(db, 'houses', HOUSE_ID, 'members', 'ana'), { groupIds: ['g1'] });
    });
    const db = dbAs('admin');
    const batch = writeBatch(db);
    batch.update(doc(db, 'houses', HOUSE_ID, 'members', 'ana'), { groupIds: arrayRemove('g1') });
    batch.delete(doc(db, 'houses', HOUSE_ID, 'groups', 'g1'));
    await assertSucceeds(batch.commit());
  });

  it('lets residents read groups', async () => {
    await seedHouse('admin', ['ana']);
    await assertSucceeds(getDocs(collection(dbAs('ana'), 'houses', HOUSE_ID, 'groups')));
  });
});
