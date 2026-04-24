import React from 'react';
import { Button, Col, Input, Row, Space } from 'antd';

export const FormRow = ({ label, value, onChange, placeholder }) => (
  <Row gutter={16}>
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

export const AddressRow = ({ label, value, onChange, onGetAccount, placeholder }) => (
  <Row gutter={16}>
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
        <Button onClick={() => onGetAccount(onChange)}>Get Account</Button>
      </Space.Compact>
    </Col>
  </Row>
);
