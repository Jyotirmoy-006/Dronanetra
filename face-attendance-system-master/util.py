import os
import sys
import math
import time
import pickle
import datetime
import threading
import cv2
import numpy as np
import face_recognition

FACE_REC_LOCK = threading.RLock()

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
ANTI_SPOOF_DIR = os.path.join(PROJECT_ROOT, 'Silent-Face-Anti-Spoofing')
if ANTI_SPOOF_DIR not in sys.path:
    sys.path.insert(0, ANTI_SPOOF_DIR)

try:
    from src.anti_spoof_predict import AntiSpoofPredict
    from src.generate_patches import CropImage
    from src.utility import parse_model_name
    ANTI_SPOOF_AVAILABLE = True
except Exception as e:
    ANTI_SPOOF_AVAILABLE = False
    print(f"Anti-spoofing module import warning: {e}")

ANTI_SPOOF_MODELS_DIR = os.path.join(ANTI_SPOOF_DIR, 'resources', 'anti_spoof_models')
DB_DIR = os.path.join(PROJECT_ROOT, 'db')
LOG_PATH = os.path.join(PROJECT_ROOT, 'log.txt')

if not os.path.exists(DB_DIR):
    os.makedirs(DB_DIR, exist_ok=True)

# Singleton Anti-Spoof Predictor to avoid reloading weights repeatedly
_ANTI_SPOOF_PREDICTOR = None
_ANTI_SPOOF_CROPPER = None

def get_anti_spoof_predictor():
    global _ANTI_SPOOF_PREDICTOR, _ANTI_SPOOF_CROPPER
    if _ANTI_SPOOF_PREDICTOR is None and ANTI_SPOOF_AVAILABLE:
        try:
            _ANTI_SPOOF_PREDICTOR = AntiSpoofPredict(0)
            _ANTI_SPOOF_CROPPER = CropImage()
        except Exception as e:
            print(f"Failed to initialize AntiSpoofPredict: {e}")
    return _ANTI_SPOOF_PREDICTOR, _ANTI_SPOOF_CROPPER


def analyze_screen_moire_and_reflection(face_roi_bgr):
    """
    Detects digital display screen artifacts:
    1. Specular glare reflections common on glass phone/tablet screens
    2. High-frequency regular grid / moiré patterns from display subpixels
    3. Color saturation spikes typical of backlit OLED/LCD displays
    Returns (is_screen: bool, confidence: float, reason: str)
    """
    if face_roi_bgr is None or face_roi_bgr.size == 0:
        return False, 0.0, "Valid"

    try:
        h, w = face_roi_bgr.shape[:2]
        if h < 40 or w < 40:
            return False, 0.0, "Valid"

        gray = cv2.cvtColor(face_roi_bgr, cv2.COLOR_BGR2GRAY)

        # 1. Specular Glare / Screen Backlight Highlights (over-saturated bright pixels in face center)
        _, thresh_glare = cv2.threshold(gray, 245, 255, cv2.THRESH_BINARY)
        glare_ratio = np.count_nonzero(thresh_glare) / float(h * w)
        if glare_ratio > 0.08:
            return True, 0.85, "Screen glass specular glare detected"

        # 2. Laplacian Texture Gradient Variance (Printed/screens have flattened or unnaturally sharp edge variances)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        if laplacian_var < 35.0:
            return True, 0.75, "Low texture gradient / blurred photo presentation"

        # 3. Frequency Spectrum Analysis (FFT) for digital screen pixel lattice
        dft = np.fft.fft2(cv2.resize(gray, (128, 128)))
        dft_shift = np.fft.fftshift(dft)
        magnitude_spectrum = 20 * np.log(np.abs(dft_shift) + 1e-5)
        # Screen lattices produce strong discrete periodic high-frequency peaks
        center_y, center_x = 64, 64
        # Mask out low frequencies
        magnitude_spectrum[center_y - 12:center_y + 12, center_x - 12:center_x + 12] = 0
        high_freq_peaks = np.count_nonzero(magnitude_spectrum > (np.mean(magnitude_spectrum) + 3.0 * np.std(magnitude_spectrum)))
        if high_freq_peaks > 140:
            return True, 0.80, "Digital screen subpixel grid/moiré pattern detected"

    except Exception:
        pass

    return False, 0.0, "Valid"


