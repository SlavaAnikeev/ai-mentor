/**
 * DISCIPLINE - Smart Tasks System
 * Умная система генерации задач с учётом прогресса и отчётов
 */

/**
 * Анализ истории пользователя для понимания его поведения
 */
function analyzeUserBehavior(goal) {
    const history = goal.history || [];
    const profile = goal.profile || {};
    
    const analysis = {
        totalDays: history.length,
        avgCompletion: 0,
        weakAreas: [],
        strongAreas: [],
        recentTrend: 'stable', // improving, declining, stable
        skippedTaskTypes: {},
        completedTaskTypes: {},
        reportInsights: [],
        lastReportData: null
    };
    
    if (history.length === 0) return analysis;
    
    // Средний процент выполнения
    const completions = history.map(h => h.totalTasks > 0 ? h.completedTasks / h.totalTasks : 0);
    analysis.avgCompletion = completions.reduce((a, b) => a + b, 0) / completions.length;
    
    // Тренд последних 5 дней
    if (history.length >= 5) {
        const recent = completions.slice(-3);
        const older = completions.slice(-6, -3);
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : recentAvg;
        
        if (recentAvg > olderAvg + 0.15) analysis.recentTrend = 'improving';
        else if (recentAvg < olderAvg - 0.15) analysis.recentTrend = 'declining';
    }
    
    // Анализ невыполненных задач
    history.forEach(day => {
        if (!day.tasks) return;
        day.tasks.forEach((task, idx) => {
            const wasCompleted = day.completedTasks > idx; // Упрощённая проверка
            const taskType = categorizeTask(task.title);
            
            if (wasCompleted) {
                analysis.completedTaskTypes[taskType] = (analysis.completedTaskTypes[taskType] || 0) + 1;
            } else {
                analysis.skippedTaskTypes[taskType] = (analysis.skippedTaskTypes[taskType] || 0) + 1;
            }
        });
    });
    
    // Определение слабых и сильных сторон
    for (const [type, count] of Object.entries(analysis.skippedTaskTypes)) {
        const completed = analysis.completedTaskTypes[type] || 0;
        const total = count + completed;
        if (total >= 3 && count / total > 0.5) {
            analysis.weakAreas.push(type);
        }
    }
    
    for (const [type, count] of Object.entries(analysis.completedTaskTypes)) {
        const skipped = analysis.skippedTaskTypes[type] || 0;
        const total = count + skipped;
        if (total >= 3 && count / total > 0.7) {
            analysis.strongAreas.push(type);
        }
    }
    
    // Последние данные отчёта
    if (history.length > 0) {
        analysis.lastReportData = history[history.length - 1].reportData;
    }
    
    return analysis;
}

/**
 * Категоризация задачи по типу
 */
function categorizeTask(taskTitle) {
    const lower = taskTitle.toLowerCase();
    
    if (lower.includes('напиши') || lower.includes('свяжись') || lower.includes('позвони')) {
        return 'communication';
    }
    if (lower.includes('слов') || lower.includes('выучи') || lower.includes('урок')) {
        return 'learning';
    }
    if (lower.includes('практик') || lower.includes('говори') || lower.includes('минут')) {
        return 'practice';
    }
    if (lower.includes('встань') || lower.includes('ложись') || lower.includes('режим')) {
        return 'routine';
    }
    if (lower.includes('телефон') || lower.includes('соцсет') || lower.includes('отвлечен')) {
        return 'focus';
    }
    if (lower.includes('тренир') || lower.includes('шаг') || lower.includes('упражн')) {
        return 'physical';
    }
    if (lower.includes('откли') || lower.includes('клиент') || lower.includes('продаж')) {
        return 'sales';
    }
    
    return 'general';
}

/**
 * Генерация умных задач для языка
 */
