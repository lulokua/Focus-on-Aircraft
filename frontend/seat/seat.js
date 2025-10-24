// ============================================
// 步骤3: 选择座位 - 真实飞机座位布局
// ============================================

let selectedSeat = null;

// 座位配置
const seatConfig = {
    firstClass: {
        rows: [1, 2, 3],
        layout: ['A', 'B', null, 'C', 'D'], // null 表示过道
        occupiedSeats: [] // 所有座位都可选
    },
    economy: {
        rows: [4, 5, 6, 7, 8, 9, 10, 11, 12],
        layout: ['A', 'B', 'C', null, 'D', 'E', 'F'], // 3-3 布局
        occupiedSeats: [], // 所有座位都可选
        exitRows: [7, 12] // 紧急出口排
    }
};

// ============================================
// 初始化
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initializeSeats();
    initializeEventListeners();
    hideLoading();
});

// ============================================
// 生成座位布局
// ============================================
function initializeSeats() {
    // 生成头等舱座位
    generateSeats('first-class-seats', seatConfig.firstClass, 'first-class');
    
    // 生成经济舱座位
    generateSeats('economy-seats', seatConfig.economy, 'economy');
}

function generateSeats(containerId, config, cabinType) {
    const container = document.getElementById(containerId);
    
    config.rows.forEach(rowNumber => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'seat-row';
        
        // 行号
        const rowLabel = document.createElement('div');
        rowLabel.className = 'row-number';
        rowLabel.textContent = rowNumber;
        rowDiv.appendChild(rowLabel);
        
        // 座位
        config.layout.forEach((seatLetter, index) => {
            if (seatLetter === null) {
                // 过道
                const divider = document.createElement('div');
                divider.className = 'seat-divider';
                rowDiv.appendChild(divider);
            } else {
                // 创建座位组（如果是第一个座位）
                if (index === 0 || config.layout[index - 1] === null) {
                    const seatsGroup = document.createElement('div');
                    seatsGroup.className = 'seats-group';
                    
                    // 添加当前组的所有座位
                    let currentIndex = index;
                    while (currentIndex < config.layout.length && config.layout[currentIndex] !== null) {
                        const letter = config.layout[currentIndex];
                        const seat = createSeat(rowNumber, letter, config, cabinType);
                        seatsGroup.appendChild(seat);
                        currentIndex++;
                    }
                    
                    rowDiv.appendChild(seatsGroup);
                }
            }
        });
        
        container.appendChild(rowDiv);
        
        // 如果是紧急出口排，添加标签
        if (config.exitRows && config.exitRows.includes(rowNumber)) {
            const exitLabel = document.createElement('div');
            exitLabel.className = 'exit-row-label';
            exitLabel.innerHTML = '<i class="fas fa-door-open"></i> 紧急出口排';
            container.appendChild(exitLabel);
        }
    });
}

function createSeat(rowNumber, seatLetter, config, cabinType) {
    const seatNumber = `${rowNumber}${seatLetter}`;
    const seat = document.createElement('div');
    seat.className = 'seat';
    seat.dataset.seat = seatNumber;
    seat.textContent = seatLetter;
    
    // 判断座位类型
    const seatIndex = config.layout.indexOf(seatLetter);
    const isWindow = seatIndex === 0 || seatIndex === config.layout.filter(s => s !== null).length - 1;
    const isAisle = !isWindow && (
        (seatIndex > 0 && config.layout[seatIndex - 1] === null) ||
        (seatIndex < config.layout.length - 1 && config.layout[seatIndex + 1] === null)
    );
    
    if (isWindow) {
        seat.classList.add('window');
        seat.dataset.type = 'window';
    } else if (isAisle) {
        seat.classList.add('aisle');
        seat.dataset.type = 'aisle';
    } else {
        seat.dataset.type = 'middle';
    }
    
    // 检查是否被占用
    if (config.occupiedSeats.includes(seatNumber)) {
        seat.classList.add('occupied');
    } else {
        seat.addEventListener('click', handleSeatSelection);
    }
    
    // 紧急出口排
    if (config.exitRows && config.exitRows.includes(rowNumber)) {
        seat.classList.add('exit-row');
    }
    
    return seat;
}

