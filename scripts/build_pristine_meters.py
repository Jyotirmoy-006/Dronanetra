import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import os

p_ideal = r'C:\Users\Asus\.gemini\antigravity-ide\brain\24d35c95-0833-406d-837e-c0d9de503aa8\.user_uploaded\media_1788522554491.png'
im_ideal = cv2.imread(p_ideal)

# 1. Symmetric Square Crop from Gauge 1
crop = im_ideal[7:175, 6:174]
W_4X, H_4X = 640, 664
chassis = cv2.resize(crop, (W_4X, H_4X), interpolation=cv2.INTER_LANCZOS4)
M_shift = np.float32([[1, 0, 2], [0, 1, 0]])
chassis = cv2.warpAffine(chassis, M_shift, (W_4X, H_4X), borderMode=cv2.BORDER_REFLECT)

cx, cy = 320, 308

# 2. Seamlessly erase extra screw on lower left with Gaussian-feathered mirror patch
clean_right = chassis[500:560, 580:635]
clean_left = cv2.flip(clean_right, 1)
ph, pw = clean_left.shape[:2]
alpha = np.ones((ph, pw), dtype=np.float32)
border = 10
for i in range(border):
    f = i / float(border)
    alpha[i, :] = np.minimum(alpha[i, :], f)
    alpha[-1-i, :] = np.minimum(alpha[-1-i, :], f)
    alpha[:, i] = np.minimum(alpha[:, i], f)
    alpha[:, -1-i] = np.minimum(alpha[:, -1-i], f)
alpha = cv2.GaussianBlur(alpha, (15, 15), 0)[:, :, None]

target = chassis[500:560, 5:60].astype(np.float32)
chassis[500:560, 5:60] = (target * (1.0 - alpha) + clean_left.astype(np.float32) * alpha).astype(np.uint8)

# 3. Build Pristine Deep Matte Black Dial Face (Radius 250 with flat bottom at 482)
dial_r = 250
dial_mask = np.zeros((H_4X, W_4X), dtype=np.uint8)
cv2.circle(dial_mask, (cx, cy), dial_r, 255, -1)
dial_mask[482:, :] = 0

Y, X = np.ogrid[:H_4X, :W_4X]
dist = np.sqrt((X - cx)**2 + (Y - cy)**2)
norm_dist = np.clip(dist / float(dial_r), 0, 1.0)

center_col = np.array([36, 38, 42], dtype=np.float32)
edge_col = np.array([14, 15, 18], dtype=np.float32)

dial_bg = np.zeros((H_4X, W_4X, 3), dtype=np.float32)
for c in range(3):
    dial_bg[:, :, c] = center_col[c] + (edge_col[c] - center_col[c]) * (norm_dist ** 1.3)

np.random.seed(42)
noise = np.random.normal(0, 1.2, (H_4X, W_4X, 3)).astype(np.float32)
dial_bg = np.clip(dial_bg + noise, 0, 255).astype(np.uint8)

feather_mask = np.clip((dial_r + 1 - dist) / 2.0, 0, 1.0)[:, :, None]
feather_mask[482:, :] = 0
chassis_dial = chassis.astype(np.float32) * (1.0 - feather_mask) + dial_bg.astype(np.float32) * feather_mask
master_blank = chassis_dial.astype(np.uint8)

# Recessed odometer drum window
master_blank[396:456, 206:434] = [14, 15, 17]

# Clean plaque strip y: 580..630, x: 170..470 (centered at 320!)
plaque_raw = master_blank[580:630, 170:470]
clean_slice = plaque_raw[8:42, 20:30]
replicated = cv2.resize(clean_slice, (240, 34), interpolation=cv2.INTER_LINEAR)
plaque_clean = plaque_raw.copy()
plaque_clean[8:42, 30:270] = replicated
p_noise = np.random.normal(0, 1.2, replicated.shape).astype(np.float32)
plaque_clean[8:42, 30:270] = np.clip(plaque_clean[8:42, 30:270].astype(np.float32) + p_noise, 0, 255).astype(np.uint8)
master_blank[580:630, 170:470] = plaque_clean

# 4. Stamp High-Definition Aerospace Stainless Steel Screws
stamp = cv2.imread('scripts/pristine_screw_stamp.png', cv2.IMREAD_UNCHANGED)

