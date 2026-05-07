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
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                                </svg>
                            </a>
                            <a href="#" rel="noopener noreferrer">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                                </svg>
                            </a>
                            <a href="#" rel="noopener noreferrer">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                                </svg>
                            </a>
                            <a href="#" rel="noopener noreferrer">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                                    <rect x="2" y="9" width="4" height="12"></rect>
                                    <circle cx="4" cy="4" r="2"></circle>
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
