import {
  Address,
  beginCell,
  Cell,
  Contract,
  contractAddress,
  ContractProvider,
  Sender,
  SendMode,
} from '@ton/core';

import MessagerCompiled from '../build/Messager.compiled.json'

export type MessagerConfig = {
  manager: Address;
};

export function messagerConfigToCell(config: MessagerConfig): Cell {
  return beginCell().storeAddress(config.manager).storeUint(0, 2).endCell();
}

export class Messager implements Contract {
  constructor(
      readonly address: Address,
      readonly init?: { code: Cell; data: Cell }
  ) {}

  static createFromAddress(address: Address) {
      return new Messager(address);
  }

  static createFromConfig(config: MessagerConfig, code: Cell, workchain = 0) {
      const data = messagerConfigToCell(config);
      const init = { code, data };
      return new Messager(contractAddress(workchain, init), init);
  }

  async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
    await provider.internal(via, {
        value,
        sendMode: SendMode.PAY_GAS_SEPARATELY,
        body: beginCell().endCell(),
    });
  }

  static async getCode() {
    return MessagerCompiled.hex
}

  static async fromInit(manager: Address, memorized: Address) {
    const code = await this.getCode()
    const data = beginCell()
        .storeAddress(manager)
        .storeAddress(memorized)
        .endCell()
    const init = { code: Cell.fromBoc(Buffer.from(code, 'hex'))[0], data }
    const address = contractAddress(0, init)
    return new Messager(address, init)
}

  async sendChangeAddress(provider: ContractProvider, via: Sender, value: bigint, queryId: bigint, newAddress: Address) {
    await provider.internal(via, {
        value,
        sendMode: SendMode.PAY_GAS_SEPARATELY,
        body: beginCell().storeUint(1, 32).storeUint(queryId, 64).storeAddress(newAddress).endCell(),
    });
  }

  async sendRequestAddress(provider: ContractProvider, via: Sender, value: bigint, queryId: bigint) {
    await provider.internal(via, {
        value,
        sendMode: SendMode.PAY_GAS_SEPARATELY,
        body: beginCell().storeUint(2, 32).storeUint(queryId, 64).endCell(),
    });
  } 
}