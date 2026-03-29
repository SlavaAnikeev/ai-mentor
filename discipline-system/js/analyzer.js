/**
 * DISCIPLINE - Smart Analyzer
 * Умный анализ отчётов с учётом типа цели и прогресса
 */

/**
 * Главная функция анализа
 */
function analyzeReport(report, tasks, history, goal) {
    const analysis = {
        stats: {},
        sections: [],
        hardQuestions: [],
        recommendations: []
    };
    
    // Базовая статистика
    const completedCount = report.completedTasks?.length || 0;
    const totalCount = tasks.length;
    const completionRate = totalCount > 0 ? completedCount / totalCount : 0;
    
    analysis.stats = {
        completed: completedCount,
        total: totalCount,
        rate: completionRate,
        ratePercent: Math.round(completionRate * 100),
        streak: calculateStreak(history, completionRate),
        totalDays: history.length + 1
    };
    
    // Определяем уровень выполнения
    let completionLevel;
    if (completionRate === 0) completionLevel = 'zero';
    else if (completionRate < 0.5) completionLevel = 'low';
    else if (completionRate < 1) completionLevel = 'medium';
    else completionLevel = 'high';
    
    // Анализ в зависимости от типа цели
    if (goal) {
        analyzeByGoalType(analysis, report, goal, completionLevel);
    } else {
        analyzeGeneric(analysis, report, completionLevel);
    }
    
    // Невыполненные задачи
    if (completedCount < totalCount) {
        const uncompletedTasks = tasks.filter((_, idx) => !report.completedTasks?.includes(idx));
        analysis.sections.push({
            title: 'Не выполнено',
            type: 'list',
            items: uncompletedTasks.map(t => t.title)
        });
    }
    
    // Жёсткие вопросы
    analysis.hardQuestions = generateHardQuestions(completionLevel, goal, report);
    
    // Рекомендации на основе данных
    analysis.sections.push({
        title: 'На завтра',
        content: generateSmartRecommendation(goal, report, completionLevel)
    });
    
    return analysis;
}

/**
 * Анализ для языковых целей
 */
function analyzeLanguageGoal(analysis, report, goal) {
    const studyTime = report.study_time || 0;
    const newWords = report.new_words || 0;
    const speakingTime = report.speaking || 0;
    
    let verdict = '';
    
    if (studyTime === 0 && newWords === 0) {
        verdict = 'Ты сегодня вообще не учился. Ноль минут = ноль прогресса. Язык сам себя не выучит.';
    } else if (studyTime < 15) {
        verdict = `${studyTime} минут — это почти ничего. Минимум 30 минут в день нужно для прогресса.`;
    } else if (newWords < 5) {
        verdict = `${newWords} новых слов — слишком мало. Цель: минимум 10 слов в день.`;
    } else if (speakingTime === 0 && goal.currentDay > 7) {
        verdict = 'Ты учишь слова, но не практикуешь речь. Говори вслух каждый день!';
    } else if (studyTime >= 30 && newWords >= 10) {
        verdict = 'Хороший темп. Но не расслабляйся — постоянство важнее рывков.';
    } else {
        verdict = 'Работа идёт, но можно лучше. Увеличь время и количество слов.';
    }
    
    analysis.sections.unshift({
        title: 'Анализ',
        content: verdict
    });
    
    // Статистика по языку
    const totalWords = (goal.progressData?.masteredWordsCount || 0) + newWords;
    analysis.sections.push({
        title: 'Словарный запас',
        content: `~${totalWords} слов изучено. ${totalWords < 500 ? 'Нужно минимум 500 для базового общения.' : totalWords < 2000 ? 'Хорошо, но нужно 2000 для уровня B1.' : 'Отличный запас!'}`
    });
}

/**
 * Анализ для целей дисциплины
 */
function analyzeDisciplineGoal(analysis, report, goal) {
    const wakeTime = report.wake_time;
    const phoneHours = report.phone_hours || 0;
    const mainTaskDone = report.main_task;
    
    let verdict = '';
    let issues = [];
    
    // Анализ времени подъёма
    if (wakeTime) {
        const wakeHour = parseInt(wakeTime.match(/(\d+)/)?.[1] || 8);
        if (wakeHour >= 10) {
            issues.push(`Встал в ${wakeTime} — это поздно. Каждый день вставай на 15 минут раньше.`);
        } else if (wakeHour >= 8) {
            issues.push(`${wakeTime} — нормально, но можно раньше. Цель: 6-7 утра.`);
        }
    }
    
    // Телефон
    if (phoneHours >= 4) {
        issues.push(`${phoneHours} часов в телефоне — это проблема. Твоя жизнь утекает в экран.`);
    } else if (phoneHours >= 2) {
        issues.push(`${phoneHours} часа в телефоне — многовато. Цель: меньше 1.5 часов.`);
    }
    
    // Главная задача
    if (!mainTaskDone) {
        issues.push('Главная задача дня не выполнена. Это должен быть приоритет №1.');
    }
    
    if (issues.length === 0) {
        verdict = 'Сегодня ты следовал плану. Один день — не победа. Продолжай минимум 21 день.';
    } else if (issues.length === 1) {
        verdict = issues[0];
    } else {
        verdict = 'Проблемы: ' + issues.join(' ');
    }
    
    analysis.sections.unshift({
        title: 'Разбор',
        content: verdict
    });
}

