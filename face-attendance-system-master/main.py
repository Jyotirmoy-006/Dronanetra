import os
import sys
import time
import threading
import webbrowser
import cv2
import numpy as np
from flask import Flask, render_template, Response, jsonify, request
from flask_cors import CORS
import face_recognition

import util

import base64

app = Flask(__name__)
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.jinja_env.auto_reload = True
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

def _get_request_frames():
    """Helper to extract frames either from base64 JSON payload or live CameraStreamManager"""
    try:
        if request.is_json:
            data = request.get_json() or {}
            img_b64 = data.get('image')
            if img_b64:
                if ',' in img_b64:
                    img_b64 = img_b64.split(',', 1)[1]
                img_bytes = base64.b64decode(img_b64)
                np_arr = np.frombuffer(img_bytes, np.uint8)
                frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
                if frame is not None and frame.size > 0:
                    return [frame, frame]
    except Exception as e:
        print(f"Frame extraction warning: {e}")
    return camera_manager.get_recent_frames(count=2)

class CameraStreamManager:
    def __init__(self):
        self.cap = None
        self.is_running = False
        self.streaming_active = False
        self.active_clients = 0
        self.idle_timer = None
        self.lock = threading.Lock()
        self.latest_raw_frame = None
        self.latest_encoded_bytes = None
        self.scan_phase = 0.0
        self.face_locations = []
        self.landmarks_list = []

    def start(self):
        if self.is_running:
            return
        self.is_running = True
        self.streaming_active = True
        self.open_camera()
        # Thread 1: Camera acquisition & high-speed HUD frame rendering
        self.capture_thread = threading.Thread(target=self._capture_loop, daemon=True)
        self.capture_thread.start()
        # Thread 2: Asynchronous AI face & landmark tracking
        self.tracking_thread = threading.Thread(target=self._tracking_loop, daemon=True)
        self.tracking_thread.start()

    def resume_camera(self):
        """Resume active camera capture if paused"""
        with self.lock:
            if self.idle_timer:
                self.idle_timer.cancel()
                self.idle_timer = None
            self.streaming_active = True
            if self.cap is None or not self.cap.isOpened():
                self._open_camera_unlocked()

    def pause_camera(self):
        """Immediately stop capture and release hardware device"""
        with self.lock:
            if self.idle_timer:
                self.idle_timer.cancel()
                self.idle_timer = None
            self.streaming_active = False
            self.active_clients = 0
            self._release_camera_unlocked()

    def add_client(self):
        with self.lock:
            if self.idle_timer:
                self.idle_timer.cancel()
                self.idle_timer = None
            self.active_clients += 1
            self.streaming_active = True
            if self.cap is None or not self.cap.isOpened():
                self._open_camera_unlocked()

    def remove_client(self):
        with self.lock:
            self.active_clients = max(0, self.active_clients - 1)
            if self.active_clients == 0:
                if self.idle_timer:
                    self.idle_timer.cancel()
                self.idle_timer = threading.Timer(3.0, self._check_idle_release)
                self.idle_timer.daemon = True
                self.idle_timer.start()

    def _check_idle_release(self):
        with self.lock:
            if self.active_clients == 0:
                self.streaming_active = False
                self._release_camera_unlocked()

    def open_camera(self):
        with self.lock:
            return self._open_camera_unlocked()

    def _open_camera_unlocked(self):
        if self.cap is not None:
            self.cap.release()
            self.cap = None

        backends = [cv2.CAP_AVFOUNDATION, cv2.CAP_ANY] if sys.platform == 'darwin' else [cv2.CAP_ANY]
        for backend in backends:
            for idx in [0, 1, 2]:
                try:
                    test_cap = cv2.VideoCapture(idx, backend)
                    if test_cap.isOpened():
                        test_cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                        test_cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
                        test_cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
                        ret, frame = test_cap.read()
                        if ret and frame is not None:
                            self.cap = test_cap
                            return True
                    test_cap.release()
                except Exception:
                    pass
        return False

    def _release_camera_unlocked(self):
        if self.cap is not None:
            try:
                self.cap.release()
            except Exception:
                pass
            self.cap = None
        self.latest_raw_frame = None
        self.latest_encoded_bytes = None
        self.face_locations = []
        self.landmarks_list = []

    def _capture_loop(self):
        """High-speed video capture and HUD compositor"""
        while self.is_running:
            if not self.streaming_active:
                time.sleep(0.1)
                continue

            if self.cap is None or not self.cap.isOpened():
                if not self.open_camera():
                    time.sleep(0.5)
                    continue

            ret, frame = self.cap.read()
            if not ret or frame is None:
                time.sleep(0.01)
                continue

            # Update latest raw frame
            with self.lock:
                self.latest_raw_frame = frame.copy()
                cached_locations = list(self.face_locations)
                cached_landmarks = list(self.landmarks_list)

            # Advance scanner animation phase smoothly
            self.scan_phase += 0.08

            # Render lightweight HUD target reticle & mesh
            annotated_frame = frame.copy()
            if cached_locations:
                annotated_frame = util.render_hud_frame(
                    annotated_frame,
                    cached_locations,
                    cached_landmarks,
                    scan_phase=self.scan_phase
                )

            # Pre-encode JPEG with optimized quality for zero-lag streaming
            ret, buffer = cv2.imencode('.jpg', annotated_frame, [cv2.IMWRITE_JPEG_QUALITY, 78])
            if ret:
                with self.lock:
                    self.latest_encoded_bytes = buffer.tobytes()

            time.sleep(0.015)

    def _tracking_loop(self):
        """Background AI tracking thread - updates face bounds without slowing video frames"""
        while self.is_running:
            if not self.streaming_active:
                time.sleep(0.15)
                continue

            raw_frame = self.get_raw_frame()
            if raw_frame is None:
                time.sleep(0.1)
                continue

            try:
                small = cv2.resize(raw_frame, (0, 0), fx=0.5, fy=0.5)
                rgb_small = cv2.cvtColor(small, cv2.COLOR_BGR2RGB)
                
                with util.FACE_REC_LOCK:
                    locs = face_recognition.face_locations(rgb_small, model="hog")

                if locs:
                    scaled_locs = [(t * 2, r * 2, b * 2, l * 2) for (t, r, b, l) in locs]
                else:
                    scaled_locs = util.find_face_locations_robust(raw_frame)

                if scaled_locs:
                    rgb_full = cv2.cvtColor(raw_frame, cv2.COLOR_BGR2RGB)
                    with util.FACE_REC_LOCK:
                        landmarks = face_recognition.face_landmarks(rgb_full, scaled_locs)
                    with self.lock:
                        self.face_locations = scaled_locs
                        self.landmarks_list = landmarks
                else:
                    with self.lock:
                        self.face_locations = []
                        self.landmarks_list = []
            except Exception:
                with self.lock:
                    self.face_locations = []
                    self.landmarks_list = []

            time.sleep(0.12)

    def get_raw_frame(self):
        with self.lock:
            if self.latest_raw_frame is not None:
                return self.latest_raw_frame.copy()
            return None

    def get_recent_frames(self, count=2):
        frames = []
        with self.lock:
            if self.latest_raw_frame is not None:
                frames.append(self.latest_raw_frame.copy())
        if not frames:
            time.sleep(0.03)
            with self.lock:
                if self.latest_raw_frame is not None:
                    frames.append(self.latest_raw_frame.copy())
        return frames

    def get_encoded_hud_frame(self):
        with self.lock:
            if self.latest_encoded_bytes is not None:
                return self.latest_encoded_bytes

        # Standby / initialization placeholder
        placeholder = np.zeros((480, 640, 3), dtype=np.uint8)
        cv2.putText(placeholder, "INITIALIZING BIOMETRIC FEED...", (120, 240),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (56, 189, 248), 2)
        ret, buffer = cv2.imencode('.jpg', placeholder, [cv2.IMWRITE_JPEG_QUALITY, 75])
        return buffer.tobytes() if ret else None

    def stop(self):
        self.is_running = False
        self.streaming_active = False
        with self.lock:
            self._release_camera_unlocked()

