/**
 * DISCIPLINE - Authentication Module
 * Регистрация и авторизация пользователей
 */

const AUTH_KEY = 'discipline_auth';
const USERS_KEY = 'discipline_users';
const API_URL = window.location.origin;

// === ВАЛИДАЦИЯ ===

/**
 * Правила валидации пароля
 */
const PASSWORD_RULES = {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecial: true,
    specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

/**
 * Валидация email
 */
function validateEmail(email) {
    if (!email || email.trim() === '') {
        return { valid: false, error: 'Email обязателен' };
    }
    
    email = email.trim().toLowerCase();
    
    // Базовая проверка формата
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        return { valid: false, error: 'Неверный формат email' };
    }
    
    // Проверка длины
    if (email.length > 254) {
        return { valid: false, error: 'Email слишком длинный' };
    }
    
    // Проверка домена
    const domain = email.split('@')[1];
    if (domain.startsWith('.') || domain.endsWith('.') || domain.includes('..')) {
        return { valid: false, error: 'Неверный домен email' };
    }
    
    return { valid: true, email: email };
}

/**
 * Валидация пароля с детальными правилами
 */
function validatePassword(password) {
    const errors = [];
    const checks = {
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
    };
    
    if (!password) {
        return { 
            valid: false, 
            errors: ['Пароль обязателен'],
            checks: checks
        };
    }
    
    // Проверка длины
    if (password.length < PASSWORD_RULES.minLength) {
        errors.push(`Минимум ${PASSWORD_RULES.minLength} символов`);
    } else if (password.length > PASSWORD_RULES.maxLength) {
        errors.push(`Максимум ${PASSWORD_RULES.maxLength} символов`);
    } else {
        checks.length = true;
    }
    
    // Проверка заглавных букв
    if (PASSWORD_RULES.requireUppercase) {
        if (/[A-ZА-ЯЁ]/.test(password)) {
            checks.uppercase = true;
        } else {
            errors.push('Нужна хотя бы одна заглавная буква');
        }
    }
    
    // Проверка строчных букв
    if (PASSWORD_RULES.requireLowercase) {
        if (/[a-zа-яё]/.test(password)) {
            checks.lowercase = true;
        } else {
            errors.push('Нужна хотя бы одна строчная буква');
        }
    }
    
    // Проверка цифр
    if (PASSWORD_RULES.requireNumber) {
        if (/[0-9]/.test(password)) {
            checks.number = true;
        } else {
            errors.push('Нужна хотя бы одна цифра');
        }
    }
    
    // Проверка спецсимволов
    if (PASSWORD_RULES.requireSpecial) {
        const specialRegex = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/;
        if (specialRegex.test(password)) {
            checks.special = true;
        } else {
            errors.push('Нужен хотя бы один спецсимвол (!@#$%^&*...)');
        }
    }
    
    // Проверка на пробелы
    if (/\s/.test(password)) {
        errors.push('Пароль не должен содержать пробелы');
    }
    
    return {
        valid: errors.length === 0,
        errors: errors,
        checks: checks,
        strength: calculatePasswordStrength(password, checks)
    };
}

/**
 * Расчёт силы пароля (0-100)
 */
function calculatePasswordStrength(password, checks) {
    if (!password) return 0;
    
    let score = 0;
    
    // Базовые очки за длину
    score += Math.min(password.length * 4, 40);
    
    // Очки за выполненные правила
    if (checks.uppercase) score += 10;
    if (checks.lowercase) score += 10;
    if (checks.number) score += 15;
    if (checks.special) score += 20;
    
    // Бонус за разнообразие
    const uniqueChars = new Set(password).size;
    score += Math.min(uniqueChars * 2, 10);
    
    // Штраф за последовательности (123, abc)
    if (/123|234|345|456|567|678|789|890/.test(password)) score -= 10;
    if (/abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(password)) score -= 10;
    
    // Штраф за повторяющиеся символы
    if (/(.)\1{2,}/.test(password)) score -= 15;
    
    return Math.max(0, Math.min(100, score));
}

/**
 * Получить текст силы пароля
 */
