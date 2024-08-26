import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPosts, addPost, getThreadTitle, deletePost } from '../services/firestoreService';
import { checkIfUserIsAdmin } from '../services/authService';
import axios from 'axios';
import crypto from 'crypto-browserify';
import './ThreadDetail.css';

const ThreadDetail = ({ userId }) => {
    const { threadId } = useParams();
    const [posts, setPosts] = useState([]);
    const [content, setContent] = useState('');
    const [handleName, setHandleName] = useState('');
    const [error, setError] = useState('');
    const [userIp, setUserIp] = useState('');
    const [threadTitle, setThreadTitle] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [anchorPost, setAnchorPost] = useState(null); // ポップアップで表示するレス
    const navigate = useNavigate();
    const textAreaRef = useRef(null);

    useEffect(() => {
        const fetchThreadData = async () => {
            try {
                const posts = await getPosts(threadId);
                const title = await getThreadTitle(threadId);
                const isAdminUser = await checkIfUserIsAdmin(userId);
                setPosts(posts);
                setThreadTitle(title);
                setIsAdmin(isAdminUser);
            } catch (error) {
                console.error(error);
            }
        };

        fetchThreadData();
        fetchUserIp();
    }, [threadId, userId]);

    const fetchUserIp = async () => {
        try {
            const response = await axios.get('https://api.ipify.org?format=json');
            setUserIp(response.data.ip);
        } catch (error) {
            console.error('Error fetching user IP: ', error);
        }
    };

    const generateUserId = (ip) => {
        return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 8);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userIdByIp = generateUserId(userIp);
            await addPost(threadId, content, userId, handleName || '名無し', userIdByIp);
            setContent('');
            setHandleName('');
            const updatedPosts = await getPosts(threadId);
            setPosts(updatedPosts);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleDeletePost = async (postId) => {
        if (isAdmin) {
            if (window.confirm("本当にこのレスを削除しますか？")) {
                await deletePost(threadId, postId);
                const updatedPosts = await getPosts(threadId);
                setPosts(updatedPosts);
            }
        } else {
            alert("この操作を行う権限がありません。");
        }
    };

    const handleContentChange = (e) => {
        setContent(e.target.value);
        adjustTextAreaHeight(e.target);
    };

    const adjustTextAreaHeight = (textarea) => {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    };

    useEffect(() => {
        if (textAreaRef.current) {
            adjustTextAreaHeight(textAreaRef.current);
        }
    }, [content]);

    const escapeHtml = (unsafe) => {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    // アンカーリンクをパースしてリンクに変換
    const parseAnchors = (text) => {
        const anchorPattern = /&gt;&gt;(\d+)/g;
        const parsedText = text.replace(anchorPattern, (match, p1) => {
            const postNumber = parseInt(p1, 10);
            return `<a href="#" class="anchor-link" data-post-number="${postNumber}">${match}</a>`;
        });
        return parsedText;
    };

    // 修正: レスに画像URLが含まれている場合はそのままレンダリング
    const renderContent = (post) => {
        const content = post.content;
        if (content.includes('<img')) {
            return content;  // 画像URLを含む場合はエスケープしない
        } else {
            return escapeHtml(content);  // 通常のレスはエスケープ
        }
    };

    const handleAnchorClick = (e, postNumber) => {
        e.preventDefault();
        const targetPost = posts.find((post, index) => index + 1 === postNumber);
        if (targetPost) {
            setAnchorPost({
                post: targetPost,
                position: {
                    x: e.clientX,
                    y: e.clientY
                }
            });
        }
    };

    const handleCloseAnchor = () => {
        setAnchorPost(null);
    };

    return (
        <div>
            <button
                onClick={() => navigate(-1)}
                style={{
                    marginBottom: '10px',
                    padding: '10px 20px',
                    backgroundColor: '#007BFF',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >
                Back
            </button>
            <h2>{threadTitle}</h2>
            <ul>
                {posts.map((post, index) => (
                    <li key={post.id} className="post">
                        <div className="post-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <strong>{String(index + 1).padStart(4, '0')}</strong> {post.handleName} {new Date(post.createdAt.toDate()).toLocaleString()}
                            </div>
                            <div>ID: {post.userIdByIp}</div>
                        </div>
                        <div
                            className="post-content"
                            dangerouslySetInnerHTML={{ __html: parseAnchors(renderContent(post)) }}
                            onClick={(e) => {
                                if (e.target.className === 'anchor-link') {
                                    handleAnchorClick(e, parseInt(e.target.getAttribute('data-post-number'), 10));
                                }
                            }}
                        />
                        {isAdmin && (
                            <button
                                onClick={() => handleDeletePost(post.id)}
                                style={{ display: 'block', marginLeft: 'auto', backgroundColor: 'red', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px' }}
                            >
                                レスを削除
                            </button>
                        )}
                    </li>
                ))}
            </ul>
            {anchorPost && (
                <div
                    className="anchor-popup"
                    style={{
                        position: 'absolute',
                        top: `${anchorPost.position.y}px`,
                        left: `${anchorPost.position.x}px`,
                        transform: 'translate(10px, 10px)',  // 少し下・右にずらす
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        padding: '10px',
                        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                        zIndex: 1000,
                        width: '300px',
                        borderRadius: '5px',
                    }}
                >
                    <div className="anchor-popup-header">
                        <button onClick={handleCloseAnchor}>[閉じる]</button>
                    </div>
                    <div className="anchor-popup-content">
                        <div className="post-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <strong>{posts.indexOf(anchorPost.post) + 1}</strong> {anchorPost.post.handleName} {new Date(anchorPost.post.createdAt.toDate()).toLocaleString()}
                            </div>
                            <div>ID: {anchorPost.post.userIdByIp}</div>
                        </div>
                        <div className="post-content">{escapeHtml(anchorPost.post.content)}</div>
                    </div>
                </div>
            )}

            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    <input
                        id="handle-name"
                        name="handleName"
                        type="text"
                        placeholder="名前（省略化）"
                        value={handleName}
                        onChange={(e) => setHandleName(e.target.value)}
                        autoComplete="off"
                    />
                    <textarea
                        id="post-content"
                        name="content"
                        value={content}
                        onChange={handleContentChange}
                        ref={textAreaRef}
                        rows="1"
                        style={{ overflow: 'hidden' }}
                    />
                    <button type="submit">Post</button>
                </form>
                {error && <p>{error}</p>}
            </div>
        </div>
    );
};

export default ThreadDetail;
