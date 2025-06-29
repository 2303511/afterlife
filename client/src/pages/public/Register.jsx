import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";

import "bootstrap/dist/js/bootstrap.bundle.min";

export default function Register() {	
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
        password: ""
    });
    
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setForm({ ...form, [name]: value });
	};

	const navigate = useNavigate();
	const handleRegister = async () => {
        try {
            const response = await axios.post('/api/user/register', form, {
            headers: {
                "Content-Type": "application/json"
            }
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
			<form onSubmit={(e) => {e.preventDefault(); handleRegister();}}>
				<div className="row g-3">
					{/* username */}
					<div className="col-md-6">
						<label className="form-label">Username</label>
						<input type="text" className="form-control" name="username" value={form.username} onChange={handleInputChange} placeholder="Enter username" required />
					</div>

					{/* email */}
					<div className="col-md-6">
						<label className="form-label">Email</label>
						<input type="email" className="form-control" name="email" value={form.email} onChange={handleInputChange} placeholder="Enter email" required />
					</div>

					{/* full name */}
					<div className="col-md-6">
						<label className="form-label">Full Name</label>
						<input type="text" className="form-control" name="fullname" value={form.fullname} onChange={handleInputChange} placeholder="Enter full name" required />
					</div>

					{/* contact number */}
					<div className="col-md-6">
						<label className="form-label">Contact Number</label>
						<input type="tel" className="form-control" name="contactnumber" value={form.contactnumber} onChange={handleInputChange} placeholder="Enter contact number" required />
					</div>

					{/* NRIC */}
					<div className="col-md-6">
						<label className="form-label">NRIC</label>
						<input type="text" className="form-control" name="nric" value={form.nric} onChange={handleInputChange} placeholder="Enter NRIC" required />
					</div>

					{/* DOB */}
					<div className="col-md-6">
						<label className="form-label">Date of Birth</label>
						<input type="date" className="form-control" name="dob" value={form.dob} onChange={handleInputChange} required />
					</div>

					{/* nationality */}
					<div className="col-md-6">
						<label className="form-label">Nationality</label>
						<input type="text" className="form-control" name="nationality" value={form.nationality} onChange={handleInputChange} placeholder="Enter nationality" required />
					</div>

					{/* address */}
					<div className="col-md-6">
						<label className="form-label">Address</label>
						<input type="text" className="form-control" name="address" value={form.address} onChange={handleInputChange} placeholder="Enter address" required />
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
					</div>

					{/* password */}
					<div className="col-md-6">
						<label className="form-label">Password</label>
						<input type="password" className="form-control" name="password" value={form.password} onChange={handleInputChange} placeholder="Enter password" required />
					</div>

					{/* submit button (full width) */}
					<div className="col-12">
						<button type="submit" className="btn btn-primary w-100">Register</button>
					</div>
				</div>
			</form>
		</div>
	);
}
