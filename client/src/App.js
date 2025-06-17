import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

import UsersPage from './pages/testingUsersPage';

import { appRoutes } from "./config/routesConfig";
import RoleLayout from "./layouts/RoleLayout"; 
import PublicLayout from "./layouts/PublicLayout";
import {publicRoutes } from "./config/routesConfig";

function App() {
  localStorage.setItem("role", "staff"); // temp, change here to see staff and user navbar changes
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        {publicRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={<PublicLayout>{element}</PublicLayout>} />
        ))}

        {/* Protected + role-based layout routes */}
        <Route element={<RoleLayout />}>
          {appRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Route>

        {/* Optional fallback */}
        <Route path="/users" element={<UsersPage />} />
        <Route path="*" element={<div>404 Page Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
