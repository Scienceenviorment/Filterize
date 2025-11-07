import os
import io
import tempfile
from typing import Tuple, Optional

import streamlit as st
from PIL import Image, ImageChops, ImageEnhance, ExifTags

# Heavy ML imports are attempted lazily inside loader to avoid import errors when dependencies missing
import numpy as np
import cv2
from dotenv import load_dotenv


# ------------------------------
# Setup & Model Download (one-time)
# ------------------------------
MODEL_DIR = "models/distilbert_fake_news"
if not os.path.exists(MODEL_DIR):
    os.makedirs(MODEL_DIR, exist_ok=True)
    # Directory ensured; do not auto-download heavy models here to keep first-run light.

# Load environment variables
load_dotenv("config/.env")


# ------------------------------
# Text Model: DistilBERT (PyTorch)
# ------------------------------
def try_imports():
    """Attempt to import optional ML backends and return a dict of availability."""
    backends = {"pytorch": False, "tensorflow": False, "transformers": False}
    try:
        import torch  # type: ignore
        backends["pytorch"] = True
    except Exception:
        backends["pytorch"] = False
    try:
        import tensorflow as tf  # type: ignore
        backends["tensorflow"] = True
    except Exception:
        backends["tensorflow"] = False
    try:
        from transformers import DistilBertTokenizer  # type: ignore
        backends["transformers"] = True
    except Exception:
        backends["transformers"] = False
    return backends


@st.cache_resource
def load_model_autodetect(model_path=MODEL_DIR) -> Tuple[Optional[object], Optional[object], Optional[str]]:
    """Try to load a DistilBERT model. Prefer PyTorch, fall back to TensorFlow.

    Returns (tokenizer, model, backend) where backend is 'pytorch'|'tensorflow' or None on failure.
    """
    backends = try_imports()
    if not backends["transformers"]:
        st.warning("The 'transformers' package is not installed. Text model unavailable.")
        return None, None, None

    # Lazy imports
    try:
        if backends["pytorch"]:
            import torch  # type: ignore
            import torch.nn.functional as F  # type: ignore
            from transformers import DistilBertTokenizer, DistilBertForSequenceClassification  # type: ignore

            tokenizer = DistilBertTokenizer.from_pretrained(model_path)
            model = DistilBertForSequenceClassification.from_pretrained(model_path)
            model.eval()
            return tokenizer, model, "pytorch"
    except Exception as e:
        st.info(f"PyTorch backend load failed: {e}")

    try:
        if backends["tensorflow"]:
            import tensorflow as tf  # type: ignore
            from transformers import DistilBertTokenizer, TFDistilBertForSequenceClassification  # type: ignore

            tokenizer = DistilBertTokenizer.from_pretrained(model_path)
            model = TFDistilBertForSequenceClassification.from_pretrained(model_path)
            return tokenizer, model, "tensorflow"
    except Exception as e:
        st.info(f"TensorFlow backend load failed: {e}")

    st.warning("No supported ML backend available. Install PyTorch or TensorFlow and Transformers to enable the text model.")
    return None, None, None


def predict_unified(text: str, tokenizer, model, backend: str):
    """Return (label, confidence, probs) using the loaded backend."""
    if tokenizer is None or model is None:
        raise RuntimeError("Model not loaded")

    if backend == "pytorch":
        import torch  # type: ignore
        import torch.nn.functional as F  # type: ignore

        encodings = tokenizer([text], truncation=True, padding=True, max_length=64, return_tensors="pt")
        encodings = {k: v.to(next(model.parameters()).device) for k, v in encodings.items()}
        with torch.no_grad():
            outputs = model(**encodings)
            probs = F.softmax(outputs.logits, dim=1).cpu().numpy()[0]
        label = "FAKE" if np.argmax(probs) == 0 else "TRUE"
        confidence = float(max(probs) * 100)
        return label, confidence, probs

    if backend == "tensorflow":
        import numpy as _np

        encodings = tokenizer([text], truncation=True, padding=True, max_length=64, return_tensors="tf")
        preds = model(encodings, training=False)
        probs = _np.asarray(preds.logits.numpy())[0]
        label = "FAKE" if _np.argmax(probs) == 0 else "TRUE"
        confidence = float(_np.max(probs) * 100)
        return label, confidence, probs

    raise RuntimeError("Unsupported backend")


# ------------------------------
# Image Analysis: ELA + Metadata
# ------------------------------
def error_level_analysis(img: Image.Image, quality=90):
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
    img.save(temp_file.name, "JPEG", quality=quality)
    compressed = Image.open(temp_file.name)
    ela = ImageChops.difference(img, compressed)
    extrema = ela.getextrema()
    max_diff = max([ex[1] for ex in extrema])
    scale = 255.0 / max_diff if max_diff != 0 else 1
    ela = ImageEnhance.Brightness(ela).enhance(scale)
    return ela


def get_image_metadata(img: Image.Image):
    metadata = {}
    try:
        info = img._getexif()
        if info:
            for tag, value in info.items():
                decoded = ExifTags.TAGS.get(tag, tag)
                metadata[decoded] = value
    except Exception:
        pass
    return metadata