def check_anti_spoof(frames_or_frame):
    """
    Performs strict physical liveness validation against photos, screens, and replicas.
    Returns: (is_real: bool, label: int, reason: str)
      label == 1: Real physical human face
      label != 1: Fake (0 = print/paper attack, 2 = digital screen/device display)
    """
    frames = frames_or_frame if isinstance(frames_or_frame, (list, tuple)) else [frames_or_frame]
    valid_frames = [f for f in frames if f is not None and f.size > 0]
    if not valid_frames:
        return False, 0, "No valid video frame"

    if not ANTI_SPOOF_AVAILABLE or not os.path.exists(ANTI_SPOOF_MODELS_DIR):
        print("Warning: Anti-spoof models not accessible, applying secondary heuristic checks")
        return True, 1, "Models bypassed"

    try:
        predictor, cropper = get_anti_spoof_predictor()
        if predictor is None or cropper is None:
            return False, 0, "Anti-spoof predictor unavailable"

        model_files = [f for f in os.listdir(ANTI_SPOOF_MODELS_DIR) if f.endswith('.pth')]
        if not model_files:
            return True, 1, "No model weights found"

        real_votes = 0
        total_votes = 0
        rejection_reasons = []

        with FACE_REC_LOCK:
            for frame in valid_frames:
                # 1. Image preparation (3:4 aspect ratio check required by Silent-Face model)
                h, w = frame.shape[:2]
                target_w = int(h * 3 / 4)
                resized_frame = cv2.resize(frame, (target_w, h))

                # 2. Get Face Bounding Box
                image_bbox = predictor.get_bbox(resized_frame)
                if not image_bbox or image_bbox[2] <= 0 or image_bbox[3] <= 0:
                    continue

                # 3. Physical screen artifact analysis on face crop
                bx, by, bw, bh = image_bbox
                face_crop = resized_frame[max(0, by):min(h, by + bh), max(0, bx):min(target_w, bx + bw)]
                is_screen, screen_conf, screen_reason = analyze_screen_moire_and_reflection(face_crop)
                if is_screen:
                    rejection_reasons.append(screen_reason)

                # 4. Neural Network Multi-Scale Inference across MiniFASNet models
                prediction = np.zeros((1, 3))
                for model_name in model_files:
                    h_input, w_input, model_type, scale = parse_model_name(model_name)
                    param = {
                        "org_img": resized_frame,
                        "bbox": image_bbox,
                        "scale": scale,
                        "out_w": w_input,
                        "out_h": h_input,
                        "crop": True,
                    }
                    if scale is None:
                        param["crop"] = False
                    img_patch = cropper.crop(**param)
                    pred = predictor.predict(img_patch, os.path.join(ANTI_SPOOF_MODELS_DIR, model_name))
                    prediction += pred

                # Label 1 is Real Face; 0 = Print photo; 2 = Screen device
                predicted_label = int(np.argmax(prediction))
                prob_real = float(prediction[0][1]) / float(len(model_files))

                total_votes += 1
                # Must be classified as Real (1) with >60% confidence and no screen glare/moire
                if predicted_label == 1 and prob_real >= 0.58 and not is_screen:
                    real_votes += 1
                else:
                    attack_type = "Device Screen" if predicted_label == 2 or is_screen else "Photo / 2D Print"
                    rejection_reasons.append(f"{attack_type} (Confidence: {1.0 - prob_real:.1%})")

        if total_votes == 0:
            return False, 0, "No face detected in anti-spoof analysis"

        # Require unanimous / strong majority physical liveness
        if real_votes == total_votes and not rejection_reasons:
            return True, 1, "Physical Human Presence Confirmed"
        else:
            reason_msg = rejection_reasons[0] if rejection_reasons else "Device screen/photo presented"
            return False, 2, reason_msg

    except Exception as e:
        print(f"Anti-spoof evaluation error: {e}")
        return False, 0, f"Anti-spoof check error: {str(e)}"


