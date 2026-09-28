# ==============================================================================
# IAM Roles & Instance Profile for EC2 Compute Nodes
# Allows SSM Session Manager, CloudWatch logging, and ECR container image pulls
# ==============================================================================

resource "aws_iam_role" "ec2_role" {
  name = "stayease-ec2-instance-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

# Attach SSM Policy for secure terminal access without open bastion ports
resource "aws_iam_role_policy_attachment" "ssm_attach" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Attach CloudWatch Logs Policy
resource "aws_iam_role_policy_attachment" "cloudwatch_attach" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

# Instance Profile for Launch Template
resource "aws_iam_instance_profile" "ec2_profile" {
  name = "stayease-ec2-instance-profile"
  role = aws_iam_role.ec2_role.name
}
