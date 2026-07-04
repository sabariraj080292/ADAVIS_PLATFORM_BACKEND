Perfect. After logging into the AWS EC2 Ubuntu server, do this in order.

Install prerequisites (one time)
sudo apt update
sudo apt install -y git curl ca-certificates gnupg lsb-release

If Docker is not installed yet:

sudo apt install -y docker.io docker-compose-v2
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ubuntu
newgrp docker

Clone your repo and checkout your branch
git clone <your-repo-url>
cd AdavisAi
git checkout aws_mdm_service_updates_v1
git pull

Prepare production env file
cp .env.aws.example .env.aws

Edit:

nano .env.aws

Critical: do not keep localhost for dependencies in container deployment unless those services are inside the same compose network.
Update at least these:

