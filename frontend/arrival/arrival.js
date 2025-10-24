// ============================================
// 步骤2: 选择目的地 - 使用腾讯地图
// ============================================

const API_BASE_URL = window.location.origin + '/api';
let tencentMap = null;
let mapUtil = null;
let airports = [];
let departure = null;
let selectedArrival = null;
let infoWindows = new Map(); // 存储所有信息窗口
let arrivalMarkersLayer = null; // 保存目的地标记图层引用
let flightRouteLayer = null; // 保存航线路径图层引用

// ============================================
// 初始化
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
    // 检查是否有起点数据
    const departureData = localStorage.getItem('flightDeparture');
    if (!departureData) {
        alert('请先选择起点');
        window.location.href = '../departure/index.html';
        return;
    }
    
    departure = JSON.parse(departureData);
    
    await loadAirports();
    await initArrivalMap();
    initializeEventListeners();
    hideLoading();
});

// ============================================
// 加载机场数据
// ============================================
async function loadAirports() {
    showLoading();
    try {
        const response = await fetch(`${API_BASE_URL}/airports`);
        const data = await response.json();
        
        if (data.success) {
            airports = data.data;
        }
    } catch (error) {
        console.error('加载机场数据失败:', error);
        alert('加载机场数据失败，请刷新页面重试');
    } finally {
        hideLoading();
    }
}

// ============================================
// 初始化腾讯地图
// ============================================
async function initArrivalMap() {
    try {
        mapUtil = window.tencentMapUtil;
        
        // 创建地图
        tencentMap = await mapUtil.createMap('arrival-map', {
            center: new TMap.LatLng(20, 110),
            zoom: 3
        });
        
        // 确保地图正确调整大小
        setTimeout(() => {
            mapUtil.resize();
        }, 100);
        
        // 添加起点标记
        if (departure) {
            addDepartureMarker();
        }
        
        // 添加目的地机场标记
        if (airports && airports.length > 0) {
            addArrivalMarkers();
        }
        
    } catch (error) {
        console.error('初始化腾讯地图失败:', error);
        alert('地图加载失败，请刷新页面重试');
    }
}

// 添加起点标记
function addDepartureMarker() {
    const departureMarker = new TMap.MultiMarker({
        id: 'departure-marker',
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
            })
        },
        geometries: [{
            id: 'departure-point',
            styleId: 'departure',
            position: new TMap.LatLng(departure.latitude, departure.longitude),
            properties: {
                airport: departure
            }
        }]
    });

    // 起点信息窗口
    const departureInfoWindow = new TMap.InfoWindow({
        map: tencentMap,
        position: new TMap.LatLng(departure.latitude, departure.longitude),
        content: `
            <div style="padding: 10px; min-width: 180px;">
                <h4 style="margin: 0 0 8px 0; color: #1f2937;"><i class="fas fa-plane-departure"></i> 起点</h4>
                <p style="margin: 0 0 8px 0; color: #6b7280;"><strong>${departure.name}</strong></p>
                <p style="margin: 0; color: #94a3b8;">${departure.city}</p>
            </div>
        `,
        enableCloseOnClickMap: true
    });
    // 默认关闭信息窗口
    departureInfoWindow.close();

    departureMarker.on('click', () => {
        departureInfoWindow.open();
    });
}

