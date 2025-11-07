"""
AI provider abstraction layer.
Provides a lightweight interface to plug in external AI agents (OpenAI, Cohere, etc.)
Falls back to the built-in `simple_analyze` implementation in `server.py` when no provider is configured.

To add a provider, implement `analyze_text_with_provider(text, provider_name, **kwargs)` to route requests.
"""

import os
import json
import requests
from typing import Optional


def analyze_text_with_provider(text: str, provider: Optional[str] = None, **kwargs):
    """Analyze text using an external provider or return None to indicate fallback.

    If provider is None, the caller should use the local `simple_analyze` fallback.

    The function returns a dict with keys: score, polarity, vader_compound, flags, summary
    or raises an exception when the provider fails.
    """
    if not provider:
        return None

    provider = provider.lower()
    if provider == 'openai':
        api_key = os.environ.get('OPENAI_API_KEY')
        if not api_key:
            raise RuntimeError('OPENAI_API_KEY not configured')

        # Use the REST API so we don't require the openai python package.
        url = 'https://api.openai.com/v1/chat/completions'
        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }

        # Prompt the model to return a compact JSON describing the analysis.
        system = (
            'You are an assistant that analyzes text credibility. '
            'Return only a JSON object with keys: score (0-100), polarity (float), '
            'vader_compound (float), flags (list of strings), summary (list of short phrases).' 
        )
        user = f'Analyze the following text for credibility and return the JSON: """{text}"""'

        body = {
            'model': kwargs.get('model', 'gpt-3.5-turbo'),
            'messages': [
                {'role': 'system', 'content': system},
                {'role': 'user', 'content': user}
            ],
            'temperature': kwargs.get('temperature', 0.1),
            'max_tokens': kwargs.get('max_tokens', 300),
        }

        resp = requests.post(url, headers=headers, json=body, timeout=30)
        if resp.status_code != 200:
            raise RuntimeError(f'OpenAI API error: {resp.status_code} {resp.text}')

        data = resp.json()
        # Extract content from the assistant reply
        try:
            content = data['choices'][0]['message']['content']
            # Some models may wrap code fences; attempt to find the first JSON object
            start = content.find('{')
            end = content.rfind('}')
            if start != -1 and end != -1:
                json_text = content[start:end+1]
            else:
                json_text = content
            parsed = json.loads(json_text)
            return parsed
        except Exception as e:
            raise RuntimeError('Failed to parse OpenAI response: ' + str(e))

    # Placeholder for other providers (Cohere, Anthropic, etc.)
    elif provider == 'cohere':
        raise NotImplementedError('Cohere integration not implemented yet')

    else:
        raise ValueError(f'Unknown provider: {provider}')