function getPasswordStrengthText(strength) {
    if (strength < 30) return { text: 'Слабый', class: 'weak' };
    if (strength < 50) return { text: 'Средний', class: 'medium' };
    if (strength < 70) return { text: 'Хороший', class: 'good' };
    return { text: 'Отличный', class: 'strong' };
}

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
    
    // Валидация email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
        return { success: false, error: emailValidation.error };
    }
    email = emailValidation.email;
    
    if (users[email]) {
        return { success: false, error: 'Пользователь с таким email уже существует' };
    }
    
    // Валидация пароля
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
        return { success: false, error: passwordValidation.errors.join('. ') };
    }
    
    // Валидация имени
    if (!name || name.trim().length < 2) {
        return { success: false, error: 'Имя должно быть минимум 2 символа' };
    }
    if (name.length > 50) {
        return { success: false, error: 'Имя слишком длинное' };
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
        document.getElementById('login-btn').addEventListener('click', async () => {
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;
            const btn = document.getElementById('login-btn');
            
            if (!email || !password) {
                showLoginError('Заполни все поля');
                return;
            }
            
            btn.disabled = true;
            btn.textContent = 'Вход...';
            hideLoginError();
            
            try {
                const response = await fetch(`${API_URL}/api/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (response.ok && data.success) {
                    // Сохраняем сессию
                    localStorage.setItem(AUTH_KEY, JSON.stringify({
                        id: data.user_id,
                        name: data.name,
                        email: email
                    }));
                    window.location.href = 'app.html';
                } else if (response.status === 403) {
                    // Email не подтверждён
                    window.location.href = `verify.html?email=${encodeURIComponent(email)}`;
                } else {
                    showLoginError(data.detail || 'Неверный email или пароль');
                }
            } catch (error) {
                // Fallback на локальную авторизацию
                const result = loginUser(email, password);
                if (result.success) {
                    window.location.href = 'app.html';
                } else {
                    showLoginError(result.error);
                }
            } finally {
                btn.disabled = false;
                btn.textContent = 'Войти';
            }
        });
        
        // Регистрация
        document.getElementById('register-btn').addEventListener('click', async () => {
            const name = document.getElementById('register-name').value.trim();
            const email = document.getElementById('register-email').value.trim();
            const password = document.getElementById('register-password').value;
            const passwordConfirm = document.getElementById('register-password-confirm').value;
            
            // Скрываем предыдущие ошибки
            hideAllErrors();
            
            if (!name || !email || !password) {
                showError('register-error', 'Заполни все поля');
                return;
            }
            
            // Валидация email
            const emailValidation = validateEmail(email);
            if (!emailValidation.valid) {
                showError('register-email-error', emailValidation.error);
                return;
            }
            
            // Валидация пароля
            const passwordValidation = validatePassword(password);
            if (!passwordValidation.valid) {
                showError('register-password-error', passwordValidation.errors[0]);
                return;
            }
            
            if (password !== passwordConfirm) {
                showError('register-password-confirm-error', 'Пароли не совпадают');
                return;
            }
            
            const btn = document.getElementById('register-btn');
            btn.disabled = true;
            btn.textContent = 'Создание...';
            
            try {
                const response = await fetch(`${API_URL}/api/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });
                
                const data = await response.json();
                
                if (response.ok && data.success) {
                    if (data.requires_verification) {
                        // Нужно подтвердить email
                        window.location.href = `verify.html?email=${encodeURIComponent(email)}`;
                    } else {
                        // Верификация отключена, сразу входим
                        localStorage.setItem(AUTH_KEY, JSON.stringify({
                            id: data.user_id,
                            name: data.name,
                            email: email
                        }));
                        window.location.href = 'app.html';
                    }
                } else {
                    showError('register-error', data.detail || 'Ошибка регистрации');
                }
            } catch (error) {
                // Fallback на локальную регистрацию
                const result = registerUser(name, email, password);
                if (result.success) {
                    window.location.href = 'app.html';
                } else {
                    showError('register-error', result.error);
                }
            } finally {
                btn.disabled = false;
                btn.textContent = 'Создать аккаунт';
            }
        });
        
        // Enter для отправки
        document.getElementById('login-password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') document.getElementById('login-btn').click();
        });
        
        document.getElementById('register-password-confirm').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') document.getElementById('register-btn').click();
        });
        
        // === LIVE ВАЛИДАЦИЯ ===
        
        // Валидация пароля в реальном времени
        const passwordInput = document.getElementById('register-password');
        const passwordRules = document.getElementById('password-rules');
        
        if (passwordInput && passwordRules) {
            passwordInput.addEventListener('input', () => {
                const password = passwordInput.value;
                const validation = validatePassword(password);
                
                // Обновляем индикаторы правил
                updatePasswordRule('rule-length', validation.checks.length);
                updatePasswordRule('rule-uppercase', validation.checks.uppercase);
                updatePasswordRule('rule-lowercase', validation.checks.lowercase);
                updatePasswordRule('rule-number', validation.checks.number);
                updatePasswordRule('rule-special', validation.checks.special);
                
                // Обновляем индикатор силы
                const strengthBar = document.getElementById('password-strength-bar');
                const strengthText = document.getElementById('password-strength-text');
                if (strengthBar && strengthText) {
                    const strength = getPasswordStrengthText(validation.strength);
                    strengthBar.style.width = validation.strength + '%';
                    strengthBar.className = 'strength-bar ' + strength.class;
                    strengthText.textContent = password ? strength.text : '';
                    strengthText.className = 'strength-text ' + strength.class;
                }
                
                // Показываем правила если начали вводить
                if (password.length > 0) {
                    passwordRules.classList.add('visible');
                } else {
                    passwordRules.classList.remove('visible');
                }
            });
            
            // Скрываем правила при фокусе на другом поле
            passwordInput.addEventListener('blur', () => {
                const validation = validatePassword(passwordInput.value);
                if (validation.valid) {
                    passwordRules.classList.remove('visible');
                }
            });
        }
        
        // Валидация email в реальном времени
        const emailInput = document.getElementById('register-email');
        if (emailInput) {
            emailInput.addEventListener('blur', () => {
                const validation = validateEmail(emailInput.value);
                if (!validation.valid && emailInput.value.trim()) {
                    showError('register-email-error', validation.error);
                    emailInput.classList.add('invalid');
                } else {
                    hideError('register-email-error');
                    emailInput.classList.remove('invalid');
                    if (validation.valid) {
                        emailInput.classList.add('valid');
                    }
                }
            });
            
            emailInput.addEventListener('input', () => {
                emailInput.classList.remove('invalid', 'valid');
                hideError('register-email-error');
            });
        }
        
        // Проверка совпадения паролей
        const confirmInput = document.getElementById('register-password-confirm');
        if (confirmInput) {
            confirmInput.addEventListener('input', () => {
                const password = document.getElementById('register-password').value;
                const confirm = confirmInput.value;
                
                if (confirm && password !== confirm) {
                    confirmInput.classList.add('invalid');
                    confirmInput.classList.remove('valid');
                } else if (confirm && password === confirm) {
                    confirmInput.classList.remove('invalid');
                    confirmInput.classList.add('valid');
                    hideError('register-password-confirm-error');
                }
            });
        }
    });
}

