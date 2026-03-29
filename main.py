from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta
import httpx
import json
import os
import re

from database import get_db, Base, engine, User, Task, ChatMessage, SessionLog
from email_service import (
    send_verification_email, 
    send_welcome_email, 
    is_email_configured
)

# Пересоздаём таблицы
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Настройка: требовать подтверждение email (можно отключить для разработки)
REQUIRE_EMAIL_VERIFICATION = os.getenv("REQUIRE_EMAIL_VERIFICATION", "true").lower() == "true"
app.mount("/static", StaticFiles(directory="static"), name="static")

# OpenRouter API
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"


# === СИСТЕМНЫЕ ПРОМПТЫ ДЛЯ НАСТАВНИКОВ ===
MENTOR_PROMPTS = {
    "language": """Ты — профессиональный репетитор по языкам с 15-летним опытом. Твоё имя — Анна.

ТВОЯ РОЛЬ:
- Персональный учитель языка (английский, или другой если ученик укажет)
- Адаптируешься к уровню ученика (от A1 до C2)
- Даёшь упражнения и ОБЯЗАТЕЛЬНО проверяешь их
- Исправляешь ошибки чётко, объясняя почему неправильно
- Помнишь что изучали ранее

МЕТОДИКА:
1. Узнай уровень и цели ученика
2. Давай материал порциями (не перегружай)
3. После объяснения — практика
4. Проверяй ответы и давай обратную связь
5. В конце занятия — краткое резюме и домашнее задание

ВАЖНО:
- Если ученик ошибся — укажи конкретно что неправильно
- Хвали за успехи
- Используй примеры из реальной жизни""",

    "career": """Ты — опытный HR-специалист и карьерный консультант. Твоё имя — Максим.

ТВОЯ РОЛЬ:
- Помогаешь с поиском работы, карьерным ростом, фрилансом
- Знаешь рынок труда, платформы (hh.ru, LinkedIn, Kwork, Upwork)
- Понимаешь разницу между наймом и фрилансом
- СЛУШАЕШЬ что хочет человек и адаптируешься

КРИТИЧЕСКИ ВАЖНО:
- Если человек сказал "НЕ хочу фриланс" — НЕ предлагай фриланс!
- Если хочет стабильную работу — фокус на резюме, собеседования, hh.ru
- Если хочет фриланс — платформы, портфолио, поиск клиентов
- Спрашивай про навыки, опыт, желаемую зарплату

ФОРМАТ:
1. Выясни цель (найм/фриланс/своё дело)
2. Узнай навыки и опыт
3. Дай конкретный план на сегодня
4. Проверь выполнение""",

    "fitness": """Ты — персональный фитнес-тренер. Твоё имя — Дима.

ТВОЯ РОЛЬ:
- Составляешь персональные тренировки
- Учитываешь уровень подготовки
- Следишь за техникой безопасности
- Мотивируешь

ФОРМАТ ТРЕНИРОВКИ:
1. Узнай самочувствие
2. Разминка (обязательно!)
3. Основные упражнения с повторениями
4. Заминка/растяжка
5. Обратная связь

ВАЖНО:
- Если говорят "тяжело" — снижай нагрузку
- Давай альтернативы упражнений
- Отслеживай прогресс""",

    "learning": """Ты — опытный наставник и преподаватель. Твоё имя — Алекс.

ТВОЯ РОЛЬ:
- Помогаешь изучать навыки (программирование, дизайн, и т.д.)
- Объясняешь сложное простым языком
- Даёшь практические задания
- Проверяешь понимание

ФОРМАТ:
1. Узнай текущий уровень и цель
2. Объясни теорию кратко
3. Практическое задание
4. Проверь результат
5. Укажи на ошибки""",

    "psychology": """Ты — профессиональный психолог-консультант. Твоё имя — Елена.

ТВОЯ РОЛЬ:
- Поддерживаешь эмоционально
- Помогаешь разобраться в чувствах
- Даёшь техники для работы со стрессом, тревогой
- Не ставишь диагнозы, но помогаешь понять себя

ВАЖНО:
- Слушай внимательно
- Не осуждай
- Задавай открытые вопросы
- Если серьёзные проблемы — рекомендуй обратиться к специалисту очно
- Техники: дыхание, заземление, рефрейминг""",

    "universal": """Ты — универсальный персональный наставник. Твоё имя — Макс.

ТВОЯ РОЛЬ:
- Помогаешь с ЛЮБЫМИ вопросами и целями
- Ораторское искусство, навыки общения, хобби, творчество
- Адаптируешься под запрос человека
- Если нужен специалист (врач, юрист) — рекомендуешь обратиться к нему

ПОДХОД:
1. Выясни что человек хочет
2. Составь план достижения
3. Давай практические задания
4. Отслеживай прогресс
5. Поддерживай и мотивируй

Ты гибкий и можешь помочь с чем угодно!"""
}

