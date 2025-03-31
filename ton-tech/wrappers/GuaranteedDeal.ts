import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, toNano } from '@ton/core';
import { Op } from './op-codes';

export type GuaranteedDealConfig = {
    seller: Address;
    buyer: Address;
    guarantor: Address;
    amount: bigint;
    paymentType: number; // 0 for TON, 1 for Jetton
    jettonWallet: Address;
    jettonMaster: Address;
    royalty: bigint;
    state: number;
};

export function guaranteedDealConfigToCell(config: GuaranteedDealConfig): Cell {
    return beginCell()
        .storeUint(0, 8)
        .storeAddress(config.seller)
        .storeAddress(config.buyer)
        .storeAddress(config.guarantor)
        .storeCoins(config.amount)
        .storeUint(config.paymentType, 8)
        .storeAddress(config.jettonWallet)
        .storeAddress(config.jettonMaster)
        .storeCoins(config.royalty)
        .storeUint(config.state, 8)
        .endCell();
}

export class GuaranteedDeal implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell }
    ) {}

    static createFromAddress(address: Address) {
        return new GuaranteedDeal(address);
    }

    static createFromConfig(config: GuaranteedDealConfig, code: Cell, workchain = 0) {
        const data = guaranteedDealConfigToCell(config);
        const init = { code, data };
        return new GuaranteedDeal(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint, params: {
        seller: Address;
        guarantor: Address;
        amount: bigint;
        paymentType: number;
        jettonWallet: Address;
        jettonMaster: Address;
        royalty: bigint;
    }) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Op.deploy, 32)
                .storeUint(0, 64)
                .storeAddress(params.seller)
                .storeAddress(params.guarantor)
                .storeCoins(params.amount)
                .storeUint(params.paymentType, 8)
                .storeAddress(params.jettonWallet)
                .storeAddress(params.jettonMaster)
                .storeCoins(params.royalty)
                .endCell(),
        });
    }

    async sendBuy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Op.buy, 32)
                .storeUint(0, 64)
                .endCell(),
        });
    }

    async sendComplete(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Op.complete, 32)
                .storeUint(0, 64)
                .endCell(),
        });
    }

    async sendRefund(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Op.refund, 32)
                .storeUint(0, 64)
                .endCell(),
        });
    }

    async getPaymentType(provider: ContractProvider): Promise<number> {
        const { stack } = await provider.get('get_payment_type', []);
        return stack.readNumber();
    }

    async getState(provider: ContractProvider): Promise<number> {
        const { stack } = await provider.get('get_state', []);
        return stack.readNumber();
    }
}
