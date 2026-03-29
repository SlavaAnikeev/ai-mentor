/**
 * DISCIPLINE - Main Application (Updated)
 * С индивидуальными вопросами и отчётами для каждого типа цели
 */

let appState = {
    stage: 'goals-list',
    currentGoalId: null,
    questionIndex: 0,
    selectedOptions: [],
    currentQuestions: []
};

const stages = {
    'goals-list': document.getElementById('stage-goals-list'),
    goal: document.getElementById('stage-goal'),
    questions: document.getElementById('stage-questions'),
    strategy: document.getElementById('stage-strategy'),
    tasks: document.getElementById('stage-tasks'),
    report: document.getElementById('stage-report'),
    analysis: document.getElementById('stage-analysis')
};

document.addEventListener('DOMContentLoaded', () => {
    if (!requireAuth()) return;
    initEventListeners();
    loadInitialState();
});

function loadInitialState() {
    const userData = getUserData();
    if (!userData) {
        window.location.href = 'auth.html';
        return;
    }
    
    if (!userData.goals) {
        userData.goals = [];
        saveUserData(userData);
    }
    
    appState.stage = userData.goals.length === 0 ? 'goal' : 'goals-list';
    renderCurrentStage();
}

function getCurrentGoal() {
    if (!appState.currentGoalId) return null;
    const userData = getUserData();
    return userData?.goals?.find(g => g.id === appState.currentGoalId) || null;
}

function saveCurrentGoal(goal) {
    const userData = getUserData();
    if (!userData) return;
    
    const index = userData.goals.findIndex(g => g.id === goal.id);
    if (index > -1) {
        userData.goals[index] = goal;
    } else {
        userData.goals.push(goal);
    }
    saveUserData(userData);
}

function deleteGoal(goalId) {
    if (!confirm('Удалить эту цель? Это действие необратимо.')) return;
    
    const userData = getUserData();
    userData.goals = userData.goals.filter(g => g.id !== goalId);
    saveUserData(userData);
    
    appState.currentGoalId = null;
    appState.stage = userData.goals.length === 0 ? 'goal' : 'goals-list';
    renderCurrentStage();
}

function initEventListeners() {
    document.getElementById('add-goal-btn')?.addEventListener('click', () => {
        appState.stage = 'goal';
        appState.currentGoalId = null;
        renderCurrentStage();
    });
    
    document.getElementById('back-to-goals')?.addEventListener('click', () => {
        appState.stage = 'goals-list';
        appState.currentGoalId = null;
        renderCurrentStage();
    });
    
    document.getElementById('goal-text')?.addEventListener('input', (e) => {
        const text = e.target.value;
        if (text.length > 5) {
            showDetectedGoal(parseGoalText(text));
        } else {
            document.getElementById('goal-detected').classList.add('hidden');
        }
    });
    
    document.querySelectorAll('.example-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.getElementById('goal-text').value = chip.dataset.text;
            showDetectedGoal(parseGoalText(chip.dataset.text));
        });
    });
    
    document.getElementById('submit-goal')?.addEventListener('click', submitGoal);
    document.getElementById('submit-answer-input')?.addEventListener('click', submitInputAnswer);
    document.getElementById('accept-strategy')?.addEventListener('click', acceptStrategy);
    document.getElementById('go-to-report')?.addEventListener('click', goToReport);
    document.getElementById('submit-report')?.addEventListener('click', submitReport);
    document.getElementById('next-day')?.addEventListener('click', nextDay);
}

function showDetectedGoal(parsed) {
    const container = document.getElementById('goal-detected');
    const typeEl = document.getElementById('detected-type');
    const amountEl = document.getElementById('detected-amount');
    
    const typeInfo = GOAL_TYPES[parsed.type];
    typeEl.textContent = `${typeInfo?.icon || '🎯'} ${typeInfo?.name || 'Цель'}`;
    
    if (parsed.amount) {
        amountEl.textContent = `${new Intl.NumberFormat('ru-RU').format(parsed.amount)} ₽`;
        amountEl.classList.remove('hidden');
    } else {
        amountEl.classList.add('hidden');
    }
    
    container.classList.remove('hidden');
}

