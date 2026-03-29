/**
 * DISCIPLINE - Quiz/Testing System
 * Система тестирования и проверки прогресса
 */

/**
 * Проверка для языковых целей
 */
function runLanguageQuiz(goal, onComplete) {
    const level = mapLevelToWordLevel(goal.profile?.current_level);
    const learnedWords = goal.progressData?.learnedWords || [];
    
    // Генерируем тест
    const wordTest = generateEnglishWordTest(level, 5, learnedWords);
    
    showQuizModal({
        title: '🎯 Проверка слов',
        subtitle: `Проверим, что ты запомнил. Уровень: ${level.toUpperCase()}`,
        questions: wordTest,
        onComplete: (results) => {
            // Обновляем прогресс
            updateLanguageProgress(goal, results);
            onComplete(results);
        }
    });
}

function mapLevelToWordLevel(level) {
    const map = {
        'zero': 'a1',
        'a1': 'a1',
        'a2': 'a2',
        'b1': 'b1',
        'b2': 'b2'
    };
    return map[level] || 'a1';
}

function updateLanguageProgress(goal, results) {
    if (!goal.progressData) goal.progressData = {};
    if (!goal.progressData.learnedWords) goal.progressData.learnedWords = [];
    if (!goal.progressData.quizHistory) goal.progressData.quizHistory = [];
    
    // Обновляем слова
    results.forEach(r => {
        const existing = goal.progressData.learnedWords.find(w => w.word === r.word);
        if (existing) {
            if (r.correct) {
                existing.correctCount++;
            } else {
                existing.correctCount = Math.max(0, existing.correctCount - 1);
            }
            existing.lastTested = new Date().toISOString();
        } else {
            goal.progressData.learnedWords.push({
                word: r.word,
                correctCount: r.correct ? 1 : 0,
                lastTested: new Date().toISOString()
            });
        }
    });
    
    // Сохраняем историю тестов
    goal.progressData.quizHistory.push({
        date: new Date().toISOString(),
        correct: results.filter(r => r.correct).length,
        total: results.length,
        type: 'words'
    });
    
    // Обновляем уровень если нужно
    const masteredWords = goal.progressData.learnedWords.filter(w => w.correctCount >= 3).length;
    goal.progressData.masteredWordsCount = masteredWords;
    
    // Автоматическое повышение уровня
    const currentLevel = goal.profile?.current_level || 'zero';
    if (masteredWords >= 40 && currentLevel === 'zero') {
        goal.profile.current_level = 'a1';
        goal.progressData.levelUpMessage = 'Поздравляю! Ты достиг уровня A1!';
    } else if (masteredWords >= 100 && currentLevel === 'a1') {
        goal.profile.current_level = 'a2';
        goal.progressData.levelUpMessage = 'Отлично! Ты на уровне A2!';
    }
}

/**
 * Показать модальное окно с тестом
 */
