import { NETWORK } from '@constants/index';
import { sha256 } from '@noble/hashes/sha256';
import { base58check } from '@scure/base';
import { AddressHashMode } from '@stacks/transactions';

import { bufferToNumber } from './buffer-to-number';

const poxKeyToVersionBytesMap: Record<'mainnet' | 'testnet', any> = {
  mainnet: {
    [AddressHashMode.SerializeP2PKH]: 0x00,
    [AddressHashMode.SerializeP2SH]: 0x05,
  },
  testnet: {
    [AddressHashMode.SerializeP2PKH]: 0x6f,
    [AddressHashMode.SerializeP2SH]: 0xc4,
  },
};

interface ConvertToPoxAddressBtc {
  version: Buffer;
  hashbytes: Buffer;
}
export function convertPoxAddressToBtc(network: 'mainnet' | 'testnet') {
  return ({ version, hashbytes }: ConvertToPoxAddressBtc) => {
    const ver = bufferToNumber(version) as AddressHashMode;
    if (ver === AddressHashMode.SerializeP2WPKH || ver === AddressHashMode.SerializeP2WSH)
      return null;
    return base58check(sha256).encode(
      Buffer.concat([Buffer.from([poxKeyToVersionBytesMap[network][ver]]), hashbytes])
    );
  };
}

export const formatPoxAddressToNetwork = convertPoxAddressToBtc(NETWORK);

export function formatCycles(cycles: number) {
  return `${cycles} cycle${cycles !== 1 ? 's' : ''}`;
}