MENTOR_INFO = {
    "language": {"name": "Анна", "avatar": "👩‍🏫", "title": "Репетитор"},
    "career": {"name": "Максим", "avatar": "👨‍💼", "title": "HR-консультант"},
    "fitness": {"name": "Дима", "avatar": "💪", "title": "Тренер"},
    "learning": {"name": "Алекс", "avatar": "🧑‍💻", "title": "Наставник"},
    "psychology": {"name": "Елена", "avatar": "🧠", "title": "Психолог"},
    "universal": {"name": "Макс", "avatar": "🎯", "title": "Персональный помощник"}
}


def get_mentor_for_category(category: str) -> dict:
    return MENTOR_INFO.get(category, MENTOR_INFO["universal"])


async def ask_mentor(task: Task, messages: list, user_message: str, user_name: str = "") -> str:
    """Отправляет запрос к LLM"""
    
    system_prompt = MENTOR_PROMPTS.get(task.category, MENTOR_PROMPTS["universal"])
    
    # Добавляем контекст
    if task.user_context:
        system_prompt += f"\n\nКОНТЕКСТ УЧЕНИКА:\n{json.dumps(task.user_context, ensure_ascii=False)}"
    
    system_prompt += f"\n\nЗАДАЧА: {task.title}"
    if task.description:
        system_prompt += f"\nОПИСАНИЕ: {task.description}"
    system_prompt += f"\nЗАНЯТИЙ ПРОЙДЕНО: {task.completed_sessions}"
    if user_name:
        system_prompt += f"\nИМЯ УЧЕНИКА: {user_name}"
    
    # Формируем историю
    llm_messages = [{"role": "system", "content": system_prompt}]
    
    for msg in messages[-20:]:
        llm_messages.append({"role": msg.role, "content": msg.content})
    
    llm_messages.append({"role": "user", "content": user_message})
    
    if not OPENROUTER_API_KEY:
        return "⚠️ API ключ не настроен. Установите OPENROUTER_API_KEY."
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                OPENROUTER_URL,
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "anthropic/claude-3-haiku",
                    "messages": llm_messages,
                    "max_tokens": 1500
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return data["choices"][0]["message"]["content"]
            else:
                return f"Ошибка API: {response.status_code}"
                
    except Exception as e:
        return f"Ошибка: {str(e)}"


# === ВАЛИДАЦИЯ ===

def validate_email(email: str) -> tuple[bool, str]:
    """Проверка email"""
    if not email or not email.strip():
        return False, "Email обязателен"
    
    email = email.strip().lower()
    
    # Проверка длины
    if len(email) > 254:
        return False, "Email слишком длинный"
    
    # Базовая проверка формата
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_regex, email):
        return False, "Неверный формат email"
    
    # Проверка домена
    domain = email.split('@')[1]
    if domain.startswith('.') or domain.endswith('.') or '..' in domain:
        return False, "Неверный домен email"
    
    return True, email


