# ==============================================================================
# Infrastructure as Code: StayEase Hotel Booking System on AWS
# 
# Architecture:
# - Networking: Multi-AZ VPC with Public & Private Subnets, IGW, NAT Gateway
# - Security: Least-Privilege Security Groups for ALB, App, and Database tiers
# - Load Balancing: AWS Application Load Balancer with /health active monitoring
# - Compute & Scaling: Launch Template, Auto Scaling Group with CPU & Target tracking
# - Database: Multi-AZ AWS RDS MySQL 8.0 engine
# - IAM: Role and Instance Profile for SSM & CloudWatch
# ==============================================================================

# Root configuration aggregates networking.tf, security_groups.tf, load_balancer.tf,
# compute.tf, database.tf, and iam.tf.
