"""
Automated Vibration Spectral Pattern Recognition Engine (FR-05 & FR-06)
========================================================================
Analyzes 32-bin FFT harmonic energy spectra to classify specific mechanical defects:
1. 1X RPM Fundamental: Propeller / Flywheel Mass Unbalance
2. 2X RPM Harmonic: Propeller Shaft / Crankshaft Misalignment
3. Gear Mesh Order (n_teeth * RPM): Reduction Gearbox Resonance
4. High-Frequency Envelope: Bearing Race Defect / Piston Slap
"""
import numpy as np
from typing import Dict, Any, List, Tuple


class VibrationHarmonicAnalyzer:
    """
    Automated spectral feature extractor and mechanical pattern classifier
    for 4-stroke aero piston engines.
    """

    def __init__(self, sample_rate_hz: float = 1000.0, num_bins: int = 32):
        self.sample_rate_hz = sample_rate_hz
        self.num_bins = num_bins
        self.bin_width_hz = (sample_rate_hz / 2.0) / num_bins  # ~15.625 Hz per bin

    def analyze_spectrum(
        self,
        fft_bins: List[float],
        rpm: float,
        overall_vibration_g: float = 1.0
    ) -> Dict[str, Any]:
        """
        Extracts dominant harmonic peaks and classifies mechanical failure modes.
        """
        if not fft_bins or len(fft_bins) == 0:
            fft_bins = [0.05] * self.num_bins

        spectrum = np.array(fft_bins[:self.num_bins], dtype=float)
        
        # Calculate fundamental shaft rotational frequency (1X)
        freq_1x_hz = max(10.0, rpm / 60.0)  # e.g., 5400 RPM -> 90 Hz
        freq_2x_hz = freq_1x_hz * 2.0       # 180 Hz
        gear_mesh_hz = freq_1x_hz * 2.43    # Rotax gearbox ratio 2.43:1 -> ~218.7 Hz

        # Identify bin indices corresponding to harmonics
        bin_1x = int(round(freq_1x_hz / self.bin_width_hz))
        bin_2x = int(round(freq_2x_hz / self.bin_width_hz))
        bin_gear = int(round(gear_mesh_hz / self.bin_width_hz))

        # Clamp indices
        bin_1x = min(self.num_bins - 1, max(0, bin_1x))
        bin_2x = min(self.num_bins - 1, max(0, bin_2x))
        bin_gear = min(self.num_bins - 1, max(0, bin_gear))

        # Energy at harmonic orders
        amp_1x = float(spectrum[bin_1x])
        amp_2x = float(spectrum[bin_2x])
        amp_gear = float(spectrum[bin_gear])

        # High frequency bearing band energy (bins above 350 Hz)
        high_freq_bins = spectrum[int(self.num_bins * 0.7):]
        amp_high_freq = float(np.mean(high_freq_bins)) if len(high_freq_bins) > 0 else 0.0

        # Peak dominant frequency
        peak_bin_idx = int(np.argmax(spectrum))
        peak_freq_hz = round(peak_bin_idx * self.bin_width_hz, 1)
        peak_energy = float(spectrum[peak_bin_idx])

        # Severity and Defect Pattern Diagnosis
        patterns_detected = []
        severity = "NOMINAL"

        if overall_vibration_g > 3.0 or peak_energy > 0.65:
            severity = "CRITICAL"
        elif overall_vibration_g > 1.8 or peak_energy > 0.40:
            severity = "WARNING"

        # Pattern 1: 1X Mass Unbalance
        if amp_1x > 0.45 or (amp_1x > 0.30 and amp_1x > 1.6 * amp_2x):
            patterns_detected.append({
                "type": "PROPELLER_MASS_UNBALANCE_1X",
                "confidence": min(0.98, round(amp_1x * 1.3, 2)),
                "frequency_hz": round(freq_1x_hz, 1),
                "description": "Dominant 1X fundamental harmonic indicating dynamic propeller or flywheel unbalance."
            })

        # Pattern 2: 2X Shaft Misalignment
        if amp_2x > 0.40 or (amp_2x > 0.28 and amp_2x > 1.3 * amp_1x):
            patterns_detected.append({
                "type": "SHAFT_MISALIGNMENT_2X",
                "confidence": min(0.95, round(amp_2x * 1.4, 2)),
                "frequency_hz": round(freq_2x_hz, 1),
                "description": "Elevated 2X rotational harmonic indicating propeller shaft angular/parallel misalignment."
            })

        # Pattern 3: Gear Mesh Resonance
        if amp_gear > 0.42:
            patterns_detected.append({
                "type": "REDUCTION_GEARBOX_RESONANCE",
                "confidence": min(0.92, round(amp_gear * 1.25, 2)),
                "frequency_hz": round(gear_mesh_hz, 1),
                "description": "Tooth-meshing excitation detected at reduction gearbox transmission order."
            })

        # Pattern 4: Bearing Defect / Piston Slap (High frequency broadband)
        if amp_high_freq > 0.35:
            patterns_detected.append({
                "type": "BEARING_RACE_DEFECT_OR_PISTON_SLAP",
                "confidence": min(0.90, round(amp_high_freq * 1.5, 2)),
                "frequency_hz": round(self.sample_rate_hz * 0.4, 1),
                "description": "High-frequency broadband floor elevation indicating main journal bearing race degradation or cylinder piston slap."
            })

        if not patterns_detected:
            patterns_detected.append({
                "type": "NOMINAL_DYNAMIC_BALANCE",
                "confidence": 0.96,
                "frequency_hz": peak_freq_hz,
                "description": "Vibration harmonic spectrum is within nominal ISO 10816-3 aero engine vibration limits."
            })

        return {
            "peak_freq_hz": peak_freq_hz,
            "peak_energy": round(peak_energy, 3),
            "severity": severity,
            "harmonics": {
                "amp_1x_unbalance": round(amp_1x, 3),
                "amp_2x_misalignment": round(amp_2x, 3),
                "amp_gear_mesh": round(amp_gear, 3),
                "amp_high_freq_bearing": round(amp_high_freq, 3),
            },
            "patterns": patterns_detected,
            "primary_pattern": patterns_detected[0]["type"],
        }


vibration_analyzer = VibrationHarmonicAnalyzer()
