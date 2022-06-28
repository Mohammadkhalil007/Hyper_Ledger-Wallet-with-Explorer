/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('appUser');
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('fabcar');



        /****************************************************User-Data************************************************/
        let userId1 = "USER1"
        let user1 = {
            "id": "USER1",
            "name": "khalil",
        }
        let userId2 = "USER2"
        let user2 = {
            "id": "USER2",
            "name": "zohaib",
        }
        /***************************************************create users***********************************************/
         await contract.submitTransaction('createUser', userId1, JSON.stringify(user1)); 
         await contract.submitTransaction('createUser', userId2, JSON.stringify(user2));
         console.log("Users created Successfully!!")

        /********************************************create Wallet for user ==>1***************************************/
    
        const wallet1 = [1,2,3,4,5];
        await Promise.all(
            wallet1.map(async (id) => {
                await contract.submitTransaction('createWallet', `walletId${id}`, userId1, 50000)
            })
        )
       /********************************************create Wallet for user ==>2****************************************/
        
       const wallet2 = [6,7,8,9,10];
       await Promise.all(
           wallet2.map(async (id) => {
               await contract.submitTransaction('createWallet', `walletId${id}`, userId2, 50000)
           })
       )

        // //  create user1 wallets
        /****************************************LOGIC=2***************************************/
        // for(var i = 1; i <=5; i++){
        //     var data1=await contract.submitTransaction('createWallet', `walletId${i}`, userId1, 10000);
        // }
        //  console.log(data1.toString());


     
        // for(var i = 6; i <=10; i++){
        //   var data2=await contract.submitTransaction('createWallet', `walletId${i}`, userId2, 40000);
        // }
        // console.log(data2.toString());

       /****************************************LOGIC=1***************************************/
     //  create user1 wallets
        //  await contract.submitTransaction('createWallet', "walletId1", userId1, 5000)
        //  await contract.submitTransaction('createWallet', "walletId2", userId1, 5000)
        //  await contract.submitTransaction('createWallet', "walletId3", userId1, 5000)
        //  await contract.submitTransaction('createWallet', "walletId4", userId1, 5000)
        //  await contract.submitTransaction('createWallet', "walletId5", userId1, 5000)
        //  console.log(`${userId1}: Wallets created Successfully!!`);


     //  create user2 wallets
        //  await contract.submitTransaction('createWallet', "WALLET6", userId2, 100)
        //  await contract.submitTransaction('createWallet', "WALLET7", userId2, 100)
        //  await contract.submitTransaction('createWallet', "WALLET8", userId2, 100)
        //  await contract.submitTransaction('createWallet', "WALLET9", userId2, 100)
        //  await contract.submitTransaction('createWallet', "WALLET10", userId2,100)
        //  console.log(userId2 + " Wallets created Successfully!!")






        //  transfer amount from wallet1 to wallet2
        
      /********************************Amount Transfer from one wallet to another Wallet******************************/
        var senderWallet = "walletId1";
         var receiverWallet = "walletId2";
         var amount =200;
         await contract.submitTransaction('transfer', senderWallet, receiverWallet, amount)
         console.log("Transfer Amount successfully from " + senderWallet + " to " + receiverWallet + " amount " + amount);


        // Disconnect from the gateway.
        gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }



}
main();