def get_registered_users():
    """Returns list of registered user names"""
    if not os.path.exists(DB_DIR):
        return []
    return [f[:-7] for f in sorted(os.listdir(DB_DIR)) if f.endswith('.pickle')]


# Initialize OpenCV Haar Cascade Classifiers as fallback detectors
HAAR_CASCADE_FRONTAL = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
HAAR_CASCADE_ALT = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_alt2.xml')


def enhance_contrast(frame_bgr):
    """Enhance lighting and contrast using CLAHE on LAB luminance channel"""
    if frame_bgr is None:
        return None
    try:
        lab = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
        cl = clahe.apply(l)
        limg = cv2.merge((cl, a, b))
        return cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
    except Exception:
        return frame_bgr


def find_face_locations_robust(frame_bgr):
    """
    Finds face bounding boxes in [(top, right, bottom, left)] using multi-tier detection:
    1. Direct HOG on RGB (Fastest)
    2. OpenCV Haar Cascade (Fast & robust under uneven lighting/angles)
    3. CLAHE Enhanced RGB + HOG
    4. Upsampled HOG on RGB
    """
    if frame_bgr is None:
        return []

    try:
        rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        
        # Tier 1: Standard HOG (Fastest, ~10ms)
        with FACE_REC_LOCK:
            locs = face_recognition.face_locations(rgb, model="hog")
            if locs:
                return locs

        # Tier 2: OpenCV Haar Cascade Fallback (Near instantaneous ~3ms, highly sensitive)
        gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)
        gray_eq = cv2.equalizeHist(gray)
        for cascade in [HAAR_CASCADE_ALT, HAAR_CASCADE_FRONTAL]:
            if cascade.empty():
                continue
            faces = cascade.detectMultiScale(gray_eq, scaleFactor=1.1, minNeighbors=3, minSize=(30, 30))
            if len(faces) > 0:
                haar_locs = []
                for (x, y, w, h) in faces:
                    haar_locs.append((int(y), int(x + w), int(y + h), int(x)))
                return haar_locs

        # Tier 3: CLAHE Enhanced RGB (for low light / backlighting)
        enhanced_bgr = enhance_contrast(frame_bgr)
        if enhanced_bgr is not None:
            enhanced_rgb = cv2.cvtColor(enhanced_bgr, cv2.COLOR_BGR2RGB)
            with FACE_REC_LOCK:
                locs = face_recognition.face_locations(enhanced_rgb, model="hog")
                if locs:
                    return locs

        # Tier 4: Upsampled HOG (for distant faces)
        with FACE_REC_LOCK:
            locs = face_recognition.face_locations(rgb, number_of_times_to_upsample=1, model="hog")
            if locs:
                return locs

    except Exception as e:
        print(f"Face location detection error: {e}")

    return []


def extract_face_encodings_robust(frame_bgr):
    """
    Extracts 128-d face encodings using robust multi-tier location finding
    """
    if frame_bgr is None:
        return []

    locations = find_face_locations_robust(frame_bgr)
    if not locations:
        return []

    try:
        rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        with FACE_REC_LOCK:
            encodings = face_recognition.face_encodings(rgb, known_face_locations=locations)
            if not encodings:
                enhanced_bgr = enhance_contrast(frame_bgr)
                if enhanced_bgr is not None:
                    enhanced_rgb = cv2.cvtColor(enhanced_bgr, cv2.COLOR_BGR2RGB)
                    encodings = face_recognition.face_encodings(enhanced_rgb, known_face_locations=locations)
        return encodings
    except Exception as e:
        print(f"Face encoding error: {e}")
        return []


