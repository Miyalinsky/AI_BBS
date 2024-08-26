import React, { useEffect, useState } from 'react';
import { getPosts } from '../services/firestoreService';

const PostList = ({ threadId }) => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            const posts = await getPosts(threadId);
            setPosts(posts);
        };

        fetchPosts();
    }, [threadId]);

    return (
        <div>
            <h2>Posts</h2>
            <ul>
                {posts.map(post => (
                    <li key={post.id}>{post.content}</li>
                ))}
            </ul>
        </div>
    );
};

export default PostList;
