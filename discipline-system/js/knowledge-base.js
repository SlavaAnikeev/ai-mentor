/**
 * DISCIPLINE - Knowledge Base
 * База знаний для проверок и обучения
 */

// =====================================================
// АНГЛИЙСКИЙ ЯЗЫК - База слов по уровням
// =====================================================
const ENGLISH_WORDS = {
    a1: [
        { en: 'hello', ru: 'привет', category: 'greetings' },
        { en: 'goodbye', ru: 'пока', category: 'greetings' },
        { en: 'yes', ru: 'да', category: 'basic' },
        { en: 'no', ru: 'нет', category: 'basic' },
        { en: 'please', ru: 'пожалуйста', category: 'basic' },
        { en: 'thank you', ru: 'спасибо', category: 'basic' },
        { en: 'sorry', ru: 'извините', category: 'basic' },
        { en: 'water', ru: 'вода', category: 'food' },
        { en: 'food', ru: 'еда', category: 'food' },
        { en: 'house', ru: 'дом', category: 'places' },
        { en: 'car', ru: 'машина', category: 'transport' },
        { en: 'book', ru: 'книга', category: 'objects' },
        { en: 'dog', ru: 'собака', category: 'animals' },
        { en: 'cat', ru: 'кошка', category: 'animals' },
        { en: 'friend', ru: 'друг', category: 'people' },
        { en: 'family', ru: 'семья', category: 'people' },
        { en: 'mother', ru: 'мама', category: 'family' },
        { en: 'father', ru: 'папа', category: 'family' },
        { en: 'child', ru: 'ребёнок', category: 'family' },
        { en: 'work', ru: 'работа', category: 'life' },
        { en: 'school', ru: 'школа', category: 'places' },
        { en: 'money', ru: 'деньги', category: 'life' },
        { en: 'time', ru: 'время', category: 'basic' },
        { en: 'day', ru: 'день', category: 'time' },
        { en: 'night', ru: 'ночь', category: 'time' },
        { en: 'morning', ru: 'утро', category: 'time' },
        { en: 'evening', ru: 'вечер', category: 'time' },
        { en: 'today', ru: 'сегодня', category: 'time' },
        { en: 'tomorrow', ru: 'завтра', category: 'time' },
        { en: 'good', ru: 'хороший', category: 'adjectives' },
        { en: 'bad', ru: 'плохой', category: 'adjectives' },
        { en: 'big', ru: 'большой', category: 'adjectives' },
        { en: 'small', ru: 'маленький', category: 'adjectives' },
        { en: 'new', ru: 'новый', category: 'adjectives' },
        { en: 'old', ru: 'старый', category: 'adjectives' },
        { en: 'go', ru: 'идти', category: 'verbs' },
        { en: 'come', ru: 'приходить', category: 'verbs' },
        { en: 'eat', ru: 'есть', category: 'verbs' },
        { en: 'drink', ru: 'пить', category: 'verbs' },
        { en: 'sleep', ru: 'спать', category: 'verbs' },
        { en: 'work', ru: 'работать', category: 'verbs' },
        { en: 'read', ru: 'читать', category: 'verbs' },
        { en: 'write', ru: 'писать', category: 'verbs' },
        { en: 'speak', ru: 'говорить', category: 'verbs' },
        { en: 'listen', ru: 'слушать', category: 'verbs' },
        { en: 'one', ru: 'один', category: 'numbers' },
        { en: 'two', ru: 'два', category: 'numbers' },
        { en: 'three', ru: 'три', category: 'numbers' },
        { en: 'ten', ru: 'десять', category: 'numbers' }
    ],
    a2: [
        { en: 'appointment', ru: 'встреча', category: 'business' },
        { en: 'meeting', ru: 'собрание', category: 'business' },
        { en: 'decision', ru: 'решение', category: 'business' },
        { en: 'experience', ru: 'опыт', category: 'life' },
        { en: 'opportunity', ru: 'возможность', category: 'life' },
        { en: 'problem', ru: 'проблема', category: 'life' },
        { en: 'solution', ru: 'решение', category: 'life' },
        { en: 'advice', ru: 'совет', category: 'communication' },
        { en: 'agreement', ru: 'соглашение', category: 'business' },
        { en: 'arrange', ru: 'организовать', category: 'verbs' },
        { en: 'achieve', ru: 'достигать', category: 'verbs' },
        { en: 'improve', ru: 'улучшать', category: 'verbs' },
        { en: 'develop', ru: 'развивать', category: 'verbs' },
        { en: 'believe', ru: 'верить', category: 'verbs' },
        { en: 'remember', ru: 'помнить', category: 'verbs' },
        { en: 'forget', ru: 'забывать', category: 'verbs' },
        { en: 'explain', ru: 'объяснять', category: 'verbs' },
        { en: 'understand', ru: 'понимать', category: 'verbs' },
        { en: 'actually', ru: 'на самом деле', category: 'adverbs' },
        { en: 'usually', ru: 'обычно', category: 'adverbs' },
        { en: 'sometimes', ru: 'иногда', category: 'adverbs' },
        { en: 'always', ru: 'всегда', category: 'adverbs' },
        { en: 'never', ru: 'никогда', category: 'adverbs' },
        { en: 'difficult', ru: 'сложный', category: 'adjectives' },
        { en: 'easy', ru: 'лёгкий', category: 'adjectives' },
        { en: 'important', ru: 'важный', category: 'adjectives' },
        { en: 'different', ru: 'разный', category: 'adjectives' },
        { en: 'similar', ru: 'похожий', category: 'adjectives' },
        { en: 'available', ru: 'доступный', category: 'adjectives' },
        { en: 'necessary', ru: 'необходимый', category: 'adjectives' }
    ],
    b1: [
        { en: 'consequently', ru: 'следовательно', category: 'linking' },
        { en: 'furthermore', ru: 'кроме того', category: 'linking' },
        { en: 'nevertheless', ru: 'тем не менее', category: 'linking' },
        { en: 'whereas', ru: 'тогда как', category: 'linking' },
        { en: 'accomplish', ru: 'выполнить', category: 'verbs' },
        { en: 'acknowledge', ru: 'признавать', category: 'verbs' },
        { en: 'acquire', ru: 'приобретать', category: 'verbs' },
        { en: 'anticipate', ru: 'предвидеть', category: 'verbs' },
        { en: 'appreciate', ru: 'ценить', category: 'verbs' },
        { en: 'comprehensive', ru: 'всесторонний', category: 'adjectives' },
        { en: 'considerable', ru: 'значительный', category: 'adjectives' },
        { en: 'efficient', ru: 'эффективный', category: 'adjectives' },
        { en: 'relevant', ru: 'уместный', category: 'adjectives' },
        { en: 'significant', ru: 'существенный', category: 'adjectives' },
        { en: 'challenge', ru: 'вызов', category: 'nouns' },
        { en: 'circumstances', ru: 'обстоятельства', category: 'nouns' },
        { en: 'consequence', ru: 'последствие', category: 'nouns' },
        { en: 'contribution', ru: 'вклад', category: 'nouns' },
        { en: 'evidence', ru: 'доказательство', category: 'nouns' },
        { en: 'influence', ru: 'влияние', category: 'nouns' }
    ],
    b2: [
        { en: 'simultaneously', ru: 'одновременно', category: 'adverbs' },
        { en: 'predominantly', ru: 'преимущественно', category: 'adverbs' },
        { en: 'subsequently', ru: 'впоследствии', category: 'adverbs' },
        { en: 'ambiguous', ru: 'двусмысленный', category: 'adjectives' },
        { en: 'compelling', ru: 'убедительный', category: 'adjectives' },
        { en: 'controversial', ru: 'спорный', category: 'adjectives' },
        { en: 'fundamental', ru: 'основополагающий', category: 'adjectives' },
        { en: 'legitimate', ru: 'законный', category: 'adjectives' },
        { en: 'sophisticated', ru: 'изысканный', category: 'adjectives' },
        { en: 'substantial', ru: 'существенный', category: 'adjectives' },
        { en: 'advocate', ru: 'выступать за', category: 'verbs' },
        { en: 'allocate', ru: 'распределять', category: 'verbs' },
        { en: 'diminish', ru: 'уменьшать', category: 'verbs' },
        { en: 'elaborate', ru: 'разрабатывать', category: 'verbs' },
        { en: 'emphasize', ru: 'подчёркивать', category: 'verbs' },
        { en: 'facilitate', ru: 'способствовать', category: 'verbs' },
        { en: 'implement', ru: 'внедрять', category: 'verbs' },
        { en: 'implication', ru: 'подтекст', category: 'nouns' },
        { en: 'phenomenon', ru: 'явление', category: 'nouns' },
        { en: 'perspective', ru: 'перспектива', category: 'nouns' }
    ]
};

