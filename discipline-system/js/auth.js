/**
 * DISCIPLINE - Authentication Module
 * Регистрация и авторизация пользователей
 */

const AUTH_KEY = 'discipline_auth';
const USERS_KEY = 'discipline_users';

/**
 * Получить текущего пользователя
 */
function getCurrentUser() {
    const auth = localStorage.getItem(AUTH_KEY);
    if (!auth) return null;
    
    try {
        return JSON.parse(auth);
    } catch (e) {
        return null;
    }
}

/**
 * Получить всех пользователей
 */
function getUsers() {
    const users = localStorage.getItem(USERS_KEY);
    if (!users) return {};
    
    try {
        return JSON.parse(users);
    } catch (e) {
        return {};
    }
}

/**
 * Сохранить пользователей
 */
function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/**
 * Регистрация пользователя
 */
function registerUser(name, email, password) {
    const users = getUsers();
    
    if (users[email]) {
        return { success: false, error: 'Пользователь с таким email уже существует' };
    }
    
    if (password.length < 6) {
        return { success: false, error: 'Пароль должен быть минимум 6 символов' };
    }
    
    const user = {
        id: Date.now().toString(),
        name: name,
        email: email,
        password: password, // В реальном приложении — хэшировать!
        createdAt: new Date().toISOString(),
        goals: [],
        stats: {
            totalDays: 0,
            totalTasks: 0,
            completedTasks: 0,
            currentStreak: 0,
            bestStreak: 0
        }
    };
    
    users[email] = user;
    saveUsers(users);
    
    // Автоматический вход
    loginUser(email, password);
    
    return { success: true, user: user };
}

/**
 * Вход пользователя
 */
function loginUser(email, password) {
    const users = getUsers();
    const user = users[email];
    
    if (!user) {
        return { success: false, error: 'Пользователь не найден' };
    }
    
    if (user.password !== password) {
        return { success: false, error: 'Неверный пароль' };
    }
    
    // Сохраняем сессию
    localStorage.setItem(AUTH_KEY, JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
    }));
    
    return { success: true, user: user };
}

/**
 * Выход пользователя
 */
function logoutUser() {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = 'auth.html';
}

/**
 * Проверка авторизации (для защищённых страниц)
 */
function requireAuth() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'auth.html';
        return false;
    }
    return true;
}

/**
 * Получить полные данные пользователя
 */
function getUserData() {
    const currentUser = getCurrentUser();
    if (!currentUser) return null;
    
    const users = getUsers();
    return users[currentUser.email] || null;
}

/**
 * Сохранить данные пользователя
 */
function saveUserData(userData) {
    const currentUser = getCurrentUser();
    if (!currentUser) return false;
    
    const users = getUsers();
    users[currentUser.email] = userData;
    saveUsers(users);
    return true;
}

// Инициализация для страницы auth.html
if (document.getElementById('login-form')) {
    document.addEventListener('DOMContentLoaded', () => {
        // Если уже залогинен — редирект
        if (getCurrentUser()) {
            window.location.href = 'app.html';
            return;
        }
        
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
        // Переключение форм
        document.getElementById('show-register').addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.classList.remove('active');
            registerForm.classList.add('active');
        });
        
        document.getElementById('show-login').addEventListener('click', (e) => {
            e.preventDefault();
            registerForm.classList.remove('active');
            loginForm.classList.add('active');
        });
        
        // Вход
        document.getElementById('login-btn').addEventListener('click', () => {
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;
            
            if (!email || !password) {
                alert('Заполни все поля');
                return;
            }
            
            const result = loginUser(email, password);
            if (result.success) {
                window.location.href = 'app.html';
            } else {
                alert(result.error);
            }
        });
        
        // Регистрация
        document.getElementById('register-btn').addEventListener('click', () => {
            const name = document.getElementById('register-name').value.trim();
            const email = document.getElementById('register-email').value.trim();
            const password = document.getElementById('register-password').value;
            const passwordConfirm = document.getElementById('register-password-confirm').value;
            
            if (!name || !email || !password) {
                alert('Заполни все поля');
                return;
            }
            
            if (password !== passwordConfirm) {
                alert('Пароли не совпадают');
                return;
            }
            
            const result = registerUser(name, email, password);
            if (result.success) {
                window.location.href = 'app.html';
            } else {
                alert(result.error);
            }
        });
        
        // Enter для отправки
        document.getElementById('login-password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') document.getElementById('login-btn').click();
        });
        
        document.getElementById('register-password-confirm').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') document.getElementById('register-btn').click();
        });
    });
}

// Кнопка выхода (для всех страниц)
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutUser);
    }
});

// Экспорт функций
window.getCurrentUser = getCurrentUser;
window.getUserData = getUserData;
window.saveUserData = saveUserData;
window.requireAuth = requireAuth;
window.logoutUser = logoutUser;
