
 const conseiljssoftsigner = require('conseiljs-softsigner');
 const { wallet } = require('@moonstake/moonstakejs');
 const ipbConfig = {
  apiKey: 'bd9e5c98-385b-4d01-af14-685f9c30ec68',
  secret: 'MY89JNQ6qX9jVYgldnNSOoWayEjkgbe5'
};

const moonstakeConfig = {
  apiKey: '71a5dc2d-923d-4e8a-90f2-c2c6343faee4',
  secret: 'e5BMXENRlYXBVqpwXxecpZa1OyvDV7op'
};
 
  async function ada(params){
    return new Promise(async(resolve, reject) => {
    let adaWallet = new wallet.ADA({
        mnemonic: params.mnemonic
    });
 
    adaWallet.initIBPApi(ipbConfig);
    adaWallet.initMoonstakeApi(moonstakeConfig);
    adaWallet.setMemo('ADA');
    console.log(adaWallet)
     try {
      const send = await adaWallet.createAndSendStakingTx();
      console.log(send, "hgkjhklj")
     resolve(send)
     } catch (error) {
      return reject(error);
     }
    })
  }

  async function ada_claim(params){
    return new Promise(async(resolve, reject) => {
    let adaWallet = new wallet.ADA({
        mnemonic: params.mnemonic
    });
 
    adaWallet.initIBPApi(ipbConfig);
    adaWallet.initMoonstakeApi(moonstakeConfig);
    adaWallet.setMemo('ADA');
    console.log(adaWallet)
     try {
      const claim = await adaWallet.createAndSendClaimRewardTx();
      if(!claim){
        return reject("You don't have any reward to claim.")
      }
      console.log(claim, "hgkjhklj")
     resolve(claim)
     } catch (error) {
      return reject(error);
     }
    })
  }
  
  async function xtz(params){
    return new Promise(async(resolve, reject) => {
      console.log("aaya?")
      console.log(params.mnemonic);
      let xtzWallet = new wallet.XTZ({
        mnemonic: params.mnemonic,
      });
      console.log("xtzWallet :", xtzWallet)
     try {
      // let keystore=await xtzWallet.createKeyStore();
      let derivationPath = `m/44'/1729'/0'/0'`
      let keystore = await conseiljssoftsigner.KeyStoreUtils.restoreIdentityFromMnemonic(params.mnemonic, '', '', derivationPath,'');
      console.log("keystore :", keystore)
      xtzWallet.setKeystore(keystore);

     } catch (error) {
      return reject(error);
     } 
    //  console.log()
    // xtzWallet.privateKey = keystore.secretKey 
    // xtzWallet.password = ''
    xtzWallet.setMnemonic(params.mnemonic);
    xtzWallet.setPassword('');
    xtzWallet.setPrivateKey('edskRwTibGKNsf5UqSUp5VfAT95wS6x3CqV5DsjkGpvohrzg6SrLQ4rHdSxpaVZUGt85XWrTQBQguEkL4sMHj3icS4um12ch8J');
    xtzWallet.setMemo('XTZ');

      xtzWallet.initApi({
        conseilUrl:  'https://teznode.letzbake.com',
        conseilApiKey: ' a7670046-f49a-497a-82f3-41cc49dbc444', 
        conseilNetwork:  'mainnet',
        tezosNode: 'https://teznode.letzbake.com'
      });

      xtzWallet.initMoonstakeApi(moonstakeConfig);
      try {
        let resp=await xtzWallet.sendAndDelegateTx()
        console.log("asbmnasbfnaaaaaa", resp)
        if (!resp){
          return reject("something went wrong")
        }
        var mySubString = resp.substring(
          resp.indexOf('o') + 1, 
          resp.lastIndexOf('"')
      );
      console.log("mySubString",mySubString);
        resolve(mySubString)
      } catch (error) {
        return reject(error);
      } 
    })
  }
   
  module.exports = {
    ada_stake: (req, res) => {
  
        const params=req.body;
        ada(params).then((resp)=>{
           return res.send({ code: 200,msg:"Success",data:resp})
        }).catch((err)=>{
            console.log(err,"cvbn")
         return res.send({ code: 400,msg:err})
        })
    },

    ada_claim: (req, res) => {
  
      const params=req.body;
      ada_claim(params).then((resp)=>{
         return res.send({ code: 200,msg:"Success",data:resp})
      }).catch((err)=>{
          console.log(err,"cvbn")
       return res.send({ code: 400,msg:err})
      })
  },

    xtz_stake: (req, res) => {
  
        const params=req.body;
        xtz(params).then((resp)=>{    
           return res.send({ code: 200,data:resp})
        }).catch((err)=>{
         return res.send({ code: 400,msg:err})
        })
    },
  }
