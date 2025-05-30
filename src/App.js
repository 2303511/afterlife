import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard'; // Create this page next
import './App.css';
import logo from './logo.svg'; // optional if you're not using it
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

function App() {
  return (
    
    <Router>
      <Routes>
        {/* Default path - redirect to dashboard for now */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Login route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Dashboard route */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
