#!/usr/bin/env bash
# ==============================================================================
# Automated Database Backup Script for StayEase Hotel Booking System
# Supports local backups, gzip compression, automated retention, and AWS S3 upload.
# ==============================================================================

set -euo pipefail

# Configuration
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-stayease_user}"
DB_PASSWORD="${DB_PASSWORD:-stayease_pass_2026}"
DB_NAME="${DB_NAME:-stayease_db}"
BACKUP_DIR="${BACKUP_DIR:-/backups/mysql}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
S3_BUCKET="${S3_BACKUP_BUCKET:-}"

DATE_TAG=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_backup_${DATE_TAG}.sql.gz"

echo "====================================================="
echo "[BACKUP] Initiating StayEase Database Backup"
echo "[BACKUP] Target DB: ${DB_NAME} on ${DB_HOST}:${DB_PORT}"
echo "[BACKUP] Timestamp: $(date)"
echo "====================================================="

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

# Run mysqldump and pipe through gzip
echo "[BACKUP] Exporting database tables and data..."
mysqldump --host="${DB_HOST}" \
          --port="${DB_PORT}" \
          --user="${DB_USER}" \
          --password="${DB_PASSWORD}" \
          --single-transaction \
          --quick \
          --routines \
          --triggers \
          "${DB_NAME}" | gzip -9 > "${BACKUP_FILE}"

BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "[BACKUP] Backup completed successfully: ${BACKUP_FILE} (${BACKUP_SIZE})"

# Verify integrity of the gzip file
if gzip -t "${BACKUP_FILE}"; then
    echo "[BACKUP] Integrity check passed."
else
    echo "[ERROR] Corrupted backup archive! Exiting."
    exit 1
fi

# Optional AWS S3 upload
if [ -n "${S3_BUCKET}" ]; then
    echo "[BACKUP] Uploading archive to AWS S3 bucket: s3://${S3_BUCKET}/db-backups/"
    aws s3 cp "${BACKUP_FILE}" "s3://${S3_BUCKET}/db-backups/" --storage-class STANDARD_IA
    echo "[BACKUP] S3 upload finished."
fi

# Prune backups older than RETENTION_DAYS
echo "[BACKUP] Pruning local backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -type f -name "${DB_NAME}_backup_*.sql.gz" -mtime +"${RETENTION_DAYS}" -exec rm -f {} +
echo "[BACKUP] Retention cleanup complete."
echo "====================================================="
