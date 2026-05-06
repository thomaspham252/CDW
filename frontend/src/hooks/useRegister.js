import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useRegister = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!acceptTerms) {
            setError('Bạn phải chấp nhận điều khoản');
            return;
        }
        setLoading(true);
        setError('');
        
        // Mock register
        setTimeout(() => {
            alert('Đăng ký thành công!');
            navigate('/login');
            setLoading(false);
        }, 1000);
    };

    return {
        name, setName,
        email, setEmail,
        password, setPassword,
        acceptTerms, setAcceptTerms,
        error,
        loading,
        handleSubmit
    };
};
