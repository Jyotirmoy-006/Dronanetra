"""
SAE J1939 / SocketCAN Telemetry Frame Broadcaster (HIL Testing Utility)
========================================================================
Broadcasts realistic MALE UAV engine telemetry over Virtual CAN (vcan0) or
hardware CAN interfaces using standard SAE J1939 Parameter Group Numbers (PGNs).

Usage:
  python scripts/broadcast_vcan0.py --channel vcan0 --rate 1.0
"""
import time
import struct
import argparse
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("CAN_BROADCASTER")


def main():
    parser = argparse.ArgumentParser(description="MALE UAV CAN Bus Telemetry Broadcaster")
    parser.add_argument("--channel", default="vcan0", help="SocketCAN interface name")
    parser.add_argument("--rate", type=float, default=1.0, help="Broadcast frequency in Hz")
    args = parser.parse_args()

    logger.info(f"Initializing J1939 CAN broadcaster on interface: {args.channel} ({args.rate} Hz)...")

    can_bus = None
    try:
        import can
        can_bus = can.interface.Bus(channel=args.channel, bustype="socketcan")
        logger.info("Successfully attached to SocketCAN bus.")
    except Exception as e:
        logger.warning(f"Hardware SocketCAN interface not found ({e}). Running in loopback/demonstration mode.")

    step = 0
    while True:
        step += 1
        rpm = 4800 + int(80 * math.sin(step / 10.0))
        cht = 135 + int(5 * math.cos(step / 8.0))
        egt = 720 + int(15 * math.sin(step / 6.0))
        oil_p = int(4.5 * 10)
        fuel_flow = int(18.2 * 10)

        # 1. PGN 61444 (0x0CF00400) - Electronic Engine Controller 1 (RPM)
        # RPM encoded as 0.125 rpm/bit (16-bit uint)
        rpm_raw = int(rpm / 0.125)
        eec1_data = struct.pack("<BBHBBBB", 0xF0, 0x7D, rpm_raw, 0xFF, 0xFF, 0xFF, 0xFF)

        # 2. PGN 65262 (0x18FEEE00) - Engine Temperatures (CHT, EGT)
        # Temperatures offset by -40°C
        cht_raw = min(255, max(0, cht + 40))
        egt_raw = min(65535, max(0, egt))
        et_data = struct.pack("<BBHHBB", cht_raw, 0xFF, egt_raw, 0xFF, 0xFF)

        if can_bus:
            try:
                import can
                msg1 = can.Message(arbitration_id=0x0CF00400, data=eec1_data, is_extended_id=True)
                msg2 = can.Message(arbitration_id=0x18FEEE00, data=et_data, is_extended_id=True)
                can_bus.send(msg1)
                can_bus.send(msg2)
            except Exception as ex:
                logger.error(f"Error transmitting frame: {ex}")
        else:
            if step % 5 == 0:
                logger.info(f"[HIL BROADCAST] PGN 61444 RPM={rpm} | PGN 65262 CHT={cht}°C, EGT={egt}°C (1 Hz frame)")

        time.sleep(1.0 / args.rate)


if __name__ == "__main__":
    import math
    main()
