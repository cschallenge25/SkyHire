import json
import random
import os

# ============================================================
#              FILE PATHS (EDIT IF NECESSARY)
# ============================================================
DATA_DIR = "./data/cv_ner_format/"   # data directory

INPUT_FILE = os.path.join(DATA_DIR, "cv_dataset.jsonl") # input file
TRAIN_FILE = os.path.join(DATA_DIR, "train.jsonl") # train file
DEV_FILE = os.path.join(DATA_DIR, "dev.jsonl") # dev file
TEST_FILE = os.path.join(DATA_DIR, "test.jsonl") # test file

# Ensure folder exists
os.makedirs(DATA_DIR, exist_ok=True)


# ============================================================
#                LOAD DATASET FROM JSONL
# ============================================================
def load_jsonl(path):
    data = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                data.append(json.loads(line))
    return data


# ============================================================
#                WRITE JSONL FILE
# ============================================================
def write_jsonl(path, items):
    with open(path, "w", encoding="utf-8") as f:
        for item in items:
            f.write(json.dumps(item) + "\n")


# ============================================================
#                   MAIN SPLIT LOGIC
# ============================================================
def split_dataset():
    print("📥 Loading dataset:", INPUT_FILE)
    samples = load_jsonl(INPUT_FILE)
    print(f"✅ Loaded {len(samples)} CV samples.")

    # Shuffle
    random.shuffle(samples)

    # Calculate split sizes
    total = len(samples)
    train_size = int(total * 0.8)
    dev_size = int(total * 0.1)
    test_size = total - train_size - dev_size  # Remaining

    train_set = samples[:train_size]
    dev_set = samples[train_size : train_size + dev_size]
    test_set = samples[train_size + dev_size :]

    # Write output files
    write_jsonl(TRAIN_FILE, train_set)
    write_jsonl(DEV_FILE, dev_set)
    write_jsonl(TEST_FILE, test_set)

    print("========================================")
    print(f"✅ Training set:   {len(train_set)} samples")
    print(f"✅ Dev set:        {len(dev_set)} samples")
    print(f"✅ Test set:       {len(test_set)} samples")
    print("✅ Split completed successfully!")
    print("========================================")


# ============================================================
#                        RUN SCRIPT
# ============================================================
if __name__ == "__main__":
    split_dataset()
