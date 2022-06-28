/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class Wallet extends Contract {

    async initLedger(ctx) {
        console.info('============= Initialize Ledger ===========');
        await ctx.stub.putState("Test", "Wallet Logic")
        return "success"
    }
                                              /*================User_Creation================*/

    async createUser(ctx, userId, userData){
       await ctx.stub.putState(userId, Buffer.from(JSON.stringify(userData)));
       console.info('============= User Created ===========');
    }
    

/*=================One_Call-Function=================*/
// async callforUser(){

// }


    
                                              /*=================get single users wallets=================*/
 
      async queryWalletsByUser(ctx, userId){
              let queryString = {};
              queryString.selector = {"userId": userId};
              let iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
              let result = await this.getIteratorData(iterator);
              return JSON.stringify(result);
            }
async getIteratorData(iterator){
               let resultArray = [];
               while(true){
               let res = await iterator.next();
               let resJson = {};
               if(res.value && res.value.value.toString()){
               resJson.key = res.value.key;
               resJson.value = res.value.value.toString('utf-8');
               resultArray.push(resJson);
           }
               if(res.done){
                     await iterator.close();
                     return resultArray;
                }  
            }
        }
    
                                              /*=================Create_Wallets Self=================*/


// async createWallet(ctx,walletId,userId,depositDefaultanount){
//     const userCheck= await ctx.stub.getState(userId);
//     if(!userCheck || userCheck.length===0){
//         throw new Error(`${userId} this id user not exist in our Database`);
//     }
//             const userExist = JSON.parse(userCheck.toString());
//              console.log(user);

//              //logic for check amount is greater then zero
//                  const amountValue= parseInt(depositDefaultanount);
//                  if(amountValue<=0){
//                      throw new Error(`${amountValue} is not enough for account creation`);           
//                  }
//              // logic for data transfer to database
//                  const walletDetail={
//                                  walletId: walletId,
//                                  userId: userId,
//                                  depositDefaultanount: amountValue,
                               
//                  }
//                  await ctx.stub.putState(walletId, Buffer.from(JSON.stringify(walletDetail)));
// }

    async createWallet(ctx, walletKey, userKey, amount){

        // get the user from chaincode state
        const userAsBytes = await ctx.stub.getState(userKey); 
        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error(`${userKey} does not exist`);
        }
        const user = JSON.parse(userAsBytes.toString());
        console.log(user);

        const amountInt = parseInt(amount);
        if (amountInt <= 0) {
            throw new Error('amount must be a positive integer');
        }
              
        let currentBalance = 0;
        const updatedBalance = currentBalance + amountInt;

         var walletData = {
             userId: userKey,
             balance: updatedBalance
         }
         await ctx.stub.putState(walletKey, Buffer.from(JSON.stringify(walletData)));
        // Emit the Transfer event
        const transferEvent = { 
            from: '0x0', 
            to: userKey, 
            value: amountInt };
        ctx.stub.setEvent('Transfer', Buffer.from(JSON.stringify(transferEvent)));

        console.log(`User of detail ${user} balance updated from ${currentBalance} to ${updatedBalance}`);
        return true;
    }

                                            /*=================Query_Wallets================*/

    async queryAllWallets(ctx){
        const startKey = 'WALLET0';
        const endKey = 'WALLET999';
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }
                                            /*============Transfer-Account to Account=============*/

    async transfer(ctx, senderWallet, receiverWallet, amount){
        //withdraw 
        const serderWalletAsBytes = await ctx.stub.getState(senderWallet); 
        if (!serderWalletAsBytes || serderWalletAsBytes.length === 0) {
            throw new Error(`${senderWallet} does not exist`);
        }      
        const wallet = JSON.parse(serderWalletAsBytes.toString());

        if(wallet.balance > amount)
        {
            var remainingBalance = wallet.balance - amount;
            wallet.balance = remainingBalance;
            await ctx.stub.putState(senderWallet, Buffer.from(JSON.stringify(wallet)));
            console.info('============= Amount withdraw successfully ===========');

            //deposit
            const receiverWalletAsBytes = await ctx.stub.getState(receiverWallet); 
            if (!receiverWalletAsBytes || receiverWalletAsBytes.length === 0) {
                throw new Error(`${receiverWallet} does not exist`);
            }      
            const wallet2 = JSON.parse(receiverWalletAsBytes.toString());
            const amountInt = parseInt(amount);
            var updatedBalance = wallet2.balance + amountInt;
            wallet2.balance = updatedBalance;
            await ctx.stub.putState(receiverWallet, Buffer.from(JSON.stringify(wallet2)));
            console.info('============= Amount deposit successfully ===========');
        }
        else{
            throw new Error(`${senderWallet} limit exceeded!`);
        } 

        return true;
    }

                                            /*============all transaction logs=============*/ 
    async transactionLog(ctx){
       const log=await ctx.stub.getState();
    }




                                            /*============check wallet  detail =============*/

    async checkWalletDetail(ctx, wallet){
        const walletInBytes = await ctx.stub.getState(wallet); 
        const userWallet = JSON.parse(walletInBytes.toString());
        return userWallet;
    }
}

module.exports = Wallet;
