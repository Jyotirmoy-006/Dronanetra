import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import os

cx, cy = 684, 783

# Fonts
font_plaque_large = ImageFont.truetype('C:\\Windows\\Fonts\\bahnschrift.ttf', 38)
font_plaque_small = ImageFont.truetype('C:\\Windows\\Fonts\\bahnschrift.ttf', 32)
font_unit = ImageFont.truetype('C:\\Windows\\Fonts\\bahnschrift.ttf', 70)
font_sub = ImageFont.truetype('C:\\Windows\\Fonts\\bahnschrift.ttf', 35)
font_nums = ImageFont.truetype('C:\\Windows\\Fonts\\bahnschrift.ttf', 52)
font_nums_small = ImageFont.truetype('C:\\Windows\\Fonts\\bahnschrift.ttf', 44)

# Exact angles of the 8 ticks (0 to 7):
angles = [167.7, 193.4, 225.8, 255.1, 285.7, 314.8, 347.3, 12.2]
num_r = 405

# Instrument configurations
configs = [
    {
        'id': 'rpm',
        'file': 'meter_base_rpm.png', # Already perfected from original photo!
    },
    {
        'id': 'egt',
        'file': 'meter_base_egt.png',
        'plaque': 'EXHAUST GAS TEMP',
        'unit': 'EGT',
        'sub': '°C',
        'nums': ['0', '200', '400', '600', '800', '1000', '1200', ''],
    },
    {
        'id': 'fuel',
        'file': 'meter_base_fuel.png',
        'plaque': 'FUEL FLOW',
        'unit': 'FUEL',
        'sub': 'L/hr',
        'nums': ['0', '5', '10', '15', '20', '25', '30', '40'],
    },
    {
        'id': 'oil',
        'file': 'meter_base_oil.png',
        'plaque': 'OIL PRESSURE',
        'unit': 'OIL',
        'sub': 'bar',
        'nums': ['0', '1.5', '3.0', '4.5', '6.0', '7.5', '9.0', '10'],
    },
    {
        'id': 'vib',
        'file': 'meter_base_vib.png',
        'plaque': 'VIBRATION',
        'unit': 'VIB',
        'sub': 'g',
        'nums': ['0', '1.5', '3.0', '4.5', '6.0', '7.5', '9.0', '10'],
    },
    {
        'id': 'cht',
        'file': 'meter_base_cht.png',
        'plaque': 'CYLINDER HEAD TEMP',
        'unit': 'CHT',
        'sub': '°C',
        'nums': ['0', '30', '60', '90', '120', '150', '180', '200'],
    }
]

# Load clean master blank
master_blank = Image.open('frontend/public/meter_master_blank.png').convert('RGB')

for cfg in configs:
    if cfg['id'] == 'rpm':
        continue
    
    img = master_blank.copy()
    draw = ImageDraw.Draw(img)
    
    # 1. Plaque Text
    plabel = cfg['plaque']
    f_plaque = font_plaque_small if len(plabel) > 15 else font_plaque_large
    pbb = f_plaque.getbbox(plabel)
    pw = pbb[2] - pbb[0]
    ph = pbb[3] - pbb[1]
    px = cx - pw // 2
    py = 1370 - ph // 2
    # Emboss bevel
    draw.text((px - 1, py - 1), plabel, font=f_plaque, fill=(255, 255, 255, 120))
    draw.text((px, py), plabel, font=f_plaque, fill=(35, 38, 42, 255))
    
    # 2. Unit & SubUnit
    u = cfg['unit']
    s = cfg['sub']
    ubb = font_unit.getbbox(u)
    uw = ubb[2] - ubb[0]
    draw.text((cx - uw // 2, cy - 205), u, font=font_unit, fill=(238, 232, 218, 255))
    
    sbb = font_sub.getbbox(s)
    sw = sbb[2] - sbb[0]
    draw.text((cx - sw // 2, cy - 125), s, font=font_sub, fill=(185, 175, 155, 255))
    
    # 3. Numbers
    nums = cfg['nums']
    for ang, txt in zip(angles, nums):
        if not txt:
            continue
        rad = np.radians(ang)
        f = font_nums_small if len(txt) >= 3 else font_nums
        nb = f.getbbox(txt)
        nw = nb[2] - nb[0]
        nh = nb[3] - nb[1]
        nx = int(cx + num_r * np.cos(rad))
        ny = int(cy + num_r * np.sin(rad))
        draw.text((nx - nw // 2, ny - nh // 2), txt, font=f, fill=(238, 232, 218, 255))
    
    filename = cfg['file']
    out_path = os.path.join('frontend', 'public', filename)
    img.save(out_path)
    print(f'Saved {out_path}')

print('All instrument bases refreshed!')
