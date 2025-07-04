import { Link } from "react-router-dom";
import logo from "../../img/logo.svg";
import "../../styles/AfterLife-Theme.css";

export default function PageNotFound() {
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
                    <h1 className="display-3 fw-bold text-dark mb-3">404</h1>
                    <h2 className="display-5 fw-semibold text-dark mb-4">Page Not Found</h2>
                    <p className="text-muted lead mb-5 px-3">
                        We’re sorry, the page you’re looking for doesn’t exist or has been moved.<br/>
                        Please check the URL or return to the homepage.
                    </p>
                    <Link to="/">
                        <button className="btn btn-elegant btn-lg rounded-pill px-5">
                            🏠 Back to Home
                        </button>
                    </Link>
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
