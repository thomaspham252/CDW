import { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../context/AuthContext";
import "../../styles/auth/LoginPage.css";

const LoginPage = () => {
    const { login, loginGoogle, isAuthenticated, authLoaded } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const redirectPath = searchParams.get("redirect")
        ? `/${searchParams.get("redirect").replace(/^\/+/, "")}`
        : "/";

    useEffect(() => {
        if (authLoaded && isAuthenticated) {
            navigate(redirectPath, { replace: true });
        }
    }, [authLoaded, isAuthenticated, navigate, redirectPath]);

    const getLoginErrorMessage = (err, fallback) => {
        return err.response?.data?.message || fallback;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await login(email, password);
            navigate(redirectPath, { replace: true });
        } catch (err) {
            setError(getLoginErrorMessage(err, "Sai email hoặc mật khẩu"));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credential) => {
        setError("");

        try {
            await loginGoogle(credential.credential);
            navigate(redirectPath, { replace: true });
        } catch (err) {
            setError(getLoginErrorMessage(err, "Đăng nhập Google thất bại"));
        }
    };

    if (!authLoaded) {
        return (
            <div className="login-page">
                <div className="loading">Đang kiểm tra đăng nhập...</div>
            </div>
        );
    }

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
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <input
                                name="password"
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            {error && (
                                <p className="login-error" role="alert">
                                    {error}
                                </p>
                            )}
                            <button type="submit" disabled={loading}>
                                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                            </button>
                        </form>

                        <span className="loginwith">Or Connect with</span>

                        <div className="social">
                            <a href="/login" rel="noopener noreferrer">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
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
