/**
 * 腾讯地图工具类
 * 用于封装腾讯地图API的常用功能
 */
class TencentMapUtil {
    constructor() {
        this.map = null;
        this.markers = [];
        this.apiLoaded = false;
        this.apiUrl = 'https://map.qq.com/api/gljs?v=1.exp&libraries=geometry,convertor';
    }

    /**
     * 初始化腾讯地图API
     */
    async loadMapAPI() {
        if (this.apiLoaded || window.TMap) {
            this.apiLoaded = true;
            return Promise.resolve();
        }

        // 如果腾讯地图API已经通过script标签加载，直接返回
        if (window.TMap) {
            this.apiLoaded = true;
            return Promise.resolve();
        }

        // 等待腾讯地图API加载完成
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50; // 最多等待5秒
            
            const checkTMap = () => {
                attempts++;
                if (window.TMap) {
                    this.apiLoaded = true;
                    resolve();
                } else if (attempts >= maxAttempts) {
                    reject(new Error('腾讯地图API加载超时'));
                } else {
                    setTimeout(checkTMap, 100);
                }
            };
            
            checkTMap();
        });
    }

    /**
     * 创建地图实例
     * @param {string} containerId - 地图容器ID
     * @param {object} options - 地图配置选项
     */
    async createMap(containerId, options = {}) {
        await this.loadMapAPI();
        
        // 默认使用矢量地图 - 墨渊样式（夜间模式）
        const defaultOptions = {
            center: new TMap.LatLng(20, 110), // 默认中心点
            zoom: 3, // 默认缩放级别
            minZoom: 2,
            maxZoom: 18,
            viewMode: '2D',
            baseMap: {
                type: 'vector',  // 使用矢量地图
                features: ['base', 'building2d', 'building3d', 'point', 'label'] // 显示所有要素
            },
            mapStyleId: 'style1', // 墨渊样式（夜间模式）
            control: {
                zoom: {
                    position: 'BOTTOM_RIGHT',
                    show: false // 隐藏缩放控件
                },
                scale: {
                    position: 'BOTTOM_RIGHT',
                    show: false // 隐藏比例尺
                },
                rotate: {
                    position: 'BOTTOM_RIGHT',
                    show: false // 隐藏旋转控件
                }
            }
        };

        // 合并选项
        const mapOptions = { ...defaultOptions, ...options };
        
        this.map = new TMap.Map(document.getElementById(containerId), mapOptions);
        
        // 移除所有默认控件
        if (this.map) {
            // 移除缩放控件
            this.map.removeControl(TMap.constants.DEFAULT_CONTROL_ID.ZOOM);
            // 移除比例尺
            this.map.removeControl(TMap.constants.DEFAULT_CONTROL_ID.SCALE);
            // 移除旋转控件
            this.map.removeControl(TMap.constants.DEFAULT_CONTROL_ID.ROTATION);
        }
        
        // 添加控制台日志以便调试
        if (this.map) {
            console.log('✓ 地图已创建，使用墨渊样式（夜间模式）');
            console.log('✓ 已移除所有默认控件');
            console.log('地图配置:', mapOptions);
        }
        
        return this.map;
    }

    /**
     * 添加标记点
     * @param {object} position - 位置 {lat, lng}
     * @param {object} options - 标记选项
     */
    addMarker(position, options = {}) {
        if (!this.map) return null;

        const defaultOptions = {
            position: new TMap.LatLng(position.lat, position.lng),
            map: this.map,
            content: '<div class="marker-content"></div>',
            anchor: { x: 16, y: 32 }
        };

        const markerOptions = { ...defaultOptions, ...options };
        const marker = new TMap.MultiMarker({
            id: `marker-${Date.now()}-${Math.random()}`,
            map: this.map,
            styles: {
                'default': new TMap.MarkerStyle({
                    'width': 32,
                    'height': 32,
                    'src': options.icon || '/shared/assets/marker-default.png',
                    'anchor': { x: 16, y: 32 }
                })
            },
            geometries: [{
                id: `point-${Date.now()}`,
                styleId: 'default',
                position: new TMap.LatLng(position.lat, position.lng),
                properties: options.properties || {}
            }]
        });

        this.markers.push(marker);
        return marker;
    }

    /**
     * 清除所有标记
     */
    clearMarkers() {
        this.markers.forEach(marker => {
            if (marker && marker.setMap) {
                marker.setMap(null);
            }
        });
        this.markers = [];
    }

    /**
     * 设置地图中心和缩放
     * @param {object} position - 中心位置 {lat, lng}
     * @param {number} zoom - 缩放级别
     */
    setView(position, zoom = 10) {
        if (!this.map) return;
        
        this.map.setCenter(new TMap.LatLng(position.lat, position.lng));
        this.map.setZoom(zoom);
    }

    /**
     * 适配地图视野到包含所有标记
     * @param {array} positions - 位置数组 [{lat, lng}, ...]
     */
    fitBounds(positions) {
        if (!this.map || !positions || positions.length === 0) return;

        if (positions.length === 1) {
            this.setView(positions[0], 10);
            return;
        }

        const bounds = new TMap.LatLngBounds();
        positions.forEach(pos => {
            bounds.extend(new TMap.LatLng(pos.lat, pos.lng));
        });

        this.map.fitBounds(bounds, {
            padding: 50
        });
    }

    /**
     * 添加航线
     * @param {array} path - 路径点数组 [{lat, lng}, ...]
     * @param {object} options - 线条选项
     */
    addFlightPath(path, options = {}) {
        if (!this.map || !path || path.length < 2) return null;

        const defaultOptions = {
            paths: [path.map(p => new TMap.LatLng(p.lat, p.lng))],
            styles: {
                'flight-path': new TMap.PolylineStyle({
                    'color': '#3388ff',
                    'width': 3,
                    'borderWidth': 1,
                    'borderColor': '#ffffff',
                    'lineCap': 'round'
                })
            }
        };

        const polylineOptions = { ...defaultOptions, ...options };
        
        const polyline = new TMap.MultiPolyline({
            id: `flight-path-${Date.now()}`,
            map: this.map,
            styles: polylineOptions.styles,
            geometries: [{
                id: `path-${Date.now()}`,
                styleId: 'flight-path',
                paths: polylineOptions.paths[0]
            }]
        });

        return polyline;
    }

    /**
     * 搜索地点
     * @param {string} keyword - 搜索关键词
     * @param {string} boundary - 搜索范围（可选）
     */
    async searchPlaces(keyword, boundary = null) {
        try {
            const params = new URLSearchParams({
                keyword: keyword,
                page_size: 20,
                page_index: 1
            });

            if (boundary) {
                params.append('boundary', boundary);
            }

            const response = await fetch(`/api/map/search?${params}`);
            const data = await response.json();

            if (data.status === 0) {
                return data.data || [];
            } else {
                console.error('搜索失败:', data.message);
                return [];
            }
        } catch (error) {
            console.error('地点搜索错误:', error);
            return [];
        }
    }

    /**
     * 逆地址解析（根据坐标获取地址）
     * @param {object} position - 位置 {lat, lng}
     */
    async reverseGeocode(position) {
        try {
            const response = await fetch(`/api/map/geocoder?location=${position.lat},${position.lng}&get_poi=1`);
            const data = await response.json();

            if (data.status === 0) {
                return data.result;
            } else {
                console.error('逆地址解析失败:', data.message);
                return null;
            }
        } catch (error) {
            console.error('逆地址解析错误:', error);
            return null;
        }
    }

    /**
     * 销毁地图实例
     */
    destroy() {
        this.clearMarkers();
        if (this.map) {
            this.map.destroy();
            this.map = null;
        }
    }

    /**
     * 监听地图点击事件
     * @param {function} callback - 回调函数
     */
    onClick(callback) {
        if (!this.map) return;
        
        this.map.on('click', (evt) => {
            const lat = evt.latLng.getLat();
            const lng = evt.latLng.getLng();
            callback({ lat, lng }, evt);
        });
    }

    /**
     * 重新调整地图大小
     */
    resize() {
        if (this.map) {
            setTimeout(() => {
                this.map.resize();
            }, 100);
        }
    }
}

// 创建全局实例
window.tencentMapUtil = new TencentMapUtil();
