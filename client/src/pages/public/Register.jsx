import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";

import "bootstrap/dist/js/bootstrap.bundle.min";

// natoinalities
import { nationalities } from "../../components/nationalities";

// validation
import { validateFormData } from '../../utils/validation';
import { registerRules, registerFieldLabels, } from '../../utils/validationRules';

export default function Register() {
	const [formErrors, setFormErrors] = useState({});

	const [form, setForm] = useState({
		username: "",
		email: "",
		fullname: "",
		contactnumber: "",
		nric: "",
		dob: "",
		nationality: "",
		address: "",
		gender: "",
		password: "",
		postalcode: "",
		unitnumber: ""
	});

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	  
		// Validate this field only
		const rule = registerRules[name];
		const label = registerFieldLabels[name];
		if (rule) {
		  let error = "";
	  
		  if (rule.required && !value.trim()) {
			error = `${label} is required`;
		  } else if (rule.pattern && value && !rule.pattern.test(value)) {
			error = rule.message || `${label} is invalid`;
		  }
	  
		  setFormErrors((prevErrors) => ({
			...prevErrors,
			[name]: error
		  }));
		}
	  };
	  

	const navigate = useNavigate();
	const handleRegister = async () => {
		const errors = validateFormData(form, registerRules, registerFieldLabels);
		if (Object.keys(errors).length > 0) {
			setFormErrors(errors);
			return;
		}

		try {
			const response = await axios.post("/api/user/register", form, {
				headers: { "Content-Type": "application/json" }
			});

			console.log("Registration successful!");
			navigate("/login");
			return response.data;
		} catch (error) {
			console.error("Failed to register user:", error);
			return null;
		}
	};


	return (
		<div className="container mt-5">
			<h2 className="text-center mb-4">Register</h2>
			<form onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
				<div className="row g-3">
					<h5>Personal Details</h5>
					{/* username */}
					<div className="col-md-4">
						<label className="form-label">Username</label>
						<input type="text" className="form-control" name="username" value={form.username} onChange={handleInputChange} placeholder="Enter username"/>
						{formErrors.username && <div className="text-danger">{formErrors.username}</div>}
					</div>

					{/* full name */}
					<div className="col-md-4">
						<label className="form-label">Full Name</label>
						<input type="text" className="form-control" name="fullname" value={form.fullname} onChange={handleInputChange} placeholder="Enter full name"/>
						{formErrors.fullname && <div className="text-danger">{formErrors.fullname}</div>}
					</div>

					{/* email */}
					<div className="col-md-4">
						<label className="form-label">Email</label>
						<input type="email" className="form-control" name="email" value={form.email} onChange={handleInputChange} placeholder="Enter email"/>
						{formErrors.email && <div className="text-danger">{formErrors.email}</div>}
					</div>

					{/* NRIC */}
					<div className="col-md-6">
						<label className="form-label">NRIC</label>
						<input type="text" className="form-control" name="nric" value={form.nric} onChange={handleInputChange} placeholder="Enter NRIC"/>
						{formErrors.nric && <div className="text-danger">{formErrors.nric}</div>}
					</div>

					{/* gender */}
					<div className="col-md-6">
						<label className="form-label">Gender</label>
						<div className="d-flex align-items-center" style={{ gap: "1rem" }}>
							<div className="form-check">
								<input className="form-check-input" type="radio" name="gender" id="male" value="Male" checked={form.gender === "Male"} onChange={handleInputChange} />
								<label className="form-check-label" htmlFor="male">Male</label>
							</div>
							<div className="form-check">
								<input className="form-check-input" type="radio" name="gender" id="female" value="Female" checked={form.gender === "Female"} onChange={handleInputChange} />
								<label className="form-check-label" htmlFor="female">Female</label>
							</div>
						</div>
						{formErrors.gender && <div className="text-danger">{formErrors.gender}</div>}
					</div>

					{/* contact number */}
					<div className="col-md-6">
						<label className="form-label">Contact Number</label>
						<input type="tel" className="form-control" name="contactnumber" value={form.contactnumber} onChange={handleInputChange} placeholder="Enter contact number"/>
						{formErrors.contactnumber && <div className="text-danger">{formErrors.contactnumber}</div>}
					</div>

					{/* DOB */}
					<div className="col-md-6">
						<label className="form-label">Date of Birth</label>
						<input type="date" className="form-control" name="dob" value={form.dob} max={new Date().toISOString().split("T")[0]} onChange={handleInputChange}/>
						{formErrors.dob && <div className="text-danger">{formErrors.dob}</div>}
					</div>

					{/* nationality */}
					<div className="col-md-6">
						<label className="form-label">Nationality</label>
						<select
							className="form-select"
							name="nationality"
							value={form.nationality}
							onChange={handleInputChange}
						>
							<option value="">-- Select Nationality --</option>
							{nationalities.map((nation, index) => (
								<option key={index} value={nation}>
									{nation}
								</option>
							))}
						</select>
						{formErrors.nationality && <div className="text-danger">{formErrors.nationality}</div>}
					</div>

					{/* password */}
					<div className="col-md-6">
						<label className="form-label">Password</label>
						<input
							type="password"
							className="form-control"
							name="password"
							value={form.password}
							onChange={handleInputChange}
							placeholder="Enter password"
						/>
						{formErrors.password && <div className="text-danger">{formErrors.password}</div>}
					</div>

					{/* address */}
					<div className="col-md-12">
						<label className="form-label">Address</label>
						<input type="text" className="form-control" name="address" value={form.address} onChange={handleInputChange} placeholder="Enter address"/>
						{formErrors.address && <div className="text-danger">{formErrors.address}</div>}
					</div>

					<div className="row">
						<div className="col-md-6">
							<label className="form-label">Postal Code</label>
							<input type="text" className="form-control" name="postalcode" value={form.postalcode} onChange={handleInputChange} placeholder="Enter postal code"/>
							{formErrors.postalcode && <div className="text-danger">{formErrors.postalcode}</div>}
						</div>
						<div className="col-md-6">
							<label className="form-label">Unit Number</label>
							<input type="text" className="form-control" name="unitnumber" value={form.unitnumber} onChange={handleInputChange} placeholder="Enter unit number"/>
							{formErrors.unitnumber && <div className="text-danger">{formErrors.unitnumber}</div>}
						</div>
					</div>


					{/* submit button (full width) */}
					<div className="col-12 pt-4">
						<button type="submit" className="btn btn-primary w-100">Register</button>
					</div>
				</div>
			</form>
		</div>
	);
}
