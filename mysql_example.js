const { getValueByKey, setValueByKey, deleteByKey, getAllKeyValues, closePool } = require('./mysql');

// 使用示例
async function example() {
    try {
        // 1. 从表中获取value
        const value = await getValueByKey('config', 'api_key');
        console.log('获取的值:', value);

        // 2. 设置或更新value
        await setValueByKey('config', 'api_key', 'new_api_key_value');
        console.log('设置成功');

        // 3. 获取所有配置
        const allConfigs = await getAllKeyValues('config');
        console.log('所有配置:', allConfigs);

        // 4. 删除某个key
        const deleted = await deleteByKey('config', 'old_key');
        console.log('删除成功:', deleted);

        // 5. 自定义列名的使用
        const customValue = await getValueByKey(
            'settings',           // 表名
            'theme',             // key值
            'setting_name',      // key列名
            'setting_value'      // value列名
        );
        console.log('自定义列名查询:', customValue);

    } catch (error) {
        console.error('操作失败:', error);
    } finally {
        // 关闭连接池
        await closePool();
    }
}

// 运行示例
// example();

module.exports = { example };
