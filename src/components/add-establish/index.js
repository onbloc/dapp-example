import React, { useState } from 'react';
import { Button, Card, Col, Input, Row } from 'antd';
import { addEstablish, existsWallet } from '../../methods/injection';
import TextArea from 'antd/es/input/TextArea';

function AddEstablish() {
  const [siteName, setSiteName] = useState("");
  const [response, setResponse] = useState("");

  const onClickExecuteButton = () => {
    if (!existsWallet()) {
      return;
    }

    addEstablish(siteName)
      .then(response => setResponse(JSON.stringify(response, null, 2)))
      .catch(error => console.error(error))
  };

  return (
    <Card
      className="card"
      title="Add Establish"
    >
      <Row gutter={16}>
        <Col lg={6}>
          <span>Site Name: </span>
        </Col>
        <Col lg={18} flex>
          <Input
            value={siteName}
            onChange={event => setSiteName(event.target.value)}
          />
        </Col>
      </Row>

      <Button
        className='execute-button'
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

export default AddEstablish;