function renderCurrentStage() {
    Object.values(stages).forEach(stage => {
        if (stage) stage.classList.remove('active');
    });
    
    if (stages[appState.stage]) {
        stages[appState.stage].classList.add('active');
    }
    
    const backBtn = document.getElementById('back-to-goals');
    const userData = getUserData();
    if (backBtn) {
        backBtn.classList.toggle('hidden', !(userData?.goals?.length > 0 && appState.stage === 'goal'));
    }
    
    switch (appState.stage) {
        case 'goals-list': renderGoalsList(); break;
        case 'goal':
            document.getElementById('goal-text').value = '';
            document.getElementById('goal-detected').classList.add('hidden');
            break;
        case 'questions': renderQuestions(); break;
        case 'strategy': renderStrategy(); break;
        case 'tasks': renderTasks(); break;
        case 'report': renderReport(); break;
    }
    
    updateGoalDisplay();
}

function renderGoalsList() {
    const userData = getUserData();
    const goals = userData?.goals || [];
    const container = document.getElementById('my-goals-list');
    
    if (goals.length === 0) {
        container.innerHTML = '<div class="empty-goals"><p>Создай первую цель</p></div>';
        return;
    }
    
    container.innerHTML = goals.map(goal => {
        const typeInfo = GOAL_TYPES[goal.type] || {};
        const progress = calculateGoalProgress(goal);
        const completionRate = calculateGoalCompletionRate(goal);
        const ratePercent = Math.round(completionRate * 100);
        
        let actionText = goal.strategy ? `День ${goal.currentDay}` : 'Настроить';
        
        return `
            <div class="goal-card-mini" data-id="${goal.id}">
                <div class="goal-card-header">
                    <span class="goal-icon">${typeInfo.icon || '🎯'}</span>
                    <div class="goal-card-actions">
                        <button class="goal-edit-btn" data-id="${goal.id}" title="Редактировать">✏️</button>
                        <button class="goal-delete-btn" data-id="${goal.id}" title="Удалить">🗑️</button>
                    </div>
                </div>
                <div class="goal-card-text">${goal.text}</div>
                <div class="goal-progress-info">
                    <span class="progress-status">${progress.status}</span>
                    <span class="progress-percent">${progress.percent}%</span>
                </div>
                <div class="goal-card-progress">
                    <div class="goal-progress-bar-mini" style="width: ${progress.percent}%"></div>
                </div>
                <div class="goal-card-stats">
                    <span>День ${goal.currentDay}</span>
                    <span class="${ratePercent >= 80 ? 'good' : ratePercent >= 50 ? 'neutral' : 'bad'}">${ratePercent}% задач</span>
                </div>
                <button class="goal-action-btn" data-goal-id="${goal.id}">${actionText}</button>
            </div>
        `;
    }).join('');
    
    container.querySelectorAll('.goal-action-btn').forEach(btn => {
        btn.addEventListener('click', () => openGoal(btn.dataset.goalId));
    });
    
    container.querySelectorAll('.goal-delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteGoal(btn.dataset.id);
        });
    });
    
    container.querySelectorAll('.goal-edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            editGoal(btn.dataset.id);
        });
    });
}

function editGoal(goalId) {
    const userData = getUserData();
    const goal = userData.goals.find(g => g.id === goalId);
    if (!goal) return;
    
    const newText = prompt('Редактировать цель:', goal.text);
    if (newText && newText.trim() !== goal.text) {
        goal.text = newText.trim();
        const parsed = parseGoalText(newText);
        goal.type = parsed.type;
        goal.amount = parsed.amount;
        saveUserData(userData);
        renderGoalsList();
    }
}

