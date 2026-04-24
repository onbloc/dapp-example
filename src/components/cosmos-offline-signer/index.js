import React, { useState } from 'react';
import { Button, Card, Col, Radio, Row } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { SigningStargateClient, GasPrice } from '@cosmjs/stargate';
import { existsWallet } from '../../methods/injection';
import { ATOMONE_NETWORKS, getCosmosOfflineSigner } from '../../methods/cosmos';
import { formatError, stringify } from '../../utils/json';
import { FormRow, AddressRow } from '../_shared/form-rows';
import { handleCosmosGetAccount } from '../_shared/cosmos-account';

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

    const onGetAccount = (setter) =>
        handleCosmosGetAccount({ chainId, setter, setResponse });

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
            setResponse(formatError(error));
        } finally {
            setBusy(false);
        }
    };

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

            <FormRow label="Chain ID" value={chainId} onChange={setChainId} />
            <FormRow label="RPC URL" value={rpc} onChange={setRpc} />
            <AddressRow
                label="From Address"
                value={fromAddress}
                onChange={setFromAddress}
                onGetAccount={onGetAccount}
                placeholder="blank = use connected key"
            />
            <AddressRow
                label="To Address"
                value={toAddress}
                onChange={setToAddress}
                onGetAccount={onGetAccount}
            />
            <FormRow label="Amount" value={amount} onChange={setAmount} />
            <FormRow label="Denom" value={denom} onChange={setDenom} />
            <FormRow label="Gas Price" value={gasPrice} onChange={setGasPrice} placeholder="0.025uphoton" />
            <FormRow label="Memo" value={memo} onChange={setMemo} />

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
