import React, { useState, useEffect  } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/js/bootstrap.bundle.min";
import ForgetPasswordModal from "./ForgetPasswordModal";
//import { AuthContext } from "../../auth/AuthContext";

export default function Login() {
  //const { login } = useContext(AuthContext);
  const [showForget, setShowForget] = useState(false);
  const [form, setForm]             = useState({ email: "", password: "" });
  const [error, setError]           = useState("");

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  //recaptcha variables
	const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
	// Load reCAPTCHA script
  useEffect(() => {
      const loadRecaptcha = () => {
          const script = document.createElement('script');
          script.src = 'https://www.google.com/recaptcha/api.js?render=6Les2nMrAAAAAEx17BtP4kIVDCmU1sGfaFLaFA5N';
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



  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    //check if recaptcha is loaded, gonna call it ltr
		if (!recaptchaLoaded) {
      console.error("reCAPTCHA not loaded yet");
      return;
    }

    try {

      // Get reCAPTCHA token // this site key can be exposed
      const token = await window.grecaptcha.execute('6Les2nMrAAAAAEx17BtP4kIVDCmU1sGfaFLaFA5N', { action: 'login' });
			console.log("Got the token sending to backend now")

      // 1) Perform login
      const response = await axios.post(
        "/api/auth/login",
        { email: form.email, password: form.password, recaptchaToken: token},
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      //password and things correct need 2fa now
      if (response.data.success && response.data.redirectTo && response.data.twoFARequired === true) {
        console.log("redirect to the login 2fa page to enter token")
        navigate(response.data.redirectTo); // Server-controlled redirect
      }

      //password and things correct but 2fa not setup properly, force them to setup //twoFASetupRequired
      if (response.data.success && response.data.redirectTo && response.data.twoFASetupRequired === true) {
        console.log("redirect to setup 2fa page to setup")
        navigate(response.data.redirectTo); // Server-controlled redirect
      }


      /* // 2) Fetch session info
      const res = await axios.get("/api/user/me", { withCredentials: true });
      const userData = { userID: res.data.userID, role: res.data.role };
      login(userData);

      // 3) Redirect based on role
      if (res.data.role === "user") {
        navigate("/my-bookings");
      } else if (res.data.role === "staff") {
        navigate("/dashboard");
      } else if (res.data.role === "admin") {
        navigate("/admin-dashboard");
      } */
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Incorrect email or password.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h2 className="text-center mb-4">Login</h2>
      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email address
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={form.email}
            onChange={handleInputChange}
            placeholder="Enter email"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={form.password}
            onChange={handleInputChange}
            placeholder="Enter password"
            required
          />
        </div>
        <div className="mb-3 text-end">
          <button
            type="button"
            className="btn btn-link p-0"
            onClick={() => setShowForget(true)}
          >
            Forgot password?
          </button>
        </div>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <button type="submit" className="btn btn-primary w-100">
          Log In
        </button>
      </form>
      <p className="mt-3 text-center">
        Don't have an account yet? <a href="/register">Register here!</a>
      </p>
      <ForgetPasswordModal
        show={showForget}
        onHide={() => setShowForget(false)}
      />
    </div>
);
}
