/**
 * DISCIPLINE - Profile Module (Updated)
 * Полный профиль со статистикой и редактированием
 */

document.addEventListener('DOMContentLoaded', () => {
    if (!requireAuth()) return;
    loadProfile();
    initProfileEvents();
});

function initProfileEvents() {
    // Редактирование имени
    document.getElementById('edit-name-btn')?.addEventListener('click', editUserName);
}

function editUserName() {
    const currentUser = getCurrentUser();
    const userData = getUserData();
    
    const newName = prompt('Введи новое имя:', currentUser.name);
    if (newName && newName.trim() && newName.trim() !== currentUser.name) {
        // Обновляем в users
        userData.name = newName.trim();
        saveUserData(userData);
        
        // Обновляем в auth
        const auth = JSON.parse(localStorage.getItem('discipline_auth'));
        auth.name = newName.trim();
        localStorage.setItem('discipline_auth', JSON.stringify(auth));
        
        // Перезагружаем профиль
        loadProfile();
    }
}

function loadProfile() {
    const user = getCurrentUser();
    const userData = getUserData();
    
    if (!user || !userData) {
        window.location.href = 'auth.html';
        return;
    }
    
    // Основная информация
    document.getElementById('profile-name').textContent = user.name;
    document.getElementById('profile-email').textContent = user.email;
    document.getElementById('profile-avatar').textContent = user.name.charAt(0).toUpperCase();
    
    const joinedDate = new Date(user.createdAt);
    document.getElementById('profile-joined').textContent = joinedDate.toLocaleDateString('ru-RU', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
    
    // Статистика
    const stats = calculateStats(userData);
    document.getElementById('stat-total-days').textContent = stats.totalDays;
    document.getElementById('stat-total-tasks').textContent = stats.totalTasks;
    document.getElementById('stat-completed-tasks').textContent = stats.completedTasks;
    document.getElementById('stat-completion-rate').textContent = stats.completionRate + '%';
    document.getElementById('stat-current-streak').textContent = stats.currentStreak;
    document.getElementById('stat-best-streak').textContent = stats.bestStreak;
    
    // Цели
    renderGoals(userData.goals || []);
    
    // Календарь
    renderActivityCalendar(userData.goals || []);
    
    // История
    renderHistory(userData.goals || []);
    
    // Паттерны
    renderPatterns(userData.goals || []);
}

function calculateStats(userData) {
    const goals = userData.goals || [];
    const userStats = userData.stats || {};
    
    let totalDays = 0;
    let totalTasks = 0;
    let completedTasks = 0;
    let allDays = [];
    
    goals.forEach(goal => {
        const history = goal.history || [];
        history.forEach(day => {
            totalDays++;
            totalTasks += day.totalTasks || 0;
            completedTasks += day.completedTasks || 0;
            allDays.push({
                date: day.date || goal.createdAt,
                rate: day.totalTasks > 0 ? day.completedTasks / day.totalTasks : 0
            });
        });
    });
    
    const { currentStreak, bestStreak } = calculateStreaks(allDays);
    
    return {
        totalDays: totalDays || userStats.totalDays || 0,
        totalTasks: totalTasks || userStats.totalTasks || 0,
        completedTasks: completedTasks || userStats.completedTasks || 0,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        currentStreak: currentStreak || userStats.currentStreak || 0,
        bestStreak: Math.max(bestStreak, userStats.bestStreak || 0)
    };
}

function calculateStreaks(days) {
    if (days.length === 0) return { currentStreak: 0, bestStreak: 0 };
    
    days.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    
    days.forEach(day => {
        if (day.rate >= 0.8) {
            tempStreak++;
            bestStreak = Math.max(bestStreak, tempStreak);
        } else {
            tempStreak = 0;
        }
    });
    
    for (let i = days.length - 1; i >= 0; i--) {
        if (days[i].rate >= 0.8) currentStreak++;
        else break;
    }
    
    return { currentStreak, bestStreak };
}

function renderGoals(goals) {
    const container = document.getElementById('goals-list');
    
    if (goals.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Целей пока нет</p><a href="app.html" class="primary-btn">Создать цель</a></div>';
        return;
    }
    
    container.innerHTML = goals.map(goal => {
        const typeInfo = GOAL_TYPES[goal.type] || {};
        const progress = calculateGoalProgress(goal);
        const completionRate = calculateGoalCompletionRate(goal);
        const ratePercent = Math.round(completionRate * 100);
        
        return `
            <div class="goal-card">
                <div class="goal-header">
                    <span class="goal-icon">${typeInfo.icon || '🎯'}</span>
                    <span class="goal-type">${typeInfo.name || 'Цель'}</span>
                    <span class="goal-status active">День ${goal.currentDay}</span>
                </div>
                <div class="goal-text">${goal.text}</div>
                <div class="goal-progress-info-full">
                    <span>Прогресс к цели: <strong>${progress.percent}%</strong> (${progress.status})</span>
                </div>
                <div class="goal-stats">
                    <div class="goal-stat">
                        <span class="goal-stat-value">${goal.currentDay}</span>
                        <span class="goal-stat-label">День</span>
                    </div>
                    <div class="goal-stat">
                        <span class="goal-stat-value">${goal.history?.length || 0}</span>
                        <span class="goal-stat-label">Отчётов</span>
                    </div>
                    <div class="goal-stat">
                        <span class="goal-stat-value ${ratePercent >= 80 ? 'good' : ratePercent >= 50 ? 'neutral' : 'bad'}">${ratePercent}%</span>
                        <span class="goal-stat-label">Выполнение</span>
                    </div>
                </div>
                <div class="goal-progress">
                    <div class="goal-progress-bar" style="width: ${progress.percent}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

function renderActivityCalendar(goals) {
    const container = document.getElementById('activity-calendar');
    
    const dayMap = {};
    goals.forEach(goal => {
        (goal.history || []).forEach((day, index) => {
            const date = day.date || new Date(new Date(goal.createdAt).getTime() + index * 86400000).toISOString();
            const dateKey = date.split('T')[0];
            
            if (!dayMap[dateKey]) dayMap[dateKey] = { total: 0, completed: 0 };
            dayMap[dateKey].total += day.totalTasks || 0;
            dayMap[dateKey].completed += day.completedTasks || 0;
        });
    });
    
    const days = [];
    const today = new Date();
    
    for (let i = 83; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        
        const dayData = dayMap[dateKey];
        let level = 'none';
        
        if (dayData) {
            const rate = dayData.total > 0 ? dayData.completed / dayData.total : 0;
            if (rate >= 0.8) level = 'high';
            else if (rate >= 0.4) level = 'medium';
            else level = 'low';
        }
        
        days.push({ date: dateKey, level });
    }
    
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7));
    }
    
    container.innerHTML = weeks.map(week => `
        <div class="calendar-week">
            ${week.map(day => `<div class="calendar-day ${day.level}" title="${day.date}"></div>`).join('')}
        </div>
    `).join('');
}

function renderHistory(goals) {
    const container = document.getElementById('history-list');
    
    const allHistory = [];
    goals.forEach(goal => {
        (goal.history || []).forEach((day, index) => {
            allHistory.push({
                ...day,
                goalText: goal.text,
                goalType: goal.type,
                date: day.date || new Date(new Date(goal.createdAt).getTime() + index * 86400000).toISOString()
            });
        });
    });
    
    allHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (allHistory.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>История пуста. Выполняй задачи!</p></div>';
        return;
    }
    
    container.innerHTML = allHistory.slice(0, 20).map(entry => {
        const rate = entry.totalTasks > 0 ? entry.completedTasks / entry.totalTasks : 0;
        const ratePercent = Math.round(rate * 100);
        const typeInfo = GOAL_TYPES[entry.goalType] || {};
        
        return `
            <div class="history-item">
                <div class="history-date">${new Date(entry.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</div>
                <div class="history-content">
                    <div class="history-goal">
                        <span class="history-icon">${typeInfo.icon || '🎯'}</span>
                        <span>${entry.goalText.substring(0, 40)}${entry.goalText.length > 40 ? '...' : ''}</span>
                    </div>
                    <div class="history-result ${rate >= 0.8 ? 'good' : rate >= 0.5 ? 'neutral' : 'bad'}">
                        ${entry.completedTasks}/${entry.totalTasks} (${ratePercent}%)
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderPatterns(goals) {
    const container = document.getElementById('patterns-list');
    
    if (goals.length === 0 || goals.every(g => !g.history?.length)) {
        container.innerHTML = '<div class="empty-state"><p>Недостаточно данных</p></div>';
        return;
    }
    
    const patterns = { avoided: {}, dayRates: {} };
    
    goals.forEach(goal => {
        (goal.history || []).forEach(day => {
            // Невыполненные задачи
            if (day.tasks) {
                day.tasks.forEach((task, idx) => {
                    if (!day.reportData?.completedTasks?.includes(idx)) {
                        const title = task.title.toLowerCase();
                        if (title.includes('напиши') || title.includes('свяжись') || title.includes('позвони')) {
                            patterns.avoided['Коммуникация'] = (patterns.avoided['Коммуникация'] || 0) + 1;
                        }
                        if (title.includes('продай') || title.includes('клиент')) {
                            patterns.avoided['Продажи'] = (patterns.avoided['Продажи'] || 0) + 1;
                        }
                    }
                });
            }
            
            // По дням недели
            const date = new Date(day.date || goal.createdAt);
            const dayName = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][date.getDay()];
            if (!patterns.dayRates[dayName]) patterns.dayRates[dayName] = { sum: 0, count: 0 };
            patterns.dayRates[dayName].sum += day.totalTasks > 0 ? day.completedTasks / day.totalTasks : 0;
            patterns.dayRates[dayName].count++;
        });
    });
    
    const insights = [];
    
    // Избегаемые задачи
    const avoided = Object.entries(patterns.avoided).sort((a, b) => b[1] - a[1]);
    if (avoided.length > 0) {
        insights.push({
            type: 'warning',
            title: 'Избегаемые задачи',
            text: `Чаще всего пропускаешь: ${avoided.map(([k]) => k).join(', ')}`
        });
    }
    
    // Лучший/худший день
    const dayStats = Object.entries(patterns.dayRates)
        .map(([day, data]) => ({ day, rate: data.count > 0 ? data.sum / data.count : 0 }))
        .sort((a, b) => b.rate - a.rate);
    
    if (dayStats.length >= 2) {
        insights.push({
            type: 'info',
            title: 'Продуктивные дни',
            text: `Лучший: ${dayStats[0].day} (${Math.round(dayStats[0].rate * 100)}%), худший: ${dayStats[dayStats.length - 1].day} (${Math.round(dayStats[dayStats.length - 1].rate * 100)}%)`
        });
    }
    
    // Общий тренд
    const allHistory = goals.flatMap(g => g.history || []);
    if (allHistory.length >= 10) {
        const recent = allHistory.slice(-5).reduce((s, d) => s + (d.totalTasks > 0 ? d.completedTasks / d.totalTasks : 0), 0) / 5;
        const old = allHistory.slice(0, 5).reduce((s, d) => s + (d.totalTasks > 0 ? d.completedTasks / d.totalTasks : 0), 0) / 5;
        
        if (recent > old + 0.1) {
            insights.push({ type: 'success', title: 'Тренд', text: 'Эффективность растёт. Продолжай!' });
        } else if (recent < old - 0.1) {
            insights.push({ type: 'danger', title: 'Тренд', text: 'Эффективность падает. Что мешает?' });
        }
    }
    
    if (insights.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Продолжай работать для анализа паттернов</p></div>';
        return;
    }
    
    container.innerHTML = insights.map(i => `
        <div class="pattern-card ${i.type}">
            <div class="pattern-title">${i.title}</div>
            <div class="pattern-text">${i.text}</div>
        </div>
    `).join('');
}
