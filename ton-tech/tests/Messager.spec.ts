import {
  Blockchain,
  SandboxContract,
  TreasuryContract,
} from '@ton/sandbox';
import { Address, Cell, beginCell, toNano } from '@ton/core';
import { Messager } from '../wrappers/Messager';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';
import { randomAddress } from '@ton/test-utils';

let blockchain: Blockchain;
let messager: SandboxContract<Messager>;
let deployer: SandboxContract<TreasuryContract>;

describe('Messager', () => {
  let code: Cell;

  beforeAll(async () => {
      code = await compile('Messager');
  });

  beforeEach(async () => {
      blockchain = await Blockchain.create();

      deployer = await blockchain.treasury('deployer');

      messager = blockchain.openContract(
        Messager.createFromConfig(
          {
            manager: deployer.address,
          },
          code
        )
      );

      const deployResult = await messager.sendDeploy(
        deployer.getSender(),
        toNano('0.01')
    );

    expect(deployResult.transactions).toHaveTransaction({
        from: deployer.address,
        to: messager.address,
        deploy: true,
    });
  });

  it('should deploy', async () => {});

  it('should change saved address by manager', async () => {
    const address = randomAddress();
    const result = await messager.sendChangeAddress(
        deployer.getSender(),
        toNano('0.01'),
        12345n,
        address
    );

    expect(result.transactions).toHaveTransaction({
        from: deployer.address,
        to: messager.address,
        success: true,
    });
  });

  it('should not change saved address by anyone else', async () => {
    let user = await blockchain.treasury('user');
    const address = randomAddress();
    const result = await messager.sendChangeAddress(
        user.getSender(),
        toNano('0.01'),
        12345n,
        address
    );

    expect(result.transactions).toHaveTransaction({
        from: user.address,
        to: messager.address,
        success: false,
    });
  }); 


  it('should return required data on `requestAddress` call', async () => {
    const address = randomAddress();
    await messager.sendChangeAddress(
        deployer.getSender(),
        toNano('0.01'),
        12345n,
        address
    );

    let user = await blockchain.treasury('user');
    const result = await messager.sendRequestAddress(
        user.getSender(),
        toNano('0.01'),
        12345n
    );
    expect(result.transactions).toHaveTransaction({
        from: messager.address,
        to: user.address,
        body: beginCell()
            .storeUint(3, 32)
            .storeUint(12345n, 64)
            .storeAddress(deployer.address)
            .storeAddress(address)
            .endCell(),
    });
  });


  it('should throw on any other opcode', async () => {
    const result = await deployer.send({
        to: messager.address,
        value: toNano('0.01'),
        body: beginCell().storeUint(5, 32).storeUint(12345n, 64).endCell(),
    });
    expect(result.transactions).toHaveTransaction({
        from: deployer.address,
        to: messager.address,
        exitCode: 3,
    });
  });

});