function generateLanguageTasks(goal, behavior) {
    const tasks = [];
    const level = goal.profile?.current_level || 'zero';
    const targetLevel = goal.profile?.target_level || 'b1';
    const timeAvailable = goal.profile?.time_available || 30;
    const day = goal.currentDay;
    const lastReport = behavior.lastReportData || {};
    
    // Определяем рабочий уровень слов
    let wordLevel = 'a1';
    if (level === 'a2' || level === 'b1') wordLevel = 'a2';
    if (level === 'b2' || level === 'c1') wordLevel = 'b1';
    
    // Если учил слова вчера, увеличиваем
    const yesterdayWords = lastReport.new_words || 0;
    const baseWords = Math.max(10, yesterdayWords);
    const todayWords = behavior.avgCompletion > 0.7 ? baseWords + 5 : baseWords;
    
    // Если плохо справляется с практикой — добавляем больше
    const needsMorePractice = behavior.weakAreas.includes('practice');
    const needsMoreLearning = behavior.weakAreas.includes('learning');
    
    // Основные задачи
    tasks.push({
        title: `Выучи ${todayWords} новых слов уровня ${wordLevel.toUpperCase()}`,
        detail: 'Запиши каждое слово 3 раза, составь с ним предложение',
        type: 'learning',
        checkable: true,
        verification: 'word_test'
    });
    
    // Разнообразим задачи в зависимости от дня
    const dayMod = day % 7;
    
    if (dayMod === 1 || dayMod === 4) {
        tasks.push({
            title: `Послушай ${Math.round(timeAvailable * 0.5)} минут аудио/подкаста`,
            detail: 'Без субтитров. Записывай незнакомые слова',
            type: 'practice'
        });
    }
    
    if (dayMod === 2 || dayMod === 5) {
        tasks.push({
            title: `Читай ${Math.round(timeAvailable * 0.3)} минут текст на языке`,
            detail: 'Статья, книга, новости. Выписывай новые слова',
            type: 'practice'
        });
    }
    
    if (dayMod === 3 || dayMod === 6) {
        tasks.push({
            title: `Говори вслух ${Math.round(timeAvailable * 0.4)} минут`,
            detail: 'Описывай что видишь, пересказывай что прочитал',
            type: 'practice'
        });
    }
    
    if (dayMod === 0) {
        tasks.push({
            title: 'Найди собеседника для практики',
            detail: 'Tandem, HelloTalk, italki, языковые клубы',
            type: 'communication'
        });
    }
    
    // Повторение
    if (day > 1) {
        tasks.push({
            title: 'Повтори вчерашние слова (карточки)',
            detail: 'Если помнишь меньше 80% — учи заново',
            type: 'learning',
            checkable: true,
            verification: 'review_test'
        });
    }
    
    // Если слабое место — практика, добавляем
    if (needsMorePractice) {
        tasks.push({
            title: 'Напиши 5 предложений с новыми словами',
            detail: 'Используй слова из сегодняшнего урока',
            type: 'practice'
        });
    }
    
    // Если улучшается — усложняем
    if (behavior.recentTrend === 'improving' && day > 7) {
        tasks.push({
            title: `Изучи 3 новые грамматические конструкции`,
            detail: 'Времена, условные предложения, артикли',
            type: 'learning'
        });
    }
    
    return tasks.slice(0, 5);
}

/**
 * Генерация задач для дисциплины
 */
function generateDisciplineTasks(goal, behavior) {
    const tasks = [];
    const problems = goal.profile?.main_problem || ['procrastination'];
    const wakeTime = goal.profile?.current_wake_time || '8';
    const commitment = goal.profile?.commitment || 'medium';
    const day = goal.currentDay;
    const lastReport = behavior.lastReportData || {};
    
    // Анализируем вчерашний отчёт
    const yesterdayWakeTime = lastReport.wake_time;
    const yesterdayPhoneHours = lastReport.phone_hours || 5;
    const didMainTask = lastReport.main_task;
    
    // Режим сна/подъёма
    if (problems.includes('wake_up') || problems.includes('routine')) {
        let targetWake = parseInt(wakeTime) - Math.floor(day / 7); // Каждую неделю на час раньше
        targetWake = Math.max(5, targetWake);
        
        tasks.push({
            title: `Встань в ${targetWake}:00`,
            detail: 'Будильник на другой конец комнаты. Правило 5 секунд: 5-4-3-2-1 — встал!',
            type: 'routine',
            tip: getDisciplineTip('morning_routines')
        });
        
        const bedTime = targetWake + 16; // 8 часов сна
        tasks.push({
            title: `Ложись спать до ${bedTime > 24 ? bedTime - 24 : bedTime}:00`,
            detail: 'За час до сна — никаких экранов',
            type: 'routine'
        });
    }
    
    // Борьба с телефоном
    if (problems.includes('phone')) {
        const targetPhoneHours = Math.max(1, yesterdayPhoneHours - 0.5);
        
        tasks.push({
            title: `Телефон максимум ${targetPhoneHours.toFixed(1)} часа сегодня`,
            detail: 'Установи Screen Time лимит. Удали отвлекающие приложения',
            type: 'focus',
            tip: getDisciplineTip('phone_detox')
        });
        
        tasks.push({
            title: 'Первый час после пробуждения без телефона',
            detail: 'Оставь телефон в другой комнате',
            type: 'focus'
        });
    }
    
    // Прокрастинация
    if (problems.includes('procrastination')) {
        tasks.push({
            title: 'Сделай самую сложную задачу до 12:00',
            detail: 'Eat the Frog: начни с того, что откладываешь',
            type: 'focus',
            tip: getDisciplineTip('focus_techniques')
        });
        
        if (day % 2 === 0) {
            tasks.push({
                title: 'Работай 3 pomodoro подряд (25+5 мин)',
                detail: 'Таймер, полная концентрация, никаких отвлечений',
                type: 'focus'
            });
        } else {
            tasks.push({
                title: 'Сделай 5 задач по правилу 2 минут',
                detail: 'Всё, что занимает меньше 2 минут — делай сразу',
                type: 'focus'
            });
        }
    }
    
    // Фокус/концентрация
    if (problems.includes('focus')) {
        tasks.push({
            title: 'Блок глубокой работы: 90 минут без перерыва',
            detail: 'Выключи уведомления. Телефон в режиме самолёта.',
            type: 'focus',
            tip: getDisciplineTip('focus_techniques')
        });
    }
    
    // Если не справляется — упрощаем
    if (behavior.avgCompletion < 0.5 && tasks.length > 3) {
        tasks.length = 3;
        tasks.push({
            title: 'Запиши 3 главные цели на сегодня',
            detail: 'Что точно нужно сделать? Напиши на бумаге',
            type: 'routine'
        });
    }
    
    // Вечернее подведение итогов
    tasks.push({
        title: 'Вечером: 5 минут рефлексии',
        detail: 'Что получилось? Что помешало? Что завтра сделаю по-другому?',
        type: 'routine'
    });
    
    return tasks.slice(0, 5);
}

