/**
 * DRDO DEFENCE BIOMETRIC HUD INTERFACE - CLIENT CONTROLLER
 */

// Web Audio API Synthesizer for Tactical Sci-Fi Sound FX
const AudioSFX = {
    ctx: null,

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
    },

    playBeep(freq = 880, type = 'sine', duration = 0.08) {
        try {
            this.init();
            if (!this.ctx) return;
            if (this.ctx.state === 'suspended') this.ctx.resume();

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

            gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
            console.warn('Audio SFX error:', e);
        }
    },

    playScan() {
        try {
            this.init();
            if (!this.ctx) return;
            if (this.ctx.state === 'suspended') this.ctx.resume();

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(400, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + 0.25);

            gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.25);
        } catch (e) {}
    },

    playAccessGranted() {
        this.playBeep(660, 'sine', 0.1);
        setTimeout(() => this.playBeep(880, 'sine', 0.12), 110);
        setTimeout(() => this.playBeep(1320, 'sine', 0.25), 230);
    },

    playAccessDenied() {
        this.playBeep(220, 'sawtooth', 0.18);
        setTimeout(() => this.playBeep(180, 'sawtooth', 0.25), 180);
    }
};

// HUD Digital Clock Manager
function updateHUDClock() {
    const now = new Date();

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const day = String(now.getDate()).padStart(2, '0');
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const month = monthNames[now.getMonth()];
    const year = now.getFullYear();

    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const dayOfWeek = days[now.getDay()];

    const timeEl = document.getElementById('hud-clock-time');
    const dateEl = document.getElementById('hud-clock-date');

    if (timeEl) timeEl.textContent = `${hours}:${minutes}:${seconds}`;
    if (dateEl) dateEl.textContent = `${day} ${month} ${year} | ${dayOfWeek}`;
}
setInterval(updateHUDClock, 1000);
updateHUDClock();

// Guidance message helper
function setGuidance(msg, type = 'normal') {
    const el = document.getElementById('guidance-msg');
    if (!el) return;
    el.textContent = msg;
    if (type === 'success') {
        el.style.color = '#4ade80';
    } else if (type === 'error') {
        el.style.color = '#f87171';
    } else if (type === 'scanning') {
        el.style.color = '#fbbf24';
    } else {
        el.style.color = '#e2e8f0';
    }
}

// 4-Stage Authentication Pipeline Transition Controller
function setPipelineStage(stage) {
    const stages = ['stage-detection', 'stage-extraction', 'stage-authentication', 'stage-access'];
    stages.forEach(s => {
        const el = document.getElementById(s);
        if (el) {
            el.classList.remove('active', 'success', 'error');
        }
    });

    const accessTitle = document.getElementById('access-stage-title');
    const accessDesc = document.getElementById('access-stage-desc');

    if (stage === 1) {
        document.getElementById('stage-detection')?.classList.add('active');
        if (accessTitle) accessTitle.textContent = 'ACCESS STATUS';
        if (accessDesc) accessDesc.textContent = 'Position face in view';
    } else if (stage === 2) {
        document.getElementById('stage-detection')?.classList.add('success');
        document.getElementById('stage-extraction')?.classList.add('active');
    } else if (stage === 3) {
        document.getElementById('stage-detection')?.classList.add('success');
        document.getElementById('stage-extraction')?.classList.add('success');
        document.getElementById('stage-authentication')?.classList.add('active');
    } else if (stage === 4) {
        document.getElementById('stage-detection')?.classList.add('success');
        document.getElementById('stage-extraction')?.classList.add('success');
        document.getElementById('stage-authentication')?.classList.add('success');
        const accessEl = document.getElementById('stage-access');
        if (accessEl) accessEl.classList.add('active', 'success');
        if (accessTitle) accessTitle.textContent = 'ACCESS GRANTED';
        if (accessDesc) accessDesc.textContent = 'Identity confirmed';
    } else if (stage === -1) {
        // Access Denied / Spoofer
        document.getElementById('stage-detection')?.classList.add('error');
        document.getElementById('stage-authentication')?.classList.add('error');
        const accessEl = document.getElementById('stage-access');
        if (accessEl) accessEl.classList.add('active', 'error');
        if (accessTitle) accessTitle.textContent = 'ACCESS DENIED';
        if (accessDesc) accessDesc.textContent = 'Spoof or unregistered user';
    }
}

