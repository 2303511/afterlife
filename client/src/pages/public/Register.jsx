// src/pages/Register.jsx

import React, { useState, useEffect  } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { nationalities } from "../../components/nationalities";

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
    password: "",
    postalcode: "",
    unitnumber: ""
  });

  const navigate = useNavigate();

  //recaptcha variables
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  // Load reCAPTCHA script
  useEffect(() => {
      const loadRecaptcha = () => {
          const script = document.createElement('script');
          script.src = 'https://www.google.com/recaptcha/api.js?render=6LcNiHIrAAAAADOLYumj1n6TlcxjTgjE6c55J0YO';
          script.addEventListener('load', () => {
              setRecaptchaLoaded(true);
          });
          document.body.appendChild(script);
      };

      if (!window.grecaptcha) {
          loadRecaptcha();
      } else {
          setRecaptchaLoaded(true);
      }

      return () => {
          // Cleanup if needed
      };
  }, []);



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    //check if recaptcha is loaded, gonna call it ltr
		if (!recaptchaLoaded) {
      console.error("reCAPTCHA not loaded yet");
      return;
    }



    try {
      // Get reCAPTCHA token // this site key can be exposed
      const token = await window.grecaptcha.execute('6LcNiHIrAAAAADOLYumj1n6TlcxjTgjE6c55J0YO', { action: 'register' });
			console.log("Got the token sending to backend now")


      await axios.post(
        "/api/user/register",
        {...form,recaptchaToken: token},
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true
        }
      );
      navigate("/login");
    } catch (error) {
      console.error("Failed to register user:", error);
      // you might show a toast or set an error state here
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "700px" }}>
      <h2 className="text-center mb-4">Register</h2>
      <form onSubmit={handleRegister}>
        <div className="row g-3">
          <h5>Personal Details</h5>
          <div className="col-md-4">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              name="username"
              value={form.username}
              onChange={handleInputChange}
              placeholder="Enter username"
              required
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              name="fullname"
              value={form.fullname}
              onChange={handleInputChange}
              placeholder="Enter full name"
              required
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={form.email}
              onChange={handleInputChange}
              placeholder="Enter email"
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">NRIC</label>
            <input
              type="text"
              className="form-control"
              name="nric"
              value={form.nric}
              onChange={handleInputChange}
              placeholder="Enter NRIC"
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Gender</label>
            <div className="d-flex align-items-center" style={{ gap: "1rem" }}>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="gender"
                  id="male"
                  value="Male"
                  checked={form.gender === "Male"}
                  onChange={handleInputChange}
                />
                <label className="form-check-label" htmlFor="male">Male</label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="gender"
                  id="female"
                  value="Female"
                  checked={form.gender === "Female"}
                  onChange={handleInputChange}
                />
                <label className="form-check-label" htmlFor="female">Female</label>
              </div>
            </div>
          </div>

          {/* DOB */}
          <div className="col-md-6">
            <label className="form-label">Date of Birth</label>
            <input
              type="date"
              className="form-control"
              name="dob"
              value={form.dob}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Nationality */}
          <div className="col-md-6">
            <label className="form-label">Nationality</label>
            <select
              className="form-select"
              name="nationality"
              value={form.nationality}
              onChange={handleInputChange}
              required
            >
              <option value="">-- Select Nationality --</option>
              {nationalities.map((nation, idx) => (
                <option key={idx} value={nation}>
                  {nation}
                </option>
              ))}
            </select>
          </div>

          {/* Password */}
          <div className="col-md-6">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={form.password}
              onChange={handleInputChange}
              placeholder="Enter password"
              required
            />
          </div>

          <h5 className="pt-4">Mailing Address</h5>
          <div className="col-12">
            <label className="form-label">Address</label>
            <input
              type="text"
              className="form-control"
              name="address"
              value={form.address}
              onChange={handleInputChange}
              placeholder="Enter address"
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Postal Code</label>
            <input
              type="text"
              className="form-control"
              name="postalcode"
              value={form.postalcode}
              onChange={handleInputChange}
              placeholder="Enter postal code"
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Unit Number</label>
            <input
              type="text"
              className="form-control"
              name="unitnumber"
              value={form.unitnumber}
              onChange={handleInputChange}
              placeholder="Enter unit number"
              required
            />
          </div>

          <div className="col-12 pt-4">
            <button type="submit" className="btn btn-primary w-100">
              Register
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
