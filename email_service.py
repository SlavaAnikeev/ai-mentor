"""
DISCIPLINE - Email Service
Сервис для отправки email (подтверждение, восстановление пароля и т.д.)
"""

import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from typing import Optional


# === КОНФИГУРАЦИЯ ===
# Настройки берутся из переменных окружения

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")  # Ваш email
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")  # Пароль приложения
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "DISCIPLINE")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", SMTP_USER)

# URL приложения для ссылок в письмах
APP_URL = os.getenv("APP_URL", "http://localhost:8000")


def is_email_configured() -> bool:
    """Проверяет, настроен ли email"""
    return bool(SMTP_USER and SMTP_PASSWORD)


def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None
) -> tuple[bool, str]:
    """
    Отправляет email
    
    Returns:
        (success: bool, message: str)
    """
    if not is_email_configured():
        return False, "Email не настроен. Установите SMTP_USER и SMTP_PASSWORD."
    
    try:
        # Создаём сообщение
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = f"{SMTP_FROM_NAME} <{SMTP_FROM_EMAIL}>"
        message["To"] = to_email
        
        # Текстовая версия (fallback)
        if text_content:
            part1 = MIMEText(text_content, "plain", "utf-8")
            message.attach(part1)
        
        # HTML версия
        part2 = MIMEText(html_content, "html", "utf-8")
        message.attach(part2)
        
        # Отправляем
        context = ssl.create_default_context()
        
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls(context=context)
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM_EMAIL, to_email, message.as_string())
        
        return True, "Email отправлен"
        
    except smtplib.SMTPAuthenticationError:
        return False, "Ошибка авторизации SMTP. Проверьте логин и пароль."
    except smtplib.SMTPException as e:
        return False, f"Ошибка SMTP: {str(e)}"
    except Exception as e:
        return False, f"Ошибка отправки: {str(e)}"


def send_verification_email(to_email: str, user_name: str, token: str) -> tuple[bool, str]:
    """
    Отправляет письмо с подтверждением email
    """
    verification_url = f"{APP_URL}/discipline-system/verify.html?token={token}"
    
    subject = "Подтверди свой email — DISCIPLINE"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                background-color: #0a0a0a;
                color: #ffffff;
                margin: 0;
                padding: 40px 20px;
            }}
            .container {{
                max-width: 500px;
                margin: 0 auto;
                background-color: #1a1a1a;
                border: 1px solid #2a2a2a;
                padding: 40px;
            }}
            .logo {{
                font-size: 24px;
                font-weight: 900;
                letter-spacing: 4px;
                color: #ff3333;
                text-align: center;
                margin-bottom: 30px;
            }}
            h1 {{
                font-size: 22px;
                margin-bottom: 20px;
                text-align: center;
            }}
            p {{
                color: #888888;
                line-height: 1.6;
                margin-bottom: 15px;
            }}
            .button {{
                display: block;
                width: 100%;
                background-color: #ff3333;
                color: white !important;
                text-decoration: none;
                padding: 18px;
                text-align: center;
                font-weight: 700;
                font-size: 16px;
                margin: 30px 0;
                box-sizing: border-box;
            }}
            .button:hover {{
                background-color: #ff5555;
            }}
            .note {{
                font-size: 13px;
                color: #555555;
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #2a2a2a;
            }}
            .link {{
                word-break: break-all;
                color: #ff3333;
                font-size: 12px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">DISCIPLINE</div>
            
            <h1>Привет, {user_name}! 👋</h1>
            
            <p>Ты почти готов начать путь к своим целям.</p>
            <p>Осталось только подтвердить email:</p>
            
            <a href="{verification_url}" class="button">
                ПОДТВЕРДИТЬ EMAIL
            </a>
            
            <p>Если кнопка не работает, скопируй эту ссылку:</p>
            <p class="link">{verification_url}</p>
            
            <div class="note">
                Ссылка действительна 24 часа.<br>
                Если ты не регистрировался — просто проигнорируй это письмо.
            </div>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
    DISCIPLINE
    
    Привет, {user_name}!
    
    Ты почти готов начать путь к своим целям.
    Подтверди свой email, перейдя по ссылке:
    
    {verification_url}
    
    Ссылка действительна 24 часа.
    Если ты не регистрировался — просто проигнорируй это письмо.
    """
    
    return send_email(to_email, subject, html_content, text_content)


def send_welcome_email(to_email: str, user_name: str) -> tuple[bool, str]:
    """
    Отправляет приветственное письмо после подтверждения
    """
    app_url = f"{APP_URL}/discipline-system/app.html"
    
    subject = "Добро пожаловать в DISCIPLINE! 🎯"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                background-color: #0a0a0a;
                color: #ffffff;
                margin: 0;
                padding: 40px 20px;
            }}
            .container {{
                max-width: 500px;
                margin: 0 auto;
                background-color: #1a1a1a;
                border: 1px solid #2a2a2a;
                padding: 40px;
            }}
            .logo {{
                font-size: 24px;
                font-weight: 900;
                letter-spacing: 4px;
                color: #ff3333;
                text-align: center;
                margin-bottom: 30px;
            }}
            h1 {{
                font-size: 22px;
                margin-bottom: 20px;
                text-align: center;
            }}
            p {{
                color: #888888;
                line-height: 1.6;
                margin-bottom: 15px;
            }}
            .button {{
                display: block;
                width: 100%;
                background-color: #ff3333;
                color: white !important;
                text-decoration: none;
                padding: 18px;
                text-align: center;
                font-weight: 700;
                font-size: 16px;
                margin: 30px 0;
                box-sizing: border-box;
            }}
            .tips {{
                background-color: #111111;
                padding: 20px;
                margin: 20px 0;
            }}
            .tips h3 {{
                color: #ff3333;
                font-size: 14px;
                margin-bottom: 15px;
            }}
            .tips li {{
                color: #888888;
                margin-bottom: 10px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">DISCIPLINE</div>
            
            <h1>Email подтверждён! ✅</h1>
            
            <p>Отлично, {user_name}! Теперь у тебя есть полный доступ к системе.</p>
            
            <div class="tips">
                <h3>С ЧЕГО НАЧАТЬ:</h3>
                <ul>
                    <li>Создай свою первую цель</li>
                    <li>Выбери наставника по направлению</li>
                    <li>Занимайся каждый день хотя бы 15 минут</li>
                    <li>Следи за своим прогрессом</li>
                </ul>
            </div>
            
            <a href="{app_url}" class="button">
                НАЧАТЬ
            </a>
            
            <p style="text-align: center; color: #555555; font-size: 13px;">
                Результат = Дисциплина × Время
            </p>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
    DISCIPLINE
    
    Email подтверждён!
    
    Отлично, {user_name}! Теперь у тебя есть полный доступ к системе.
    
    С ЧЕГО НАЧАТЬ:
    - Создай свою первую цель
    - Выбери наставника по направлению  
    - Занимайся каждый день хотя бы 15 минут
    - Следи за своим прогрессом
    
    Перейти в приложение: {app_url}
    
    Результат = Дисциплина × Время
    """
    
    return send_email(to_email, subject, html_content, text_content)


def send_resend_verification_email(to_email: str, user_name: str, token: str) -> tuple[bool, str]:
    """
    Повторная отправка письма с подтверждением
    """
    return send_verification_email(to_email, user_name, token)
