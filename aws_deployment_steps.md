Adavis Platform deployment notes

Local development remains unchanged. Use the existing Windows-local workflow when you want to run the app on your machine:

```powershell
./scripts/setup-dev.ps1
```

For AWS EC2, use the Docker Compose deployment path below. This keeps the local setup as-is and adds the instance-related steps needed for deployment.

AWS EC2 deployment steps

1. Create an EC2 instance

- AMI: Ubuntu Server 22.04 LTS or 24.04 LTS
- Instance type: `t3.large` is acceptable for initial development and testing
- Storage: 30 to 50 GiB gp3
- Security group:
	- SSH `22` from your IP only
	- HTTP `80` open to the internet
	- HTTPS `443` open if you use TLS

2. Install prerequisites on the instance

```bash
sudo apt update
sudo apt install -y git curl ca-certificates gnupg lsb-release
```

If Docker is not installed yet:

```bash
sudo apt install -y docker.io docker-compose-v2
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ubuntu
newgrp docker
```

3. Clone the repository

```bash
git clone <your-repo-url>
cd ADAVIS_PLATFORM_BACKEND
git checkout <your-branch>
git pull
```

4. Prepare the AWS environment file

```bash
cp .env.aws.example .env.aws
nano .env.aws
```

Required keys in `.env.aws`:

- `JWT_SECRET`
- `EC2_HOST_IP`
- `MONGODB_URI`
- `REDIS_HOST`
- `REDIS_PORT`
- `KAFKA_BOOTSTRAP_SERVERS`
- `CORS_ALLOWED_ORIGINS`

Important:

- Do not leave dependency URLs on `localhost` unless those services are running on the same EC2 host.
- For same-host EC2 testing, set `EC2_HOST_IP` to the instance private IP and let the AWS compose file derive MongoDB, Redis, and Kafka endpoints from it.
- If MongoDB, Redis, or Kafka are external services, point the env values to those endpoints instead.

5. Build and deploy

```bash
chmod +x scripts/deploy-aws.sh scripts/status-aws.sh scripts/stop-aws.sh
./scripts/deploy-aws.sh
```

The deploy script will:

- validate `.env.aws`
- build missing JARs with Maven if needed
- validate the AWS compose file
- start the Docker stack
- wait for the gateway health check

6. Verify the deployment

```bash
./scripts/status-aws.sh
```

7. Stop the deployment when needed

```bash
./scripts/stop-aws.sh
```

AWS deployment notes

- The AWS flow is for Docker-based deployment on EC2, not the Windows-local `run-local.ps1` workflow.
- `run-local.ps1` should remain unchanged for development and testing on your workstation.
- For initial testing, `t3.large` is usable, but Kafka plus all Spring services can still push memory usage high.
- If you want a simpler first rollout, keep the app on EC2 and move MongoDB/Redis/Kafka to managed or separate services later.


docker compose --env-file .env.aws -f docker/docker-compose.aws.yml logs --tail=200 auth-service
docker compose --env-file .env.aws -f docker/docker-compose.aws.yml logs --tail=200 mdm-service
docker compose --env-file .env.aws -f docker/docker-compose.aws.yml logs --tail=200 api-gateway

