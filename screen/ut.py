import re
import os
import functools
from typing import Tuple, Optional, Dict
from langdetect import detect, DetectorFactory
from googletrans import Translator

DetectorFactory.seed = 0  # make language detection deterministic

# Pre-compiled regex patterns for better performance
_clean_url_re = re.compile(r'https?://\S+|www\.\S+', re.IGNORECASE)
_non_alnum_re = re.compile(r'[^0-9a-zA-Z\u0900-\u097F\u0980-\u09FF\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0D80-\u0DFF\u0A00-\u0A7F]+')
_all_caps_re = re.compile(r'\b[A-Z]{4,}\b')
_exclamation_re = re.compile(r'!')
_suspicious_domains = frozenset(["blogspot", "wp.com", "tinyurl", "bit.ly", "whatsapp", "forwarded as received"])

LABEL_MAP_SIMPLE_INDIAN = {
    "en": {"OK":"Likely OK","MIS":"Likely Misleading"},
    "hi": {"OK":"सम्भवतः ठीक","MIS":"सम्भवतः भ्रामक"},
    "mr": {"OK":"बहुधा बरोबर","MIS":"बहुधा भ्रामक"},
    "bn": {"OK":"সম্ভবত ঠিক","MIS":"সম্ভবত বিভ্রান্তিকর"},
    "ta": {"OK":"பெரும்பாலும் சரி","MIS":"பெரும்பாலும் தவறான"},
    "te": {"OK":"బహుశా సరైనది","MIS":"బహుశా తప్పుదారి పట్టించే"},
    "kn": {"OK":"ಬಹುಶಃ ಸರಿಯಾಗಿದೆ","MIS":"ಬಹುಶಃ ತಪ್ಪುಮಾರ್ಗದರ್ಶಕ"},
    "ml": {"OK":"മിക്കവാറും ശരി","MIS":"മിക്കവാറും തെറ്റിദ്ധരിപ്പിക്കുന്നു"},
    "gu": {"OK":"શાયદ ઠીક","MIS":"શાયદ ગેરમાર્ગે દોરનાર"},
    "pa": {"OK":"ਸ਼ਾਇਦ ਠੀਕ","MIS":"ਸ਼ਾਇਦ ਗੁੰਮਰਾਹ ਕਰਨ ਵਾਲਾ"},
    "ur": {"OK":"شاید ٹھیک","MIS":"شاید گمراہ کن"},
}

@functools.lru_cache(maxsize=10000)
def basic_clean(text: str) -> str:
    """Cached text cleaning for better performance"""
    text = text.strip()
    text = _clean_url_re.sub(' URL ', text)
    # keep major Indic blocks + latin/numbers; collapse spaces
    text = _non_alnum_re.sub(' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.lower().strip()

@functools.lru_cache(maxsize=5000)
def detect_language(text: str) -> str:
    """Cached language detection"""
    try:
        return detect(text)
    except Exception:
        return "en"

_translator: Optional[Translator] = None

@functools.lru_cache(maxsize=2000)
def translate_to_english(text: str) -> Tuple[str, str]:
    """Cached translation to English"""
    global _translator
    lang = detect_language(text)
    if lang == "en":
        return text, lang
    try:
        if _translator is None:
            _translator = Translator()
        out = _translator.translate(text, src=lang, dest="en")
        return out.text, lang
    except Exception:
        return text, lang

def label_in_language(label_key: str, lang: str) -> str:
    table = LABEL_MAP_SIMPLE_INDIAN.get(lang, LABEL_MAP_SIMPLE_INDIAN["en"])
    return table.get(label_key, label_key)

@functools.lru_cache(maxsize=5000)
def has_many_exclamations(text: str) -> bool:
    """Cached exclamation check"""
    return len(_exclamation_re.findall(text)) >= 3

@functools.lru_cache(maxsize=5000)
def has_all_caps_word(text: str) -> bool:
    """Cached all caps check"""
    return bool(_all_caps_re.search(text))

@functools.lru_cache(maxsize=5000)
def suspicious_domain_present(text: str) -> bool:
    """Cached suspicious domain check"""
    text_lower = text.lower()
    return any(domain in text_lower for domain in _suspicious_domains)

def literacy_tips() -> Dict[str, str]:
    return {
        "1": "Check the official website or verified handles for announcements.",
        "2": "Be careful with forwards that ask you to share quickly or click a link.",
        "3": "Look for a date, source, and quotes from real officials.",
        "4": "Search the headline and add the word 'myth' or 'fact check'.",
        "5": "For images: use reverse image search (Google Images) to see older versions.",
        "6": "Never share personal PIN/OTP—banks and govt never ask on phone.",
    }