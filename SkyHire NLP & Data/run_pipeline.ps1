# ============================================================
#                 UTOPIA-HIRE CV PROCESSING PIPELINE
# ============================================================

Write-Host "=========================================="
Write-Host "      UtopiaHire - CV Data Pipeline"
Write-Host "=========================================="

# Activate your virtual environment if needed
& .\venv\Scripts\Activate.ps1

# ============================================================
#                 CHECK PYTHON SCRIPTS EXIST
# ============================================================

if (-not (Test-Path "scripts/preprocess_cvs.py")) {
  Write-Host "[ERROR] preprocess_cvs.py not found!" -ForegroundColor Red
  exit 1
}

if (-not (Test-Path "scripts/convert_to_ner_format.py")) {
  Write-Host "[ERROR] convert_to_ner_format.py not found!" -ForegroundColor Red
  exit 1
}

if (-not (Test-Path "scripts/build_metadata.py")) {
  Write-Host "[ERROR] build_metadata.py not found!" -ForegroundColor Red
  exit 1
}

if (-not (Test-Path "scripts/split_dataset.py")) {
  Write-Host "[ERROR] split_dataset.py not found!" -ForegroundColor Red
  exit 1
}

# ============================================================
#                   RUN EACH STAGE IN SEQUENCE
# ============================================================

Write-Host "Step 1: Preprocessing CVs..."
python scripts/preprocess_cvs.py
if ($LASTEXITCODE -ne 0) {
  Write-Host "[ERROR] Preprocessing step failed." -ForegroundColor Red
  exit 1
}

Write-Host "Done."

Write-Host "Step 2: Converting annotations to NER format..."
python scripts/convert_to_ner_format.py
if ($LASTEXITCODE -ne 0) {
  Write-Host "[ERROR] NER conversion step failed." -ForegroundColor Red
  exit 1
}

Write-Host "Done."

Write-Host "Step 3: Building metadata file..."
python scripts/build_metadata.py
if ($LASTEXITCODE -ne 0) {
  Write-Host "[ERROR] Metadata step failed." -ForegroundColor Red
  exit 1
}

Write-Host "Metadata CSV created."

Write-Host "Step 4: Splitting dataset into train/dev/test..."
python scripts/split_dataset.py
if ($LASTEXITCODE -ne 0) {
  Write-Host "[ERROR] Dataset split step failed." -ForegroundColor Red
  exit 1
}

Write-Host "Done."

Write-Host "=========================================="
Write-Host "Pipeline complete!"
Write-Host "Output files generated in:"
Write-Host " - data/cleaned_cvs/"
Write-Host " - data/cv_ner_format/cv_dataset.jsonl"
Write-Host " - data/cv_ner_format/train.jsonl"
Write-Host " - data/cv_ner_format/dev.jsonl"
Write-Host " - data/cv_ner_format/test.jsonl"
Write-Host " - data/cv_metadata.csv"
Write-Host " - data/logs/"
Write-Host "=========================================="