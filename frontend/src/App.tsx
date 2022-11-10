import { Routes, Route, Navigate } from "react-router-dom";

import AuthPage from "./AuthPage";
import PortalPage from "./PortalPage";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/portal" />} />
            <Route path="/portal" element={<PortalPage />}/>
            <Route path="/login" element={<AuthPage type="login" />} />
            <Route path="/register" element={<AuthPage type="register" />} />
        </Routes>
    );
}

export default App;