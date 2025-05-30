"""Real-time Analytics Service

Provides real-time analytics functionality for the auto-proctoring system via WebSockets.
This service handles:
- Live session monitoring
- Real-time violation tracking
- Trust score trend analysis
- Active user monitoring
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Set
from fastapi import WebSocket

from app.db.session import SessionLocal
from app.db.models.user import User, UserRole
from app.db.models.exam import Exam, ExamSession, Alert, AlertType, AlertSeverity
from app.services import analytics_service

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class RealTimeAnalyticsService:
    """Service for real-time analytics via WebSockets"""
    
    def __init__(self):
        """Initialize the real-time analytics service"""
        self.active_connections: Dict[str, WebSocket] = {}
        self.client_subscriptions: Dict[str, Set[str]] = {}
        self.update_interval = 5  # seconds between updates
        self.update_task = None
    
    async def connect(self, websocket: WebSocket, client_id: str) -> None:
        """Connect a client to the real-time analytics service
        
        Args:
            websocket: The WebSocket connection
            client_id: Unique identifier for the client
        """
        await websocket.accept()
        self.active_connections[client_id] = websocket
        self.client_subscriptions[client_id] = set(["overview"])  # Default subscription
        
        logger.info(f"Client {client_id} connected to real-time analytics")
        
        # Send welcome message
        await self.send_message(client_id, {
            "type": "connection_established",
            "message": "Connected to real-time analytics service",
            "timestamp": datetime.utcnow().isoformat()
        })
        
        # Start the update task if not already running
        if self.update_task is None or self.update_task.done():
            self.update_task = asyncio.create_task(self.periodic_updates())
    
    async def disconnect(self, client_id: str) -> None:
        """Disconnect a client from the real-time analytics service
        
        Args:
            client_id: Unique identifier for the client
        """
        if client_id in self.active_connections:
            del self.active_connections[client_id]
        
        if client_id in self.client_subscriptions:
            del self.client_subscriptions[client_id]
        
        logger.info(f"Client {client_id} disconnected from real-time analytics")
        
        # Stop the update task if no more connections
        if not self.active_connections and self.update_task and not self.update_task.done():
            self.update_task.cancel()
            self.update_task = None
    
    async def handle_message(self, client_id: str, message: Dict[str, Any]) -> None:
        """Handle incoming messages from clients
        
        Args:
            client_id: Unique identifier for the client
            message: The message received from the client
        """
        message_type = message.get("type", "")
        
        if message_type == "subscribe":
            # Handle subscription requests
            topics = message.get("topics", [])
            if client_id in self.client_subscriptions:
                for topic in topics:
                    self.client_subscriptions[client_id].add(topic)
            
            await self.send_message(client_id, {
                "type": "subscription_updated",
                "subscribed_topics": list(self.client_subscriptions.get(client_id, set())),
                "timestamp": datetime.utcnow().isoformat()
            })
        
        elif message_type == "unsubscribe":
            # Handle unsubscription requests
            topics = message.get("topics", [])
            if client_id in self.client_subscriptions:
                for topic in topics:
                    self.client_subscriptions[client_id].discard(topic)
            
            await self.send_message(client_id, {
                "type": "subscription_updated",
                "subscribed_topics": list(self.client_subscriptions.get(client_id, set())),
                "timestamp": datetime.utcnow().isoformat()
            })
        
        elif message_type == "request_data":
            # Handle immediate data requests
            topics = message.get("topics", [])
            await self.send_analytics_update(client_id, topics)
        
        elif message_type == "heartbeat":
            # Handle heartbeat messages
            await self.send_message(client_id, {
                "type": "heartbeat_response",
                "timestamp": datetime.utcnow().isoformat()
            })
        
        else:
            # Handle unknown message types
            logger.warning(f"Unknown message type from client {client_id}: {message_type}")
            await self.send_message(client_id, {
                "type": "error",
                "message": f"Unknown message type: {message_type}",
                "timestamp": datetime.utcnow().isoformat()
            })
    
    async def send_message(self, client_id: str, message: Dict[str, Any]) -> None:
        """Send a message to a specific client
        
        Args:
            client_id: Unique identifier for the client
            message: The message to send
        """
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_json(message)
            except Exception as e:
                logger.error(f"Error sending message to client {client_id}: {str(e)}")
                # Handle disconnection
                await self.disconnect(client_id)
    
    async def broadcast_message(self, message: Dict[str, Any], topic: Optional[str] = None) -> None:
        """Broadcast a message to all connected clients or those subscribed to a topic
        
        Args:
            message: The message to broadcast
            topic: Optional topic filter for broadcasting
        """
        for client_id, websocket in list(self.active_connections.items()):
            # Check if client is subscribed to the topic (if specified)
            if topic is None or (client_id in self.client_subscriptions and 
                               topic in self.client_subscriptions[client_id]):
                try:
                    await websocket.send_json(message)
                except Exception as e:
                    logger.error(f"Error broadcasting to client {client_id}: {str(e)}")
                    # Handle disconnection
                    await self.disconnect(client_id)
    
    async def periodic_updates(self) -> None:
        """Send periodic analytics updates to connected clients"""
        while True:
            try:
                # Get all unique topics across all clients
                all_topics = set()
                for subscriptions in self.client_subscriptions.values():
                    all_topics.update(subscriptions)
                
                # Prepare data for each topic
                topic_data = {}
                db = SessionLocal()
                try:
                    # Only fetch data for topics that have subscribers
                    if "overview" in all_topics:
                        topic_data["overview"] = self._get_overview_data(db)
                    
                    if "violations" in all_topics:
                        topic_data["violations"] = self._get_violations_data(db)
                    
                    if "trust_scores" in all_topics:
                        topic_data["trust_scores"] = self._get_trust_scores_data(db)
                    
                    if "active_sessions" in all_topics:
                        topic_data["active_sessions"] = self._get_active_sessions_data(db)
                finally:
                    db.close()
                
                # Send updates to each client based on their subscriptions
                for client_id, subscriptions in list(self.client_subscriptions.items()):
                    client_update = {
                        "type": "analytics_update",
                        "timestamp": datetime.utcnow().isoformat(),
                        "data": {}
                    }
                    
                    # Add data for each topic the client is subscribed to
                    for topic in subscriptions:
                        if topic in topic_data:
                            client_update["data"][topic] = topic_data[topic]
                    
                    # Only send if there's data to send
                    if client_update["data"]:
                        await self.send_message(client_id, client_update)
            
            except Exception as e:
                logger.error(f"Error in periodic updates: {str(e)}")
            
            # Wait for the next update interval
            await asyncio.sleep(self.update_interval)
    
    async def send_analytics_update(self, client_id: str, topics: List[str]) -> None:
        """Send an immediate analytics update to a specific client
        
        Args:
            client_id: Unique identifier for the client
            topics: List of topics to include in the update
        """
        if not topics:
            # Use client's subscriptions if no topics specified
            topics = list(self.client_subscriptions.get(client_id, set()))
        
        # Prepare data for requested topics
        topic_data = {}
        db = SessionLocal()
        try:
            for topic in topics:
                if topic == "overview":
                    topic_data[topic] = self._get_overview_data(db)
                elif topic == "violations":
                    topic_data[topic] = self._get_violations_data(db)
                elif topic == "trust_scores":
                    topic_data[topic] = self._get_trust_scores_data(db)
                elif topic == "active_sessions":
                    topic_data[topic] = self._get_active_sessions_data(db)
        finally:
            db.close()
        
        # Send the update
        await self.send_message(client_id, {
            "type": "analytics_update",
            "timestamp": datetime.utcnow().isoformat(),
            "data": topic_data
        })
    
    def _get_overview_data(self, db) -> Dict[str, Any]:
        """Get overview analytics data
        
        Args:
            db: Database session
            
        Returns:
            Dictionary with overview analytics
        """
        # Get real-time metrics from analytics service
        return analytics_service.get_real_time_metrics(db)
    
    def _get_violations_data(self, db) -> Dict[str, Any]:
        """Get violations analytics data
        
        Args:
            db: Database session
            
        Returns:
            Dictionary with violations analytics
        """
        # Get recent violations (last hour)
        recent_time = datetime.utcnow() - timedelta(hours=1)
        recent_violations = db.query(Alert).filter(
            Alert.created_at >= recent_time
        ).order_by(Alert.created_at.desc()).limit(50).all()
        
        violations_data = [
            {
                "id": v.id,
                "session_id": v.exam_session_id,
                "type": str(v.alert_type),
                "severity": str(v.severity),
                "description": v.description,
                "trust_score_impact": v.trust_score_impact,
                "timestamp": v.created_at.isoformat() if v.created_at else None
            }
            for v in recent_violations
        ]
        
        # Get violation types distribution
        violation_types = db.query(
            Alert.alert_type,
            func.count(Alert.id).label('count')
        ).filter(
            Alert.created_at >= recent_time
        ).group_by(Alert.alert_type).all()
        
        type_distribution = {
            str(v_type.alert_type): v_type.count 
            for v_type in violation_types
        }
        
        return {
            "recent": violations_data,
            "distribution": type_distribution,
            "total_last_hour": len(violations_data)
        }
    
    def _get_trust_scores_data(self, db) -> Dict[str, Any]:
        """Get trust scores analytics data
        
        Args:
            db: Database session
            
        Returns:
            Dictionary with trust scores analytics
        """
        # Get active sessions with their trust scores
        active_sessions = db.query(ExamSession).filter(
            ExamSession.is_completed == False,
            ExamSession.start_time.isnot(None)
        ).all()
        
        trust_scores = [
            {
                "session_id": session.id,
                "student_id": session.student_id,
                "exam_id": session.exam_id,
                "current_score": session.current_trust_score,
                "initial_score": session.initial_trust_score
            }
            for session in active_sessions
        ]
        
        # Calculate average trust score
        avg_score = db.query(func.avg(ExamSession.current_trust_score)).filter(
            ExamSession.is_completed == False,
            ExamSession.start_time.isnot(None),
            ExamSession.current_trust_score.isnot(None)
        ).scalar() or 0.0
        
        # Get trust score distribution
        ranges = [
            (0.9, 1.0, "90-100%"),
            (0.8, 0.9, "80-89%"),
            (0.7, 0.8, "70-79%"),
            (0.6, 0.7, "60-69%"),
            (0.0, 0.6, "0-59%")
        ]
        
        distribution = []
        for min_score, max_score, label in ranges:
            count = db.query(ExamSession).filter(
                ExamSession.is_completed == False,
                ExamSession.current_trust_score >= min_score,
                ExamSession.current_trust_score < max_score
            ).count()
            
            distribution.append({
                "range": label,
                "count": count
            })
        
        return {
            "scores": trust_scores,
            "average": float(avg_score),
            "distribution": distribution
        }
    
    def _get_active_sessions_data(self, db) -> Dict[str, Any]:
        """Get active sessions analytics data
        
        Args:
            db: Database session
            
        Returns:
            Dictionary with active sessions analytics
        """
        # Get active sessions with exam and student info
        active_sessions = db.query(
            ExamSession.id,
            ExamSession.start_time,
            ExamSession.current_trust_score,
            User.full_name.label('student_name'),
            Exam.title.label('exam_title'),
            func.count(Alert.id).label('violation_count')
        ).join(User, User.id == ExamSession.student_id)\
        .join(Exam, Exam.id == ExamSession.exam_id)\
        .outerjoin(Alert, Alert.exam_session_id == ExamSession.id)\
        .filter(
            ExamSession.is_completed == False,
            ExamSession.start_time.isnot(None)
        ).group_by(
            ExamSession.id,
            ExamSession.start_time,
            ExamSession.current_trust_score,
            User.full_name,
            Exam.title
        ).all()
        
        sessions_data = [
            {
                "session_id": session.id,
                "student_name": session.student_name,
                "exam_title": session.exam_title,
                "start_time": session.start_time.isoformat() if session.start_time else None,
                "duration": (datetime.utcnow() - session.start_time).total_seconds() // 60 if session.start_time else 0,
                "trust_score": session.current_trust_score,
                "violation_count": session.violation_count
            }
            for session in active_sessions
        ]
        
        return {
            "sessions": sessions_data,
            "count": len(sessions_data),
            "timestamp": datetime.utcnow().isoformat()
        }


# Global instance
realtime_analytics_service = RealTimeAnalyticsService()