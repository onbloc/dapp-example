import React, { useState } from "react";
import { Button, Card, Col, Input, Row } from "antd";

import { existsWallet, doContractPackageFunction } from "../../methods/injection";
import TextArea from "antd/es/input/TextArea";

function PackageRequest() {
  const [caller, setCaller] = useState("");
  const [func, setFunc] = useState("");
  const [pkgPath, setPkgPath] = useState("");
  const [argument, setArgument] = useState("");
  const [response, setResponse] = useState("");

  const onClickExecuteButton = () => {
    if (!existsWallet()) {
      return;
    }

    doContractPackageFunction(caller, func, pkgPath, argument)
      .then(response => setResponse(JSON.stringify(response, null, 2)))
      .catch(error => console.error(error))
  };

  return (
    <Card
      className="card"
      title="Executing Package Function"
    >
      {/* Caller Input Row */}
      <Row gutter={16}>
        <Col lg={6}>
          <span>caller: </span>
        </Col>
        <Col lg={18} flex>
          <Input
            value={caller}
            onChange={event => setCaller(event.target.value)}
          />
        </Col>
      </Row>

      {/* Func Input Row */}
      <Row gutter={16}>
        <Col lg={6}>
          <span>func: </span>
        </Col>
        <Col lg={18} flex>
          <Input
            value={func}
            onChange={event => setFunc(event.target.value)}
          />
        </Col>
      </Row>

      {/* PkgPath Input Row */}
      <Row gutter={16}>
        <Col lg={6}>
          <span>pkgPath: </span>
        </Col>
        <Col lg={18} flex>
          <Input
            value={pkgPath}
            onChange={event => setPkgPath(event.target.value)}
          />
        </Col>
      </Row>

      {/* Argument Input Row */}
      <Row gutter={16}>
        <Col lg={6}>
          <span>argument: </span>
        </Col>
        <Col lg={18} flex>
          <Input
            value={argument}
            onChange={event => setArgument(event.target.value)}
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

export default PackageRequest;