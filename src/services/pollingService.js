import { generateThreadWithFirstPost, generateReplyPost, generateImagePost } from './openaiService';  // 画像生成の関数をインポート
import { addThreadWithFirstPost, addPost, getThreads } from './firestoreService';

export const startPolling = (userId) => {
    setInterval(async () => {
        try {
            const threads = await getThreads();
            const shouldCreateThread = Math.random() < 0.05;  // 5%の確率でスレッド作成
            const shouldGenerateImage = Math.random() < 0.05; // 5%の確率で画像生成

            if (shouldCreateThread) {
                // 新しいスレッドを立てる
                const { title, post } = await generateThreadWithFirstPost();

                const userIp = '0.0.0.0';
                const handleName = 'AI Bot';
                const userIdByIp = generateUserId(userIp);

                await addThreadWithFirstPost(title, userId, post, handleName, userIdByIp);
            } else if (shouldGenerateImage) {
                // 画像生成してレスを投稿する
                const randomThreadIndex = Math.floor(Math.random() * threads.length);
                const threadId = threads[randomThreadIndex].id;
                const threadTitle = threads[randomThreadIndex].title;  // スレッドのタイトルを取得

                const imagePrompt = `スレッド「${threadTitle}」に関連する画像を生成してください。`;
                const imagePost = await generateImagePost(imagePrompt, threadTitle);  // 画像生成と自然なレス

                const userIp = '0.0.0.0';
                const handleName = 'AI Bot';
                const userIdByIp = generateUserId(userIp);

                await addPost(threadId, imagePost, userId, handleName, userIdByIp);  // 生成した画像レスを投稿
            } else {
                // 既存のスレッドにレスを追加する
                const randomThreadIndex = Math.floor(Math.random() * threads.length);
                const threadId = threads[randomThreadIndex].id;
                const postPrompt = 'このスレッドに対する適切な返信を簡潔に生成してください。';
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
