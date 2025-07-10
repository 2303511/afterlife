// src/pages/Register.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { nationalities } from "../../config/nationalities";

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const checkExistingFields = ["nric", "contactnumber", "email"];
  const [errorExists, setErrorExists] = useState([]);

  useEffect(() => {
    const loadRecaptcha = () => {
      const script = document.createElement("script");
      script.src = "https://www.google.com/recaptcha/api.js?render=6Les2nMrAAAAAEx17BtP4kIVDCmU1sGfaFLaFA5N";
      script.addEventListener("load", () => setRecaptchaLoaded(true));
      document.body.appendChild(script);
    };

    if (!window.grecaptcha) loadRecaptcha();
    else setRecaptchaLoaded(true);
  }, []);

  const validators = {
    username: (v) => !v?.trim() ? "Username is required"
      : v.length < 4 ? "At least 4 characters"
      : !/^[a-zA-Z0-9_]+$/.test(v) ? "Only letters, numbers, and _"
      : "",
  
    email: (v) => !v?.trim() ? "Email is required"
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Invalid email"
      : "",
  
    fullname: (v) => !v?.trim() ? "Full name is required"
      : v.length < 2 ? "At least 2 characters"
      : !/^[a-zA-Z\s]+$/.test(v) ? "Only letters and spaces"
      : "",
  
    contactnumber: (v) => !v?.trim() ? "Contact number required"
      : !/^\+?\d{8,15}$/.test(v) ? "Invalid contact number"
      : "",
  
    nric: (v) => !v?.trim() ? "NRIC is required"
      : !/^[STFG]\d{7}[A-Z]$/.test(v) ? "Invalid NRIC format, eg S1234567F"
      : "",
  
    dob: (v) => {
      if (!v) return "Date of birth is required";
      const age = new Date().getFullYear() - new Date(v).getFullYear();
      return age < 18 ? "Must be at least 18 years old" : "";
    },
  
    nationality: (v) => !v ? "Nationality required" : "",
  
    address: (v) => !v?.trim() ? "Address required"
      : v.length < 5 ? "Address must be at least 5 characters"
      : "",
  
    gender: (v) => !v ? "Gender required"
      : !["Male", "Female"].includes(v) ? "Gender must be Male or Female"
      : "",
  
    password: (v) => {
      if (!v) return "Password required";
      if (v.length < 8) return "Please enter at least 8 characters";
      return "";
    },
  
    postalcode: (v) => !v?.trim() ? "Postal code required"
      : !/^\d{6}$/.test(v) ? "Must be 6 digits"
      : "",
  
    unitnumber: (v) => !v?.trim() ? "Unit number required" : ""
  };

  const validateForm = () => {
    const newErrors = {};
    for (const key in validators) {
      newErrors[key] = validators[key](form[key]);
    }
    setErrors(newErrors);
    return Object.values(newErrors).every((v) => v === "");
  };

  const isValidField = (name, value) => {
  switch (name) {
    case "nric":
      return value.length === 9;
    case "contactnumber":
      return value.length === 8 && /^\d+$/.test(value);
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    default:
      return false;
  }
};

  const handleInputChange = async (e) => {
    let { name, value } = e.target;

    // 🔒 remove commas from address
    if (name === "address") {
      value = value.replace(/,/g, ""); // or just: value.replaceAll(",", "")
    }

    // update form
    setForm((prev) => ({ ...prev, [name]: value }));

    // Reset errors for this field initially
    setErrorExists((prev) => prev.filter((err) => !err.includes(name)));

    // early return if field is not in check list
    if (!checkExistingFields.includes(name)) return;

    // validate value before lookup
    if (!isValidField(name, value)) return;

    // map frontend name to DB field
    const fieldMap = {
      nric: "nric",
      contactnumber: "contactNumber",
      email: "email"
    };

    const attr = fieldMap[name];
    
    try {
      const res = await axios.get(`/api/user/findExistingUser?attr=${attr}&value=${encodeURIComponent(value)}`);
      const match = res.data;
  
      // 2. if found value
      if (Array.isArray(match) && match.length > 0) {
        toast.error(`${name} already exists.`);
        // 3. add to errors found
        setErrorExists((prev) => [...prev, `${name} already exists`]);
      } 
      
    } catch (err) {
      console.error("Failed to check existing user:", err);
    }

  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!recaptchaLoaded) return console.error("reCAPTCHA not loaded");
    console.log(`this is number of error found ${errorExists.length}`);
    if (errorExists.length > 0) {
      errorExists.forEach((err) => {
        toast.error(err);
      });
      return;
    }
    

    try {
      const token = await window.grecaptcha.execute("6Les2nMrAAAAAEx17BtP4kIVDCmU1sGfaFLaFA5N", { action: "register" });
      const cleanedForm = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v])
      );

      console.log("sending to register !");

      try {
        console.log("sending to server side?");
        const response = await axios.post(
          "/api/auth/register",
          { ...cleanedForm, recaptchaToken: token },
          { headers: { "Content-Type": "application/json" }, withCredentials: true }
        );

        const { success, redirectTo, twoFAEnabled } = response.data;
        if (success && redirectTo && !twoFAEnabled) navigate(redirectTo);
      } 
      catch (err) {
        if (err.response) {
          if (err.status === 400) {
            const serverErrors = err.response.data.errors;
            for (const [message] of Object.entries(serverErrors)) {
              toast.error(`${message}`);
            }
          }
          else if (err.status === 409) {
            toast.error(err.response.data.error);
          }
          return;
        } else {
          // Axios config/network error (not server response)
          toast.error("Unexpected error from server:", err.response.data.errors);
        }
      }

    } catch (error) {
      toast.error("Failed to register user:", error);
    }
  };

  const renderField = (label, name, type = "text", col = "col-md-6", placeholder = "") => (
    <div className={col}>
      <label className="form-label">{label}</label>
      <input
        type={type}
        className="form-control"
        name={name}
        value={form[name]}
        onChange={handleInputChange}
        placeholder={placeholder}
        required
      />
      {errors[name] && <div className="text-danger">{errors[name]}</div>}
    </div>
  );

  return (
    <div className="container mt-5" style={{ maxWidth: "700px" }}>
      <h2 className="text-center mb-4">Register</h2>
      <form onSubmit={handleRegister}>
        <div className="row g-3">
          <h5>Personal Details</h5>
          {renderField("Username", "username", "text", "col-md-4", "Enter username")}
          {renderField("Full Name", "fullname", "text", "col-md-4", "Enter full name")}
          {renderField("Email", "email", "email", "col-md-4", "Enter email")}
          {renderField("NRIC", "nric", "text", "col-md-6", "Enter NRIC")}

          {/* Gender */}
          <div className="col-md-6">
            <label className="form-label">Gender</label>
            <div className="d-flex align-items-center gap-3">
              {["Male", "Female"].map((g) => (
                <div key={g} className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="gender"
                    id={g.toLowerCase()}
                    value={g}
                    checked={form.gender === g}
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label" htmlFor={g.toLowerCase()}>{g}</label>
                </div>
              ))}
            </div>
            {errors.gender && <div className="text-danger">{errors.gender}</div>}
          </div>

          {renderField("Contact Number", "contactnumber", "tel", "col-md-6", "Enter contact number")}
          {renderField("Date of Birth", "dob", "date", "col-md-6")}
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
                <option key={idx} value={nation}>{nation}</option>
              ))}
            </select>
            {errors.nationality && <div className="text-danger">{errors.nationality}</div>}
          </div>
          {renderField("Password", "password", "password", "col-md-6", "Enter password")}

          <h5 className="pt-4">Mailing Address</h5>
          {renderField("Address", "address", "text", "col-12", "Enter address")}
          {renderField("Postal Code", "postalcode", "text", "col-md-6", "Enter postal code")}
          {renderField("Unit Number", "unitnumber", "text", "col-md-6", "Enter unit number")}

          <div className="col-12 pt-4">
            <button type="submit" className="btn btn-primary w-100">Register</button>
          </div>
        </div>
      </form>
    </div>
  );
}
