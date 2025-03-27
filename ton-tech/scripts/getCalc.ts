import { toNano } from '@ton/core';
import { Calc } from '../wrappers/Calc';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const calc = provider.open(
        Calc.createFromConfig({}, await compile('Calc'))
    );

    console.log('Total:', await calc.getTotal());
}