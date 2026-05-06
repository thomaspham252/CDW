import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        // Mock login
        setTimeout(() => {
            if (email === 'admin@gmail.com' && password === '123456') {
                navigate('/');
            } else {
                setError('Sai email hoặc mật khẩu (Thử admin@gmail.com / 123456)');
            }
            setLoading(false);
        }, 1000);
    };

    return {
        email, setEmail,
        password, setPassword,
        error,
        loading,
        handleSubmit
    };
};
