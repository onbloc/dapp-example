import React, { useState } from 'react';
import { Button, Card, Col, Input, Row } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { existsWallet } from '../../methods/injection';
import { addEstablishMulti } from '../../methods/cosmos';

function AddEstablishMulti() {
  const [siteName, setSiteName] = useState('');
  const [chainIds, setChainIds] = useState('');
  const [response, setResponse] = useState('');

  const onClickExecuteButton = () => {
    if (!existsWallet()) {
      return;
    }

    const parsed = chainIds
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    addEstablishMulti(siteName, parsed.length ? parsed : undefined)
      .then(res => setResponse(JSON.stringify(res, null, 2)))
      .catch(error => setResponse(JSON.stringify(error, null, 2)));
  };

  return (
    <Card className="card" title="AddEstablish — Multi Chain (Gno + AtomOne)">
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

      <Row gutter={16}>
        <Col lg={6}>
          <span>Chain IDs: </span>
        </Col>
        <Col lg={18} flex>
          <Input
            value={chainIds}
            onChange={event => setChainIds(event.target.value)}
            placeholder="gnoland1, atomone-1 (cross-protocol OK; blank = current chainGroup)"
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

export default AddEstablishMulti;
