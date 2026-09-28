# ==============================================================================
# Terraform Variables
# ==============================================================================

variable "aws_region" {
  description = "AWS Deployment Region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment name"
  type        = string
  default     = "production"
}

variable "vpc_cidr" {
  description = "CIDR block for the StayEase Virtual Private Cloud"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets (ALB & Bastion)"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets (Application EC2 & RDS)"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "instance_type" {
  description = "EC2 Instance Type for Application cluster"
  type        = string
  default     = "t3.medium"
}

variable "asg_min_size" {
  description = "Minimum capacity of the Auto Scaling Group"
  type        = number
  default     = 2
}

variable "asg_max_size" {
  description = "Maximum capacity of the Auto Scaling Group"
  type        = number
  default     = 6
}

variable "asg_desired_capacity" {
  description = "Desired capacity of the Auto Scaling Group"
  type        = number
  default     = 2
}

variable "db_name" {
  description = "MySQL database name"
  type        = string
  default     = "stayease_db"
}

variable "db_username" {
  description = "Database administrator username"
  type        = string
  default     = "stayease_admin"
}

variable "db_password" {
  description = "Database administrator password (passed securely or via tfvars)"
  type        = string
  sensitive   = true
  default     = "StayEaseSecurePass2026!"
}
