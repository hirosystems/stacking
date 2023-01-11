# Delegated stacking info

After a user starts delegating, they are redirected to the Delegated Stacking Info page, aka Pooling Info page.

This page displays,

- the amount delegated
- the stacking status
- the stacking progress
- the delegator address
- a button to revoke the delegation.
- a link to view the stacking progress on `stacking.club`.

## The amount delegated

The amout the user delegated to the delegator. This value is fetched from the stacks node directly using `@stacks/blockchain-api-client` package.

TODO: confirm above. Is this how the desktop wallet does it?

## The stacking status

The status is presented to the user as being in one of two states,

- "Waiting on pool": when the user has successfully delegated, but the delegator has not yet stacked their funds.
- "Active": the delegator has stacked the user's funds

TODO: confirm this

## Progress

Expressed as a percentage, represents the fraction of the locking period that has elapsed. The progress is always associated with the currently active locking period, regardless of whether the user's delegation period is finite or indefinite.

If the delegator has not stacked the delegated funds, the progress shown is "0%".

## Delegator address

The [`delegate-to`](https://github.com/stacks-network/stacks-blockchain/blob/57038c2df186d3c052f52466e506ed7941b49634/src/chainstate/stacks/boot/pox-2.clar#L642) value of the call to `delegate-stx`. Displayed to the user as "Pool address".

## Button to revoke the delegation

When clicked, opens the user's wallet to submit a transaction that revokes the delegation.

## Link to `stacking.club`

A link to view the stacking progress on `stacking.club`, shows once the stacking has started.
