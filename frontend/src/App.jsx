import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import { getMeAPI } from './api/authAPI';
import NotFound from './pages/NotFound';
import Login        from './pages/Login';
import Register     from './pages/Register';
import OTPVerify    from './pages/OTPVerify';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword  from './pages/ResetPassword';
import Home         from './pages/Home';
import Profile      from './pages/Profile';
import Favourites from './pages/Favourites';
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const setUser = useAuthStore((s) => s.setUser);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { setChecking(false); return; }

    getMeAPI()
      .then((res) => setUser(res.data))
      .catch(() => localStorage.clear())
      .finally(() => setChecking(false));
  }, [setUser]);

  if (checking) {
    return (
      <div style={{
        minHeight: "100vh", background: "#0F0F1A",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#6C63FF", fontFamily: "Inter, sans-serif",
      }}>
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/verify-otp"      element={<OTPVerify />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"  element={<ResetPassword />} />

        <Route path="/" element={
          <ProtectedRoute><Home /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        <Route path="/favourites" element={
          <ProtectedRoute><Favourites /></ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;