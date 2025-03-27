import { toNano } from '@ton/core';
import { GuaranteedDeal } from '../wrappers/GuaranteedDeal';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const guaranteedDeal = provider.open(
        GuaranteedDeal.createFromConfig(
            {
                id: Math.floor(Math.random() * 10000),
                counter: 0,
            },
            await compile('GuaranteedDeal')
        )
    );

    await guaranteedDeal.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(guaranteedDeal.address);

    console.log('ID', await guaranteedDeal.getID());
}
