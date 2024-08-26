import { generateThreadWithFirstPost, generateReplyPost } from './openaiService';
import { addThreadWithFirstPost, addPost, getThreads } from './firestoreService';

export const startPolling = (userId) => {
    setInterval(async () => {
        try {
            const threads = await getThreads();
            const shouldCreateThread = Math.random() < 0.05;

            if (shouldCreateThread) {
                // 新しいスレッドを立てる
                const { title, post } = await generateThreadWithFirstPost();

                const userIp = '0.0.0.0';
                const handleName = 'AI Bot';
                const userIdByIp = generateUserId(userIp);

                await addThreadWithFirstPost(title, userId, post, handleName, userIdByIp);
            } else {
                // 既存のスレッドにレスを追加する
                const randomThreadIndex = Math.floor(Math.random() * threads.length);
                const threadId = threads[randomThreadIndex].id;
                const postPrompt = 'このスレッドに対する適切な返信を簡潔に生成してください。5chのように煽り合いや殺伐とした雰囲気が欲しいです。';
                const content = await generateReplyPost(postPrompt, threadId);

                const userIp = '0.0.0.0';
                const handleName = 'AI Bot';
                const userIdByIp = generateUserId(userIp);

                await addPost(threadId, content, userId, handleName, userIdByIp);
            }
        } catch (error) {
            console.error('Error in polling:', error);
        }
    }, 1000000); // 1分ごとにポーリング
};

function simpleHash(input) {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16); // 正の整数にして16進数に変換
}

const generateUserId = (ip) => {
    return simpleHash(ip).slice(0, 8);
};
