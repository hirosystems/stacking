import { useStackingClient } from '@components/stacking-client-provider/stacking-client-provider';
import { StackingClient } from '@stacks/stacking';
import { useQuery } from '@tanstack/react-query';
import { SmartContractsApi, Configuration } from '@stacks/blockchain-api-client';
import {
  ClarityType,
  ClarityVersion,
  cvToHex,
  cvToString,
  hexToCV,
  standardPrincipalCV,
  tupleCV,
} from '@stacks/transactions';

const smartContractsApi = new SmartContractsApi(
  new Configuration({
    basePath: 'https://stacks-node-api.testnet.stacks.co',
  })
);

interface Props {
  client: StackingClient;
}
function StackingInfoInner({ client }: Props) {
  const q = useQuery(['stacking-info'], () => client.getPoxInfo());
  const q2 = useQuery(['q2'], () => client.getStatus());
  const q3 = useQuery(['delegation-state'], async () => {
    const key = cvToHex(tupleCV({ stacker: standardPrincipalCV(client.address) }));
    const [contractAddress, contractName] = (await client.getStackingContract()).split('.');
    const coreInfo = await client.getCoreInfo();

    const args = {
      contractAddress,
      contractName,
      key,
      mapName: 'delegation-state',
    };

    console.log('ARY `args`', args);
    // https://docs.hiro.so/api#tag/Smart-Contracts/operation/get_contract_data_map_entry
    const res = await smartContractsApi.getContractDataMapEntry(args);
    const dataCV = hexToCV(res.data);
    console.log('ARY `dataCV`', dataCV);

    if (dataCV.type === ClarityType.OptionalNone) {
      return null;
    }

    // Ensure data is a `some` containig a `tuple`
    if (dataCV.type !== ClarityType.OptionalSome || dataCV.value.type !== ClarityType.Tuple) {
      throw new Error('Unexpected clarity type received.');
    }

    const tupleCVData = dataCV.value.data;

    let untilBurnHeight = null;
    if (
      tupleCVData['until-burn-ht'] &&
      tupleCVData['until-burn-ht'].type === ClarityType.OptionalSome &&
      tupleCVData['until-burn-ht'].value.type === ClarityType.UInt
    ) {
      untilBurnHeight = tupleCVData['until-burn-ht'].value.value;
    }
    const isDelegationExpired =
      untilBurnHeight !== null && coreInfo.burn_block_height > untilBurnHeight;
    if (isDelegationExpired) {
      return null;
    }

    if (!tupleCVData['amount-ustx'] || tupleCVData['amount-ustx'].type !== ClarityType.UInt) {
      throw new Error('Expected `amount-ustx` to be defined.');
    }
    const amountMicroStx = tupleCVData['amount-ustx'].value;

    if (
      !tupleCVData['delegated-to'] ||
      tupleCVData['delegated-to'].type !== ClarityType.PrincipalStandard
    ) {
      throw new Error('Expected `amount-ustx` to be defined.');
    }
    const delegatedTo = cvToString(tupleCVData['delegated-to']);

    return {
      amountMicroStx,
      delegatedTo,
      untilBurnHeight,
    };
  });
  return (
    <div>
      <h1>Stacking Info</h1>
      <h2>`getPoxInfo`</h2>
      {q.data && (
        <pre>
          <code>{JSON.stringify(q.data, null, 2)}</code>
        </pre>
      )}
      <h2>`getStatus`</h2>
      {q2.data && (
        <pre>
          <code>{JSON.stringify(q2.data, null, 2)}</code>
        </pre>
      )}
      <h2>Delegation Info</h2>
      {q3.data && (
        <div>
          <div>Amount: {q3.data.amountMicroStx.toString()}</div>
          <div>Delegated to: {q3.data.delegatedTo}</div>
          <div>untilBurnHeight: {q3.data.untilBurnHeight?.toString()}</div>
        </div>
      )}
    </div>
  );
}

export function StackingInfo() {
  const { client } = useStackingClient();
  if (!client) {
    console.error('Expected `client` to be defined.');
    return null;
  }

  return <StackingInfoInner client={client} />;
}
