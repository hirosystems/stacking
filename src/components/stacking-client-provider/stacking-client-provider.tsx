import { ReactNode, createContext, useContext } from 'react';

import { useAuth } from '@components/auth-provider/auth-provider';
import { NETWORK } from '@constants/index';
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { StackingClient } from '@stacks/stacking';
import { validateStacksAddress as isValidStacksAddress } from '@stacks/transactions';

let network: StacksTestnet | StacksMainnet;
if (NETWORK === 'mainnet') {
  network = new StacksMainnet();
} else if (NETWORK === 'testnet') {
  network = new StacksTestnet();
}

interface StackingClientContext {
  client: null | StackingClient;
}
const StackingClientContext = createContext<StackingClientContext>({ client: null });

interface Props {
  children: ReactNode;
}
export function StackingClientProvider({ children }: Props) {
  const { address } = useAuth();
  let client: StackingClient | null = null;

  if (address !== null && isValidStacksAddress(address)) {
    client = new StackingClient(address, network);
  }

  return (
    <>
      <StackingClientContext.Provider value={{ client }}>{children}</StackingClientContext.Provider>
    </>
  );
}

export function useStackingClient() {
  return useContext(StackingClientContext);
}
