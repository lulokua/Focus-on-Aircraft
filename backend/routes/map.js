const express = require('express');
const crypto = require('crypto');
const https = require('https');
const router = express.Router();

// 从 server.js 传入的腾讯地图配置
let mapConfig = null;

// 设置地图配置的函数
function setMapConfig(config) {
    mapConfig = config;
}

// 计算腾讯地图API签名
function calculateSignature(path, params, secretKey) {
    // 对参数按键名排序
    const sortedKeys = Object.keys(params).sort();
    const sortedParams = sortedKeys.map(key => `${key}=${params[key]}`).join('&');
    
    // 拼接字符串：请求路径 + ? + 排序后的参数 + secretKey
    const stringToSign = `${path}?${sortedParams}${secretKey}`;
    
    // 计算MD5签名
    const signature = crypto.createHash('md5').update(stringToSign).digest('hex');
    return signature;
}

// 代理腾讯地图API请求
function proxyTencentMapRequest(apiPath, params, res) {
    if (!mapConfig) {
        return res.status(500).json({ error: '地图配置未初始化' });
    }

    // 添加key参数
    const requestParams = { ...params, key: mapConfig.key };
    
    // 计算签名
    const signature = calculateSignature(apiPath, requestParams, mapConfig.secretKey);
    
    // 构建请求URL
    const queryString = Object.keys(requestParams)
        .sort()
        .map(key => `${key}=${encodeURIComponent(requestParams[key])}`)
        .join('&');
    
    const url = `https://apis.map.qq.com${apiPath}?${queryString}&sig=${signature}`;
    
    // 发送请求到腾讯地图API
    https.get(url, (response) => {
        let data = '';
        
        response.on('data', (chunk) => {
            data += chunk;
        });
        
        response.on('end', () => {
            try {
                const jsonData = JSON.parse(data);
                res.json(jsonData);
            } catch (error) {
                res.status(500).json({ error: '解析响应数据失败' });
            }
        });
    }).on('error', (error) => {
        console.error('腾讯地图API请求失败:', error);
        res.status(500).json({ error: '地图服务请求失败' });
    });
}

// 地点搜索API
router.get('/search', (req, res) => {
    const { keyword, boundary, page_size = 20, page_index = 1 } = req.query;
    
    if (!keyword) {
        return res.status(400).json({ error: '搜索关键词不能为空' });
    }
    
    const params = {
        keyword,
        page_size,
        page_index
    };
    
    if (boundary) {
        params.boundary = boundary;
    }
    
    proxyTencentMapRequest('/place/v1/search', params, res);
});

// 逆地址解析API（根据坐标获取位置信息）
router.get('/geocoder', (req, res) => {
    const { location, get_poi = 1 } = req.query;
    
    if (!location) {
        return res.status(400).json({ error: '位置坐标不能为空' });
    }
    
    const params = {
        location,
        get_poi
    };
    
    proxyTencentMapRequest('/ws/geocoder/v1', params, res);
});

// 地址解析API（将地址转换为坐标）
router.get('/address', (req, res) => {
    const { address, region } = req.query;
    
    if (!address) {
        return res.status(400).json({ error: '地址不能为空' });
    }
    
    const params = { address };
    if (region) {
        params.region = region;
    }
    
    proxyTencentMapRequest('/ws/geocoder/v1', params, res);
});

// 路线规划API
router.get('/direction', (req, res) => {
    const { from, to, mode = 'driving' } = req.query;
    
    if (!from || !to) {
        return res.status(400).json({ error: '起点和终点坐标不能为空' });
    }
    
    const params = {
        from,
        to,
        mode
    };
    
    proxyTencentMapRequest('/ws/direction/v1/driving', params, res);
});

// 获取地图基础配置（不包含敏感信息）
router.get('/config', (req, res) => {
    res.json({
        mapApiUrl: 'https://map.qq.com/api/gljs',
        version: 'v1.exp',
        libraries: 'geometry,convertor'
    });
});

// 静态地图API（生成地图图片）
router.get('/staticmap', (req, res) => {
    const { 
        center, 
        zoom = 10, 
        size = '600*400', 
        maptype = 'roadmap',
        markers,
        paths 
    } = req.query;
    
    if (!center) {
        return res.status(400).json({ error: '地图中心点坐标不能为空' });
    }
    
    const params = {
        center,
        zoom,
        size,
        maptype
    };
    
    if (markers) params.markers = markers;
    if (paths) params.paths = paths;
    
    proxyTencentMapRequest('/ws/staticmap/v2', params, res);
});

module.exports = { router, setMapConfig };
