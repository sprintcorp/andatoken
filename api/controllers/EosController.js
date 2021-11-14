var async = require('async')

const { Api, JsonRpc, RpcError } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');      
const fetch = require('node-fetch');   

const { TextEncoder, TextDecoder } = require('util');

module.exports = {
    get_transfer: (req, res) => {
        
  var defaultPrivateKey = req.body.key;
  var signatureProvider = new JsSignatureProvider([defaultPrivateKey]);
  var rpc = new JsonRpc('http://jungle3.cryptolions.io:80', { fetch });
  var api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });

  console.log(req.body);
  sender = req.body.sender;
  receiver = req.body.receiver;
  amount = req.body.amount + " EOS";
  memo = req.body.memo;
  (async () => {
    try {
      const result = await api.transact({
        actions: [{
          account: 'eosio.token',
          name: 'transfer',
          authorization: [{
            actor: sender,
            permission: 'active',
          }],
          data: {
            from: sender,
            to: receiver,
            quantity: amount,
            memo: memo,
          },
        }]
      }, {
          blocksBehind: 3,
          expireSeconds: 30,
        });
        console.log("result >>>>>>>>>>>>>", result)
      res.json({ code: '200', block_num: result.block_num, transaction_id: result.transaction_id, sender: sender, receiver: receiver, amount: req.body.amount, memo: memo });

    } catch (error) {
      return res.status(500).json({ code: '500', error: error });
    }
  })();
    }
}
