/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * The current version of the app. Can be displayed in the UI or used in logs.
   */
  readonly VITE_APP_VERSION?: string;

  /**
   * The commit SHA used to build the app. Useful for debugging.
   */
  readonly VITE_COMMIT_SHA?: string;

  /**
   * TODO: document where to find the key
   */
  readonly VITE_SEGMENT_WRITE_KEY?: string;

  /**
   * TODO: document where to find the key
   */
  readonly VITE_SENTRY_DSN?: string;

  /**
   * The STX network the app should interact with. Should be one of two values:
   * `"mainnet"` or `"testnet"`. When performing a network-related opeartion,
   * the app should query this value and target the specified network.
   */
  readonly VITE_STX_NETWORK?: string;

  readonly VITE_DEFAULT_TESTNET_STACKS_NODE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
