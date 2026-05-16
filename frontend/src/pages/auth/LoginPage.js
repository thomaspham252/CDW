import { useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import { GoogleLogin } from '@react-oauth/google';
import '../../styles/auth/LoginPage.css';

const LoginPage = () => {
    const { login, loginGoogle } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Đăng nhập bằng email/password
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        const email = e.target.email.value;
        const password = e.target.password.value;
        try {
            await login(email, password);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Sai email hoặc mật khẩu");
        } finally {
            setLoading(false);
        }
    };

    // Đăng nhập bằng Google
    const handleGoogleSuccess = async (credential) => {
        try {
            await loginGoogle(credential.credential);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Đăng nhập Google thất bại");
        }
    };

    return (
        <div className="login-page">
            <div id="container">
                <div className="login">
                    <div className="content">
                        <h1>Log In</h1>

                        <form className="form-container" onSubmit={handleSubmit}>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                required
                            />
                            <input
                                name="password"
                                type="password"
                                placeholder="Password"
                                required
                            />
                            {error && (
                                <p style={{ color: 'red', marginTop: '8px' }}>{error}</p>
                            )}
                            <button type="submit" disabled={loading}>
                                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                            </button>
                        </form>

                        <span className="loginwith">Or Connect with</span>

                        <div className="social">
                            <a href="/login" rel="noopener noreferrer">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                     strokeLinejoin="round">
                                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                                </svg>
                            </a>
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => setError("Đăng nhập Google thất bại")}
                            />
                        </div>

                        <p className="switch">
                            Chưa có tài khoản? <Link to="/register">Register</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