/**
 * Генерация задач для финансовых целей
 */
function generateFinancialTasks(goal, behavior) {
    const tasks = [];
    const skills = goal.profile?.skills || ['other'];
    const timeAvailable = goal.profile?.time_available || 4;
    const day = goal.currentDay;
    const lastReport = behavior.lastReportData || {};
    
    const yesterdayClients = lastReport.clients_contacted || 0;
    const yesterdayResponses = lastReport.responses || 0;
    const conversionRate = yesterdayClients > 0 ? yesterdayResponses / yesterdayClients : 0;
    
    // Базовое количество контактов
    let baseContacts = Math.max(10, yesterdayClients);
    if (behavior.avgCompletion > 0.8) baseContacts = Math.round(baseContacts * 1.2);
    if (conversionRate < 0.1 && day > 7) baseContacts = Math.round(baseContacts * 1.3); // Мало ответов — больше контактов
    
    // Основная задача — контакты
    tasks.push({
        title: `Напиши ${baseContacts} потенциальным клиентам`,
        detail: 'Персонализированные сообщения. Покажи что понимаешь их проблему',
        type: 'sales',
        tip: getBusinessTip('freelance_tips')
    });
    
    // Разнообразие по дням
    const dayMod = day % 5;
    
    if (dayMod === 1) {
        tasks.push({
            title: 'Обнови портфолио: добавь новый кейс',
            detail: 'Опиши проблему, решение, результат. С картинками.',
            type: 'marketing'
        });
    }
    
    if (dayMod === 2) {
        tasks.push({
            title: `Подними цену на ${10 + Math.floor(day / 7) * 5}%`,
            detail: 'На одной площадке или для новых клиентов',
            type: 'sales',
            tip: getBusinessTip('negotiation_tips')
        });
    }
    
    if (dayMod === 3) {
        tasks.push({
            title: 'Найди 3 новых канала привлечения клиентов',
            detail: 'Группы, чаты, форумы, сообщества где есть твоя ЦА',
            type: 'marketing'
        });
    }
    
    if (dayMod === 4) {
        tasks.push({
            title: 'Попроси отзыв у последнего клиента',
            detail: 'Напиши лично, объясни что это поможет тебе расти',
            type: 'communication'
        });
    }
    
    if (dayMod === 0) {
        tasks.push({
            title: 'Проанализируй конкурентов: укради 3 идеи',
            detail: 'Что они делают лучше? Как можешь применить?',
            type: 'learning'
        });
    }
    
    // Follow-up
    if (yesterdayClients > 0 && day > 1) {
        tasks.push({
            title: `Напиши follow-up ${Math.round(yesterdayClients * 0.5)} людям`,
            detail: 'Тем, кто не ответил 2-3 дня назад',
            type: 'sales'
        });
    }
    
    // Если плохо идёт — больше действий
    if (behavior.avgCompletion < 0.6) {
        tasks.push({
            title: 'Отправь 5 откликов на биржах фриланса',
            detail: 'FL.ru, Kwork, Freelance.ru — не выбирай, действуй',
            type: 'sales'
        });
    }
    
    return tasks.slice(0, 5);
}

