import { useEffect } from 'react';
import { Navigate, Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';

import { StackingClientProvider } from '@components/stacking-client-provider/stacking-client-provider';
import { Button, CSSReset, Flex, ThemeProvider, color } from '@stacks/ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { loadFonts } from '@utils/load-fonts';

import { AuthProvider, useAuth } from './components/auth-provider/auth-provider';
import { ChooseStackingMethod } from './pages/choose-stacking-method/choose-stacking-method';
import { SignIn } from './pages/sign-in/sign-in';
import { PooledStacking } from './pages/stacking/delegated-stacking/pooled-stacking';
import { StackingInfo } from './pages/stacking/stacking-info/stacking-info';

function Container() {
  const { isSignedIn, signOut } = useAuth();
  return (
    <>
      <Flex flexDirection="column" flexGrow={1} background={color('bg')}>
        {isSignedIn && (
          <Flex justifyContent="flex-end">
            <Button onClick={() => signOut()}>Sign out</Button>
          </Flex>
        )}
        <Flex flexGrow={1} position="relative">
          <Outlet />
        </Flex>
      </Flex>
    </>
  );
}
const queryClient = new QueryClient();
function Root() {
  useEffect(() => void loadFonts(), []);
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {CSSReset}
        <AuthProvider>
          <StackingClientProvider>
            <Outlet />
          </StackingClientProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function AuthGuard() {
  const { isSignedIn } = useAuth();
  if (!isSignedIn) {
    return <Navigate to="../sign-in" />;
  }

  return (
    <>
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      { index: true, element: <Navigate to="sign-in" /> },
      {
        path: 'sign-in',
        element: <SignIn />,
      },
      {
        element: <AuthGuard />,
        children: [
          {
            element: <Container />,
            children: [
              {
                path: 'choose-stacking-method',
                element: <ChooseStackingMethod />,
              },
              {
                path: 'pooled-stacking',
                element: <PooledStacking />,
              },
              {
                path: 'stacking-info',
                element: <StackingInfo />,
              },
            ],
          },
        ],
      },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