// 添加目的地机场标记
function addArrivalMarkers() {
    // 过滤掉起点机场
    const arrivalAirports = airports.filter(airport => 
        !departure || airport.id !== departure.id
    );

    // 创建几何数据
    const geometries = arrivalAirports.map(airport => ({
        id: `arrival-${airport.id}`,
        styleId: 'default',
        position: new TMap.LatLng(airport.latitude, airport.longitude),
        properties: {
            airport: airport
        }
    }));

    // 创建标记管理器
    arrivalMarkersLayer = new TMap.MultiMarker({
        id: 'arrival-markers',
        map: tencentMap,
        styles: {
            'default': new TMap.MarkerStyle({
                'width': 40,
                'height': 40,
                'src': 'data:image/svg+xml;base64,' + btoa(`
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                        <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m271.5 719.5c-35.3 35.3-76.4 63-122.1 82.3-47.3 20-97.6 30.2-149.4 30.2s-102.1-10.1-149.4-30.2c-45.7-19.3-86.8-47-122.1-82.3s-63-76.4-82.3-122.1c-20-47.3-30.2-97.6-30.2-149.4s10.1-102.1 30.2-149.4c19.3-45.7 47-86.8 82.3-122.1s76.4-63 122.1-82.3c47.3-20 97.6-30.2 149.4-30.2s102.1 10.1 149.4 30.2c45.7 19.3 86.8 47 122.1 82.3s63 76.4 82.3 122.1c20 47.3 30.2 97.6 30.2 149.4s-10.1 102.1-30.2 149.4c-19.3 45.7-47 86.8-82.3 122.1z" fill="#7c3aed"/>
                        <path d="M544 685V543l256 64v-64L544 416.3V282c0-54.6-14.4-99-32-99s-32 44.4-32 99v134.3L224 543v64l256-64v177l-128 70v35l160-29.2L672 825v-35l-128-70v-35z" fill="#ffffff"/>
                    </svg>
                `),
                'anchor': { x: 20, y: 20 }
            }),
            'selected': new TMap.MarkerStyle({
                'width': 50,
                'height': 50,
                'src': 'data:image/svg+xml;base64,' + btoa(`
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                        <defs>
                            <filter id="glow2" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
                                <feOffset dx="0" dy="0" result="offsetblur"/>
                                <feComponentTransfer>
                                    <feFuncA type="linear" slope="0.8"/>
                                </feComponentTransfer>
                                <feMerge>
                                    <feMergeNode/>
                                    <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                            </filter>
                        </defs>
                        <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m271.5 719.5c-35.3 35.3-76.4 63-122.1 82.3-47.3 20-97.6 30.2-149.4 30.2s-102.1-10.1-149.4-30.2c-45.7-19.3-86.8-47-122.1-82.3s-63-76.4-82.3-122.1c-20-47.3-30.2-97.6-30.2-149.4s10.1-102.1 30.2-149.4c19.3-45.7 47-86.8 82.3-122.1s76.4-63 122.1-82.3c47.3-20 97.6-30.2 149.4-30.2s102.1 10.1 149.4 30.2c45.7 19.3 86.8 47 122.1 82.3s63 76.4 82.3 122.1c20 47.3 30.2 97.6 30.2 149.4s-10.1 102.1-30.2 149.4c-19.3 45.7-47 86.8-82.3 122.1z" fill="#10b981" filter="url(#glow2)"/>
                        <path d="M544 685V543l256 64v-64L544 416.3V282c0-54.6-14.4-99-32-99s-32 44.4-32 99v134.3L224 543v64l256-64v177l-128 70v35l160-29.2L672 825v-35l-128-70v-35z" fill="#ffffff"/>
                        <circle cx="512" cy="512" r="450" fill="none" stroke="#10b981" stroke-width="20" opacity="0.3">
                            <animate attributeName="r" from="450" to="480" dur="1.5s" begin="0s" repeatCount="indefinite"/>
                            <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" begin="0s" repeatCount="indefinite"/>
                        </circle>
                    </svg>
                `),
                'anchor': { x: 25, y: 25 }
            })
        },
        geometries: geometries
    });
    
    // 不再创建信息窗口，飞行信息在顶部卡片中显示
    infoWindows.clear();
    
    // 监听标记点击事件
    arrivalMarkersLayer.on('click', (evt) => {
        const geometry = evt.geometry;
        if (geometry && geometry.properties && geometry.properties.airport) {
            const airport = geometry.properties.airport;
            hapticFeedback('light');
            
            // 平滑移动并放大到该机场
            tencentMap.easeTo({
                center: new TMap.LatLng(airport.latitude, airport.longitude),
                zoom: 9,
                duration: 1000 // 动画持续时间1秒
            });
            
            // 选择机场
            selectArrivalAirport(airport);
        }
    });
}

async function selectArrivalAirport(airport) {
    selectedArrival = airport;
    
    // 更新UI
    displaySelectedAirport(airport);
    
    // 高亮选中的标记 - 使用腾讯地图API
    if (arrivalMarkersLayer) {
            // 重置所有标记为默认样式
            const geometries = arrivalMarkersLayer.getGeometries();
            geometries.forEach(geometry => {
                if (geometry.properties && geometry.properties.airport) {
                    if (geometry.properties.airport.id === airport.id) {
                        // 选中的标记使用高亮样式
                        geometry.styleId = 'selected';
                    } else {
                        // 其他标记使用默认样式
                        geometry.styleId = 'default';
                    }
                }
            });
            // 更新标记显示
            arrivalMarkersLayer.updateGeometries(geometries);
    }
    
    // 计算飞行信息
    await calculateFlightInfo();
    
    // 显示航线
    showRouteOnMap();
}

function displaySelectedAirport(airport) {
    const container = document.getElementById('selected-arrival');
    const nameEl = document.getElementById('arrival-name');
    const cityEl = document.getElementById('arrival-city');
    
    nameEl.textContent = airport.name;
    cityEl.textContent = `${airport.city}, ${airport.country}`;
    container.style.display = 'block';
    
    // 采用后端算法：先显示占位“计算中…”，待后端返回后更新
    const distanceEl = document.getElementById('flight-distance');
    const timeEl = document.getElementById('flight-time');
    if (distanceEl) distanceEl.textContent = '计算中…';
    if (timeEl) timeEl.textContent = '计算中…';
    const nextBtn = document.getElementById('btn-step2-next');
    if (nextBtn) nextBtn.disabled = true;
}

