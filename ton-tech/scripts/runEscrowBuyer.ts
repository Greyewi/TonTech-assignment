import { toNano, Address } from '@ton/core';
import { Escrow } from '../wrappers/Escrow';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    //const buyer = Address.parse('UQCaAy9lz6FwG6TvxUsYk4qmVCYsW40ADaHFwfv6ZdL0fln6');
    const escrowAddress = Address.parse('EQA-a4T9tpc4zBhh5cqQj5QedxLZdZwan6uGs1QpUKzA8xmR');
    
    const escrow = provider.open(Escrow.createFromAddress(escrowAddress));

        const depositAmount = toNano('0.02');
        const sender = provider.sender();
        
        try {
            await escrow.sendDeposit(sender, depositAmount, 0n);
            console.log('Deposit transaction sent successfully');
        } catch (txError) {
            console.error('Transaction error:', txError);
            throw txError;
        }

    console.log('Deposit sent successfully');
}
