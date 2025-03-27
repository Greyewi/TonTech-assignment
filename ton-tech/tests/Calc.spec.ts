import {
    Blockchain,
    SandboxContract,
    TreasuryContract,
} from '@ton/sandbox';
import { Address, Cell, beginCell, toNano } from '@ton/core';
import { Calc } from '../wrappers/Calc';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';
import { randomAddress } from '@ton/test-utils';

describe('Calc', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Calc');
    });

    let blockchain: Blockchain;
    let calc: SandboxContract<Calc>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        let deployer = await blockchain.treasury('deployer');

        calc = blockchain.openContract(
            Calc.createFromConfig(
                {
                    manager: deployer.address,
                },
                code
            )
        );

        const deployResult = await calc.sendDeploy(
            deployer.getSender(),
            toNano('0.01')
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: calc.address,
            deploy: true,
        });
    });

    it('should deploy', async () => {});

    it('should update the number', async () => {
        const caller = await blockchain.treasury('caller');

        await calc.sendNumber(caller.getSender(), toNano('0.01'), 10n);
        expect(await calc.getTotal()).toEqual(10n);
    
        await calc.sendNumber(caller.getSender(), toNano('0.01'), 5n);
        expect(await calc.getTotal()).toEqual(15n);
    
        await calc.sendNumber(caller.getSender(), toNano('0.01'), 1000n);
        expect(await calc.getTotal()).toEqual(1015n);
    });

    it('should throw error when number is not 32 bits', async () => {
        const caller = await blockchain.treasury('caller');
    
        const result = await calc.sendDeploy(caller.getSender(), toNano('0.01'));
        expect(result.transactions).toHaveTransaction({
            from: caller.address,
            to: calc.address,
            success: false,
            exitCode: 35,
        });
    });
});