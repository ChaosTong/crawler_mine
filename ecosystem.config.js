module.exports = {
  apps: [
    {
      name: 'v2ex-checkin',
      script: './v2ex.js',
      instances: 1,
      autorestart: false,
      watch: false,
      max_memory_restart: '100M',
      cron_restart: '5 9 * * *', // 修正：每天早上 9:05 执行
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/v2ex-error.log',
      out_file: './logs/v2ex-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true
    }
  ]
};