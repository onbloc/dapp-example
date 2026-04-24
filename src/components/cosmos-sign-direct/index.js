import React, { useState } from 'react';
import { Button, Card, Col, Input, Radio, Row, Space } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { StargateClient } from '@cosmjs/stargate';
import { existsWallet } from '../../methods/injection';
import {
  ATOMONE_NETWORKS,
  buildDirectSignDoc,
  bytesToBase64,
  getCosmosKey,
  signCosmosDirect,
} from '../../methods/cosmos';

const DEFAULT_GAS = '200000';
const DEFAULT_FEE_AMOUNT = '5000';

function CosmosSignDirect() {
  const [network, setNetwork] = useState('testnet');
  const [chainId, setChainId] = useState(ATOMONE_NETWORKS.testnet.chainId);
  const [rpc, setRpc] = useState(ATOMONE_NETWORKS.testnet.rpc);
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('1000');
  const [denom, setDenom] = useState('uatone');
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
      const key = keyResponse.data;
      const signer = key.bech32Address;

      const client = await StargateClient.connect(rpc.trim());
      const account = await client.getAccount(signer);
      if (!account) {
        throw new Error(`Account not found on chain for ${signer}`);
      }

      const signDoc = buildDirectSignDoc({
        chainId: chainId.trim(),
        fromAddress: signer,
        toAddress: toAddress.trim(),
        amount,
        denom,
        pubkey: key.pubKey,
        accountNumber: account.accountNumber,
        sequence: account.sequence,
        gas: DEFAULT_GAS,
        feeAmount: DEFAULT_FEE_AMOUNT,
      });

      const signResponse = await signCosmosDirect(chainId.trim(), signer, signDoc);
      if (signResponse.status !== 'success' || !signResponse.data) {
        throw new Error(signResponse.message || 'cosmos.signDirect failed');
      }
      const { signed, signature } = signResponse.data;

      const rendered = {
        signed: {
          bodyBytes: bytesToBase64(signed.bodyBytes),
          authInfoBytes: bytesToBase64(signed.authInfoBytes),
          chainId: signed.chainId,
          accountNumber: String(signed.accountNumber),
        },
        signature,
      };
      setResponse(JSON.stringify(rendered, null, 2));
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
    <Card className="card" title="Cosmos — Sign Direct (MsgSend)">
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

export default CosmosSignDirect;
