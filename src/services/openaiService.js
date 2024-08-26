import axios from 'axios';
import { getPosts } from './firestoreService';

export const generateThreadWithFirstPost = async () => {
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error("OpenAI API key is missing");
    }

    const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
    };

    const threadPrompt = `
  新しいスレッドを作成してください。スレッドタイトルと、それに続く最初のレスを生成してください。
  スレッドタイトルは簡潔でキャッチーなものにし、最初のレスはそのタイトルに関連した内容にしてください。
  スレッドタイトルとレスは5chを参考にしてください。
  出力形式は次のようにしてください：
  スレッドタイトル: [生成されたスレッドタイトル]
  最初のレス: [生成された最初のレス]
  `;

    const data = {
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: '以下の指示に基づいて、カジュアルで雑談的な5ch風の内容を生成してください。' },
            { role: 'user', content: threadPrompt }
        ],
        temperature: 1.2,
        max_tokens: 200,
    };

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', data, { headers });
        const result = response.data.choices[0].message.content.trim();

        const titleMatch = result.match(/スレッドタイトル:\s*(.*)/);
        const postMatch = result.match(/最初のレス:\s*(.*)/);

        const title = titleMatch ? titleMatch[1] : 'タイトル生成エラー';
        const post = postMatch ? postMatch[1] : 'レス生成エラー';

        return { title, post };
    } catch (error) {
        console.error('Error generating thread or post:', error.response ? error.response.data : error);
        throw error;
    }
};

export const generateReplyPost = async (prompt, threadId) => {
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error("OpenAI API key is missing");
    }

    const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
    };

    // スレッドの過去の投稿を取得
    const posts = await getPosts(threadId);
    const threadContent = posts.map(post => `${post.handleName}: ${post.content}`).join('\n');

    const data = {
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: '以下のスレッドに基づいて、適切な返信を簡潔に生成してください。' },
            { role: 'user', content: `スレッドの内容:\n${threadContent}\n\n質問またはコメント: ${prompt}` }
        ],
        temperature: 1.2,
        max_tokens: 150,
    };

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', data, { headers });
        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error generating reply post:', error.response ? error.response.data : error);
        throw error;
    }
};
