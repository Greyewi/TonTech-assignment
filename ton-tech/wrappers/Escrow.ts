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

import EscrowCompiled from '../build/Escrow.compiled.json'

export type EscrowConfig = {
    seller: Address;
    buyer: Address;
    guarantor: Address;
    amount: bigint;
    isCompleted: boolean;
};

export function escrowConfigToCell(config: EscrowConfig): Cell {
    return beginCell()
        .storeUint(0, 8)
        .storeAddress(config.seller)
        .storeAddress(config.buyer)
        .storeAddress(config.guarantor)
        .storeCoins(config.amount)
        .storeUint(config.isCompleted ? 1 : 0, 1)
        .endCell();
}

export class Escrow implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell }
    ) {}

    static createFromAddress(address: Address) {
        return new Escrow(address);
    }

    static createFromConfig(config: EscrowConfig, code: Cell, workchain = 0) {
        const data = escrowConfigToCell(config);
        const init = { code, data };
        return new Escrow(contractAddress(workchain, init), init);
    }

    // Seller deploys the contract
    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint, params: {
        seller: Address;
        buyer: Address;
        guarantor: Address;
        amount: bigint;
    }) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x1, 32) // op code for deploy
                .storeUint(0, 64) // query_id
                .storeAddress(params.seller)
                .storeAddress(params.buyer)
                .storeAddress(params.guarantor)
                .storeCoins(params.amount)
                .endCell(),
        });
    }

    // Buyer deposits funds
    async sendDeposit(provider: ContractProvider, via: Sender, value: bigint, queryId: bigint = 0n) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x2, 32) // op code for deposit
                .storeUint(queryId, 64)
                .endCell(),
        });
    }

    // Guarantor completes the deal
    async sendComplete(provider: ContractProvider, via: Sender, value: bigint, queryId: bigint = 0n) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x3, 32) // op code for complete
                .storeUint(queryId, 64)
                .endCell(),
        });
    }

    // Guarantor refunds the buyer
    async sendRefund(provider: ContractProvider, via: Sender, value: bigint, queryId: bigint = 0n) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x4, 32) // op code for refund
                .storeUint(queryId, 64)
                .endCell(),
        });
    }

    static async getCode() {
        return EscrowCompiled.hex;
    }

    static async fromInit(seller: Address, buyer: Address, guarantor: Address, amount: bigint) {
        const code = await this.getCode();
        const data = beginCell()
            .storeUint(0, 8) // storage tag
            .storeAddress(seller)
            .storeAddress(buyer)
            .storeAddress(guarantor)
            .storeCoins(amount)
            .storeUint(0, 1) // is_completed
            .endCell();
        const init = { code: Cell.fromBoc(Buffer.from(code, 'hex'))[0], data };
        const address = contractAddress(0, init);
        return new Escrow(address, init);
    }
}