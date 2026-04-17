# 📊 DataViz K8s

> A full-stack data visualization application containerized with Docker and orchestrated with Kubernetes.

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)

---

## 📋 Table of Contents

- [About](#about)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Running Locally](#running-locally)
  - [Deploying with Kubernetes](#deploying-with-kubernetes)
- [CI/CD Pipeline](#cicd-pipeline)
- [Contributing](#contributing)
- [License](#license)

---

## About

**DataViz K8s** is a modern data visualization platform built with a decoupled frontend/backend architecture. The application is fully containerized using Docker and deployed on Kubernetes, making it scalable, resilient, and production-ready.

---

## Architecture

```
┌─────────────────────────────────────────────┐
│                   Kubernetes                │
│                                             │
│  ┌─────────────┐       ┌─────────────────┐  │
│  │  Frontend   │──────▶│    Backend API  │  │
│  │  (React)    │       │   (Node.js)     │  │
│  └─────────────┘       └─────────────────┘  │
│         │                      │            │
│    K8s Service            K8s Service       │
│    (LoadBalancer)         (ClusterIP)       │
└─────────────────────────────────────────────┘
```

- **Frontend** — React application responsible for rendering charts and visualizations.
- **Backend** — Node.js REST API that processes and serves data to the frontend.
- **Kubernetes** — Manages deployments, services, scaling, and container orchestration.
- **GitHub Actions** — Automates build, test, and deployment pipelines.

---

## Project Structure

```
dataviz-k8s/
├── .github/
│   └── workflows/          # CI/CD pipeline definitions
├── backend/                # Node.js API
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── frontend/               # React application
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── k8s/                    # Kubernetes manifests
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── frontend-deployment.yaml
│   └── frontend-service.yaml
└── .gitignore
```

---

## Prerequisites

Make sure you have the following tools installed before getting started:

| Tool | Version | Description |
|------|---------|-------------|
| [Node.js](https://nodejs.org/) | >= 18.x | JavaScript runtime |
| [Docker](https://www.docker.com/) | >= 24.x | Container engine |
| [kubectl](https://kubernetes.io/docs/tasks/tools/) | >= 1.28 | Kubernetes CLI |
| [Minikube](https://minikube.sigs.k8s.io/) | >= 1.32 | Local Kubernetes cluster |

---

## Getting Started

### Running Locally

**1. Clone the repository**

```bash
git clone https://github.com/PedroNagatomo/dataviz-k8s.git
cd dataviz-k8s
```

**2. Start the backend**

```bash
cd backend
npm install
npm run dev
```

**3. Start the frontend**

```bash
cd frontend
npm install
npm start
```

The frontend will be available at `http://localhost:3000` and the backend API at `http://localhost:3001` (or as configured).

---

### Deploying with Kubernetes

**1. Start your local cluster**

```bash
minikube start
```

**2. Build the Docker images**

```bash
# Build backend image
docker build -t dataviz-backend:latest ./backend

# Build frontend image
docker build -t dataviz-frontend:latest ./frontend
```

**3. Apply the Kubernetes manifests**

```bash
kubectl apply -f k8s/
```

**4. Verify the deployment**

```bash
kubectl get pods
kubectl get services
```

**5. Access the application**

```bash
minikube service frontend-service
```

---

## CI/CD Pipeline

This project uses **GitHub Actions** to automate the build and deployment process.

The pipeline is triggered on every push to `main` and performs the following steps:

1. **Lint & Test** — Runs automated tests for both frontend and backend.
2. **Build** — Builds Docker images for each service.
3. **Push** — Publishes images to a container registry (Docker Hub / GitHub Container Registry).
4. **Deploy** — Applies the updated Kubernetes manifests.

You can view and edit the workflows in `.github/workflows/`.

---
