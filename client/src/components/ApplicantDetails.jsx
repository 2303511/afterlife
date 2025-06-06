import React, { useState } from "react";
import { Button, Form, Row, Col } from "react-bootstrap";

export default function ApplicantDetails({ formData, onChange }) {
    return (
      <>
        <h5 className="mt-4 mb-3">Applicant Details</h5>
        <Row>
          <Col md={8}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control name="fullName" value={formData.fullName} onChange={onChange} />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Nationality</Form.Label>
              <Form.Control name="nationality" value={formData.nationality} onChange={onChange} />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>National ID (NRIC)</Form.Label>
              <Form.Control name="nationalID" value={formData.nationalID} onChange={onChange} />
            </Form.Group>
          </Col>
        </Row>

        <Row>
        <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Gender</Form.Label>
              <Form.Select name="gender" value={formData.gender} onChange={onChange}>
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Mobile Number</Form.Label>
              <Form.Control name="homePhone" value={formData.mobileNumber} onChange={onChange} />
            </Form.Group>
          </Col>
          
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Mailing Address</Form.Label>
              <Form.Control name="address" value={formData.address} onChange={onChange} />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Postal Code</Form.Label>
              <Form.Control name="postalCode" value={formData.postalCode} onChange={onChange} />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Unit Number</Form.Label>
              <Form.Control name="unitNumber" value={formData.unitNumber} onChange={onChange} />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Remarks</Form.Label>
          <Form.Control as="textarea" rows={3} name="remarks" value={formData.remarks} onChange={onChange} />
        </Form.Group>
      </>
    );
  }
  