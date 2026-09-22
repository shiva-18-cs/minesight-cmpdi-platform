from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String)
    full_name = Column(String)
    status = Column(String, default="Active")
    last_active = Column(DateTime, default=datetime.utcnow)


class Subsidiary(Base):
    __tablename__ = "subsidiaries"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    full_name = Column(String)


class Mine(Base):
    __tablename__ = "mines"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    subsidiary_id = Column(Integer, ForeignKey("subsidiaries.id"))
    subsidiary_name = Column(String)


class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    doc_id = Column(String, unique=True, index=True)
    name = Column(String)
    doc_type = Column(String)
    year = Column(Integer)
    subsidiary = Column(String)
    mine = Column(String)
    department = Column(String, default="Mining")
    upload_date = Column(DateTime, default=datetime.utcnow)
    uploaded_by = Column(String)
    status = Column(String, default="Pending")
    reading_accuracy = Column(Float, default=0.0)
    pages = Column(Integer, default=1)
    file_type = Column(String, default="PDF")


class DocumentText(Base):
    __tablename__ = "document_text"
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"))
    page_number = Column(Integer)
    text_content = Column(Text)


class ExtractedInformation(Base):
    __tablename__ = "extracted_information"
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"))
    field = Column(String)
    value = Column(String)
    numeric_value = Column(Float, nullable=True)
    unit = Column(String)
    source_page = Column(String)
    status = Column(String, default="Correct")
    year = Column(Integer, nullable=True)
    subsidiary = Column(String, nullable=True)
    mine = Column(String, nullable=True)


class DataCheck(Base):
    __tablename__ = "data_checks"
    id = Column(Integer, primary_key=True, index=True)
    info_id = Column(Integer, ForeignKey("extracted_information.id"))
    check_type = Column(String)
    status = Column(String)
    message = Column(String)
    document_id = Column(Integer, ForeignKey("documents.id"))


class Difference(Base):
    __tablename__ = "differences"
    id = Column(Integer, primary_key=True, index=True)
    diff_id = Column(String, unique=True)
    field = Column(String)
    value_a = Column(String)
    value_b = Column(String)
    unit_a = Column(String, default="")
    unit_b = Column(String, default="")
    doc_a_id = Column(Integer, ForeignKey("documents.id"))
    doc_b_id = Column(Integer, ForeignKey("documents.id"))
    doc_a_name = Column(String, default="")
    doc_b_name = Column(String, default="")
    page_a = Column(String, default="")
    page_b = Column(String, default="")
    year = Column(Integer, nullable=True)
    subsidiary = Column(String, nullable=True)
    priority = Column(String, default="Medium")
    status = Column(String, default="Needs Review")
    resolution = Column(String, nullable=True)
    resolved_by = Column(String, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    reason = Column(String, nullable=True)


class Topic(Base):
    __tablename__ = "topics"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    document_count = Column(Integer, default=0)
    mention_count = Column(Integer, default=0)
    keywords = Column(String, default="")
    related_subsidiaries = Column(String, default="")
    related_mines = Column(String, default="")


class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(String, unique=True)
    title = Column(String)
    report_type = Column(String)
    year = Column(Integer)
    subsidiary = Column(String)
    mine = Column(String, nullable=True)
    created_by = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="Generated")
    content = Column(Text, nullable=True)
    source_count = Column(Integer, default=0)
    submitted_by = Column(String, nullable=True)
    submitted_at = Column(DateTime, nullable=True)


class AIQuestion(Base):
    __tablename__ = "ai_questions"
    id = Column(Integer, primary_key=True, index=True)
    question = Column(Text)
    answer = Column(Text)
    sources = Column(Text, default="[]")
    asked_by = Column(String)
    asked_at = Column(DateTime, default=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user = Column(String)
    message = Column(String)
    type = Column(String, default="info")
    read = Column(Boolean, default=False)
    link = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class ActivityHistory(Base):
    __tablename__ = "activity_history"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    user = Column(String)
    action = Column(String)
    page = Column(String, default="")
    item = Column(String, default="")
    status = Column(String, default="Completed")
    details = Column(String, default="")

class AdminQuery(Base):
    __tablename__ = "admin_queries"
    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, index=True)
    query = Column(String)
    action_requested = Column(String)
    source = Column(String, default="Administrator")
    document_name = Column(String)
    date = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="Open")