function openGoal(goalId) {
    const userData = getUserData();
    const goal = userData.goals.find(g => g.id === goalId);
    if (!goal) return;
    
    appState.currentGoalId = goalId;
    
    if (!goal.strategy) {
        appState.currentQuestions = getQuestionsForGoalType(goal.type);
        appState.questionIndex = 0;
        appState.stage = 'questions';
    } else if (!goal.currentTasks || goal.currentTasks.length === 0) {
        goal.currentTasks = generateTasksForGoal(goal);
        saveCurrentGoal(goal);
        appState.stage = 'tasks';
    } else {
        appState.stage = 'tasks';
    }
    
    renderCurrentStage();
}

function updateGoalDisplay() {
    const goal = getCurrentGoal();
    if (!goal) return;
    
    const goalText = goal.text.length > 40 ? goal.text.substring(0, 40) + '...' : goal.text;
    
    document.querySelectorAll('[id^="display-goal"]').forEach(el => {
        el.textContent = goalText;
    });
    
    document.querySelectorAll('[id^="current-day"]').forEach(el => {
        el.textContent = goal.currentDay;
    });
}

function submitGoal() {
    const text = document.getElementById('goal-text').value.trim();
    if (text.length < 5) {
        alert('Опиши цель подробнее');
        return;
    }
    
    const user = getCurrentUser();
    const userData = getUserData();
    const goal = createGoal(text, user.id);
    
    userData.goals.push(goal);
    saveUserData(userData);
    
    appState.currentGoalId = goal.id;
    appState.currentQuestions = getQuestionsForGoalType(goal.type);
    appState.questionIndex = 0;
    appState.selectedOptions = [];
    appState.stage = 'questions';
    
    renderCurrentStage();
}

function renderQuestions() {
    const goal = getCurrentGoal();
    if (!goal) return;
    
    const questions = appState.currentQuestions;
    if (!questions || appState.questionIndex >= questions.length) {
        determineAndShowStrategy();
        return;
    }
    
    const question = questions[appState.questionIndex];
    document.getElementById('current-question').textContent = question.question;
    
    const optionsContainer = document.getElementById('question-options');
    const inputContainer = document.getElementById('question-input-container');
    
    optionsContainer.innerHTML = '';
    
    if (question.type === 'options') {
        optionsContainer.classList.remove('hidden');
        inputContainer.classList.add('hidden');
        
        question.options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = option.label;
            
            if (question.multiple && appState.selectedOptions.includes(option.value)) {
                btn.classList.add('selected');
            }
            
            btn.addEventListener('click', () => {
                if (question.multiple) {
                    toggleOption(option.value, btn);
                } else {
                    selectOption(question.id, option.value);
                }
            });
            
            optionsContainer.appendChild(btn);
        });
        
        if (question.multiple) {
            const nextBtn = document.createElement('button');
            nextBtn.className = 'primary-btn';
            nextBtn.textContent = 'Далее';
            nextBtn.style.marginTop = '20px';
            nextBtn.addEventListener('click', () => submitMultipleOptions(question.id));
            optionsContainer.appendChild(nextBtn);
        }
    } else if (question.type === 'text' || question.type === 'number') {
        optionsContainer.classList.add('hidden');
        inputContainer.classList.remove('hidden');
        const input = document.getElementById('question-input');
        input.type = question.type === 'number' ? 'number' : 'text';
        input.placeholder = question.placeholder || '';
        input.value = '';
    }
}

function selectOption(questionId, value) {
    const goal = getCurrentGoal();
    goal.profile[questionId] = value;
    saveCurrentGoal(goal);
    
    appState.questionIndex++;
    appState.selectedOptions = [];
    renderQuestions();
}

function toggleOption(value, btn) {
    const idx = appState.selectedOptions.indexOf(value);
    if (idx > -1) {
        appState.selectedOptions.splice(idx, 1);
        btn.classList.remove('selected');
    } else {
        appState.selectedOptions.push(value);
        btn.classList.add('selected');
    }
}