// Фразы для перевода по уровням
const ENGLISH_PHRASES = {
    a1: [
        { en: 'How are you?', ru: 'Как дела?' },
        { en: 'Nice to meet you', ru: 'Приятно познакомиться' },
        { en: 'What is your name?', ru: 'Как тебя зовут?' },
        { en: 'I don\'t understand', ru: 'Я не понимаю' },
        { en: 'Can you help me?', ru: 'Можешь мне помочь?' },
        { en: 'Where is the bathroom?', ru: 'Где туалет?' },
        { en: 'How much does it cost?', ru: 'Сколько это стоит?' },
        { en: 'I would like...', ru: 'Я хотел бы...' },
        { en: 'See you later', ru: 'Увидимся позже' },
        { en: 'Have a nice day', ru: 'Хорошего дня' }
    ],
    a2: [
        { en: 'I\'m looking forward to it', ru: 'Я с нетерпением жду этого' },
        { en: 'It depends on...', ru: 'Это зависит от...' },
        { en: 'In my opinion...', ru: 'По моему мнению...' },
        { en: 'Could you repeat that?', ru: 'Не могли бы вы повторить?' },
        { en: 'I\'m afraid I can\'t', ru: 'Боюсь, я не могу' },
        { en: 'That makes sense', ru: 'Это имеет смысл' },
        { en: 'I completely agree', ru: 'Я полностью согласен' },
        { en: 'On the other hand...', ru: 'С другой стороны...' }
    ],
    b1: [
        { en: 'As far as I know...', ru: 'Насколько мне известно...' },
        { en: 'It goes without saying', ru: 'Само собой разумеется' },
        { en: 'To be honest with you', ru: 'Если честно' },
        { en: 'I\'d rather not...', ru: 'Я бы предпочёл не...' },
        { en: 'It\'s worth mentioning that...', ru: 'Стоит упомянуть, что...' },
        { en: 'From my point of view', ru: 'С моей точки зрения' }
    ],
    b2: [
        { en: 'Be that as it may', ru: 'Как бы то ни было' },
        { en: 'For what it\'s worth', ru: 'К слову сказать' },
        { en: 'To put it another way', ru: 'Иными словами' },
        { en: 'Having said that', ru: 'При всём при этом' },
        { en: 'It stands to reason that', ru: 'Разумно предположить, что' }
    ]
};