def validate_password(password: str) -> tuple[bool, list[str]]:
    """Проверка пароля по правилам"""
    errors = []
    
    if not password:
        return False, ["Пароль обязателен"]
    
    # Минимальная длина
    if len(password) < 8:
        errors.append("Пароль должен быть минимум 8 символов")
    
    # Максимальная длина
    if len(password) > 128:
        errors.append("Пароль слишком длинный")
    
    # Заглавная буква
    if not re.search(r'[A-ZА-ЯЁ]', password):
        errors.append("Нужна хотя бы одна заглавная буква")
    
    # Строчная буква
    if not re.search(r'[a-zа-яё]', password):
        errors.append("Нужна хотя бы одна строчная буква")
    
    # Цифра
    if not re.search(r'[0-9]', password):
        errors.append("Нужна хотя бы одна цифра")
    
    # Спецсимвол
    if not re.search(r'[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]', password):
        errors.append("Нужен хотя бы один спецсимвол (!@#$%^&*...)")
    
    # Пробелы запрещены
    if ' ' in password:
        errors.append("Пароль не должен содержать пробелы")
    
    return len(errors) == 0, errors


def validate_name(name: str) -> tuple[bool, str]:
    """Проверка имени"""
    if not name or not name.strip():
        return False, "Имя обязательно"
    
    name = name.strip()
    
    if len(name) < 2:
        return False, "Имя должно быть минимум 2 символа"
    
    if len(name) > 50:
        return False, "Имя слишком длинное"
    
    return True, name


# === AUTH API ===

