import { toNano } from '@ton/core';
import { Messager } from '../wrappers/Messager';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const calcDeal = provider.open(
        Messager.createFromConfig(
            {manager: provider.sender().address!},
            await compile('Messager')
        )
    );

    await calcDeal.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(calcDeal.address);
}