// =====================================================
// ДИСЦИПЛИНА - База привычек и техник
// =====================================================
const DISCIPLINE_KNOWLEDGE = {
    morning_routines: [
        { name: 'Правило 5 секунд', desc: 'Когда звонит будильник, считай 5-4-3-2-1 и сразу вставай. Не давай мозгу время на отговорки.' },
        { name: 'Стакан воды', desc: 'Первым делом выпей стакан воды. Это запускает метаболизм и будит организм.' },
        { name: 'Без телефона 1 час', desc: 'Первый час после пробуждения не трогай телефон. Это твоё время.' },
        { name: 'Физическая активность', desc: '10 минут зарядки или растяжки сразу после пробуждения.' },
        { name: 'Холодный душ', desc: '30 секунд холодной воды в конце душа. Развивает волю.' }
    ],
    focus_techniques: [
        { name: 'Pomodoro', desc: '25 минут работы, 5 минут отдыха. После 4 циклов — длинный перерыв 15-30 минут.' },
        { name: 'Deep Work', desc: '90 минут полной концентрации без отвлечений. Телефон в другой комнате.' },
        { name: 'Eat the Frog', desc: 'Начинай день с самой сложной задачи. Остальное покажется лёгким.' },
        { name: '2-minute rule', desc: 'Если задача занимает меньше 2 минут — сделай сразу, не откладывай.' },
        { name: 'Time blocking', desc: 'Планируй день блоками по 30-60 минут на конкретные задачи.' }
    ],
    phone_detox: [
        { name: 'Greyscale режим', desc: 'Переведи экран в чёрно-белый режим. Это снижает привлекательность.' },
        { name: 'Удали соцсети', desc: 'Удали приложения соцсетей. Заходи только через браузер, если очень нужно.' },
        { name: 'Телефон в другой комнате', desc: 'Во время работы и сна телефон должен быть физически недоступен.' },
        { name: 'Уведомления OFF', desc: 'Отключи все уведомления кроме звонков. Проверяй сам, когда нужно.' },
        { name: 'Screen Time лимиты', desc: 'Установи жёсткие лимиты на приложения: 30 минут в день максимум.' }
    ],
    habit_formation: [
        { name: '21/66/90 дней', desc: '21 день — начало привычки, 66 дней — закрепление, 90 дней — автоматизм.' },
        { name: 'Habit stacking', desc: 'Привязывай новую привычку к существующей: "После [старая привычка] я делаю [новая]".' },
        { name: 'Never miss twice', desc: 'Пропустил один день — окей. Но никогда не пропускай два дня подряд.' },
        { name: 'Environment design', desc: 'Измени окружение: убери отвлечения, положи нужное на видное место.' },
        { name: 'Accountability partner', desc: 'Найди партнёра, который будет следить за твоим прогрессом.' }
    ]
};

