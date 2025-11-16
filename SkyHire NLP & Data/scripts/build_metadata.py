import os
import json
import csv
import re

# ============================================================
#                  CONSTANT PATHS (EDIT THESE)
# ============================================================
RAW_CV_DIR = "./data/raw_cvs/" # raw cv directory
CLEANED_CV_DIR = "./data/cleaned_cvs/" # cleaned cv directory
METADATA_FILE = "./data/cv_metadata.csv" # metadata file
LOG_FILE = "./data/logs/metadata_log.txt" # log file

os.makedirs(os.path.dirname(METADATA_FILE), exist_ok=True)
os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)


# ============================================================
#              PII DETECTION PATTERNS (POST-CLEANING)
# ============================================================
EMAIL_REGEX = r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+"
PHONE_REGEX = r"(\+?\d{1,3})?[\s\-]?\(?\d{2,4}\)?[\s\-]?\d{3,5}[\s\-]?\d{3,5}"
PASSPORT_REGEX = r"passport\s*(no)?[\s:-]*[A-Za-z0-9]+"

PII_PATTERNS = {
    "HAS_EMAIL": EMAIL_REGEX,
    "HAS_PHONE": PHONE_REGEX,
    "HAS_PASSPORT": PASSPORT_REGEX,
}


# ============================================================
#            READ CLEANED + RAW CV (WITH ANNOTATIONS)
# ============================================================
def load_cleaned_cv(filename):
    path = os.path.join(CLEANED_CV_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_raw_cv(filename):
    path = os.path.join(RAW_CV_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


# ============================================================
#               BASIC TEXT STATISTICS AND TOKENIZATION
# ============================================================
def count_tokens(text):
    """Simple whitespace tokenization."""
    return len(text.split())


def detect_pii(text):
    """
    Detect whether any sensitive information remains after cleaning.
    Returns a dict of boolean flags.
    """
    flags = {}
    for flag_name, pattern in PII_PATTERNS.items():
        flags[flag_name] = bool(re.search(pattern, text, flags=re.IGNORECASE))
    return flags


# ============================================================
#                   MAIN METADATA GENERATION
# ============================================================
def build_metadata():
    log_lines = []
    metadata_rows = []

    # CSV header
    header = [
        "filename",
        "chars_count",
        "tokens_count",
        "annotation_count",
        "is_aviation",
        "HAS_EMAIL",
        "HAS_PHONE",
        "HAS_PASSPORT",
        "validation_status"
    ]
    metadata_rows.append(header)

    for filename in os.listdir(CLEANED_CV_DIR):
        if not filename.endswith(".json"):
            continue

        try:
            # Load CVs
            cleaned_cv = load_cleaned_cv(filename)
            raw_cv = load_raw_cv(filename)

            cleaned_text = cleaned_cv.get("text", "")
            raw_annotations = raw_cv.get("annotations", [])
            aviation_flag = cleaned_cv.get("is_aviation", False)

            # Statistics
            chars_count = len(cleaned_text)
            tokens_count = count_tokens(cleaned_text)
            annotation_count = len(raw_annotations)

            # Sensitive-data detection
            pii_flags = detect_pii(cleaned_text)
            pii_summary = any(pii_flags.values())

            # Validation status
            validation = "OK" if not pii_summary else "PII_REMAINING"

            # Save row
            row = [
                filename,
                chars_count,
                tokens_count,
                annotation_count,
                aviation_flag,
                pii_flags["HAS_EMAIL"],
                pii_flags["HAS_PHONE"],
                pii_flags["HAS_PASSPORT"],
                validation
            ]

            metadata_rows.append(row)
            log_lines.append(f"[OK] {filename} | tokens={tokens_count} | aviation={aviation_flag}")

        except Exception as e:
            log_lines.append(f"[ERROR] {filename}: {str(e)}")

    # Write CSV
    with open(METADATA_FILE, "w", newline="", encoding="utf-8") as csvfile:
        writer = csv.writer(csvfile)
        writer.writerows(metadata_rows)

    # Write log file
    with open(LOG_FILE, "w", encoding="utf-8") as log:
        log.write("\n".join(log_lines))

    print("✅ Metadata file generated successfully.")


# ============================================================
#                          RUN SCRIPT
# ============================================================
if __name__ == "__main__":
    build_metadata()
