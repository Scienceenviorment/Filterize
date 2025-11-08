"""
AI Content Analyzer and Summarizer with Translation Support
Reads, analyzes and summarizes any given data with translation capabilities
"""

import re
import json
import hashlib
import asyncio
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
import time
import random


@dataclass
class ContentAnalysis:
    """Comprehensive content analysis result"""
    content_type: str
    language: str
    word_count: int
    readability_score: float
    summary: str
    key_points: List[str]
    sentiment: str
    topics: List[str]
    entities: List[str]
    translation: Optional[str] = None
    confidence: float = 0.0


class AIContentAnalyzer:
    """Advanced AI-powered content analyzer with summarization and translation"""
    
    def __init__(self):
        self.supported_languages = {
            'en': 'English', 'es': 'Spanish', 'fr': 'French', 'de': 'German',
            'it': 'Italian', 'pt': 'Portuguese', 'ru': 'Russian', 'zh': 'Chinese',
            'ja': 'Japanese', 'ko': 'Korean', 'ar': 'Arabic', 'hi': 'Hindi',
            'tr': 'Turkish', 'pl': 'Polish', 'nl': 'Dutch', 'sv': 'Swedish'
        }
        
        self.content_cache = {}
        
    async def analyze_content(self, content: str, translate_to_english: bool = True) -> ContentAnalysis:
        """Comprehensive content analysis with optional translation"""
        
        # Generate cache key
        cache_key = hashlib.md5(f"{content}_{translate_to_english}".encode()).hexdigest()
        if cache_key in self.content_cache:
            return self.content_cache[cache_key]
        
        # Detect content type and language
        content_type = self._detect_content_type(content)
        language = self._detect_language(content)
        
        # Basic statistics
        word_count = len(content.split())
        readability_score = self._calculate_readability(content)
        
        # Advanced analysis
        summary = await self._generate_summary(content)
        key_points = await self._extract_key_points(content)
        sentiment = self._analyze_sentiment(content)
        topics = self._extract_topics(content)
        entities = self._extract_entities(content)
        
        # Translation if requested and not in English
        translation = None
        if translate_to_english and language != 'en':
            translation = await self._translate_to_english(content, language)
        
        # Calculate confidence
        confidence = self._calculate_analysis_confidence(content, word_count)
        
        result = ContentAnalysis(
            content_type=content_type,
            language=self.supported_languages.get(language, 'Unknown'),
            word_count=word_count,
            readability_score=readability_score,
            summary=summary,
            key_points=key_points,
            sentiment=sentiment,
            topics=topics,
            entities=entities,
            translation=translation,
            confidence=confidence
        )
        
        # Cache result
        self.content_cache[cache_key] = result
        
        return result
    
    def _detect_content_type(self, content: str) -> str:
        """Detect the type of content"""
        
        content_lower = content.lower()
        
        # Check for code patterns
        code_indicators = ['def ', 'class ', 'function', 'import ', 'var ', 'const ', '<?php', '<html>']
        if any(indicator in content_lower for indicator in code_indicators):
            return 'code'
        
        # Check for academic/research patterns
        academic_indicators = ['abstract', 'methodology', 'references', 'conclusion', 'hypothesis']
        if any(indicator in content_lower for indicator in academic_indicators):
            return 'academic'
        
        # Check for news patterns
        news_indicators = ['breaking news', 'reported', 'according to', 'sources say']
        if any(indicator in content_lower for indicator in news_indicators):
            return 'news'
        
        # Check for legal patterns
        legal_indicators = ['whereas', 'pursuant to', 'hereafter', 'aforementioned']
        if any(indicator in content_lower for indicator in legal_indicators):
            return 'legal'
        
        # Check for creative writing
        creative_indicators = ['once upon a time', 'chapter', 'dialogue', 'character']
        if any(indicator in content_lower for indicator in creative_indicators):
            return 'creative'
        
        # Default to general text
        return 'general'
    
    def _detect_language(self, content: str) -> str:
        """Detect the language of the content"""
        
        # Simple language detection based on common words
        language_patterns = {
            'en': ['the', 'and', 'is', 'in', 'to', 'of', 'a', 'that', 'it', 'with'],
            'es': ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no'],
            'fr': ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir'],
            'de': ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich'],
            'it': ['il', 'di', 'che', 'e', 'la', 'un', 'in', 'per', 'è', 'con'],
            'pt': ['o', 'de', 'e', 'a', 'em', 'um', 'para', 'com', 'não', 'uma'],
            'ru': ['в', 'и', 'не', 'на', 'я', 'быть', 'он', 'с', 'что', 'а'],
            'zh': ['的', '了', '是', '我', '你', '他', '她', '它', '们', '这'],
            'ja': ['の', 'に', 'は', 'を', 'た', 'が', 'で', 'て', 'と', 'し'],
            'ar': ['في', 'من', 'إلى', 'على', 'أن', 'هذا', 'هذه', 'ذلك', 'تلك', 'التي']
        }
        
        content_words = content.lower().split()[:100]  # Check first 100 words
        
        language_scores = {}
        for lang, patterns in language_patterns.items():
            score = sum(1 for word in content_words if word in patterns)
            language_scores[lang] = score
        
        # Return language with highest score, default to English
        if language_scores:
            detected_lang = max(language_scores, key=language_scores.get)
            return detected_lang if language_scores[detected_lang] > 2 else 'en'
        
        return 'en'
    
    def _calculate_readability(self, content: str) -> float:
        """Calculate readability score (simplified Flesch-Kincaid)"""
        
        sentences = re.split(r'[.!?]+', content)
        words = content.split()
        syllables = sum(self._count_syllables(word) for word in words)
        
        if len(sentences) == 0 or len(words) == 0:
            return 0.0
        
        # Simplified Flesch Reading Ease
        avg_sentence_length = len(words) / len(sentences)
        avg_syllables_per_word = syllables / len(words)
        
        readability = 206.835 - (1.015 * avg_sentence_length) - (84.6 * avg_syllables_per_word)
        
        # Normalize to 0-100 scale
        return max(0, min(100, readability))
    
    def _count_syllables(self, word: str) -> int:
        """Count syllables in a word"""
        
        word = word.lower()
        vowels = 'aeiouy'
        syllable_count = 0
        prev_was_vowel = False
        
        for char in word:
            is_vowel = char in vowels
            if is_vowel and not prev_was_vowel:
                syllable_count += 1
            prev_was_vowel = is_vowel
        
        # Handle silent 'e'
        if word.endswith('e') and syllable_count > 1:
            syllable_count -= 1
        
        return max(1, syllable_count)
    
    async def _generate_summary(self, content: str) -> str:
        """Generate an intelligent summary of the content"""
        
        # Simulate AI-powered summarization
        await asyncio.sleep(0.1)  # Simulate processing time
        
        sentences = re.split(r'[.!?]+', content)
        sentences = [s.strip() for s in sentences if len(s.strip()) > 10]
        
        if len(sentences) <= 2:
            return content[:200] + "..." if len(content) > 200 else content
        
        # Extract key sentences based on position and keyword density
        key_sentences = []
        
        # Always include first sentence
        if sentences:
            key_sentences.append(sentences[0])
        
        # Include sentences with high keyword density
        keywords = self._extract_keywords(content)
        for sentence in sentences[1:]:
            keyword_count = sum(1 for keyword in keywords if keyword.lower() in sentence.lower())
            if keyword_count >= 2:
                key_sentences.append(sentence)
        
        # Include last sentence if it's conclusive
        if len(sentences) > 1:
            last_sentence = sentences[-1]
            conclusive_words = ['conclusion', 'summary', 'therefore', 'thus', 'finally', 'in summary']
            if any(word in last_sentence.lower() for word in conclusive_words):
                key_sentences.append(last_sentence)
        
        # Limit to 3 sentences and join
        summary_sentences = key_sentences[:3]
        summary = '. '.join(summary_sentences)
        
        # Ensure summary is not too long
        if len(summary) > 300:
            summary = summary[:297] + "..."
        
        return summary if summary else content[:200] + "..."
    
    async def _extract_key_points(self, content: str) -> List[str]:
        """Extract key points from the content"""
        
        await asyncio.sleep(0.05)  # Simulate processing
        
        # Look for numbered lists, bullet points, and important statements
        key_points = []
        
        # Extract numbered points
        numbered_pattern = r'^\d+\.\s*(.+)$'
        for line in content.split('\n'):
            match = re.match(numbered_pattern, line.strip())
            if match:
                key_points.append(match.group(1).strip())
        
        # Extract bullet points
        bullet_pattern = r'^[-•*]\s*(.+)$'
        for line in content.split('\n'):
            match = re.match(bullet_pattern, line.strip())
            if match:
                key_points.append(match.group(1).strip())
        
        # Extract sentences with important keywords
        important_keywords = ['important', 'key', 'significant', 'crucial', 'essential', 'main', 'primary']
        sentences = re.split(r'[.!?]+', content)
        
        for sentence in sentences:
            if any(keyword in sentence.lower() for keyword in important_keywords):
                clean_sentence = sentence.strip()
                if len(clean_sentence) > 20 and clean_sentence not in key_points:
                    key_points.append(clean_sentence)
        
        # If no structured points found, extract based on sentence importance
        if not key_points:
            keywords = self._extract_keywords(content)
            for sentence in sentences[:10]:  # Check first 10 sentences
                keyword_count = sum(1 for keyword in keywords if keyword.lower() in sentence.lower())
                if keyword_count >= 2 and len(sentence.strip()) > 20:
                    key_points.append(sentence.strip())
        
        return key_points[:5]  # Return top 5 key points
    
    def _analyze_sentiment(self, content: str) -> str:
        """Analyze sentiment of the content"""
        
        positive_words = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'positive', 'happy', 'love', 'best']
        negative_words = ['bad', 'terrible', 'awful', 'horrible', 'negative', 'sad', 'hate', 'worst', 'disappointing', 'failed']
        
        content_lower = content.lower()
        positive_count = sum(1 for word in positive_words if word in content_lower)
        negative_count = sum(1 for word in negative_words if word in content_lower)
        
        if positive_count > negative_count + 1:
            return 'Positive'
        elif negative_count > positive_count + 1:
            return 'Negative'
        else:
            return 'Neutral'
    
    def _extract_topics(self, content: str) -> List[str]:
        """Extract main topics from content"""
        
        # Simple topic extraction based on keyword frequency
        words = re.findall(r'\b[a-zA-Z]{4,}\b', content.lower())
        
        # Remove common stop words
        stop_words = {'this', 'that', 'with', 'have', 'will', 'from', 'they', 'been', 'were', 'said', 'each', 'which', 'their', 'what', 'there', 'would', 'about', 'could', 'when', 'where'}
        
        filtered_words = [word for word in words if word not in stop_words]
        
        # Count frequency
        word_freq = {}
        for word in filtered_words:
            word_freq[word] = word_freq.get(word, 0) + 1
        
        # Get top topics
        topics = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return [topic[0].title() for topic in topics if topic[1] > 1]
    
    def _extract_entities(self, content: str) -> List[str]:
        """Extract named entities from content"""
        
        # Simple entity extraction using regex patterns
        entities = []
        
        # Extract names (capitalized words)
        name_pattern = r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b'
        names = re.findall(name_pattern, content)
        entities.extend([name for name in names if len(name.split()) <= 3])
        
        # Extract dates
        date_pattern = r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b|\b\d{4}[/-]\d{1,2}[/-]\d{1,2}\b'
        dates = re.findall(date_pattern, content)
        entities.extend(dates)
        
        # Extract numbers and percentages
        number_pattern = r'\b\d+(?:\.\d+)?%?\b'
        numbers = re.findall(number_pattern, content)
        significant_numbers = [num for num in numbers if '.' in num or '%' in num or int(num.replace('%', '')) > 100]
        entities.extend(significant_numbers)
        
        # Remove duplicates and return top entities
        unique_entities = list(set(entities))
        return unique_entities[:10]
    
    def _extract_keywords(self, content: str) -> List[str]:
        """Extract important keywords from content"""
        
        words = re.findall(r'\b[a-zA-Z]{4,}\b', content.lower())
        
        # Remove stop words
        stop_words = {'this', 'that', 'with', 'have', 'will', 'from', 'they', 'been', 'were', 'said', 'each', 'which', 'their', 'what', 'there', 'would', 'about', 'could', 'when', 'where', 'more', 'some', 'very', 'into', 'just', 'than', 'only', 'other', 'after', 'first', 'well', 'also'}
        
        filtered_words = [word for word in words if word not in stop_words]
        
        # Count frequency
        word_freq = {}
        for word in filtered_words:
            word_freq[word] = word_freq.get(word, 0) + 1
        
        # Get keywords with frequency > 1
        keywords = [word for word, freq in word_freq.items() if freq > 1]
        
        return keywords[:10]
    
    async def _translate_to_english(self, content: str, source_language: str) -> str:
        """Translate content to English"""
        
        # Simulate translation processing
        await asyncio.sleep(0.2)
        
        # This is a simulation - in reality, you'd use Google Translate API, OpenAI, or similar
        if source_language == 'en':
            return content
        
        # Simulate translation result
        translation_note = f"[Translated from {self.supported_languages.get(source_language, 'Unknown')}] "
        
        # For demo purposes, we'll just add a translation note
        # In production, integrate with actual translation services
        simulated_translation = translation_note + content[:500] + "..."
        
        return simulated_translation
    
    def _calculate_analysis_confidence(self, content: str, word_count: int) -> float:
        """Calculate confidence score for the analysis"""
        
        # Base confidence on content length and quality
        length_score = min(1.0, word_count / 100)  # Full score at 100+ words
        
        # Check for structure indicators
        structure_indicators = ['.', '!', '?', '\n', ',']
        structure_score = min(1.0, sum(content.count(indicator) for indicator in structure_indicators) / 20)
        
        # Check for complexity
        unique_words = len(set(content.lower().split()))
        complexity_score = min(1.0, unique_words / max(1, word_count))
        
        # Combine scores
        confidence = (length_score * 0.4 + structure_score * 0.3 + complexity_score * 0.3)
        
        return round(confidence, 3)


