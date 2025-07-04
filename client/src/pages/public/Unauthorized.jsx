import { Link } from "react-router-dom";
import logo from "../../img/logo.svg";
import "../../styles/AfterLife-Theme.css";

export default function Unauthorized() {
    return (
        <>
            <section className="hero-gradient py-5 min-vh-100 d-flex align-items-center">
                <div className="container text-center py-5">
                    <img 
                        src={logo || "https://via.placeholder.com/80x80/6c757d/ffffff?text=AL"} 
                        alt="AfterLife logo" 
                        className="mb-4 rounded-circle shadow" 
                        style={{width: '80px', height: '80px'}}
                    />
                    <h1 className="display-3 fw-bold text-warning mb-3">🚫 Unauthorized</h1>
                    <h2 className="display-5 fw-semibold text-dark mb-4">Please log in or sign up</h2>
                    <p className="text-muted lead mb-5 px-3">
                        You need to be logged in to access this page.<br/>
                        Please log in or create an account to continue.
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                        <Link to="/login">
                            <button className="btn btn-primary btn-lg rounded-pill px-5">
                                🔑 Log In
                            </button>
                        </Link>
                        <Link to="/signup">
                            <button className="btn btn-outline-secondary btn-lg rounded-pill px-5">
                                📝 Sign Up
                            </button>
                        </Link>
                        <Link to="/">
                            <button className="btn btn-light btn-lg rounded-pill px-5">
                                🏠 Back to Home
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            <footer className="bg-dark text-light py-4">
                <div className="container text-center">
                    <p className="mb-2">© 2024 AfterLife. All rights reserved.</p>
                    <p className="small">Designed with care and respect for every family.</p>
                </div>
            </footer>
        </>
    );
}