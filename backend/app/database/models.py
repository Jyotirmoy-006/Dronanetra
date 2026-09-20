"""
SQLAlchemy models matching docs/CONTEXT.md Section 13:
engine, telemetry, prediction, alert, mission.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


class EngineModelDB(Base):
    __tablename__ = "engines"

    engine_id = Column(String, primary_key=True, index=True)
    engine_type = Column(String, nullable=False)
    installation_id = Column(String, nullable=False)
    status = Column(String, default="NOMINAL")


class TelemetryDB(Base):
    __tablename__ = "telemetry"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    engine_id = Column(String, ForeignKey("engines.engine_id"))
    rpm = Column(Float)
    egt = Column(Float)
    cht = Column(Float)
    vibration = Column(Float)
    fuel_flow = Column(Float)
    throttle = Column(Float)
    altitude = Column(Float)


class PredictionDB(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    engine_id = Column(String, ForeignKey("engines.engine_id"))
    health_score = Column(Float)
    anomaly_score = Column(Float)
    fault_probability = Column(Float)
    rul = Column(Float)
    confidence = Column(Float)


class AlertDB(Base):
    __tablename__ = "alerts"

    alert_id = Column(String, primary_key=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    severity = Column(String)
    fault_type = Column(String)
    reason = Column(Text)
    confidence = Column(Float)
    status = Column(String, default="ACTIVE")


class MissionDB(Base):
    __tablename__ = "missions"

    mission_id = Column(String, primary_key=True)
    name = Column(String)
    uav_id = Column(String)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    status = Column(String, default="COMPLETED")
