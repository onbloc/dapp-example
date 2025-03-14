import React, { useState } from 'react';
import { Button, Card, Col, Input, Row } from 'antd';

import { fetchQueryEval } from '../../methods/fetch';
import TextArea from 'antd/es/input/TextArea';

function QueryEval() {
  const [rpcUrl, setRpcUrl] = useState('');
  const [packagePath, setPackagePath] = useState('');
  const [functionName, setFunctionName] = useState('');
  const [args, setArgs] = useState('');
  const [response, setResponse] = useState('');

  const onClickExecuteButton = () => {
    fetchQueryEval(rpcUrl, packagePath, functionName, args)
      .then((response) => setResponse(response))
      .catch((error) => console.error(error));
  };

  return (
    <Card className='card' title='VM Query Eval'>
      {/* RPC Url Input Row */}
      <Row gutter={16}>
        <Col lg={6}>
          <span class='column-key'>RPC Url: </span>
        </Col>
        <Col lg={18} flex>
          <Input value={rpcUrl} onChange={(event) => setRpcUrl(event.target.value)} />
        </Col>
      </Row>

      {/* Package Path Input Row */}
      <Row gutter={16}>
        <Col lg={6}>
          <span class='column-key'>Pkg Path: </span>
        </Col>
        <Col lg={18} flex>
          <Input value={packagePath} onChange={(event) => setPackagePath(event.target.value)} />
        </Col>
      </Row>

      {/* Function Name Input Row */}
      <Row gutter={16}>
        <Col lg={6}>
          <span class='column-key'>Func Name: </span>
        </Col>
        <Col lg={18} flex>
          <Input value={functionName} onChange={(event) => setFunctionName(event.target.value)} />
        </Col>
      </Row>

      {/* Arguments Input Row */}
      <Row gutter={16}>
        <Col lg={6}>
          <span class='column-key'>Arguments: </span>
        </Col>
        <Col lg={18} flex>
          <Input value={args} onChange={(event) => setArgs(event.target.value)} />
        </Col>
      </Row>

      <Button className='execute-button' type='primary' ghost onClick={onClickExecuteButton}>
        Execute
      </Button>

      <hr />

      <TextArea value={response} autoSize={{ minRows: 5, maxRows: 10 }} readOnly />
    </Card>
  );
}

export default QueryEval;