@app.post("/api/register")
async def register(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    
    # Валидация имени
    name_valid, name_result = validate_name(name)
    if not name_valid:
        raise HTTPException(400, name_result)
    name = name_result
    
    # Валидация email
    email_valid, email_result = validate_email(email)
    if not email_valid:
        raise HTTPException(400, email_result)
    email = email_result
    
    # Валидация пароля
    password_valid, password_errors = validate_password(password)
    if not password_valid:
        raise HTTPException(400, password_errors[0])
    
    # Проверяем существует ли пользователь
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        # Если не подтверждён и токен истёк — можно перерегистрировать
        if not existing.is_verified and existing.verification_token_expires:
            if datetime.now() > existing.verification_token_expires:
                db.delete(existing)
                db.commit()
            else:
                raise HTTPException(400, "Email уже зарегистрирован. Проверь почту для подтверждения.")
        else:
            raise HTTPException(400, "Email уже зарегистрирован")
    
    # Создаём пользователя
    user = User(
        name=name,
        email=email,
        password_hash=User.hash_password(password),
        is_verified=not REQUIRE_EMAIL_VERIFICATION  # Если верификация отключена — сразу подтверждён
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Отправляем письмо с подтверждением
    email_sent = False
    if REQUIRE_EMAIL_VERIFICATION and is_email_configured():
        token = user.set_verification_token(hours_valid=24)
        db.commit()
        
        success, message = send_verification_email(email, name, token)
        email_sent = success
        if not success:
            print(f"Failed to send verification email: {message}")
    
    return {
        "success": True, 
        "user_id": user.id, 
        "name": user.name,
        "requires_verification": REQUIRE_EMAIL_VERIFICATION and not user.is_verified,
        "email_sent": email_sent
    }


@app.post("/api/login")
async def login(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    
    user = db.query(User).filter(User.email == email).first()
    
    if not user or not user.check_password(password):
        raise HTTPException(401, "Неверный email или пароль")
    
    # Проверяем подтверждён ли email
    if REQUIRE_EMAIL_VERIFICATION and not user.is_verified:
        raise HTTPException(403, "Подтверди email для входа. Проверь почту.")
    
    return {"success": True, "user_id": user.id, "name": user.name}


@app.post("/api/verify-email")
async def verify_email(request: Request, db: Session = Depends(get_db)):
    """Подтверждение email по токену"""
    data = await request.json()
    token = data.get("token", "").strip()
    
    if not token:
        raise HTTPException(400, "Токен не указан")
    
    # Ищем пользователя с таким токеном
    user = db.query(User).filter(User.verification_token == token).first()
    
    if not user:
        raise HTTPException(400, "Неверный или устаревший токен")
    
    # Проверяем срок действия
    if not user.is_token_valid():
        raise HTTPException(400, "Ссылка устарела. Запроси новую.")
    
    # Подтверждаем email
    user.is_verified = True
    user.verification_token = None
    user.verification_token_expires = None
    db.commit()
    
    # Отправляем приветственное письмо
    if is_email_configured():
        send_welcome_email(user.email, user.name)
    
    return {
        "success": True, 
        "message": "Email подтверждён!",
        "user_id": user.id,
        "name": user.name
    }


@app.post("/api/resend-verification")
async def resend_verification(request: Request, db: Session = Depends(get_db)):
    """Повторная отправка письма подтверждения"""
    data = await request.json()
    email = data.get("email", "").strip().lower()
    
    if not email:
        raise HTTPException(400, "Email не указан")
    
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        # Не говорим что пользователь не найден (безопасность)
        return {"success": True, "message": "Если аккаунт существует, письмо отправлено"}
    
    if user.is_verified:
        return {"success": True, "message": "Email уже подтверждён"}
    
    if not is_email_configured():
        raise HTTPException(500, "Email сервис не настроен")
    
    # Генерируем новый токен
    token = user.set_verification_token(hours_valid=24)
    db.commit()
    
    success, message = send_verification_email(email, user.name, token)
    
    if not success:
        raise HTTPException(500, f"Ошибка отправки: {message}")
    
    return {"success": True, "message": "Письмо отправлено"}


# === TASKS API ===

@app.get("/", response_class=HTMLResponse)
async def root():
    with open("static/index.html", "r", encoding="utf-8") as f:
        return f.read()


@app.get("/api/tasks")
async def get_tasks(user_id: int, db: Session = Depends(get_db)):
    tasks = db.query(Task).filter(Task.user_id == user_id, Task.is_active == True).all()
    
    result = []
    today = date.today()
    today_weekday = today.weekday()
    
    for task in tasks:
        mentor = get_mentor_for_category(task.category)
        schedule = task.schedule_days or [0,1,2,3,4,5,6]
        is_scheduled_today = today_weekday in schedule
        
        # Проверяем серию
        if task.last_session_date:
            last_date = datetime.strptime(task.last_session_date, "%Y-%m-%d").date()
            days_diff = (today - last_date).days
            if days_diff > 1:
                task.current_streak = 0
                db.commit()
        
        # История за последние 7 дней
        week_history = []
        for i in range(6, -1, -1):
            check_date = (today - timedelta(days=i)).isoformat()
            session = db.query(SessionLog).filter(
                SessionLog.task_id == task.id,
                SessionLog.date == check_date
            ).first()
            week_history.append({
                "date": check_date,
                "completed": session.completed if session else False
            })
        
        result.append({
            "id": task.id,
            "title": task.title,
            "category": task.category,
            "description": task.description,
            "mentor": mentor,
            "schedule_days": schedule,
            "is_scheduled_today": is_scheduled_today,
            "progress": {
                "total": task.total_sessions,
                "completed": task.completed_sessions,
                "streak": task.current_streak,
                "best_streak": task.best_streak,
                "total_minutes": task.total_minutes
            },
            "week_history": week_history
        })
    
    return result


@app.post("/api/tasks")
async def create_task(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    
    task = Task(
        user_id=data.get("user_id"),
        title=data.get("title"),
        category=data.get("category", "universal"),
        description=data.get("description"),
        schedule_days=data.get("schedule_days", [0,1,2,3,4,5,6])
    )
    
    db.add(task)
    db.commit()
    db.refresh(task)
    
    return {"success": True, "task_id": task.id}


@app.put("/api/tasks/{task_id}")
async def update_task(task_id: int, request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    task = db.query(Task).filter(Task.id == task_id).first()
    
    if not task:
        raise HTTPException(404, "Задача не найдена")
    
    if "schedule_days" in data:
        task.schedule_days = data["schedule_days"]
    if "title" in data:
        task.title = data["title"]
    if "description" in data:
        task.description = data["description"]
    
    db.commit()
    return {"success": True}


@app.delete("/api/tasks/{task_id}")
async def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if task:
        task.is_active = False
        db.commit()
    return {"success": True}


@app.get("/api/tasks/{task_id}/chat")
async def get_chat_history(task_id: int, db: Session = Depends(get_db)):
    messages = db.query(ChatMessage).filter(
        ChatMessage.task_id == task_id
    ).order_by(ChatMessage.created_at).all()
    
    return [{"role": msg.role, "content": msg.content} for msg in messages]


@app.post("/api/tasks/{task_id}/chat")
async def send_message(task_id: int, request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    user_message = data.get("message", "").strip()
    user_name = data.get("user_name", "")
    
    if not user_message:
        return {"error": "Пустое сообщение"}
    
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        return {"error": "Задача не найдена"}
    
    # Сохраняем сообщение пользователя
    user_msg = ChatMessage(task_id=task_id, role="user", content=user_message)
    db.add(user_msg)
    db.commit()
    
    # Получаем историю
    messages = db.query(ChatMessage).filter(
        ChatMessage.task_id == task_id
    ).order_by(ChatMessage.created_at).all()
    
    # Получаем ответ
    mentor_response = await ask_mentor(task, messages, user_message, user_name)
    
    # Сохраняем ответ
    mentor_msg = ChatMessage(task_id=task_id, role="assistant", content=mentor_response)
    db.add(mentor_msg)
    db.commit()
    
    return {
        "response": mentor_response,
        "mentor": get_mentor_for_category(task.category)
    }


@app.post("/api/tasks/{task_id}/complete-session")
async def complete_session(task_id: int, request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    minutes = data.get("minutes", 15)
    
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        return {"error": "Задача не найдена"}
    
    today_str = date.today().isoformat()
    
    # Проверяем не было ли уже занятия сегодня
    existing = db.query(SessionLog).filter(
        SessionLog.task_id == task_id,
        SessionLog.date == today_str
    ).first()
    
    if existing:
        return {"message": "Занятие уже отмечено сегодня", "already": True}
    
    # Создаём лог
    session_log = SessionLog(task_id=task_id, date=today_str, completed=True)
    db.add(session_log)
    
    # Обновляем прогресс
    task.completed_sessions += 1
    task.total_sessions += 1
    task.total_minutes += minutes
    task.current_streak += 1
    task.last_session_date = today_str
    
    if task.current_streak > task.best_streak:
        task.best_streak = task.current_streak
    
    db.commit()
    
    return {
        "success": True,
        "progress": {
            "completed": task.completed_sessions,
            "streak": task.current_streak,
            "best_streak": task.best_streak,
            "total_minutes": task.total_minutes
        }
    }


@app.get("/api/stats/{user_id}")
async def get_stats(user_id: int, db: Session = Depends(get_db)):
    """Общая статистика пользователя"""
    tasks = db.query(Task).filter(Task.user_id == user_id, Task.is_active == True).all()
    
    total_sessions = sum(t.completed_sessions for t in tasks)
    total_minutes = sum(t.total_minutes for t in tasks)
    best_streak = max((t.best_streak for t in tasks), default=0)
    
    return {
        "total_tasks": len(tasks),
        "total_sessions": total_sessions,
        "total_minutes": total_minutes,
        "total_hours": round(total_minutes / 60, 1),
        "best_streak": best_streak
    }
