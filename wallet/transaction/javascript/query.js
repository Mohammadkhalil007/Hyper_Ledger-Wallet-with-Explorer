/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');


async function main() {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

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



        // get all users
        // var result = await contract.evaluateTransaction('queryAllUsers');
        // console.log(`Users is fetched successfully, result is: ${result.toString()}`);
        // console.log("---------------------------------------------------------------");


        //get all wallets

        var result = await contract.evaluateTransaction('queryAllWallets');
        console.log(`All Wallets is fectched successfully, result is: ${result.toString()}`);
        console.log("------------------------------All wallets-------------------------");

      
 
        //get the wallets of specific user by userID

       //user1
       
        var userID = "USER1";
        console.log(`--------------------------${userID}----------------------------`);
        var getWallets = await contract.evaluateTransaction('queryWalletsByUser', userID);
        console.log(`Wallets Detail of ${userID}:`);
        console.log(`${getWallets.toString()}`);
        
        //user2
        var userID = "USER2";
        console.log(`--------------------------${userID}----------------------------`);
        var getWallets = await contract.evaluateTransaction('queryWalletsByUser', userID);
        console.log(`Wallets Detail of ${userID}:`);
        console.log(`${getWallets.toString()}`);
        
        



        console.log(`--------------------------checkWalletDetail----------------------------`);
        //amount transfer acknowledge 
        var senderWallet = "walletId1"
        var receiverWallet = "walletId2"
        var result1 = await contract.evaluateTransaction('checkWalletDetail', senderWallet);
        console.log(`${senderWallet} account balance transfer to ${receiverWallet} and detail is::: ${result1.toString()}`);

        var result2 = await contract.evaluateTransaction('checkWalletDetail', receiverWallet);
        console.log(`${receiverWallet} recieve amount from ${senderWallet} and detail is::: ${result2.toString()}`);



        
        // Disconnect from the gateway.
        gateway.disconnect();
        
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }


}

main();
