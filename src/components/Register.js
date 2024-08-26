import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { register } from '../services/authService';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(email, password);
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div>
            <h2>アカウント登録</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Register</button>
            </form>
            {error && <p>{error}</p>}
            <p>
                既にアカウントを持っていますか? <Link to="/">ログインする</Link>
            </p>
        </div>
    );
};

export default Register;
