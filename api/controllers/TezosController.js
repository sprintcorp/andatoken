const conseiljssoftsigner = require('conseiljs-softsigner');
const { TezosToolkit } = require('@taquito/taquito');
const tezos = new TezosToolkit('https://teznode.letzbake.com');
const { InMemorySigner, importKey } = require('@taquito/signer');

async function generateAddress(data){
    return new Promise(async (resolve, reject) => {  
        try{
            const derivationPath = `m/44'/1729'/0'/0'`
            const keystore = await conseiljssoftsigner.KeyStoreUtils.restoreIdentityFromMnemonic(data.mnemonic, '', '', derivationPath,'');
            resolve(keystore)
        } catch (error) {
            return reject(error)
        }
    })
}

async function transferFunds(data){
    return new Promise(async (resolve, reject) => {  
        try{
            const amount = data.amount;
            const address = data.to;
            tezos.setProvider({
                signer: new InMemorySigner(data.secretKey),
            });

            console.log(`Transfering ${amount} ꜩ to ${address}...`);
            tezos.contract
            .transfer({ to: address, amount: amount })
            .then((op) => {
                console.log(`Waiting for ${op.hash} to be confirmed...`);
                return op.confirmation(1).then(() => op.hash);
            })
            .then((hash) => resolve(hash))
            .catch((error) => reject(error));

        } catch (error) {
            reject(error)
        }
    })
}

module.exports = {

    "generate_address": (req, res) => {
        generateAddress(req.body).then((resp)=>{           
             return res.send({ code: 200,msg:'success',data:resp})
          }).catch((err)=>{
              return res.send({ code: 400,msg:err})
          })
    },

    "transfer": (req, res) => {
        transferFunds(req.body).then((resp)=>{           
             return res.send({ code: 200,msg:'success',data:resp})
          }).catch((err)=>{
              console.log("err log :", err)
              return res.send({ code: 400,msg: "Something went wrong!", data:err})
          })
    },

}