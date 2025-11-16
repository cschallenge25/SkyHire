import os
import json
import re
from collections import defaultdict

# ============================================================
#                      CONSTANT PATHS (EDIT THESE)
# ============================================================
RAW_CV_DIR = "./data/raw_cvs/"               
CLEANED_CV_DIR = "./data/cleaned_cvs/"       
OUTPUT_NER_FILE = "./data/cv_ner_format/cv_dataset.jsonl"
LOG_FILE = "./data/logs/ner_conversion_log.txt"

os.makedirs(os.path.dirname(OUTPUT_NER_FILE), exist_ok=True)
os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)

# ============================================================
#                   AVIATION-SPECIFIC LABELS
# ============================================================
# ✅ We normalize all labels by upper-casing and stripping extra symbols
# This makes your dataset robust and consistent.

GENERAL_SKILL_LABELS = {
    "SKILL",
    "SKILL: BUILDING",
    "SKILL: KNOWLEDGE",
    "SKILL: SUPERVISION",
    "SKILL: PLANNING",
    "SKILL: MATERIALS",
    "SKILL: EQUIPMENT",
    "SKILL: RESPONSIBILITIES",
}

# ✅ Strong aviation-focused categories
AVIATION_LABELS = {
    "AVIATION: ROLE",
    "AVIATION: TRAINING",
    "AVIATION: CERTIFICATION",
    "AVIATION: AIRCRAFT",
    "AVIATION: EXPERIENCE",
    "AVIATION: SAFETY",
    "AVIATION: LANGUAGE",
}

# ✅ Useful because CVs often contain these concepts:
AIRCRAFT_TYPES = {
    "A320", "A330", "A340", "A350", "A380",
    "B737", "B747", "B757", "B767", "B777", "B787"
}

CERTIFICATIONS = {
    "EASA", "IATA", "ICAO", "FAA",
    "CPL", "ATPL", "TYPE RATING"
}

FLIGHT_ROLES = {
    "FLIGHT ATTENDANT",
    "CABIN CREW",
    "PURSER",
    "GROUND STAFF",
    "CHECK-IN AGENT",
    "FLIGHT DISPATCHER",
}

# ✅ Flatten into VALID LABELS
VALID_LABELS = set(GENERAL_SKILL_LABELS) | AVIATION_LABELS

# ============================================================
#           LABELS TO DISCARD (PII OR NON-INFORMATIVE)
# ============================================================
INVALID_LABELS = {
    "SKILL: PASSPORT",
    "SKILL: NATIONALITY",
    "SKILL: RELIGION",
    "SKILL: MARITAL STATUS",
    "SKILL: PERSONAL",
    "SKILL: EMAIL",
    "SKILL: PERMANENT",
    "SKILL: SKYPE",
}

# ============================================================
#                   LOADERS
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
#               LABEL NORMALIZATION
# ============================================================
def normalize_label(label: str) -> str:
    """
    Normalize labels: uppercase, trim spaces, unify formatting.
    """
    if not isinstance(label, str):
        return None
    label = label.strip().upper()
    return label

# ============================================================
#             SPAN VALIDATION
# ============================================================
def validate_span(start, end, text):
    if start < 0 or end > len(text) or start >= end:
        return False
    return True

# ============================================================
#                ANNOTATION FILTERING
# ============================================================
def filter_annotations(raw_annotations, stats):
    filtered = []

    for start, end, label in raw_annotations:
        norm_label = normalize_label(label)

        stats["total_annotations"] += 1

        if norm_label in INVALID_LABELS:
            stats["dropped_invalid"].append(norm_label)
            continue

        if norm_label not in VALID_LABELS:
            stats["dropped_unknown"].append(norm_label)
            continue

        filtered.append((start, end, norm_label))
        stats["kept"].append(norm_label)

    return filtered

# ============================================================
#            BUILD NER ENTRY
# ============================================================
def build_ner_entry(cleaned_text, raw_annotations, stats):
    entities = []

    for start, end, label in filter_annotations(raw_annotations, stats):
        if not validate_span(start, end, cleaned_text):
            stats["invalid_spans"].append(label)
            continue

        entities.append([start, end, label])

    return {"text": cleaned_text, "entities": entities}

# ============================================================
#               MAIN CONVERSION PIPELINE
# ============================================================
def convert_all_to_ner():
    log_lines = []
    ner_lines = []

    # ✅ Global dataset statistics
    global_stats = defaultdict(int)
    label_stats = defaultdict(int)

    for filename in os.listdir(RAW_CV_DIR):
        if not filename.endswith(".json"):
            continue

        per_file_stats = {
            "total_annotations": 0,
            "dropped_invalid": [],
            "dropped_unknown": [],
            "invalid_spans": [],
            "kept": []
        }

        try:
            raw_cv = load_raw_cv(filename)
            cleaned_cv = load_cleaned_cv(filename)

            cleaned_text = cleaned_cv.get("text", "")
            raw_annotations = raw_cv.get("annotations", [])

            entry = build_ner_entry(cleaned_text, raw_annotations, per_file_stats)
            ner_lines.append(json.dumps(entry))

            # ✅ update global stats
            for k in per_file_stats["kept"]:
                label_stats[k] += 1
            global_stats["processed_files"] += 1
            global_stats["total_entities"] += len(entry["entities"])

            log_lines.append(
                f"[OK] {filename} | Entities: {len(entry['entities'])} | "
                f"Dropped invalid: {len(per_file_stats['dropped_invalid'])}, "
                f"Dropped unknown: {len(per_file_stats['dropped_unknown'])}"
            )

        except Exception as e:
            log_lines.append(f"[ERROR] {filename}: {str(e)}")
            global_stats["errors"] += 1

    # ============================================================
    #            WRITE OUTPUTS
    # ============================================================
    with open(OUTPUT_NER_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(ner_lines))

    # Write logs
    with open(LOG_FILE, "w", encoding="utf-8") as log:
        log.write("\n".join(log_lines))
        log.write("\n\n===== DATASET STATISTICS =====\n")
        for k, v in global_stats.items():
            log.write(f"{k}: {v}\n")

        log.write("\n===== LABEL COUNTS =====\n")
        for label, count in label_stats.items():
            log.write(f"{label}: {count}\n")

    print("✅ NER conversion completed. JSONL file created.")
    print(f"✅ Total files: {global_stats['processed_files']}")
    print(f"✅ Total entities: {global_stats['total_entities']}")

# ============================================================
#                   RUN SCRIPT
# ============================================================
if __name__ == "__main__":
    convert_all_to_ner()
