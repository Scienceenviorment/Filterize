from typing import Dict, Any
from PIL import Image
import imagehash
import numpy as np
import io
import ExifRead

def _variance_of_laplacian(img_gray: np.ndarray) -> float:
    # simple sharpness proxy (no cv2 dependency)
    # compute 2D Laplacian via convolution
    kernel = np.array([[0,1,0],[1,-4,1],[0,1,0]], dtype=float)
    from scipy.signal import convolve2d  # lightweight and common
    lap = convolve2d(img_gray.astype(float), kernel, mode="same", boundary="symm")
    return float(np.var(lap))

def analyze_image(file_bytes: bytes) -> Dict[str, Any]:
    """Return simple diagnostics: EXIF present, sharpness, phash, size."""
    out: Dict[str, Any] = {}
    try:
        im = Image.open(io.BytesIO(file_bytes)).convert("RGB")
        out["width"], out["height"] = im.size
        out["p_hash"] = str(imagehash.phash(im))
        gray = np.array(im.convert("L"))
        out["sharpness_score"] = _variance_of_laplacian(gray)
    except Exception as e:
        out["error"] = f"Failed to read image: {e}"
        return out

    # EXIF
    try:
        tags = ExifRead.process_file(io.BytesIO(file_bytes), details=False, strict=True)
        out["exif_present"] = len(tags) > 0
        known_edit = False
        for k in tags:
            v = str(tags[k]).lower()
            if "photoshop" in v or "edited" in v or "snapseed" in v:
                known_edit = True
                break
        out["possible_editor_detected"] = known_edit
    except Exception:
        out["exif_present"] = False
        out["possible_editor_detected"] = False

    # flags (very simple heuristics)
    flags = []
    if out["sharpness_score"] < 5.0:
        flags.append("Image may be low detail or recompressed (low sharpness).")
    if not out.get("exif_present", False):
        flags.append("No EXIF metadata found (common in edited images).")
    if out.get("possible_editor_detected"):
        flags.append("Editor tag found in EXIF (may be edited).")
    if out["width"] * out["height"] < 200*200:
        flags.append("Very small image—could be a screenshot or cropped.")

    out["flags"] = flags
    return out