import React, { FC, useState } from 'react';
import { useSelector } from 'react-redux';

import { STACKING_CONTRACT_CALL_TX_BYTES } from '@constants/index';
import routes from '@constants/routes';
import { useBackButton } from '@hooks/use-back-url';
import { useBalance } from '@hooks/use-balance';
import { useCalculateFee } from '@hooks/use-calculate-fee';
import { StackingModal } from '@modals/stacking/stacking-modal';
import { RootState } from '@store/index';
import { selectWalletType } from '@store/keys';
import {
  selectEstimatedStackingDuration,
  selectNextCycleInfo,
  selectPoxInfo,
} from '@store/stacking';
import { selectActiveNodeApi } from '@store/stacks-node';
import { validateDecimalPrecision } from '@utils/form/validate-decimals';
import { stxToMicroStx, toHumanReadableStx } from '@utils/unit-convert';
import { btcAddressSchema } from '@utils/validators/btc-address-validator';
import { stxAmountSchema } from '@utils/validators/stx-amount-validator';
import { BigNumber } from 'bignumber.js';
import { Form, Formik } from 'formik';
import * as yup from 'yup';

import { StackingFormContainer } from '../components/stacking-form-container';
import { StackingFormInfoPanel } from '../components/stacking-form-info-panel';
import { StackingGuideCard } from '../components/stacking-guide-card';
import { StackingLayout } from '../components/stacking-layout';
import { ChooseBtcAddressField } from './components/choose-btc-address';
import { ChooseCycleField } from './components/choose-cycles';
import { ChooseDirectStackingAmountField } from './components/choose-direct-stacking-amount';
import { ConfirmAndStackStep } from './components/confirm-and-stack';
import { DirectStackingInfoCard } from './components/direct-stacking-info-card';
import { DirectStackingIntro } from './components/direct-stacking-intro';

enum StackingStep {
  ChooseAmount = 'Choose an amount',
  ChooseCycles = 'Choose your duration',
  ChooseBtcAddress = 'Add your Bitcoin address',
}

const cyclesWithDefault = (numCycles: null | undefined | number) => numCycles ?? 1;

interface DirectStackingForm {
  amount: string;
  btcAddress: string;
  cycles: number;
}

const initialDirectStackingFormValues: DirectStackingForm = {
  amount: '',
  btcAddress: '',
  cycles: 1,
};

export const DirectStacking: FC = () => {
  useBackButton(routes.CHOOSE_STACKING_METHOD);
  const { availableBalance, availableBalanceValidator } = useBalance();
  const [modalOpen, setModalOpen] = useState(false);
  const [formValues, setFormValues] = useState<null | DirectStackingForm>(null);

  const { stackingCycleDuration, nextCycleInfo, poxInfo } = useSelector((state: RootState) => ({
    walletType: selectWalletType(state),
    activeNode: selectActiveNodeApi(state),
    stackingCycleDuration: selectEstimatedStackingDuration(cyclesWithDefault(formValues?.cycles))(
      state
    ),
    nextCycleInfo: selectNextCycleInfo(state),
    poxInfo: selectPoxInfo(state),
  }));

  const calcFee = useCalculateFee();
  const directStackingTxFee = calcFee(STACKING_CONTRACT_CALL_TX_BYTES);

  if (nextCycleInfo === null || poxInfo === null) return null;

  const validationSchema = yup.object().shape({
    amount: stxAmountSchema()
      .test(availableBalanceValidator())
      .test('test-precision', 'You cannot stack with a precision of less than 1 STX', value => {
        // If `undefined`, throws `required` error
        if (value === undefined) return true;
        return validateDecimalPrecision(0)(value);
      })
      .test({
        name: 'test-fee-margin',
        message: 'You must stack less than your entire balance to allow for the transaction fee',
        test: value => {
          if (value === null || value === undefined) return false;
          const uStxInput = stxToMicroStx(value);
          return !uStxInput.isGreaterThan(availableBalance.minus(directStackingTxFee));
        },
      })
      .test({
        name: 'test-min-utx',
        message: `You must stack with at least ${toHumanReadableStx(
          poxInfo.paddedMinimumStackingAmountMicroStx
        )} `,
        test: value => {
          if (value === null || value === undefined) return false;
          const uStxInput = stxToMicroStx(value);
          return new BigNumber(poxInfo.paddedMinimumStackingAmountMicroStx).isLessThanOrEqualTo(
            uStxInput
          );
        },
      }),
    cycles: yup.number().defined(),
    btcAddress: btcAddressSchema(),
  });

  const openStackingTxSigningModal = (formValues: DirectStackingForm) => {
    setFormValues({ ...formValues, amount: stxToMicroStx(formValues.amount).toString() });
    setModalOpen(true);
  };

  const stackingIntro = (
    <DirectStackingIntro
      timeUntilNextCycle={nextCycleInfo.formattedTimeToNextCycle}
      estimatedStackingMinimum={String(poxInfo.min_amount_ustx)}
    />
  );

  return (
    <>
      {modalOpen && formValues && (
        <StackingModal
          onClose={() => setModalOpen(false)}
          amountToStack={new BigNumber(formValues.amount)}
          numCycles={cyclesWithDefault(formValues.cycles)}
          poxAddress={formValues.btcAddress}
          fee={directStackingTxFee}
        />
      )}
      <Formik
        initialValues={initialDirectStackingFormValues}
        onSubmit={values => openStackingTxSigningModal(values)}
        validationSchema={validationSchema}
      >
        {({ values }) => {
          return (
            <StackingLayout
              intro={stackingIntro}
              stackingInfoPanel={
                <StackingFormInfoPanel>
                  <DirectStackingInfoCard
                    cycles={cyclesWithDefault(values.cycles)}
                    amount={values.amount}
                    btcAddress={values.btcAddress}
                    startDate={nextCycleInfo.nextCycleStartingAt}
                    blocksPerCycle={poxInfo.reward_cycle_length}
                    duration={stackingCycleDuration}
                    fee={directStackingTxFee}
                  />
                  <StackingGuideCard mt="loose" />
                </StackingFormInfoPanel>
              }
              stackingForm={
                <Form>
                  <StackingFormContainer>
                    <ChooseDirectStackingAmountField
                      title={StackingStep.ChooseAmount}
                      minimumAmountToStack={poxInfo.paddedMinimumStackingAmountMicroStx}
                    />
                    <ChooseCycleField cycles={cyclesWithDefault(values.cycles)} />
                    <ChooseBtcAddressField />
                    <ConfirmAndStackStep
                      estimatedDuration={stackingCycleDuration}
                      timeUntilNextCycle={nextCycleInfo.formattedTimeToNextCycle}
                      onConfirmAndLock={() => setModalOpen(true)}
                    />
                  </StackingFormContainer>
                </Form>
              }
            />
          );
        }}
      </Formik>
    </>
  );
};
