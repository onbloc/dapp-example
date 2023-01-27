import React, { useState } from "react";
import { Button, Card, Col, Row } from "antd";
import { existsWallet, getAccount } from "../../methods/injection";
import TextArea from "antd/es/input/TextArea";

function GettingAccount() {
  const [response, setResponse] = useState("");

  const onClickExecuteButton = () => {
    if (!existsWallet()) {
      return;
    }

    getAccount()
      .then(response => setResponse(JSON.stringify(response, null, 2)))
      .catch(error => console.error(error))
  };

  return (
    <Card
      className="card"
      title="Getting Account Information"
    >
      <Row gutter={16}>
        <Col span={24}>
          -
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

export default GettingAccount;