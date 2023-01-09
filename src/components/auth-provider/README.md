# AuthProvider

This component provides some functionality currently lacking in [`@stacks/connect-react`](https://github.com/hirosystems/connect/tree/main/packages/connect-react). Most notably, `@stacks/connect-react` does not provide a way to log out users, and will not re-render when the user's auth state changes.

The `AuthProvider` component provides `signIn()` and `signOut()` methods, as well as authentication state information and user data. For all values available in the provider's context, see [auth-provider.ts](./auth-provider.tsx).