// =====================================================
// БИЗНЕС/ЗАРАБОТОК - База знаний
// =====================================================
const BUSINESS_KNOWLEDGE = {
    freelance_tips: [
        'Первые заказы делай дешевле ради отзывов. Отзывы важнее денег на старте.',
        'Отвечай на заказы в течение 15 минут. Скорость = конверсия.',
        'Портфолио важнее резюме. Покажи что умеешь, а не расскажи.',
        'Поднимай цены каждые 10 заказов. Ты становишься лучше — бери больше.',
        'Постоянные клиенты — 80% дохода. Заботься о них.',
        'Не работай без предоплаты. Минимум 50% вперёд.',
        'Специализируйся. "Делаю всё" = "Не умею ничего" для клиента.',
        'Холодные письма работают. 100 писем = 5-10 ответов = 1-2 заказа.'
    ],
    negotiation_tips: [
        'Называй цену первым и выше, чем хочешь получить.',
        'Молчи после того, как назвал цену. Кто первый заговорит — проиграл.',
        'Всегда проси больше времени: "Дайте подумать до завтра".',
        'Не снижай цену — добавляй ценность: "За эту же цену добавлю..."',
        'Имей альтернативу. Лучшая позиция в переговорах — возможность уйти.'
    ],
    productivity_tips: [
        'Утро для сложного, вечер для рутины.',
        'Задача без дедлайна — не задача.',
        'Один приоритет в день. Остальное — бонус.',
        'Отказывай чаще. Каждое "да" — это "нет" чему-то другому.',
        'Делегируй всё, что стоит меньше твоего часа.'
    ]
};

// =====================================================
// ФУНКЦИИ ГЕНЕРАЦИИ ТЕСТОВ
// =====================================================

/**
 * Генерация теста на английские слова
 */
function generateEnglishWordTest(level, count = 5, learnedWords = []) {
    const words = ENGLISH_WORDS[level] || ENGLISH_WORDS.a1;
    
    // Фильтруем уже хорошо выученные
    const availableWords = words.filter(w => {
        const learned = learnedWords.find(lw => lw.word === w.en);
        return !learned || learned.correctCount < 3; // Повторяем пока не ответим 3 раза правильно
    });
    
    // Если все выучены, берём для повторения
    const wordsToUse = availableWords.length >= count ? availableWords : words;
    
    // Случайный выбор
    const shuffled = [...wordsToUse].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);
    
    return selected.map(word => {
        const isEnToRu = Math.random() > 0.5;
        const wrongAnswers = words
            .filter(w => w.ru !== word.ru)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(w => isEnToRu ? w.ru : w.en);
        
        const options = [...wrongAnswers, isEnToRu ? word.ru : word.en]
            .sort(() => Math.random() - 0.5);
        
        return {
            type: 'word',
            question: isEnToRu ? `Переведи: "${word.en}"` : `Translate: "${word.ru}"`,
            correctAnswer: isEnToRu ? word.ru : word.en,
            options: options,
            word: word.en,
            direction: isEnToRu ? 'en-ru' : 'ru-en'
        };
    });
}

/**
 * Генерация теста на фразы
 */
function generateEnglishPhraseTest(level, count = 3) {
    const phrases = ENGLISH_PHRASES[level] || ENGLISH_PHRASES.a1;
    const shuffled = [...phrases].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, phrases.length));
    
    return selected.map(phrase => ({
        type: 'phrase',
        question: `Переведи: "${phrase.en}"`,
        correctAnswer: phrase.ru,
        inputType: 'text' // Пользователь сам пишет
    }));
}

/**
 * Получение совета по дисциплине
 */
function getDisciplineTip(category) {
    const tips = DISCIPLINE_KNOWLEDGE[category];
    if (!tips) return null;
    return tips[Math.floor(Math.random() * tips.length)];
}

/**
 * Получение бизнес-совета
 */
function getBusinessTip(category) {
    const tips = BUSINESS_KNOWLEDGE[category];
    if (!tips) return null;
    return tips[Math.floor(Math.random() * tips.length)];
}

// Экспорт
window.ENGLISH_WORDS = ENGLISH_WORDS;
window.ENGLISH_PHRASES = ENGLISH_PHRASES;
window.DISCIPLINE_KNOWLEDGE = DISCIPLINE_KNOWLEDGE;
window.BUSINESS_KNOWLEDGE = BUSINESS_KNOWLEDGE;
window.generateEnglishWordTest = generateEnglishWordTest;
window.generateEnglishPhraseTest = generateEnglishPhraseTest;
window.getDisciplineTip = getDisciplineTip;
window.getBusinessTip = getBusinessTip;
