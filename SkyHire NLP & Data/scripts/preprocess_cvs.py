import os
import json
import re

# ============================================================
#                      CONSTANT PATHS
# ============================================================
RAW_CV_DIR = "./data/raw_cvs/"
CLEANED_CV_DIR = "./data/cleaned_cvs/"
LOG_FILE = "./data/logs/preprocessing_log.txt"

os.makedirs(CLEANED_CV_DIR, exist_ok=True)
os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)


# ============================================================
#                   REGEX PATTERNS (SAFER)
# ============================================================
EMAIL_REGEX = r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+"
PHONE_REGEX = r"\b(\+?\d{1,3}[\s\-]?)?\(?\d{2,4}\)?[\s\-]?\d{3}[\s\-]?\d{3,4}\b"
PASSPORT_REGEX = r"\bpassport\s*(no)?[\s:-]*[A-Za-z0-9]+\b"
DATE_REGEX = r"\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b"

PII_PATTERNS = {
    "EMAIL": EMAIL_REGEX,
    "PHONE": PHONE_REGEX,
    "PASSPORT": PASSPORT_REGEX,
    "DATE": DATE_REGEX,
}


# ============================================================
#                TEXT NORMALIZATION
# ============================================================
def normalize_text(text: str) -> str:
    text = text.replace("\r", " ")
    text = re.sub(r"\n+", "\n", text)
    text = re.sub(r"\s{2,}", " ", text)
    return text.strip()


# ============================================================
#                ANONYMIZATION
# ============================================================
def anonymize_text(text: str) -> str:
    for placeholder, pattern in PII_PATTERNS.items():
        text = re.sub(pattern, f"<{placeholder}>", text, flags=re.IGNORECASE)

    text = re.sub(
        r"(name\s*[:\-]\s*)([A-Za-z ]+)",
        r"\1<NAME>",
        text,
        flags=re.IGNORECASE
    )

    return text


# ============================================================
#           AVIATION CLASSIFIER WITH TRIGGER RETURN
# ============================================================
AVIATION_KEYWORDS = [
    "cabin crew",
    "flight attendant",
    "airline",
    "aviation",
    "safety training",
    "easa",
    "iata",
    "inflight",
    "airport",
    "crew member",
    "check in",
]


def get_aviation_trigger(text: str):
    """Return the keyword that triggers aviation classification."""
    lowered = text.lower()

    for kw in AVIATION_KEYWORDS:
        pattern = r"\b" + re.escape(kw) + r"\b"
        if re.search(pattern, lowered):
            return kw
    return None


# ============================================================
#                   PROCESS SINGLE CV
# ============================================================
def process_single_cv(file_path: str) -> dict:
    with open(file_path, "r", encoding="utf-8") as f:
        cv = json.load(f)

    raw_text = cv.get("text", "")

    # Normalize first
    normalized = normalize_text(raw_text)

    # Aviation trigger BEFORE anonymization
    trigger = get_aviation_trigger(normalized)
    aviation_flag = trigger is not None

    # Then anonymize
    cleaned_text = anonymize_text(normalized)

    return {
        "original_file": os.path.basename(file_path),
        "text": cleaned_text,
        "is_aviation": aviation_flag,
        "aviation_keyword": trigger,    # <-- new field
    }


# ============================================================
#                 MAIN PROCESSING LOOP WITH STATS
# ============================================================
def process_all_cvs():
    log_lines = []

    # Dataset statistics
    stats = {
        "total": 0,
        "aviation": 0,
        "non_aviation": 0,
        "placeholder_counts": {k: 0 for k in ["EMAIL", "PHONE", "PASSPORT", "DATE", "NAME"]},
        "keyword_hits": {kw: 0 for kw in AVIATION_KEYWORDS},
    }

    for filename in os.listdir(RAW_CV_DIR):
        if not filename.lower().endswith(".json"):
            continue

        full_path = os.path.join(RAW_CV_DIR, filename)

        try:
            cleaned_cv = process_single_cv(full_path)
            cleaned_path = os.path.join(CLEANED_CV_DIR, filename)

            with open(cleaned_path, "w", encoding="utf-8") as f:
                json.dump(cleaned_cv, f, indent=4)

            # Update stats
            stats["total"] += 1

            if cleaned_cv["is_aviation"]:
                stats["aviation"] += 1
                stats["keyword_hits"][cleaned_cv["aviation_keyword"]] += 1
            else:
                stats["non_aviation"] += 1

            # Count placeholders
            text = cleaned_cv["text"]
            for key in stats["placeholder_counts"]:
                stats["placeholder_counts"][key] += text.count(f"<{key}>")

            log_lines.append(
                f"[OK] {filename} | Aviation: {cleaned_cv['is_aviation']} | Trigger: {cleaned_cv['aviation_keyword']}"
            )

        except Exception as e:
            log_lines.append(f"[ERROR] {filename}: {str(e)}")

    # Compute rates
    if stats["total"] > 0:
        stats["aviation_rate"] = stats["aviation"] / stats["total"]
    else:
        stats["aviation_rate"] = 0.0

    # Write log file
    with open(LOG_FILE, "w", encoding="utf-8") as log:
        log.write("\n".join(log_lines))
        log.write("\n\n=== DATASET STATISTICS ===\n")
        log.write(f"Total CVs: {stats['total']}\n")
        log.write(f"Aviation CVs: {stats['aviation']}\n")
        log.write(f"Non-Aviation CVs: {stats['non_aviation']}\n")
        log.write(f"Aviation Rate: {stats['aviation_rate']*100:.2f}%\n\n")

        log.write("=== Placeholder Counts ===\n")
        for placeholder, count in stats["placeholder_counts"].items():
            log.write(f"  {placeholder}: {count}\n")

        log.write("\n=== Aviation Keyword Triggers ===\n")
        for kw, count in stats["keyword_hits"].items():
            log.write(f"  {kw}: {count}\n")

    print("✅ Preprocessing completed. Logs saved.")
    print(f"✅ Processed: {stats['total']} CVs")
    print(f"✅ Aviation rate: {stats['aviation_rate']*100:.2f}%")


# ============================================================
#                         RUN SCRIPT
# ============================================================
if __name__ == "__main__":
    process_all_cvs()
