from typing import Tuple, List, Dict, Any
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib
import functools
from .utils import basic_clean

# Global cache for vectorizer and model
_vectorizer_cache = None
_model_cache = None

def train_text_model(csv_path: str, model_dir: str = "models") -> Dict[str, Any]:
    """Optimized training with better parameters and sampling for large datasets"""
    df = pd.read_csv(csv_path)
    df = df.dropna(subset=["text","label"])
    
    # Sample data if too large for faster training
    if len(df) > 50000:
        print(f"Sampling 50,000 records from {len(df)} for faster training...")
        df = df.sample(n=50000, random_state=42).reset_index(drop=True)
    
    X_text = df["text"].astype(str).apply(basic_clean).tolist()
    y = df["label"].astype(int).values

    # Optimized vectorizer parameters
    vectorizer = TfidfVectorizer(
        ngram_range=(1,2),
        min_df=2,  # Increased from 1 to reduce noise
        max_features=15000,  # Reduced from 20000 for faster processing
        sublinear_tf=True,
        stop_words='english',  # Add stop words removal
        lowercase=True,
        strip_accents='unicode'
    )
    X = vectorizer.fit_transform(X_text)

    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)
    
    # Optimized classifier
    clf = LogisticRegression(
        max_iter=500,  # Increased iterations
        class_weight="balanced",
        solver='liblinear',  # Faster solver
        random_state=42
    )
    clf.fit(X_tr, y_tr)
    y_pred = clf.predict(X_te)
    report = classification_report(y_te, y_pred, output_dict=True)
    
    # Save with compression
    import os, json
    os.makedirs(model_dir, exist_ok=True)
    joblib.dump(vectorizer, f"{model_dir}/vectorizer.joblib", compress=3)
    joblib.dump(clf, f"{model_dir}/text_model.joblib", compress=3)
    with open(f"{model_dir}/last_training_report.json","w",encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    return {"report": report, "model_path": model_dir}

def load_text_model(model_dir: str = "models") -> Tuple[TfidfVectorizer, LogisticRegression]:
    """Load model with caching to avoid repeated file I/O"""
    global _vectorizer_cache, _model_cache
    
    if _vectorizer_cache is None or _model_cache is None:
        import joblib, os
        _vectorizer_cache = joblib.load(f"{model_dir}/vectorizer.joblib")
        _model_cache = joblib.load(f"{model_dir}/text_model.joblib")
    
    return _vectorizer_cache, _model_cache

@functools.lru_cache(maxsize=1000)
def _get_vocab_mapping(vocab_tuple):
    """Cached vocabulary mapping"""
    return {v: k for k, v in dict(vocab_tuple).items()}

def predict_with_explanations(texts: List[str], vec: TfidfVectorizer, clf: LogisticRegression, top_k: int = 5) -> List[Dict[str, Any]]:
    """Optimized prediction with caching and vectorized operations"""
    clean_texts = [basic_clean(t) for t in texts]
    X = vec.transform(clean_texts)
    probs = clf.predict_proba(X)  # [:,1] is prob for class 1 (misleading)
    results = []
    
    # Cache vocabulary mapping
    vocab_tuple = tuple(vec.vocabulary_.items())
    vocab = _get_vocab_mapping(vocab_tuple)
    
    # Vectorized coefficient operations
    coef = clf.coef_[0]
    
    for i, raw in enumerate(texts):
        p_mis = float(probs[i,1])
        label = 1 if p_mis >= 0.5 else 0
        row = X[i]
        
        # Optimized feature contribution calculation
        nz_indices = row.nonzero()[1]
        if len(nz_indices) > 0:
            # Vectorized calculation
            contributions = coef[nz_indices] * row.data
            contribs = [(vocab.get(idx, ""), float(w)) for idx, w in zip(nz_indices, contributions)]
            contribs.sort(key=lambda x: x[1], reverse=True)
            
            top_pos = [(t, w) for t, w in contribs if w > 0][:top_k]
            top_neg = [(t, w) for t, w in contribs if w < 0][:top_k]
        else:
            top_pos = []
            top_neg = []
            
        results.append({
            "input": raw,
            "pred_label": int(label),
            "prob_misleading": p_mis,
            "top_positive_features": top_pos,
            "top_negative_features": top_neg,
        })
    return results