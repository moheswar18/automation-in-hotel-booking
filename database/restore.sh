#!/usr/bin/env bash
# ==============================================================================
# Database Restoration Script for StayEase Hotel Booking System
# Restores MySQL database from a compressed .sql.gz or .sql archive
# ==============================================================================

set -euo pipefail

if [ "$#" -lt 1 ]; then
    echo "Usage: $0 <path-to-backup-file.sql.gz|path-to-backup-file.sql>"
    echo "Example: $0 /backups/mysql/stayease_db_backup_20260921_120000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-stayease_user}"
DB_PASSWORD="${DB_PASSWORD:-stayease_pass_2026}"
DB_NAME="${DB_NAME:-stayease_db}"

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "[ERROR] Backup file does not exist: ${BACKUP_FILE}"
    exit 1
fi

echo "====================================================="
echo "[RESTORE] Restoring database from: ${BACKUP_FILE}"
echo "[RESTORE] Target Database: ${DB_NAME} on ${DB_HOST}:${DB_PORT}"
echo "====================================================="

if [[ "${BACKUP_FILE}" == *.gz ]]; then
    echo "[RESTORE] Decompressing and importing .sql.gz archive..."
    gunzip -c "${BACKUP_FILE}" | mysql --host="${DB_HOST}" \
                                       --port="${DB_PORT}" \
                                       --user="${DB_USER}" \
                                       --password="${DB_PASSWORD}" \
                                       "${DB_NAME}"
else
    echo "[RESTORE] Importing .sql file..."
    mysql --host="${DB_HOST}" \
          --port="${DB_PORT}" \
          --user="${DB_USER}" \
          --password="${DB_PASSWORD}" \
          "${DB_NAME}" < "${BACKUP_FILE}"
fi

echo "[RESTORE] Database restoration completed successfully!"
echo "====================================================="
