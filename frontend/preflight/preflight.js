// ============================================
// 登机牌和撕票功能
// ============================================

let flightData = null;
let isDragging = false;
let startX = 0;
let currentX = 0;
let isScanned = false;
let scanProgress = 0;

// ============================================
// 初始化
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // 检查是否有前置数据
    if (!localStorage.getItem('flightDeparture') || 
        !localStorage.getItem('flightArrival') || 
        !localStorage.getItem('flightSeat')) {
        alert('请先完成前面的步骤');
        window.location.href = '../departure/index.html';
        return;
    }
    
    loadFlightData();
    generateBoardingPass();
    initializeTearInteraction();
    initializeEventListeners();
    hideLoading();
});

// ============================================
// 加载飞行数据
// ============================================
function loadFlightData() {
    try {
        const departure = JSON.parse(localStorage.getItem('flightDeparture'));
        const arrival = JSON.parse(localStorage.getItem('flightArrival'));
        const seat = localStorage.getItem('flightSeat');
        const distance = localStorage.getItem('flightDistance');
        const flightTime = JSON.parse(localStorage.getItem('flightTime'));
        const tasks = JSON.parse(localStorage.getItem('flightTasks'));
        
        flightData = {
            departure,
            arrival,
            seat,
            distance,
            flightTime,
            tasks
        };
    } catch (error) {
        console.error('加载飞行数据失败:', error);
        alert('数据加载失败，请重新开始');
        window.location.href = '../welcome/index.html';
    }
}

// ============================================
// 生成登机牌
// ============================================
function generateBoardingPass() {
    if (!flightData) return;
    
    // 机场代码映射
    const airportCodes = {
        '首都国际机场': 'PEK',
        '浦东国际机场': 'PVG',
        '虹桥国际机场': 'SHA',
        '白云国际机场': 'CAN',
        '双流国际机场': 'CTU',
        '萧山国际机场': 'HGH',
        '禄口国际机场': 'NKG',
        '天河国际机场': 'WUH',
        '咸阳国际机场': 'XIY',
        '宝安国际机场': 'SZX'
    };
    
    // 设置出发地信息
    const departureCity = flightData.departure.city;
    const departureName = flightData.departure.name;
    const departureCode = airportCodes[departureName] || generateAirportCode(departureCity);
    
    document.getElementById('departure-city').textContent = departureCity;
    document.getElementById('departure-name').textContent = departureName;
    document.getElementById('departure-code').textContent = departureCode;
    
    // 设置到达地信息
    const arrivalCity = flightData.arrival.city;
    const arrivalName = flightData.arrival.name;
    const arrivalCode = airportCodes[arrivalName] || generateAirportCode(arrivalCity);
    
    document.getElementById('arrival-city').textContent = arrivalCity;
    document.getElementById('arrival-name').textContent = arrivalName;
    document.getElementById('arrival-code').textContent = arrivalCode;
    
    // 生成航班时间
    const now = new Date();
    const flightDate = formatDate(now);
    const boardingTime = formatTime(new Date(now.getTime() + 30 * 60000)); // 30分钟后登机
    const departureTime = formatTime(new Date(now.getTime() + 60 * 60000)); // 1小时后起飞
    const arrivalTime = formatTime(new Date(now.getTime() + (flightData.flightTime.hours * 60 + flightData.flightTime.minutes + 60) * 60000));
    
    document.getElementById('flight-date').textContent = flightDate;
    document.getElementById('boarding-time').textContent = boardingTime;
    document.getElementById('departure-time').textContent = departureTime;
    document.getElementById('arrival-time').textContent = arrivalTime;
    
    // 生成航班号
    const flightNumber = 'FA' + Math.floor(1000 + Math.random() * 9000);
    document.getElementById('flight-number').textContent = flightNumber;
    
    // 设置座位号 - 如果用户已经选择了具体座位，使用用户选择的，否则生成一个
    const userSelectedSeat = localStorage.getItem('flightSeat');
    let seatNumber;
    
    if (userSelectedSeat && userSelectedSeat.match(/^\d+[A-F]$/)) {
        // 用户已选择具体座位号（如 "12A"）
        seatNumber = userSelectedSeat;
    } else {
        // 用户只选择了座位类型（如 "window", "aisle"），生成一个座位号
        seatNumber = generateSeatNumber(flightData.seat);
    }
    
    document.getElementById('seat-number').textContent = seatNumber;
    
    // 生成登机口
    const gates = ['A', 'B', 'C', 'D', 'E'];
    const gateNumber = gates[Math.floor(Math.random() * gates.length)] + Math.floor(10 + Math.random() * 30);
    document.getElementById('gate-number').textContent = gateNumber;
    
    // 生成订单号
    const bookingRef = 'FOCS' + now.getFullYear().toString().slice(-2) + 
                       String(now.getMonth() + 1).padStart(2, '0') + 
                       String(now.getDate()).padStart(2, '0') + 
                       flightNumber.replace('FA', '');
    document.getElementById('booking-reference').textContent = bookingRef;
    
    // 生成真实条形码
    generateBarcode(bookingRef);
}

