import logo from './logo.svg';
import './app.css';
import AddEstablish from './components/add-establish';
import { Col, Row } from 'antd';
import CheckWallet from './components/check-wallet';
import GettingAccount from './components/getting-account';
import TokenTransfer from './components/token-transfer';
import PackageRequest from './components/package-request';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <img src={logo} className="app-logo" alt="logo" />
        <p>
          Dapp Examples
        </p>
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
      </main>
    </div>
  );
}

export default App;