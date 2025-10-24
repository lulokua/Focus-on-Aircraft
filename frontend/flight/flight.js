// ============================================
// 飞行中页面 - 使用腾讯地图
// ============================================

let tencentMap = null;
let mapUtil = null;
let flightStartTime = null;
let flightTimer = null;
let isPaused = false;
let pauseStartTime = null;
let totalPauseTime = 0;

let departure = null;
let arrival = null;
let flightDistance = 0;
let estimatedFlightTime = 0;

// 缩放控制
let isZoomedToPlane = false;
let followPlaneMode = false;

// 飞机标记
let airplaneMarker = null;

// 飞机SVG默认朝向校准（度）
// 默认按正北(0°)为基准；如仍有偏差，可调用 setAirplaneHeadingOffset() 动态校准
const AIRPLANE_SVG_HEADING_DEFAULT = 0;
let airplaneHeadingOffset = (() => {
    const saved = parseFloat(localStorage.getItem('airplaneHeadingOffset'));
    return Number.isFinite(saved) ? saved : AIRPLANE_SVG_HEADING_DEFAULT;
})();

// 记录最近一次渲染的进度（0-1），用于动态校准后重绘
let lastProgress = 0;
let lastAngle = null; // 记录上次的角度，避免重复更新样式

// 构建飞机SVG（默认朝正北）
function buildAirplaneSVGWithRotation(angleDeg) {
    // 将角度限制到 0-360，并加180度修正方向
    const angle = ((angleDeg + 180) % 360 + 360) % 360;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="48" height="48">
        <g transform="rotate(${angle} 32 32)">
            <path d="M 32 8 L 36 28 L 36 48 L 34 52 L 30 52 L 28 48 L 28 28 Z" fill="#3b82f6" stroke="#1e40af" stroke-width="1"/>
            <path d="M 32 22 L 12 30 L 14 34 L 32 28 L 50 34 L 52 30 Z" fill="#60a5fa" stroke="#1e40af" stroke-width="1"/>
            <path d="M 28 48 L 20 52 L 22 54 L 28 52 L 36 52 L 42 54 L 44 52 L 36 48 Z" fill="#60a5fa" stroke="#1e40af" stroke-width="1"/>
            <path d="M 30 48 L 32 56 L 34 48 Z" fill="#93c5fd" stroke="#1e40af" stroke-width="0.5"/>
            <circle cx="32" cy="8" r="3" fill="#1e40af"/>
        </g>
    </svg>`;
}

// ============================================
// 初始化
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // 检查飞行数据
    if (!checkFlightData()) {
        alert('飞行数据不完整，请重新开始');
        window.location.href = '../welcome/index.html';
        return;
    }
    
    loadFlightData();
    initFlightMap().then(() => {
        initFlightTimer();
        initializeEventListeners();
    });
});

function checkFlightData() {
    return localStorage.getItem('flightDeparture') &&
           localStorage.getItem('flightArrival') &&
           localStorage.getItem('flightStartTime');
}

function loadFlightData() {
    departure = JSON.parse(localStorage.getItem('flightDeparture'));
    arrival = JSON.parse(localStorage.getItem('flightArrival'));
    flightDistance = parseFloat(localStorage.getItem('flightDistance'));
    const flightTime = JSON.parse(localStorage.getItem('flightTime'));
    estimatedFlightTime = flightTime.hours * 3600 + flightTime.minutes * 60;
    flightStartTime = parseInt(localStorage.getItem('flightStartTime'));
}

// ============================================
// 腾讯地图初始化
// ============================================
async function initFlightMap() {
    try {
        mapUtil = window.tencentMapUtil;
        
        // 计算地图中心点
        const centerLat = (departure.latitude + arrival.latitude) / 2;
        const centerLng = (departure.longitude + arrival.longitude) / 2;
        
        // 创建地图
        tencentMap = await mapUtil.createMap('flight-map', {
            center: new TMap.LatLng(centerLat, centerLng),
            zoom: 6
        });
        
        // 确保地图正确调整大小
        setTimeout(() => {
            mapUtil.resize();
        }, 100);
        
        // 添加机场标记（使用 try-catch 避免影响整体加载）
        try {
            addFlightMarkers();
        } catch (error) {
            console.error('添加机场标记失败:', error);
        }
        
        // 添加飞行路径（使用 try-catch 避免影响整体加载）
        try {
            addFlightRoute();
        } catch (error) {
            console.error('添加飞行路径失败:', error);
        }
        
        // 调整视图以显示完整路径（使用 try-catch 避免影响整体加载）
        try {
            adjustMapView();
        } catch (error) {
            console.error('调整地图视图失败:', error);
        }
        
        // 添加飞机标记
        try {
            addAirplaneMarker();
        } catch (error) {
            console.error('添加飞机标记失败:', error);
        }
        
    } catch (error) {
        console.error('初始化腾讯地图失败:', error);
        alert('地图加载失败，请刷新页面重试');
    }
}

// 添加起点和终点标记
function addFlightMarkers() {
    // 创建起点和终点标记
    const flightMarkers = new TMap.MultiMarker({
        id: 'flight-markers',
        map: tencentMap,
        styles: {
            'departure': new TMap.MarkerStyle({
                'width': 20,
                'height': 20,
                'src': 'data:image/svg+xml;base64,' + btoa(`
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2563eb">
                        <circle cx="12" cy="12" r="10" fill="#2563eb" stroke="#fff" stroke-width="3"/>
                        <circle cx="12" cy="12" r="5" fill="#fff"/>
                    </svg>
                `),
                'anchor': { x: 10, y: 10 }
            }),
            'arrival': new TMap.MarkerStyle({
                'width': 20,
                'height': 20,
                'src': 'data:image/svg+xml;base64,' + btoa(`
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#10b981">
                        <circle cx="12" cy="12" r="10" fill="#10b981" stroke="#fff" stroke-width="3"/>
                        <circle cx="12" cy="12" r="5" fill="#fff"/>
                    </svg>
                `),
                'anchor': { x: 10, y: 10 }
            })
        },
        geometries: [
            {
                id: 'departure-point',
                styleId: 'departure',
                position: new TMap.LatLng(departure.latitude, departure.longitude),
                properties: {
                    type: 'departure',
                    airport: departure
                }
            },
            {
                id: 'arrival-point',
                styleId: 'arrival',
                position: new TMap.LatLng(arrival.latitude, arrival.longitude),
                properties: {
                    type: 'arrival',
                    airport: arrival
                }
            }
        ]
    });

    // 创建信息窗口
    const departureInfoWindow = new TMap.InfoWindow({
        map: tencentMap,
        position: new TMap.LatLng(departure.latitude, departure.longitude),
        content: `
            <div style="padding: 10px;">
                <strong>起点:</strong> ${departure.name}
            </div>
        `,
        enableCloseOnClickMap: true
    });
    // 默认关闭信息窗口
    departureInfoWindow.close();

    const arrivalInfoWindow = new TMap.InfoWindow({
        map: tencentMap,
        position: new TMap.LatLng(arrival.latitude, arrival.longitude),
        content: `
            <div style="padding: 10px;">
                <strong>目的地:</strong> ${arrival.name}
            </div>
        `,
        enableCloseOnClickMap: true
    });
    // 默认关闭信息窗口
    arrivalInfoWindow.close();

    // 监听点击事件
    flightMarkers.on('click', (evt) => {
        const geometry = evt.geometry;
        if (geometry && geometry.properties) {
            if (geometry.properties.type === 'departure') {
                departureInfoWindow.open();
            } else if (geometry.properties.type === 'arrival') {
                arrivalInfoWindow.open();
            }
        }
    });
}

// 添加飞行路径
function addFlightRoute() {
    const flightRoute = new TMap.MultiPolyline({
        id: 'flight-route',
        map: tencentMap,
        styles: {
            'route': new TMap.PolylineStyle({
                'color': '#7c3aed',
                'width': 3,
                'borderColor': '#ffffff',
                'borderWidth': 1,
                'lineCap': 'round',
                'dashArray': [10, 10]
            })
        },
        geometries: [{
            id: 'route-line',
            styleId: 'route',
            paths: [
                new TMap.LatLng(departure.latitude, departure.longitude),
                new TMap.LatLng(arrival.latitude, arrival.longitude)
            ]
        }]
    });
}

// 调整地图视图
function adjustMapView() {
    const bounds = new TMap.LatLngBounds(
        new TMap.LatLng(departure.latitude, departure.longitude),
        new TMap.LatLng(arrival.latitude, arrival.longitude)
    );
    
    tencentMap.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 }
    });
}

// 添加飞机标记
function addAirplaneMarker() {
    // 重置角度记录
    lastAngle = null;
    
    // 计算飞机初始位置（起点）
    const initialPosition = new TMap.LatLng(departure.latitude, departure.longitude);
    
    // 计算初始朝向角度（从出发地指向目的地）
    const initialAngle = calculateBearing(
        { lat: departure.latitude, lng: departure.longitude },
        { lat: arrival.latitude, lng: arrival.longitude }
    );
    
    // 初始飞机图标（使用正确的初始角度）
    const airplaneSVG = buildAirplaneSVGWithRotation(initialAngle);
    lastAngle = initialAngle; // 记录初始角度
    
    // 创建飞机标记
    airplaneMarker = new TMap.MultiMarker({
        id: 'airplane-marker',
        map: tencentMap,
        styles: {
            'airplane': new TMap.MarkerStyle({
                'width': 48,
                'height': 48,
                'src': 'data:image/svg+xml;base64,' + btoa(airplaneSVG),
                'anchor': { x: 24, y: 24 },
                'rotation': 0
            })
        },
        geometries: [{
            id: 'airplane',
            styleId: 'airplane',
            position: initialPosition,
            properties: {
                type: 'airplane'
            }
        }]
    });
    
    console.log('✓ 飞机标记已添加');
}

// 更新飞机位置
function updateAirplanePosition(progress) {
    if (!airplaneMarker || !departure || !arrival) return;
    lastProgress = progress;
    
    // 根据进度计算飞机当前位置（线性插值）
    const currentLat = departure.latitude + (arrival.latitude - departure.latitude) * progress;
    const currentLng = departure.longitude + (arrival.longitude - departure.longitude) * progress;
    
    // 计算飞机朝向角度（从当前位置指向终点）
    const angle = calculateBearing(
        { lat: currentLat, lng: currentLng },
        { lat: arrival.latitude, lng: arrival.longitude }
    );
    
    // 只更新位置，不频繁更新样式
    airplaneMarker.updateGeometries([{
        id: 'airplane',
        styleId: 'airplane',
        position: new TMap.LatLng(currentLat, currentLng),
        properties: {
            type: 'airplane'
        }
    }]);
    
    // 只有角度变化超过阈值时才更新样式，避免频繁重建SVG
    const angleDiff = lastAngle !== null ? Math.abs(angle - lastAngle) : 360; // 首次必须更新
    if (angleDiff > 5) { // 角度变化超过5度才更新
        lastAngle = angle;
        const rotatedSVG = buildAirplaneSVGWithRotation(angle);
        airplaneMarker.setStyles({
            'airplane': new TMap.MarkerStyle({
                'width': 48,
                'height': 48,
                'src': 'data:image/svg+xml;base64,' + btoa(rotatedSVG),
                'anchor': { x: 24, y: 24 },
                'rotation': 0
            })
        });
    }
    
    // 如果启用了跟随模式，让地图中心跟随飞机（降低频率避免过度渲染）
    if (followPlaneMode && tencentMap) {
        // 使用节流，每100ms最多更新一次地图中心
        if (!updateAirplanePosition.lastCenterUpdate || Date.now() - updateAirplanePosition.lastCenterUpdate > 100) {
            tencentMap.setCenter(new TMap.LatLng(currentLat, currentLng));
            updateAirplanePosition.lastCenterUpdate = Date.now();
        }
    }
}

// 计算两点间的方位角
function calculateBearing(start, end) {
    const startLat = start.lat * Math.PI / 180;
    const startLng = start.lng * Math.PI / 180;
    const endLat = end.lat * Math.PI / 180;
    const endLng = end.lng * Math.PI / 180;
    
    const dLng = endLng - startLng;
    
    const y = Math.sin(dLng) * Math.cos(endLat);
    const x = Math.cos(startLat) * Math.sin(endLat) -
              Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);
    
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    
    // 调整角度，使飞机图标正确朝向飞行方向
    // 将bearing从-180~180转换为0~360；TMap旋转角度以正北为0度，顺时针为正
    bearing = (bearing + 360) % 360;
    // 校正SVG本身的基准朝向（可动态调整）
    const rotation = (bearing - airplaneHeadingOffset + 360) % 360;
    return rotation;
}

// 提供运行时校准接口：window.setAirplaneHeadingOffset(deg)
window.setAirplaneHeadingOffset = function(deg) {
    const parsed = parseFloat(deg);
    if (!Number.isFinite(parsed)) {
        console.warn('setAirplaneHeadingOffset: 非法角度', deg);
        return;
    }
    airplaneHeadingOffset = ((parsed % 360) + 360) % 360;
    localStorage.setItem('airplaneHeadingOffset', airplaneHeadingOffset.toString());
    // 立即按最近进度重绘角度
    try {
        updateAirplanePosition(lastProgress || 0);
    } catch (e) {
        console.warn('重绘飞机角度失败:', e);
    }
    console.log('✓ 已设置飞机SVG朝向偏移为', airplaneHeadingOffset, '度');
}

// ============================================
// 飞行计时器
// ============================================
function initFlightTimer() {
    updateFlightTimer();
    // 使用高频率更新（16ms ≈ 60fps）实现超流畅移动
    flightTimer = setInterval(updateFlightTimer, 16);
}

function updateFlightTimer() {
    if (isPaused) return;
    
    const now = Date.now();
    const elapsed = (now - flightStartTime - totalPauseTime) / 1000;
    
    // 更新计时器显示（每秒更新一次显示就够了）
    const elapsedSeconds = Math.floor(elapsed);
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;
    
    document.getElementById('flight-timer').textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // 更新进度（使用毫秒级精度）
    const progress = Math.min((elapsed / estimatedFlightTime) * 100, 100);
    document.getElementById('flight-progress').textContent = `${Math.round(progress)}%`;
    
    // 更新飞机位置（进度转换为0-1的比例，使用毫秒级精度实现平滑移动）
    updateAirplanePosition(progress / 100);
    
    // 检查是否到达目的地
    if (elapsed >= estimatedFlightTime) {
        completeFlight();
    }
}

// ============================================
// 事件监听器
// ============================================
function initializeEventListeners() {
    document.getElementById('btn-zoom-toggle').addEventListener('click', toggleZoom);
    document.getElementById('btn-pause-flight').addEventListener('click', pauseFlight);
    document.getElementById('btn-emergency-land').addEventListener('click', emergencyLand);
    document.getElementById('btn-resume-flight').addEventListener('click', resumeFlight);
    document.getElementById('btn-end-flight').addEventListener('click', endFlight);
}

// 缩放切换函数
function toggleZoom() {
    const zoomBtn = document.getElementById('btn-zoom-toggle');
    const zoomIcon = zoomBtn.querySelector('i');
    const zoomText = zoomBtn.lastChild;
    
    if (isZoomedToPlane) {
        // 当前是放大状态，切换到全图
        zoomToFullRoute();
        isZoomedToPlane = false;
        followPlaneMode = false;
        zoomIcon.className = 'fas fa-search-plus';
        zoomText.textContent = ' 放大飞机';
    } else {
        // 当前是全图状态，切换到飞机
        zoomToPlane();
        isZoomedToPlane = true;
        followPlaneMode = true;
        zoomIcon.className = 'fas fa-search-minus';
        zoomText.textContent = ' 缩小全图';
    }
}

// 放大到飞机位置
function zoomToPlane() {
    if (!airplaneMarker || !tencentMap) return;
    
    // 获取飞机当前位置
    const geometries = airplaneMarker.getGeometries();
    if (geometries && geometries.length > 0) {
        const planePosition = geometries[0].position;
        
        // 设置地图中心到飞机位置，并放大（zoom值越大越近）
        tencentMap.easeTo({
            center: planePosition,
            zoom: 18,
            duration: 800
        });
    }
}

// 缩小到全图
function zoomToFullRoute() {
    if (!tencentMap) return;
    
    // 调用原有的adjustMapView函数来显示完整路径
    adjustMapView();
}

function pauseFlight() {
    isPaused = true;
    pauseStartTime = Date.now();
    document.getElementById('flight-status').textContent = '已暂停';
    document.getElementById('pause-modal').classList.add('active');
}

function resumeFlight() {
    if (pauseStartTime) {
        totalPauseTime += Date.now() - pauseStartTime;
        pauseStartTime = null;
    }
    isPaused = false;
    document.getElementById('flight-status').textContent = '飞行中';
    document.getElementById('pause-modal').classList.remove('active');
}

function emergencyLand() {
    if (confirm('确定要紧急降落吗？这将结束当前飞行。')) {
        endFlight();
    }
}

function endFlight() {
    clearFlightTimer();
    
    // 保存飞行结束时间
    localStorage.setItem('flightEndTime', Date.now().toString());
    localStorage.setItem('flightCompleted', 'false');
    
    window.location.href = '../completion/index.html';
}

function completeFlight() {
    clearFlightTimer();
    
    // 保存飞行完成信息
    localStorage.setItem('flightEndTime', Date.now().toString());
    localStorage.setItem('flightCompleted', 'true');
    
    // 显示完成动画
    document.getElementById('flight-status').textContent = '已到达';
    
    setTimeout(() => {
        window.location.href = '../completion/index.html';
    }, 2000);
}

// 清理飞行计时器和相关状态
function clearFlightTimer() {
    if (flightTimer) {
        clearInterval(flightTimer);
        flightTimer = null;
    }
    // 重置节流状态
    if (updateAirplanePosition.lastCenterUpdate) {
        delete updateAirplanePosition.lastCenterUpdate;
    }
}