// ============================================
// 生成条形码
// ============================================
function generateBarcode(code) {
    try {
        // 根据屏幕宽度调整条形码参数
        const isMobile = window.innerWidth <= 768;
        const isSmallMobile = window.innerWidth <= 480;
        
        JsBarcode("#barcode", code, {
            format: "CODE128",
            width: isSmallMobile ? 1.2 : isMobile ? 1.5 : 2,
            height: isSmallMobile ? 50 : isMobile ? 60 : 80,
            displayValue: false,
            margin: isMobile ? 5 : 10,
            background: "#f8fafc",
            lineColor: "#1e293b"
        });
    } catch (error) {
        console.error('生成条形码失败:', error);
    }
}

// ============================================
// 扫描检票交互功能
// ============================================
function initializeTearInteraction() {
    const scanFrame = document.getElementById('scan-frame');
    
    // 鼠标事件（桌面端）
    scanFrame.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
    
    // 触摸事件（移动端）
    scanFrame.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', endDrag);
}

function startDrag(e) {
    if (isScanned) return;
    
    e.preventDefault();
    e.stopPropagation();
    isDragging = true;
    
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const scanFrame = document.getElementById('scan-frame');
    const rect = scanFrame.getBoundingClientRect();
    
    startX = clientX - rect.left;
}

function drag(e) {
    if (!isDragging || isScanned) return;
    
    e.preventDefault();
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const scanFrame = document.getElementById('scan-frame');
    const barcodeSection = document.querySelector('.barcode-section');
    const sectionRect = barcodeSection.getBoundingClientRect();
    
    // 计算新位置
    let newLeft = clientX - sectionRect.left - startX;
    
    // 限制在条形码区域内
    const maxLeft = sectionRect.width - scanFrame.offsetWidth;
    newLeft = Math.max(0, Math.min(newLeft, maxLeft));
    
    // 更新扫描框位置
    scanFrame.style.left = newLeft + 'px';
    
    // 计算扫描进度
    scanProgress = (newLeft / maxLeft) * 100;
    
    // 添加扫描状态
    if (scanProgress > 5) {
        scanFrame.classList.add('scanning');
        barcodeSection.classList.add('scanning');
    }
    
    // 检查是否完成扫描（扫到右侧80%以上）
    if (scanProgress >= 80) {
        completeScan();
    }
}

function endDrag(e) {
    if (!isDragging || isScanned) return;
    
    isDragging = false;
    
    const scanFrame = document.getElementById('scan-frame');
    const barcodeSection = document.querySelector('.barcode-section');
    
    // 如果没有完成扫描，回到起始位置
    if (scanProgress < 80) {
        scanFrame.style.transition = 'left 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        scanFrame.style.left = '0px';
        scanFrame.classList.remove('scanning');
        barcodeSection.classList.remove('scanning');
        
        setTimeout(() => {
            scanFrame.style.transition = '';
        }, 400);
        
        scanProgress = 0;
    }
}

