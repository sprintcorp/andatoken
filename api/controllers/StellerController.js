const { NetworkError } = require('stellar-sdk');
const StellarHDWallet = require('stellar-hd-wallet')
const StellarSdk = require('stellar-sdk');
//let provider = "https://horizon-testnet.stellar.org"; // testnet 
let provider = "https://horizon.stellar.org"; // mainnet

const server = new StellarSdk.Server(provider);

async function transferFund(params) {
    var sourceSecretKey = params.secret_address;
    var sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecretKey);
    var sourcePublicKey = params.from_address //sourceKeypair.publicKey();
    var receiverPublicKey = params.to_address;
    return new Promise(async (resolve, reject) => {
        const account = await server.loadAccount(sourcePublicKey);
        console.log("Type:", typeof account.balances[0].balance);
        if (params.amount>account.balances[0].balance){
            return reject("Insufficient Funds")
        }
        console.log("STARTED")
        const fee = await server.fetchBaseFee();
        const transaction = new StellarSdk.TransactionBuilder(account, { fee, networkPassphrase: StellarSdk.Networks.PUBLIC })
        .addOperation(
            // this operation funds the new account with XLM
            StellarSdk.Operation.payment({
                destination: receiverPublicKey,
                asset: StellarSdk.Asset.native(),
                amount: params.amount
            })
        )
        .setTimeout(30)
        .build();

    // sign the transaction
        console.log("END")
        transaction.sign(sourceKeypair);
        //console.log(transaction.toEnvelope().toXDR('base64')); 
        // console.log(transaction,"kuch to bta ");  
        // try {
        //     const transactionResult = await server.submitTransaction(transaction);
        //     console.log(transactionResult);
        //     resolve(transactionResult)
        // } catch (err) {
        //     console.error(err.data.extras);
        //     return reject(err)
        // }
        server.submitTransaction(transaction).then(res => {
            // console.log(JSON.stringify(res, null, 2));
            console.log('\nSuccess! View the transaction at: ');
            console.log(res._links.transaction.href);
            resolve(res._links.transaction.href.split('/')[4]);
        })
        .catch(error => {
            console.log("ERRRR",error)
            return reject(error);
        });
            
    });
}

module.exports = {

    // "wallet": (req, res) => {
    //     var pair = StellarSdk.Keypair.random();
    //     let wallet = [];
    //     console.log("wallet created successfully!!!!", pair)
    //     pair.secret();
    //     pair.publicKey();
    //     wallet.push({
    //         publicKey: pair.publicKey(),
    //         secretKey: pair.secret()
    //     })
    //     res.json({ code: 200, data: wallet })
    // },

    "wallet": (req, res) => {
         // change in nodemodules of stellar-hd-wallet.js for language acceptance..block 48, add in 46
        try {
           const wallet = StellarHDWallet.fromMnemonic(req.body.mnemonic, "english")
            data={
                code:200, 
                publicKey:wallet.getPublicKey(0),
                secretKey:wallet.getSecret(0),
            }
            res.json(data)
        } catch (error) {
            console.log("**")
        }
        console.log("hello")
        try {
          const  wallet = StellarHDWallet.fromMnemonic(req.body.mnemonic, "japanese")
            data={
                code:200, 
                publicKey:wallet.getPublicKey(0),
                secretKey:wallet.getSecret(0),
            }
            res.json(data)
        } catch (error) {
            console.log("**")
        }
        try {
           const wallet = StellarHDWallet.fromMnemonic(req.body.mnemonic, "chinese_traditional")
            data={
                code:200, 
                publicKey:wallet.getPublicKey(0),
                secretKey:wallet.getSecret(0),
            }
            res.json(data)
         } catch (error) {
             console.log(error.message,"sfdfsd")
            return res.send({ code: 400,msg:"Invalid mnemonic"})
        }
        
    },

    "balance": (req, res) => {
        console.log("i am )))))))")
        server.accounts()
            .accountId(req.body.address)
            .call()
            .then(function (accountResult) {
                console.log("show me the accountResult===>>", accountResult)
                res.send({ code: 200, balance: accountResult.balances[0].balance })
            })
            .catch(err => {
                console.log("show me the balance =====>>", err)
                res.send({ code: 200, balance:"xyz" , message:err })
            })
    },

send_stellar: (req, res) => {
    console.log("Request is=================>", req.body)
    transferFund(req.body).then((resp)=>{
        console.log(resp,"jjjjjjjj")
        if(resp){
         return res.send({ code: 200,msg:'success',hash:resp})
        }else{
         return res.send({ code: 400,msg:'Insufficient funds'})
        } 
      }).catch((err)=>{
       return res.send({ code: 400,msg:err ? err:"Destination address is invalid"})
       
      })
 }

}