// ============================================
// 事件监听器
// ============================================
function initializeEventListeners() {
    // 关闭弹窗按钮
    document.getElementById('btn-close-modal').addEventListener('click', closeActivityModal);
    
    // 点击弹窗外部关闭（点击页面其他地方）
    document.addEventListener('click', (e) => {
        const popup = document.getElementById('activity-modal');
        
        // 如果弹窗显示中，且点击的不是弹窗内容，也不是座位
        if (popup.style.display === 'block' && 
            !popup.contains(e.target) && 
            !e.target.classList.contains('seat')) {
            closeActivityModal();
        }
    });
    
    // 活动选择卡片点击事件
    document.querySelectorAll('.activity-card').forEach(card => {
        card.addEventListener('click', handleActivitySelection);
    });
}

function handleSeatSelection(event) {
    const seat = event.currentTarget;
    const seatNumber = seat.dataset.seat;
    const seatType = seat.dataset.type;
    
    // 移除所有选中状态
    document.querySelectorAll('.seat.selected').forEach(s => {
        s.classList.remove('selected');
    });
    
    // 添加选中状态
    seat.classList.add('selected');
    selectedSeat = seatNumber;
    
    // 显示选中信息
    showSelectedSeatInfo(seatNumber, seatType);
    
    // 保存座位信息到 localStorage
    localStorage.setItem('flightSeat', seatNumber);
    localStorage.setItem('flightSeatType', seatType);
    
    // 打开活动选择弹窗
    openActivityModal(seatNumber);
}

function showSelectedSeatInfo(seatNumber, seatType) {
    const infoDiv = document.getElementById('selected-seat-info');
    const seatNumberSpan = document.getElementById('selected-seat-number');
    const seatTypeSpan = document.getElementById('selected-seat-type');
    
    seatNumberSpan.textContent = seatNumber;
    
    const typeLabels = {
        'window': '靠窗座位',
        'aisle': '过道座位',
        'middle': '中间座位'
    };
    
    seatTypeSpan.textContent = typeLabels[seatType] || seatType;
    
    infoDiv.style.display = 'block';
}

// ============================================
// 弹窗功能
// ============================================
function openActivityModal(seatNumber) {
    const popup = document.getElementById('activity-modal');
    const arrow = popup.querySelector('.popup-arrow');
    const seatElement = document.querySelector(`.seat[data-seat="${seatNumber}"]`);
    
    popup.style.display = 'block';
    
    // 计算座位位置
    if (seatElement) {
        const rect = seatElement.getBoundingClientRect();
        const popupWidth = 140;
        const popupHeight = 160; // 估算高度
        
        // 默认显示在座位右侧
        let left = rect.right + 12;
        let top = rect.top - 10;
        let arrowLeft = -6;
        
        // 如果右侧空间不够，显示在左侧
        if (left + popupWidth > window.innerWidth - 20) {
            left = rect.left - popupWidth - 12;
            // 箭头翻转到右侧
            arrow.style.left = 'auto';
            arrow.style.right = '-6px';
            arrow.style.borderRight = 'none';
            arrow.style.borderLeft = '6px solid white';
        } else {
            arrow.style.left = '-6px';
            arrow.style.right = 'auto';
            arrow.style.borderLeft = 'none';
            arrow.style.borderRight = '6px solid white';
        }
        
        // 如果下方空间不够，向上调整
        if (top + popupHeight > window.innerHeight - 20) {
            top = window.innerHeight - popupHeight - 20;
        }
        
        // 确保不超出顶部
        if (top < 10) {
            top = 10;
        }
        
        popup.style.left = left + 'px';
        popup.style.top = top + 'px';
    }
}

function closeActivityModal() {
    const popup = document.getElementById('activity-modal');
    popup.style.display = 'none';
}

function handleActivitySelection(event) {
    const card = event.currentTarget;
    const activity = card.dataset.activity;
    
    // 保存选择的活动到 localStorage
    localStorage.setItem('selectedActivity', activity);
    
    // 活动名称映射
    const activityNames = {
        'target': '目标',
        'study': '学习',
        'reading': '看书'
    };
    
    // 显示选择反馈
    console.log(`已选择活动: ${activityNames[activity]}`);
    console.log(`座位: ${selectedSeat}`);
    
    // 关闭弹窗
    closeActivityModal();
    
    // 显示加载动画
    showLoading();
    
    // 延迟跳转到登机牌页面
    setTimeout(() => {
        window.location.href = '../preflight/index.html';
    }, 800);
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
