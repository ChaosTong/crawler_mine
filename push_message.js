require('dotenv').config();
const axios = require('axios');

/**
 * 推送消息
 * @param {string} message - 要推送的消息内容
 * @returns {Promise<boolean>} - 返回推送是否成功
 */
async function pushMessage(message) {
    try {
        const pushKey = process.env.PUSH_KEY;
        if (!pushKey) {
            console.log('未配置 PUSH_KEY，跳过消息推送');
            return false;
        }

        const url = `https://push.easyulife.com/message/push`;
        const response = await axios.get(url, {
            params: {
                pushkey: pushKey,
                text: message
            }
        });

        console.log('消息推送成功');
        return true;
    } catch (error) {
        console.error('消息推送失败:', error.message);
        return false;
    }
}

module.exports = { pushMessage };