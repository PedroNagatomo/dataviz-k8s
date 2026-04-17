<div align="center">

# 📊 DataViz K8s

**Plataforma de visualização de dados full-stack containerizada com Docker e orquestrada com Kubernetes.**

[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/features/actions)

<br/>

> 🚀 Projeto demonstrando boas práticas de desenvolvimento moderno: arquitetura desacoplada, containerização, orquestração e CI/CD automatizado.

</div>

---

## 📑 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Arquitetura](#-arquitetura)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Pré-requisitos](#-pré-requisitos)
- [Como Executar](#-como-executar)
  - [Executando Localmente (sem Docker)](#1-executando-localmente-sem-docker)
  - [Executando com Docker Compose](#2-executando-com-docker-compose)
  - [Deploy no Kubernetes](#3-deploy-no-kubernetes)
- [Manifests Kubernetes](#-manifests-kubernetes)
- [Pipeline CI/CD](#-pipeline-cicd)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Como Contribuir](#-como-contribuir)
- [Licença](#-licença)
- [Autor](#-autor)

---

## 💡 Sobre o Projeto

O **DataViz K8s** é uma aplicação web full-stack voltada para visualização de dados, construída com uma arquitetura moderna baseada em microsserviços. O projeto foi desenvolvido com foco em:

- **Containerização** com Docker, garantindo consistência entre ambientes de desenvolvimento e produção.
- **Orquestração** com Kubernetes, permitindo escalabilidade horizontal, alta disponibilidade e gerenciamento declarativo da infraestrutura.
- **Automação** via GitHub Actions, com pipelines de CI/CD que garantem qualidade e entrega contínua.
- **Separação de responsabilidades** entre frontend (interface e visualizações) e backend (processamento e API de dados).

Este repositório serve tanto como projeto funcional quanto como referência de boas práticas para aplicações containerizadas.

---

## ✨ Funcionalidades

- 📈 Visualização interativa de dados via gráficos dinâmicos no frontend
- 🔌 API RESTful no backend para fornecimento e processamento de dados
- 🐳 Imagens Docker otimizadas para cada serviço
- ☸️ Deploy gerenciado pelo Kubernetes com suporte a múltiplas réplicas
- 🔁 Pipeline de CI/CD automatizado com GitHub Actions
- 🔧 Configuração separada por ambiente via variáveis de ambiente

---

## 🏗️ Arquitetura

O projeto segue uma arquitetura de microsserviços com dois serviços principais se comunicando dentro de um cluster Kubernetes:

```
                        ┌──────────────────────────────────────────────┐
                        │              Cluster Kubernetes               │
                        │                                              │
   Usuário              │  ┌─────────────────┐    ┌────────────────┐  │
     │                  │  │    Frontend      │    │    Backend     │  │
     │  HTTP Request    │  │   (React App)    │───▶│  (Node.js API) │  │
     └─────────────────▶│  │                 │    │                │  │
                        │  │  Service:        │    │  Service:      │  │
                        │  │  LoadBalancer    │    │  ClusterIP     │  │
                        │  │  Porta: 80       │    │  Porta: 3001   │  │
                        │  └─────────────────┘    └────────────────┘  │
                        │         │                       │            │
                        │    Deployment               Deployment       │
                        │    (N réplicas)             (N réplicas)     │
                        │                                              │
                        └──────────────────────────────────────────────┘
                                         │
                               ┌─────────▼──────────┐
                               │   GitHub Actions    │
                               │  (Build → Push →    │
                               │      Deploy)        │
                               └────────────────────┘
```

**Fluxo de comunicação:**
1. O usuário acessa o **Frontend** através do `Service` do tipo `LoadBalancer` exposto pelo Kubernetes.
2. O Frontend realiza chamadas HTTP para o **Backend** através do `Service` interno do tipo `ClusterIP`.
3. O Backend processa as requisições e retorna os dados para o Frontend renderizar os gráficos.
4. O **GitHub Actions** automatiza o build das imagens Docker, o push para o registry e o deploy atualizado no cluster.

---

## 🛠️ Tecnologias Utilizadas

### Frontend
| Tecnologia | Finalidade |
|---|---|
| React | Biblioteca principal para construção da interface |
| JavaScript (ES6+) | Linguagem base da aplicação |
| CSS | Estilização dos componentes |
| HTML | Estrutura base da aplicação |

### Backend
| Tecnologia | Finalidade |
|---|---|
| Node.js | Ambiente de execução JavaScript no servidor |
| JavaScript | Linguagem base da API |
| REST API | Padrão de comunicação entre frontend e backend |

### Infraestrutura
| Tecnologia | Finalidade |
|---|---|
| Docker | Containerização dos serviços |
| Dockerfile | Definição das imagens de cada serviço |
| Kubernetes (K8s) | Orquestração e gerenciamento dos containers |
| GitHub Actions | Automação de CI/CD |

---

## 📁 Estrutura do Projeto

```
dataviz-k8s/
│
├── .github/
│   └── workflows/                  # Definições dos pipelines CI/CD
│       └── deploy.yml              # Workflow de build e deploy
│
├── backend/                        # Serviço de API (Node.js)
│   ├── src/
│   │   ├── controllers/            # Lógica de controle das rotas
│   │   ├── routes/                 # Definição das rotas da API
│   │   └── index.js                # Ponto de entrada do servidor
│   ├── Dockerfile                  # Imagem Docker do backend
│   └── package.json                # Dependências e scripts do backend
│
├── frontend/                       # Aplicação React
│   ├── src/
│   │   ├── components/             # Componentes reutilizáveis
│   │   ├── pages/                  # Páginas da aplicação
│   │   └── App.js                  # Componente raiz
│   ├── public/
│   │   └── index.html              # HTML base da aplicação
│   ├── Dockerfile                  # Imagem Docker do frontend
│   └── package.json                # Dependências e scripts do frontend
│
├── k8s/                            # Manifests Kubernetes
│   ├── backend-deployment.yaml     # Deployment do backend
│   ├── backend-service.yaml        # Service do backend (ClusterIP)
│   ├── frontend-deployment.yaml    # Deployment do frontend
│   └── frontend-service.yaml      # Service do frontend (LoadBalancer)
│
└── .gitignore                      # Arquivos ignorados pelo Git
```

---

## ✅ Pré-requisitos

Antes de começar, certifique-se de ter as seguintes ferramentas instaladas:

| Ferramenta | Versão Recomendada | Link |
|---|---|---|
| Git | >= 2.x | [git-scm.com](https://git-scm.com/) |
| Node.js | >= 18.x | [nodejs.org](https://nodejs.org/) |
| npm | >= 9.x | Incluído com o Node.js |
| Docker | >= 24.x | [docker.com](https://www.docker.com/) |
| kubectl | >= 1.28 | [kubernetes.io](https://kubernetes.io/docs/tasks/tools/) |
| Minikube | >= 1.32 | [minikube.sigs.k8s.io](https://minikube.sigs.k8s.io/) |

---

## 🚀 Como Executar

### Clonando o repositório

```bash
git clone https://github.com/PedroNagatomo/dataviz-k8s.git
cd dataviz-k8s
```

---

### 1. Executando Localmente (sem Docker)

Ideal para desenvolvimento e testes rápidos.

**Backend:**

```bash
# Acesse a pasta do backend
cd backend

# Instale as dependências
npm install

# Inicie em modo desenvolvimento
npm run dev
```

> API disponível em: `http://localhost:3001`

**Frontend** (em outro terminal):

```bash
# Acesse a pasta do frontend
cd frontend

# Instale as dependências
npm install

# Inicie a aplicação React
npm start
```

> Aplicação disponível em: `http://localhost:3000`

---

### 2. Executando com Docker Compose

Sobe os dois serviços de forma integrada com um único comando.

```bash
# Na raiz do projeto
docker compose up --build
```

Para parar e remover os containers:

```bash
docker compose down
```

---

### 3. Deploy no Kubernetes

#### Passo 1 — Iniciar o cluster local

```bash
minikube start
```

#### Passo 2 — Configurar o Docker para usar o registry do Minikube

```bash
eval $(minikube docker-env)
```

#### Passo 3 — Construir as imagens Docker

```bash
# Imagem do backend
docker build -t dataviz-backend:latest ./backend

# Imagem do frontend
docker build -t dataviz-frontend:latest ./frontend
```

#### Passo 4 — Aplicar os manifests no cluster

```bash
kubectl apply -f k8s/
```

#### Passo 5 — Verificar os recursos criados

```bash
# Verificar os Pods
kubectl get pods

# Verificar os Services
kubectl get services

# Verificar os Deployments
kubectl get deployments
```

A saída esperada deve ser semelhante a:

```
NAME                          READY   STATUS    RESTARTS   AGE
backend-deployment-xxxx       1/1     Running   0          1m
frontend-deployment-xxxx      1/1     Running   0          1m
```

#### Passo 6 — Acessar a aplicação

```bash
minikube service frontend-service
```

O Minikube abrirá automaticamente o endereço no navegador, ou exibirá a URL de acesso no terminal.

#### Removendo o deploy

```bash
kubectl delete -f k8s/
```

---

## ☸️ Manifests Kubernetes

Os arquivos YAML na pasta `k8s/` definem toda a infraestrutura da aplicação no cluster:

| Arquivo | Tipo | Descrição |
|---|---|---|
| `backend-deployment.yaml` | `Deployment` | Define o número de réplicas, imagem e variáveis do backend |
| `backend-service.yaml` | `Service (ClusterIP)` | Expõe o backend internamente dentro do cluster |
| `frontend-deployment.yaml` | `Deployment` | Define o número de réplicas, imagem e variáveis do frontend |
| `frontend-service.yaml` | `Service (LoadBalancer)` | Expõe o frontend externamente para acesso do usuário |

**Exemplo de Deployment (backend):**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: backend
          image: dataviz-backend:latest
          ports:
            - containerPort: 3001
```

---

## 🔄 Pipeline CI/CD

O projeto utiliza **GitHub Actions** para automatizar o ciclo de build, teste e deploy a cada push na branch `main`.

```
Push para main
      │
      ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Checkout  │────▶│  Build &    │────▶│    Push     │────▶│   Deploy    │
│    Código   │     │    Test     │     │  Registry   │     │    K8s      │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

**Etapas do pipeline:**

1. **Checkout** — Clona o repositório na máquina do runner.
2. **Build & Test** — Instala dependências e executa os testes automatizados.
3. **Build Docker** — Constrói as imagens Docker do frontend e backend.
4. **Push Registry** — Publica as imagens no container registry (Docker Hub / GitHub Container Registry).
5. **Deploy** — Aplica os manifests atualizados no cluster Kubernetes.

O arquivo de workflow está em `.github/workflows/`.

---
