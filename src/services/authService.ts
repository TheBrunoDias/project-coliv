import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { ensureUserProfile, updateUserDisplayName } from './userService';

export async function signInWithEmail(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function registerWithEmail(
  displayName: string,
  email: string,
  password: string,
): Promise<void> {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName });

  // The auth listener may have already created the profile before the name was set,
  // so make sure it exists and then store the chosen name.
  await ensureUserProfile(user);
  await updateUserDisplayName(user.uid, displayName);
}

function googleProvider(): GoogleAuthProvider {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return provider;
}

export async function signInWithGoogle(): Promise<void> {
  await signInWithPopup(auth, googleProvider());
}

export type SignInMethod = 'google' | 'password';

export function getSignInMethod(user: FirebaseUser): SignInMethod {
  return user.providerData.some((provider) => provider.providerId === 'google.com')
    ? 'google'
    : 'password';
}

/** Sensitive operations (like deleting the account) require a recent sign-in. */
export async function reauthenticate(user: FirebaseUser, password?: string): Promise<void> {
  if (getSignInMethod(user) === 'google') {
    await reauthenticateWithPopup(user, googleProvider());
    return;
  }
  if (!user.email || !password) throw new Error('Password required to reauthenticate');
  await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));
}

export function deleteAuthUser(user: FirebaseUser): Promise<void> {
  return deleteUser(user);
}

export function sendPasswordReset(email: string): Promise<void> {
  return sendPasswordResetEmail(auth, email);
}

export function signOutUser(): Promise<void> {
  return signOut(auth);
}