/**
 * Обновить статус правила пароля
 */
function updatePasswordRule(ruleId, passed) {
    const rule = document.getElementById(ruleId);
    if (rule) {
        if (passed) {
            rule.classList.add('passed');
            rule.classList.remove('failed');
        } else {
            rule.classList.remove('passed');
            rule.classList.add('failed');
        }
    }
}

/**
 * Показать ошибку
 */
function showError(elementId, message) {
    let errorEl = document.getElementById(elementId);
    if (!errorEl) {
        // Создаём элемент ошибки если его нет
        errorEl = document.createElement('div');
        errorEl.id = elementId;
        errorEl.className = 'form-error';
        
        // Вставляем после соответствующего поля
        const fieldName = elementId.replace('-error', '');
        const field = document.getElementById(fieldName);
        if (field && field.parentNode) {
            field.parentNode.appendChild(errorEl);
        }
    }
    errorEl.textContent = message;
    errorEl.style.display = 'block';
}

/**
 * Скрыть ошибку
 */
function hideError(elementId) {
    const errorEl = document.getElementById(elementId);
    if (errorEl) {
        errorEl.style.display = 'none';
    }
}

/**
 * Скрыть все ошибки
 */
function hideAllErrors() {
    document.querySelectorAll('.form-error').forEach(el => {
        el.style.display = 'none';
    });
    document.querySelectorAll('.invalid').forEach(el => {
        el.classList.remove('invalid');
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
/**
 * Показать ошибку входа
 */
function showLoginError(message) {
    let errorEl = document.getElementById('login-error');
    if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.id = 'login-error';
        errorEl.className = 'form-error';
        const btn = document.getElementById('login-btn');
        btn.parentNode.insertBefore(errorEl, btn);
    }
    errorEl.textContent = message;
    errorEl.style.display = 'block';
}

/**
 * Скрыть ошибку входа
 */
function hideLoginError() {
    const errorEl = document.getElementById('login-error');
    if (errorEl) {
        errorEl.style.display = 'none';
    }
}

window.getCurrentUser = getCurrentUser;
window.getUserData = getUserData;
window.saveUserData = saveUserData;
window.requireAuth = requireAuth;
window.logoutUser = logoutUser;