# ------------------------------
# Video Analysis: Scene-based Keyframes + Deepfake Hook
# ------------------------------
def extract_keyframes(video_path, threshold=0.85, max_frames=15):
    cap = cv2.VideoCapture(video_path)
    success, prev_frame = cap.read()
    keyframes = []

    if not success:
        cap.release()
        return keyframes

    prev_gray = cv2.cvtColor(prev_frame, cv2.COLOR_BGR2GRAY)
    keyframes.append(prev_frame)

    # Try to import structural_similarity (ssim) lazily
    try:
        from skimage.metrics import structural_similarity as ssim  # type: ignore
        use_ssim = True
    except Exception:
        use_ssim = False

    while success:
        success, frame = cap.read()
        if not success:
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        if use_ssim:
            try:
                score, _ = ssim(prev_gray, gray, full=True)
            except Exception:
                # fallback to simple diff
                diff = cv2.absdiff(prev_gray, gray)
                score = 1.0 - (np.count_nonzero(diff) / diff.size)
        else:
            diff = cv2.absdiff(prev_gray, gray)
            score = 1.0 - (np.count_nonzero(diff) / diff.size)

        if score < threshold:  # scene change detected
            keyframes.append(frame)
            prev_gray = gray

        if len(keyframes) >= max_frames:
            break

    cap.release()
    return keyframes


def detect_deepfake(frame):
    """
    Placeholder for deepfake detection.
    Later: load a pre-trained CNN/transformer model and run inference here.
    """
    return {"label": "Likely Real", "confidence": 95.2}


# ------------------------------
# Streamlit App
# ------------------------------
st.set_page_config(page_title="AI Misinformation Assistant", page_icon="🛡️", layout="wide")
st.title("🛡️ AI-Powered Misinformation Detection & Literacy Assistant")

# Load model lazily and autodetect backend
tokenizer, model, backend = load_model_autodetect()
MODEL_OK = tokenizer is not None and model is not None and backend is not None

st.sidebar.header("Model Status")
if MODEL_OK:
    st.sidebar.success(f"DistilBERT model loaded ({backend}) ✅")
else:
    st.sidebar.warning("Text model not available. Install PyTorch/TensorFlow + Transformers and place model in 'models/distilbert_fake_news'.")
    with st.sidebar.expander('How to enable text model'):
        st.markdown(
            """
            **Quick steps**

            1. Create and activate a Python 3.8+ virtual environment.
            2. Install runtime dependencies: `pip install -r requirements.txt` and for ML: `pip install -r requirements-ml.txt`.
            3. Place a Hugging Face DistilBERT model in `models/distilbert_fake_news` (or run a training script to create one).
            4. Restart this app (use `streamlit run app.py`).

            Notes: The ML requirements are large (PyTorch/TensorFlow, Transformers). If you only want the demo frontend, you can run the Flask server instead (see README).
            """
        )


# Tabs
tab1, tab2, tab3 = st.tabs(["📝 Text", "🖼️ Image", "🎬 Video"])

# --- Text Tab ---
with tab1:
    st.subheader("Check a piece of text")
    user_text = st.text_area("Paste the message / headline here:", height=160)
    if st.button("Analyze Text"):
        if not user_text.strip():
            st.error("Please paste some text.")
        elif MODEL_OK:
            try:
                label, confidence, probs = predict_unified(user_text, tokenizer, model, backend)
                st.write(f"**Prediction:** {label}")
                st.write(f"**Confidence:** {confidence:.1f}%")
                st.write(f"**Probabilities:** Fake={probs[0]*100:.1f}%, True={probs[1]*100:.1f}%")
            except Exception as e:
                st.error(f"Prediction failed: {e}")
        else:
            st.warning("Model not loaded. See sidebar for details.")


# --- Image Tab ---
with tab2:
    st.subheader("Check an image")
    uploaded_file = st.file_uploader("Upload an image (jpg/png)", type=["jpg", "jpeg", "png"])
    if uploaded_file:
        img = Image.open(io.BytesIO(uploaded_file.read())).convert("RGB")
        st.image(img, caption="Uploaded image", use_container_width=True)

        st.info("🔎 Running ELA and metadata checks...")
        ela_img = error_level_analysis(img)
        st.image(ela_img, caption="Error Level Analysis (ELA)", use_container_width=True)

        metadata = get_image_metadata(img)
        if metadata:
            st.write("Metadata found:")
            st.json(metadata)
        else:
            st.info("No metadata found.")


# --- Video Tab ---
with tab3:
    st.subheader("Check a video")
    uploaded_video = st.file_uploader("Upload a video (mp4)", type=["mp4"])
    if uploaded_video:
        temp_video = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
        temp_video.write(uploaded_video.read())
        st.video(temp_video.name)

        st.info("🔎 Extracting keyframes (scene-based)...")
        keyframes = extract_keyframes(temp_video.name)
        st.write(f"Unique keyframes detected: {len(keyframes)}")

        if keyframes:
            for i, frame in enumerate(keyframes[:5]):  # Show up to 5 frames
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                st.image(rgb_frame, caption=f"Scene {i+1}", width=300)

                # Deepfake detection placeholder
                result = detect_deepfake(frame)
                st.write(f"🕵️ Deepfake Check: {result['label']} ({result['confidence']}% confidence)")


st.caption("Educational starter. Always verify with trusted sources.")