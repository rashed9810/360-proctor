"""
Enhanced Trust Score Calculation Service for 360° Proctor
Calculates and manages trust scores based on various factors
"""

import math
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

from app.services.violation_detection_service import ViolationType, ViolationEvent
from app.db.models.exam import AlertSeverity

logger = logging.getLogger(__name__)

class TrustScoreCategory(Enum):
    """Categories for trust score calculation"""
    EXCELLENT = "excellent"  # 90-100%
    GOOD = "good"           # 75-89%
    FAIR = "fair"           # 60-74%
    POOR = "poor"           # 40-59%
    CRITICAL = "critical"   # 0-39%

@dataclass
class TrustScoreFactors:
    """Factors that influence trust score"""
    base_score: float = 100.0
    violation_penalty: float = 0.0
    consistency_bonus: float = 0.0
    time_penalty: float = 0.0
    behavior_pattern_penalty: float = 0.0
    recovery_bonus: float = 0.0

@dataclass
class TrustScoreResult:
    """Result of trust score calculation"""
    current_score: float
    category: TrustScoreCategory
    factors: TrustScoreFactors
    violations_count: int
    recommendations: List[str]
    trend: str  # "improving", "declining", "stable"

class TrustScoreService:
    """Service for calculating and managing trust scores"""
    
    def __init__(self):
        self.violation_weights = self._load_violation_weights()
        self.score_history = {}  # Track score history per session
        
    def _load_violation_weights(self) -> Dict[ViolationType, float]:
        """Load violation weights for trust score calculation"""
        return {
            ViolationType.FACE_NOT_DETECTED: 0.15,
            ViolationType.MULTIPLE_FACES: 0.25,
            ViolationType.LOOKING_AWAY: 0.10,
            ViolationType.TAB_SWITCH: 0.20,
            ViolationType.WINDOW_BLUR: 0.15,
            ViolationType.AUDIO_DETECTED: 0.12,
            ViolationType.PHONE_DETECTED: 0.30,
            ViolationType.SUSPICIOUS_MOVEMENT: 0.08,
            ViolationType.COPY_PASTE: 0.25,
            ViolationType.RIGHT_CLICK: 0.05,
            ViolationType.FULLSCREEN_EXIT: 0.20
        }
    
    def calculate_trust_score(
        self, 
        session_id: int, 
        violations: List[ViolationEvent],
        exam_duration_minutes: int = 60,
        current_time_minutes: int = 0
    ) -> TrustScoreResult:
        """Calculate comprehensive trust score"""
        
        factors = TrustScoreFactors()
        
        # Calculate violation penalty
        factors.violation_penalty = self._calculate_violation_penalty(violations)
        
        # Calculate consistency bonus
        factors.consistency_bonus = self._calculate_consistency_bonus(violations, current_time_minutes)
        
        # Calculate time-based penalty
        factors.time_penalty = self._calculate_time_penalty(violations, current_time_minutes)
        
        # Calculate behavior pattern penalty
        factors.behavior_pattern_penalty = self._calculate_behavior_pattern_penalty(violations)
        
        # Calculate recovery bonus
        factors.recovery_bonus = self._calculate_recovery_bonus(violations, current_time_minutes)
        
        # Calculate final score
        final_score = max(0.0, min(100.0, 
            factors.base_score 
            - factors.violation_penalty 
            - factors.time_penalty 
            - factors.behavior_pattern_penalty
            + factors.consistency_bonus 
            + factors.recovery_bonus
        ))
        
        # Determine category
        category = self._get_score_category(final_score)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(violations, final_score)
        
        # Calculate trend
        trend = self._calculate_trend(session_id, final_score)
        
        # Store score in history
        self._store_score_history(session_id, final_score)
        
        return TrustScoreResult(
            current_score=final_score,
            category=category,
            factors=factors,
            violations_count=len(violations),
            recommendations=recommendations,
            trend=trend
        )
    
    def _calculate_violation_penalty(self, violations: List[ViolationEvent]) -> float:
        """Calculate penalty based on violations"""
        total_penalty = 0.0
        violation_counts = {}
        
        for violation in violations:
            violation_type = violation.violation_type
            
            # Count violations by type
            violation_counts[violation_type] = violation_counts.get(violation_type, 0) + 1
            
            # Base penalty from violation weight
            base_penalty = self.violation_weights.get(violation_type, 0.1)
            
            # Apply severity multiplier
            severity_multiplier = self._get_severity_multiplier(violation.severity)
            
            # Apply confidence factor
            confidence_factor = violation.confidence
            
            # Apply frequency penalty (more violations of same type = higher penalty)
            frequency_penalty = min(2.0, 1.0 + (violation_counts[violation_type] - 1) * 0.2)
            
            penalty = base_penalty * severity_multiplier * confidence_factor * frequency_penalty
            total_penalty += penalty
        
        return min(80.0, total_penalty * 100)  # Cap at 80 points
    
    def _get_severity_multiplier(self, severity: AlertSeverity) -> float:
        """Get multiplier based on violation severity"""
        multipliers = {
            AlertSeverity.LOW: 0.5,
            AlertSeverity.MEDIUM: 1.0,
            AlertSeverity.HIGH: 1.5,
            AlertSeverity.CRITICAL: 2.0
        }
        return multipliers.get(severity, 1.0)
    
    def _calculate_consistency_bonus(self, violations: List[ViolationEvent], current_time: int) -> float:
        """Calculate bonus for consistent behavior"""
        if not violations or current_time < 10:
            return 0.0
        
        # Calculate violation rate per minute
        violation_rate = len(violations) / max(1, current_time)
        
        # Bonus for low violation rate
        if violation_rate < 0.1:  # Less than 0.1 violations per minute
            return 5.0
        elif violation_rate < 0.2:
            return 2.0
        
        return 0.0
    
    def _calculate_time_penalty(self, violations: List[ViolationEvent], current_time: int) -> float:
        """Calculate penalty based on timing of violations"""
        if not violations:
            return 0.0
        
        recent_violations = [
            v for v in violations 
            if (datetime.utcnow() - v.timestamp).total_seconds() < 300  # Last 5 minutes
        ]
        
        # Penalty for recent violations (indicates current problematic behavior)
        recent_penalty = len(recent_violations) * 2.0
        
        return min(20.0, recent_penalty)  # Cap at 20 points
    
    def _calculate_behavior_pattern_penalty(self, violations: List[ViolationEvent]) -> float:
        """Calculate penalty for suspicious behavior patterns"""
        if len(violations) < 3:
            return 0.0
        
        penalty = 0.0
        
        # Check for rapid succession of violations
        sorted_violations = sorted(violations, key=lambda x: x.timestamp)
        rapid_succession_count = 0
        
        for i in range(1, len(sorted_violations)):
            time_diff = (sorted_violations[i].timestamp - sorted_violations[i-1].timestamp).total_seconds()
            if time_diff < 30:  # Violations within 30 seconds
                rapid_succession_count += 1
        
        if rapid_succession_count > 2:
            penalty += 10.0
        
        # Check for escalating severity
        severity_values = {
            AlertSeverity.LOW: 1,
            AlertSeverity.MEDIUM: 2,
            AlertSeverity.HIGH: 3,
            AlertSeverity.CRITICAL: 4
        }
        
        escalating_count = 0
        for i in range(1, len(sorted_violations)):
            if (severity_values.get(sorted_violations[i].severity, 0) > 
                severity_values.get(sorted_violations[i-1].severity, 0)):
                escalating_count += 1
        
        if escalating_count > len(violations) * 0.5:  # More than 50% escalating
            penalty += 5.0
        
        return min(15.0, penalty)  # Cap at 15 points
    
    def _calculate_recovery_bonus(self, violations: List[ViolationEvent], current_time: int) -> float:
        """Calculate bonus for recovery from violations"""
        if not violations or current_time < 20:
            return 0.0
        
        # Check if student has improved in recent time
        midpoint = current_time / 2
        early_violations = [v for v in violations if (datetime.utcnow() - v.timestamp).total_seconds() > midpoint * 60]
        recent_violations = [v for v in violations if (datetime.utcnow() - v.timestamp).total_seconds() <= midpoint * 60]
        
        if len(early_violations) > len(recent_violations) and len(early_violations) > 2:
            improvement_ratio = (len(early_violations) - len(recent_violations)) / len(early_violations)
            return min(10.0, improvement_ratio * 10.0)  # Up to 10 points bonus
        
        return 0.0
    
    def _get_score_category(self, score: float) -> TrustScoreCategory:
        """Determine trust score category"""
        if score >= 90:
            return TrustScoreCategory.EXCELLENT
        elif score >= 75:
            return TrustScoreCategory.GOOD
        elif score >= 60:
            return TrustScoreCategory.FAIR
        elif score >= 40:
            return TrustScoreCategory.POOR
        else:
            return TrustScoreCategory.CRITICAL
    
    def _generate_recommendations(self, violations: List[ViolationEvent], score: float) -> List[str]:
        """Generate recommendations based on violations and score"""
        recommendations = []
        
        # Count violations by type
        violation_counts = {}
        for violation in violations:
            violation_counts[violation.violation_type] = violation_counts.get(violation.violation_type, 0) + 1
        
        # Generate specific recommendations
        if violation_counts.get(ViolationType.FACE_NOT_DETECTED, 0) > 2:
            recommendations.append("Ensure proper lighting and camera positioning for face detection")
        
        if violation_counts.get(ViolationType.LOOKING_AWAY, 0) > 3:
            recommendations.append("Maintain focus on the screen during the exam")
        
        if violation_counts.get(ViolationType.TAB_SWITCH, 0) > 1:
            recommendations.append("Avoid switching browser tabs during the exam")
        
        if violation_counts.get(ViolationType.AUDIO_DETECTED, 0) > 1:
            recommendations.append("Ensure a quiet environment during the exam")
        
        if violation_counts.get(ViolationType.MULTIPLE_FACES, 0) > 0:
            recommendations.append("Ensure you are alone during the exam")
        
        # General recommendations based on score
        if score < 60:
            recommendations.append("Review exam guidelines and proctoring requirements")
            recommendations.append("Contact support if you're experiencing technical issues")
        elif score < 80:
            recommendations.append("Be more mindful of exam guidelines")
        
        return recommendations
    
    def _calculate_trend(self, session_id: int, current_score: float) -> str:
        """Calculate score trend"""
        if session_id not in self.score_history:
            return "stable"
        
        history = self.score_history[session_id]
        if len(history) < 2:
            return "stable"
        
        recent_scores = history[-3:]  # Last 3 scores
        if len(recent_scores) < 2:
            return "stable"
        
        # Calculate trend
        score_changes = [recent_scores[i] - recent_scores[i-1] for i in range(1, len(recent_scores))]
        avg_change = sum(score_changes) / len(score_changes)
        
        if avg_change > 2:
            return "improving"
        elif avg_change < -2:
            return "declining"
        else:
            return "stable"
    
    def _store_score_history(self, session_id: int, score: float):
        """Store score in history"""
        if session_id not in self.score_history:
            self.score_history[session_id] = []
        
        self.score_history[session_id].append(score)
        
        # Keep only last 20 scores
        if len(self.score_history[session_id]) > 20:
            self.score_history[session_id] = self.score_history[session_id][-20:]
    
    def get_score_history(self, session_id: int) -> List[float]:
        """Get score history for a session"""
        return self.score_history.get(session_id, [])
    
    def get_score_analytics(self, session_id: int) -> Dict[str, Any]:
        """Get detailed analytics for a session's trust score"""
        history = self.get_score_history(session_id)
        
        if not history:
            return {"error": "No score history available"}
        
        analytics = {
            "current_score": history[-1] if history else 0,
            "average_score": sum(history) / len(history),
            "min_score": min(history),
            "max_score": max(history),
            "score_variance": self._calculate_variance(history),
            "trend": self._calculate_trend(session_id, history[-1] if history else 0),
            "stability": "stable" if self._calculate_variance(history) < 100 else "unstable"
        }
        
        return analytics
    
    def _calculate_variance(self, scores: List[float]) -> float:
        """Calculate variance of scores"""
        if len(scores) < 2:
            return 0.0
        
        mean = sum(scores) / len(scores)
        variance = sum((score - mean) ** 2 for score in scores) / len(scores)
        return variance

# Global instance
trust_score_service = TrustScoreService()