def stamp_screw(bg, x_center, y_center, size, angle_deg=0):
    s = cv2.resize(stamp, (size, size), interpolation=cv2.INTER_LANCZOS4)
    if angle_deg != 0:
        M = cv2.getRotationMatrix2D((size//2, size//2), angle_deg, 1.0)
        s = cv2.warpAffine(s, M, (size, size), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_CONSTANT, borderValue=(0,0,0,0))
    half = size // 2
    x1, y1 = x_center - half, y_center - half
    x2, y2 = x1 + size, y1 + size
    bx1, by1, bx2, by2 = max(0, x1), max(0, y1), min(bg.shape[1], x2), min(bg.shape[0], y2)
    sx1, sy1 = bx1 - x1, by1 - y1
    sx2, sy2 = sx1 + (bx2 - bx1), sy1 + (by2 - by1)
    if bx2 <= bx1 or by2 <= by1: return
    s_crop = s[sy1:sy2, sx1:sx2]
    alpha = (s_crop[:, :, 3].astype(np.float32) / 255.0)[:, :, None]
    bgr = s_crop[:, :, :3].astype(np.float32)
    target = bg[by1:by2, bx1:bx2].astype(np.float32)
    blended = target * (1.0 - alpha) + bgr * alpha
    bg[by1:by2, bx1:bx2] = blended.astype(np.uint8)

# Stamp 4 Corner Screws (Mathematically aligned: equidistant 54px from left/right borders, 46px/56px from top/bottom)
stamp_screw(master_blank, 54, 46, 56, angle_deg=22)       # Top-Left
stamp_screw(master_blank, 586, 46, 56, angle_deg=68)      # Top-Right
stamp_screw(master_blank, 54, 608, 56, angle_deg=-15)     # Bottom-Left
stamp_screw(master_blank, 586, 608, 56, angle_deg=45)     # Bottom-Right

# Stamp 2 Bracket Screws
stamp_screw(master_blank, 94, 544, 30, angle_deg=30)      # Bracket Left
stamp_screw(master_blank, 546, 544, 30, angle_deg=-25)    # Bracket Right

# Stamp 2 Plaque Screws
stamp_screw(master_blank, 152, 602, 22, angle_deg=12)     # Plaque Left
stamp_screw(master_blank, 488, 602, 22, angle_deg=55)     # Plaque Right

# 5. Fonts
font_plaque = ImageFont.truetype('C:\\Windows\\Fonts\\bahnschrift.ttf', 19)
font_unit = ImageFont.truetype('C:\\Windows\\Fonts\\bahnschrift.ttf', 32)
font_sub = ImageFont.truetype('C:\\Windows\\Fonts\\bahnschrift.ttf', 17)
font_num = ImageFont.truetype('C:\\Windows\\Fonts\\bahnschrift.ttf', 25)
font_num_sm = ImageFont.truetype('C:\\Windows\\Fonts\\bahnschrift.ttf', 21)

# Configurations for all 6 instruments
configs = [
    {
        'id': 'rpm',
        'plaque': 'ENGINE SPEED',
        'unit': 'RPM',
        'sub': 'x1000',
        'min_val': 0,
        'max_val': 7,
        'nums': ['0', '1', '2', '3', '4', '5', '6', '7'],
        'warning_start': 5,
        'danger_start': 6,
    },
    {
        'id': 'egt',
        'plaque': 'EXHAUST GAS TEMP',
        'unit': 'EGT',
        'sub': '°C',
        'min_val': 0,
        'max_val': 1300,
        'nums': ['0', '200', '400', '600', '800', '1000', '1200', '1300'],
        'warning_start': 1000,
        'danger_start': 1200,
    },
    {
        'id': 'fuel',
        'plaque': 'FUEL FLOW',
        'unit': 'FUEL',
        'sub': 'L/hr',
        'min_val': 0,
        'max_val': 40,
        'nums': ['0', '5', '10', '15', '20', '25', '30', '40'],
        'warning_start': 30,
        'danger_start': 36,
    },
    {
        'id': 'oil',
        'plaque': 'OIL PRESSURE',
        'unit': 'OIL',
        'sub': 'bar',
        'min_val': 0,
        'max_val': 10,
        'nums': ['0', '1.5', '3.0', '4.5', '6.0', '7.5', '9.0', '10'],
        'warning_start': 7.5,
        'danger_start': 9.0,
    },
    {
        'id': 'vib',
        'plaque': 'VIBRATION',
        'unit': 'VIB',
        'sub': 'g',
        'min_val': 0,
        'max_val': 10,
        'nums': ['0', '1.5', '3.0', '4.5', '6.0', '7.5', '9.0', '10'],
        'warning_start': 6.0,
        'danger_start': 8.0,
    },
    {
        'id': 'cht',
        'plaque': 'CYLINDER HEAD TEMP',
        'unit': 'CHT',
        'sub': '°C',
        'min_val': 0,
        'max_val': 220,
        'nums': ['0', '30', '60', '90', '120', '150', '180', '200', '220'],
        'warning_start': 160,
        'danger_start': 190,
    },
]

start_angle = 167.7
end_angle = 12.2 + 360 # 372.2°

for cfg in configs:
    img = master_blank.copy()
    
    # 6. Render Radial Scale Ticks & Redlines
    nums = cfg['nums']
    num_ticks = len(nums)
    tick_angles = np.linspace(start_angle, end_angle, num_ticks)
    
    for deg in np.linspace(start_angle, end_angle, (num_ticks - 1) * 5 + 1):
        rad = np.radians(deg)
        pct = (deg - start_angle) / (end_angle - start_angle)
        curr_val = cfg['min_val'] + pct * (cfg['max_val'] - cfg['min_val'])
        
        is_major = any(abs(deg - ta) < 0.5 for ta in tick_angles)
        r_inner = 216 if is_major else 226
        r_outer = 238
        
        # In BGR:
        color = (218, 232, 238) # Ivory
        if curr_val >= cfg['danger_start']:
            color = (45, 45, 225) # Red in BGR
        elif curr_val >= cfg['warning_start']:
            color = (35, 155, 235) # Amber in BGR
            
        x1 = int(cx + r_inner * np.cos(rad))
        y1 = int(cy + r_inner * np.sin(rad))
        x2 = int(cx + r_outer * np.cos(rad))
        y2 = int(cy + r_outer * np.sin(rad))
        
        thickness = 3 if is_major else 1
        cv2.line(img, (x1, y1), (x2, y2), color, thickness, cv2.LINE_AA)
        
        if curr_val >= cfg['warning_start']:
            rx1 = int(cx + 232 * np.cos(rad))
            ry1 = int(cy + 232 * np.sin(rad))
            rx2 = int(cx + 238 * np.cos(rad))
            ry2 = int(cy + 238 * np.sin(rad))
            arc_col = (45, 45, 225) if curr_val >= cfg['danger_start'] else (35, 140, 235)
            cv2.line(img, (rx1, ry1), (rx2, ry2), arc_col, 4, cv2.LINE_AA)

    # Convert to PIL for crisp typography
    img_pil = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    draw = ImageDraw.Draw(img_pil)
    
    # 7. Numbers along circumference
    r_num = 186
    for deg, txt in zip(tick_angles, nums):
        if not txt:
            continue
        rad = np.radians(deg)
        nx = int(cx + r_num * np.cos(rad))
        ny = int(cy + r_num * np.sin(rad))
        
        f = font_num_sm if len(txt) >= 4 else font_num
        nbb = f.getbbox(txt)
        nw, nh = nbb[2] - nbb[0], nbb[3] - nbb[1]
        draw.text((nx - nw // 2, ny - nh // 2), txt, font=f, fill=(238, 232, 218, 255))

    # 8. Unit & SubUnit text
    u = cfg['unit']
    s = cfg['sub']
    ubb = font_unit.getbbox(u)
    uw = ubb[2] - ubb[0]
    draw.text((cx - uw // 2, 195), u, font=font_unit, fill=(238, 232, 218, 255))
    
    sbb = font_sub.getbbox(s)
    sw = sbb[2] - sbb[0]
    draw.text((cx - sw // 2, 238), s, font=font_sub, fill=(185, 175, 155, 255))

    # 9. Plaque parameter label
    plabel = cfg['plaque']
    pbb = font_plaque.getbbox(plabel)
    pw = pbb[2] - pbb[0]
    ph = pbb[3] - pbb[1]
    px = cx - pw // 2
    py = 605 - ph // 2
    draw.text((px - 1, py - 1), plabel, font=font_plaque, fill=(255, 255, 255, 130))
    draw.text((px, py), plabel, font=font_plaque, fill=(35, 38, 42, 255))

    out_path = os.path.join('frontend', 'public', f'meter_base_{cfg["id"]}.png')
    img_pil.save(out_path)
    print(f'Generated pristine base with perfect screws: {out_path}')

print('All 6 instruments generated with mathematical precision, aligned screws, and flawless aesthetics!')
