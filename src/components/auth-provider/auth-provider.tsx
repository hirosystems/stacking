import { validateStacksAddress as isValidStacksAddress } from '@stacks/transactions';
import { ReactNode, createContext, useContext, useState } from 'react';

import { UserData } from '@stacks/auth';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { NETWORK } from '@constants/index';

const appConfig = new AppConfig(['store_write']);
const userSession = new UserSession({ appConfig });

function getAccountAddress(userData: any) {
  // NOTE: Although obtaining the user's address in this way works, this
  // approach is quite brittle. It relies on an environment variable having the
  // same value as the object key below. Furthermore, type checks are innefective
  // given `profile` is typed as `any`.
  //
  // Should this be a source of issues, it may be worth refactoring.
  const address: string = userData?.profile?.stxAddress?.[NETWORK];

  if (!isValidStacksAddress(address)) {
    return null;
  }

  return address;
}

interface AuthContext {
  isSigningIn: boolean;
  isSignedIn: boolean;
  signIn(): void;
  signOut(): void;
  userData: null | UserData;
  address: null | string;
}
const AuthContext = createContext<AuthContext>({
  isSigningIn: false,
  isSignedIn: false,
  signIn() {},
  signOut() {},
  userData: null,
  address: null,
});

interface Props {
  children: ReactNode;
}
export function AuthProvider({ children }: Props) {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [hasSearchedForExistingSession, setHasSearchedForExistingSession] = useState(false);

  function signIn() {
    if (isSigningIn) {
      console.warn('Attempted to sign in while sign is is in progress.');
      return;
    }
    setIsSigningIn(true);
    showConnect({
      userSession,
      appDetails: {
        name: 'Stacking on the web',
        icon: 'http://placekitten.com/200/200',
      },
      onFinish() {
        setIsSigningIn(false);
        setIsSignedIn(true);
      },
      onCancel() {
        setIsSigningIn(false);
      },
    });
  }

  function signOut() {
    userSession.signUserOut();
    setIsSignedIn(false);
  }

  if (!hasSearchedForExistingSession) {
    if (userSession.isUserSignedIn()) {
      setIsSignedIn(true);
    }

    setHasSearchedForExistingSession(true);
    return null;
  }

  let userData = null;
  try {
    userData = userSession.loadUserData();
  } catch {
    // do nothing
  }

  const address = getAccountAddress(userData);

  return (
    <>
      <AuthContext.Provider value={{ isSigningIn, isSignedIn, signIn, signOut, userData, address }}>
        {children}
      </AuthContext.Provider>
    </>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
