import React, { FC, memo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { AbstractBtcChartSvg } from '@components/svg/abstract-btc-chart';
import routes from '@constants/routes';
import { useFetchDelegationStatus } from '@hooks/use-fetch-delegation-status';
import { useMempool } from '@hooks/use-mempool';
import { Box, Button, Flex, Text, color } from '@stacks/ui';
import { selectPoxInfo } from '@store/stacking';
import { isDelegateStxTx } from '@utils/tx-utils';

export const StackingPromoCard: FC = memo(() => {
  const history = useHistory();
  const { outboundMempoolTxs } = useMempool();
  const poxInfo = useSelector(selectPoxInfo);
  const hasPendingDelegateStxCall = outboundMempoolTxs.some(tx =>
    isDelegateStxTx(tx, poxInfo?.contract_id)
  );

  const delegationStatus = useFetchDelegationStatus();

  useEffect(() => {
    void delegationStatus.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPendingDelegateStxCall]);

  return (
    <Box
      mt="extra-loose"
      borderRadius="8px"
      boxShadow="0px 1px 2px rgba(0, 0, 0, 0.04);"
      border={`1px solid ${color('border')}`}
    >
      <Flex flexDirection="column" mx="loose" pb="90px" position="relative">
        <Box position="absolute" right="0px" bottom="0px">
          <AbstractBtcChartSvg />
        </Box>
        <Text textStyle="body.large.medium" color={color('text-caption')} mt="loose">
          Stacking
        </Text>
        <Text textStyle="display.large" mt="tight">
          Have a chance to earn BTC by locking your STX temporarily
        </Text>
        <Button
          mt="base"
          alignSelf="flex-start"
          mode="tertiary"
          isDisabled={hasPendingDelegateStxCall}
          onClick={() => history.push(routes.CHOOSE_STACKING_METHOD)}
        >
          {hasPendingDelegateStxCall ? 'Delegation pending' : 'Get started →'}
        </Button>
      </Flex>
    </Box>
  );
});