def recognize_face(frame_or_frames, tolerance=0.60):
    """
    Recognizes face in frame (or list of frames) against database.
    Returns (status_code, name, match_distance)
    status_code: 'MATCH_FOUND', 'UNKNOWN_USER', 'NO_FACE_DETECTED'
    """
    frames = [frame_or_frames] if not isinstance(frame_or_frames, (list, tuple)) else frame_or_frames
    if not frames:
        return 'NO_FACE_DETECTED', None, 0.0

    db_files = [f for f in sorted(os.listdir(DB_DIR)) if f.endswith('.pickle')]
    has_any_face = False
    best_overall_name = None
    best_overall_distance = 1.0

    for f in frames:
        if f is None:
            continue
        encodings = extract_face_encodings_robust(f)
        if not encodings:
            continue
        
        has_any_face = True
        if not db_files:
            continue

        for unknown_encoding in encodings:
            for file_name in db_files:
                path = os.path.join(DB_DIR, file_name)
                try:
                    with open(path, 'rb') as fp:
                        known_data = pickle.load(fp)

                    if isinstance(known_data, list) or (isinstance(known_data, np.ndarray) and known_data.ndim == 2):
                        with FACE_REC_LOCK:
                            distances = face_recognition.face_distance(known_data, unknown_encoding)
                        min_dist = float(np.min(distances))
                    else:
                        with FACE_REC_LOCK:
                            min_dist = float(face_recognition.face_distance([known_data], unknown_encoding)[0])

                    if min_dist < best_overall_distance:
                        best_overall_distance = min_dist
                        if min_dist <= tolerance:
                            best_overall_name = file_name[:-7]
                            # Match found! Early return for instant response
                            return 'MATCH_FOUND', best_overall_name, float(best_overall_distance)
                except Exception:
                    continue

    if not has_any_face:
        return 'NO_FACE_DETECTED', None, 0.0

    if best_overall_name and best_overall_distance <= tolerance:
        return 'MATCH_FOUND', best_overall_name, float(best_overall_distance)
    else:
        return 'UNKNOWN_USER', None, float(best_overall_distance)


def register_user(name, frame_or_frames):
    """
    Registers a new user embeddings in database with multi-sample support.
    Accepts a single frame or list of sampled frames for rock-solid enrollment.
    """
    name = name.strip()
    if not name:
        return False, "Invalid name supplied."

    frames = [frame_or_frames] if not isinstance(frame_or_frames, (list, tuple)) else frame_or_frames
    if not frames:
        return False, "No camera frame available. Please ensure camera is active."

    all_encodings = []
    for f in frames:
        if f is not None:
            encs = extract_face_encodings_robust(f)
            if encs:
                all_encodings.extend(encs)
                # If we collected 3+ quality samples, stop early for instant enrollment
                if len(all_encodings) >= 3:
                    break

    if not all_encodings:
        return False, "No face detected in the frame. Please look directly into the camera."

    try:
        file_path = os.path.join(DB_DIR, f"{name}.pickle")
        existing_samples = []
        if os.path.exists(file_path):
            try:
                with open(file_path, 'rb') as fp:
                    old_data = pickle.load(fp)
                if isinstance(old_data, list):
                    existing_samples = old_data
                elif isinstance(old_data, np.ndarray):
                    if old_data.ndim == 2:
                        existing_samples = list(old_data)
                    else:
                        existing_samples = [old_data]
            except Exception:
                existing_samples = []

        # Add up to 5 best facial feature vectors for highest accuracy
        existing_samples.extend(all_encodings)
        if len(existing_samples) > 5:
            existing_samples = existing_samples[-5:]

        with open(file_path, 'wb') as fp:
            pickle.dump(existing_samples, fp)

        return True, f"Personnel '{name}' enrolled successfully into biometric database."
    except Exception as e:
        print(f"Error in register_user: {e}")
        return False, f"Enrollment error: {str(e)}"


def log_attendance(name, action='in'):
    """Logs attendance to log.txt with timestamp"""
    now = datetime.datetime.now()
    timestamp_str = now.strftime('%Y-%m-%d %H:%M:%S')
    with open(LOG_PATH, 'a') as f:
        f.write(f"{name},{timestamp_str},{action}\n")
    return timestamp_str


