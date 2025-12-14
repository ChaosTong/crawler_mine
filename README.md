# V2EX 自动签到工具

一个基于 Node.js 的 V2EX 自动签到脚本，支持自动签到、消息推送和 Memos 记录。

## 功能特性

- ✅ 自动登录并签到 V2EX
- ✅ 查询账户余额（金币、银币、铜币）
- ✅ 失败自动重试（最多3次）
- ✅ 支持消息推送通知
- ✅ 支持 Memos 系统记录
- ✅ PM2 定时任务管理
- ✅ Cookie 存储在 MySQL 数据库

## 技术栈

- Node.js
- axios - HTTP 请求
- cheerio - HTML 解析
- mysql2 - 数据库连接
- dotenv - 环境变量管理
- PM2 - 进程管理

## 安装依赖

```bash
npm install axios cheerio mysql2 dotenv
npm install -g pm2
```

## 配置说明

### 1. 环境变量配置

创建 `.env` 文件：

```env
# MySQL 数据库配置
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=crawler
MYSQL_PORT=3306

# 消息推送配置（可选）
PUSH_KEY=your_push_key

# Memos 配置（可选）
MEMOS_URL=https://your-memos-domain.com
MEMOS_TOKEN=your_memos_token
```

### 2. 数据库配置

创建数据库表：

```sql
CREATE TABLE `keys` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `value` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

插入 V2EX Cookie：

```sql
INSERT INTO `keys` (`name`, `value`) 
VALUES ('V2EX_COOKIES', 'your_v2ex_cookies_here');
```

### 3. 获取 V2EX Cookie

1. 登录 V2EX 网站
2. 打开浏览器开发者工具（F12）
3. 切换到 Network 标签
4. 刷新页面
5. 找到任意请求，复制 Request Headers 中的 Cookie 值
6. 将 Cookie 值保存到数据库

## 使用方法

### 手动运行

```bash
node v2ex.js
```

### 使用 PM2 管理

```bash
# 启动定时任务（每天早上 9:05 执行）
pm2 start ecosystem.config.js

# 查看运行状态
pm2 status

# 查看日志
pm2 logs v2ex-checkin

# 立即执行一次
pm2 restart v2ex-checkin

# 停止任务
pm2 stop v2ex-checkin

# 删除任务
pm2 delete v2ex-checkin
```

### 设置开机自启

```bash
pm2 save
pm2 startup
```

## 修改执行时间

编辑 `ecosystem.config.js` 文件中的 `cron_restart` 字段：

```javascript
cron_restart: '0 9 * * *'  // 每天 09:00 执行
// 格式：分 时 日 月 周
```

Cron 表达式示例：
- `0 9 * * *` - 每天 09:00
- `30 8 * * *` - 每天 08:30
- `0 */6 * * *` - 每 6 小时
- `0 0 * * 0` - 每周日 00:00

## 项目结构

```
crawler_mine/
├── v2ex.js              # 主程序
├── mysql.js             # 数据库操作模块
├── push_message.js      # 消息推送模块
├── send_memo.js         # Memos 推送模块
├── ecosystem.config.js  # PM2 配置文件
├── .env                 # 环境变量配置
├── .gitignore          # Git 忽略文件
├── package.json         # 项目依赖
└── logs/               # 日志目录
    ├── v2ex-error.log  # 错误日志
    └── v2ex-out.log    # 输出日志
```

## 输出示例

```
==================== V2EX 签到开始 ====================
登录信息: 登录成功
签到信息: 2024 的每日登录奖励 15 铜币
账户余额: 0 金币，0 银币，1234 铜币
消息推送成功
Memos 发送成功
==================== V2EX 签到结束 ====================
```

## 注意事项

1. **Cookie 有效期**：V2EX Cookie 可能会过期，需要定期更新
2. **请求频率**：脚本会在失败时自动重试，间隔 3 秒
3. **数据库连接**：程序结束时会自动关闭数据库连接池
4. **日志管理**：定期清理 `logs` 目录下的日志文件
5. **安全性**：不要将 `.env` 文件和数据库凭证提交到 Git

## 故障排查

### 1. Cookie 失效

```
登录信息: 登录失败，Cookie 可能已经失效
```

**解决方法**：重新获取 Cookie 并更新数据库

### 2. 数据库连接失败

```
数据库查询错误: connect ECONNREFUSED
```

**解决方法**：
- 检查 MySQL 服务是否运行
- 检查 `.env` 中的数据库配置
- 确认数据库用户权限

### 3. 已经签到

```
登录信息: 每日登录奖励已领取，已连续登录 X 天
```

**说明**：今天已经签到过了，这是正常情况

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
