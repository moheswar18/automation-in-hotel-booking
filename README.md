# Infrastructure Automation for Hotel Booking System ("StayEase")

[![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue?logo=githubactions)](.github/workflows/deploy.yml)
[![Terraform AWS](https://img.shields.io/badge/IaC-Terraform%20AWS-623CE4?logo=terraform)](terraform/)
[![Ansible](https://img.shields.io/badge/Config-Ansible-EE0000?logo=ansible)](ansible/)
[![Docker](https://img.shields.io/badge/Containers-Docker%20Compose-2496ED?logo=docker)](docker-compose.yml)
[![Prometheus](https://img.shields.io/badge/Monitoring-Prometheus-E6522C?logo=prometheus)](monitoring/)
[![Grafana](https://img.shields.io/badge/Visualization-Grafana-F46800?logo=grafana)](monitoring/grafana/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 1. Introduction

**StayEase** is a production-grade full-stack hotel booking web application combined with automated cloud infrastructure, container orchestration, high availability load balancing, and real-time monitoring.

### Why Infrastructure Automation is Required:
In traditional hotel reservation platforms, manual provisioning causes:
- **Server downtime** during high booking surges (e.g. holidays or seasonal peaks).
- **Inconsistent server environments** between staging and production ("works on my machine").
- **Slow deployment cycles** requiring manual SSH updates and service restarts.
- **Single points of failure** without automated failover or autoscaling.

By combining **Terraform (Infrastructure as Code)**, **Ansible (Configuration Management)**, **Docker (Containerization)**, **GitHub Actions (CI/CD)**, and **Prometheus & Grafana (Observability)**, StayEase achieves zero-downtime rolling deployments, rapid autoscaling, and resilient self-healing cloud operations.

---

## 2. System Architecture

```
                                 STAYEASE ARCHITECTURE
                                          │
                                          ▼
                                   [ Users / Web ]
                                          │
                                          ▼
                             [ AWS Application Load Balancer ]
                                 (Port 80 / 443 + /health)
                                          │
                     ┌────────────────────┴────────────────────┐
                     ▼                                         ▼
            [ EC2 / App Server 1 ]                   [ EC2 / App Server 2 ]
            - Frontend Container (Nginx)             - Frontend Container (Nginx)
            - Backend Container (Flask/Gunicorn)     - Backend Container (Flask/Gunicorn)
            - Prometheus Exporter (/metrics)         - Prometheus Exporter (/metrics)
                     └────────────────────┬────────────────────┘
                                          ▼
                               [ AWS RDS / MySQL DB ]
                                 (Multi-AZ Private)
                                          │
                     ┌────────────────────┴────────────────────┐
                     ▼                                         ▼
           [ Automated S3 Backups ]                [ Prometheus & Grafana ]
           (Daily mysqldump + RPO/RTO)             (Alerts, Dashboards, Latency, CPU)
```

### Automation Layer Overview:
- **Terraform** → Provisions Multi-AZ VPC, subnets, Security Groups, ALB, Auto Scaling Group, and RDS MySQL.
- **Ansible** → Configures Ubuntu nodes, installs Docker Engine, pulls application images, and verifies health.
- **Docker & Compose** → Containerizes Frontend (Nginx), Backend (Flask), MySQL, Prometheus, and Grafana.
- **GitHub Actions** → Runs automated tests, builds images, pushes to registry, and deploys on git push.
- **Prometheus & Grafana** → Collects request metrics, latency, CPU, memory, and business KPIs.

---

## 3. Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | React.js (Vite, HTML5, CSS3, Tailwind) | Modern responsive UI, filters, booking forms, vouchers |
| **Backend** | Python 3.11+, Flask REST API | Modular Blueprints, PyJWT, SQLAlchemy, CORS |
| **Database** | MySQL 8.0 (with SQLite fallback) | Relational integrity, FKs, transactions, 8+ seeded hotels |
| **Containers** | Docker & Docker Compose | Multi-stage Nginx builder, Python slim runtime |
| **Cloud IaC** | HashiCorp Terraform | Modular AWS VPC, ALB, ASG, Launch Template, RDS |
| **Config Mgmt** | Ansible | Playbooks, roles (common, docker, app_deploy, monitoring) |
| **CI/CD** | GitHub Actions | 8-stage automated build, test, package, and deploy pipeline |
| **Monitoring** | Prometheus & Grafana | Custom metrics collector (`/metrics`), live visual dashboards |

---

## 4. Key Application Features

1. **User Authentication Module**:
   - Secure Registration (Full Name, Email, Phone, Password, Confirm Password).
   - JWT-based Login with role separation (`user` vs `admin`).
2. **Hotel Search & Exploration**:
   - Search by location, check-in, check-out dates, and number of guests.
   - Filter by price slider, star ratings (4.8+, 4.5+), room types, and amenities.
   - Dynamic sorting: Price low to high, Price high to low, Highest rating.
3. **Hotel Details & Room Selection**:
   - High-definition image galleries, full amenity breakdown (Wi-Fi, Pool, Spa, AC, etc.).
   - Room tier cards with capacity, bed configurations, pricing, and availability tags.
4. **Complete Booking Flow**:
   - Dynamic calculation of stay duration, night charges, 12% GST taxes, and totals.
   - Primary guest contact form and special accommodation requests.
5. **Simulated Payment Module**:
   - Academic demonstration mode supporting Credit/Debit Card, UPI, and Net Banking.
   - Generates simulated transaction references (e.g. `TXN-UPI-774910284`).
   - Confirms booking with instant confirmation voucher.
6. **My Bookings History**:
   - Live reservation cards, stay vouchers, and self-service reservation cancellations.
7. **Admin Dashboard & Visual Analytics**:
   - Real-time KPIs: Total Users, Hotels, Rooms, Bookings, Revenue, and Cancellations.
   - Interactive charts: Booking status distribution and top destination popularity.
   - Complete CRUD: Add/Edit/Delete hotels and rooms, toggle room availability.

---

## 5. Local Setup & Quick Demonstration

### Option A: One-Click Python Launcher (Fastest for College Presentation)
```bash
# 1. Install dependencies
cd backend
pip install -r requirements.txt

# 2. Run the one-click presentation launcher from project root
cd ..
python run_local.py
```
> **Default Demo Credentials:**
> - **Administrator**: `admin@stayease.com` / `Admin@123`
> - **Customer Demo**: `john@example.com` / `User@123`

The launcher automatically:
- Initializes the database with 8+ seeded luxury hotels.
- Starts the Flask API on `http://localhost:5000`.
- Launches your default web browser to the interactive StayEase web application.

---

### Option B: Docker Compose (Full Containerized Cluster)
```bash
# Start all 5 services: MySQL, Backend, Frontend, Prometheus, Grafana
docker compose up -d

# Verify all containers are healthy
docker compose ps
```

**Service URLs:**
- 🌐 **Hotel Web Application**: [http://localhost:80](http://localhost:80) or [http://localhost:3000](http://localhost:3000)
- 🔌 **Backend REST API**: [http://localhost:5000/api/hotels](http://localhost:5000/api/hotels)
- 🩺 **Health Check**: [http://localhost:5000/health](http://localhost:5000/health)
- 🔥 **Prometheus Metrics**: [http://localhost:9090](http://localhost:9090)
- 📊 **Grafana Dashboard**: [http://localhost:3001](http://localhost:3001) *(login: `admin` / `admin`)*

---

## 6. Cloud Deployment & Automation

### Step 1: Provision Cloud Infrastructure with Terraform
```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Customize region or database passwords as needed

terraform init
terraform plan
terraform apply
```
*Outputs generated:* `alb_dns_name`, `website_url`, `rds_endpoint`, `autoscaling_group_name`.

### Step 2: Configure Application Servers with Ansible
```bash
cd ../ansible
# Update inventory with target server IP addresses
ansible-playbook -i inventory playbook.yml
```

---

## 7. CI/CD Pipeline (GitHub Actions)

Located at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):
1. **Checkout Code**: Clones commit from `main`.
2. **Setup Runtimes**: Configures Python 3.11 and Node.js 20.
3. **Run Tests**: Executes automated test suite (`python backend/tests/run_tests.py`).
4. **Build Frontend**: Compiles production React assets (`npm run build`).
5. **Build Container Images**: Builds Docker images for Backend and Frontend.
6. **Push to Registry**: Publishes version-tagged images to GitHub Container Registry (GHCR).
7. **Deploy Application**: Connects securely to target servers and triggers container reload.
8. **Health Check**: Validates `/health` endpoint to ensure HTTP 200 before concluding.

---

## 8. 20-Step Demonstration Walkthrough for Presentations

Follow this exact sequence during your viva or project presentation:

1. **Open the Application**: Visit `http://localhost:5000` (or `http://localhost:80`).
2. **Explore the Homepage**: Showcase the "StayEase" branding, hero search bar, and popular destinations.
3. **Register a New Customer**: Click **Register**, enter new details, and show immediate session creation.
4. **Customer Login**: Sign in with `john@example.com` / `User@123` (or use the one-click demo button).
5. **Search Hotels**: Enter "Goa" in the destination field and click **Search Hotels**.
6. **Demonstrate Filters & Sorting**:
   - Adjust the price range slider.
   - Toggle ratings (e.g. 4.8+).
   - Change sorting from "Highest Rated" to "Price: Low to High".
7. **Inspect Hotel Details**: Click **View Details** on *Ocean Breeze Luxury Resort*.
8. **Review Room Tiers**: Scroll to the room cards (e.g., *Beachfront Pool Villa*).
9. **Select Room & Fill Guest Details**: Click **Book Now**, adjust dates and guest count.
10. **Simulated Payment**: Select payment method (**UPI** or **Credit Card**), click **Pay & Confirm**.
11. **Booking Confirmation Voucher**: Display the generated `SE-BKG-XXXX` booking code and transaction ID.
12. **My Bookings Page**: Navigate to **My Bookings** and show the newly confirmed reservation.
13. **Cancel Reservation**: Click **Cancel Booking** and demonstrate instant status update to `Cancelled`.
14. **Admin Dashboard Login**: Sign in as Administrator (`admin@stayease.com` / `Admin@123`).
15. **Explain Dashboard Telemetry**:
    - Show live KPI counts: Users, Hotels, Rooms, Bookings, Revenue.
    - Show real-time status distribution and destination popularity charts.
16. **Hotel Inventory Management**: Open **Hotel Management** tab, show Add/Edit/Delete controls.
17. **Demonstrate Health Endpoint**: Open `http://localhost:5000/health` in a new tab (show `status: healthy`, `database: connected`).
18. **Inspect Prometheus Telemetry**: Open `http://localhost:5000/metrics` to showcase live `http_requests_total` and `hotel_bookings_total`.
19. **Open Grafana Monitoring**: Visit `http://localhost:3001` and showcase the *"Hotel Booking Infrastructure Monitoring"* dashboard.
20. **Explain Cloud Architecture**: Reference Terraform (`terraform/`), Ansible (`ansible/`), and GitHub Actions (`.github/workflows/deploy.yml`) to conclude the infrastructure automation story.

---

## 9. Project Directory Structure

```
hotel-booking-infrastructure/
│
├── frontend/                     # React.js Single Page Application
│   ├── src/                      # JSX components, pages, context, API service
│   ├── public/                   # Static icons and assets
│   ├── dist/                     # Standalone distribution bundle (instant preview)
│   ├── package.json              # NPM dependencies and build scripts
│   ├── vite.config.js            # Vite build configuration
│   ├── nginx.conf                # Nginx reverse proxy & SPA router
│   └── Dockerfile                # Multi-stage container build
│
├── backend/                      # Python Flask REST API
│   ├── config/config.py          # Environment settings & DB pooling
│   ├── models/models.py          # SQLAlchemy models (User, Hotel, Room, Booking, Payment)
│   ├── routes/                   # Auth, Hotels, Rooms, Bookings, Payments, Admin, Health
│   ├── services/                 # Prometheus metrics service & database auto-seeder
│   ├── tests/run_tests.py        # Automated test suite
│   ├── requirements.txt          # Python dependencies
│   ├── app.py                    # Main Flask application
│   └── Dockerfile                # Production WSGI container image
│
├── database/                     # Relational Database Assets
│   ├── schema.sql                # Production MySQL DDL tables, indexes, constraints
│   ├── seed.sql                  # 8+ luxury hotels, rooms, users, and transactions
│   ├── backup.sh                 # Automated mysqldump with gzip and S3 upload
│   └── restore.sh                # Disaster recovery restoration script
│
├── docker/                       # Container Orchestration
│   └── docker-compose.yml        # Multi-service compose definition
│
├── terraform/                    # AWS Infrastructure as Code
│   ├── providers.tf              # AWS provider setup
│   ├── variables.tf              # Region, CIDRs, instance types
│   ├── networking.tf             # Multi-AZ VPC, subnets, IGW, NAT
│   ├── security_groups.tf        # Least-privilege tiered security groups
│   ├── load_balancer.tf          # Application Load Balancer & /health target group
│   ├── compute.tf                # Launch template, ASG, and target tracking scaling
│   ├── database.tf               # AWS RDS MySQL multi-AZ instance
│   ├── iam.tf                    # EC2 instance profiles and policies
│   ├── outputs.tf                # ALB DNS, RDS endpoint, ASG name
│   └── terraform.tfvars.example  # Configuration template
│
├── ansible/                      # Automated Server Configuration
│   ├── inventory                 # App cluster and monitoring hosts
│   ├── playbook.yml              # Master server configuration playbook
│   ├── group_vars/all.yml        # Global variables and container image refs
│   └── roles/                    # Common, Docker, App Deploy, Monitoring
│
├── monitoring/                   # Observability Stack
│   ├── prometheus/               # prometheus.yml scrape configs
│   └── grafana/                  # Automated datasource & dashboard provisioning
│
├── .github/                      # CI/CD Workflows
│   └── workflows/deploy.yml      # GitHub Actions 8-stage automated pipeline
│
├── docs/                         # Additional Documentation
│   └── BACKUP_AND_RECOVERY.md    # Disaster recovery & RPO/RTO strategy
│
├── run_local.py                  # One-click presentation launcher
├── docker-compose.yml            # Root docker compose file
├── .env.example                  # Environment configuration template
├── README.md                     # Comprehensive project documentation
└── LICENSE                       # MIT License
```

---

## 10. Future Enhancements

- **Real Payment Gateway**: Integration with Stripe / Razorpay Webhooks.
- **Automated Notifications**: Transactional booking confirmations via AWS SES (Email) and Twilio (SMS).
- **AI Recommendation Engine**: Personalized room recommendations based on traveler search preferences.
- **Multi-Region Disaster Recovery**: Active-Active cross-region database replication across AWS regions.

---

## 11. Academic viva / Presentation Credits
- **Project Title**: Infrastructure Automation for Hotel Booking System
- **Domain**: Cloud Computing, DevOps Engineering, Full-Stack Software Development
- **Demonstration Ready**: All services, mock datasets, automated tests, and dashboards are pre-configured.
