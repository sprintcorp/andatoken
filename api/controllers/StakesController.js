
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
      let xtzWallet = new wallet.XTZ({
        mnemonic: params.mnemonic
      });
     try {
      let keystore=await xtzWallet.createKeyStore();
      console.log(keystore,"xcbv")
     } catch (error) {
      return reject(error);
     } 
      
      xtzWallet.initApi({
        conseilUrl:  'https://conseil-prod.cryptonomic-infra.tech',
        conseilApiKey: ' a7670046-f49a-497a-82f3-41cc49dbc444', 
        conseilNetwork:  'mainnet',
        tezosNode: 'https://tezos-prod.cryptonomic-infra.tech'
      });
      xtzWallet.initMoonstakeApi(moonstakeConfig);
      xtzWallet.setMemo('XTZ');
      try {
        let resp=await xtzWallet.sendAndDelegateTx()
        console.log(resp, "gkjkj")
        if (!resp){
          return reject("something went wrong")
        }
        resolve(resp)
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
          if(resp){
           return res.send({ code: 200,msg:resp})
          }else{
           return res.send({ code: 400,msg:'something went wrong'})   
          }
        }).catch((err)=>{
         return res.send({ code: 400,msg:err})
        })
    },
  }