import React from "react";
import { Form, Row, Col } from "react-bootstrap";

export default function BeneficiaryDetails({ formData, onChange, onFileChange, errors, bookingType }) {
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
                            isInvalid={!!errors.beneficiaryName}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.beneficiaryName}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>

                <Col md={3}>
                    <Form.Group className="mb-3">
                        <Form.Label>Gender</Form.Label>
                        <Form.Select
                            name="beneficiaryGender"
                            value={formData.beneficiaryGender}
                            onChange={onChange}
                            isInvalid={!!errors.beneficiaryGender}
                        >
                            <option value="">Select Gender</option>
                            <option>Male</option>
                            <option>Female</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            {errors.beneficiaryGender}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>

                <Col md={3}>
                    <Form.Group className="mb-3">
                        <Form.Label>Relationship With Applicant</Form.Label>
                        <Form.Select
                            name="relationshipWithApplicant"
                            value={formData.relationshipWithApplicant}
                            onChange={onChange}
                            isInvalid={!!errors.relationshipWithApplicant}
                        >
                            <option value="">Select Relationship</option>
                            <option>Mother</option>
                            <option>Father</option>
                            <option>Sibling</option>
                            <option>Relative</option>
                            <option>Other</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            {errors.relationshipWithApplicant}
                        </Form.Control.Feedback>
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
                            isInvalid={!!errors.beneficiaryNationality}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.beneficiaryNationality}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>

                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>National ID (NRIC)</Form.Label>
                        <Form.Control
                            type="text"
                            name="beneficiaryNRIC"
                            value={formData.beneficiaryNRIC}
                            onChange={onChange}
                            isInvalid={!!errors.beneficiaryNRIC}
                        />

                        <Form.Control.Feedback type="invalid">
                            {errors.beneficiaryNRIC}
                        </Form.Control.Feedback>
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
                            isInvalid={!!errors.birthCertFile}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.birthCertFile}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>

                <Col md={6}>
                    {bookingType === "Current" && (
                        <Form.Group className="mb-3">
                            <Form.Label>Death Certificate</Form.Label>
                            <Form.Control
                                type="file"
                                name="deathCertFile"
                                onChange={(e) => onFileChange(e, "deathCert")}
                                isInvalid={!!errors.deathCertFile}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.deathCertFile}
                            </Form.Control.Feedback>
                        </Form.Group>
                    )}


                </Col>
            </Row>

            <Row>
                <Col md={3}>
                    <Form.Group className="mb-3">
                        <Form.Label>Date of Birth</Form.Label>
                        <Form.Control
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={onChange}
                            isInvalid={!!errors.dateOfBirth}
                            max={new Date().toISOString().split("T")[0]} // to make future dates unselectable
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.dateOfBirth}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>

                {bookingType === "Current" && (
                    <Col md={3}>
                        <Form.Group className="mb-3">
                            <Form.Label>Date of Death</Form.Label>
                            <Form.Control
                                type="date"
                                name="dateOfDeath"
                                value={formData.dateOfDeath}
                                onChange={onChange}
                                isInvalid={!!errors.dateOfDeath}
                                max={new Date().toISOString().split("T")[0]}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.dateOfDeath}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                )}

            </Row>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Mailing Address</Form.Label>
                        <Form.Control
                            name="beneficiaryAddress"
                            value={formData.beneficiaryAddress}
                            onChange={onChange}
                            isInvalid={!!errors.beneficiaryAddress}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.beneficiaryAddress}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>

                <Col md={3}>
                    <Form.Group className="mb-3">
                        <Form.Label>Postal Code</Form.Label>
                        <Form.Control
                            type="text"
                            name="beneficiaryPostalCode"
                            value={formData.beneficiaryPostalCode}
                            onChange={onChange}
                            isInvalid={!!errors.beneficiaryPostalCode}
                        />

                        <Form.Control.Feedback type="invalid">
                            {errors.beneficiaryPostalCode}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>

                <Col md={3}>
                    <Form.Group className="mb-3">
                        <Form.Label>Unit Number</Form.Label>
                        <Form.Control
                            type="text"
                            name="beneficiaryUnitNumber"
                            value={formData.beneficiaryUnitNumber}
                            onChange={onChange}
                            isInvalid={!!errors.beneficiaryUnitNumber}
                        />

                        <Form.Control.Feedback type="invalid">
                            {errors.beneficiaryUnitNumber}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>

            {bookingType === "Current" && (
                <Form.Group className="mb-3">
                    <Form.Label>Inscription</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        name="inscription"
                        value={formData.inscription}
                        onChange={onChange}
                    />
                </Form.Group>
            )}

        </>
    );
}
