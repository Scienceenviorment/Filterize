"""
Enhanced AI Provider Integration with Multiple Agents

This module provides integration with multiple AI providers including:
- OpenAI (ChatGPT)
- Anthropic (Claude)
- Google (Gemini) 
- Microsoft (Copilot)
- Other specialized agents

The system intelligently routes requests to the best provider based on content type.
"""

import os
import json
import time
import requests
from typing import Dict, List, Optional


class MultiAIAgent:
    """Intelligent AI agent that routes requests to the best provider."""
    
    def __init__(self):
        self.providers = {
            'openai': OpenAIProvider(),
            'anthropic': AnthropicProvider(),
            'gemini': GeminiProvider(),
            'copilot': CopilotProvider(),
            'specialized': SpecializedProvider()
        }
        
    def select_best_provider(self, content_type: str, content: str, task: str = "analysis") -> str:
        """
        Intelligently select the best AI provider based on content and task.
        
        Args:
            content_type: 'text', 'image', 'video', 'url'
            content: The content to analyze
            task: 'analysis', 'fact_check', 'summarize'
            
        Returns:
            Provider name
        """
        # Check available providers
        available = [name for name, provider in self.providers.items() 
                    if provider.is_available()]
        
        if not available:
            return None
            
        # Smart routing logic
        if task == 'fact_check':
            # Claude is excellent for fact-checking
            if 'anthropic' in available:
                return 'anthropic'
            elif 'openai' in available:
                return 'openai'
                
        elif content_type == 'image':
            # OpenAI GPT-4V is great for image analysis
            if 'openai' in available:
                return 'openai'
            elif 'gemini' in available:
                return 'gemini'
                
        elif task == 'summarize':
            # Gemini is good for summarization
            if 'gemini' in available:
                return 'gemini'
            elif 'anthropic' in available:
                return 'anthropic'
                
        elif 'scientific' in content.lower() or 'research' in content.lower():
            # Claude for scientific content
            if 'anthropic' in available:
                return 'anthropic'
                
        # Default fallback
        return available[0] if available else None
    
    def analyze_content(self, content: str, content_type: str = 'text', 
                       task: str = 'analysis') -> Dict:
        """
        Analyze content using the best available AI provider.
        
        Args:
            content: Content to analyze
            content_type: Type of content
            task: Analysis task type
            
        Returns:
            Analysis results
        """
        provider_name = self.select_best_provider(content_type, content, task)
        
        if not provider_name:
            return {
                'error': 'No AI providers available',
                'provider_used': None,
                'analysis': None
            }
            
        try:
            provider = self.providers[provider_name]
            result = provider.analyze(content, content_type, task)
            result['provider_used'] = provider_name
            return result
            
        except Exception as e:
            # Try fallback providers
            for fallback_name in ['openai', 'anthropic', 'gemini']:
                if fallback_name != provider_name and fallback_name in self.providers:
                    try:
                        fallback = self.providers[fallback_name]
                        if fallback.is_available():
                            result = fallback.analyze(content, content_type, task)
                            result['provider_used'] = f"{fallback_name} (fallback)"
                            return result
                    except Exception:
                        continue
                        
            return {
                'error': f'Analysis failed: {str(e)}',
                'provider_used': provider_name,
                'analysis': None
            }


class BaseProvider:
    """Base class for AI providers."""
    
    def __init__(self, name: str):
        self.name = name
        
    def is_available(self) -> bool:
        """Check if provider is available and configured."""
        return False
        
    def analyze(self, content: str, content_type: str, task: str) -> Dict:
        """Analyze content."""
        raise NotImplementedError


