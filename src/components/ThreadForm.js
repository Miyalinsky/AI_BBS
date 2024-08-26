import React, { useState, useEffect } from 'react';
import { addThreadWithFirstPost } from '../services/firestoreService';
import axios from 'axios';
import crypto from 'crypto-browserify';
import './ThreadForm.css';

const ThreadForm = ({ userId }) => {
    const [title, setTitle] = useState('');
    const [handleName, setHandleName] = useState('');
    const [content, setContent] = useState('');
    const [userIp, setUserIp] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserIp = async () => {
            try {
                const response = await axios.get('https://api.ipify.org?format=json');
                setUserIp(response.data.ip);
            } catch (error) {
                console.error('Error fetching user IP: ', error);
            }
        };

        fetchUserIp();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userIdByIp = generateUserId(userIp);
            await addThreadWithFirstPost(title, userId, content, handleName || '名無し', userIdByIp);
            setTitle('');
            setHandleName('');
            setContent('');
        } catch (error) {
            setError(error.message);
        }
    };

    const generateUserId = (ip) => {
        return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 8);
    };

    return (
        <div className="form-container">
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="スレッドタイトル"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="名前（省略可）"
                    value={handleName}
                    onChange={(e) => setHandleName(e.target.value)}
                    autoComplete="off"
                />
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                />
                <button type="submit">Create Thread</button>
            </form>
            {error && <p>{error}</p>}
        </div>
    );
};

export default ThreadForm;
