import { toNano } from '@ton/core';
import { Calc } from '../wrappers/Calc';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const calcDeal = provider.open(
        Calc.createFromConfig(
            {
                id: Math.floor(Math.random() * 10000),
                counter: 0,
            },
            await compile('Calc')
        )
    );

    await calcDeal.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(calcDeal.address);

    console.log('ID', await calcDeal.getTotal());
}
