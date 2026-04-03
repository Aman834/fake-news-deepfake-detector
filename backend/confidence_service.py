"""
Confidence Aggregation Service
Combines multiple detection signals into a unified confidence score.
"""

import logging
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)


class ConfidenceAggregator:
    """Aggregates and weights confidence scores from multiple detection models."""
    
    # Default weights for each detection modality
    DEFAULT_WEIGHTS = {
        "text": 0.30,
        "image": 0.35,
        "video": 0.35,
    }
    
    @staticmethod
    def aggregate(scores: Dict[str, float], weights: Optional[Dict[str, float]] = None) -> dict:
        """
        Aggregate multiple confidence scores into a final weighted score.
        
        Args:
            scores: Dict of {modality: confidence_score}
            weights: Optional custom weights. If not provided, uses defaults.
        
        Returns:
            Dict with final_score, classification, and breakdown.
        """
        if not scores:
            return {
                "final_score": 0.0,
                "classification": "Unknown",
                "confidence_level": "none",
                "breakdown": {}
            }
        
        effective_weights = weights or ConfidenceAggregator.DEFAULT_WEIGHTS
        
        # Normalize weights for available modalities
        available = {k: v for k, v in effective_weights.items() if k in scores}
        total_weight = sum(available.values())
        
        if total_weight == 0:
            # Equal weighting fallback
            n = len(scores)
            normalized = {k: 1.0 / n for k in scores}
        else:
            normalized = {k: v / total_weight for k, v in available.items()}
        
        # Compute weighted average
        final_score = sum(scores[k] * normalized[k] for k in normalized)
        
        # Classification
        if final_score >= 0.8:
            classification = "Highly Likely Fake/Manipulated"
            confidence_level = "high"
        elif final_score >= 0.5:
            classification = "Possibly Fake/Manipulated"
            confidence_level = "medium"
        elif final_score >= 0.3:
            classification = "Likely Authentic"
            confidence_level = "low"
        else:
            classification = "Authentic"
            confidence_level = "very_low"
        
        return {
            "final_score": round(final_score, 4),
            "classification": classification,
            "confidence_level": confidence_level,
            "breakdown": {
                k: {
                    "score": round(scores[k], 4),
                    "weight": round(normalized.get(k, 0), 4),
                    "weighted_contribution": round(scores[k] * normalized.get(k, 0), 4)
                }
                for k in scores
            }
        }
    
    @staticmethod
    def aggregate_frame_scores(frame_scores: List[float]) -> dict:
        """
        Aggregate frame-level scores for video analysis.
        
        Returns statistics about the detection across frames.
        """
        if not frame_scores:
            return {
                "mean_score": 0.0,
                "max_score": 0.0,
                "min_score": 0.0,
                "fake_frame_ratio": 0.0,
                "total_frames": 0,
                "fake_frames": 0
            }
        
        n = len(frame_scores)
        mean_score = sum(frame_scores) / n
        fake_frames = sum(1 for s in frame_scores if s >= 0.5)
        
        return {
            "mean_score": round(mean_score, 4),
            "max_score": round(max(frame_scores), 4),
            "min_score": round(min(frame_scores), 4),
            "fake_frame_ratio": round(fake_frames / n, 4),
            "total_frames": n,
            "fake_frames": fake_frames
        }


confidence_aggregator = ConfidenceAggregator()
