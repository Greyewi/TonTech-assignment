import { toNano, Address } from '@ton/core';
import { Escrow } from '../wrappers/Escrow';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    try {
        const escrowAddress = Address.parse('EQA-a4T9tpc4zBhh5cqQj5QedxLZdZwan6uGs1QpUKzA8xmR');
        const escrow = provider.open(Escrow.createFromAddress(escrowAddress));
      
        const sender = provider.sender();
        if (!sender.address) {
            throw new Error('Sender address is undefined');
        }
        
        try {
            await escrow.sendRefund(sender, toNano('0.01'), 0n);
            console.log('Completion transaction sent successfully');
        } catch (txError) {
            console.error('Transaction error:', txError);
            throw txError;
        }

        console.log('Deal completed successfully - funds sent to seller');
    } catch (error) {
        console.error('Error during completion:', error);
        throw error;
    }
}
