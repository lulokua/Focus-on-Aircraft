// ============================================
// 步骤1: 选择起点 - 使用腾讯地图
// ============================================

const API_BASE_URL = window.location.origin + '/api';
let tencentMap = null;
let mapUtil = null;
let airports = [];
let selectedDeparture = null;
let infoWindows = new Map(); // 存储所有信息窗口
let departureMarkers = null;

// ============================================
// 初始化
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
    await loadAirports();
    await initDepartureMap();
    initializeEventListeners();
    updateNextButton(false); // 初始化按钮状态
    checkFirstVisit();
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
        alert('加载机场数据失败，请刷新页面重试');
    } finally {
        hideLoading();
    }
}

// ============================================
// 首次访问检查和自动定位
// ============================================
function checkFirstVisit() {
    const hasVisited = localStorage.getItem('hasVisited');
    const locationPermission = localStorage.getItem('locationPermission');
    
    if (!hasVisited) {
        localStorage.setItem('hasVisited', 'true');
        
        if (!locationPermission && navigator.geolocation) {
            // 延迟执行，确保地图已经初始化
            setTimeout(() => requestLocationPermission(), 300);
        }
    } else if (locationPermission === 'granted') {
        // 延迟执行，确保地图已经初始化
        setTimeout(() => autoLocateNearestAirport(), 300);
    }
}

async function requestLocationPermission() {
    if (!navigator.geolocation) return;
    
    const shouldRequest = confirm(
        '🌍 允许访问您的位置信息吗？\n\n' +
        '这将帮助我们自动为您选择最近的机场。\n' +
        '您的位置信息仅用于此目的，不会被存储或分享。'
    );
    
    if (shouldRequest) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                localStorage.setItem('locationPermission', 'granted');
                await findNearestAirport(position.coords.latitude, position.coords.longitude);
            },
            (error) => {
                localStorage.setItem('locationPermission', 'denied');
            }
        );
    } else {
        localStorage.setItem('locationPermission', 'denied');
    }
}

async function autoLocateNearestAirport() {
    if (!navigator.geolocation) return;
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            await findNearestAirport(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
            localStorage.setItem('locationPermission', 'denied');
        }
    );
}