/**
 * Анализ для финансовых целей
 */
function analyzeFinancialGoal(analysis, report, goal) {
    const moneyEarned = report.money_earned || 0;
    const clientsContacted = report.clients_contacted || 0;
    const responses = report.responses || 0;
    
    let verdict = '';
    
    if (clientsContacted === 0) {
        verdict = 'Ноль контактов = ноль денег. Деньги не придут сами. Пиши людям!';
    } else if (clientsContacted < 5) {
        verdict = `${clientsContacted} контактов — слишком мало. Минимум 10 в день. Лучше 20.`;
    } else if (responses === 0 && clientsContacted > 0) {
        verdict = `${clientsContacted} сообщений и 0 ответов. Проблема в тексте или аудитории. Меняй подход.`;
    } else {
        const convRate = (responses / clientsContacted * 100).toFixed(1);
        verdict = `Конверсия ${convRate}%. ${convRate < 10 ? 'Низкая. Улучшай предложение.' : 'Неплохо. Масштабируй.'}`;
    }
    
    if (moneyEarned > 0) {
        verdict += ` Заработал ${moneyEarned}₽ — это результат. Продолжай.`;
    }
    
    analysis.sections.unshift({
        title: 'Анализ',
        content: verdict
    });
}

/**
 * Анализ по типу цели
 */
function analyzeByGoalType(analysis, report, goal, completionLevel) {
    switch (goal.type) {
        case 'language':
            analyzeLanguageGoal(analysis, report, goal);
            break;
        case 'discipline':
            analyzeDisciplineGoal(analysis, report, goal);
            break;
        case 'financial':
            analyzeFinancialGoal(analysis, report, goal);
            break;
        case 'career':
            analyzeCareerGoal(analysis, report, goal);
            break;
        case 'health':
            analyzeHealthGoal(analysis, report, goal);
            break;
        default:
            analyzeGeneric(analysis, report, completionLevel);
    }
    
    // Прогресс к цели
    const progress = calculateGoalProgress(goal);
    analysis.sections.push({
        title: 'Прогресс к цели',
        content: `${progress.percent}% — ${progress.status}. ${progress.percent < 30 ? 'Нужно больше действий.' : progress.percent < 70 ? 'Движешься, но не расслабляйся.' : 'Близко к цели. Дожимай!'}`
    });
}

function analyzeCareerGoal(analysis, report, goal) {
    const apps = report.applications_sent || 0;
    const interviews = report.interviews || 0;
    
    let verdict = '';
    
    if (apps === 0) {
        verdict = 'Ни одного отклика сегодня. Работа сама тебя не найдёт.';
    } else if (apps < 10) {
        verdict = `${apps} откликов — мало. Минимум 15 в день для результата.`;
    } else {
        verdict = `${apps} откликов — хорошо. `;
        if (interviews > 0) {
            verdict += `${interviews} собеседований — отлично, конвертируй в оффер!`;
        } else {
            verdict += 'Пока без собеседований. Проверь резюме и сопроводительные.';
        }
    }
    
    analysis.sections.unshift({ title: 'Анализ', content: verdict });
}

function analyzeHealthGoal(analysis, report, goal) {
    const workoutDone = report.workout_done;
    const duration = report.duration || 0;
    const dietFollowed = report.diet_followed;
    
    let verdict = '';
    
    if (!workoutDone) {
        verdict = 'Сегодня без тренировки. Это не отдых — это откат назад.';
    } else if (duration < 15) {
        verdict = `${duration} минут — лучше чем ничего, но недостаточно. Цель: 30+ минут.`;
    } else {
        verdict = `${duration} минут тренировки — хорошо. `;
        if (!dietFollowed) {
            verdict += 'Но питание не соблюдал. 80% результата — это питание!';
        } else {
            verdict += 'Питание в норме. Продолжай!';
        }
    }
    
    analysis.sections.unshift({ title: 'Анализ', content: verdict });
}

function analyzeGeneric(analysis, report, completionLevel) {
    const verdicts = {
        zero: 'Ноль выполненных задач. Это не неудача — это выбор ничего не делать.',
        low: 'Меньше половины выполнено. Делаешь минимум и ждёшь максимум?',
        medium: 'Большая часть сделана, но не всё. Что помешало закончить?',
        high: 'Всё выполнено. Теперь вопрос — качественно или формально?'
    };
    
    analysis.sections.unshift({
        title: 'Вердикт',
        content: verdicts[completionLevel]
    });
}

