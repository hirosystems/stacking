import { useMemo } from 'react';
import { Flex, Text, Box, color } from '@stacks/ui';

import { MAX_STACKING_CYCLES, MIN_STACKING_CYCLES } from '@constants/index';
import { CircleButton } from '@components/circle-button';
import { decrement, increment } from '@utils/mutate-numbers';
import { useField } from 'formik';
import { formatCycles } from '@utils/stacking';
import { useStackingClient } from '@components/stacking-client-provider/stacking-client-provider';
import { useQuery } from '@tanstack/react-query';
import { StackingClient } from '@stacks/stacking';
import { addSeconds, formatDistanceToNow } from 'date-fns';

const createCycleArray = () => new Array(12).fill(null).map((_, i) => i + 1);
const durationWithDefault = (duration: number | null) => duration ?? 1;

interface DurationCyclesFieldInnerProps {
  client: StackingClient;
}
export function DurationCyclesFieldInner({ client }: DurationCyclesFieldInnerProps) {
  const q = useQuery(['q'], () => client.getCycleDuration());
  const [cyclesField, _meta, durationLengthHelpers] = useField('cycles');
  const duration = cyclesField.value;

  const cycleLabels = useMemo(() => {
    if (typeof q.data !== 'number') return [];
    return createCycleArray().map(
      c =>
        `${formatCycles(c)} ends in about ${formatDistanceToNow(
          addSeconds(new Date(), c * q.data)
        )}`
    );
  }, [q.data]);

  if (q.isLoading) return null;
  if (typeof q.data !== 'number') return null;
  if (typeof duration !== 'number') return null;

  return (
    <Flex
      alignItems="center"
      justifyContent="space-between"
      mt="base"
      padding="8px"
      boxShadow="low"
      border={`1px solid ${color('border')}`}
      borderRadius="8px"
      onClick={e => (e.stopPropagation(), e.preventDefault())}
      position="relative"
      zIndex={10}
    >
      <Text alignItems="center" ml="tight" color={color('text-title')}>
        {cycleLabels[duration - 1]}
      </Text>
      <Box>
        <CircleButton
          onClick={e => {
            e.stopPropagation();
            durationLengthHelpers.setValue(
              Math.max(MIN_STACKING_CYCLES, decrement(durationWithDefault(duration)))
            );
          }}
        >
          -
        </CircleButton>
        <CircleButton
          ml={[null, 'extra-tight']}
          onClick={e => {
            e.stopPropagation();
            durationLengthHelpers.setValue(
              Math.min(MAX_STACKING_CYCLES, increment(durationWithDefault(duration)))
            );
          }}
        >
          +
        </CircleButton>
      </Box>
    </Flex>
  );
}

export function DurationCyclesField() {
  const { client } = useStackingClient();
  if (!client) {
    console.error('Expected `client` to be defined.');
    return null;
  }

  return <DurationCyclesFieldInner client={client} />;
}
