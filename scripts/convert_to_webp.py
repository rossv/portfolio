from PIL import Image
import os

files_to_convert = [
    (r"public\assets\news\dell-wade-trim.jpg", r"src\assets\news\dell-wade-trim.webp"),
    (r"public\assets\news\swan-research.jpg", r"src\assets\news\swan-research.webp"),
    (r"public\assets\news\wade-trim-join.jpg", r"src\assets\news\wade-trim-join.webp"),
    (r"src\assets\skylines\denver.jpg", r"src\assets\skylines\denver.webp"),
    (r"src\assets\skylines\monroeville.jpg", r"src\assets\skylines\monroeville.webp"),
    (r"src\assets\skylines\palm_springs_1.jpg", r"src\assets\skylines\palm_springs_1.webp"),
    (r"src\assets\skylines\state_college.jpg", r"src\assets\skylines\state_college.webp"),
]

for src, dst in files_to_convert:
    if os.path.exists(src):
        print(f"Converting {src} to {dst}")
        with Image.open(src) as img:
            img.save(dst, "WEBP", quality=85)
    else:
        print(f"Source file not found: {src}")
