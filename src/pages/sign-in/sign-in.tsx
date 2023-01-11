import { Navigate } from 'react-router-dom';

import { useAuth } from '@components/auth-provider/auth-provider';
import { Button, Text, color } from '@stacks/ui';

import { SignInLayout } from './sign-in.layout';

export function SignIn() {
  const { isSignedIn, signIn, isSigningIn } = useAuth();
  if (isSignedIn) {
    return <Navigate to="../choose-stacking-method" />;
  }

  return (
    <SignInLayout>
      <Text as="h1" color={color('text-title')} fontSize="28px" mb="extra-loose">
        Get stacking
      </Text>
      <Button alignSelf="center" onClick={signIn} isDisabled={isSigningIn}>
        Connect your wallet
      </Button>
    </SignInLayout>
  );
}
