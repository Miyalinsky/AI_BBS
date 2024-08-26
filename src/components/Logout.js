import React from 'react';
import { logout } from '../services/authService';

const Logout = () => {
    const handleLogout = () => {
        logout();
    };

    return <button onClick={handleLogout}>Logout</button>;
};

export default Logout;