class OpenAIProvider(BaseProvider):
    """OpenAI (ChatGPT) provider."""
    
    def __init__(self):
        super().__init__("OpenAI")
        self.api_key = os.environ.get('OPENAI_API_KEY')
        self.base_url = "https://api.openai.com/v1"
        
    def is_available(self) -> bool:
        return bool(self.api_key)
        
    def analyze(self, content: str, content_type: str, task: str) -> Dict:
        """Analyze content using OpenAI."""
        if not self.is_available():
            raise Exception("OpenAI API key not configured")
            
        # Create appropriate prompt based on task
        if task == 'fact_check':
            prompt = f"""
            As an expert fact-checker, analyze this content for factual accuracy:
            
            Content: {content}
            
            Please provide:
            1. Overall credibility score (0-100)
            2. Specific fact-checking results
            3. Real facts vs claims made
            4. Sources that support or contradict claims
            5. AI generation likelihood
            
            Respond in JSON format.
            """
        elif task == 'summarize':
            prompt = f"""
            Summarize this content and check for misinformation:
            
            Content: {content}
            
            Provide:
            1. Key summary points
            2. Potential misinformation flags
            3. Credibility assessment
            4. Real facts to verify against
            """
        else:
            prompt = f"""
            Analyze this {content_type} content for:
            1. AI generation likelihood (0-100%)
            2. Credibility score (0-100)
            3. Potential misinformation
            4. Key facts to verify
            
            Content: {content}
            """
            
        try:
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }
            
            data = {
                'model': 'gpt-4o',  # Latest model
                'messages': [
                    {'role': 'system', 'content': 'You are an expert AI detection and fact-checking assistant.'},
                    {'role': 'user', 'content': prompt}
                ],
                'max_tokens': 1500,
                'temperature': 0.2
            }
            
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=data,
                timeout=30
            )
            response.raise_for_status()
            
            result = response.json()
            content_response = result['choices'][0]['message']['content']
            
            # Try to parse as JSON, fallback to text
            try:
                parsed_response = json.loads(content_response)
            except:
                parsed_response = {'analysis': content_response}
                
            return {
                'success': True,
                'analysis': parsed_response,
                'raw_response': content_response,
                'model': data['model']
            }
            
        except Exception as e:
            raise Exception(f"OpenAI API error: {str(e)}")


class AnthropicProvider(BaseProvider):
    """Anthropic (Claude) provider."""
    
    def __init__(self):
        super().__init__("Anthropic")
        self.api_key = os.environ.get('ANTHROPIC_API_KEY')
        self.base_url = "https://api.anthropic.com/v1"
        
    def is_available(self) -> bool:
        return bool(self.api_key)
        
    def analyze(self, content: str, content_type: str, task: str) -> Dict:
        """Analyze content using Claude."""
        if not self.is_available():
            raise Exception("Anthropic API key not configured")
            
        prompt = f"""
        Human: I need you to analyze this {content_type} content for AI detection and fact-checking.
        
        Content: {content}
        
        Task: {task}
        
        Please provide a comprehensive analysis including:
        1. AI generation probability (0-100%)
        2. Factual accuracy assessment
        3. Credibility score (0-100)
        4. Specific claims that need verification
        5. Real facts to counter any misinformation
        6. Sources you would recommend checking
        
        Be thorough and provide specific examples.
        
        Assistant: """
        
        try:
            headers = {
                'x-api-key': self.api_key,
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01'
            }
            
            data = {
                'model': 'claude-3-sonnet-20240229',
                'max_tokens': 1500,
                'messages': [
                    {'role': 'user', 'content': prompt}
                ]
            }
            
            response = requests.post(
                f"{self.base_url}/messages",
                headers=headers,
                json=data,
                timeout=30
            )
            response.raise_for_status()
            
            result = response.json()
            content_response = result['content'][0]['text']
            
            return {
                'success': True,
                'analysis': content_response,
                'model': data['model']
            }
            
        except Exception as e:
            raise Exception(f"Anthropic API error: {str(e)}")


