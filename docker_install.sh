#!/usr/bin/env bash

set -euo pipefail

echo "[INFO] Updating package index..."
sudo apt-get update -y

echo "[INFO] Installing required dependencies..."
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

echo "[INFO] Setting up Docker GPG key..."
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
    sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "[INFO] Adding Docker repository..."
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

echo "[INFO] Updating package index (Docker repo)..."
sudo apt-get update -y

echo "[INFO] Installing Docker Engine..."
sudo apt-get install -y \
    docker-ce \
    docker-ce-cli \
    containerd.io \
    docker-buildx-plugin \
    docker-compose-plugin

echo "[INFO] Enabling Docker service..."
sudo systemctl enable docker
sudo systemctl start docker

echo "[INFO] Adding current user to docker group..."
sudo usermod -aG docker "$USER"

echo "[INFO] Verifying installation..."
docker --version
docker compose version

echo "[SUCCESS] Docker installed successfully!"
echo "[NOTE] Log out and back in (or run 'newgrp docker') to use Docker without sudo."