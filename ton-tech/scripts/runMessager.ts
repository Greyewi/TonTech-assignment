import { toNano, beginCell, Address } from '@ton/core'
import { Messager } from '../wrappers/Messager'
import { NetworkProvider, compile } from '@ton/blueprint';
import { SendMode } from '@ton/core'

export async function run(provider: NetworkProvider) {
  const ui = provider.ui

  const sender = provider.sender()
  if (!sender.address) {
    throw new Error('Sender address is undefined')
  }
  const managerAddress = sender.address
  const memorizedAddress = Address.parse('UQCaAy9lz6FwG6TvxUsYk4qmVCYsW40ADaHFwfv6ZdL0fln6')
  const contract = provider.open(await Messager.fromInit(
      managerAddress,
      memorizedAddress!
  ))

  const newMemorized = Address.parse('UQBSUTmw33U5ttJSkFbbU0vRV7IeaCHuZjwriGfDraKiF-Z6')

  const body = beginCell()
      .storeUint(1, 32)
      .storeUint(0, 64)
      .storeAddress(newMemorized)
      .endCell()

  await provider.provider(contract.address).internal(sender, {
      value: toNano('0.05'),
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().storeUint(1, 32).storeUint(0n, 64).storeAddress(newMemorized).endCell()
  })

  console.log('✅ Message with op = 1 sent')
}