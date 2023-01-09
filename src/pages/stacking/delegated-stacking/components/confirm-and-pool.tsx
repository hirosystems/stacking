import { useState } from 'react';

import { Step, Action } from '../../components/stacking-form-step';
import { StackingUserConfirm } from '../../components/stacking-user-confirm';
import { DelegatedStackingTerms } from './delegated-stacking-terms';

interface Props {
  isDisabled: boolean;
}
export function ConfirmAndSubmit({ isDisabled }: Props) {
  const [hasUserConfirmed, setHasUserConfirmed] = useState(false);

  return (
    <Step title="Confirm and pool" mb="300px">
      <DelegatedStackingTerms mt="loose" />
      <StackingUserConfirm
        onChange={useConfirmed => setHasUserConfirmed(useConfirmed)}
        mt="extra-loose"
      />
      <Action type="submit" isDisabled={isDisabled || !hasUserConfirmed}>
        Confirm and start pooling
      </Action>
    </Step>
  );
}
