import { toNano } from '@ton/core';
import { Calc } from '../wrappers/Calc';
import { NetworkProvider, compile } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const calc = provider.open(
        Calc.createFromConfig({}, await compile('Calc'))
    );

    await calc.sendNumber(provider.sender(), toNano('0.01'), 123n);
}