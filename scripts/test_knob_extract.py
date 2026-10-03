import numpy as np
from PIL import Image, ImageDraw, ImageFilter

src_path = r"C:\Users\AHMED BOUTABA\.gemini\antigravity\brain\d51e4cb6-e01e-4d97-a965-a46d8c867570\.user_uploaded\media_1790776356111.png"
img = Image.open(src_path).convert("RGBA")
w, h = img.size

print(f"Loaded image {w}x{h}")

# The knob in the photo is tilted by approx 28-30 degrees counter-clockwise (major axis is diagonal from top-right to bottom-left).
# Let's test rotating the image so the knob's major axis becomes horizontal/vertical,
# OR rectifying the perspective from oblique angle to frontal view!

# Let's measure key points on the ceramic and wood boundary:
# Center of the ceramic disk is roughly (205, 260)
# Let's test perspective warp using cv2 or PIL transform if cv2 is available
try:
    import cv2
    has_cv2 = True
except ImportError:
    has_cv2 = False

print("OpenCV available:", has_cv2)