function submitMultipleOptions(questionId) {
    if (appState.selectedOptions.length === 0) {
        alert('Выбери хотя бы один вариант');
        return;
    }
    
    const goal = getCurrentGoal();
    goal.profile[questionId] = [...appState.selectedOptions];
    saveCurrentGoal(goal);
    
    appState.questionIndex++;
    appState.selectedOptions = [];
    renderQuestions();
}

function submitInputAnswer() {
    const input = document.getElementById('question-input');
    const value = input.value.trim();
    
    if (!value) {
        alert('Введи ответ');
        return;
    }
    
    const goal = getCurrentGoal();
    const question = appState.currentQuestions[appState.questionIndex];
    goal.profile[question.id] = question.type === 'number' ? parseFloat(value) : value;
    saveCurrentGoal(goal);
    
    appState.questionIndex++;
    input.value = '';
    renderQuestions();
}

function determineAndShowStrategy() {
    const goal = getCurrentGoal();
    goal.strategy = getStrategyForGoal(goal, goal.profile);
    saveCurrentGoal(goal);
    
    appState.stage = 'strategy';
    renderCurrentStage();
}

function renderStrategy() {
    const goal = getCurrentGoal();
    if (!goal?.strategy) return;
    
    document.getElementById('strategy-name').textContent = goal.strategy.name;
    document.getElementById('strategy-desc').textContent = goal.strategy.description;
    document.getElementById('strategy-path').textContent = goal.strategy.path;
}

function acceptStrategy() {
    const goal = getCurrentGoal();
    goal.currentTasks = generateSmartTasks(goal);
    saveCurrentGoal(goal);
    
    appState.stage = 'tasks';
    renderCurrentStage();
}

function renderTasks() {
    const goal = getCurrentGoal();
    if (!goal) return;
    
    const container = document.getElementById('tasks-list');
    const tasks = goal.currentTasks || [];
    
    container.innerHTML = tasks.map((task, i) => {
        let tipHtml = '';
        if (task.tip) {
            tipHtml = `<div class="task-tip"><strong>💡 ${task.tip.name}:</strong> ${task.tip.desc}</div>`;
        }
        
        return `
            <div class="task-item">
                <div class="task-number">${i + 1}</div>
                <div class="task-content">
                    <h4>${task.title}</h4>
                    <p>${task.detail}</p>
                    ${tipHtml}
                </div>
            </div>
        `;
    }).join('');
    
    // Кнопка проверки прогресса
    if (goal.type === 'language' || goal.type === 'discipline') {
        const checkBtn = document.createElement('button');
        checkBtn.className = 'check-progress-btn';
        checkBtn.textContent = '🎯 Проверить прогресс';
        checkBtn.addEventListener('click', () => {
            runProgressCheck(goal, (results) => {
                saveCurrentGoal(goal);
            });
        });
        container.after(checkBtn);
    }
}

function goToReport() {
    appState.stage = 'report';
    renderCurrentStage();
}