async function calculateFlightInfo() {
    if (!departure || !selectedArrival) return;
    
    // 仅使用后端算法：请求期间显示“计算中…”
    const distanceEl = document.getElementById('flight-distance');
    const timeEl = document.getElementById('flight-time');
    if (distanceEl) distanceEl.textContent = '计算中…';
    if (timeEl) timeEl.textContent = '计算中…';
    document.getElementById('btn-step2-next').disabled = true;
    
    try {
        const response = await fetch(`${API_BASE_URL}/flights/calculate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                departureId: departure.id,
                arrivalId: selectedArrival.id
            })
        });
        
        const data = await response.json();
        if (data.success) {
            // 保存到 localStorage
            localStorage.setItem('flightArrival', JSON.stringify(selectedArrival));
            localStorage.setItem('flightDistance', data.data.distance);
            localStorage.setItem('flightTime', JSON.stringify(data.data.flightTime));
            
            // 显示飞行信息在机场卡片中
            document.getElementById('flight-distance').textContent = `${data.data.distance.toFixed(0)} 公里`;
            document.getElementById('flight-time').textContent = 
                `${data.data.flightTime.hours}小时${data.data.flightTime.minutes}分钟`;
            document.getElementById('btn-step2-next').disabled = false;
        }
    } catch (error) {
        console.error('后端飞行信息计算失败:', error);
        if (distanceEl) distanceEl.textContent = '-';
        if (timeEl) timeEl.textContent = '-';
        document.getElementById('btn-step2-next').disabled = true;
    }
}

function showRouteOnMap() {
    if (!departure || !selectedArrival || !tencentMap) return;
    
    // 清除之前的航线
    if (flightRouteLayer) {
        flightRouteLayer.setMap(null);
        flightRouteLayer = null;
    }
    
    // 绘制飞行路径
    flightRouteLayer = new TMap.MultiPolyline({
        id: 'flight-route',
        map: tencentMap,
        styles: {
            'route': new TMap.PolylineStyle({
                color: '#2563eb',
                width: 3,
                borderColor: '#ffffff',
                borderWidth: 1,
                lineCap: 'round'
            })
        },
        geometries: [{
            id: 'route-line',
            styleId: 'route',
            paths: [
                new TMap.LatLng(departure.latitude, departure.longitude),
                new TMap.LatLng(selectedArrival.latitude, selectedArrival.longitude)
            ]
        }]
    });
    
    // 调整地图视图以显示完整航线（确保传入的为西南/东北两点）
    const minLat = Math.min(departure.latitude, selectedArrival.latitude);
    const minLng = Math.min(departure.longitude, selectedArrival.longitude);
    const maxLat = Math.max(departure.latitude, selectedArrival.latitude);
    const maxLng = Math.max(departure.longitude, selectedArrival.longitude);
    const sw = new TMap.LatLng(minLat, minLng);
    const ne = new TMap.LatLng(maxLat, maxLng);
    const bounds = new TMap.LatLngBounds(sw, ne);
    
    tencentMap.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 }
    });
}

// ============================================
// 事件监听器
// ============================================
function initializeEventListeners() {
    const backBtn = document.getElementById('btn-step2-back');
    const nextBtn = document.getElementById('btn-step2-next');
    
    // 上一步按钮
    backBtn.addEventListener('click', () => {
        hapticFeedback();
        window.location.href = '../departure/index.html';
    });
    
    // 下一步按钮
    nextBtn.addEventListener('click', () => {
        if (!nextBtn.disabled) {
            hapticFeedback();
            window.location.href = '../seat/index.html';
        }
    });
    
    // 触摸反馈效果
    [backBtn, nextBtn].forEach(btn => {
        btn.addEventListener('touchstart', () => {
            if (!btn.disabled) {
                hapticFeedback('light');
            }
        }, { passive: true });
    });
    
    // 监听窗口大小变化，确保地图正确调整
    window.addEventListener('resize', () => {
        if (tencentMap && mapUtil) {
            setTimeout(() => {
                mapUtil.resize();
            }, 100);
        }
    });
}

// ============================================
// 工具函数
// ============================================
function showLoading() {
    document.getElementById('loading-overlay').classList.add('active');
}

function hideLoading() {
    document.getElementById('loading-overlay').classList.remove('active');
}

// 触摸反馈（振动）
function hapticFeedback(type = 'medium') {
    if ('vibrate' in navigator) {
        switch(type) {
            case 'light':
                navigator.vibrate(10);
                break;
            case 'medium':
                navigator.vibrate(20);
                break;
            case 'heavy':
                navigator.vibrate(30);
                break;
            default:
                navigator.vibrate(20);
        }
    }
}

// 计算两点之间的距离（使用Haversine公式）
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // 地球半径（公里）
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
}

// 根据距离计算飞行时间
function calculateFlightTime(distance) {
    const avgSpeed = 800; // 平均飞行速度 800 km/h
    const totalMinutes = Math.round((distance / avgSpeed) * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
        return `${hours}小时${minutes}分钟`;
    } else {
        return `${minutes}分钟`;
    }
}
