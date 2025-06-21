// src/pages/Unauthorized.jsx
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: '80vh' }}>
      <h1 className="text-danger mb-3">🚫 Unauthorized</h1>
      <p className="mb-4">You do not have permission to access this page.</p>
      <Button variant="primary" onClick={() => navigate("/")}>
        Go to Home
      </Button>
    </div>
  );
}
