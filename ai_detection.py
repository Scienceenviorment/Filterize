"""
AI-Generated Content Detection Module for Filterize

This module implements AI content detection based on watermarking analysis, 
reward scoring, and perplexity analysis from research experiments.
"""

import re
import os
import json
import pickle
import hashlib
from typing import Dict, List, Optional, Tuple
from pathlib import Path


class AIContentDetector:
    """Advanced AI content detection using multiple detection methods."""
    
    def __init__(self):
        self.model_cache = {}
        self.detection_cache = {}
        
    def analyze_ai_content(self, text: str) -> Dict:
        """
        Comprehensive AI content detection analysis.
        
        Returns:
            {
                'ai_probability': float,  # 0-1 probability of AI generation
                'confidence': float,      # 0-1 confidence in detection
                'detection_methods': list,  # Which methods were used
                'watermark_detected': bool,  # Watermark detection result
                'perplexity_score': float,   # Text perplexity analysis
                'reward_score': float,       # Reward model score
                'flags': list,              # Detection flags
                'explanation': str          # Human-readable explanation
            }
        """
        
        # Check cache first
        cache_key = hashlib.sha256(text.encode()).hexdigest()
        if cache_key in self.detection_cache:
            return self.detection_cache[cache_key]
        
        result = {
            'ai_probability': 0.0,
            'confidence': 0.0,
            'detection_methods': [],
            'watermark_detected': False,
            'perplexity_score': 0.0,
            'reward_score': 0.0,
            'flags': [],
            'explanation': ''
        }
        
        # Method 1: Watermark Detection (based on experiment patterns)
        watermark_result = self._detect_watermarks(text)
        if watermark_result['detected']:
            result['watermark_detected'] = True
            result['ai_probability'] += 0.4
            result['detection_methods'].append('watermark')
            result['flags'].append('watermark_detected')
        
        # Method 2: Perplexity Analysis
        perplexity_result = self._analyze_perplexity(text)
        result['perplexity_score'] = perplexity_result['score']
        if perplexity_result['indicates_ai']:
            result['ai_probability'] += 0.3
            result['detection_methods'].append('perplexity')
            result['flags'].append('low_perplexity')
        
        # Method 3: Reward Model Scoring
        reward_result = self._calculate_reward_score(text)
        result['reward_score'] = reward_result['score']
        if reward_result['indicates_ai']:
            result['ai_probability'] += 0.2
            result['detection_methods'].append('reward_model')
            result['flags'].append('high_reward_score')
        
        # Method 4: Linguistic Pattern Analysis
        pattern_result = self._analyze_linguistic_patterns(text)
        if pattern_result['indicates_ai']:
            result['ai_probability'] += 0.1
            result['detection_methods'].append('linguistic_patterns')
            result['flags'].extend(pattern_result['flags'])
        
        # Normalize probability and calculate confidence
        result['ai_probability'] = min(1.0, result['ai_probability'])
        result['confidence'] = len(result['detection_methods']) / 4.0
        
        # Generate explanation
        result['explanation'] = self._generate_explanation(result)
        
        # Cache result
        self.detection_cache[cache_key] = result
        return result
    
    def _detect_watermarks(self, text: str) -> Dict:
        """
        Detect AI watermarks based on token distribution patterns.
        Simulates the watermarking detection from experiments.
        """
        # Simple watermark detection based on character/word patterns
        words = text.split()
        if len(words) < 10:
            return {'detected': False, 'confidence': 0.0}
        
        # Check for repetitive patterns that might indicate watermarking
        word_freq = {}
        for word in words:
            word_freq[word] = word_freq.get(word, 0) + 1
        
        # AI text often has very balanced vocabulary usage
        unique_words = len(word_freq)
        total_words = len(words)
        vocabulary_diversity = unique_words / total_words
        
        # Check for suspicious patterns
        repetition_score = sum(1 for freq in word_freq.values() if freq > len(words) * 0.05)
        
        detected = vocabulary_diversity < 0.7 and repetition_score < 3
        confidence = 1.0 - vocabulary_diversity if detected else 0.0
        
        return {'detected': detected, 'confidence': confidence}
    
    def _analyze_perplexity(self, text: str) -> Dict:
        """
        Analyze text perplexity to detect AI generation.
        AI text typically has lower perplexity (more predictable).
        """
        words = text.split()
        if len(words) < 5:
            return {'score': 100.0, 'indicates_ai': False}
        
        # Simple perplexity approximation based on word frequency patterns
        # Real implementation would use a language model
        
        # Check for overly smooth transitions
        transition_surprises = 0
        for i in range(len(words) - 1):
            current_word = words[i].lower()
            next_word = words[i + 1].lower()
            
            # Simple heuristic: AI often uses very common word transitions
            common_transitions = {
                'the': ['main', 'key', 'primary', 'central'],
                'this': ['is', 'approach', 'method', 'technique'],
                'in': ['this', 'the', 'order', 'conclusion'],
                'it': ['is', 'can', 'should', 'will']
            }
            
            if current_word in common_transitions:
                if next_word not in common_transitions[current_word]:
                    transition_surprises += 1
        
        # Lower surprise = lower perplexity = more likely AI
        perplexity_score = (transition_surprises / max(1, len(words) - 1)) * 100
        indicates_ai = perplexity_score < 20  # Very predictable text
        
        return {'score': perplexity_score, 'indicates_ai': indicates_ai}
    
    def _calculate_reward_score(self, text: str) -> Dict:
        """
        Calculate reward model score based on helpfulness, harmlessness, honesty.
        AI text often scores very high on these metrics.
        """
        score = 50.0  # Base score
        
        # Helpfulness indicators
        helpful_patterns = [
            r'\b(here are|let me|i can help|i\'ll|i will)\b',
            r'\b(steps|process|method|approach|way to)\b',
            r'\b(first|second|third|finally|in conclusion)\b'
        ]
        
        for pattern in helpful_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                score += 10
        
        # Harmlessness indicators (overly cautious language)
        harmless_patterns = [
            r'\b(please note|it\'s important|be careful|consider)\b',
            r'\b(however|although|while|despite)\b',
            r'\b(may|might|could|should|would)\b'
        ]
        
        cautious_count = 0
        for pattern in harmless_patterns:
            cautious_count += len(re.findall(pattern, text, re.IGNORECASE))
        
        if cautious_count > len(text.split()) * 0.1:  # More than 10% cautious words
            score += 15
        
        # Honesty indicators (hedging language)
        hedging_patterns = [
            r'\b(generally|typically|usually|often|sometimes)\b',
            r'\b(appears|seems|suggests|indicates)\b'
        ]
        
        for pattern in hedging_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                score += 5
        
        # Very high scores (>85) indicate potential AI generation
        indicates_ai = score > 85
        
        return {'score': min(100.0, score), 'indicates_ai': indicates_ai}
    
    def _analyze_linguistic_patterns(self, text: str) -> Dict:
        """
        Analyze linguistic patterns that might indicate AI generation.
        """
        flags = []
        indicates_ai = False
        
        # Check for overly formal language
        formal_indicators = [
            r'\b(furthermore|moreover|subsequently|consequently)\b',
            r'\b(utilize|demonstrate|facilitate|implement)\b'
        ]
        
        formal_count = 0
        for pattern in formal_indicators:
            formal_count += len(re.findall(pattern, text, re.IGNORECASE))
        
        if formal_count > len(text.split()) * 0.05:
            flags.append('overly_formal')
            indicates_ai = True
        
        # Check for repetitive sentence structures
        sentences = re.split(r'[.!?]+', text)
        if len(sentences) > 3:
            sentence_starts = [s.strip()[:10].lower() for s in sentences if s.strip()]
            unique_starts = len(set(sentence_starts))
            if unique_starts < len(sentence_starts) * 0.7:
                flags.append('repetitive_structure')
                indicates_ai = True
        
        # Check for perfect grammar (suspicious for informal text)
        grammar_errors = len(re.findall(r'\b(dont|cant|wont|im|youre|theyre)\b', text))
        if len(text.split()) > 20 and grammar_errors == 0:
            flags.append('perfect_grammar')
        
        return {'indicates_ai': indicates_ai, 'flags': flags}
    
    def _generate_explanation(self, result: Dict) -> str:
        """Generate human-readable explanation of detection results."""
        if result['ai_probability'] < 0.3:
            return "Text appears to be human-written with natural variation and unpredictability."
        elif result['ai_probability'] < 0.7:
            return f"Text shows some AI indicators ({', '.join(result['detection_methods'])}). Mixed human/AI content possible."
        else:
            methods = ', '.join(result['detection_methods'])
            return f"High probability of AI generation detected via: {methods}. Consider verification."


# Global detector instance
ai_detector = AIContentDetector()


def analyze_ai_content(text: str) -> Dict:
    """Main function to analyze if content is AI-generated."""
    return ai_detector.analyze_ai_content(text)