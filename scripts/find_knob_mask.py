import numpy as np
from PIL import Image, ImageDraw, ImageFilter

img = Image.open(r"C:\Users\AHMED BOUTABA\.gemini\antigravity\brain\d51e4cb6-e01e-4d97-a965-a46d8c867570\.user_uploaded\media_1790776356111.png").convert("RGBA")
w, h = img.size

# Let's inspect pixel colors around the image to identify background vs knob
# Top is green background: around (0, 0)
print("Top left color:", img.getpixel((10, 10)))
print("Top right color:", img.getpixel((400, 10)))
print("Bottom left color:", img.getpixel((10, 450)))
print("Bottom right color:", img.getpixel((400, 450)))
print("Center color:", img.getpixel((w//2, h//2)))
