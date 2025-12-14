require('dotenv').config();
const axios = require('axios');

/**
 * 发送消息到 Memos 系统
 * @param {string} content - 要发送的消息内容
 * @param {string} visibility - 可见性，默认为 PUBLIC
 * @returns {Promise<boolean>} - 返回是否发送成功
 */
async function sendMemo(content, visibility = 'PUBLIC') {
    try {
        const memosUrl = process.env.MEMOS_URL;
        const memosToken = process.env.MEMOS_TOKEN;

        if (!memosUrl || !memosToken) {
            console.log('未配置 MEMOS_URL 或 MEMOS_TOKEN，跳过 Memos 推送');
            return false;
        }

        const url = `${memosUrl}/api/v1/memos`;
        const response = await axios.post(
            url,
            {
                content: content,
                visibility: visibility
            },
            {
                headers: {
                    'Authorization': `Bearer ${memosToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log('Memos 响应数据:', response.data);

        console.log('Memos 发送成功');
        return true;
    } catch (error) {
        console.error('Memos 发送失败:', error.message);
        return false;
    }
}

module.exports = { sendMemo };