function showQuizModal(config) {
    const { title, subtitle, questions, onComplete } = config;
    
    // Создаём модальное окно
    const modal = document.createElement('div');
    modal.className = 'quiz-modal';
    modal.innerHTML = `
        <div class="quiz-modal-content">
            <div class="quiz-header">
                <h2>${title}</h2>
                <p>${subtitle}</p>
            </div>
            <div class="quiz-body">
                <div class="quiz-progress">
                    <span id="quiz-current">1</span> / <span id="quiz-total">${questions.length}</span>
                </div>
                <div id="quiz-question-container"></div>
            </div>
            <div class="quiz-footer">
                <div id="quiz-feedback" class="quiz-feedback hidden"></div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Логика прохождения
    let currentIndex = 0;
    const results = [];
    
    function showQuestion(index) {
        const q = questions[index];
        const container = document.getElementById('quiz-question-container');
        document.getElementById('quiz-current').textContent = index + 1;
        
        if (q.options) {
            // Вопрос с вариантами
            container.innerHTML = `
                <div class="quiz-question">${q.question}</div>
                <div class="quiz-options">
                    ${q.options.map((opt, i) => `
                        <button class="quiz-option" data-value="${opt}">${opt}</button>
                    `).join('')}
                </div>
            `;
            
            container.querySelectorAll('.quiz-option').forEach(btn => {
                btn.addEventListener('click', () => {
                    const isCorrect = btn.dataset.value === q.correctAnswer;
                    results.push({
                        question: q.question,
                        answer: btn.dataset.value,
                        correct: isCorrect,
                        correctAnswer: q.correctAnswer,
                        word: q.word
                    });
                    
                    // Показываем результат
                    btn.classList.add(isCorrect ? 'correct' : 'wrong');
                    if (!isCorrect) {
                        container.querySelectorAll('.quiz-option').forEach(b => {
                            if (b.dataset.value === q.correctAnswer) {
                                b.classList.add('correct');
                            }
                        });
                    }
                    
                    showFeedback(isCorrect);
                    
                    setTimeout(() => {
                        if (currentIndex < questions.length - 1) {
                            currentIndex++;
                            showQuestion(currentIndex);
                        } else {
                            finishQuiz();
                        }
                    }, 1000);
                });
            });
        } else if (q.inputType === 'text') {
            // Вопрос с вводом
            container.innerHTML = `
                <div class="quiz-question">${q.question}</div>
                <input type="text" class="quiz-input" placeholder="Введи перевод..." id="quiz-answer-input">
                <button class="quiz-submit-btn" id="quiz-submit">Проверить</button>
            `;
            
            const input = document.getElementById('quiz-answer-input');
            const submitBtn = document.getElementById('quiz-submit');
            
            const checkAnswer = () => {
                const answer = input.value.trim().toLowerCase();
                const correct = q.correctAnswer.toLowerCase();
                const isCorrect = answer === correct || correct.includes(answer);
                
                results.push({
                    question: q.question,
                    answer: answer,
                    correct: isCorrect,
                    correctAnswer: q.correctAnswer,
                    word: q.word
                });
                
                input.classList.add(isCorrect ? 'correct' : 'wrong');
                showFeedback(isCorrect, q.correctAnswer);
                
                setTimeout(() => {
                    if (currentIndex < questions.length - 1) {
                        currentIndex++;
                        showQuestion(currentIndex);
                    } else {
                        finishQuiz();
                    }
                }, 1500);
            };
            
            submitBtn.addEventListener('click', checkAnswer);
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') checkAnswer();
            });
            input.focus();
        }
    }
    
    function showFeedback(isCorrect, correctAnswer = null) {
        const feedback = document.getElementById('quiz-feedback');
        feedback.classList.remove('hidden');
        feedback.className = `quiz-feedback ${isCorrect ? 'correct' : 'wrong'}`;
        feedback.innerHTML = isCorrect 
            ? '✓ Правильно!' 
            : `✗ Неправильно${correctAnswer ? `. Правильный ответ: ${correctAnswer}` : ''}`;
    }
    
    function finishQuiz() {
        const correct = results.filter(r => r.correct).length;
        const total = results.length;
        const percent = Math.round((correct / total) * 100);
        
        const container = document.getElementById('quiz-question-container');
        container.innerHTML = `
            <div class="quiz-results">
                <div class="quiz-score ${percent >= 80 ? 'great' : percent >= 50 ? 'ok' : 'bad'}">
                    ${correct} / ${total}
                </div>
                <div class="quiz-score-percent">${percent}%</div>
                <p class="quiz-message">
                    ${percent >= 80 ? '🎉 Отлично! Ты хорошо усвоил материал!' : 
                      percent >= 50 ? '👍 Неплохо, но есть куда расти.' : 
                      '📚 Нужно повторить материал. Не сдавайся!'}
                </p>
                <button class="primary-btn quiz-close-btn">Закрыть</button>
            </div>
        `;
        
        document.getElementById('quiz-feedback').classList.add('hidden');
        
        container.querySelector('.quiz-close-btn').addEventListener('click', () => {
            modal.remove();
            onComplete(results);
        });
    }
    
    showQuestion(0);
}

/**
 * Проверка для целей дисциплины
 */
function runDisciplineCheck(goal, onComplete) {
    const problems = goal.profile?.main_problem || [];
    const history = goal.history || [];
    
    // Считаем серию успешных дней
    let streak = 0;
    for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].completedTasks >= history[i].totalTasks * 0.8) {
            streak++;
        } else {
            break;
        }
    }
    
    // Анализируем данные отчётов
    const wakeData = history.slice(-7).map(h => h.reportData?.wake_time).filter(Boolean);
    const phoneData = history.slice(-7).map(h => h.reportData?.phone_hours).filter(Boolean);
    
    let avgWakeTime = 'Нет данных';
    let avgPhoneHours = 'Нет данных';
    
    if (wakeData.length > 0) {
        // Парсим время
        const times = wakeData.map(t => {
            const match = t.match(/(\d+)/);
            return match ? parseInt(match[1]) : 8;
        });
        avgWakeTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length) + ':00';
    }
    
    if (phoneData.length > 0) {
        avgPhoneHours = (phoneData.reduce((a, b) => a + b, 0) / phoneData.length).toFixed(1) + ' ч';
    }
    
    showProgressModal({
        title: '📊 Твой прогресс в дисциплине',
        stats: [
            { label: 'Дней подряд выполняешь план', value: streak, good: streak >= 7 },
            { label: 'Среднее время подъёма', value: avgWakeTime, good: parseInt(avgWakeTime) <= 7 },
            { label: 'Среднее время в телефоне', value: avgPhoneHours, good: parseFloat(avgPhoneHours) <= 2 }
        ],
        milestones: [
            { name: '7 дней режима', achieved: streak >= 7 },
            { name: '21 день режима', achieved: streak >= 21 },
            { name: 'Телефон < 2ч/день', achieved: parseFloat(avgPhoneHours) <= 2 },
            { name: 'Подъём до 7:00', achieved: parseInt(avgWakeTime) <= 7 }
        ],
        onClose: onComplete
    });
}

/**
 * Показать прогресс
 */
function showProgressModal(config) {
    const modal = document.createElement('div');
    modal.className = 'quiz-modal';
    modal.innerHTML = `
        <div class="quiz-modal-content">
            <div class="quiz-header">
                <h2>${config.title}</h2>
            </div>
            <div class="quiz-body">
                <div class="progress-stats">
                    ${config.stats.map(s => `
                        <div class="progress-stat ${s.good ? 'good' : 'bad'}">
                            <div class="progress-stat-value">${s.value}</div>
                            <div class="progress-stat-label">${s.label}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="progress-milestones">
                    <h3>Достижения:</h3>
                    ${config.milestones.map(m => `
                        <div class="milestone ${m.achieved ? 'achieved' : ''}">
                            <span class="milestone-icon">${m.achieved ? '✓' : '○'}</span>
                            <span class="milestone-name">${m.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="quiz-footer">
                <button class="primary-btn quiz-close-btn">Закрыть</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.quiz-close-btn').addEventListener('click', () => {
        modal.remove();
        if (config.onClose) config.onClose();
    });
}

/**
 * Общая проверка прогресса для любой цели
 */
function runProgressCheck(goal, onComplete) {
    switch (goal.type) {
        case 'language':
            runLanguageQuiz(goal, onComplete);
            break;
        case 'discipline':
            runDisciplineCheck(goal, onComplete);
            break;
        default:
            showGeneralProgress(goal, onComplete);
    }
}

function showGeneralProgress(goal, onComplete) {
    const progress = calculateGoalProgress(goal);
    const history = goal.history || [];
    
    showProgressModal({
        title: '📊 Твой прогресс',
        stats: [
            { label: 'Прогресс к цели', value: progress.percent + '%', good: progress.percent >= 50 },
            { label: 'Дней в работе', value: history.length, good: history.length >= 7 },
            { label: 'Статус', value: progress.status, good: progress.percent >= 30 }
        ],
        milestones: [
            { name: '7 дней работы', achieved: history.length >= 7 },
            { name: '21 день работы', achieved: history.length >= 21 },
            { name: '50% прогресса', achieved: progress.percent >= 50 },
            { name: '80% прогресса', achieved: progress.percent >= 80 }
        ],
        onClose: onComplete
    });
}

// Экспорт
window.runLanguageQuiz = runLanguageQuiz;
window.runDisciplineCheck = runDisciplineCheck;
window.runProgressCheck = runProgressCheck;
window.showQuizModal = showQuizModal;
