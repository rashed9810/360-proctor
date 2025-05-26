from typing import Dict, List, Set, Tuple, Optional
from fastapi import WebSocket
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self):
        # Map of client_id -> WebSocket connection
        self.active_connections: Dict[str, WebSocket] = {}
        # Map of client_type -> set of client_ids
        self.connections_by_type: Dict[str, Set[str]] = {}
        # Map of client_id -> client_type
        self.client_types: Dict[str, str] = {}
        # Map of session_id -> set of client_ids
        self.session_connections: Dict[str, Set[str]] = {}

    async def connect(self, websocket: WebSocket, client_type: str, client_id: str):
        """Connect a new WebSocket client"""
        await websocket.accept()

        # Store connection
        self.active_connections[client_id] = websocket
        self.client_types[client_id] = client_type

        # Add to type-based grouping
        if client_type not in self.connections_by_type:
            self.connections_by_type[client_type] = set()
        self.connections_by_type[client_type].add(client_id)

        logger.info(f"Client connected: {client_type}:{client_id}")

    def disconnect(self, client_id: str):
        """Disconnect a WebSocket client"""
        if client_id in self.active_connections:
            client_type = self.client_types.get(client_id)

            # Remove from active connections
            del self.active_connections[client_id]
            del self.client_types[client_id]

            # Remove from type-based grouping
            if client_type and client_type in self.connections_by_type:
                self.connections_by_type[client_type].discard(client_id)
                if not self.connections_by_type[client_type]:
                    del self.connections_by_type[client_type]

            # Remove from session connections
            for session_id, clients in self.session_connections.items():
                clients.discard(client_id)

            logger.info(f"Client disconnected: {client_type}:{client_id}")

    async def send_personal_message(self, client_id: str, message: dict):
        """Send a message to a specific client"""
        if client_id in self.active_connections:
            try:
                websocket = self.active_connections[client_id]
                await websocket.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error sending message to {client_id}: {str(e)}")
                self.disconnect(client_id)

    async def broadcast_to_type(self, client_type: str, message: dict):
        """Broadcast a message to all clients of a specific type"""
        if client_type in self.connections_by_type:
            clients = self.connections_by_type[client_type].copy()
            for client_id in clients:
                await self.send_personal_message(client_id, message)

    async def broadcast_to_session(self, session_id: str, message: dict):
        """Broadcast a message to all clients in a specific session"""
        if session_id in self.session_connections:
            clients = self.session_connections[session_id].copy()
            for client_id in clients:
                await self.send_personal_message(client_id, message)

    async def broadcast_to_all(self, message: dict):
        """Broadcast a message to all connected clients"""
        clients = list(self.active_connections.keys())
        for client_id in clients:
            await self.send_personal_message(client_id, message)

    def add_to_session(self, client_id: str, session_id: str):
        """Add a client to a session"""
        if session_id not in self.session_connections:
            self.session_connections[session_id] = set()
        self.session_connections[session_id].add(client_id)

    def remove_from_session(self, client_id: str, session_id: str):
        """Remove a client from a session"""
        if session_id in self.session_connections:
            self.session_connections[session_id].discard(client_id)
            if not self.session_connections[session_id]:
                del self.session_connections[session_id]

    def get_connected_clients(self, client_type: Optional[str] = None) -> List[str]:
        """Get list of connected clients, optionally filtered by type"""
        if client_type:
            return list(self.connections_by_type.get(client_type, set()))
        return list(self.active_connections.keys())

    def get_connection_stats(self) -> Dict:
        """Get connection statistics"""
        stats = {
            "total_connections": len(self.active_connections),
            "connections_by_type": {
                client_type: len(clients)
                for client_type, clients in self.connections_by_type.items()
            },
            "active_sessions": len(self.session_connections),
            "timestamp": datetime.utcnow().isoformat()
        }
        return stats
