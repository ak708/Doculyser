import os
import json
import pytesseract
from pdf2image import convert_from_path
from PIL import Image
import sys

pytesseract.pytesseract.tesseract_cmd = r'C:/Program Files/Tesseract-OCR/tesseract.exe'

PDF_PATH = sys.argv[1] if len(sys.argv) > 1 else r"public\sample.pdf"
OUTPUT_FOLDER = r"output_images"
OUTPUT_JSON = r"public\ocr.json"
DPI = 300  # DPI used for PDF-to-image conversion

os.makedirs(OUTPUT_FOLDER, exist_ok=True)

def pdf_to_images(pdf_path, dpi=DPI):
    images = convert_from_path(pdf_path, dpi=dpi)
    image_paths = []
    page_sizes = []
    for i, img in enumerate(images):
        img_path = os.path.join(OUTPUT_FOLDER, f"page_{i+1}.jpg")
        img.save(img_path, "JPEG")
        image_paths.append(img_path)
        page_sizes.append({"width": img.width, "height": img.height, "dpi": dpi})
    return image_paths, page_sizes

def extract_words(image_path, page_height):
    image = Image.open(image_path)
    data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
    words_info = []
    n_boxes = len(data['text'])
    for i in range(n_boxes):
        word = data['text'][i].strip()
        if word:
            left = data['left'][i]
            top = data['top'][i]
            width = data['width'][i]
            height = data['height'][i]
            bbox = [
                [left, top],
                [left + width, top],
                [left + width, top + height],
                [left, top + height]
            ]
            words_info.append({
                "text": word,
                "bbox": bbox,
                "y_flipped": page_height - top - height  # Provide flipped Y for PDF coordinates
            })
    return words_info

if __name__ == "__main__":
    print("Converting PDF to images...")
    image_paths, page_sizes = pdf_to_images(PDF_PATH)

    all_data = []
    for i, img_path in enumerate(image_paths):
        print(f"Extracting words from {img_path}...")
        words = extract_words(img_path, page_sizes[i]["height"])
        all_data.append({
            "page": i + 1,
            "page_width": page_sizes[i]["width"],
            "page_height": page_sizes[i]["height"],
            "dpi": page_sizes[i]["dpi"],
            "words": words
        })

    print("Saving extracted word boxes to JSON...")
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(all_data, f, indent=4)

    print(f"Done! Word box data saved to {OUTPUT_JSON}")