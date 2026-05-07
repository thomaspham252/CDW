import { useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import {useAuth} from "../../context/AuthContext";
import '../../styles/auth/LoginPage.css';

const RegisterPage = () => {
        const { register } = useAuth();
        const navigate = useNavigate();
        const [error, setError] = useState("");
        const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const fullName = e.target.fullName.value;
        const email    = e.target.email.value;
        const password = e.target.password.value;

        try {
            await register(fullName, email, password);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Đăng ký thất bại");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="register-page">
            <div id="container">
                <div className="register">
                    <div className="content">
                        <h1>Sign Up</h1>

                        <div className="social">
                            <a href="#" rel="noopener noreferrer">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                     strokeLinejoin="round">
                                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                                </svg>
                            </a>
                            <a href="#" rel="noopener noreferrer">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                    <path fill="#4285F4"
                                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853"
                                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05"
                                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                                    <path fill="#EA4335"
                                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                            </a>

                        </div>

                        <span className="loginwith">Or Connect with</span>


                        <form className="form-container" onSubmit={handleSubmit}>
                            <input
                                name="fullName"
                                type="text"
                                placeholder="Họ tên"
                                required
                            />
                            <input
                                name="email"
                                type="email"
                                placeholder="Email"
                                required
                            />
                            <input
                                name="password"
                                type="password"
                                placeholder="Password"
                                required
                            />

                            <label className="remember">
                                <input
                                    type="checkbox"

                                />
                                <span className="accept-terms">I accept terms</span>
                            </label>

                            {error && (
                                <p style={{ color: 'red', marginTop: '8px' }}>
                                    {error}
                                </p>
                            )}

                            <button type="submit" disabled={loading}>
                                {loading ? 'Đang đăng ký...' : 'Register'}
                            </button>
                        </form>

                        <p className="switch">
                            Đã có tài khoản? <Link to="/login">Log In</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
