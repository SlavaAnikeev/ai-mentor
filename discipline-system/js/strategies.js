/**
 * DISCIPLINE - Dynamic Strategies Module
 * Генерация индивидуальных задач в зависимости от типа цели, дня и прогресса
 */

/**
 * Банк задач для каждого типа цели
 */
const TASK_BANKS = {
    financial: {
        start: [
            { base: 'Зарегистрируйся на {count} фриланс-биржах', counts: [2, 3, 4], detail: 'FL.ru, Kwork, Upwork, Freelance.ru' },
            { base: 'Создай {count} примеров работ для портфолио', counts: [2, 3, 5], detail: 'Реальные или демо-проекты' },
            { base: 'Отправь {count} откликов на заказы', counts: [5, 10, 15], detail: 'Персонализированные, не шаблонные' },
            { base: 'Напиши {count} потенциальным клиентам напрямую', counts: [3, 5, 10], detail: 'Холодные сообщения с предложением' },
            { base: 'Обнови резюме и профили на {count} площадках', counts: [2, 3, 4], detail: 'Добавь достижения и примеры' },
            { base: 'Найди {count} групп/чатов где есть твои клиенты', counts: [3, 5, 7], detail: 'Telegram, VK, Facebook' },
            { base: 'Определи {count} услуги которые можешь продавать', counts: [2, 3, 5], detail: 'Конкретные, с ценой' }
        ],
        active: [
            { base: 'Отправь {count} новых откликов сегодня', counts: [10, 15, 20], detail: 'Больше откликов = больше шансов' },
            { base: 'Напиши {count} follow-up клиентам без ответа', counts: [5, 7, 10], detail: 'Напомни о себе через 2-3 дня' },
            { base: 'Подними цену на {count}% в одном предложении', counts: [10, 15, 20], detail: 'Тестируй рынок' },
            { base: 'Попроси отзыв у {count} клиентов', counts: [1, 2, 3], detail: 'Социальное доказательство' },
            { base: 'Сделай {count} холодных звонков', counts: [3, 5, 10], detail: 'Телефон конвертирует лучше' },
            { base: 'Добавь {count} новых работ в портфолио', counts: [1, 2, 3], detail: 'Свежие кейсы' }
        ],
        growth: [
            { base: 'Отправь {count} предложений на крупные проекты', counts: [5, 10, 15], detail: 'Выше чек = меньше работы' },
            { base: 'Делегируй {count} мелких задач', counts: [1, 2, 3], detail: 'Освободи время для важного' },
            { base: 'Откажись от {count} невыгодных клиентов', counts: [1, 2], detail: 'Фокус на прибыльных' },
            { base: 'Подними цену ещё на {count}%', counts: [15, 20, 30], detail: 'Ты уже имеешь репутацию' },
            { base: 'Запусти рекламу с бюджетом {count} рублей', counts: [500, 1000, 2000], detail: 'Инвестируй в рост' }
        ]
    },
    
    career: {
        start: [
            { base: 'Обнови резюме на {count} площадках', counts: [2, 3, 4], detail: 'HH, LinkedIn, Habr Career' },
            { base: 'Откликнись на {count} вакансий', counts: [10, 15, 20], detail: 'Не выбирай долго, действуй' },
            { base: 'Напиши {count} HR напрямую в LinkedIn', counts: [3, 5, 10], detail: 'Холодные сообщения работают' },
            { base: 'Подготовь ответы на {count} типичных вопросов', counts: [5, 10, 15], detail: 'Отрепетируй вслух' },
            { base: 'Изучи {count} компаний-целей', counts: [3, 5, 7], detail: 'Продукт, культура, зарплаты' }
        ],
        active: [
            { base: 'Откликнись на {count} новых вакансий', counts: [15, 20, 25], detail: 'Каждый день новые отклики' },
            { base: 'Пройди {count} тестовых собеседований', counts: [1, 2], detail: 'С другом или записывай себя' },
            { base: 'Напиши {count} рекрутерам напрямую', counts: [5, 7, 10], detail: 'Они знают скрытые вакансии' },
            { base: 'Попроси {count} знакомых о рекомендации', counts: [2, 3, 5], detail: 'Реферралы проходят чаще' },
            { base: 'Расширь поиск на {count} новых городов/удалёнку', counts: [2, 3, 5], detail: 'Больше вариантов' }
        ],
        growth: [
            { base: 'Торгуйся за зарплату +{count}% к предложению', counts: [10, 15, 20], detail: 'Не соглашайся сразу' },
            { base: 'Получи {count} оффера для сравнения', counts: [2, 3], detail: 'Конкуренция = лучше условия' },
            { base: 'Обсуди {count} дополнительных условий', counts: [2, 3, 5], detail: 'Бонусы, удалёнка, рост' }
        ]
    },
    
    language: {
        start: [
            { base: 'Выучи {count} новых слов', counts: [10, 15, 20], detail: 'С примерами использования' },
            { base: 'Пройди {count} уроков в приложении', counts: [2, 3, 5], detail: 'Duolingo, Lingualeo, и др.' },
            { base: 'Посмотри {count} минут видео на языке', counts: [10, 15, 20], detail: 'С субтитрами' },
            { base: 'Прочитай {count} страниц текста', counts: [2, 3, 5], detail: 'Адаптированная литература' },
            { base: 'Повтори {count} раз вчерашние слова', counts: [2, 3, 5], detail: 'Интервальное повторение' }
        ],
        active: [
            { base: 'Выучи {count} новых слов', counts: [15, 20, 30], detail: 'Увеличивай темп' },
            { base: 'Говори вслух {count} минут', counts: [10, 15, 20], detail: 'Читай вслух или говори с собой' },
            { base: 'Напиши {count} предложений', counts: [5, 10, 15], detail: 'Используй новые слова' },
            { base: 'Послушай {count} минут подкаста', counts: [15, 20, 30], detail: 'Без субтитров' },
            { base: 'Найди {count} собеседника для практики', counts: [1, 2], detail: 'Tandem, HelloTalk, italki' },
            { base: 'Пройди {count} тестов на грамматику', counts: [2, 3, 5], detail: 'Закрепи правила' }
        ],
        growth: [
            { base: 'Проведи {count} минут разговора с носителем', counts: [15, 30, 45], detail: 'Платные уроки или языковые клубы' },
            { base: 'Прочитай {count} статей без словаря', counts: [2, 3, 5], detail: 'Понимание из контекста' },
            { base: 'Напиши {count} постов/отзывов на языке', counts: [1, 2, 3], detail: 'Реальная практика' },
            { base: 'Посмотри {count} видео без субтитров', counts: [1, 2, 3], detail: 'Тренируй понимание на слух' }
        ]
    },
    
    skill: {
        start: [
            { base: 'Пройди {count} уроков/глав', counts: [1, 2, 3], detail: 'Основы и базовые концепции' },
            { base: 'Практикуйся {count} минут', counts: [30, 45, 60], detail: 'Применяй изученное' },
            { base: 'Сделай {count} упражнений', counts: [3, 5, 10], detail: 'Закрепление теории' },
            { base: 'Найди {count} ресурса для обучения', counts: [2, 3, 5], detail: 'Курсы, книги, YouTube' },
            { base: 'Определи {count} мини-проекта для практики', counts: [1, 2, 3], detail: 'Реальные задачи' }
        ],
        active: [
            { base: 'Пройди {count} уроков', counts: [2, 3, 4], detail: 'Двигайся по программе' },
            { base: 'Практикуйся {count} минут над проектом', counts: [45, 60, 90], detail: 'Реальный проект важнее теории' },
            { base: 'Реши {count} практических задач', counts: [3, 5, 10], detail: 'Codewars, задачники' },
            { base: 'Посмотри {count} туториалов', counts: [1, 2, 3], detail: 'Новые техники' },
            { base: 'Попроси фидбек у {count} человек', counts: [1, 2], detail: 'На свою работу' }
        ],
        growth: [
            { base: 'Работай над проектом {count} часов', counts: [2, 3, 4], detail: 'Глубокое погружение' },
            { base: 'Найди {count} способа применить навык для заработка', counts: [1, 2, 3], detail: 'Фриланс, работа' },
            { base: 'Научи {count} человек базовым вещам', counts: [1, 2], detail: 'Обучая — закрепляешь' },
            { base: 'Заверши и опубликуй {count} проект', counts: [1], detail: 'GitHub, портфолио' }
        ]
    },
    
    project: {
        start: [
            { base: 'Определи {count} ключевых функций MVP', counts: [3, 5], detail: 'Минимум для запуска' },
            { base: 'Сделай {count} часов работы над проектом', counts: [1, 2, 3], detail: 'Начни делать' },
            { base: 'Найди {count} потенциальных пользователей', counts: [3, 5, 10], detail: 'Кому это нужно?' },
            { base: 'Покажи концепт {count} людям', counts: [2, 3, 5], detail: 'Получи обратную связь' },
            { base: 'Установи дедлайн: {count} дней до MVP', counts: [7, 14, 21], detail: 'Конкретный срок' }
        ],
        active: [
            { base: 'Работай над проектом {count} часов', counts: [2, 3, 4], detail: 'Продвигайся каждый день' },
            { base: 'Заверши {count} задач из списка', counts: [2, 3, 5], detail: 'Конкретные результаты' },
            { base: 'Протестируй с {count} пользователями', counts: [1, 2, 3], detail: 'Реальный фидбек' },
            { base: 'Исправь {count} главных проблем', counts: [1, 2, 3], detail: 'Что мешает использовать?' }
        ],
        growth: [
            { base: 'Привлеки {count} новых пользователей', counts: [5, 10, 20], detail: 'Активное продвижение' },
            { base: 'Собери {count} отзывов', counts: [3, 5, 10], detail: 'Социальное доказательство' },
            { base: 'Сделай {count} продажу/конверсию', counts: [1, 3, 5], detail: 'Монетизация' },
            { base: 'Запусти рекламу с бюджетом {count}₽', counts: [500, 1000, 2000], detail: 'Масштабирование' }
        ]
    },
    
    discipline: {
        start: [
            { base: 'Встань в {count}:00', counts: [7, 6, 5], detail: 'Будильник на ту сторону комнаты' },
            { base: 'Убери телефон на {count} часов', counts: [1, 2, 3], detail: 'Режим "Не беспокоить"' },
            { base: 'Сделай {count} важных задач до обеда', counts: [1, 2, 3], detail: 'Сначала сложное' },
            { base: 'Ложись спать до {count}:00', counts: [23, 22, 21], detail: 'Режим сна' },
            { base: 'Запиши {count} целей на день', counts: [3, 5], detail: 'Утром, письменно' }
        ],
        active: [
            { base: 'Встань на {count} минут раньше чем вчера', counts: [15, 30], detail: 'Постепенное смещение' },
            { base: 'Работай {count} минут без отвлечений', counts: [25, 45, 60], detail: 'Pomodoro или глубокая работа' },
            { base: 'Ограничь телефон до {count} часов в день', counts: [3, 2, 1], detail: 'Экранное время' },
            { base: 'Сделай {count} перерывов на движение', counts: [3, 5, 7], detail: 'Каждый час вставай' },
            { base: 'Веди дневник {count} минут вечером', counts: [5, 10, 15], detail: 'Рефлексия дня' }
        ],
        growth: [
            { base: 'Проведи день без телефона {count} часов', counts: [4, 6, 8], detail: 'Цифровой детокс' },
            { base: 'Выполни {count} сложных задач подряд', counts: [3, 4, 5], detail: 'Марафон продуктивности' },
            { base: 'Вставай в 5:00 {count} дней подряд', counts: [3, 5, 7], detail: 'Закрепление привычки' },
            { base: 'Помоги {count} людям стать дисциплинированнее', counts: [1, 2], detail: 'Обучая — укрепляешь' }
        ]
    },
    
    health: {
        start: [
            { base: 'Сделай {count} минут тренировки', counts: [10, 15, 20], detail: 'Любая активность' },
            { base: 'Пройди {count} шагов', counts: [5000, 7000, 10000], detail: 'Используй шагомер' },
            { base: 'Выпей {count} стаканов воды', counts: [6, 8, 10], detail: 'Распредели по дню' },
            { base: 'Не ешь сладкое {count} дней', counts: [1, 2, 3], detail: 'Начни с малого' },
            { base: 'Ложись до {count}:00', counts: [23, 22], detail: 'Сон важен для результата' }
        ],
        active: [
            { base: 'Тренировка {count} минут', counts: [20, 30, 45], detail: 'Кардио или силовая' },
            { base: 'Пройди {count} шагов', counts: [8000, 10000, 12000], detail: 'Увеличивай норму' },
            { base: 'Приготовь {count} здоровых блюд', counts: [2, 3], detail: 'Контроль питания' },
            { base: 'Сделай {count} подходов упражнения', counts: [3, 5, 7], detail: 'Отжимания, приседания, планка' },
            { base: 'Откажись от вредного {count} раз', counts: [1, 2, 3], detail: 'Каждый отказ = победа' }
        ],
        growth: [
            { base: 'Тренировка {count} минут', counts: [45, 60, 90], detail: 'Интенсивная сессия' },
            { base: 'Пробеги {count} км', counts: [3, 5, 7], detail: 'Новый рекорд' },
            { base: 'Соблюдай режим питания {count} дней подряд', counts: [5, 7, 14], detail: 'Последовательность' },
            { base: 'Увеличь вес на {count} кг в упражнении', counts: [2, 5], detail: 'Прогрессия нагрузки' }
        ]
    }
};

