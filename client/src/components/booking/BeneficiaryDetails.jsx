import React from "react";
import { Form, Row, Col } from "react-bootstrap";

export default function BeneficiaryDetails({ formData, onChange, onFileChange }) {
    return (
        <>
            <h5 className="mt-4 mb-3">Beneficiary Details</h5>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                            name="beneficiaryName"
                            value={formData.beneficiaryName}
                            onChange={onChange}
                        />
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group className="mb-3">
                        <Form.Label>Gender</Form.Label>
                        <Form.Select
                            name="beneficiaryGender"
                            value={formData.beneficiaryGender}
                            onChange={onChange}
                        >
                            <option value="">Select Gender</option>
                            <option>Male</option>
                            <option>Female</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group className="mb-3">
                        <Form.Label>Relationship With Applicant</Form.Label>
                        <Form.Select
                            name="relationshipWithApplicant"
                            value={formData.relationshipWithApplicant}
                            onChange={onChange}
                        >
                            <option value="">Select Relationship</option>
                            <option>Mother</option>
                            <option>Father</option>
                            <option>Sibling</option>
                            <option>Relative</option>
                            <option>Other</option>
                        </Form.Select>
                    </Form.Group>
                </Col>

            </Row>

            <Row>
                <Col md={3}>
                    <Form.Group className="mb-3">
                        <Form.Label>Nationality</Form.Label>
                        <Form.Control
                            name="beneficiaryNationality"
                            value={formData.beneficiaryNationality}
                            onChange={onChange}
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>National ID (NRIC)</Form.Label>
                        <Form.Control
                            name="beneficiaryNRIC"
                            value={formData.beneficiaryNRIC}
                            onChange={onChange}
                        />
                    </Form.Group>
                </Col>

            </Row>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Birth Certificate</Form.Label>
                        <Form.Control
                            type="file"
                            name="birthCertFile"
                            onChange={(e) => onFileChange(e, "birthCert")}
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Death Certificate</Form.Label>
                        <Form.Control
                            type="file"
                            name="deathCertFile"
                            onChange={(e) => onFileChange(e, "deathCert")}
                        />
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group className="mb-3">
                        <Form.Label>Date of Birth</Form.Label>
                        <Form.Control
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={onChange}
                        />
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group className="mb-3">
                        <Form.Label>Date of Death</Form.Label>
                        <Form.Control
                            type="date"
                            name="dateOfDeath"
                            value={formData.dateOfDeath}
                            onChange={onChange}
                        />
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
                <Form.Label>Inscrption</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    name="inscription"
                    value={formData.inscription}
                    onChange={onChange}
                />
            </Form.Group>
        </>
    );
}
