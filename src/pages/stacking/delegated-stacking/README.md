# Form fields

`poolAddress`: the address of the pool where stx will be sent.

`amountStx`: amount in STX that will be sent to the pool.

`delegationDurationType`: indefinite or limited

`numberOfCycles`: for limited-time delegation, the number of cycles to delegate for.

Note that these values used by the form are different to those required to call the PoX's [`delegate-stx`](https://github.com/stacks-network/stacks-blockchain/blob/57038c2df186d3c052f52466e506ed7941b49634/src/chainstate/stacks/boot/pox.clar#L499) function. The values used by the form are considered to be more user-friendly, and are converted to the values required by `delegate-stx` in the submit function.

# A note on delegation duration time

When a [`tx-sender`](https://docs.stacks.co/docs/write-smart-contracts/clarity-language/language-keywords#tx-sender) delegates their funds, they can specify an [optional burn chain block height, `until-burn-ht`](https://github.com/stacks-network/stacks-blockchain/blob/57038c2df186d3c052f52466e506ed7941b49634/src/chainstate/stacks/boot/pox-2.clar#L643) until which the delegation is valid. If not provided, the delegation remains valid until the `tx-sender` revokes the delegation permission by calling [`revoke-delegate-stx`](https://github.com/stacks-network/stacks-blockchain/blob/57038c2df186d3c052f52466e506ed7941b49634/src/chainstate/stacks/boot/pox-2.clar#L627).

Although the delegation validity period is defined by the provided `until-burn-ht`, stacking occurs in cycles, each lasting a preset amount of blocks. Despite their relationship, the [PoX 2 contract](https://github.com/stacks-network/stacks-blockchain/blob/57038c2df186d3c052f52466e506ed7941b49634/src/chainstate/stacks/boot/pox-2.clar) doesn't provide a way to grant the delegation's permission duration in terms of cycles.

However, users commonly approach delegation time expectations in terms of cycles, given that is the period of time their funds are locked.
As such, users need to gather information on the current state of the contract and perform some arithmetic when wanting to set a delegation permission duration that is in sync with a given number of cycles.

Given this may not be an easy operation for users, the app allows users to specify a delegation duration in number of cycles and takes care of calculating the equivalent `until-burn-ht` value. This is done with the [`cyclesToBurnChainHeight()`](../../../utils/calculate-burn-height.ts) helper.
