import React, { useState } from 'react';
import { Button, Card, Col, Input, Row } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { existsWallet } from '../../methods/injection';
import { bytesToBase64, getCosmosKey } from '../../methods/cosmos';

function CosmosGetKey() {
  const [chainId, setChainId] = useState('atomone-testnet-1');
  const [response, setResponse] = useState('');

  const onClickExecuteButton = () => {
    if (!existsWallet()) {
      return;
    }

    getCosmosKey(chainId.trim())
      .then(res => {
        // Response wrapper: { status, code, type, message, data: Key }.
        // pubKey / address are Uint8Array — render as base64 for readability.
        const data = res && res.data;
        const rendered = data
          ? {
              ...res,
              data: {
                ...data,
                pubKey: data.pubKey ? bytesToBase64(data.pubKey) : data.pubKey,
                address: data.address ? bytesToBase64(data.address) : data.address,
              },
            }
          : res;
        setResponse(JSON.stringify(rendered, null, 2));
      })
      .catch(error => setResponse(JSON.stringify(error, Object.getOwnPropertyNames(error), 2)));
  };

  return (
    <Card className="card" title="Cosmos — Get Key">
      <Row gutter={16}>
        <Col lg={6}>
          <span>Chain ID: </span>
        </Col>
        <Col lg={18} flex>
          <Input
            value={chainId}
            onChange={event => setChainId(event.target.value)}
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

export default CosmosGetKey;
