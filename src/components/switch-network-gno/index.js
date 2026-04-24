import React, { useState } from 'react';
import { Button, Card, Col, Input, Radio, Row } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { existsWallet } from '../../methods/injection';
import { GNO_NETWORKS, switchNetwork } from '../../methods/cosmos';
import { formatError } from '../../utils/json';

function SwitchNetworkGno() {
  const [network, setNetwork] = useState('mainnet');
  const [chainId, setChainId] = useState(GNO_NETWORKS.mainnet.chainId);
  const [response, setResponse] = useState('');

  const onChangeNetwork = (event) => {
    const next = event.target.value;
    setNetwork(next);
    setChainId(GNO_NETWORKS[next].chainId);
  };

  const onClickExecuteButton = () => {
    if (!existsWallet()) {
      return;
    }

    switchNetwork(chainId.trim())
      .then(res => setResponse(JSON.stringify(res, null, 2)))
      .catch(error => setResponse(formatError(error)));
  };

  return (
    <Card className="card" title="Switch Network (Gno)">
      <Row gutter={16}>
        <Col lg={6}>
          <span>Network: </span>
        </Col>
        <Col lg={18} flex>
          <Radio.Group value={network} onChange={onChangeNetwork}>
            <Radio value="mainnet">Mainnet (gnoland1)</Radio>
            <Radio value="testnet">Testnet (staging)</Radio>
          </Radio.Group>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col lg={6}>
          <span>Chain ID: </span>
        </Col>
        <Col lg={18} flex>
          <Input
            value={chainId}
            onChange={event => setChainId(event.target.value)}
            placeholder="e.g. gnoland1, staging, test12, dev"
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

export default SwitchNetworkGno;