function completeScan() {
    if (isScanned) return;
    
    isScanned = true;
    isDragging = false;
    
    const scanFrame = document.getElementById('scan-frame');
    const barcodeSection = document.querySelector('.barcode-section');
    
    // 添加完成状态
    scanFrame.classList.remove('scanning');
    scanFrame.classList.add('completed');
    barcodeSection.classList.add('completed');
    
    // 添加触觉反馈（如果支持）
    if (navigator.vibrate) {
        navigator.vibrate([50, 100, 50]);
    }
    
    // 显示成功提示
    setTimeout(() => {
        // 淡出整个条形码区域
        barcodeSection.style.transition = 'all 0.5s ease';
        barcodeSection.style.opacity = '0';
        barcodeSection.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            showTearSuccess();
        }, 300);
    }, 500);
}

function showTearSuccess() {
    const tearSuccess = document.getElementById('tear-success');
    const tearInstruction = document.getElementById('tear-instruction');
    
    tearSuccess.classList.add('active');
    tearInstruction.style.display = 'none';
    
    // 3秒后自动进入下一步
    setTimeout(() => {
        startFlight();
    }, 3000);
}

// ============================================
// 工具函数
// ============================================
function generateAirportCode(cityName) {
    // 简单的拼音首字母生成（实际应该用更完善的拼音库）
    const pinyinMap = {
        '北京': 'PEK', '上海': 'SHA', '广州': 'CAN', '深圳': 'SZX',
        '成都': 'CTU', '重庆': 'CKG', '杭州': 'HGH', '西安': 'XIY',
        '南京': 'NKG', '武汉': 'WUH', '天津': 'TSN', '青岛': 'TAO',
        '厦门': 'XMN', '昆明': 'KMG', '大连': 'DLC', '沈阳': 'SHE',
        '哈尔滨': 'HRB', '长沙': 'CSX', '郑州': 'CGO', '南宁': 'NNG',
        '乌鲁木齐': 'URC', '兰州': 'LHW', '海口': 'HAK', '贵阳': 'KWE',
        '太原': 'TYN', '南昌': 'KHN', '福州': 'FOC', '石家庄': 'SJW',
        '长春': 'CGQ', '呼和浩特': 'HET', '拉萨': 'LXA', '银川': 'INC'
    };
    
    return pinyinMap[cityName] || cityName.substring(0, 3).toUpperCase();
}

function generateSeatNumber(seatType) {
    // 根据座位类型生成座位号
    const row = Math.floor(10 + Math.random() * 30); // 10-39排
    let letter;
    
    switch(seatType) {
        case 'window':
            letter = Math.random() < 0.5 ? 'A' : 'F';
            break;
        case 'aisle':
            letter = Math.random() < 0.5 ? 'C' : 'D';
            break;
        case 'middle':
            letter = Math.random() < 0.5 ? 'B' : 'E';
            break;
        default:
            letter = String.fromCharCode(65 + Math.floor(Math.random() * 6)); // A-F
    }
    
    return row + letter;
}

function formatDate(date) {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 
                    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    return `${day} ${month}`;
}

function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

// ============================================
// 事件监听器
// ============================================
function initializeEventListeners() {
    document.getElementById('btn-back').addEventListener('click', () => {
        window.location.href = '../tasks/index.html';
    });
}

function startFlight() {
    showLoading();
    
    // 保存飞行开始时间
    localStorage.setItem('flightStartTime', Date.now().toString());
    
    // 延迟一下模拟起飞过程
    setTimeout(() => {
        window.location.href = '../flight/index.html';
    }, 1500);
}

// ============================================
// 加载指示器
// ============================================
function showLoading() {
    document.getElementById('loading-overlay').classList.add('active');
}

function hideLoading() {
    document.getElementById('loading-overlay').classList.remove('active');
}