/**
 * Генерация задач для карьеры
 */
function generateCareerTasks(goal, behavior) {
    const tasks = [];
    const day = goal.currentDay;
    const lastReport = behavior.lastReportData || {};
    
    const yesterdayApps = lastReport.applications_sent || 0;
    let todayApps = Math.max(15, yesterdayApps);
    if (behavior.avgCompletion > 0.8) todayApps = Math.round(todayApps * 1.2);
    
    tasks.push({
        title: `Откликнись на ${todayApps} вакансий`,
        detail: 'HH, LinkedIn, Habr Career. Без долгих раздумий.',
        type: 'sales'
    });
    
    if (day % 3 === 1) {
        tasks.push({
            title: 'Напиши напрямую 5 HR/рекрутерам',
            detail: 'LinkedIn InMail или email. Короткое представление.',
            type: 'communication'
        });
    }
    
    if (day % 3 === 2) {
        tasks.push({
            title: 'Пройди mock-интервью (с другом или записью)',
            detail: 'Отвечай вслух на типичные вопросы. Смотри на себя.',
            type: 'practice'
        });
    }
    
    if (day % 3 === 0) {
        tasks.push({
            title: 'Изучи 3 компании-мечты',
            detail: 'Продукт, культура, отзывы. Подготовь почему хочешь туда.',
            type: 'learning'
        });
    }
    
    tasks.push({
        title: 'Обнови резюме или профиль',
        detail: 'Добавь 1 достижение или улучши формулировку',
        type: 'marketing'
    });
    
    return tasks.slice(0, 5);
}

/**
 * Генерация задач для здоровья
 */
function generateHealthTasks(goal, behavior) {
    const tasks = [];
    const healthGoal = goal.profile?.health_goal || 'lose_weight';
    const sportNow = goal.profile?.sport_now || 'never';
    const timeAvailable = goal.profile?.time_available || 30;
    const day = goal.currentDay;
    const lastReport = behavior.lastReportData || {};
    
    // Базовая тренировка
    let workoutDuration = timeAvailable;
    if (sportNow === 'never') workoutDuration = Math.min(20, timeAvailable);
    if (behavior.avgCompletion > 0.8 && day > 7) workoutDuration = Math.round(workoutDuration * 1.2);
    
    tasks.push({
        title: `Тренировка ${workoutDuration} минут`,
        detail: day % 2 === 1 ? 'Кардио: бег, прыжки, велосипед' : 'Силовая: отжимания, приседания, планка',
        type: 'physical'
    });
    
    // Шаги
    const baseSteps = sportNow === 'never' ? 5000 : 8000;
    const todaySteps = baseSteps + (day - 1) * 500;
    
    tasks.push({
        title: `Пройди ${Math.min(todaySteps, 15000)} шагов`,
        detail: 'Используй шагомер в телефоне или часах',
        type: 'physical'
    });
    
    // Питание
    if (healthGoal === 'lose_weight') {
        tasks.push({
            title: 'Откажись от сладкого и мучного сегодня',
            detail: 'Вместо конфет — фрукты. Вместо хлеба — овощи.',
            type: 'routine'
        });
    }
    
    if (healthGoal === 'gain_muscle') {
        tasks.push({
            title: 'Съешь 3 порции белка (мясо, яйца, творог)',
            detail: 'Минимум 1.5г белка на кг веса',
            type: 'routine'
        });
    }
    
    // Вода
    tasks.push({
        title: 'Выпей 8 стаканов воды',
        detail: 'Ставь напоминания каждые 2 часа',
        type: 'routine'
    });
    
    // Сон
    tasks.push({
        title: 'Ложись до 23:00',
        detail: 'За час до сна — без телефона и экранов',
        type: 'routine'
    });
    
    return tasks.slice(0, 5);
}

/**
 * Главная функция генерации задач
 */
