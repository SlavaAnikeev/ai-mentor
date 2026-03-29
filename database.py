from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, JSON, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
import hashlib

Base = declarative_base()


class User(Base):
    """Пользователь"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)  # Имя пользователя
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    created_at = Column(DateTime, default=datetime.now)
    
    @staticmethod
    def hash_password(password: str) -> str:
        return hashlib.sha256(password.encode()).hexdigest()
    
    def check_password(self, password: str) -> bool:
        return self.password_hash == self.hash_password(password)


class Task(Base):
    """Задача/цель пользователя"""
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)  # Привязка к пользователю
    title = Column(String)
    category = Column(String)  # "language", "career", "fitness", "learning", "universal"
    description = Column(Text)
    
    # Расписание (дни недели: 0=Пн, 6=Вс)
    schedule_days = Column(JSON, default=[0,1,2,3,4,5,6])
    
    # Прогресс
    total_sessions = Column(Integer, default=0)
    completed_sessions = Column(Integer, default=0)
    current_streak = Column(Integer, default=0)
    best_streak = Column(Integer, default=0)  # Лучшая серия
    total_minutes = Column(Integer, default=0)  # Общее время занятий
    
    # Контекст пользователя
    user_context = Column(JSON, default={})
    
    created_at = Column(DateTime, default=datetime.now)
    last_session_date = Column(String)  # Дата последнего занятия
    is_active = Column(Boolean, default=True)


class ChatMessage(Base):
    """История сообщений с наставником"""
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer)  # К какой задаче относится
    role = Column(String)  # "user" или "assistant"
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.now)


class SessionLog(Base):
    """Лог занятий"""
    __tablename__ = "session_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer)
    date = Column(String)  # "2024-01-15"
    completed = Column(Boolean, default=False)
    notes = Column(Text)  # Заметки о занятии
    progress_data = Column(JSON, default={})  # Доп. данные прогресса


engine = create_engine("sqlite:///./app.db")

Base.metadata.create_all(bind=engine)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()