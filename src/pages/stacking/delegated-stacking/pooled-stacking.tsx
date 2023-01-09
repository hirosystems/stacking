import { FC, useCallback, useState } from 'react';

import { useStackingClient } from '@components/stacking-client-provider/stacking-client-provider';
import {
  MIN_DELEGATED_STACKING_AMOUNT_USTX,
  NETWORK,
  UI_IMPOSED_MAX_STACKING_AMOUNT_USTX,
} from '@constants/index';
// import { RootState } from "@store/index";
import routes from '@constants/routes';
import {
  openContractCall,
  makeContractCallToken,
  ContractCallRegularOptions,
} from '@stacks/connect';
import { StackingClient } from '@stacks/stacking';
import { useQuery } from '@tanstack/react-query';
// import { useBackButton } from "@hooks/use-back-url";
// import { selectNextCycleInfo, selectPoxInfo } from "@store/stacking";
import { cyclesToBurnChainHeight } from '@utils/calculate-burn-height';
import { stxToMicroStx, toHumanReadableStx } from '@utils/unit-convert';
import { stxAddressSchema } from '@utils/validators/stx-address-validator';
import { stxAmountSchema } from '@utils/validators/stx-amount-validator';
// import { useSelector } from "react-redux";
import { BigNumber } from 'bignumber.js';
import { addSeconds, formatDistanceToNow } from 'date-fns';
import { Form, Formik } from 'formik';
import * as yup from 'yup';

import { StackingFormContainer } from '../components/stacking-form-container';
import { StackingFormInfoPanel } from '../components/stacking-form-info-panel';
import { StackingGuideCard } from '../components/stacking-guide-card';
import { StackingLayout } from '../components/stacking-layout';
import { ChoosePoolAddressField } from './components/choose-pool-stx-address';
import { ChoosePoolingAmountField } from './components/choose-pooling-amount';
import { ChoosePoolingDurationField } from './components/choose-pooling-duration';
import { ConfirmAndSubmit } from './components/confirm-and-pool';
import { PoolingInfoCard } from './components/delegated-stacking-info-card';
import { PooledStackingIntro } from './components/pooled-stacking-intro';
import { useAuth } from '@components/auth-provider/auth-provider';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import { AnchorMode, uintCV, standardPrincipalCV } from '@stacks/transactions';
import { useNavigate } from 'react-router-dom';

let network: StacksTestnet | StacksMainnet;
if (NETWORK === 'mainnet') {
  network = new StacksMainnet();
} else if (NETWORK === 'testnet') {
  network = new StacksTestnet();
}

interface PoolingFormIndefiniteValues<N> {
  delegationDurationType: 'indefinite';
  amountStx: N;
  poolAddress: string;
}
interface PoolingFormLimitedValues<N> {
  delegationDurationType: 'limited';
  amountStx: N;
  poolAddress: string;
  numberOfCycles: number;
}
type AbstractPoolingFormValues<N> = PoolingFormIndefiniteValues<N> | PoolingFormLimitedValues<N>;

type EditingFormValues = AbstractPoolingFormValues<string | number>;
type CompletedFormValues = AbstractPoolingFormValues<BigNumber>;

const initialPoolingFormValues: Partial<EditingFormValues> = {
  amountStx: '',
  poolAddress: '',
  delegationDurationType: undefined,
  numberOfCycles: 1,
};

export function PooledStacking() {
  const { client } = useStackingClient();
  const { address } = useAuth();

  if (!address) {
    console.error('Expected `address` to be defined.');
    return null;
  }
  if (!client) {
    console.error('Expected `client` to be defined.');
    return null;
  }

  return <PooledStackingInner client={client} ownAddress={address} />;
}

