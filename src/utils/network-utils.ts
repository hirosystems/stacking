import { NETWORK } from '../constants';

export function isTestnet() {
  return NETWORK === 'testnet';
}

export function isMainnet() {
  return NETWORK === 'mainnet';
}

export function whenNetwork<T>({ mainnet, testnet }: { mainnet: T; testnet: T }): T {
  if (isMainnet()) return mainnet;
  if (isTestnet()) return testnet;
  throw new Error('`NETWORK` is set to neither `mainnet` or `testnet`');
}
