# ==============================================================================
# Terraform Outputs
# ==============================================================================

output "vpc_id" {
  description = "StayEase VPC identifier"
  value       = aws_vpc.main.id
}

output "alb_dns_name" {
  description = "Public DNS name of the Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "website_url" {
  description = "Entrypoint URL for the StayEase hotel booking web application"
  value       = "http://${aws_lb.main.dns_name}"
}

output "health_check_url" {
  description = "Application load balancer health check endpoint"
  value       = "http://${aws_lb.main.dns_name}/health"
}

output "rds_endpoint" {
  description = "MySQL database host endpoint"
  value       = aws_db_instance.mysql.endpoint
}

output "autoscaling_group_name" {
  description = "Name of the compute Auto Scaling Group"
  value       = aws_autoscaling_group.app.name
}
