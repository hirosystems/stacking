import React, { FC } from 'react';
import ReactDOM from 'react-dom';
import { matchPath, useHistory, useLocation } from 'react-router';

import { ColorModeButton } from '@components/color-mode-button';
import routes from '@constants/routes';
import { useCheckForUpdates } from '@hooks/use-check-for-updates';
import { useWindowFocus } from '@hooks/use-window-focus';
import { Flex, Stack, color } from '@stacks/ui';
import { openExternalLink } from '@utils/external-links';

import { BackButton } from '../back-button';
import { NetworkMessage } from './network-message';
import { SettingsButton } from './settings-button';
import { UpdateAvailableButton } from './update-available-button';

export const TitleBar: FC = () => {
  const el = document.querySelector('.draggable-bar');
  const location = useLocation();

  const routerHistory = useHistory();

  const winState = useWindowFocus();

  const { isNewerReleaseAvailable, latestRelease } = useCheckForUpdates();

  const isBlurred = winState === 'blurred';
  const isOnboarding = matchPath(location.pathname, { path: '/onboard' }) !== null;

  if (!el) return null;

  const content = (
    <Flex
      justifyContent="space-between"
      pl={process.platform === 'darwin' ? '72px' : 'tight'}
      height="100%"
      backgroundColor={color('bg')}
      position="relative"
      alignItems="center"
      opacity={isBlurred ? 0.5 : 1}
    >
      <BackButton />
      <Flex
        justifyContent="space-around"
        flex={1}
        // Manages absolute centre alignment of content
        position={['relative', 'absolute']}
        left={[null, '130px']}
        right={[null, '130px']}
        height="100%"
      >
        <Flex>
          {isNewerReleaseAvailable && latestRelease && (
            <UpdateAvailableButton
              windowState={winState}
              onClick={() => openExternalLink('https://www.hiro.so/wallet/install-desktop')}
            />
          )}
          <Flex alignItems="center" ml="base">
            <NetworkMessage textColor={isBlurred ? color('text-title') : undefined} />
          </Flex>
        </Flex>
      </Flex>
      <Stack alignItems="center" pr="base-loose" isInline spacing="tight">
        <ColorModeButton color={color('text-title')} />
        {!isOnboarding && (
          <SettingsButton
            onClick={() => routerHistory.push(routes.SETTINGS)}
            color={color('text-title')}
          />
        )}
      </Stack>
    </Flex>
  );
  return ReactDOM.createPortal(content, el);
};
