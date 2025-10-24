const express = require('express');
const router = express.Router();
const airportsData = require('../data/airports.json');

// 获取所有机场
router.get('/', (req, res) => {
    res.json({
        success: true,
        data: airportsData
    });
});

// 根据位置查找最近的机场
router.post('/nearest', (req, res) => {
    const { latitude, longitude } = req.body;
    
    if (!latitude || !longitude) {
        return res.status(400).json({
            success: false,
            message: '缺少经纬度参数'
        });
    }

    // 计算距离（简化版）
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // 地球半径（公里）
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // 计算所有机场的距离并排序
    const airportsWithDistance = airportsData.map(airport => ({
        ...airport,
        distance: calculateDistance(latitude, longitude, airport.latitude, airport.longitude)
    })).sort((a, b) => a.distance - b.distance);

    res.json({
        success: true,
        data: airportsWithDistance.slice(0, 5) // 返回最近的5个机场
    });
});

// 根据ID获取机场信息
router.get('/:id', (req, res) => {
    const airport = airportsData.find(a => a.id === req.params.id.toUpperCase());
    
    if (!airport) {
        return res.status(404).json({
            success: false,
            message: '未找到该机场'
        });
    }

    res.json({
        success: true,
        data: airport
    });
});

module.exports = router;

