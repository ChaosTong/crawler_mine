require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const { getValueByKey, setValueByKey, deleteByKey, getAllKeyValues, closePool } = require('./mysql');
const { pushMessage } = require('./push_message');
const { sendMemo } = require('./send_memo');

// cookies 将从数据库获取
let msg = [];

const HEADERS = {
    "Accept": "*/*",
    "Accept-Language": "en,zh-CN;q=0.9,zh;q=0.8,ja;q=0.7,zh-TW;q=0.6",
    "cache-control": "max-age=0",
    "pragma": "no-cache",
    "Referer": "https://www.v2ex.com/",
    "sec-ch-ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
    "sec-ch-ua-mobile": "?0",
    "Sec-Ch-Ua-Platform": "Windows",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
};

const client = axios.create({
    headers: HEADERS,
});

// 获取 once
async function getOnce() {
    const url = "https://www.v2ex.com/mission/daily";
    const response = await client.get(url);
    const text = response.data;

    if (text.includes("你要查看的页面需要先登录")) {
        msg.push({
            name: "登录信息",
            value: "登录失败，Cookie 可能已经失效"
        });
        return { once: "", success: false };
    } else if (text.includes("每日登录奖励已领取")) {
        const match = text.match(/已连续登录 \d+ 天/);
        msg.push({
            name: "登录信息",
            value: "每日登录奖励已领取，" + (match ? match[0] : "")
        });
        return { once: "", success: true };
    }

    const match = text.match(/once=(\d+)/);
    if (match) {
        const once = match[1];
        msg.push({ name: "登录信息", value: "登录成功" });
        return { once, success: true };
    } else {
        return { once: "", success: false };
    }
}

// 签到
async function checkIn(once) {
    const url = `https://www.v2ex.com/mission/daily/redeem?once=${once}`;
    await client.get(url);
}

// 查询
async function queryBalance() {
    const url = "https://www.v2ex.com/balance";
    const response = await client.get(url);
    const $ = cheerio.load(response.data);

    // 签到结果
    const checkinDayStr = $('small.gray').first().text();
    const checkinDay = new Date(checkinDayStr);
    const today = new Date();
    
    if (checkinDay.toDateString() === today.toDateString()) {
        const bonusMatch = response.data.match(/\d+ 的每日登录奖励 \d+ 铜币/);
        msg.push({
            name: "签到信息",
            value: bonusMatch ? bonusMatch[0] : "签到成功"
        });
    } else {
        msg.push({
            name: "签到信息",
            value: "签到失败"
        });
    }

    // 余额
    let balance = [];
    $('.balance_area.bigger').each((i, elem) => {
        const text = $(elem).text().trim();
        if (text) balance.push(text);
    });

    if (balance.length === 2) {
        balance = ['0', ...balance];
    }

    const [golden, silver, bronze] = balance.map(s => s.trim());
    msg.push({
        name: "账户余额",
        value: `${golden} 金币，${silver} 银币，${bronze} 铜币`
    });
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    // 从数据库获取 COOKIES
    const cookies = await getValueByKey('keys', 'V2EX_COOKIES', 'name');
    if (!cookies) {
        throw new Error('未找到 V2EX_COOKIES，请先在数据库中设置');
    }
    
    // 设置 Cookie 到请求头
    client.defaults.headers['Cookie'] = cookies;

    for (let i = 0; i < 3; i++) {
        try {
            const { once, success } = await getOnce();
            if (once) {
                await checkIn(once);
            }
            if (success) {
                await queryBalance();
            }
            break;
        } catch (error) {
            if (i < 2) {
                await sleep(3000);
                console.log(`checkin failed, try #${i + 1}`);
                continue;
            } else {
                throw error;
            }
        }
    }

    return msg.map(one => `${one.name}: ${one.value}`).join("\n");
}

if (require.main === module) {
    (async () => {
        console.log(" V2EX 签到开始 ".padStart(40, "=").padEnd(60, "="));
        try {
            const result = await main();
            console.log(result);
            
            const message = `V2EX 签到结果\n${result}`;
            
            // 推送签到结果
            await pushMessage(message);
            
            // 发送到 Memos
            await sendMemo(`#V2ex签到 ${message}`);
        } catch (error) {
            console.error("Error:", error.message);
            
            const errorMessage = `V2EX 签到失败\n${error.message}`;
            
            // 推送错误信息
            await pushMessage(errorMessage);
            
            // 发送错误到 Memos
            await sendMemo(errorMessage);
        } finally {
            await closePool();
        }
        console.log(" V2EX 签到结束 ".padStart(40, "=").padEnd(60, "="), "\n");
    })();
}

module.exports = { main };