import React, { useState } from 'react';
import { Button, Card, Col, Input, Radio, Row, Space } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { SigningStargateClient, GasPrice } from '@cosmjs/stargate';
import { existsWallet } from '../../methods/injection';
import { ATOMONE_NETWORKS, getCosmosKey, getCosmosOfflineSigner } from '../../methods/cosmos';
import { stringify } from '../../utils/json';

function CosmosOfflineSigner() {
    const [network, setNetwork] = useState('testnet');
    const [chainId, setChainId] = useState(ATOMONE_NETWORKS.testnet.chainId);
    const [rpc, setRpc] = useState(ATOMONE_NETWORKS.testnet.rpc);
    const [fromAddress, setFromAddress] = useState('');
    const [toAddress, setToAddress] = useState('');
    const [amount, setAmount] = useState('1000');
    const [denom, setDenom] = useState('uatone');
    const [gasPrice, setGasPrice] = useState('0.025uphoton');
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
            const offlineSigner = await getCosmosOfflineSigner(chainId.trim());
            const client = await SigningStargateClient.connectWithSigner(
                rpc.trim(),
                offlineSigner,
                { gasPrice: GasPrice.fromString(gasPrice.trim()) },
            );

            let sender = fromAddress.trim();
            if (!sender) {
                const accounts = await offlineSigner.getAccounts();
                sender = accounts[0].address;
            }

            const result = await client.sendTokens(
                sender,
                toAddress.trim(),
                [{ denom, amount: String(amount) }],
                'auto',
                memo,
            );
            setResponse(stringify(result));
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
        <Card className="card" title="Cosmos — OfflineSigner End-to-End (MsgSend)">
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
            {renderAddressRow('From Address', fromAddress, setFromAddress, 'blank = use connected key')}
            {renderAddressRow('To Address', toAddress, setToAddress)}
            {renderRow('Amount', amount, setAmount)}
            {renderRow('Denom', denom, setDenom)}
            {renderRow('Gas Price', gasPrice, setGasPrice, '0.025uphoton')}
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

export default CosmosOfflineSigner;
