"""
File Upload Service for 360° Proctor
Handles file uploads for exam materials, result attachments, and user avatars
"""

import os
import uuid
import shutil
import logging
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from pathlib import Path
from fastapi import UploadFile, HTTPException
from PIL import Image
import aiofiles

from app.core.config import settings

logger = logging.getLogger(__name__)

class FileUploadService:
    """Service for handling file uploads with validation and processing"""
    
    def __init__(self):
        self.upload_dir = Path(settings.UPLOAD_DIR)
        self.max_file_size = settings.MAX_FILE_SIZE
        self.allowed_extensions = {
            'images': {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'},
            'documents': {'.pdf', '.doc', '.docx', '.txt', '.rtf'},
            'archives': {'.zip', '.rar', '.7z', '.tar', '.gz'},
            'videos': {'.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'},
            'audio': {'.mp3', '.wav', '.ogg', '.m4a', '.aac'}
        }
        self._ensure_upload_directories()
    
    def _ensure_upload_directories(self):
        """Create upload directories if they don't exist"""
        directories = [
            'exam_materials',
            'result_attachments',
            'user_avatars',
            'session_recordings',
            'violation_screenshots',
            'temp'
        ]
        
        for directory in directories:
            dir_path = self.upload_dir / directory
            dir_path.mkdir(parents=True, exist_ok=True)
    
    def _validate_file(self, file: UploadFile, allowed_types: List[str] = None) -> bool:
        """Validate uploaded file"""
        # Check file size
        if hasattr(file, 'size') and file.size > self.max_file_size:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size: {self.max_file_size / 1024 / 1024:.1f}MB"
            )
        
        # Check file extension
        if file.filename:
            file_ext = Path(file.filename).suffix.lower()
            
            if allowed_types:
                allowed_extensions = set()
                for file_type in allowed_types:
                    allowed_extensions.update(self.allowed_extensions.get(file_type, set()))
                
                if file_ext not in allowed_extensions:
                    raise HTTPException(
                        status_code=400,
                        detail=f"File type not allowed. Allowed types: {', '.join(allowed_extensions)}"
                    )
        
        return True
    
    def _generate_unique_filename(self, original_filename: str) -> str:
        """Generate a unique filename while preserving extension"""
        file_ext = Path(original_filename).suffix.lower()
        unique_id = str(uuid.uuid4())
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        return f"{timestamp}_{unique_id}{file_ext}"
    
    async def upload_exam_material(
        self, 
        file: UploadFile, 
        exam_id: int, 
        uploaded_by: int,
        description: Optional[str] = None
    ) -> Dict[str, Any]:
        """Upload exam material file"""
        try:
            # Validate file
            self._validate_file(file, ['documents', 'images', 'archives'])
            
            # Generate unique filename
            unique_filename = self._generate_unique_filename(file.filename)
            file_path = self.upload_dir / 'exam_materials' / unique_filename
            
            # Save file
            async with aiofiles.open(file_path, 'wb') as f:
                content = await file.read()
                await f.write(content)
            
            # Create file record
            file_info = {
                "id": str(uuid.uuid4()),
                "original_filename": file.filename,
                "stored_filename": unique_filename,
                "file_path": str(file_path),
                "file_size": len(content),
                "content_type": file.content_type,
                "exam_id": exam_id,
                "uploaded_by": uploaded_by,
                "description": description,
                "upload_timestamp": datetime.now(timezone.utc).isoformat(),
                "file_type": "exam_material"
            }
            
            logger.info(f"Exam material uploaded: {file.filename} for exam {exam_id}")
            return file_info
            
        except Exception as e:
            logger.error(f"Error uploading exam material: {e}")
            raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
    
    async def upload_user_avatar(
        self, 
        file: UploadFile, 
        user_id: int,
        resize: bool = True
    ) -> Dict[str, Any]:
        """Upload and process user avatar"""
        try:
            # Validate image file
            self._validate_file(file, ['images'])
            
            # Generate unique filename
            unique_filename = self._generate_unique_filename(file.filename)
            file_path = self.upload_dir / 'user_avatars' / unique_filename
            
            # Save and process image
            content = await file.read()
            
            if resize:
                # Resize image to standard avatar size
                temp_path = self.upload_dir / 'temp' / f"temp_{unique_filename}"
                
                async with aiofiles.open(temp_path, 'wb') as f:
                    await f.write(content)
                
                # Resize using PIL
                with Image.open(temp_path) as img:
                    # Convert to RGB if necessary
                    if img.mode in ('RGBA', 'LA', 'P'):
                        img = img.convert('RGB')
                    
                    # Resize to 200x200
                    img = img.resize((200, 200), Image.Resampling.LANCZOS)
                    img.save(file_path, 'JPEG', quality=85)
                
                # Clean up temp file
                temp_path.unlink()
            else:
                async with aiofiles.open(file_path, 'wb') as f:
                    await f.write(content)
            
            file_info = {
                "id": str(uuid.uuid4()),
                "original_filename": file.filename,
                "stored_filename": unique_filename,
                "file_path": str(file_path),
                "file_size": file_path.stat().st_size,
                "content_type": "image/jpeg" if resize else file.content_type,
                "user_id": user_id,
                "upload_timestamp": datetime.now(timezone.utc).isoformat(),
                "file_type": "user_avatar",
                "processed": resize
            }
            
            logger.info(f"User avatar uploaded for user {user_id}")
            return file_info
            
        except Exception as e:
            logger.error(f"Error uploading user avatar: {e}")
            raise HTTPException(status_code=500, detail=f"Avatar upload failed: {str(e)}")
    
    async def upload_violation_screenshot(
        self, 
        file: UploadFile, 
        session_id: str, 
        violation_id: str,
        timestamp: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Upload violation screenshot"""
        try:
            # Validate image file
            self._validate_file(file, ['images'])
            
            # Generate unique filename with session info
            file_ext = Path(file.filename).suffix.lower()
            timestamp_str = (timestamp or datetime.now(timezone.utc)).strftime("%Y%m%d_%H%M%S")
            unique_filename = f"violation_{session_id}_{violation_id}_{timestamp_str}{file_ext}"
            file_path = self.upload_dir / 'violation_screenshots' / unique_filename
            
            # Save file
            async with aiofiles.open(file_path, 'wb') as f:
                content = await file.read()
                await f.write(content)
            
            file_info = {
                "id": str(uuid.uuid4()),
                "original_filename": file.filename,
                "stored_filename": unique_filename,
                "file_path": str(file_path),
                "file_size": len(content),
                "content_type": file.content_type,
                "session_id": session_id,
                "violation_id": violation_id,
                "upload_timestamp": datetime.now(timezone.utc).isoformat(),
                "file_type": "violation_screenshot"
            }
            
            logger.info(f"Violation screenshot uploaded for session {session_id}")
            return file_info
            
        except Exception as e:
            logger.error(f"Error uploading violation screenshot: {e}")
            raise HTTPException(status_code=500, detail=f"Screenshot upload failed: {str(e)}")
    
    async def upload_session_recording(
        self, 
        file: UploadFile, 
        session_id: str, 
        recording_type: str = "video"
    ) -> Dict[str, Any]:
        """Upload session recording (video/audio)"""
        try:
            # Validate file type
            allowed_types = ['videos'] if recording_type == "video" else ['audio']
            self._validate_file(file, allowed_types)
            
            # Generate unique filename
            file_ext = Path(file.filename).suffix.lower()
            timestamp_str = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
            unique_filename = f"recording_{session_id}_{recording_type}_{timestamp_str}{file_ext}"
            file_path = self.upload_dir / 'session_recordings' / unique_filename
            
            # Save file
            async with aiofiles.open(file_path, 'wb') as f:
                content = await file.read()
                await f.write(content)
            
            file_info = {
                "id": str(uuid.uuid4()),
                "original_filename": file.filename,
                "stored_filename": unique_filename,
                "file_path": str(file_path),
                "file_size": len(content),
                "content_type": file.content_type,
                "session_id": session_id,
                "recording_type": recording_type,
                "upload_timestamp": datetime.now(timezone.utc).isoformat(),
                "file_type": "session_recording"
            }
            
            logger.info(f"Session recording uploaded for session {session_id}")
            return file_info
            
        except Exception as e:
            logger.error(f"Error uploading session recording: {e}")
            raise HTTPException(status_code=500, detail=f"Recording upload failed: {str(e)}")
    
    def delete_file(self, file_path: str) -> bool:
        """Delete a file from storage"""
        try:
            path = Path(file_path)
            if path.exists() and path.is_file():
                path.unlink()
                logger.info(f"File deleted: {file_path}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error deleting file {file_path}: {e}")
            return False
    
    def get_file_info(self, file_path: str) -> Optional[Dict[str, Any]]:
        """Get file information"""
        try:
            path = Path(file_path)
            if path.exists() and path.is_file():
                stat = path.stat()
                return {
                    "file_path": str(path),
                    "file_size": stat.st_size,
                    "created_at": datetime.fromtimestamp(stat.st_ctime, timezone.utc).isoformat(),
                    "modified_at": datetime.fromtimestamp(stat.st_mtime, timezone.utc).isoformat(),
                    "exists": True
                }
            return {"exists": False}
        except Exception as e:
            logger.error(f"Error getting file info for {file_path}: {e}")
            return {"exists": False, "error": str(e)}
    
    def cleanup_temp_files(self, older_than_hours: int = 24) -> int:
        """Clean up temporary files older than specified hours"""
        try:
            temp_dir = self.upload_dir / 'temp'
            if not temp_dir.exists():
                return 0
            
            cutoff_time = datetime.now(timezone.utc).timestamp() - (older_than_hours * 3600)
            deleted_count = 0
            
            for file_path in temp_dir.iterdir():
                if file_path.is_file() and file_path.stat().st_mtime < cutoff_time:
                    file_path.unlink()
                    deleted_count += 1
            
            logger.info(f"Cleaned up {deleted_count} temporary files")
            return deleted_count
            
        except Exception as e:
            logger.error(f"Error cleaning up temp files: {e}")
            return 0

# Global instance
file_upload_service = FileUploadService()