/**
 * Генерация жёстких вопросов
 */
function generateHardQuestions(completionLevel, goal, report) {
    const questions = {
        zero: [
            'Ты действительно хочешь этого или просто нравится идея?',
            'Что конкретно завтра сделаешь по-другому?',
            'Готов признать, что сегодня выбрал комфорт вместо цели?'
        ],
        low: [
            'Почему остановился на половине? Что было важнее?',
            'Какую задачу избегал и почему?',
            'Ты делаешь то, что легко, или то, что нужно?'
        ],
        medium: [
            'Что помешало закончить? Будь честен.',
            'Ты доволен собой или знаешь, что мог больше?'
        ],
        high: []
    };
    
    let selected = questions[completionLevel] || [];
    
    // Добавляем вопросы специфичные для типа цели
    if (goal?.type === 'discipline' && report.phone_hours > 3) {
        selected.push('Почему телефон важнее твоих целей?');
    }
    
    if (goal?.type === 'language' && (report.speaking || 0) === 0) {
        selected.push('Когда начнёшь говорить, а не только читать?');
    }
    
    if (goal?.type === 'financial' && (report.clients_contacted || 0) < 5) {
        selected.push('Почему боишься писать людям?');
    }
    
    return selected.slice(0, 2);
}

/**
 * Умная рекомендация на завтра
 */
function generateSmartRecommendation(goal, report, completionLevel) {
    if (completionLevel === 'zero') {
        return 'Завтра те же задачи. Пока не сделаешь — не двинешься.';
    }
    
    if (!goal) {
        return completionLevel === 'high' 
            ? 'Задачи усложняются. Ты готов.' 
            : 'Доделай сегодняшнее и возьми больше.';
    }
    
    switch (goal.type) {
        case 'language':
            const words = report.new_words || 0;
            if (words < 10) return 'Завтра: больше слов. Минимум 15. Используй карточки.';
            if ((report.speaking || 0) === 0) return 'Завтра: говори вслух минимум 15 минут.';
            return 'Завтра: новый уровень сложности. Читай без словаря.';
            
        case 'discipline':
            if ((report.phone_hours || 5) > 2) return 'Завтра: телефон в другую комнату. Лимит 1 час.';
            if (!report.main_task) return 'Завтра: главная задача до 12:00. Без исключений.';
            return 'Завтра: усиливаем режим. Подъём на 30 минут раньше.';
            
        case 'financial':
            if ((report.clients_contacted || 0) < 10) return 'Завтра: минимум 15 контактов. Больше действий.';
            if ((report.responses || 0) === 0) return 'Завтра: переписываем текст предложения. Тестируй другой подход.';
            return 'Завтра: масштабируй то, что работает. Удвой контакты.';
            
        default:
            return completionLevel === 'high' 
                ? 'Задачи становятся сложнее. Ты растёшь.' 
                : 'Сначала доделай всё. Потом усложняем.';
    }
}

/**
 * Расчёт серии
 */
function calculateStreak(history, todayRate) {
    let streak = todayRate >= 0.8 ? 1 : 0;
    
    for (let i = history.length - 1; i >= 0; i--) {
        const day = history[i];
        if (day.completedTasks >= day.totalTasks * 0.8) {
            streak++;
        } else {
            break;
        }
    }
    
    return streak;
}

/**
 * Форматирование анализа в HTML
 */
function formatAnalysisHTML(analysis) {
    let html = '';
    
    // Статистика
    html += `
        <div class="analysis-section">
            <h4>Статистика</h4>
            <div class="analysis-stat">
                <span class="analysis-stat-label">Выполнено</span>
                <span class="analysis-stat-value ${analysis.stats.rate >= 0.8 ? 'good' : analysis.stats.rate >= 0.5 ? 'neutral' : 'bad'}">
                    ${analysis.stats.completed}/${analysis.stats.total}
                </span>
            </div>
            <div class="analysis-stat">
                <span class="analysis-stat-label">Серия дней</span>
                <span class="analysis-stat-value ${analysis.stats.streak > 0 ? 'good' : 'bad'}">
                    ${analysis.stats.streak}
                </span>
            </div>
        </div>
    `;
    
    // Секции
    analysis.sections.forEach(section => {
        html += `<div class="analysis-section"><h4>${section.title}</h4>`;
        
        if (section.type === 'list') {
            html += '<ul>' + section.items.map(i => `<li>${i}</li>`).join('') + '</ul>';
        } else {
            html += `<p>${section.content}</p>`;
        }
        
        html += '</div>';
    });
    
    return html;
}

function formatHardQuestionsHTML(questions) {
    return questions.map(q => `<div class="hard-question"><p>${q}</p></div>`).join('');
}

// Экспорт
window.analyzeReport = analyzeReport;
window.formatAnalysisHTML = formatAnalysisHTML;
window.formatHardQuestionsHTML = formatHardQuestionsHTML;
