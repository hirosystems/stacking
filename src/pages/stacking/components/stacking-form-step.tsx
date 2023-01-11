import React, { FC, ReactElement, ReactNode } from 'react';

import { Title } from '@components/title';
import { Box, Button, ButtonProps, Flex, FlexProps, Stack } from '@stacks/ui';
import { ForwardRefExoticComponentWithAs, forwardRefWithAs } from '@stacks/ui-core';

interface StepProps extends FlexProps {
  title: string;
}

/**
 * A container for a single piece of information the user needs to provide.
 * Intended to contain a description and an input of some kind.
 *
 * ```tsx
 * function InfoUserNeedsToProvide() {
 *   return (
 *     <Step title="Some Info">
 *       <Description>
 *         <p>The user needs to provide this info</p>
 *       </Description>
 *       <input id="some-info" />
 *     </Step>
 *   );
 * }
 * ```
 */
export const Step: FC<StepProps> = props => {
  const { title, children, ...rest } = props;
  return (
    <Flex flexDirection="column" mt="extra-loose" {...rest}>
      <Title fontSize="24px" mt="extra-tight" mr="tight">
        {title}
      </Title>
      <Box>{children}</Box>
    </Flex>
  );
};

interface DescriptionProps {
  /**
   * Elements containig text descriptions. Uses `ReactElement` instead of
   * ReactNode since the internal `Stack` component used can't handle all
   * ReactNode types, such as string.
   */
  children: ReactElement | ReactElement[];
}
/**
 * A container around helpful information about the input the user is asked to
 * provide. May be of a longer form, and have several sentences or paragraphs.
 * Expects to have elements containing text as children.
 *
 * ```tsx
 * function InfoUserNeedsToProvide() {
 *   return (
 *     <Step title="Some Info">
 *       <Description>
 *         <p>The user should know about this before providing their info.</p>
 *         <p>This is also useful to the user.</p>
 *       </Description>
 *       <input id="some-info" />
 *     </Step>
 *   );
 * }
 * ```
 */
export const Description = ({ children }: DescriptionProps) => (
  <Stack display="block" textStyle="body.large" spacing="base">
    {children}
  </Stack>
);

export const Action: ForwardRefExoticComponentWithAs<ButtonProps, 'button'> = forwardRefWithAs(
  ({ children, ...props }, ref) => (
    <Button size="md" mt="loose" ref={ref} {...props}>
      {children}
    </Button>
  )
);
