import React, { useState } from "react";
import { Button, Card, Col, Input, Row } from "antd";

import { existsWallet, sendToken } from "../../methods/injection";
import TextArea from "antd/es/input/TextArea";

function TokenTransfer() {
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");
  const [response, setResponse] = useState("");

  const onClickExecuteButton = () => {
    if (!existsWallet()) {
      return;
    }

    sendToken(fromAddress, toAddress, tokenAmount)
      .then(response => setResponse(JSON.stringify(response, null, 2)))
      .catch(error => console.error(error))
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
          <Input
            value={fromAddress}
            onChange={event => setFromAddress(event.target.value)}
          />
        </Col>
      </Row>

      {/* To Address Input Row */}
      <Row gutter={16}>
        <Col lg={6}>
          <span>To Address: </span>
        </Col>
        <Col lg={18} flex>
          <Input
            value={toAddress}
            onChange={event => setToAddress(event.target.value)}
          />
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