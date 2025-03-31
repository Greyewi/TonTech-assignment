import { toNano, Address } from '@ton/core';
import { Escrow } from '../wrappers/Escrow';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const seller = provider.sender().address!;
    const buyer = Address.parse('UQAN01gJaHZ5V85cBWg51MF0j6BdLQ9vj-_L8bEMoN6OWKZl');
    const guarantor = provider.sender().address!;
    const amount = toNano('0.02');

    const escrow = provider.open(
        Escrow.createFromConfig(
            {
                seller,
                buyer,
                guarantor,
                amount,
                isCompleted: false
            },
            await compile('Escrow')
        )
    );

    await escrow.sendDeploy(provider.sender(), toNano('0.05'), {
        seller,
        buyer,
        guarantor,
        amount
    });

    await provider.waitForDeploy(escrow.address);
}
