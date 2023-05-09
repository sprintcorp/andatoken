
'use strict';


module.exports = function(app) {
  var controller = require('../controllers/AndaGoldController');
  app.route('/agd/generate-address').post(controller.generate_address);
  app.route('/agd/funds-transfer').post(controller.transfer);
  app.route('/agd/get-balance').post(controller.get_balance)
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