// Perform Login / Logout Action
async function performAction(actionType = 'login') {
    AudioSFX.playScan();
    setPipelineStage(2);
    setGuidance('Extracting facial landmarks & biometrics...', 'scanning');

    setTimeout(() => {
        setPipelineStage(3);
        setGuidance('Verifying identity against defense database...', 'scanning');
    }, 450);

    try {
        const response = await fetch(`/api/${actionType}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();

        setTimeout(() => {
            if (data.status === 'SUCCESS') {
                setPipelineStage(4);
                AudioSFX.playAccessGranted();
                const actionLabel = actionType === 'login' ? 'IN-TIME LOGGED' : 'OUT-TIME LOGGED';
                setGuidance(`ACCESS GRANTED: ${data.name} [${actionLabel}]`, 'success');

                // Store verified biometric auth session in localStorage
                try {
                    localStorage.setItem('drdo_authenticated_user', data.name);
                    localStorage.setItem('drdo_auth_timestamp', new Date().toISOString());
                    localStorage.setItem('drdo_auth_status', 'VERIFIED');
                } catch (e) {}

                // If IN-TIME LOGIN, seamlessly navigate to the main GCS Digital Twin platform
                if (actionType === 'login') {
                    setTimeout(() => {
                        setGuidance(`REDIRECTING TO MALE UAV DIGITAL TWIN GCS...`, 'success');
                        const streamImg = document.getElementById('camera-stream');
                        if (streamImg) streamImg.src = '';
                        try {
                            fetch('/api/stop_camera', { method: 'POST', keepalive: true }).catch(() => {});
                        } catch (e) {}

                        const mainGcsUrl = `http://localhost:5173/dashboard?user=${encodeURIComponent(data.name)}&auth=verified`;
                        window.location.href = mainGcsUrl;
                    }, 1000);
                    return;
                }
            } else if (data.status === 'SPOOF_DETECTED') {
                setPipelineStage(-1);
                AudioSFX.playAccessDenied();
                setGuidance(`SECURITY ALERT: Anti-Spoofing Check Failed!`, 'error');
            } else if (data.status === 'NO_FACE') {
                setPipelineStage(1);
                AudioSFX.playAccessDenied();
                setGuidance('No face detected in live feed. Please look directly at camera.', 'error');
            } else {
                setPipelineStage(-1);
                AudioSFX.playAccessDenied();
                setGuidance(`ACCESS DENIED: Unknown personnel. Please enroll first.`, 'error');
            }

            // Reset to stage 1 after 4 seconds
            setTimeout(() => {
                setPipelineStage(1);
                setGuidance('Look into the camera');
            }, 4200);
        }, 850);

    } catch (err) {
        console.error('API Error:', err);
        setPipelineStage(-1);
        AudioSFX.playAccessDenied();
        setGuidance('System communication error. Check server status.', 'error');
        setTimeout(() => {
            setPipelineStage(1);
            setGuidance('Look into the camera');
        }, 3500);
    }
}

// Enrollment Modal
function openEnrollModal() {
    AudioSFX.playBeep(980, 'sine', 0.08);
    const modal = document.getElementById('enroll-modal');
    const input = document.getElementById('enroll-name');
    const status = document.getElementById('enroll-status');
    if (status) status.textContent = '';
    if (input) input.value = '';
    if (modal) modal.classList.add('open');
    if (input) input.focus();
}

function closeEnrollModal() {
    const modal = document.getElementById('enroll-modal');
    if (modal) modal.classList.remove('open');
}

async function submitEnrollment() {
    const input = document.getElementById('enroll-name');
    const status = document.getElementById('enroll-status');
    const name = input ? input.value.trim() : '';

    if (!name) {
        if (status) {
            status.textContent = 'Please enter personnel name / ID.';
            status.className = 'modal-status error';
        }
        return;
    }

    if (status) {
        status.textContent = 'Capturing frame & extracting embeddings...';
        status.className = 'modal-status';
    }
    AudioSFX.playScan();

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        const data = await response.json();

        if (data.status === 'SUCCESS') {
            AudioSFX.playAccessGranted();
            if (status) {
                status.textContent = data.message;
                status.className = 'modal-status success';
            }
            setTimeout(() => {
                closeEnrollModal();
                setGuidance(`Enrolled: ${name}`, 'success');
                setTimeout(() => setGuidance('Look into the camera'), 3000);
            }, 1200);
        } else {
            AudioSFX.playAccessDenied();
            if (status) {
                status.textContent = data.message || 'Enrollment failed.';
                status.className = 'modal-status error';
            }
        }
    } catch (err) {
        if (status) {
            status.textContent = 'Network or server error during enrollment.';
            status.className = 'modal-status error';
        }
    }
}

// Attendance Logs Modal
async function openLogsModal() {
    AudioSFX.playBeep(980, 'sine', 0.08);
    const modal = document.getElementById('logs-modal');
    if (modal) modal.classList.add('open');

    const tableBody = document.getElementById('logs-table-body');
    if (tableBody) tableBody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:18px;">Fetching defense roster logs...</td></tr>';

    try {
        const res = await fetch('/api/logs');
        const data = await res.json();

        document.getElementById('registered-count-badge').textContent = `Enrolled Personnel: ${data.registered_count || 0}`;
        document.getElementById('logs-count-badge').textContent = `Total Logs: ${data.logs.length || 0}`;

        if (!data.logs || data.logs.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:18px; color:#94a3b8;">No attendance events recorded yet.</td></tr>';
            return;
        }

        tableBody.innerHTML = data.logs.map(log => {
            const badgeClass = log.action === 'IN' ? 'badge-in' : 'badge-out';
            return `
                <tr>
                    <td style="font-weight:600; color:#f8fafc;">${escapeHtml(log.name)}</td>
                    <td style="color:#94a3b8;">${escapeHtml(log.time)}</td>
                    <td><span class="${badgeClass}">${escapeHtml(log.action)}</span></td>
                </tr>
            `;
        }).join('');

    } catch (e) {
        if (tableBody) tableBody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:18px; color:#f87171;">Failed to load logs.</td></tr>';
    }
}

function closeLogsModal() {
    const modal = document.getElementById('logs-modal');
    if (modal) modal.classList.remove('open');
}

function handleStreamError() {
    console.warn('Camera stream connection dropped. Retrying...');
    setTimeout(() => {
        const streamImg = document.getElementById('camera-stream');
        if (streamImg) streamImg.src = '/video_feed?t=' + Date.now();
    }, 1000);
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, s => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[s]));
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    setPipelineStage(1);
});

window.addEventListener('pagehide', () => {
    try {
        if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/stop_camera');
        }
    } catch (e) {}
});

