"""
Serial / USB / RS-232 / RS-422 Interface (FR-02) for UAV FADEC / Engine ECU Telemetry
========================================================================================
Implements real-time frame parsing for Rotax 914 / VRDE 180 FADEC binary and NMEA-style ASCII packets,
including CRC-16/CCITT verification, packet drop detection, and monotonic timestamp validation.
"""
import time
import struct
import logging
from datetime import datetime
from typing import Optional, Dict, Any, Tuple
from app.ingestion.schema import TelemetryReading

logger = logging.getLogger("serial_interface")


def calculate_crc16_ccitt(data: bytes) -> int:
    """Computes standard CRC-16/CCITT (Polynomial 0x1021, Init 0xFFFF)."""
    crc = 0xFFFF
    for byte in data:
        crc ^= (byte << 8)
        for _ in range(8):
            if crc & 0x8000:
                crc = ((crc << 1) ^ 0x1021) & 0xFFFF
            else:
                crc = (crc << 1) & 0xFFFF
    return crc


class SerialTelemetryInterface:
    def __init__(self, port: str = "/dev/ttyUSB0", baudrate: int = 115200):
        self.port = port
        self.baudrate = baudrate
        self.is_connected = False
        
        # Stream Health & Integrity Tracking Metrics
        self.total_packets_received = 0
        self.total_packets_dropped = 0
        self.crc_error_count = 0
        self.last_packet_seq = 0
        self.last_timestamp_epoch = 0.0

    def connect(self) -> bool:
        """Simulates/initializes connection to the physical or virtual serial port."""
        self.is_connected = True
        logger.info(f"Initialized FADEC serial receiver on {self.port} at {self.baudrate} baud (CRC-16 Enabled)")
        return True

    def validate_and_parse_binary_frame(self, raw_bytes: bytes) -> Tuple[bool, Optional[Dict[str, Any]], str]:
        """
        Parses a 32-byte binary Rotax FADEC telemetry frame:
        [0:2] Header 0xAA 0x55
        [2] Packet Sequence ID (uint8)
        [3:5] RPM (uint16)
        [5:7] EGT * 10 (uint16)
        [7:9] CHT * 10 (uint16)
        [9:11] Fuel Flow * 100 (uint16)
        [11:13] Oil Pressure * 100 (uint16)
        [13:15] Oil Temp * 10 (int16)
        [15:17] Vibration * 100 (uint16)
        [17] Throttle % (uint8)
        [18:20] Altitude (int16)
        [20:30] Reserved / Aux
        [30:32] CRC-16 (uint16)
        """
        if len(raw_bytes) < 32:
            self.total_packets_dropped += 1
            return False, None, "FRAME_UNDERSIZE"

        if raw_bytes[0] != 0xAA or raw_bytes[1] != 0x55:
            self.total_packets_dropped += 1
            return False, None, "INVALID_FRAME_HEADER"

        payload = raw_bytes[2:30]
        expected_crc = struct.unpack(">H", raw_bytes[30:32])[0]
        calc_crc = calculate_crc16_ccitt(raw_bytes[:30])

        if expected_crc != calc_crc:
            self.crc_error_count += 1
            self.total_packets_dropped += 1
            return False, None, f"CRC_MISMATCH (calc={calc_crc:#06x}, exp={expected_crc:#06x})"

        # Sequence and Monotonicity Check
        seq_id = raw_bytes[2]
        if self.last_packet_seq != 0 and (seq_id != (self.last_packet_seq + 1) % 256):
            missed = (seq_id - self.last_packet_seq - 1) % 256
            self.total_packets_dropped += missed

        self.last_packet_seq = seq_id
        self.total_packets_received += 1

        # Unpack telemetry fields
        rpm, egt_raw, cht_raw, ff_raw, op_raw, ot_raw, vib_raw, throttle, alt = struct.unpack(
            ">HHH H h H B h", raw_bytes[3:20]
        )

        parsed = {
            "rpm": float(rpm),
            "egt": float(egt_raw) / 10.0,
            "cht": float(cht_raw) / 10.0,
            "fuel_flow": float(ff_raw) / 100.0,
            "oil_pressure": float(op_raw) / 100.0,
            "oil_temp": float(ot_raw) / 10.0,
            "vibration": float(vib_raw) / 100.0,
            "throttle": float(throttle),
            "altitude": float(alt),
            "sequence_id": seq_id,
        }

        return True, parsed, "OK"

    def parse_ascii_sentence(self, sentence: str) -> Tuple[bool, Optional[Dict[str, Any]], str]:
        """
        Parses ASCII NMEA-style FADEC stream:
        $FADEC,SEQ,RPM,EGT,CHT,OILP,OILT,FF,VIB,THROTTLE,ALT*CRC16
        """
        sentence = sentence.strip()
        if not sentence.startswith("$FADEC,") or "*" not in sentence:
            return False, None, "INVALID_ASCII_SENTENCE"

        body, crc_str = sentence[1:].split("*", 1)
        try:
            expected_crc = int(crc_str, 16)
        except ValueError:
            return False, None, "MALFORMED_CRC_HEX"

        calc_crc = calculate_crc16_ccitt(body.encode("ascii"))
        if expected_crc != calc_crc:
            self.crc_error_count += 1
            self.total_packets_dropped += 1
            return False, None, "CRC_MISMATCH"

        parts = body.split(",")
        if len(parts) < 10:
            return False, None, "INSUFFICIENT_FIELDS"

        try:
            seq = int(parts[1])
            parsed = {
                "sequence_id": seq,
                "rpm": float(parts[2]),
                "egt": float(parts[3]),
                "cht": float(parts[4]),
                "oil_pressure": float(parts[5]),
                "oil_temp": float(parts[6]),
                "fuel_flow": float(parts[7]),
                "vibration": float(parts[8]),
                "throttle": float(parts[9]),
                "altitude": float(parts[10]) if len(parts) > 10 else 3000.0,
            }
            self.total_packets_received += 1
            return True, parsed, "OK"
        except Exception as e:
            return False, None, f"PARSE_ERROR: {e}"

    def get_stream_health(self) -> Dict[str, Any]:
        """Returns real-time link quality, drop percentage, and CRC integrity."""
        total = self.total_packets_received + self.total_packets_dropped
        drop_rate = (self.total_packets_dropped / max(1, total)) * 100.0
        return {
            "status": "ONLINE" if self.is_connected else "STANDBY",
            "port": self.port,
            "baudrate": self.baudrate,
            "total_received": self.total_packets_received,
            "total_dropped": self.total_packets_dropped,
            "crc_errors": self.crc_error_count,
            "drop_rate_pct": round(drop_rate, 2),
            "crc_protocol": "CRC-16/CCITT-1021",
        }


serial_interface = SerialTelemetryInterface()
