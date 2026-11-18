# AWS Free Tier Setup Guide for Nook Backend

This guide outlines how to provision and run the Nook backend on AWS completely within the **12-Month Free Tier ($0/month)**.

---

## 1. Zero-Spend Budget Alert (Do this first)

1. Open **AWS Billing and Cost Management** → **Budgets**.
2. Click **Create budget** → select **Zero spend budget**.
3. Enter your alert email address.
4. Click **Create budget**. This ensures you are notified immediately if any cost exceeds $0.01.

---

## 2. Amazon RDS PostgreSQL Database (Free Tier)

1. Navigate to **RDS** → **Create database**.
2. **Engine**: PostgreSQL (v16 or v15).
3. **Template**: **Free Tier** *(crucial: this locks configuration to free tier limits)*.
4. **Settings**:
   - DB instance identifier: `nook-db`
   - Master username: `postgres`
   - Master password: `<generate-a-secure-password>`
5. **Instance class**: `db.t3.micro` or `db.t4g.micro` (1 vCPU, 1 GB RAM).
6. **Storage**:
   - Storage type: General Purpose SSD (`gp3` or `gp2`).
   - Allocated storage: `20` GiB *(Free tier allows up to 20 GB)*.
   - Disable **Enable storage autoscaling**.
7. **Connectivity**:
   - Virtual Private Cloud (VPC): Default VPC.
   - Public access: **Yes** (if connecting during initial setup from local machine, or keep within VPC for EC2-only access).
   - VPC Security Group: Create new (e.g. `nook-rds-sg`).
8. Click **Create database**.
9. Once the status is **Available**, copy the **Endpoint**.
   Your connection string will be:
   ```
   postgresql://postgres:<password>@<endpoint>:5432/nook?schema=public
   ```
10. Connect via `psql` or Prisma and create the database if needed:
    ```sql
    CREATE DATABASE nook;
    ```
11. Run Prisma migrations from your local backend folder:
    ```bash
    DATABASE_URL="postgresql://postgres:<password>@<endpoint>:5432/nook?schema=public" npx prisma migrate deploy
    ```

---

## 3. Amazon S3 Bucket (Polaroid Image Storage)

1. Navigate to **S3** → **Create bucket**.
2. **Bucket name**: `nook-media-prod` (or a unique name of your choice).
3. **Region**: `ap-south-1` (or your chosen AWS region).
4. **Block Public Access**: Keep **Block all public access** enabled *(images are accessed strictly via 15-minute signed URLs)*.
5. Click **Create bucket**.
6. Open your bucket → **Permissions** tab → **Cross-origin resource sharing (CORS)** → Click **Edit** and paste:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "HEAD"],
       "AllowedOrigins": ["https://nookmy.vercel.app", "http://localhost:5173"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```
7. Click **Save changes**.

### IAM User for S3 Access:
1. Navigate to **IAM** → **Users** → **Create user** (`nook-s3-uploader`).
2. Attach policy directly: Create an inline policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:GetObject",
           "s3:DeleteObject"
         ],
         "Resource": "arn:aws:s3:::nook-media-prod/*"
       }
     ]
   }
   ```
3. Create an **Access Key** for CLI/Application use and save:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

---

## 4. Amazon EC2 Instance (Application Server)

1. Navigate to **EC2** → **Launch Instance**.
2. **Name**: `nook-app-server`.
3. **OS**: **Ubuntu Server 24.04 LTS** (Free tier eligible).
4. **Instance type**: `t3.micro` or `t2.micro` (Free tier eligible: 750 hours/month).
5. **Key pair**: Create new key pair (e.g. `nook-ec2-key.pem`).
6. **Network Settings** (Security Group):
   - Allow **SSH (Port 22)**: From your IP.
   - Allow **HTTP (Port 80)**: Anywhere (`0.0.0.0/0`).
   - Allow **HTTPS (Port 443)**: Anywhere (`0.0.0.0/0`).
7. **Storage**: 20 GiB gp3 (Free tier covers up to 30 GiB EBS).
8. Click **Launch instance**.

---

## 5. Server Deployment

1. SSH into your EC2 instance:
   ```bash
   chmod 400 nook-ec2-key.pem
   ssh -i nook-ec2-key.pem ubuntu@<your-ec2-public-ip>
   ```

2. Install Docker, Docker Compose, Nginx, and Certbot:
   ```bash
   sudo apt update
   sudo apt install -y docker.io docker-compose-v2 nginx certbot python3-certbot-nginx git
   sudo usermod -aG docker ubuntu
   newgrp docker
   ```

3. Clone the Nook repository:
   ```bash
   git clone https://github.com/Dunkrick/nook.git
   cd nook/backend
   ```

4. Create the `.env` file on the server:
   ```bash
   cp .env.example .env
   nano .env
   ```
   Fill in your production values:
   ```env
   PORT=3003
   FRONTEND_URL=https://nookmy.vercel.app
   BACKEND_URL=https://api.yourdomain.com
   DATABASE_URL=postgresql://postgres:<password>@<rds-endpoint>:5432/nook?schema=public
   JWT_SECRET=<strong-random-secret>
   S3_BUCKET_NAME=nook-media-prod
   AWS_REGION=ap-south-1
   AWS_ACCESS_KEY_ID=<your-access-key-id>
   AWS_SECRET_ACCESS_KEY=<your-secret-access-key>
   GITHUB_WEBHOOK_SECRET=<webhook-secret>
   RABBITMQ_URL=amqp://rabbitmq:5672
   ```

5. Start the containers using the AWS compose configuration:
   ```bash
   docker compose -f docker-compose.aws.yml up -d --build
   ```

6. Verify container health:
   ```bash
   docker compose -f docker-compose.aws.yml ps
   curl http://127.0.0.1:3003/health
   ```

---

## 6. Nginx & Free SSL (Let's Encrypt)

1. Create Nginx server configuration:
   ```bash
   sudo nano /etc/nginx/sites-available/nook
   ```
   Add:
   ```nginx
   server {
       server_name api.yourdomain.com; # Or your dynamic DNS / Cloudflare domain

       location / {
           proxy_pass http://127.0.0.1:3003;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

2. Enable the site and request a certificate:
   ```bash
   sudo ln -s /etc/nginx/sites-available/nook /etc/nginx/sites-enabled/
   sudo rm /etc/nginx/sites-enabled/default
   sudo nginx -t
   sudo systemctl restart nginx
   sudo certbot --nginx -d api.yourdomain.com
   ```

3. Update the Vercel frontend `VITE_API_URL` environment variable to `https://api.yourdomain.com` and redeploy frontend.