camera_manager = CameraStreamManager()


# Flask Routes
@app.route('/')
def index():
    camera_manager.resume_camera()
    return render_template('loading.html')


@app.route('/dashboard')
@app.route('/login')
def dashboard():
    threading.Thread(target=camera_manager.resume_camera, daemon=True).start()
    return render_template('index.html')


@app.route('/video_feed')
def video_feed():
    camera_manager.start()
    camera_manager.add_client()
    def generate():
        try:
            while camera_manager.streaming_active:
                frame_bytes = camera_manager.get_encoded_hud_frame()
                if frame_bytes is not None:
                    yield (b'--frame\r\n'
                           b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
                time.sleep(0.02)
        except GeneratorExit:
            pass
        finally:
            camera_manager.remove_client()

    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/api/stop_camera', methods=['POST', 'GET'])
def api_stop_camera():
    """Endpoint called to immediately release the camera device upon login or page exit"""
    camera_manager.pause_camera()
    return jsonify({'status': 'CAMERA_STOPPED', 'message': 'Camera released successfully'})


@app.route('/api/login', methods=['POST'])
def api_login():
    frames = _get_request_frames()
    if not frames:
        return jsonify({'status': 'NO_FRAME', 'message': 'No camera frame available'}), 400

    # 1. Mandatory Physical Liveness & Anti-Spoofing validation
    is_real, spoof_label, spoof_reason = util.check_anti_spoof(frames)
    if not is_real:
        return jsonify({
            'status': 'SPOOF_DETECTED',
            'message': f'Access Denied: {spoof_reason}. Please present yourself physically in front of the camera.'
        })

    # 2. Facial Recognition against enrolled defense database (only if physical presence confirmed)
    status_code, name, distance = util.recognize_face(frames)

    if status_code == 'MATCH_FOUND':
        timestamp = util.log_attendance(name, action='in')
        # Release camera immediately on successful authentication
        camera_manager.pause_camera()
        return jsonify({
            'status': 'SUCCESS',
            'name': name,
            'timestamp': timestamp,
            'distance': distance,
            'message': f'Welcome back, {name}. Physical presence verified.'
        })
    elif status_code == 'NO_FACE_DETECTED':
        return jsonify({'status': 'NO_FACE', 'message': 'No face detected in live feed.'})
    else:
        return jsonify({'status': 'UNKNOWN_USER', 'message': 'Unknown user. Please enroll first.'})


@app.route('/api/logout', methods=['POST'])
def api_logout():
    frames = _get_request_frames()
    if not frames:
        return jsonify({'status': 'NO_FRAME', 'message': 'No camera frame available'}), 400

    # 1. Mandatory Physical Liveness & Anti-Spoofing validation
    is_real, spoof_label, spoof_reason = util.check_anti_spoof(frames)
    if not is_real:
        return jsonify({
            'status': 'SPOOF_DETECTED',
            'message': f'Access Denied: {spoof_reason}. Please present yourself physically in front of the camera.'
        })

    # 2. Facial Recognition against enrolled defense database
    status_code, name, distance = util.recognize_face(frames)

    if status_code == 'MATCH_FOUND':
        timestamp = util.log_attendance(name, action='out')
        camera_manager.pause_camera()
        return jsonify({
            'status': 'SUCCESS',
            'name': name,
            'timestamp': timestamp,
            'distance': distance,
            'message': f'Goodbye, {name}. OUT-Time logged.'
        })
    elif status_code == 'NO_FACE_DETECTED':
        return jsonify({'status': 'NO_FACE', 'message': 'No face detected in live feed.'})
    else:
        return jsonify({'status': 'UNKNOWN_USER', 'message': 'Unknown user. Please enroll first.'})


@app.route('/api/register', methods=['POST'])
def api_register():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    if not name:
        return jsonify({'status': 'ERROR', 'message': 'Personnel name is required.'}), 400

    frames = _get_request_frames()
    if not frames:
        return jsonify({'status': 'ERROR', 'message': 'No camera feed available. Please check camera.'}), 400

    # Ensure live physical presence during enrollment
    is_real, spoof_label, spoof_reason = util.check_anti_spoof(frames)
    if not is_real:
        return jsonify({
            'status': 'ERROR',
            'message': f'Enrollment Rejected: {spoof_reason}. Real physical presence required.'
        }), 400

    success, message = util.register_user(name, frames)
    if success:
        return jsonify({'status': 'SUCCESS', 'message': message, 'name': name})
    else:
        return jsonify({'status': 'ERROR', 'message': message}), 400


@app.route('/api/logs', methods=['GET'])
def api_logs():
    logs = util.get_attendance_logs()
    registered = util.get_registered_users()
    return jsonify({
        'logs': logs,
        'registered_users': registered,
        'registered_count': len(registered)
    })


def open_browser():
    time.sleep(1.2)
    url = "http://127.0.0.1:5050"
    print(f"\n=======================================================")
    print(f" DRDO DEFENCE SECURE ACCESS HUD LIVE AT: {url}")
    print(f"=======================================================\n")
    try:
        webbrowser.open(url)
    except Exception:
        pass


if __name__ == '__main__':
    if os.environ.get("AUTO_OPEN_BROWSER") == "1":
        threading.Thread(target=open_browser, daemon=True).start()
    print("\n=======================================================")
    print(" DRDO DEFENCE SECURE BIOMETRIC SERVICE RUNNING AT: http://127.0.0.1:5050")
    print("=======================================================\n")
    try:
        app.run(host='127.0.0.1', port=5050, debug=False, threaded=True)
    finally:
        camera_manager.stop()
