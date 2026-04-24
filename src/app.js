import logo from './logo.svg';
import './app.css';
import AddEstablish from './components/add-establish';
import { Col, Row } from 'antd';
import CheckWallet from './components/check-wallet';
import GettingAccount from './components/getting-account';
import TokenTransfer from './components/token-transfer';
import PackageRequest from './components/package-request';
import QueryEval from './components/query-eval';
import CosmosEnable from './components/cosmos-enable';
import CosmosGetKey from './components/cosmos-get-key';
import CosmosSignDirect from './components/cosmos-sign-direct';
import CosmosSignAmino from './components/cosmos-sign-amino';
import CosmosOfflineSigner from './components/cosmos-offline-signer';
import AddEstablishMulti from './components/add-establish-multi';
import SwitchNetworkGno from './components/switch-network-gno';

function App() {
  return (
    <div className='app'>
      <header className='app-header'>
        <img src={logo} className='app-logo' alt='logo' />
        <p>Dapp Examples</p>
      </header>

      <main className='app-main'>
        <Row gutter={16}>
          <Col span={24}>
            <CheckWallet />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col lg={12}>
            <AddEstablish />
          </Col>
          <Col lg={12}>
            <GettingAccount />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col lg={12}>
            <TokenTransfer />
          </Col>
          <Col lg={12}>
            <PackageRequest />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col lg={12}>
            <QueryEval />
          </Col>
          <Col lg={12}>
            <QueryEval />
          </Col>
        </Row>

        <h2 className='section-title'>Cosmos / AtomOne</h2>

        <Row gutter={16}>
          <Col lg={12}>
            <CosmosEnable />
          </Col>
          <Col lg={12}>
            <CosmosGetKey />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col lg={12}>
            <CosmosSignDirect />
          </Col>
          <Col lg={12}>
            <CosmosSignAmino />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <CosmosOfflineSigner />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col lg={12}>
            <AddEstablishMulti />
          </Col>
          <Col lg={12}>
            <SwitchNetworkGno />
          </Col>
        </Row>
      </main>
    </div>
  );
}

export default App;
