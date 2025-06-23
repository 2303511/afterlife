import { Link } from "react-router-dom";
import logo from "../img/logo.svg";
import "../styles/AfterLife-Theme.css";

export default function PaymentSuccess() {
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
                    <h1 className="display-3 fw-bold text-success mb-3">✅ Payment Successful</h1>
                    <h2 className="display-5 fw-semibold text-dark mb-4">Thank you for your booking!</h2>
                    <p className="text-muted lead mb-5 px-3">
                        We have received your payment. A confirmation email will be sent to you shortly.<br/>
                        You can return to your bookings page or back to the homepage.
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                        <Link to="/my-bookings">
                            <button className="btn btn-success btn-lg rounded-pill px-5">
                                📄 View My Bookings
                            </button>
                        </Link>
                        <Link to="/">
                            <button className="btn btn-outline-secondary btn-lg rounded-pill px-5">
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