# Global analyzer instance
content_analyzer = AIContentAnalyzer()


# Helper functions for easy integration
async def analyze_and_summarize(content: str, translate_to_english: bool = True) -> Dict[str, Any]:
    """Analyze and summarize content with optional translation"""
    
    analysis = await content_analyzer.analyze_content(content, translate_to_english)
    
    return {
        'success': True,
        'analysis': {
            'content_type': analysis.content_type,
            'language': analysis.language,
            'word_count': analysis.word_count,
            'readability_score': round(analysis.readability_score, 1),
            'confidence': analysis.confidence
        },
        'summary': analysis.summary,
        'key_points': analysis.key_points,
        'sentiment': analysis.sentiment,
        'topics': analysis.topics,
        'entities': analysis.entities,
        'translation': analysis.translation,
        'processing_time': time.time()  # Add actual processing time in production
    }


def get_supported_languages() -> Dict[str, str]:
    """Get list of supported languages"""
    return content_analyzer.supported_languages


async def translate_text(text: str, target_language: str = 'en') -> str:
    """Translate text to target language"""
    
    if target_language == 'en':
        detected_lang = content_analyzer._detect_language(text)
        if detected_lang != 'en':
            return await content_analyzer._translate_to_english(text, detected_lang)
    
    return text  # Return original if already in target language