interface PooledStackingInnerProps {
  client: StackingClient;
  ownAddress: string;
}
export function PooledStackingInner({ client, ownAddress }: PooledStackingInnerProps) {
  const [isContractCallExtensionPageOpen, setIsContractCallExtensionPageOpen] = useState(false);
  const { data, isLoading } = useQuery(
    ['getSecondsUntilNextCycle'],
    () => client.getSecondsUntilNextCycle(),
    {
      refetchInterval: 60_000,
    }
  );
  const queryGetAccountBalance = useQuery(['getAccountBalance'], () => client.getAccountBalance());

  const navigate = useNavigate();

  const validationSchema = yup.object().shape({
    poolAddress: stxAddressSchema().test({
      name: 'cannot-pool-to-yourself',
      message: 'Cannot pool to your own STX address',
      test(value: any) {
        if (value === null || value === undefined) return false;
        return value !== ownAddress;
      },
    }),
    amountStx: stxAmountSchema()
      .test({
        name: 'test-min-allowed-delegated-stacking',
        message: `You must delegate at least ${toHumanReadableStx(
          MIN_DELEGATED_STACKING_AMOUNT_USTX
        )}`,
        test(value: any) {
          if (value === null || value === undefined) return false;
          const enteredAmount = stxToMicroStx(value);
          return enteredAmount.isGreaterThanOrEqualTo(MIN_DELEGATED_STACKING_AMOUNT_USTX);
        },
      })
      .test({
        name: 'test-max-allowed-delegated-stacking',
        message: `You cannot delegate more than ${toHumanReadableStx(
          UI_IMPOSED_MAX_STACKING_AMOUNT_USTX
        )}`,
        test(value: any) {
          if (value === null || value === undefined) return false;
          const enteredAmount = stxToMicroStx(value);
          return enteredAmount.isLessThanOrEqualTo(UI_IMPOSED_MAX_STACKING_AMOUNT_USTX);
        },
      }),
    delegationDurationType: yup.string().required('Please select the delegation duration type.'),
  });

  async function handleSubmit(values: EditingFormValues) {
    // TODO: handle thrown errors
    const poxInfo = await client.getPoxInfo();
    const stackingContract = await client.getStackingContract();
    const delegateStxOptions = client.getDelegateOptions({
      contract: stackingContract,
      amountMicroStx: stxToMicroStx(values.amountStx).toString(),
      delegateTo: values.poolAddress,
      untilBurnBlockHeight:
        values.delegationDurationType === 'limited'
          ? cyclesToBurnChainHeight({
              cycles: values.numberOfCycles,
              rewardCycleLength: poxInfo.reward_cycle_length,
              currentCycleId: poxInfo.current_cycle.id,
              firstBurnchainBlockHeight: poxInfo.first_burnchain_block_height,
            })
          : undefined,
    });

    // Type coercion necessary because the `network` property returned by
    // `client.getStackingContract()` has a wider type than allowed by
    // `openContractCall`. Despite the wider type, the actual value of `network`
    // is always of the type `StacksNetwork` expected by `openContractCall`.
    //
    // See
    // https://github.com/hirosystems/stacks.js/blob/0e1f9f19dfa45788236c9e481f9a476d9948d86d/packages/stacking/src/index.ts#L1054
    openContractCall({
      ...(delegateStxOptions as ContractCallRegularOptions),
      onFinish(data) {
        console.log('ARY onFinishData', data);
        setIsContractCallExtensionPageOpen(false);
        navigate('../stacking-info');
      },
      onCancel() {
        console.log('ARY open contract call cancelled');
        setIsContractCallExtensionPageOpen(false);
      },
    });
    setIsContractCallExtensionPageOpen(true);
  }

  if (isLoading || queryGetAccountBalance.isLoading) return null;
  if (typeof data !== 'number') return null;
  if (typeof queryGetAccountBalance.data !== 'bigint') return null;

  const timeUntilNextCycle = formatDistanceToNow(addSeconds(new Date(), data));

  return (
    <>
      <Formik
        initialValues={initialPoolingFormValues as EditingFormValues}
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
      >
        {({ values }) => (
          <StackingLayout
            intro={<PooledStackingIntro timeUntilNextCycle={timeUntilNextCycle} />}
            stackingInfoPanel={
              <StackingFormInfoPanel>
                <PoolingInfoCard
                  poolStxAddress={values.poolAddress}
                  amount={values.amountStx}
                  durationInCycles={
                    values.delegationDurationType === 'limited' ? values.numberOfCycles : null
                  }
                  delegationType={values.delegationDurationType}
                  // burnHeight={
                  //   values.delegationType === "limited"
                  //     ? cyclesToUntilBurnBlockHeight(values.cycles)
                  //     : undefined
                  // }
                />
                {/* <StackingGuideCard mt="loose" /> */}
              </StackingFormInfoPanel>
            }
            stackingForm={
              <Form>
                <StackingFormContainer>
                  <ChoosePoolAddressField />
                  <ChoosePoolingAmountField availableBalance={queryGetAccountBalance.data} />
                  <ChoosePoolingDurationField />
                  <ConfirmAndSubmit isDisabled={isContractCallExtensionPageOpen} />
                </StackingFormContainer>
              </Form>
            }
          />
        )}
      </Formik>
    </>
  );
}
