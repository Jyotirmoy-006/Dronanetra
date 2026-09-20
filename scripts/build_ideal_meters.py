import cv2
import numpy as np
import os

info = [
    {'id': 'rpm',  'name': 'ENGINE SPEED',        'hub': (85, 86), 'tip': (138, 48),  'tail': (57, 107), 'drum': (60, 110, 106, 130)},
    {'id': 'egt',  'name': 'EXHAUST GAS TEMP',    'hub': (85, 88), 'tip': (142, 60),  'tail': (54, 103), 'drum': (60, 110, 106, 130)},
    {'id': 'fuel', 'name': 'FUEL FLOW',           'hub': (82, 84), 'tip': (99, 23),   'tail': (73, 117), 'drum': (57, 107, 103, 127)},
    {'id': 'oil',  'name': 'OIL PRESSURE',        'hub': (80, 85), 'tip': (79, 21),   'tail': (81, 120), 'drum': (55, 108, 101, 128)},
    {'id': 'vib',  'name': 'VIBRATION',           'hub': (75, 83), 'tip': (38, 38),   'tail': (97, 109), 'drum': (51, 106, 96, 126)},
    {'id': 'cht',  'name': 'CYLINDER HEAD TEMP',  'hub': (85, 82), 'tip': (136, 31),  'tail': (55, 112), 'drum': (61, 105, 106, 125)},
]

p = r'C:\Users\Asus\.gemini\antigravity-ide\brain\24d35c95-0833-406d-837e-c0d9de503aa8\.user_uploaded\media_1788522554491.png'
im = cv2.imread(p)

scale = 4

for i, cfg in enumerate(info):
    x0 = 7 + i * 171
    y0 = 8
    g = im[y0:y0+166, x0:x0+160].copy()
    
    # Upscale to 640x664 (4x)
    g_scaled = cv2.resize(g, (160 * scale, 166 * scale), interpolation=cv2.INTER_LANCZOS4)
    
    hx, hy = cfg['hub'][0] * scale, cfg['hub'][1] * scale
    tx, ty = cfg['tip'][0] * scale, cfg['tip'][1] * scale
    bx, by = cfg['tail'][0] * scale, cfg['tail'][1] * scale
    
    mask = np.zeros((166 * scale, 160 * scale), dtype=np.uint8)
    # Needle line
    cv2.line(mask, (hx, hy), (tx, ty), 255, 6 * scale)
    # Tail line
    cv2.line(mask, (hx, hy), (bx, by), 255, 6 * scale)
    # Center hub
    cv2.circle(mask, (hx, hy), 12 * scale, 255, -1)
    
    # Inpaint needle
    clean = cv2.inpaint(g_scaled, mask, 7, cv2.INPAINT_TELEA)
    
    # Inpaint drum window interior
    dx0, dy0, dx1, dy1 = [v * scale for v in cfg['drum']]
    clean[dy0:dy1, dx0:dx1] = [18, 18, 18]
    
    out_id = cfg['id']
    out_name = os.path.join('frontend', 'public', f'meter_base_{out_id}.png')
    cv2.imwrite(out_name, clean)
    print(f'Generated {out_name} (640x664)')

print('All 6 instruments generated successfully from ideal image!')
