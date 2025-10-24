// ============================================
// 飞行完成页面
// ============================================

let flightData = {};
let isCompleted = false;

// ============================================
// 初始化
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    loadFlightData();
    displayFlightStats();
    generateAchievements();
    initializeEventListeners();
});

function loadFlightData() {
    try {
        // 获取飞行数据
        const departure = JSON.parse(localStorage.getItem('flightDeparture'));
        const arrival = JSON.parse(localStorage.getItem('flightArrival'));
        const startTime = parseInt(localStorage.getItem('flightStartTime'));
        const endTime = parseInt(localStorage.getItem('flightEndTime'));
        const distance = parseFloat(localStorage.getItem('flightDistance'));
        const tasks = JSON.parse(localStorage.getItem('flightTasks'));
        isCompleted = localStorage.getItem('flightCompleted') === 'true';
        
        flightData = {
            departure,
            arrival,
            startTime,
            endTime,
            distance,
            tasks,
            duration: endTime - startTime
        };
        
        // 更新页面标题和图标
        if (!isCompleted) {
            document.getElementById('completion-title').textContent = '飞行中断';
            document.getElementById('completion-subtitle').textContent = '您提前结束了这次飞行';
            document.getElementById('completion-icon').classList.add('emergency');
            document.querySelector('.completion-icon i').className = 'fas fa-exclamation-triangle';
        }
        
    } catch (error) {
        console.error('加载飞行数据失败:', error);
        alert('数据加载失败');
        window.location.href = '../welcome/index.html';
    }
}

function displayFlightStats() {
    // 飞行时长
    const duration = Math.floor(flightData.duration / 1000);
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    
    document.getElementById('flight-duration').textContent = 
        `${hours}小时${minutes}分钟${seconds}秒`;
    
    // 飞行距离
    document.getElementById('flight-distance').textContent = 
        `${Math.round(flightData.distance)} 公里`;
    
    // 完成任务
    let taskCount = 0;
    if (flightData.tasks.selected) {
        taskCount += flightData.tasks.selected.length;
    }
    if (flightData.tasks.custom) {
        taskCount += 1;
    }
    
    document.getElementById('completed-tasks').textContent = 
        taskCount > 0 ? `${taskCount} 项任务` : '无特定任务';
}

function generateAchievements() {
    const achievements = [];
    const duration = Math.floor(flightData.duration / 1000);
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    
    // 时长成就
    if (hours >= 2) {
        achievements.push({ icon: 'fas fa-trophy', text: '长途飞行者' });
    } else if (minutes >= 30) {
        achievements.push({ icon: 'fas fa-medal', text: '专注达人' });
    } else if (minutes >= 15) {
        achievements.push({ icon: 'fas fa-star', text: '初级飞行员' });
    }
    
    // 距离成就
    if (flightData.distance >= 10000) {
        achievements.push({ icon: 'fas fa-globe', text: '环球旅行家' });
    } else if (flightData.distance >= 5000) {
        achievements.push({ icon: 'fas fa-map', text: '远程探索者' });
    }
    
    // 任务成就
    if (flightData.tasks.selected && flightData.tasks.selected.length >= 3) {
        achievements.push({ icon: 'fas fa-tasks', text: '多任务处理者' });
    }
    
    // 完成成就
    if (isCompleted) {
        achievements.push({ icon: 'fas fa-check-circle', text: '任务完成' });
    }
    
    // 特殊成就
    const now = new Date();
    if (now.getHours() >= 22 || now.getHours() <= 6) {
        achievements.push({ icon: 'fas fa-moon', text: '夜猫子' });
    }
    
    // 渲染成就
    const achievementsContainer = document.getElementById('achievements');
    if (achievements.length === 0) {
        achievementsContainer.innerHTML = '<p style="color: var(--text-secondary);">继续努力，下次获得更多成就！</p>';
    } else {
        achievementsContainer.innerHTML = achievements.map(achievement => 
            `<div class="achievement">
                <i class="${achievement.icon}"></i>
                <span>${achievement.text}</span>
            </div>`
        ).join('');
    }
}

function initializeEventListeners() {
    document.getElementById('btn-new-flight').addEventListener('click', () => {
        // 清除当前飞行数据
        const keysToRemove = [
            'flightDeparture', 'flightArrival', 'flightSeat', 'flightDistance',
            'flightTime', 'flightTasks', 'flightStartTime', 'flightEndTime', 'flightCompleted'
        ];
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // 跳转到欢迎页面
        window.location.href = '../welcome/index.html';
    });
    
    document.getElementById('btn-share-result').addEventListener('click', shareResult);
}

function shareResult() {
    const duration = Math.floor(flightData.duration / 1000);
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    
    const shareText = `我刚刚完成了一次专注飞行！
🛫 从 ${flightData.departure.city} 到 ${flightData.arrival.city}
⏱️ 专注时长：${hours}小时${minutes}分钟
📍 飞行距离：${Math.round(flightData.distance)}公里
✨ 使用 Focus on Aircraft 让专注变得有趣！`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Focus on Aircraft - 专注飞行完成',
            text: shareText
        });
    } else {
        // 复制到剪贴板
        navigator.clipboard.writeText(shareText).then(() => {
            alert('分享内容已复制到剪贴板！');
        }).catch(() => {
            alert('分享功能暂不可用');
        });
    }
}
