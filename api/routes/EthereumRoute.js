
'use strict';


module.exports = function(app) {
  var ethereum = require('../controllers/EthereumController');
  var  tron = require('../controllers/TronController');
  var  steller = require('../controllers/StellerController'); 
  var  ripple = require('../controllers/RippleController');
  var  btc = require('../controllers/BtcController')
  var  ltc = require('../controllers/LtcController')
  var  bch = require('../controllers/BchController')
  var  stake = require('../controllers/StakesController')
  var  ada = require('../controllers/AdaController')
  var erc = require('../controllers/Erc20Controller');
  var mig = require('../controllers/MigController')
  var nft = require('../controllers/Erc721Controller');
  var tezos = require('../controllers/TezosController');

  var tempEthereum = require('../controllers/TempEthereumController');
  var tempErc = require('../controllers/TempErc20Controller');
  var tempNft = require('../controllers/TempErc721Controller');

    app.route('/eth/transfer')
    .post(ethereum.get_transfer);

    app.route('/erc/transfer')
    .post(erc.get_transfer);

    app.route('/nft/transfer')
    .post(nft.get_transfer);

    app.route('/mig/migrate-wallet')
    .post(mig.migrate_wallet);

    app.route('/mig/wallet-summary')
    .post(mig.wallet_summary);	

    app.route('/tron/transfer')
    .post(tron.get_transfer);

    app.route('/steller/transfer')
    .post(steller.send_stellar);

    app.route('/steller/generateAddress')
    .post(steller.wallet)

    app.route('/ripple/transfer')
    .post(ripple.payment_method);

    app.route('/ripple/generateAddress')
    .get(ripple.generate_new_addr);

    app.route('/btc/transfer')
    .post(btc.get_transfer);

    app.route('/btc/generateAddress')
    .get(btc.generate_address);

    app.route('/bch/generateAddress')
    .post(bch.generate_address);

    app.route('/bch/transfer')
    .post(bch.get_transfer);

    app.route('/ltc/transfer')
    .post(ltc.get_transfer);

    app.route('/ltc/generateAddress')
    .get(ltc.generate_address);

    app.route('/stake/ada')
    .post(stake.ada_stake);

    app.route('/stake/ada-claim')
    .post(stake.ada_claim);

    app.route('/stake/xtz')
    .post(stake.xtz_stake);

    app.route('/ada/generateAddress')
    .post(ada.wallet)

    app.route('/ada/transfer')
    .post(ada.transfer);

    app.route('/ada/restoreWallet')
    .post(ada.restore_wallet);

    app.route('/ada/syncStatus')
    .post(ada.sync_status);

    app.route('/eth/temp-transfer')
    .post(tempEthereum.get_transfer);

    app.route('/erc/temp-transfer')
    .post(tempErc.get_transfer);

    app.route('/nft/temp-transfer')
    .post(tempNft.get_transfer);

    app.route('/tezos/generateAddress')
    .post(tezos.generate_address);

    app.route('/tezos/transferFunds')
    .post(tezos.transfer);
    
};





































// push on origin2


// {
//   "code": 200,
//   "Result": {
//       "address": "0x603bCE8fF2D77551fF2BC6E7021bBb6632De17e7",
//       "privateKey": "0xab49a0e3081dbcb5c28a33d5560426f4fef0a584cff4d325348e185cd2b9f20f"
//   },
//   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1NjE5ODE2NTJ9.WJbhpUDkX-_mo5equo97RbSOmNt-1R15nvvmsY_SrTo"
// }
