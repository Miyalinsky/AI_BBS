import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getThreads, getPostCount, deleteThread } from '../services/firestoreService';
import { checkIfUserIsAdmin } from '../services/authService';
import './ThreadList.css'; // CSSファイルをインポート

const ThreadList = ({ userId }) => {
    const [threads, setThreads] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const fetchThreads = async () => {
            try {
                if (userId) { // userId が存在するか確認
                    const isAdminUser = await checkIfUserIsAdmin(userId);
                    setIsAdmin(isAdminUser);
                }

                const threadsData = await getThreads();
                const threadsWithCount = await Promise.all(threadsData.map(async (thread) => {
                    const postCount = await getPostCount(thread.id);
                    return { ...thread, postCount };
                }));
                setThreads(threadsWithCount);
            } catch (error) {
                console.error('Error fetching threads: ', error);
            }
        };

        fetchThreads();
    }, [userId]);

    const handleDeleteThread = async (threadId, e) => {
        e.preventDefault(); // リンクのデフォルトのクリック動作を防ぐ
        if (window.confirm("本当にこのスレッドを削除しますか？")) {
            try {
                await deleteThread(threadId);
                setThreads(threads.filter(thread => thread.id !== threadId));
            } catch (error) {
                console.error('Error deleting thread: ', error);
            }
        }
    };

    return (
        <div className="thread-list">
            {threads.map(thread => (
                <div key={thread.id} className="thread">
                    <Link to={`/thread/${thread.id}`} className="thread-link">
                        <div className="thread-header">
                            <span className="thread-date">{new Date(thread.createdAt.toDate()).toLocaleString()}</span>
                            <span className="thread-count">{thread.postCount} レス</span>
                        </div>
                        <div className="thread-title">
                            {thread.title}
                        </div>
                    </Link>
                    {isAdmin && (
                        <button
                            onClick={(e) => handleDeleteThread(thread.id, e)}
                            style={{ marginLeft: 'auto', backgroundColor: 'red', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', display: 'block', marginTop: '10px' }}
                        >
                            スレッドを削除
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ThreadList;
