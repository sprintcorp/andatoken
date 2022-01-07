const express = require('express')
const TronWeb = require('tronweb')
const cors = require('cors');
var bodyParser = require('body-parser');


const app = express()
//const port = 3000
const fs = require('fs')
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const HttpProvider = TronWeb.providers.HttpProvider;
const fullNode = new HttpProvider("https://api.trongrid.io");
const solidityNode = new HttpProvider("https://api.trongrid.io");
const eventServer = new HttpProvider("https://api.trongrid.io");

async function transfer(params) {
    
    const tronWeb = new TronWeb(fullNode,solidityNode,eventServer,params.privateKey);
    return new Promise(async(resolve, reject) => {
        try {
            let getbalance = await tronWeb.trx.getAccount(
                params.fromAddress,
          );
          //console.log('- Output:', getbalance.balance, '\n');
            if (params.amount>getbalance.balance){
                //resolve([false,"Insufficient funds"]);
                return reject("Insufficient funds");
            }
            tradeobj = await tronWeb.transactionBuilder.sendTrx(
                params.toAddress,
                params.amount,
                params.fromAddress
          );
          const signedtxn = await tronWeb.trx.sign(
                tradeobj,
                params.privateKey
          );
          const receipt = await tronWeb.trx.sendRawTransaction(
                signedtxn      
          );
          resolve([receipt]);
        } catch (error) {
            
            return reject(error);
        }
    })
}


module.exports = {
    get_transfer: (req, res) => {
        const params = req.body;
        transfer(params).then((resp)=>{
            if(resp){
             return res.send({ code: 200,msg:'success',hash:resp})
            }
           
          }).catch((err)=>{
           return res.send({ code: 400,msg:err})
          })
        
      
    }
  }
