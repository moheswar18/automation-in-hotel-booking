# ==============================================================================
# AWS Relational Database Service (RDS) MySQL 8.0 Configuration
# Deployed securely within Private Data Subnets
# ==============================================================================

# 1. DB Subnet Group across Multi-AZ Private Subnets
resource "aws_db_subnet_group" "main" {
  name       = "stayease-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "stayease-db-subnet-group"
  }
}

# 2. Managed MySQL 8.0 RDS Instance
resource "aws_db_instance" "mysql" {
  identifier             = "stayease-mysql-db"
  engine                 = "mysql"
  engine_version         = "8.0"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  max_allocated_storage  = 100
  storage_type           = "gp3"

  db_name                = var.db_name
  username               = var.db_username
  password               = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.database.id]
  publicly_accessible    = false

  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "Sun:04:30-Sun:05:30"
  skip_final_snapshot     = true
  deletion_protection     = false

  tags = {
    Name = "stayease-mysql-instance"
  }
}