function renderReport() {
    const goal = getCurrentGoal();
    if (!goal) return;
    
    const tasksContainer = document.getElementById('report-tasks');
    const tasks = goal.currentTasks || [];
    
    tasksContainer.innerHTML = tasks.map((task, i) => `
        <div class="report-task-item" data-index="${i}">
            <div class="report-checkbox"></div>
            <div class="report-task-text">${task.title}</div>
        </div>
    `).join('');
    
    tasksContainer.querySelectorAll('.report-task-item').forEach(el => {
        el.addEventListener('click', () => el.classList.toggle('completed'));
    });
    
    // Индивидуальные вопросы для отчёта
    const reportQuestions = getReportQuestionsForGoal(goal);
    const detailsContainer = document.querySelector('.report-details-dynamic') || createReportDetailsContainer();
    
    detailsContainer.innerHTML = reportQuestions.map(q => {
        if (q.type === 'boolean') {
            return `
                <div class="report-field">
                    <label>${q.label}</label>
                    <div class="report-boolean" data-id="${q.id}">
                        <button class="bool-btn" data-value="true">Да</button>
                        <button class="bool-btn" data-value="false">Нет</button>
                    </div>
                </div>
            `;
        }
        return `
            <div class="report-field">
                <label for="report-${q.id}">${q.label}</label>
                <input type="${q.type === 'number' ? 'number' : 'text'}" 
                       id="report-${q.id}" 
                       data-id="${q.id}"
                       placeholder="${q.placeholder || ''}">
            </div>
        `;
    }).join('');
    
    // Обработчики для boolean кнопок
    detailsContainer.querySelectorAll('.report-boolean').forEach(container => {
        container.querySelectorAll('.bool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.bool-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        });
    });
}

function createReportDetailsContainer() {
    const container = document.createElement('div');
    container.className = 'report-details-dynamic';
    const submitBtn = document.getElementById('submit-report');
    submitBtn.parentNode.insertBefore(container, submitBtn);
    return container;
}

function submitReport() {
    const goal = getCurrentGoal();
    if (!goal) return;
    
    const completedTasks = [];
    document.querySelectorAll('.report-task-item.completed').forEach(el => {
        completedTasks.push(parseInt(el.dataset.index));
    });
    
    // Собираем данные из индивидуальных полей
    const reportData = {};
    document.querySelectorAll('.report-details-dynamic input').forEach(input => {
        const id = input.dataset.id;
        reportData[id] = input.type === 'number' ? parseFloat(input.value) || 0 : input.value;
    });
    
    document.querySelectorAll('.report-boolean').forEach(container => {
        const id = container.dataset.id;
        const selected = container.querySelector('.bool-btn.selected');
        reportData[id] = selected ? selected.dataset.value === 'true' : false;
    });
    
    // Стандартные поля
    reportData.text = document.getElementById('report-text')?.value || '';
    reportData.obstacles = document.getElementById('report-obstacles')?.value || '';
    
    const tasks = goal.currentTasks || [];
    const analysis = analyzeReport({ completedTasks, ...reportData }, tasks, goal.history || [], goal);
    
    if (!goal.history) goal.history = [];
    goal.history.push({
        day: goal.currentDay,
        date: new Date().toISOString(),
        tasks: tasks,
        completedTasks: completedTasks.length,
        totalTasks: tasks.length,
        reportData: reportData,
        analysis: analysis
    });
    
    saveCurrentGoal(goal);
    updateUserStats(completedTasks.length, tasks.length);
    
    document.getElementById('analysis-content').innerHTML = formatAnalysisHTML(analysis);
    
    const questionsContainer = document.getElementById('analysis-questions');
    const hardQuestionsEl = document.getElementById('hard-questions');
    
    if (analysis.hardQuestions?.length > 0) {
        questionsContainer.classList.remove('hidden');
        hardQuestionsEl.innerHTML = formatHardQuestionsHTML(analysis.hardQuestions);
    } else {
        questionsContainer.classList.add('hidden');
    }
    
    appState.stage = 'analysis';
    renderCurrentStage();
}

function updateUserStats(completed, total) {
    const userData = getUserData();
    if (!userData.stats) {
        userData.stats = { totalDays: 0, totalTasks: 0, completedTasks: 0, currentStreak: 0, bestStreak: 0 };
    }
    
    userData.stats.totalDays++;
    userData.stats.totalTasks += total;
    userData.stats.completedTasks += completed;
    
    const rate = total > 0 ? completed / total : 0;
    if (rate >= 0.8) {
        userData.stats.currentStreak++;
        userData.stats.bestStreak = Math.max(userData.stats.bestStreak, userData.stats.currentStreak);
    } else {
        userData.stats.currentStreak = 0;
    }
    
    saveUserData(userData);
}

function nextDay() {
    const goal = getCurrentGoal();
    if (!goal) return;
    
    goal.currentDay++;
    goal.currentTasks = generateSmartTasks(goal);
    saveCurrentGoal(goal);
    
    appState.stage = 'tasks';
    renderCurrentStage();
}

window.appState = appState;
