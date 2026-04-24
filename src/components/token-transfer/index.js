import React, { useState } from "react";
import { Button, Card, Col, Input, Row, Space } from "antd";

import { existsWallet, getAccount, sendToken } from "../../methods/injection";
import TextArea from "antd/es/input/TextArea";
import { formatError } from "../../utils/json";

function TokenTransfer() {
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");
  const [tokenDenom, setTokenDenom] = useState("ugnot");
  const [response, setResponse] = useState("");

  const onClickExecuteButton = () => {
    if (!existsWallet()) {
      return;
    }

    const sendAmount = `${tokenAmount.trim()}${tokenDenom.trim()}`;
    sendToken(fromAddress, toAddress, sendAmount)
      .then(response => setResponse(JSON.stringify(response, null, 2)))
      .catch(error => setResponse(formatError(error)))
  };

  const handleGetAccount = async (setter) => {
    if (!existsWallet()) {
      return;
    }
    try {
      const res = await getAccount();
      const address = res?.data?.address;
      if (address) {
        setter(address);
      } else {
        setResponse(JSON.stringify(res, null, 2));
      }
    } catch (error) {
      setResponse(formatError(error));
    }
  };

  return (
    <Card
      className="card"
      title="Token Transfer"
    >
      {/* From Address Input Row */}
      <Row gutter={16}>
        <Col lg={6}>
          <span>From Address: </span>
        </Col>
        <Col lg={18} flex>
          <Space.Compact style={{ width: '100%' }}>
            <Input
              value={fromAddress}
              onChange={event => setFromAddress(event.target.value)}
            />
            <Button onClick={() => handleGetAccount(setFromAddress)}>Get Account</Button>
          </Space.Compact>
        </Col>
      </Row>

      {/* To Address Input Row */}
      <Row gutter={16}>
        <Col lg={6}>
          <span>To Address: </span>
        </Col>
        <Col lg={18} flex>
          <Space.Compact style={{ width: '100%' }}>
            <Input
              value={toAddress}
              onChange={event => setToAddress(event.target.value)}
            />
            <Button onClick={() => handleGetAccount(setToAddress)}>Get Account</Button>
          </Space.Compact>
        </Col>
      </Row>

      {/* Token Amount Input Row */}
      <Row gutter={16}>
        <Col lg={6}>
          <span>Token Amount: </span>
        </Col>
        <Col lg={18} flex>
          <Input
            value={tokenAmount}
            onChange={event => setTokenAmount(event.target.value)}
          />
        </Col>
      </Row>

      {/* Token Denom Input Row */}
      <Row gutter={16}>
        <Col lg={6}>
          <span>Token Denom: </span>
        </Col>
        <Col lg={18} flex>
          <Input
            value={tokenDenom}
            onChange={event => setTokenDenom(event.target.value)}
            placeholder="ugnot"
          />
        </Col>
      </Row>

      <Button
        className="execute-button"
        type="primary"
        ghost
        onClick={onClickExecuteButton}
      >
        Execute
      </Button>

      <hr />

      <TextArea
        value={response}
        autoSize={{ minRows: 5, maxRows: 10 }}
        readOnly
      />
    </Card>
  );
}

export default TokenTransfer;