require('dotenv').config();
const mysql = require('mysql2/promise');

// 数据库连接配置
const dbConfig = {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'test',
    port: process.env.MYSQL_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

/**
 * 通过key从指定表获取value
 * @param {string} tableName - 表名
 * @param {string} key - 键名
 * @param {string} keyColumn - key所在的列名，默认为'key'
 * @param {string} valueColumn - value所在的列名，默认为'value'
 * @returns {Promise<string|null>} - 返回value值，如果不存在返回null
 */
async function getValueByKey(tableName, key, keyColumn = 'key', valueColumn = 'value') {
    let connection;
    try {
        connection = await pool.getConnection();
        
        const [rows] = await connection.query(
            `SELECT ?? FROM ?? WHERE ?? = ? LIMIT 1`,
            [valueColumn, tableName, keyColumn, key]
        );
        
        if (rows.length > 0) {
            return rows[0][valueColumn];
        }
        return null;
    } catch (error) {
        console.error('数据库查询错误:', error);
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

/**
 * 设置或更新key-value
 * @param {string} tableName - 表名
 * @param {string} key - 键名
 * @param {string} value - 值
 * @param {string} keyColumn - key所在的列名，默认为'key'
 * @param {string} valueColumn - value所在的列名，默认为'value'
 * @returns {Promise<boolean>} - 返回操作是否成功
 */
async function setValueByKey(tableName, key, value, keyColumn = 'key', valueColumn = 'value') {
    let connection;
    try {
        connection = await pool.getConnection();
        
        // 使用 INSERT ... ON DUPLICATE KEY UPDATE 语法
        await connection.query(
            `INSERT INTO ?? (??, ??) VALUES (?, ?) ON DUPLICATE KEY UPDATE ?? = ?`,
            [tableName, keyColumn, valueColumn, key, value, valueColumn, value]
        );
        
        return true;
    } catch (error) {
        console.error('数据库写入错误:', error);
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

/**
 * 删除指定key
 * @param {string} tableName - 表名
 * @param {string} key - 键名
 * @param {string} keyColumn - key所在的列名，默认为'key'
 * @returns {Promise<boolean>} - 返回操作是否成功
 */
async function deleteByKey(tableName, key, keyColumn = 'key') {
    let connection;
    try {
        connection = await pool.getConnection();
        
        const [result] = await connection.query(
            `DELETE FROM ?? WHERE ?? = ?`,
            [tableName, keyColumn, key]
        );
        
        return result.affectedRows > 0;
    } catch (error) {
        console.error('数据库删除错误:', error);
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

/**
 * 获取所有key-value对
 * @param {string} tableName - 表名
 * @param {string} keyColumn - key所在的列名，默认为'key'
 * @param {string} valueColumn - value所在的列名，默认为'value'
 * @returns {Promise<Array>} - 返回所有记录
 */
async function getAllKeyValues(tableName, keyColumn = 'key', valueColumn = 'value') {
    let connection;
    try {
        connection = await pool.getConnection();
        
        const [rows] = await connection.query(
            `SELECT ??, ?? FROM ??`,
            [keyColumn, valueColumn, tableName]
        );
        
        return rows;
    } catch (error) {
        console.error('数据库查询错误:', error);
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

/**
 * 关闭数据库连接池
 */
async function closePool() {
    await pool.end();
}

module.exports = {
    getValueByKey,
    setValueByKey,
    deleteByKey,
    getAllKeyValues,
    closePool,
    pool // 导出连接池供高级用户使用
};