/**
 * Определение фазы на основе дня и прогресса
 */
function determinePhase(day, completionRate, goal) {
    // Если пользователь плохо выполняет — держим в начальной фазе
    if (completionRate < 0.4 && day < 14) return 'start';
    
    if (day <= 7) return 'start';
    if (day <= 21) return 'active';
    return 'growth';
}

/**
 * Генерация динамических задач
 */
function generateTasksForGoal(goal) {
    const type = goal.type;
    const day = goal.currentDay;
    const history = goal.history || [];
    const completionRate = calculateGoalCompletionRate(goal);
    
    // Определяем фазу
    const phase = determinePhase(day, completionRate, goal);
    
    // Получаем банк задач
    const taskBank = TASK_BANKS[type];
    if (!taskBank || !taskBank[phase]) {
        return getDefaultTasks(goal);
    }
    
    const phaseTasks = taskBank[phase];
    
    // Используем seed + day для вариативности, но повторяемости
    const seed = (goal.taskSeed || 0) + day;
    
    // Выбираем 4-5 задач
    const numTasks = Math.min(5, phaseTasks.length);
    const selectedTasks = [];
    const usedIndices = new Set();
    
    // Выбираем задачи с учётом предыдущих дней
    for (let i = 0; i < numTasks; i++) {
        let index = (seed + i * 7) % phaseTasks.length;
        
        // Избегаем повторов
        while (usedIndices.has(index)) {
            index = (index + 1) % phaseTasks.length;
        }
        usedIndices.add(index);
        
        const taskTemplate = phaseTasks[index];
        
        // Определяем сложность на основе прогресса
        let countIndex = 0;
        if (completionRate >= 0.8) countIndex = 2;
        else if (completionRate >= 0.5) countIndex = 1;
        
        // Если не выполнял вчера — уменьшаем
        if (history.length > 0) {
            const lastDay = history[history.length - 1];
            if (lastDay.completedTasks === 0) countIndex = 0;
        }
        
        const count = taskTemplate.counts[Math.min(countIndex, taskTemplate.counts.length - 1)];
        const title = taskTemplate.base.replace('{count}', count);
        
        selectedTasks.push({
            title: title,
            detail: taskTemplate.detail
        });
    }
    
    // Если ничего не сделал вчера — повторяем задачи
    if (history.length > 0) {
        const lastDay = history[history.length - 1];
        if (lastDay.completedTasks === 0 && lastDay.tasks) {
            return lastDay.tasks;
        }
    }
    
    return selectedTasks;
}

