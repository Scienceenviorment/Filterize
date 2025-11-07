import os
import pickle
from typing import Optional

MODEL_PATH = os.path.join('models', 'local_model.pkl')

# Module-level cache
_model = None


def _ensure_model_dir():
    d = os.path.dirname(MODEL_PATH)
    if d and not os.path.exists(d):
        os.makedirs(d, exist_ok=True)


def _train_quick_model():
    """Train a tiny TF-IDF + LogisticRegression model on synthetic samples.
    This is intentionally small so it trains quickly and runs locally.
    """
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.linear_model import LogisticRegression
        from sklearn.pipeline import make_pipeline
    except Exception as e:
        raise RuntimeError('scikit-learn is required for the local model: ' + str(e))

    # Small synthetic dataset: credible (1) vs not credible (0)
    credible = [
        "The peer-reviewed study published in Nature shows...",
        "According to the Centers for Disease Control and Prevention (CDC),",
        "Researchers at the university found that",
        "A report from the World Health Organization states",
    ]
    not_credible = [
        "You won't believe this! Click to see the secret!",
        "This one weird trick will cure all diseases",
        "Shocking truth that doctors don't want you to know",
        "Miracle remedy guaranteed to work overnight",
    ]

    X = credible + not_credible
    y = [1] * len(credible) + [0] * len(not_credible)

    pipeline = make_pipeline(TfidfVectorizer(ngram_range=(1, 2), max_features=2000), LogisticRegression())
    pipeline.fit(X, y)

    _ensure_model_dir()
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(pipeline, f)
    return pipeline


def _load_or_train():
    global _model
    if _model is not None:
        return _model
    # Try loading
    if os.path.exists(MODEL_PATH):
        try:
            with open(MODEL_PATH, 'rb') as f:
                _model = pickle.load(f)
                return _model
        except Exception:
            # Fall through to training
            pass
    # Train a tiny model
    _model = _train_quick_model()
    return _model


def analyze_text_local(text: str) -> Optional[dict]:
    """Return analysis dict or None if local model cannot run.

    Shape: { score, polarity, vader_compound, flags, summary }
    """
    try:
        model = _load_or_train()
    except Exception as e:
        # scikit-learn not available or training failed
        raise

    try:
        prob = model.predict_proba([text])[0]
        # predict_proba order depends on classes_ (we trained 1=credible,0=not)
        # If classes_[1] exists, find index
        classes = getattr(model, 'classes_', None)
        if classes is not None and 1 in classes:
            idx = list(classes).index(1)
            credible_prob = prob[idx]
        else:
            credible_prob = float(prob.max())

        score = int(credible_prob * 100)

        # Lightweight polarity and flags using TextBlob and simple heuristics
        try:
            from textblob import TextBlob
            tb = TextBlob(text)
            polarity = tb.sentiment.polarity
        except Exception:
            polarity = 0.0

        flags = []
        if any(p in text.lower() for p in ["click", "secret", "miracle", "won't believe", "one weird trick"]):
            flags.append('clickbait')

        # Vader compound if available
        try:
            from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
            analyzer = SentimentIntensityAnalyzer()
            vader = analyzer.polarity_scores(text)
            vader_compound = vader['compound']
        except Exception:
            vader_compound = 0.0

        summary = []
        try:
            summary = tb.noun_phrases[:6] if 'tb' in locals() and hasattr(tb, 'noun_phrases') else []
        except Exception:
            summary = []

        return {
            'score': score,
            'polarity': polarity,
            'vader_compound': vader_compound,
            'flags': flags,
            'summary': summary,
        }
    except Exception as e:
        raise
