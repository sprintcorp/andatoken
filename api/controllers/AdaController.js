const { WalletServer, Seed, AddressWallet } = require('cardano-wallet-js');
const axios = require('axios');

const URL='http://52.220.225.142:8090/v2'
let walletServer = WalletServer.init(URL);

async function generateAddress(params){
    return new Promise(async (resolve, reject) => {  
        passphrase = params.passphrase;  
        let recoveryPhrase = Seed.generateRecoveryPhrase();
        let mnemonic_sentence = Seed.toMnemonicList(recoveryPhrase);        
        let name = 'TUX-wallet';
        try {
            let wallet = await walletServer.createOrRestoreShelleyWallet(name, mnemonic_sentence, passphrase);          
            let response = await axios.get(`${URL}/wallets/${wallet.id}/addresses`);
            let data={
                'mnemonic':mnemonic_sentence,
                'address':response.data,
                'id':wallet.id,
                'passphrase':params.passphrase
            }
            resolve(data);
        } catch (error) {
            return reject(error)
        }
    })
}

async function transfer(params){
    return new Promise(async (resolve, reject) => {         
        try {
            let wallet = await walletServer.getShelleyWallet(params.wallet_id); 
            let address = new AddressWallet(params.receiverAddress);
            let transaction = await wallet.sendPayment(params.passphrase, [address], [params.amount]);          
            return resolve(transaction)
        } catch (error) {
            return reject(error);
        }
    })
}

async function restoreWallet(data){
    return new Promise(async (resolve, reject) => {         
        try {
            console.log("before data")
            console.log("data :", data);
            let name = "Tux-wallet";
            let mnemonic_sentence = data.ADA_mnemonic;
            let passphrase = data.wallet_passphrase; 
            console.log("name :", name);
            console.log("mnemonic_sentence :", mnemonic_sentence)
            console.log("passphrase :", passphrase);
            let wallet = await walletServer.createOrRestoreShelleyWallet(name, mnemonic_sentence, passphrase);
            console.log("wallet :", wallet);
            return resolve(wallet)
        } catch (error) {
            console.log("error :", error)
            return reject(error);
        }
    })
}

async function syncStatus(data){
    return new Promise(async (resolve, reject) => {         
        try {
            console.log("aaya")
            console.log("data :", data);
            let walletId = data.walletId
            // let wallets = await walletServer.wallets();
            // let id = wallets[0].id;
            let wallet = await walletServer.getShelleyWallet(walletId);
            console.log("wallet :", wallet.state);
            return resolve(wallet.state);
        } catch (error) {
            return reject(error);
        }
    })
}
module.exports = {

    "wallet": (req, res) => {
        generateAddress(req.body).then((resp)=>{           
             return res.send({ code: 200,msg:'success',data:resp})
          }).catch((err)=>{
              return res.send({ code: 400,msg:err})
          })
    },

    "transfer": (req, res) => {
        transfer(req.body).then((resp)=>{
             return res.send({ code: 200,msg:'success',data:resp})
          }).catch((err)=>{
           return res.send({ code: 400,msg:err})
          })
    },

    "restore_wallet" : (req, res) => {
        restoreWallet(req.body).then((resp)=>{
             return res.send({ code: 200,msg:'success',data:resp})
          }).catch((err)=>{
           return res.send({ code: 400,msg:err.response.data})
          })
    },

    "sync_status" : (req, res) => {
        syncStatus(req.body).then((resp)=>{
             return res.send({ code: 200,msg:'success',data:resp})
          }).catch((err)=>{
           console.log("error asaasas:", err)
           return res.send({ code: 400,response:err.response.data})
          })
    },
}
