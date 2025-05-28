"""
Email Notification Service for 360° Proctor
Handles automated email alerts for exam events, violations, and notifications
"""

import smtplib
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from pathlib import Path
import asyncio
from jinja2 import Template

from app.core.config import settings

logger = logging.getLogger(__name__)

class EmailNotificationService:
    """Service for sending email notifications"""
    
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.SMTP_USER
        self.enabled = bool(self.smtp_user and self.smtp_password)
        
        # Email templates
        self.templates = {
            'violation_alert': self._get_violation_alert_template(),
            'exam_started': self._get_exam_started_template(),
            'exam_completed': self._get_exam_completed_template(),
            'trust_score_low': self._get_trust_score_alert_template(),
            'session_flagged': self._get_session_flagged_template(),
            'exam_reminder': self._get_exam_reminder_template()
        }
    
    def _get_violation_alert_template(self) -> str:
        """Get violation alert email template"""
        return """
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #e74c3c;">🚨 Violation Alert - 360° Proctor</h2>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3>Violation Details</h3>
                    <p><strong>Student:</strong> {{ student_name }} ({{ student_email }})</p>
                    <p><strong>Exam:</strong> {{ exam_title }}</p>
                    <p><strong>Session ID:</strong> {{ session_id }}</p>
                    <p><strong>Violation Type:</strong> {{ violation_type }}</p>
                    <p><strong>Severity:</strong> {{ severity }}</p>
                    <p><strong>Time:</strong> {{ timestamp }}</p>
                    <p><strong>Description:</strong> {{ description }}</p>
                </div>
                
                <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3>Current Trust Score</h3>
                    <p style="font-size: 24px; font-weight: bold; color: {{ trust_score_color }};">
                        {{ trust_score }}%
                    </p>
                </div>
                
                <p>Please review the session immediately and take appropriate action if necessary.</p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="font-size: 12px; color: #666;">
                        This is an automated message from 360° Proctor System.<br>
                        Generated at {{ current_time }}
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
    
    def _get_exam_started_template(self) -> str:
        """Get exam started notification template"""
        return """
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #28a745;">✅ Exam Started - 360° Proctor</h2>
                
                <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3>Exam Session Details</h3>
                    <p><strong>Student:</strong> {{ student_name }} ({{ student_email }})</p>
                    <p><strong>Exam:</strong> {{ exam_title }}</p>
                    <p><strong>Session ID:</strong> {{ session_id }}</p>
                    <p><strong>Start Time:</strong> {{ start_time }}</p>
                    <p><strong>Duration:</strong> {{ duration }} minutes</p>
                    <p><strong>Expected End Time:</strong> {{ expected_end_time }}</p>
                </div>
                
                <p>The student has successfully started the exam. Proctoring is now active.</p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="font-size: 12px; color: #666;">
                        This is an automated message from 360° Proctor System.<br>
                        Generated at {{ current_time }}
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
    
    def _get_exam_completed_template(self) -> str:
        """Get exam completed notification template"""
        return """
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #17a2b8;">📋 Exam Completed - 360° Proctor</h2>
                
                <div style="background-color: #d1ecf1; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3>Exam Session Summary</h3>
                    <p><strong>Student:</strong> {{ student_name }} ({{ student_email }})</p>
                    <p><strong>Exam:</strong> {{ exam_title }}</p>
                    <p><strong>Session ID:</strong> {{ session_id }}</p>
                    <p><strong>Start Time:</strong> {{ start_time }}</p>
                    <p><strong>End Time:</strong> {{ end_time }}</p>
                    <p><strong>Duration:</strong> {{ actual_duration }} minutes</p>
                </div>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3>Proctoring Summary</h3>
                    <p><strong>Final Trust Score:</strong> 
                        <span style="font-size: 18px; font-weight: bold; color: {{ trust_score_color }};">
                            {{ final_trust_score }}%
                        </span>
                    </p>
                    <p><strong>Total Violations:</strong> {{ total_violations }}</p>
                    <p><strong>Violation Types:</strong> {{ violation_types }}</p>
                </div>
                
                <p>The exam has been completed. Please review the session details and proctoring report.</p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="font-size: 12px; color: #666;">
                        This is an automated message from 360° Proctor System.<br>
                        Generated at {{ current_time }}
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
    
    def _get_trust_score_alert_template(self) -> str:
        """Get trust score alert template"""
        return """
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #fd7e14;">⚠️ Low Trust Score Alert - 360° Proctor</h2>
                
                <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3>Alert Details</h3>
                    <p><strong>Student:</strong> {{ student_name }} ({{ student_email }})</p>
                    <p><strong>Exam:</strong> {{ exam_title }}</p>
                    <p><strong>Session ID:</strong> {{ session_id }}</p>
                    <p><strong>Current Trust Score:</strong> 
                        <span style="font-size: 20px; font-weight: bold; color: #dc3545;">
                            {{ trust_score }}%
                        </span>
                    </p>
                    <p><strong>Threshold:</strong> {{ threshold }}%</p>
                    <p><strong>Time:</strong> {{ timestamp }}</p>
                </div>
                
                <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3>Recent Violations</h3>
                    {% for violation in recent_violations %}
                    <p>• {{ violation.type }} ({{ violation.severity }}) - {{ violation.time }}</p>
                    {% endfor %}
                </div>
                
                <p><strong>Action Required:</strong> The student's trust score has fallen below the acceptable threshold. 
                Please review the session immediately and consider intervention.</p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="font-size: 12px; color: #666;">
                        This is an automated message from 360° Proctor System.<br>
                        Generated at {{ current_time }}
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
    
    def _get_session_flagged_template(self) -> str:
        """Get session flagged template"""
        return """
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #dc3545;">🚩 Session Flagged - 360° Proctor</h2>
                
                <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3>Flagged Session Details</h3>
                    <p><strong>Student:</strong> {{ student_name }} ({{ student_email }})</p>
                    <p><strong>Exam:</strong> {{ exam_title }}</p>
                    <p><strong>Session ID:</strong> {{ session_id }}</p>
                    <p><strong>Flagged By:</strong> {{ flagged_by }}</p>
                    <p><strong>Reason:</strong> {{ reason }}</p>
                    <p><strong>Time:</strong> {{ timestamp }}</p>
                </div>
                
                <p>A proctor has flagged this session for review. Please investigate immediately.</p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="font-size: 12px; color: #666;">
                        This is an automated message from 360° Proctor System.<br>
                        Generated at {{ current_time }}
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
    
    def _get_exam_reminder_template(self) -> str:
        """Get exam reminder template"""
        return """
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #007bff;">📅 Exam Reminder - 360° Proctor</h2>
                
                <div style="background-color: #d1ecf1; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3>Upcoming Exam</h3>
                    <p><strong>Student:</strong> {{ student_name }}</p>
                    <p><strong>Exam:</strong> {{ exam_title }}</p>
                    <p><strong>Scheduled Time:</strong> {{ scheduled_time }}</p>
                    <p><strong>Duration:</strong> {{ duration }} minutes</p>
                    <p><strong>Time Until Exam:</strong> {{ time_until }}</p>
                </div>
                
                <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3>Important Reminders</h3>
                    <ul>
                        <li>Ensure you have a stable internet connection</li>
                        <li>Test your camera and microphone beforehand</li>
                        <li>Find a quiet, well-lit room</li>
                        <li>Have a valid ID ready for verification</li>
                        <li>Close all unnecessary applications</li>
                    </ul>
                </div>
                
                <p>Good luck with your exam!</p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="font-size: 12px; color: #666;">
                        This is an automated message from 360° Proctor System.<br>
                        Generated at {{ current_time }}
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
    
    async def send_email(
        self, 
        to_emails: List[str], 
        subject: str, 
        template_name: str, 
        template_data: Dict[str, Any],
        attachments: Optional[List[str]] = None
    ) -> bool:
        """Send email using template"""
        if not self.enabled:
            logger.warning("Email service not configured. Skipping email send.")
            return False
        
        try:
            # Render template
            template = Template(self.templates.get(template_name, ""))
            template_data['current_time'] = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
            html_content = template.render(**template_data)
            
            # Create message
            msg = MIMEMultipart('alternative')
            msg['From'] = self.from_email
            msg['To'] = ', '.join(to_emails)
            msg['Subject'] = subject
            
            # Add HTML content
            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)
            
            # Add attachments if any
            if attachments:
                for file_path in attachments:
                    if Path(file_path).exists():
                        with open(file_path, 'rb') as attachment:
                            part = MIMEBase('application', 'octet-stream')
                            part.set_payload(attachment.read())
                            encoders.encode_base64(part)
                            part.add_header(
                                'Content-Disposition',
                                f'attachment; filename= {Path(file_path).name}'
                            )
                            msg.attach(part)
            
            # Send email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            
            logger.info(f"Email sent successfully to {', '.join(to_emails)}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending email: {e}")
            return False
    
    async def send_violation_alert(
        self, 
        to_emails: List[str], 
        student_name: str, 
        student_email: str,
        exam_title: str, 
        session_id: str, 
        violation_data: Dict[str, Any]
    ) -> bool:
        """Send violation alert email"""
        trust_score = violation_data.get('trust_score', 100)
        trust_score_color = '#dc3545' if trust_score < 50 else '#fd7e14' if trust_score < 75 else '#28a745'
        
        template_data = {
            'student_name': student_name,
            'student_email': student_email,
            'exam_title': exam_title,
            'session_id': session_id,
            'violation_type': violation_data.get('type', 'Unknown'),
            'severity': violation_data.get('severity', 'Medium'),
            'description': violation_data.get('description', 'Violation detected'),
            'timestamp': violation_data.get('timestamp', datetime.now(timezone.utc).isoformat()),
            'trust_score': trust_score,
            'trust_score_color': trust_score_color
        }
        
        subject = f"🚨 Violation Alert - {student_name} - {exam_title}"
        return await self.send_email(to_emails, subject, 'violation_alert', template_data)
    
    async def send_exam_started_notification(
        self, 
        to_emails: List[str], 
        student_name: str, 
        student_email: str,
        exam_title: str, 
        session_id: str, 
        start_time: datetime,
        duration_minutes: int
    ) -> bool:
        """Send exam started notification"""
        expected_end_time = start_time.replace(microsecond=0) + timedelta(minutes=duration_minutes)
        
        template_data = {
            'student_name': student_name,
            'student_email': student_email,
            'exam_title': exam_title,
            'session_id': session_id,
            'start_time': start_time.strftime("%Y-%m-%d %H:%M:%S UTC"),
            'duration': duration_minutes,
            'expected_end_time': expected_end_time.strftime("%Y-%m-%d %H:%M:%S UTC")
        }
        
        subject = f"✅ Exam Started - {student_name} - {exam_title}"
        return await self.send_email(to_emails, subject, 'exam_started', template_data)

# Global instance
email_notification_service = EmailNotificationService()
