# ==============================================================================
# Security Groups: Tiered Isolation for ALB, Application EC2, and Database
# ==============================================================================

# 1. Application Load Balancer Security Group (Public facing)
resource "aws_security_group" "alb" {
  name        = "stayease-alb-sg"
  description = "Allows inbound HTTP/HTTPS traffic to Application Load Balancer"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "Public HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Public HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Forward traffic to application instances"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "stayease-alb-sg"
  }
}

# 2. Application Servers Security Group (Private Compute Tier)
resource "aws_security_group" "app" {
  name        = "stayease-app-sg"
  description = "Allows traffic strictly from ALB and SSH administration"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Allow HTTP from ALB"
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  ingress {
    description     = "Allow API port from ALB"
    from_port       = 5000
    to_port         = 5000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  ingress {
    description = "SSH Access from VPC / Bastion"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }

  egress {
    description = "Allow outbound Internet via NAT"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "stayease-app-sg"
  }
}

# 3. Database Security Group (Private Data Tier)
resource "aws_security_group" "database" {
  name        = "stayease-db-sg"
  description = "Allows MySQL traffic strictly from Application Servers"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "MySQL Access strictly from App SG"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  egress {
    description = "Disallow unnecessary outbound DB traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [var.vpc_cidr]
  }

  tags = {
    Name = "stayease-db-sg"
  }
}
