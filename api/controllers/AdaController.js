const { WalletServer, Seed, AddressWallet } = require('cardano-wallet-js');
const axios = require('axios');

const URL='http://18.142.143.70:8090/v2'
let walletServer = WalletServer.init(URL);



async function restoreAddress(params){
    return new Promise(async (resolve, reject) => {
        let name = 'TUX-wallet';
        try {
            let data={
                'mnemonic_sentence':params.mnemonic,
                'name':name,
                'passphrase':params.passphrase
            }
            // let response = await axios.post(`${URL}/wallets`,data);
            axios.post(`${URL}/wallets`, data).then((response) => {
                resolve(response.data)
            }).catch((error) => {
                console.error("ERROR",error)
                return reject(error.message)
            })
        } catch (error) {
            console.log(error)
            return reject(error.data)
        }
    })
}
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

module.exports = {

    "wallet": (req, res) => {
        console.log("START")
        restoreAddress(req.body).then((resp)=>{           
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
}