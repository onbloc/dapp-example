import React, { useState } from 'react';
import { Button, Card, Col, Input, Row } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { existsWallet } from '../../methods/injection';
import { enableCosmos } from '../../methods/cosmos';

function CosmosEnable() {
  const [chainIds, setChainIds] = useState('atomone-testnet-1');
  const [response, setResponse] = useState('');

  const onClickExecuteButton = () => {
    if (!existsWallet()) {
      return;
    }

    // Accept either a single chainId or a comma-separated list.
    const parsed = chainIds.includes(',')
      ? chainIds.split(',').map(s => s.trim()).filter(Boolean)
      : chainIds.trim();

    enableCosmos(parsed)
      .then(res => setResponse(JSON.stringify(res, null, 2)))
      .catch(error => setResponse(JSON.stringify(error, null, 2)));
  };

  return (
    <Card className="card" title="Cosmos — Enable">
      <Row gutter={16}>
        <Col lg={6}>
          <span>Chain IDs: </span>
        </Col>
        <Col lg={18} flex>
          <Input
            value={chainIds}
            onChange={event => setChainIds(event.target.value)}
            placeholder="atomone-testnet-1 or atomone-1,atomone-testnet-1"
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

export default CosmosEnable;
