from typing import Dict, List, Set, Tuple
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        # Map of session_id -> set of WebSocket connections
        self.active_connections: Dict[int, Set[Tuple[WebSocket, int]]] = {}
    
    async def connect(self, websocket: WebSocket, session_id: int, user_id: int):
        await websocket.accept()
        if session_id not in self.active_connections:
            self.active_connections[session_id] = set()
        self.active_connections[session_id].add((websocket, user_id))
    
    def disconnect(self, websocket: WebSocket, session_id: int, user_id: int):
        if session_id in self.active_connections:
            self.active_connections[session_id].discard((websocket, user_id))
            if not self.active_connections[session_id]:
                del self.active_connections[session_id]
    
    async def send_message(self, message: dict, session_id: int):
        if session_id in self.active_connections:
            for connection, _ in self.active_connections[session_id]:
                await connection.send_json(message)
    
    async def broadcast(self, message: dict):
        for session_id in self.active_connections:
            await self.send_message(message, session_id)
