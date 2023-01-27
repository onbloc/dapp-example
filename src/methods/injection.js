// checks the existence of the adena object in window
const existsWallet = () => {
  if (window.adena) {
    return true;
  }
  return false;
};

// calls the AddEstablish of the adena object
const addEstablish = (siteName) => {
  return window?.adena?.AddEstablish(siteName);
};

// calls the GetAccount function of the adena object
const getAccount = () => {
  return window.adena?.GetAccount();
};

// Execute the DoContract function of the adena object to request transaction.
const doContractPackageFunction = (
  caller,
  func,
  pkgPath,
  argument) => {

  // Setup Transaction Message
  const message = {
    type: "/vm.m_call",
    value: {
      caller,
      func,
      send: "",
      pkg_path: pkgPath,
      args: argument.split(',')
    }
  };

  // Request Transaction
  return window.adena?.DoContract({
    messages: [message],
    gasFee: 1,
    gasWanted: 3000000
  });
};

// Execute the DoContract function of the adena object to request transaction.
const sendToken = (fromAddress, toAddress, sendAmount) => {
  const message = {
    type: "/bank.MsgSend",
    value: {
      from_address: fromAddress,
      to_address: toAddress,
      amount: sendAmount
    }
  };

  return window.adena?.DoContract({
    messages: [message],
    gasFee: 1,
    gasWanted: 3000000
  });
};

export {
  existsWallet,
  addEstablish,
  getAccount,
  doContractPackageFunction,
  sendToken,
};
