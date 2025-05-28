"""
File Upload API Endpoints for 360° Proctor
Handles file uploads for exam materials, user avatars, and attachments
"""

import logging
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.services.file_upload_service import file_upload_service
from app.db.models.user import User
from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/exam-materials/{exam_id}")
async def upload_exam_material(
    exam_id: int,
    file: UploadFile = File(...),
    description: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload exam material file
    
    - **exam_id**: ID of the exam
    - **file**: File to upload (documents, images, archives)
    - **description**: Optional description of the file
    """
    try:
        # Check if user has permission to upload exam materials
        if current_user.role not in ["admin", "teacher"]:
            raise HTTPException(
                status_code=403,
                detail="Only admins and teachers can upload exam materials"
            )
        
        # Upload file
        file_info = await file_upload_service.upload_exam_material(
            file=file,
            exam_id=exam_id,
            uploaded_by=current_user.id,
            description=description
        )
        
        return {
            "message": "Exam material uploaded successfully",
            "file_info": file_info
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading exam material: {e}")
        raise HTTPException(status_code=500, detail="Upload failed")

@router.post("/user-avatar")
async def upload_user_avatar(
    file: UploadFile = File(...),
    resize: bool = Form(True),
    current_user: User = Depends(get_current_user)
):
    """
    Upload user avatar
    
    - **file**: Image file to upload
    - **resize**: Whether to resize image to standard avatar size (default: true)
    """
    try:
        # Upload and process avatar
        file_info = await file_upload_service.upload_user_avatar(
            file=file,
            user_id=current_user.id,
            resize=resize
        )
        
        return {
            "message": "Avatar uploaded successfully",
            "file_info": file_info
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading avatar: {e}")
        raise HTTPException(status_code=500, detail="Avatar upload failed")

@router.post("/violation-screenshot/{session_id}")
async def upload_violation_screenshot(
    session_id: str,
    violation_id: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Upload violation screenshot
    
    - **session_id**: ID of the exam session
    - **violation_id**: ID of the violation
    - **file**: Screenshot image file
    """
    try:
        # Check if user has permission (admin, teacher, or proctor)
        if current_user.role not in ["admin", "teacher", "proctor"]:
            raise HTTPException(
                status_code=403,
                detail="Only admins, teachers, and proctors can upload violation screenshots"
            )
        
        # Upload screenshot
        file_info = await file_upload_service.upload_violation_screenshot(
            file=file,
            session_id=session_id,
            violation_id=violation_id
        )
        
        return {
            "message": "Violation screenshot uploaded successfully",
            "file_info": file_info
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading violation screenshot: {e}")
        raise HTTPException(status_code=500, detail="Screenshot upload failed")

@router.post("/session-recording/{session_id}")
async def upload_session_recording(
    session_id: str,
    recording_type: str = Form("video", regex="^(video|audio)$"),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Upload session recording
    
    - **session_id**: ID of the exam session
    - **recording_type**: Type of recording (video or audio)
    - **file**: Recording file
    """
    try:
        # Check if user has permission
        if current_user.role not in ["admin", "teacher"]:
            raise HTTPException(
                status_code=403,
                detail="Only admins and teachers can upload session recordings"
            )
        
        # Upload recording
        file_info = await file_upload_service.upload_session_recording(
            file=file,
            session_id=session_id,
            recording_type=recording_type
        )
        
        return {
            "message": "Session recording uploaded successfully",
            "file_info": file_info
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading session recording: {e}")
        raise HTTPException(status_code=500, detail="Recording upload failed")

@router.post("/bulk-upload/{exam_id}")
async def bulk_upload_exam_materials(
    exam_id: int,
    files: List[UploadFile] = File(...),
    descriptions: Optional[List[str]] = Form(None),
    current_user: User = Depends(get_current_user)
):
    """
    Bulk upload multiple exam materials
    
    - **exam_id**: ID of the exam
    - **files**: List of files to upload
    - **descriptions**: Optional list of descriptions (must match file count)
    """
    try:
        # Check permissions
        if current_user.role not in ["admin", "teacher"]:
            raise HTTPException(
                status_code=403,
                detail="Only admins and teachers can upload exam materials"
            )
        
        # Validate descriptions count if provided
        if descriptions and len(descriptions) != len(files):
            raise HTTPException(
                status_code=400,
                detail="Number of descriptions must match number of files"
            )
        
        # Upload files
        uploaded_files = []
        failed_uploads = []
        
        for i, file in enumerate(files):
            try:
                description = descriptions[i] if descriptions else None
                file_info = await file_upload_service.upload_exam_material(
                    file=file,
                    exam_id=exam_id,
                    uploaded_by=current_user.id,
                    description=description
                )
                uploaded_files.append(file_info)
            except Exception as e:
                failed_uploads.append({
                    "filename": file.filename,
                    "error": str(e)
                })
        
        return {
            "message": f"Bulk upload completed. {len(uploaded_files)} successful, {len(failed_uploads)} failed",
            "uploaded_files": uploaded_files,
            "failed_uploads": failed_uploads
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in bulk upload: {e}")
        raise HTTPException(status_code=500, detail="Bulk upload failed")

@router.get("/download/{file_type}/{filename}")
async def download_file(
    file_type: str,
    filename: str,
    current_user: User = Depends(get_current_user)
):
    """
    Download a file
    
    - **file_type**: Type of file (exam_materials, user_avatars, etc.)
    - **filename**: Name of the file to download
    """
    try:
        # Validate file type
        allowed_types = [
            "exam_materials", "user_avatars", "violation_screenshots", 
            "session_recordings", "result_attachments"
        ]
        
        if file_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Invalid file type")
        
        # Check permissions based on file type
        if file_type in ["violation_screenshots", "session_recordings"]:
            if current_user.role not in ["admin", "teacher", "proctor"]:
                raise HTTPException(
                    status_code=403,
                    detail="Insufficient permissions to download this file type"
                )
        
        # Construct file path
        file_path = settings.UPLOAD_DIR / file_type / filename
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")
        
        return FileResponse(
            path=str(file_path),
            filename=filename,
            media_type='application/octet-stream'
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading file: {e}")
        raise HTTPException(status_code=500, detail="Download failed")

@router.delete("/delete/{file_type}/{filename}")
async def delete_file(
    file_type: str,
    filename: str,
    current_user: User = Depends(get_current_user)
):
    """
    Delete a file
    
    - **file_type**: Type of file
    - **filename**: Name of the file to delete
    """
    try:
        # Check permissions
        if current_user.role not in ["admin", "teacher"]:
            raise HTTPException(
                status_code=403,
                detail="Only admins and teachers can delete files"
            )
        
        # Construct file path
        file_path = settings.UPLOAD_DIR / file_type / filename
        
        # Delete file
        success = file_upload_service.delete_file(str(file_path))
        
        if success:
            return {"message": "File deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="File not found or could not be deleted")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting file: {e}")
        raise HTTPException(status_code=500, detail="Delete failed")

@router.get("/info/{file_type}/{filename}")
async def get_file_info(
    file_type: str,
    filename: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get file information
    
    - **file_type**: Type of file
    - **filename**: Name of the file
    """
    try:
        # Construct file path
        file_path = settings.UPLOAD_DIR / file_type / filename
        
        # Get file info
        file_info = file_upload_service.get_file_info(str(file_path))
        
        return {
            "filename": filename,
            "file_type": file_type,
            **file_info
        }
        
    except Exception as e:
        logger.error(f"Error getting file info: {e}")
        raise HTTPException(status_code=500, detail="Failed to get file info")

@router.post("/cleanup-temp")
async def cleanup_temp_files(
    older_than_hours: int = 24,
    current_user: User = Depends(get_current_user)
):
    """
    Clean up temporary files
    
    - **older_than_hours**: Delete temp files older than this many hours (default: 24)
    """
    try:
        # Check permissions
        if current_user.role != "admin":
            raise HTTPException(
                status_code=403,
                detail="Only admins can cleanup temporary files"
            )
        
        # Cleanup temp files
        deleted_count = file_upload_service.cleanup_temp_files(older_than_hours)
        
        return {
            "message": f"Cleanup completed. {deleted_count} temporary files deleted.",
            "deleted_count": deleted_count
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cleaning up temp files: {e}")
        raise HTTPException(status_code=500, detail="Cleanup failed")

@router.get("/storage-stats")
async def get_storage_stats(
    current_user: User = Depends(get_current_user)
):
    """Get storage statistics"""
    try:
        # Check permissions
        if current_user.role not in ["admin", "teacher"]:
            raise HTTPException(
                status_code=403,
                detail="Only admins and teachers can view storage statistics"
            )
        
        # Calculate storage stats
        upload_dir = settings.UPLOAD_DIR
        stats = {}
        
        for subdir in ["exam_materials", "user_avatars", "violation_screenshots", 
                      "session_recordings", "result_attachments", "temp"]:
            dir_path = upload_dir / subdir
            if dir_path.exists():
                file_count = len(list(dir_path.iterdir()))
                total_size = sum(f.stat().st_size for f in dir_path.iterdir() if f.is_file())
                stats[subdir] = {
                    "file_count": file_count,
                    "total_size_bytes": total_size,
                    "total_size_mb": round(total_size / 1024 / 1024, 2)
                }
            else:
                stats[subdir] = {"file_count": 0, "total_size_bytes": 0, "total_size_mb": 0}
        
        # Calculate totals
        total_files = sum(stat["file_count"] for stat in stats.values())
        total_size_bytes = sum(stat["total_size_bytes"] for stat in stats.values())
        
        return {
            "storage_stats": stats,
            "totals": {
                "total_files": total_files,
                "total_size_bytes": total_size_bytes,
                "total_size_mb": round(total_size_bytes / 1024 / 1024, 2),
                "total_size_gb": round(total_size_bytes / 1024 / 1024 / 1024, 2)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting storage stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get storage statistics")
