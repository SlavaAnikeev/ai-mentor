/**
 * DISCIPLINE - Goals Module (Updated)
 * Полностью индивидуальная система целей с динамическими задачами
 */

// Типы целей с индивидуальными вопросами
const GOAL_TYPES = {
    financial: {
        id: 'financial',
        name: 'Финансовая цель',
        icon: '💰',
        description: 'Заработок, доход, деньги',
        questions: [
            {
                id: 'current_income',
                question: 'Сколько ты зарабатываешь сейчас?',
                type: 'options',
                options: [
                    { value: 0, label: 'Ничего / безработный' },
                    { value: 30000, label: 'До 30 000 ₽' },
                    { value: 60000, label: '30 000 - 60 000 ₽' },
                    { value: 100000, label: '60 000 - 100 000 ₽' },
                    { value: 150000, label: 'Больше 100 000 ₽' }
                ]
            },
            {
                id: 'skills',
                question: 'Какие навыки у тебя есть?',
                type: 'options',
                multiple: true,
                options: [
                    { value: 'design', label: 'Дизайн' },
                    { value: 'development', label: 'Программирование' },
                    { value: 'writing', label: 'Тексты / копирайтинг' },
                    { value: 'marketing', label: 'Маркетинг / SMM' },
                    { value: 'sales', label: 'Продажи' },
                    { value: 'other', label: 'Другое / нет явных' }
                ]
            },
            {
                id: 'time_available',
                question: 'Сколько часов в день готов работать?',
                type: 'options',
                options: [
                    { value: 2, label: '1-2 часа' },
                    { value: 4, label: '3-4 часа' },
                    { value: 6, label: '5-6 часов' },
                    { value: 8, label: '8+ часов' }
                ]
            }
        ],
        reportQuestions: [
            { id: 'money_earned', label: 'Сколько заработал сегодня (₽)?', type: 'number', placeholder: '0' },
            { id: 'clients_contacted', label: 'Скольким клиентам написал/позвонил?', type: 'number', placeholder: '0' },
            { id: 'responses', label: 'Сколько получил ответов?', type: 'number', placeholder: '0' }
        ]
    },
    
    career: {
        id: 'career',
        name: 'Карьера',
        icon: '💼',
        description: 'Работа, должность',
        questions: [
            {
                id: 'target_position',
                question: 'Какую должность/работу ищешь?',
                type: 'text',
                placeholder: 'Например: Frontend Developer, Менеджер...'
            },
            {
                id: 'experience_years',
                question: 'Сколько лет опыта?',
                type: 'options',
                options: [
                    { value: 0, label: 'Нет опыта' },
                    { value: 1, label: 'Меньше года' },
                    { value: 3, label: '1-3 года' },
                    { value: 5, label: 'Больше 3 лет' }
                ]
            },
            {
                id: 'time_available',
                question: 'Сколько часов в день на поиск?',
                type: 'options',
                options: [
                    { value: 1, label: '1-2 часа' },
                    { value: 3, label: '3-4 часа' },
                    { value: 6, label: '5+ часов' }
                ]
            }
        ],
        reportQuestions: [
            { id: 'applications_sent', label: 'Сколько откликов отправил?', type: 'number', placeholder: '0' },
            { id: 'interviews', label: 'Сколько собеседований?', type: 'number', placeholder: '0' },
            { id: 'companies_researched', label: 'Сколько компаний изучил?', type: 'number', placeholder: '0' }
        ]
    },
    
    language: {
        id: 'language',
        name: 'Иностранный язык',
        icon: '🌍',
        description: 'Изучение языка',
        questions: [
            {
                id: 'language_name',
                question: 'Какой язык изучаешь?',
                type: 'text',
                placeholder: 'Английский, немецкий...'
            },
            {
                id: 'current_level',
                question: 'Твой текущий уровень?',
                type: 'options',
                options: [
                    { value: 'zero', label: 'Полный ноль' },
                    { value: 'a1', label: 'Знаю базовые фразы' },
                    { value: 'a2', label: 'Могу объясниться просто' },
                    { value: 'b1', label: 'Понимаю основное' },
                    { value: 'b2', label: 'Свободно общаюсь' }
                ]
            },
            {
                id: 'target_level',
                question: 'Какой уровень нужен?',
                type: 'options',
                options: [
                    { value: 'a2', label: 'A2 - Туристический' },
                    { value: 'b1', label: 'B1 - Базовое общение' },
                    { value: 'b2', label: 'B2 - Рабочий' },
                    { value: 'c1', label: 'C1 - Свободный' }
                ]
            },
            {
                id: 'time_available',
                question: 'Сколько минут в день на учёбу?',
                type: 'options',
                options: [
                    { value: 15, label: '15-30 минут' },
                    { value: 30, label: '30-60 минут' },
                    { value: 60, label: '1-2 часа' }
                ]
            }
        ],
        reportQuestions: [
            { id: 'study_time', label: 'Сколько минут занимался?', type: 'number', placeholder: '0' },
            { id: 'new_words', label: 'Новых слов выучил?', type: 'number', placeholder: '0' },
            { id: 'speaking', label: 'Практиковал речь? (минут)', type: 'number', placeholder: '0' },
            { id: 'content', label: 'Что смотрел/читал на языке?', type: 'text', placeholder: '' }
        ]
    },
    
    skill: {
        id: 'skill',
        name: 'Навык',
        icon: '🎯',
        description: 'Программирование, дизайн и др.',
        questions: [
            {
                id: 'skill_name',
                question: 'Какой навык осваиваешь?',
                type: 'text',
                placeholder: 'Python, Figma, фотография...'
            },
            {
                id: 'current_level',
                question: 'Твой текущий уровень?',
                type: 'options',
                options: [
                    { value: 'zero', label: 'Полный ноль' },
                    { value: 'beginner', label: 'Начинающий' },
                    { value: 'intermediate', label: 'Средний' },
                    { value: 'advanced', label: 'Продвинутый' }
                ]
            },
            {
                id: 'time_available',
                question: 'Сколько часов в день на обучение?',
                type: 'options',
                options: [
                    { value: 1, label: '1 час' },
                    { value: 2, label: '2 часа' },
                    { value: 3, label: '3+ часа' }
                ]
            }
        ],
        reportQuestions: [
            { id: 'study_time', label: 'Сколько минут учился?', type: 'number', placeholder: '0' },
            { id: 'practice_time', label: 'Сколько минут практиковался?', type: 'number', placeholder: '0' },
            { id: 'completed', label: 'Что конкретно изучил/сделал?', type: 'text', placeholder: '' }
        ]
    },
    
    project: {
        id: 'project',
        name: 'Проект',
        icon: '🚀',
        description: 'Создание продукта',
        questions: [
            {
                id: 'project_name',
                question: 'Что создаёшь?',
                type: 'text',
                placeholder: 'Приложение, сайт, книга...'
            },
            {
                id: 'project_stage',
                question: 'На какой стадии?',
                type: 'options',
                options: [
                    { value: 'idea', label: 'Только идея' },
                    { value: 'started', label: 'Начал делать' },
                    { value: 'halfway', label: 'На полпути' },
                    { value: 'finishing', label: 'Почти готов' }
                ]
            },
            {
                id: 'time_available',
                question: 'Сколько часов в день?',
                type: 'options',
                options: [
                    { value: 1, label: '1-2 часа' },
                    { value: 3, label: '3-4 часа' },
                    { value: 6, label: '5+ часов' }
                ]
            }
        ],
        reportQuestions: [
            { id: 'hours_worked', label: 'Часов работал?', type: 'number', placeholder: '0' },
            { id: 'tasks_done', label: 'Что сделал?', type: 'text', placeholder: '' },
            { id: 'progress', label: '% готовности проекта', type: 'number', placeholder: '0' }
        ]
    },
    
    discipline: {
        id: 'discipline',
        name: 'Дисциплина',
        icon: '⚡',
        description: 'Привычки, режим',
        questions: [
            {
                id: 'main_problem',
                question: 'Что хочешь изменить?',
                type: 'options',
                multiple: true,
                options: [
                    { value: 'wake_up', label: 'Рано вставать' },
                    { value: 'procrastination', label: 'Прокрастинация' },
                    { value: 'phone', label: 'Меньше в телефоне' },
                    { value: 'focus', label: 'Концентрация' },
                    { value: 'routine', label: 'Распорядок дня' }
                ]
            },
            {
                id: 'current_wake_time',
                question: 'Во сколько встаёшь?',
                type: 'options',
                options: [
                    { value: '6', label: 'До 7:00' },
                    { value: '8', label: '7:00 - 9:00' },
                    { value: '10', label: '9:00 - 11:00' },
                    { value: '12', label: 'После 11:00' }
                ]
            },
            {
                id: 'commitment',
                question: 'Насколько готов к изменениям?',
                type: 'options',
                options: [
                    { value: 'soft', label: 'Постепенно' },
                    { value: 'medium', label: 'Готов к дискомфорту' },
                    { value: 'hard', label: 'Полная перезагрузка' }
                ]
            }
        ],
        reportQuestions: [
            { id: 'wake_time', label: 'Во сколько проснулся?', type: 'text', placeholder: '7:00' },
            { id: 'phone_hours', label: 'Часов в телефоне?', type: 'number', placeholder: '0' },
            { id: 'main_task', label: 'Главную задачу сделал?', type: 'boolean' },
            { id: 'distractions', label: 'На что отвлекался?', type: 'text', placeholder: '' }
        ]
    },
    
    health: {
        id: 'health',
        name: 'Здоровье',
        icon: '💪',
        description: 'Спорт, вес, привычки',
        questions: [
            {
                id: 'health_goal',
                question: 'Главная цель?',
                type: 'options',
                options: [
                    { value: 'lose_weight', label: 'Похудеть' },
                    { value: 'gain_muscle', label: 'Набрать мышцы' },
                    { value: 'endurance', label: 'Выносливость' },
                    { value: 'quit_bad', label: 'Бросить вредное' }
                ]
            },
            {
                id: 'sport_now',
                question: 'Занимаешься спортом?',
                type: 'options',
                options: [
                    { value: 'never', label: 'Нет' },
                    { value: 'rarely', label: 'Редко' },
                    { value: 'sometimes', label: '1-2 раза в неделю' },
                    { value: 'regular', label: '3+ раз в неделю' }
                ]
            },
            {
                id: 'time_available',
                question: 'Сколько времени в день?',
                type: 'options',
                options: [
                    { value: 15, label: '15-30 минут' },
                    { value: 30, label: '30-60 минут' },
                    { value: 60, label: '1+ час' }
                ]
            }
        ],
        reportQuestions: [
            { id: 'workout_done', label: 'Тренировка была?', type: 'boolean' },
            { id: 'duration', label: 'Длительность (мин)?', type: 'number', placeholder: '0' },
            { id: 'diet_followed', label: 'Питание соблюдал?', type: 'boolean' },
            { id: 'weight', label: 'Вес (если взвешивался)', type: 'number', placeholder: '' }
        ]
    }
};