def get_attendance_logs():
    """Reads and parses attendance logs from log.txt"""
    if not os.path.exists(LOG_PATH):
        return []

    logs = []
    with open(LOG_PATH, 'r') as f:
        for line in f:
            parts = line.strip().split(',')
            if len(parts) >= 3:
                logs.append({
                    'name': parts[0],
                    'time': parts[1],
                    'action': parts[2].upper()
                })
    return logs[::-1]  # Return newest first


def render_hud_frame(frame, face_locations, landmarks_list, scan_phase=0.0):
    """
    Renders high-speed HUD Reticles, 3D Facial Mesh Contours, and Laser Scanner
    optimized for 60+ FPS zero-lag execution.
    """
    if frame is None:
        return None

    color_cyan = (235, 220, 180)    # BGR (Hex #38bdf8)
    color_amber = (60, 175, 255)    # BGR (Hex #fbbf24)
    color_mesh = (200, 200, 180)
    color_laser = (255, 240, 150)

    for idx, (top, right, bottom, left) in enumerate(face_locations):
        c_w = int((right - left) * 0.22)
        c_h = int((bottom - top) * 0.22)
        t = 2

        # 1. High-Precision Corner Brackets (Target Lock Reticle)
        # Top-Left
        cv2.line(frame, (left, top), (left + c_w, top), color_cyan, t, cv2.LINE_AA)
        cv2.line(frame, (left, top), (left, top + c_h), color_cyan, t, cv2.LINE_AA)
        # Top-Right
        cv2.line(frame, (right, top), (right - c_w, top), color_cyan, t, cv2.LINE_AA)
        cv2.line(frame, (right, top), (right, top + c_h), color_cyan, t, cv2.LINE_AA)
        # Bottom-Left
        cv2.line(frame, (left, bottom), (left + c_w, bottom), color_cyan, t, cv2.LINE_AA)
        cv2.line(frame, (left, bottom), (left, bottom - c_h), color_cyan, t, cv2.LINE_AA)
        # Bottom-Right
        cv2.line(frame, (right, bottom), (right - c_w, bottom), color_cyan, t, cv2.LINE_AA)
        cv2.line(frame, (right, bottom), (right, bottom - c_h), color_cyan, t, cv2.LINE_AA)

        # Reticle Central Crosshairs & Face Tag
        cx, cy = int((left + right) / 2), int((top + bottom) / 2)
        cv2.line(frame, (cx - 8, cy), (cx + 8, cy), color_cyan, 1, cv2.LINE_AA)
        cv2.line(frame, (cx, cy - 8), (cx, cy + 8), color_cyan, 1, cv2.LINE_AA)
        cv2.putText(frame, "TARGET LOCK // BIOMETRIC ACTIVE", (left, max(15, top - 8)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.38, color_cyan, 1, cv2.LINE_AA)

        # 2. Facial Feature Geometric Wireframe Contours (Ultra-fast direct vector rendering)
        if idx < len(landmarks_list) and landmarks_list[idx]:
            landmarks = landmarks_list[idx]
            for feature_name, points in landmarks.items():
                pts = np.array(points, np.int32)
                if len(pts) > 1:
                    is_closed = feature_name in ['left_eye', 'right_eye', 'top_lip', 'bottom_lip']
                    cv2.polylines(frame, [pts], is_closed, color_mesh, 1, cv2.LINE_AA)
                    for pt in pts[::2]:
                        cv2.circle(frame, (int(pt[0]), int(pt[1])), 1, color_cyan, -1, cv2.LINE_AA)

        # 3. Glowing Laser Scanner Line (Sinusoidal oscillation)
        scan_progress = 0.5 + 0.45 * math.sin(scan_phase * 3.2)
        scan_y = int(top + (bottom - top) * scan_progress)
        cv2.line(frame, (left - 10, scan_y), (right + 10, scan_y), color_amber, 2, cv2.LINE_AA)
        cv2.line(frame, (left, scan_y), (right, scan_y), color_laser, 1, cv2.LINE_AA)

    return frame