/**
 * Задачи по умолчанию
 */
function getDefaultTasks(goal) {
    return [
        { title: 'Определи 3 конкретных шага к цели', detail: 'Запиши их' },
        { title: 'Сделай первый шаг прямо сейчас', detail: 'Не планируй — делай' },
        { title: 'Найди 1 человека для поддержки', detail: 'Расскажи о своей цели' },
        { title: 'Выдели 30 минут на работу над целью', detail: 'Таймер, без отвлечений' }
    ];
}

/**
 * Получение стратегии для цели
 */
function getStrategyForGoal(goal, profile) {
    const type = goal.type;
    const typeInfo = GOAL_TYPES[type];
    
    return {
        id: type,
        name: typeInfo?.name || 'Индивидуальная стратегия',
        description: getStrategyDescription(goal, profile),
        path: getStrategyPath(goal, profile)
    };
}

function getStrategyDescription(goal, profile) {
    switch (goal.type) {
        case 'financial':
            return 'Ежедневные действия по привлечению клиентов и увеличению дохода.';
        case 'career':
            return 'Активный поиск работы с ежедневными откликами и нетворкингом.';
        case 'language':
            return 'Ежедневная практика: слова, аудирование, говорение.';
        case 'skill':
            return 'Теория + практика каждый день, работа над реальными проектами.';
        case 'project':
            return 'Ежедневная работа над проектом с конкретными результатами.';
        case 'discipline':
            return 'Формирование привычек через ежедневное повторение действий.';
        case 'health':
            return 'Регулярные тренировки и контроль питания.';
        default:
            return 'Последовательные действия для достижения цели.';
    }
}

function getStrategyPath(goal, profile) {
    switch (goal.type) {
        case 'financial':
            return 'Портфолио → Отклики → Первые клиенты → Отзывы → Рост цен → Стабильный доход';
        case 'career':
            return 'Резюме → Отклики → Собеседования → Офферы → Переговоры → Работа';
        case 'language':
            return 'Основы → Словарный запас → Аудирование → Говорение → Свободное владение';
        case 'skill':
            return 'Основы → Практика → Проекты → Применение → Мастерство';
        case 'project':
            return 'Идея → MVP → Тестирование → Запуск → Рост';
        case 'discipline':
            return '7 дней → 21 день → 66 дней → Привычка на всю жизнь';
        case 'health':
            return 'Начало → Регулярность → Прогресс → Результат → Образ жизни';
        default:
            return 'Начало → Действия → Прогресс → Результат';
    }
}

// Экспорт
window.TASK_BANKS = TASK_BANKS;
window.generateTasksForGoal = generateTasksForGoal;
window.getStrategyForGoal = getStrategyForGoal;
window.determinePhase = determinePhase;
