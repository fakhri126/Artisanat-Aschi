from PIL import Image
import glob
import os

for f in glob.glob(r"public\poignees\*.jpg") + glob.glob(r"public\poignees\*.png"):
    try:
        im = Image.open(f)
        print(f"{os.path.basename(f)}: {im.size}, {im.mode}")
    except:
        pass
