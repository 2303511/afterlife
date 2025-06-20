import React from "react";
import { Form, Row, Col } from "react-bootstrap";

export default function ApplicantDetails({ formData, onChange, errors }) {
  return (
    <>
      <h5 className="mt-4 mb-3">Applicant Details</h5>

      <Row>
        <Col md={8}>
          <Form.Group className="mb-3">
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              name="fullName"
              value={formData.fullName}
              onChange={onChange}
              isInvalid={!!errors.fullName}
            />
            <Form.Control.Feedback type="invalid">
              {errors.fullName}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Date of Birth</Form.Label>
            <Form.Control
              type="date"
              name="dob"
              value={formData.dob}
              onChange={onChange}
              isInvalid={!!errors.dob}
              max={new Date().toISOString().split("T")[0]} // to make future dates unselectable
            />
            <Form.Control.Feedback type="invalid">
              {errors.dob}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Nationality</Form.Label>
            <Form.Control
              name="nationality"
              value={formData.nationality}
              onChange={onChange}
              isInvalid={!!errors.nationality}
            />
            <Form.Control.Feedback type="invalid">
              {errors.nationality}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>National ID (NRIC)</Form.Label>
            <Form.Control
              type="text"
              name="nationalID"
              value={formData.nationalID}
              onChange={onChange}
              isInvalid={!!errors.nationalID}
            />

            <Form.Control.Feedback type="invalid">
              {errors.nationalID}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Gender</Form.Label>
            <Form.Select
              name="gender"
              value={formData.gender}
              onChange={onChange}
              isInvalid={!!errors.gender}
            >
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.gender}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Mobile Number</Form.Label>
            <Form.Control
              type="text"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={onChange}
              isInvalid={!!errors.mobileNumber}
            />


            <Form.Control.Feedback type="invalid">
              {errors.mobileNumber}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Mailing Address</Form.Label>
            <Form.Control
              name="address"
              value={formData.address}
              onChange={onChange}
              isInvalid={!!errors.address}
            />
            <Form.Control.Feedback type="invalid">
              {errors.address}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Postal Code</Form.Label>
            <Form.Control
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={onChange}
              isInvalid={!!errors.postalCode}
            />

            <Form.Control.Feedback type="invalid">
              {errors.postalCode}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Unit Number</Form.Label>
            <Form.Control
              type="text"
              name="unitNumber"
              value={formData.unitNumber}
              onChange={onChange}
              isInvalid={!!errors.unitNumber}
            />
            <Form.Control.Feedback type="invalid">
              {errors.unitNumber}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label>Remarks</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="remarks"
          value={formData.remarks}
          onChange={onChange}
        />
        {/* Remarks is optional → no isInvalid needed */}
      </Form.Group>
    </>
  );
}
