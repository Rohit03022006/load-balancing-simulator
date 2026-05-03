#!/usr/bin/env bash

set -euo pipefail

KIND_VERSION="v0.23.0"  
KUBECTL_VERSION="v1.30.0"

echo "[INFO] Checking Docker..."
if ! command -v docker >/dev/null 2>&1; then
  echo "[ERROR] Docker not found. Install Docker first."
  exit 1
fi

echo "[INFO] Installing kind..."
curl -Lo ./kind https://kind.sigs.k8s.io/dl/${KIND_VERSION}/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind

echo "[INFO] Verifying kind..."
kind --version

echo "[INFO] Installing kubectl..."
curl -LO "https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/

echo "[INFO] Verifying kubectl..."
kubectl version --client

echo "[INFO] Creating kind cluster..."
cat <<EOF | kind create cluster --name dev-cluster --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
  - role: worker
  - role: worker
EOF

echo "[INFO] Setting kubectl context..."
kubectl cluster-info --context kind-dev-cluster

echo "[INFO] Waiting for nodes to be ready..."
kubectl wait --for=condition=Ready nodes --all --timeout=120s

echo "[SUCCESS] kind cluster is up and running!"

echo "[INFO] Cluster nodes:"
kubectl get nodes -o wide

echo "[INFO] Quick test:"
kubectl create deployment nginx --image=nginx
kubectl expose deployment nginx --type=NodePort --port=80
kubectl get svc nginx
kubectl delete service nginx --ignore-not-found
kubectl delete deployment nginx --ignore-not-found

echo "[DONE] Cluster is ready. Use 'kubectl get all' to inspect resources."