async function findNearestAirport(latitude, longitude) {
    try {
        const response = await fetch(`${API_BASE_URL}/airports/nearest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ latitude, longitude })
        });
        
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
            const nearestAirport = data.data[0];
            selectDepartureAirport(nearestAirport);
            
            if (tencentMap) {
                tencentMap.setCenter(new TMap.LatLng(nearestAirport.latitude, nearestAirport.longitude));
                tencentMap.setZoom(5);
            }
        }
    } catch (error) {
    }
}

// ============================================
// 初始化腾讯地图
// ============================================
async function initDepartureMap() {
    try {
        mapUtil = window.tencentMapUtil;
        
        // 创建地图
        tencentMap = await mapUtil.createMap('departure-map', {
            center: new TMap.LatLng(20, 110),
            zoom: 3
        });
        
        // 确保地图正确调整大小
        setTimeout(() => {
            mapUtil.resize();
        }, 100);
        
        // 添加机场标记
        if (airports && airports.length > 0) {
            addAirportMarkers();
        }
        
        // 监听地图点击事件
        mapUtil.onClick((position, evt) => {
            // 可以在这里处理地图点击事件
        });
        
    } catch (error) {
        alert('地图加载失败，请刷新页面重试');
    }
}

// 添加机场标记
function addAirportMarkers() {
    // 创建所有机场的几何数据
    const geometries = airports.map(airport => ({
        id: `point-${airport.id}`,
        styleId: 'default',
        position: new TMap.LatLng(airport.latitude, airport.longitude),
        properties: {
            airport: airport
        }
    }));

    // 创建统一的标记管理器
    const multiMarker = new TMap.MultiMarker({
        id: 'multiMarker',
        map: tencentMap,
        styles: {
            'default': new TMap.MarkerStyle({
                'width': 36,
                'height': 36,
                'src': 'data:image/svg+xml;base64,' + btoa(`
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                        <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m271.5 719.5c-35.3 35.3-76.4 63-122.1 82.3-47.3 20-97.6 30.2-149.4 30.2s-102.1-10.1-149.4-30.2c-45.7-19.3-86.8-47-122.1-82.3s-63-76.4-82.3-122.1c-20-47.3-30.2-97.6-30.2-149.4s10.1-102.1 30.2-149.4c19.3-45.7 47-86.8 82.3-122.1s76.4-63 122.1-82.3c47.3-20 97.6-30.2 149.4-30.2s102.1 10.1 149.4 30.2c45.7 19.3 86.8 47 122.1 82.3s63 76.4 82.3 122.1c20 47.3 30.2 97.6 30.2 149.4s-10.1 102.1-30.2 149.4c-19.3 45.7-47 86.8-82.3 122.1z" fill="#2563eb"/>
                        <path d="M544 685V543l256 64v-64L544 416.3V282c0-54.6-14.4-99-32-99s-32 44.4-32 99v134.3L224 543v64l256-64v177l-128 70v35l160-29.2L672 825v-35l-128-70v-35z" fill="#ffffff"/>
                    </svg>
                `),
                'anchor': { x: 18, y: 18 }
            }),
            'selected': new TMap.MarkerStyle({
                'width': 44,
                'height': 44,
                'src': 'data:image/svg+xml;base64,' + btoa(`
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                        <defs>
                            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
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
                        <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m271.5 719.5c-35.3 35.3-76.4 63-122.1 82.3-47.3 20-97.6 30.2-149.4 30.2s-102.1-10.1-149.4-30.2c-45.7-19.3-86.8-47-122.1-82.3s-63-76.4-82.3-122.1c-20-47.3-30.2-97.6-30.2-149.4s10.1-102.1 30.2-149.4c19.3-45.7 47-86.8 82.3-122.1s76.4-63 122.1-82.3c47.3-20 97.6-30.2 149.4-30.2s102.1 10.1 149.4 30.2c45.7 19.3 86.8 47 122.1 82.3s63 76.4 82.3 122.1c20 47.3 30.2 97.6 30.2 149.4s-10.1 102.1-30.2 149.4c-19.3 45.7-47 86.8-82.3 122.1z" fill="#10b981" filter="url(#glow)"/>
                        <path d="M544 685V543l256 64v-64L544 416.3V282c0-54.6-14.4-99-32-99s-32 44.4-32 99v134.3L224 543v64l256-64v177l-128 70v35l160-29.2L672 825v-35l-128-70v-35z" fill="#ffffff"/>
                        <circle cx="512" cy="512" r="450" fill="none" stroke="#10b981" stroke-width="20" opacity="0.3">
                            <animate attributeName="r" from="450" to="480" dur="1.5s" begin="0s" repeatCount="indefinite"/>
                            <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" begin="0s" repeatCount="indefinite"/>
                        </circle>
                    </svg>
                `),
                'anchor': { x: 22, y: 22 }
            })
        },
        geometries: geometries
    });
    
    // 不创建信息窗口，避免阻挡点击事件
    infoWindows.clear();

    // 保存标记引用，供后续高亮使用
    departureMarkers = multiMarker;
    
    // 监听标记点击事件
    multiMarker.on('click', (evt) => {
        const geometry = evt.geometry;
        
        if (geometry && geometry.properties && geometry.properties.airport) {
            const airport = geometry.properties.airport;
            
            // 添加触觉反馈
            if (navigator.vibrate) {
                navigator.vibrate(30);
            }
            
            // 直接选择机场，不显示信息窗口
            selectDepartureAirport(airport);
        } else {
        }
    });
}

function selectDepartureAirport(airport, selectedMarker = null) {
    selectedDeparture = airport;
    
    // 保存到 localStorage
    localStorage.setItem('flightDeparture', JSON.stringify(airport));
    
    // 更新UI
    displaySelectedAirport(airport);
    updateNextButton(true);
    
    // 移动地图中心到选中的机场位置（不自动缩放，保持用户当前视野）
    if (tencentMap && mapUtil) {
        tencentMap.panTo(new TMap.LatLng(airport.latitude, airport.longitude));
    }
    
    // 高亮选中的标记 - 使用腾讯地图API更新所有标记样式
    if (departureMarkers) {
        const geometries = departureMarkers.getGeometries();
        const updates = [];

        geometries.forEach(geometry => {
            if (!geometry.properties || !geometry.properties.airport) {
                return;
            }

            const newStyleId = geometry.properties.airport.id === airport.id
                ? 'selected'
                : 'default';

            if (geometry.styleId !== newStyleId) {
                // 保留原有的 properties 和 position，避免后续点击时丢失机场数据
                updates.push({
                    id: geometry.id,
                    styleId: newStyleId,
                    position: geometry.position,
                    properties: geometry.properties
                });
            }
        });

        if (updates.length > 0) {
            departureMarkers.updateGeometries(updates);
        }
    }
}

function updateNextButton(enabled) {
    const nextBtn = document.getElementById('btn-step1-next');
    
    nextBtn.disabled = !enabled;
    
    if (enabled) {
        nextBtn.innerHTML = `
            下一步
            <i class="fas fa-arrow-right"></i>
        `;
        nextBtn.classList.remove('loading');
    } else {
        nextBtn.innerHTML = `
            请选择起飞机场
            <i class="fas fa-map-marker-alt"></i>
        `;
    }
}

function displaySelectedAirport(airport) {
    const container = document.getElementById('selected-departure');
    const nameEl = document.getElementById('departure-name');
    const cityEl = document.getElementById('departure-city');
    
    nameEl.textContent = airport.name;
    cityEl.textContent = `${airport.city}, ${airport.country}`;
    container.style.display = 'block';
}

// ============================================
// 事件监听器
// ============================================
function initializeEventListeners() {
    const nextBtn = document.getElementById('btn-step1-next');
    const searchBtn = document.getElementById('btn-search-airport');
    const searchModal = document.getElementById('search-modal');
    const closeModalBtn = document.getElementById('close-search-modal');
    const searchInput = document.getElementById('airport-search-input');
    const clearSearchBtn = document.getElementById('clear-search');
    
    
    nextBtn.addEventListener('click', handleNextStep);
    
    // 搜索功能 - 检查所有元素是否存在
    if (searchBtn && searchModal && closeModalBtn && searchInput && clearSearchBtn) {
        
        // 搜索按钮
        searchBtn.addEventListener('click', () => {
            openSearchModal();
        });
        
        // 关闭弹窗
        closeModalBtn.addEventListener('click', () => {
            closeSearchModal();
        });
        
        // 点击背景关闭弹窗
        searchModal.addEventListener('click', (e) => {
            if (e.target === searchModal) {
                closeSearchModal();
            }
        });
        
        // ESC键关闭弹窗
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && searchModal.classList.contains('active')) {
                closeSearchModal();
            }
        });
        
        // 搜索输入
        searchInput.addEventListener('input', (e) => {
            handleSearchInput(e);
        });
        
        // 清空搜索
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearSearchBtn.style.display = 'none';
            showSearchHint();
            searchInput.focus();
        });
    } else {
    }
    
    // 键盘导航支持
    nextBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!nextBtn.disabled) {
                handleNextStep();
            }
        }
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

function handleNextStep() {
    const nextBtn = document.getElementById('btn-step1-next');
    
    if (nextBtn.disabled) return;
    
    // 添加加载状态
    nextBtn.classList.add('loading');
    nextBtn.innerHTML = `
        正在前往...
        <i class="fas fa-spinner fa-spin"></i>
    `;
    
    // 添加触觉反馈（如果支持）
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
    
    // 模拟短暂加载后跳转
    setTimeout(() => {
        window.location.href = '../arrival/index.html';
    }, 800);
}

// ============================================
// 搜索功能
// ============================================
function openSearchModal() {
    const searchModal = document.getElementById('search-modal');
    const searchInput = document.getElementById('airport-search-input');
    
    if (!searchModal || !searchInput) {
        return;
    }
    
    searchModal.classList.add('active');
    
    // 延迟聚焦，确保动画流畅
    setTimeout(() => {
        searchInput.focus();
    }, 300);
    
    // 触觉反馈
    if (navigator.vibrate) {
        navigator.vibrate(30);
    }
}

function closeSearchModal() {
    const searchModal = document.getElementById('search-modal');
    const searchInput = document.getElementById('airport-search-input');
    const clearSearchBtn = document.getElementById('clear-search');
    
    searchModal.classList.remove('active');
    searchInput.value = '';
    clearSearchBtn.style.display = 'none';
    showSearchHint();
}

function handleSearchInput(e) {
    const query = e.target.value;
    const clearSearchBtn = document.getElementById('clear-search');
    
    // 显示/隐藏清空按钮
    if (query.length > 0) {
        clearSearchBtn.style.display = 'block';
    } else {
        clearSearchBtn.style.display = 'none';
    }
    
    // 至少输入2个字符才开始搜索
    if (query.trim().length < 2) {
        showSearchHint();
        return;
    }
    
    // 执行搜索
    performSearch(query.trim());
}

function performSearch(query) {
    const searchResults = document.getElementById('search-results');
    const lowerQuery = query.toLowerCase();
    
    // 搜索机场
    let results = airports.filter(airport => {
        return airport.name.toLowerCase().includes(lowerQuery) ||
               airport.city.toLowerCase().includes(lowerQuery) ||
               airport.country.toLowerCase().includes(lowerQuery) ||
               (airport.iata && airport.iata.toLowerCase().includes(lowerQuery)) ||
               (airport.icao && airport.icao.toLowerCase().includes(lowerQuery));
    });
    
    // 限制结果数量，避免渲染过多
    const maxResults = 50;
    const hasMore = results.length > maxResults;
    results = results.slice(0, maxResults);
    
    // 显示结果
    if (results.length === 0) {
        searchResults.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>未找到匹配的机场</p>
            </div>
        `;
    } else {
        let html = results.map(airport => `
            <div class="search-result-item" data-airport-id="${airport.id}">
                <div class="search-result-icon">
                    <i class="fas fa-plane"></i>
                </div>
                <div class="search-result-info">
                    <div class="search-result-name">${airport.name}</div>
                    <div class="search-result-location">${airport.city}, ${airport.country}</div>
                </div>
            </div>
        `).join('');
        
        if (hasMore) {
            html += `
                <p class="search-hint" style="margin-top: 10px;">
                    <i class="fas fa-info-circle"></i>
                    显示前 ${maxResults} 个结果，请输入更多字符缩小范围
                </p>
            `;
        }
        
        searchResults.innerHTML = html;
        
        // 添加点击事件 - 使用索引而不是ID
        searchResults.querySelectorAll('.search-result-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                const airport = results[index];
                if (airport) {
                    selectDepartureAirport(airport);
                    closeSearchModal();
                    
                    // 触觉反馈
                    if (navigator.vibrate) {
                        navigator.vibrate(50);
                    }
                }
            });
        });
    }
}

function showSearchHint() {
    const searchResults = document.getElementById('search-results');
    searchResults.innerHTML = `
        <p class="search-hint">
            <i class="fas fa-info-circle"></i>
            请输入至少2个字符开始搜索
        </p>
    `;
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
