const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 腾讯地图配置（安全存储，不暴露给客户端）
const TENCENT_MAP_CONFIG = {
    key: '',  //腾讯地图API密钥
    secretKey: '' //腾讯地图安全密钥
};

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// 导入路由
const airportRoutes = require('./routes/airports');
const flightRoutes = require('./routes/flights');
const { router: mapRoutes, setMapConfig } = require('./routes/map');

// 初始化地图配置
setMapConfig(TENCENT_MAP_CONFIG);

// 使用路由
app.use('/api/airports', airportRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/map', mapRoutes);

// 主页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🛫 飞行自律训练系统已启动`);
    console.log(`🌐 服务器运行在: http://localhost:${PORT}`);
    console.log(`📡 API端点: http://localhost:${PORT}/api`);
});