/**
 * Парсинг текстового описания цели
 */
function parseGoalText(text) {
    const lowerText = text.toLowerCase();
    let goalType = 'discipline';
    let extractedAmount = null;
    let parsedGoal = {
        originalText: text,
        type: null,
        amount: null,
        keywords: []
    };
    
    const moneyMatch = text.match(/(\d[\d\s]*)/g);
    if (moneyMatch) {
        const cleanNumber = moneyMatch[0].replace(/\s/g, '');
        extractedAmount = parseInt(cleanNumber);
        if (extractedAmount > 0) {
            parsedGoal.amount = extractedAmount;
        }
    }
    
    const keywords = {
        financial: ['зарабатывать', 'заработать', 'доход', 'деньги', 'зарплата', 'рублей', '₽', 'денег'],
        career: ['работа', 'работу', 'должность', 'устроиться', 'найти работу', 'вакансия'],
        language: ['английский', 'немецкий', 'французский', 'язык', 'языка', 'english', 'иностранный'],
        skill: ['научиться', 'выучить', 'изучить', 'освоить', 'программирование', 'python', 'дизайн'],
        project: ['запустить', 'создать', 'проект', 'приложение', 'сайт', 'бизнес'],
        discipline: ['дисциплин', 'режим', 'привычк', 'вставать', 'прокрастин', 'продуктивн', 'собранн'],
        health: ['похудеть', 'спорт', 'бегать', 'тренировки', 'здоровье', 'вес', 'качать']
    };
    
    let maxScore = 0;
    
    for (const [type, words] of Object.entries(keywords)) {
        let score = 0;
        const foundKeywords = [];
        
        words.forEach(word => {
            if (lowerText.includes(word)) {
                score++;
                foundKeywords.push(word);
            }
        });
        
        if (score > maxScore) {
            maxScore = score;
            goalType = type;
            parsedGoal.keywords = foundKeywords;
        }
    }
    
    parsedGoal.type = goalType;
    
    if (extractedAmount && (goalType === 'financial' || goalType === 'career')) {
        parsedGoal.type = 'financial';
    }
    
    return parsedGoal;
}

