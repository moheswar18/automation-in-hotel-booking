# Backup and Disaster Recovery Strategy

**Project**: Infrastructure Automation for Hotel Booking System ("StayEase")  
**Engine**: MySQL 8.0 / AWS RDS Multi-AZ  

---

## 1. Overview & Objectives

In a 24/7 mission-critical hotel booking infrastructure, data loss can lead to double-booked rooms, financial transaction discrepancies, and dissatisfied travelers. The StayEase Backup & Recovery system ensures zero data corruption, automated archival, and rapid point-in-time recovery.

### Target Service Level Metrics:
- **Recovery Point Objective (RPO)**: **< 1 Hour** (with automated binary log replication) / **24 Hours** (daily snapshot dumps).
- **Recovery Time Objective (RTO)**: **< 15 Minutes** to decompress, restore, and verify live booking transactions.

---

## 2. Backup Strategy & Implementation

### 2.1 Automated Script (`database/backup.sh`)
The shell script performs non-blocking logical dumps using `mysqldump` with `--single-transaction`:
1. **Dumps Schema & Data**: Backs up all tables (`users`, `hotels`, `rooms`, `bookings`, `payments`).
2. **Gzip Compression**: Compresses `.sql` payloads into `.sql.gz` reducing disk storage by ~85%.
3. **Integrity Validation**: Runs `gzip -t` to ensure the archive is uncorrupted before storage.
4. **Retention Management**: Retains backups for **7 days** locally, pruning older archives automatically.
5. **AWS S3 Archival**: Optionally synchronizes compressed archives to `s3://${S3_BACKUP_BUCKET}/db-backups/` using AWS CLI.

### 2.2 Execution
```bash
chmod +x database/backup.sh
export DB_HOST="127.0.0.1"
export DB_NAME="stayease_db"
export DB_USER="stayease_user"
export DB_PASSWORD="stayease_pass_2026"
./database/backup.sh
```

---

## 3. Database Restoration Procedure

### 3.1 Automated Script (`database/restore.sh`)
Restores full relational state from any gzip archive or plaintext `.sql` file:
```bash
chmod +x database/restore.sh
./database/restore.sh /backups/mysql/stayease_db_backup_20260921_120000.sql.gz
```

### 3.2 Post-Restoration Verification
1. **Health Check Validation**: Verify `curl -f http://localhost:5000/health` returns `healthy` with `database: connected`.
2. **Table Consistency**: Check `SELECT COUNT(*) FROM hotels;` and `SELECT COUNT(*) FROM bookings;`.

---

## 4. Disaster Recovery & Infrastructure Failure Scenarios

| Failure Scenario | Automatic Mitigation | Recovery Action |
| :--- | :--- | :--- |
| **EC2 Application Instance Crash** | AWS ALB detects unhealthy instance via `/health` within 30s. Traffic routed to healthy Server 2. | AWS Auto Scaling Group terminates broken instance and provisions replacement. |
| **Availability Zone Outage** | AWS ALB redistributes traffic to healthy instances in alternate Availability Zone (AZ). | Terraform ensures multi-AZ public and private subnet coverage. |
| **Primary RDS Database Outage** | AWS RDS Multi-AZ synchronously fails over to standby replica in secondary AZ (< 60s). | Application database pool automatically reconnects via DNS endpoint. |
| **Accidental Data Corruption** | Point-in-time recovery via S3 backups. | Execute `database/restore.sh` with latest verified snapshot archive. |
