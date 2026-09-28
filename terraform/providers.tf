# ==============================================================================
# Terraform Providers Configuration
# Cloud: Amazon Web Services (AWS)
# ==============================================================================

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "Infrastructure Automation for Hotel Booking System"
      Application = "StayEase"
      ManagedBy   = "Terraform"
      Environment = var.environment
    }
  }
}
