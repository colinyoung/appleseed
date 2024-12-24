# AWS Setup for Tree Planting API

## Prerequisites

1. AWS Account with appropriate permissions
2. AWS CLI configured
3. Amazon ECR repository created
4. Amazon ECS cluster created
5. IAM roles and policies configured

## Required AWS Resources

### 1. ECR Repository
```bash
aws ecr create-repository --repository-name tree-planting-api
```

### 2. ECS Cluster
```bash
aws ecs create-cluster --cluster-name tree-planting-cluster
```

### 3. IAM Roles

#### Task Execution Role
Create an IAM role named `ecsTaskExecutionRole` with the following policies:
- AmazonECSTaskExecutionRolePolicy
- Permission to read from AWS Systems Manager Parameter Store

#### Task Role
Create an IAM role named `ecsTaskRole` with necessary permissions for your application.

### 4. GitHub Actions Role
Create an IAM role for GitHub Actions with the following trust relationship:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:colinyoung/appleseed:*"
        }
      }
    }
  ]
}
```

### 5. Systems Manager Parameter Store
Store the database URL securely:
```bash
aws ssm put-parameter \
    --name "/tree-planting/database-url" \
    --value "your-database-url" \
    --type "SecureString"
```

## GitHub Secrets Required

Add the following secrets to your GitHub repository:
- `AWS_ROLE_ARN`: The ARN of the GitHub Actions role created above

## Task Definition

The task definition in `.aws/task-definition.json` needs to be updated with your:
- AWS Account ID
- Region
- Task execution role ARN
- Task role ARN

## Network Configuration

Ensure your ECS service is configured with:
- VPC with public and private subnets
- Security groups allowing inbound traffic on port 3000
- Application Load Balancer (if needed)

## Deployment

The GitHub Actions workflow will:
1. Build the Docker image
2. Push it to ECR
3. Update the ECS task definition
4. Deploy to ECS

You can trigger deployments by:
- Pushing to the main branch
- Manually triggering the workflow in GitHub Actions