/**
 * Создание цели
 */
function createGoal(text, odUserId) {
    const parsed = parseGoalText(text);
    
    return {
        id: Date.now().toString(),
        odUserId: odUserId,
        text: text,
        type: parsed.type,
        amount: parsed.amount,
        keywords: parsed.keywords,
        status: 'active',
        createdAt: new Date().toISOString(),
        currentDay: 1,
        strategy: null,
        profile: {},
        history: [],
        currentTasks: [],
        progressData: {},
        taskSeed: Math.floor(Math.random() * 1000)
    };
}

/**
 * Получение вопросов для типа цели
 */
function getQuestionsForGoalType(goalType) {
    const typeInfo = GOAL_TYPES[goalType];
    return typeInfo?.questions || [];
}

/**
 * Получение вопросов для отчёта
 */
function getReportQuestionsForGoal(goal) {
    const typeInfo = GOAL_TYPES[goal.type];
    return typeInfo?.reportQuestions || [
        { id: 'general', label: 'Что сделал сегодня?', type: 'text', placeholder: '' }
    ];
}

/**
 * Расчёт близости к цели
 */
function calculateGoalProgress(goal) {
    const history = goal.history || [];
    if (history.length === 0) return { percent: 0, status: 'начало' };
    
    const type = goal.type;
    let progress = 0;
    
    switch (type) {
        case 'financial':
            const totalEarned = history.reduce((sum, h) => sum + (h.reportData?.money_earned || 0), 0);
            const targetMonthly = goal.amount || 100000;
            progress = Math.min(100, Math.round((totalEarned / targetMonthly) * 100));
            break;
            
        case 'language':
            const totalWords = history.reduce((sum, h) => sum + (h.reportData?.new_words || 0), 0);
            const totalStudyTime = history.reduce((sum, h) => sum + (h.reportData?.study_time || 0), 0);
            // ~3000 слов для B1, ~5000 для B2
            const targetWords = goal.profile?.target_level === 'b2' ? 5000 : 3000;
            progress = Math.min(100, Math.round((totalWords / targetWords) * 100));
            break;
            
        case 'skill':
            const totalPractice = history.reduce((sum, h) => sum + (h.reportData?.practice_time || 0), 0);
            // ~100 часов для базового освоения
            progress = Math.min(100, Math.round((totalPractice / 6000) * 100));
            break;
            
        case 'career':
            const interviews = history.reduce((sum, h) => sum + (h.reportData?.interviews || 0), 0);
            progress = Math.min(100, interviews * 20); // 5 собеседований = 100%
            break;
            
        case 'project':
            const lastReport = history[history.length - 1];
            progress = lastReport?.reportData?.progress || 0;
            break;
            
        case 'discipline':
            const goodDays = history.filter(h => h.completedTasks >= h.totalTasks * 0.8).length;
            progress = Math.min(100, Math.round((goodDays / 21) * 100)); // 21 день = привычка
            break;
            
        case 'health':
            const workoutDays = history.filter(h => h.reportData?.workout_done).length;
            progress = Math.min(100, Math.round((workoutDays / 30) * 100));
            break;
            
        default:
            const completionRate = calculateGoalCompletionRate(goal);
            progress = Math.round(completionRate * 100);
    }
    
    let status = 'начало';
    if (progress >= 80) status = 'почти у цели';
    else if (progress >= 50) status = 'на полпути';
    else if (progress >= 20) status = 'в процессе';
    
    return { percent: progress, status };
}

/**
 * Расчёт процента выполнения задач
 */
function calculateGoalCompletionRate(goal) {
    if (!goal.history || goal.history.length === 0) return 0;
    
    let totalTasks = 0;
    let completedTasks = 0;
    
    goal.history.forEach(day => {
        totalTasks += day.totalTasks || 0;
        completedTasks += day.completedTasks || 0;
    });
    
    return totalTasks > 0 ? completedTasks / totalTasks : 0;
}

// Экспорт
window.GOAL_TYPES = GOAL_TYPES;
window.parseGoalText = parseGoalText;
window.createGoal = createGoal;
window.getQuestionsForGoalType = getQuestionsForGoalType;
window.getReportQuestionsForGoal = getReportQuestionsForGoal;
window.calculateGoalProgress = calculateGoalProgress;
window.calculateGoalCompletionRate = calculateGoalCompletionRate;
