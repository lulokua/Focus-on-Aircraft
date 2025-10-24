const express = require('express');
const router = express.Router();
const airportsData = require('../data/airports.json');

// 计算飞行信息
router.post('/calculate', (req, res) => {
    const { departureId, arrivalId } = req.body;
    
    if (!departureId || !arrivalId) {
        return res.status(400).json({
            success: false,
            message: '缺少出发地或目的地'
        });
    }

    const departure = airportsData.find(a => a.id === departureId);
    const arrival = airportsData.find(a => a.id === arrivalId);

    if (!departure || !arrival) {
        return res.status(404).json({
            success: false,
            message: '未找到机场信息'
        });
    }

    // 计算距离
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const distance = calculateDistance(
        departure.latitude,
        departure.longitude,
        arrival.latitude,
        arrival.longitude
    );

    // 估算飞行时间（平均速度800km/h）
    const flightTimeHours = distance / 800;
    const flightTimeMinutes = Math.round(flightTimeHours * 60);

    res.json({
        success: true,
        data: {
            departure,
            arrival,
            distance: Math.round(distance),
            flightTime: {
                hours: Math.floor(flightTimeMinutes / 60),
                minutes: flightTimeMinutes % 60,
                totalMinutes: flightTimeMinutes
            }
        }
    });
});

// 保存飞行记录
const flightHistory = [];

router.post('/save', (req, res) => {
    const flightRecord = {
        id: Date.now(),
        ...req.body,
        timestamp: new Date().toISOString()
    };

    flightHistory.push(flightRecord);

    res.json({
        success: true,
        message: '飞行记录已保存',
        data: flightRecord
    });
});

// 获取飞行历史
router.get('/history', (req, res) => {
    res.json({
        success: true,
        data: flightHistory
    });
});

module.exports = router;