function generateSmartTasks(goal) {
    const behavior = analyzeUserBehavior(goal);
    const type = goal.type;
    
    let tasks;
    
    switch (type) {
        case 'language':
            tasks = generateLanguageTasks(goal, behavior);
            break;
        case 'discipline':
            tasks = generateDisciplineTasks(goal, behavior);
            break;
        case 'financial':
            tasks = generateFinancialTasks(goal, behavior);
            break;
        case 'career':
            tasks = generateCareerTasks(goal, behavior);
            break;
        case 'health':
            tasks = generateHealthTasks(goal, behavior);
            break;
        case 'skill':
            tasks = generateSkillTasks(goal, behavior);
            break;
        case 'project':
            tasks = generateProjectTasks(goal, behavior);
            break;
        default:
            tasks = generateDefaultTasks(goal, behavior);
    }
    
    // Добавляем проверку если есть
    return tasks.map((task, idx) => ({
        ...task,
        id: `${goal.currentDay}-${idx}`,
        completed: false
    }));
}

/**
 * Генерация для навыков
 */
function generateSkillTasks(goal, behavior) {
    const tasks = [];
    const skillName = goal.profile?.skill_name || 'навык';
    const level = goal.profile?.current_level || 'zero';
    const timeAvailable = goal.profile?.time_available || 2;
    const day = goal.currentDay;
    
    const studyTime = Math.round(timeAvailable * 30);
    const practiceTime = Math.round(timeAvailable * 20);
    
    tasks.push({
        title: `Изучай ${skillName}: ${studyTime} минут теории`,
        detail: 'Курс, книга, туториал. Делай заметки.',
        type: 'learning'
    });
    
    tasks.push({
        title: `Практикуй ${skillName}: ${practiceTime} минут`,
        detail: 'Делай, а не смотри. Ошибки — часть процесса.',
        type: 'practice'
    });
    
    if (day % 3 === 0) {
        tasks.push({
            title: 'Сделай мини-проект',
            detail: 'Что можешь создать с текущими знаниями?',
            type: 'practice'
        });
    }
    
    if (day % 5 === 0) {
        tasks.push({
            title: 'Найди ментора или сообщество',
            detail: 'Telegram, Discord, Reddit — найди единомышленников',
            type: 'communication'
        });
    }
    
    tasks.push({
        title: 'Запиши 3 вещи, которые узнал сегодня',
        detail: 'Письменная фиксация улучшает запоминание',
        type: 'learning'
    });
    
    return tasks.slice(0, 5);
}

/**
 * Генерация для проекта
 */
function generateProjectTasks(goal, behavior) {
    const tasks = [];
    const projectName = goal.profile?.project_name || 'проект';
    const stage = goal.profile?.project_stage || 'idea';
    const day = goal.currentDay;
    const lastReport = behavior.lastReportData || {};
    
    const lastProgress = lastReport.progress || 0;
    
    if (stage === 'idea') {
        tasks.push({ title: 'Опиши MVP: 3 ключевые функции', detail: 'Минимум для запуска', type: 'planning' });
        tasks.push({ title: 'Найди 5 потенциальных пользователей', detail: 'Поговори с ними, узнай нужен ли продукт', type: 'communication' });
    } else {
        tasks.push({
            title: `Работай над "${projectName}" минимум 2 часа`,
            detail: 'Конкретные задачи. Не планирование — действия.',
            type: 'work'
        });
    }
    
    tasks.push({
        title: 'Заверши 1 конкретную функцию/часть',
        detail: 'Что можно закончить сегодня?',
        type: 'work'
    });
    
    if (day % 3 === 0) {
        tasks.push({
            title: 'Покажи прогресс 1 человеку',
            detail: 'Получи обратную связь. Критика полезна.',
            type: 'communication'
        });
    }
    
    tasks.push({
        title: `Обнови % готовности (сейчас ~${lastProgress}%)`,
        detail: 'Честная оценка. Сколько осталось?',
        type: 'planning'
    });
    
    return tasks.slice(0, 5);
}

/**
 * Задачи по умолчанию
 */
function generateDefaultTasks(goal, behavior) {
    return [
        { title: 'Определи 3 конкретных шага к цели', detail: 'Запиши на бумаге', type: 'planning' },
        { title: 'Сделай первый шаг прямо сейчас', detail: '5 минут действия лучше часа планирования', type: 'action' },
        { title: 'Расскажи о цели 1 человеку', detail: 'Публичное обязательство мотивирует', type: 'communication' },
        { title: 'Выдели 30 минут на работу над целью', detail: 'Таймер, без отвлечений', type: 'action' }
    ];
}

// Экспорт
window.generateSmartTasks = generateSmartTasks;
window.analyzeUserBehavior = analyzeUserBehavior;
