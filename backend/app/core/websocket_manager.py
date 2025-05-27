"""
WebSocket connection manager for real-time communication
"""
import json
import logging
from typing import Dict, List, Optional
from fastapi import WebSocket
from datetime import datetime

logger = logging.getLogger(__name__)

class WebSocketManager:
    """Manages WebSocket connections for real-time communication"""
    
    def __init__(self):
        # Store active connections by client_id
        self.active_connections: Dict[str, WebSocket] = {}
        # Store connections by type (admin, student, proctor)
        self.connections_by_type: Dict[str, List[str]] = {
            "admin": [],
            "student": [],
            "proctor": []
        }
    
    async def initialize(self):
        """Initialize the WebSocket manager"""
        logger.info("WebSocket manager initialized")
    
    async def cleanup(self):
        """Cleanup WebSocket connections"""
        for client_id in list(self.active_connections.keys()):
            await self.disconnect(client_id)
        logger.info("WebSocket manager cleaned up")
    
    async def connect(self, websocket: WebSocket, client_type: str, client_id: str):
        """Accept a new WebSocket connection"""
        await websocket.accept()
        self.active_connections[client_id] = websocket
        
        if client_type not in self.connections_by_type:
            self.connections_by_type[client_type] = []
        
        if client_id not in self.connections_by_type[client_type]:
            self.connections_by_type[client_type].append(client_id)
        
        logger.info(f"Client {client_id} ({client_type}) connected")
    
    async def disconnect(self, client_id: str):
        """Remove a WebSocket connection"""
        if client_id in self.active_connections:
            # Remove from active connections
            del self.active_connections[client_id]
            
            # Remove from type-based connections
            for client_type, clients in self.connections_by_type.items():
                if client_id in clients:
                    clients.remove(client_id)
                    break
            
            logger.info(f"Client {client_id} disconnected")
    
    async def send_personal_message(self, client_id: str, message: dict):
        """Send a message to a specific client"""
        if client_id in self.active_connections:
            try:
                websocket = self.active_connections[client_id]
                await websocket.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error sending message to {client_id}: {str(e)}")
                await self.disconnect(client_id)
    
    async def broadcast_to_type(self, client_type: str, message: dict):
        """Broadcast a message to all clients of a specific type"""
        if client_type in self.connections_by_type:
            clients = self.connections_by_type[client_type].copy()
            for client_id in clients:
                await self.send_personal_message(client_id, message)
    
    async def broadcast_to_all(self, message: dict):
        """Broadcast a message to all connected clients"""
        clients = list(self.active_connections.keys())
        for client_id in clients:
            await self.send_personal_message(client_id, message)
    
    def get_connected_clients(self, client_type: Optional[str] = None) -> List[str]:
        """Get list of connected clients, optionally filtered by type"""
        if client_type:
            return self.connections_by_type.get(client_type, [])
        return list(self.active_connections.keys())
    
    def get_connection_count(self, client_type: Optional[str] = None) -> int:
        """Get count of connected clients, optionally filtered by type"""
        if client_type:
            return len(self.connections_by_type.get(client_type, []))
        return len(self.active_connections)