class GeminiProvider(BaseProvider):
    """Google Gemini provider."""
    
    def __init__(self):
        super().__init__("Gemini")
        self.api_key = os.environ.get('GOOGLE_API_KEY')
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"
        
    def is_available(self) -> bool:
        return bool(self.api_key)
        
    def analyze(self, content: str, content_type: str, task: str) -> Dict:
        """Analyze content using Gemini."""
        if not self.is_available():
            raise Exception("Google API key not configured")
            
        prompt = f"""
        Analyze this {content_type} for AI generation and factual accuracy:
        
        {content}
        
        Provide:
        - AI detection score (0-100%)
        - Fact-checking results
        - Credibility assessment
        - Real facts vs false claims
        - Recommended verification sources
        """
        
        try:
            url = f"{self.base_url}/models/gemini-pro:generateContent?key={self.api_key}"
            
            data = {
                'contents': [{
                    'parts': [{'text': prompt}]
                }],
                'generationConfig': {
                    'temperature': 0.2,
                    'maxOutputTokens': 1500
                }
            }
            
            response = requests.post(url, json=data, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            content_response = result['candidates'][0]['content']['parts'][0]['text']
            
            return {
                'success': True,
                'analysis': content_response,
                'model': 'gemini-pro'
            }
            
        except Exception as e:
            raise Exception(f"Gemini API error: {str(e)}")


class CopilotProvider(BaseProvider):
    """Microsoft Copilot provider (placeholder)."""
    
    def __init__(self):
        super().__init__("Copilot")
        
    def is_available(self) -> bool:
        # Placeholder - would need Microsoft Graph API setup
        return False
        
    def analyze(self, content: str, content_type: str, task: str) -> Dict:
        return {
            'success': False,
            'analysis': 'Copilot integration not yet implemented',
            'model': 'copilot-placeholder'
        }


class SpecializedProvider(BaseProvider):
    """Specialized fact-checking and AI detection provider."""
    
    def __init__(self):
        super().__init__("Specialized")
        
    def is_available(self) -> bool:
        return True  # Always available as fallback
        
    def analyze(self, content: str, content_type: str, task: str) -> Dict:
        """Provide basic analysis using built-in algorithms."""
        
        # Use our existing AI detection
        try:
            from ai_detection import analyze_ai_content
            ai_result = analyze_ai_content(content)
        except ImportError:
            ai_result = {'score': 50, 'flags': ['import_error']}
        
        # Basic fact-checking heuristics
        fact_check_score = self._basic_fact_check(content)
        
        return {
            'success': True,
            'analysis': {
                'ai_detection': ai_result,
                'fact_check_score': fact_check_score,
                'provider': 'built-in-algorithms',
                'real_facts': self._extract_verifiable_claims(content)
            },
            'model': 'local-heuristic'
        }
    
    def _basic_fact_check(self, content: str) -> int:
        """Basic fact-checking using heuristics."""
        score = 70  # Base score
        
        # Check for red flags
        red_flags = [
            'doctors hate this', 'one weird trick', 'they don\'t want you to know',
            'secret cure', 'miracle', 'instant', 'guaranteed', 'shocking truth'
        ]
        
        for flag in red_flags:
            if flag.lower() in content.lower():
                score -= 15
                
        # Check for credibility indicators
        credible_indicators = [
            'study shows', 'research indicates', 'according to', 'peer-reviewed',
            'university', 'journal', 'published', 'data suggests'
        ]
        
        for indicator in credible_indicators:
            if indicator.lower() in content.lower():
                score += 10
                
        return max(0, min(100, score))
    
    def _extract_verifiable_claims(self, content: str) -> List[str]:
        """Extract claims that can be fact-checked."""
        # Simple extraction of sentences with factual claims
        import re
        
        sentences = re.split(r'[.!?]+', content)
        verifiable = []
        
        fact_patterns = [
            r'\d+%', r'\d+ times', r'studies show', r'research found',
            r'according to', r'experts say', r'data reveals'
        ]
        
        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence) > 20:  # Ignore very short sentences
                for pattern in fact_patterns:
                    if re.search(pattern, sentence, re.IGNORECASE):
                        verifiable.append(sentence)
                        break
                        
        return verifiable[:5]  # Return top 5 claims


# Global instance
multi_ai_agent = MultiAIAgent()


def analyze_text_with_provider(text: str, provider: Optional[str] = None, **kwargs):
    """
    Enhanced analyze function with multi-provider support.
    Maintains backward compatibility with existing code.
    
    Args:
        text: Text content to analyze
        provider: Specific provider to use (optional)
        
    Returns:
        Analysis results in legacy format for compatibility
    """
    if not provider:
        # Use intelligent routing
        result = multi_ai_agent.analyze_content(text, 'text', 'analysis')
    else:
        # Use specific provider
        provider = provider.lower()
        if provider in multi_ai_agent.providers:
            try:
                result = multi_ai_agent.providers[provider].analyze(text, 'text', 'analysis')
                result['provider_used'] = provider
            except Exception as e:
                raise RuntimeError(f'Provider {provider} failed: {str(e)}')
        else:
            raise ValueError(f'Unknown provider: {provider}')
    
    # Convert to legacy format for backward compatibility
    if result.get('success'):
        analysis = result.get('analysis', {})
        return {
            'score': analysis.get('credibility_score', 50),
            'polarity': 0.0,  # Placeholder
            'vader_compound': 0.0,  # Placeholder
            'flags': analysis.get('concerns', ['provider_analysis']),
            'summary': [analysis.get('summary', 'AI analysis completed')]
        }
    else:
        return None


def get_fact_check_analysis(content: str, content_type: str = 'text') -> Dict:
    """
    Get comprehensive fact-checking analysis.
    
    Args:
        content: Content to fact-check
        content_type: Type of content
        
    Returns:
        Detailed fact-checking results
    """
    return multi_ai_agent.analyze_content(content, content_type, 'fact_check')


def get_content_summary(content: str, content_type: str = 'text') -> Dict:
    """
    Get content summary with misinformation detection.
    
    Args:
        content: Content to summarize
        content_type: Type of content
        
    Returns:
        Summary with fact-checking
    """
    return multi_ai_agent.analyze_content(content, content_type, 'summarize')
