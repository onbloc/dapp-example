import React, { useState } from 'react';
import { Button, Card, Col, Input, Radio, Row, Space } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { StargateClient } from '@cosmjs/stargate';
import { existsWallet } from '../../methods/injection';
import {
  ATOMONE_NETWORKS,
  buildAminoSignDoc,
  getCosmosKey,
  signCosmosAmino,
} from '../../methods/cosmos';

const DEFAULT_GAS = '200000';
const DEFAULT_FEE_AMOUNT = '5000';

function CosmosSignAmino() {
  const [network, setNetwork] = useState('testnet');
  const [chainId, setChainId] = useState(ATOMONE_NETWORKS.testnet.chainId);
  const [rpc, setRpc] = useState(ATOMONE_NETWORKS.testnet.rpc);
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('1000');
  const [denom, setDenom] = useState('uatone');
  const [memo, setMemo] = useState('');
  const [response, setResponse] = useState('');
  const [busy, setBusy] = useState(false);

  const onChangeNetwork = (event) => {
    const next = event.target.value;
    setNetwork(next);
    setChainId(ATOMONE_NETWORKS[next].chainId);
    setRpc(ATOMONE_NETWORKS[next].rpc);
  };

  const handleGetAccount = async (setter) => {
    if (!existsWallet()) {
      return;
    }
    try {
      const res = await getCosmosKey(chainId.trim());
      if (res?.status === 'success' && res.data?.bech32Address) {
        setter(res.data.bech32Address);
      } else {
        setResponse(JSON.stringify(res, null, 2));
      }
    } catch (error) {
      setResponse(JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    }
  };

  const onClickExecuteButton = async () => {
    if (!existsWallet()) {
      return;
    }
    if (!rpc.trim()) {
      setResponse('RPC URL is required.');
      return;
    }

    setBusy(true);
    try {
      const keyResponse = await getCosmosKey(chainId.trim());
      if (keyResponse.status !== 'success' || !keyResponse.data) {
        throw new Error(keyResponse.message || 'cosmos.getKey failed');
      }
      const signer = keyResponse.data.bech32Address;

      const client = await StargateClient.connect(rpc.trim());
      const account = await client.getAccount(signer);
      if (!account) {
        throw new Error(`Account not found on chain for ${signer}`);
      }

      const signDoc = buildAminoSignDoc({
        chainId: chainId.trim(),
        fromAddress: signer,
        toAddress: toAddress.trim(),
        amount,
        denom,
        accountNumber: account.accountNumber,
        sequence: account.sequence,
        gas: DEFAULT_GAS,
        feeAmount: DEFAULT_FEE_AMOUNT,
        memo,
      });

      const res = await signCosmosAmino(chainId.trim(), signer, signDoc);
      setResponse(JSON.stringify(res, null, 2));
    } catch (error) {
      setResponse(JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    } finally {
      setBusy(false);
    }
  };

  const renderRow = (label, value, onChange, placeholder) => (
    <Row gutter={16} key={label}>
      <Col lg={6}>
        <span>{label}: </span>
      </Col>
      <Col lg={18} flex>
        <Input
          value={value}
          onChange={event => onChange(event.target.value)}
          placeholder={placeholder}
        />
      </Col>
    </Row>
  );

  const renderAddressRow = (label, value, onChange, placeholder) => (
    <Row gutter={16} key={label}>
      <Col lg={6}>
        <span>{label}: </span>
      </Col>
      <Col lg={18} flex>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            value={value}
            onChange={event => onChange(event.target.value)}
            placeholder={placeholder}
          />
          <Button onClick={() => handleGetAccount(onChange)}>Get Account</Button>
        </Space.Compact>
      </Col>
    </Row>
  );

  return (
    <Card className="card" title="Cosmos — Sign Amino (MsgSend)">
      <Row gutter={16}>
        <Col lg={6}>
          <span>Network: </span>
        </Col>
        <Col lg={18} flex>
          <Radio.Group value={network} onChange={onChangeNetwork}>
            <Radio value="mainnet">Mainnet</Radio>
            <Radio value="testnet">Testnet</Radio>
          </Radio.Group>
        </Col>
      </Row>

      {renderRow('Chain ID', chainId, setChainId)}
      {renderRow('RPC URL', rpc, setRpc)}
      {renderAddressRow('To Address', toAddress, setToAddress)}
      {renderRow('Amount', amount, setAmount)}
      {renderRow('Denom', denom, setDenom)}
      {renderRow('Memo', memo, setMemo)}

      <Button
        className="execute-button"
        type="primary"
        ghost
        loading={busy}
        onClick={onClickExecuteButton}
      >
        Execute
      </Button>

      <hr />

      <TextArea
        value={response}
        autoSize={{ minRows: 5, maxRows: 15 }}
        readOnly
      />
    </Card>
  );
}

export default CosmosSignAmino;
