import numpy as np
from PIL import Image, ImageDraw, ImageFilter

img = Image.open(r"C:\Users\AHMED BOUTABA\.gemini\antigravity\brain\d51e4cb6-e01e-4d97-a965-a46d8c867570\.user_uploaded\media_1790776356111.png").convert("RGBA")
w, h = img.size

# Let's inspect along center-x and center-y
# Let's find top, bottom, left, right edges
# We can scan from center outwards
cx = 212
cy = 237

print(f"Image size: {w}x{h}")

# Let's test an ellipse mask with bounding box
# Looking at the image:
# Top apex of the wood rim is around y=50
# Bottom apex is around y=440
# Left apex is around x=0
# Right apex is around x=395
# Note the ellipse is tilted by some angle theta!

# Let's write an algorithm to find the exact boundary points or use thresholding
arr = np.array(img)
# Green background has high G compared to R: G > R + 5
# Ceramic wall has high R, G, B: all > 150
# Brass plate on left: R > 130, G > 90, B < 60

# Let's save a grid of test crops / masks to find the perfect fit
for angle in [-20, -15, -10, 0, 10, 15, 20]:
    rotated = img.rotate(angle, expand=True, resample=Image.Resampling.BICUBIC)
    # Check bounding box
print("Ready to analyze orientation")
