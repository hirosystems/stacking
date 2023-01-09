import { ErrorLabel } from '@components/error-label';
import { ErrorText } from '@components/error-text';
import { Box, Button, Input, color, Text } from '@stacks/ui';
import { microStxToStx, toHumanReadableStx } from '@utils/unit-convert';
import { useField } from 'formik';

import { Description, Step } from '../../components/stacking-form-step';

interface Props {
  availableBalance: bigint;
}
export function ChoosePoolingAmountField({ availableBalance }: Props) {
  const [field, meta, helpers] = useField('amountStx');

  return (
    <Step title="Amount">
      <Description>
        <Text>Choose how much you'll pool. Your pool may require a minimum.</Text>
      </Description>
      <Box position="relative" maxWidth="400px">
        <Input id="amountStx" mt="loose" placeholder="Amount of STX to Stack" {...field} />
        {meta.touched && meta.error && (
          <ErrorLabel>
            <ErrorText>{meta.error}</ErrorText>
          </ErrorLabel>
        )}
      </Box>
      <Box textStyle="body.small" color={color('text-caption')} mt="base-tight">
        Available balance:{' '}
        <Button
          variant="link"
          type="button"
          onClick={() => helpers.setValue(microStxToStx(availableBalance).toString())}
        >
          {toHumanReadableStx(availableBalance)}
        </Button>
      </Box>
    </Step>
  );
}
