import React, { useState } from 'react';
import { Button } from 'antd';
import { existsWallet } from '../../methods/injection';

function CheckWallet() {
  const [isExistWallet, setIsExistWallet] = useState(null);

  const buttonType = isExistWallet !== null ? "primary" : "default";

  const getButtonText = () => {
    if (isExistWallet) {
      return "Successfully connected to Adena wallet";
    }

    if (isExistWallet === false) {
      return "Failed to connect Adena wallet";
    }

    return "Check if wallet exists...";
  }

  const checkExistWallet = () => {
    const isExistWallet = existsWallet();
    setIsExistWallet(isExistWallet);
  }

  const onClickExecuteButton = () => {
    checkExistWallet();
  };

  return (
    <Button
      className='execute-button'
      type={buttonType}
      danger={isExistWallet === false}
      onClick={onClickExecuteButton}
    >
      {getButtonText()}
    </Button>
  );
}

export default CheckWallet;