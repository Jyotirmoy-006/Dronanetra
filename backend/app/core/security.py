"""
Security, HMAC Telemetry Signing & Defense Cryptographic Utilities
===================================================================
Implements HMAC-SHA256 message authentication and tamper detection
for ground-to-air telemetry packets and GCS operator commands.
"""
import hmac
import hashlib
import json
import time
from typing import Dict, Any, Tuple, Optional

DEFAULT_DEFENSE_SECRET = b"DRDO_IDEX_MALE_UAV_SECURE_KEY_2026"


def sign_telemetry_payload(payload: Dict[str, Any], secret_key: bytes = DEFAULT_DEFENSE_SECRET) -> str:
    """Computes HMAC-SHA256 signature for JSON telemetry payload."""
    serialized = json.dumps(payload, sort_keys=True).encode("utf-8")
    signature = hmac.new(secret_key, serialized, hashlib.sha256).hexdigest()
    return signature


def verify_telemetry_signature(
    payload: Dict[str, Any],
    provided_signature: str,
    secret_key: bytes = DEFAULT_DEFENSE_SECRET
) -> Tuple[bool, str]:
    """Verifies HMAC-SHA256 signature to protect against packet injection and man-in-the-middle attacks."""
    if not provided_signature:
        return False, "SIGNATURE_MISSING"

    computed = sign_telemetry_payload(payload, secret_key)
    if hmac.compare_digest(computed, provided_signature):
        return True, "AUTHENTICATED_OK"
    else:
        return False, "SIGNATURE_TAMPER_DETECTED"
