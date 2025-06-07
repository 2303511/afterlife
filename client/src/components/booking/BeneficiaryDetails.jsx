import React from "react";
import { Form, Row, Col } from "react-bootstrap";

export default function BeneficiaryDetails({ formData, onChange }) {
    return (
        <>
            <h5 className="mt-4 mb-3">Beneficiary Details</h5>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>English Name</Form.Label>
                        <Form.Control
                            name="beneficiaryEnglishName"
                            value={formData.beneficiaryEnglishName}
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
                        <Form.Label>Death Certificate Number</Form.Label>
                        <Form.Control
                            name="deathCertNo"
                            value={formData.deathCertNo}
                            onChange={onChange}
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Cremate Certificate Number</Form.Label>
                        <Form.Control
                            name="cremateCertNo"
                            value={formData.cremateCertNo}
                            onChange={onChange}
                        />
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
                        />
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group className="mb-3">
                        <Form.Label>Date of Death</Form.Label>
                        <Form.Control
                            type="date"
                            name="dod"
                            value={formData.dod}
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
                <Form.Label>Remarks</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    name="beneficiaryRemarks"
                    value={formData.beneficiaryRemarks}
                    onChange={onChange}
                />
            </Form.Group>
        </>
    );
}
