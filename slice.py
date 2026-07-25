import sys
import os
from PIL import Image

input_path = r"C:\Users\AHMED BOUTABA\.gemini\antigravity\brain\bf7b792a-3df4-4d06-999a-9b785229dd77\.user_uploaded\media__1784903860017.jpg"
out_dir = r"c:\Users\AHMED BOUTABA\Downloads\Artisanat-Aschi-main\Artisanat-Aschi-main\public\poignees"

os.makedirs(out_dir, exist_ok=True)

try:
    img = Image.open(input_path)
    width, height = img.size
    print(f"Loaded image: {width}x{height}")
    
    # 5x5 grid
    cols = 5
    rows = 5
    w_step = width // cols
    h_step = height // rows
    
    count = 1
    for r in range(rows):
        for c in range(cols):
            left = c * w_step
            top = r * h_step
            right = left + w_step
            bottom = top + h_step
            
            # Crop the image
            cropped = img.crop((left, top, right, bottom))
            out_name = f"new_knob_{count}.jpg"
            out_path = os.path.join(out_dir, out_name)
            cropped.save(out_path, quality=90)
            count += 1
            
    print(f"Successfully saved {count-1} knob images to {out_dir}")
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
