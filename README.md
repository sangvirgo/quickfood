# 🍔 QuickFood — Enterprise-Grade Food Delivery Platform  

<div align="center">

![Java](https://img.shields.io/badge/Java_17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot_3-6DB33F?style=for-the-badge&logo=spring&logoColor=white)
![Spring Cloud](https://img.shields.io/badge/Spring_Cloud-6DB33F?style=for-the-badge&logo=spring&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)
![DigitalOcean](https://img.shields.io/badge/DigitalOcean-0080FF?style=for-the-badge&logo=digitalocean&logoColor=white)

**A modern, highly scalable, and fully containerized full-stack food delivery ecosystem.**  
*Designed and engineered end-to-end (System Architecture, Backend Microservices, Frontend UI, and CI/CD Pipeline) to mimic the core functionalities of industry leaders like UberEats and DoorDash.*

</div>

---

## 🎯 Executive Summary

**QuickFood** is a comprehensive food ordering and delivery platform built with a strict **Microservices Architecture**. It guarantees fault tolerance, horizontal scalability, and seamless user experiences across multiple roles. The project highlights advanced system design patterns, real-time spatial tracking capabilities, rigorous concurrency management, and a **fully automated CI/CD pipeline** for zero-touch production deployments.

**End-to-End Ownership:** This project was developed entirely from scratch by a single developer, covering database design, backend microservices implementation, frontend UI/UX integration, Dockerized infrastructure, and a production-grade DevOps pipeline.

---

## ✨ Core Technical Achievements

* **🏗️ Robust Microservices Ecosystem:** Engineered highly cohesive, loosely coupled services using **Spring Boot 3**. Orchestrated via **Netflix Eureka** for dynamic service discovery and **Spring Cloud Gateway** for centralized routing and JWT-based security.
* **📍 Real-Time Geospatial Processing:** Integrated **PostgreSQL with PostGIS** extensions to execute complex geographical queries. Enabled real-time driver location tracking, distance calculation, and precise delivery radius validation.
* **⚡ Concurrency & Race Condition Handling:** Successfully implemented robust transactional locking mechanisms. When multiple drivers simultaneously attempt to accept the same `WAITING` order, the system guarantees absolute data integrity—granting the order to exactly one driver while safely rejecting the others.
* **💻 Modern Multi-Role Frontend:** Developed a fully typed, responsive web application using **Next.js (React)**, featuring distinct, role-based dashboards for Customers, Restaurant Staff, and Delivery Drivers (Shippers).
* **🐳 Fully Containerized Infrastructure:** Streamlined the entire deployment lifecycle using **Docker Compose**, allowing the entire distributed system (databases, registry, gateway, and business services) to be spun up locally with a single command.
* **🚀 Automated CI/CD Pipeline:** Engineered a complete **GitHub Actions** pipeline that automatically builds, tests, and deploys the entire distributed system to a **DigitalOcean** cloud droplet on every push to `main` — achieving fully automated, zero-downtime deployments with Docker layer caching for build optimization.

---

## 🏛️ System Architecture

The architecture is designed to enforce microservice data sovereignty principles, decouple domains, and optimize for both performance and security.

```mermaid
graph TD
    %% Frontend Clients
    Client_Web["💻 Next.js Web App<br/>(Customer, Staff, Shipper UI)"] --> Gateway
    Client_Mobile["📱 Mobile / Postman API"] --> Gateway
    
    %% API Gateway Layer
    subgraph "Edge / Infrastructure Layer"
        Gateway["🌐 API Gateway (:8080)<br/>JWT Auth, CORS, Routing"]
        Eureka["📡 Eureka Registry (:8761)<br/>Service Discovery"]
    end
    
    Gateway -->|Registers| Eureka
    Gateway -.->|Routes to| Core
    Gateway -.->|Routes to| Delivery

    %% Business Microservices
    subgraph "Business Microservices"
        Core["📦 Core Service (:8081)<br/>User Mgmt, Product Catalog, Order Lifecycle"]
        Delivery["🚚 Delivery Service (:8082)<br/>Shipper Dispatch, Spatial Tracking"]
    end
    
    Core -->|Registers| Eureka
    Delivery -->|Registers| Eureka

    %% Inter-service Communication
    Core -.->|OpenFeign / Event| Delivery

    %% Database Layer
    subgraph "Data Storage Layer (Decoupled)"
        DB_Core[("🐘 PostgreSQL<br/>(quickfood_core)")]
        DB_Delivery[("🌍 PostgreSQL + PostGIS<br/>(quickfood_delivery)")]
    end

    Core --> DB_Core
    Delivery --> DB_Delivery
```

---

## 🚀 CI/CD Pipeline — Automated Production Deployment

The project features a fully automated **GitHub Actions** CI/CD pipeline that handles everything from source code to live production without any manual steps.

### Pipeline Overview

Every `git push` to the `main` branch triggers a two-stage pipeline:

```mermaid
flowchart LR
    A["👨‍💻 git push\nmain"] --> B

    subgraph "Stage 1 — Build & Push"
        B["🔨 Checkout\nSource Code"]
        B --> C["🐳 Docker\nBuildx Setup"]
        C --> D["🔐 Login to\nDocker Hub"]
        D --> E["📦 Build & Push\n5 Service Images"]
        E --> F["💾 GHA Cache\nLayer Reuse"]
    end

    F --> G

    subgraph "Stage 2 — Deploy"
        G["🔑 SSH into\nDigitalOcean Droplet"]
        G --> H["⬇️ Pull Latest\nDocker Images"]
        H --> I["♻️ Rolling Restart\nAll Services"]
        I --> J["🧹 Prune Old\nImages"]
        J --> K["✅ Health Check\n& Status Report"]
    end

    K --> L["🌍 Live at\n165.227.147.13:3000"]
```

### Key Engineering Decisions

| Design Choice | Implementation | Benefit |
|---|---|---|
| **Parallel image builds** | Each microservice has an independent `build-push` step | Faster pipeline via GitHub Actions parallelism |
| **Docker layer caching** | `cache-from/cache-to: type=gha` on all build steps | Dramatically reduces build time on unchanged layers |
| **Health-aware startup** | `condition: service_healthy` on all `depends_on` | Prevents race conditions during container orchestration |
| **Automated cleanup** | `docker image prune -f` post-deploy | Keeps the production droplet from running out of disk space |
| **Secret management** | All credentials stored in GitHub Secrets | Zero hardcoded credentials in source code |
| **Build-time env injection** | `NEXT_PUBLIC_API_URL` passed at build via `--build-args` | Ensures the frontend correctly targets the production API |

### Secrets & Environment Configuration

| GitHub Secret | Purpose |
|---|---|
| `DOCKER_USERNAME` / `DOCKER_PASSWORD` | Authenticate to Docker Hub for image push |
| `DROPLET_HOST` | Public IP of the DigitalOcean droplet |
| `DROPLET_SSH_KEY` | Private SSH key for secure remote access |
| `NEXT_PUBLIC_API_URL` | Production API endpoint injected at frontend build time |

### Service Startup Order (Production)

The `docker-compose.prod.yml` enforces strict startup sequencing to prevent cascading failures on cold boot:

```
postgres-db (healthcheck: pg_isready)
    └── discovery-service (healthcheck: /actuator/health → UP)
            ├── api-gateway
            ├── core-service
            └── delivery-service
                    └── frontend
```

### Live Deployment

> ✅ **18+ successful automated deployments** recorded, all passing — visible in the [GitHub Actions workflow history](https://github.com/sangvirgo/quickfood/actions).

The production application is accessible at: **`http://165.227.147.13:3000`** (hosted on a DigitalOcean Ubuntu 22.04 droplet, FRA1 region).

---

## 🗄️ Domain-Driven Data Model (ERD)

The system adheres to the Database-per-Service pattern to ensure high availability and prevent domain leakage.

```mermaid
erDiagram
    %% Core Service Domain
    USER ||--o{ ORDER : "places"
    PRODUCT ||--o{ ORDER_ITEM : "included in"
    ORDER ||--|{ ORDER_ITEM : "contains"
    
    %% Delivery Service Domain
    SHIPPER ||--o{ SHIPMENT : "accepts & delivers"
    
    %% Detailed Entities
    SHIPPER {
        UUID id PK
        String name
        Point current_location "PostGIS Point"
        Int age
    }
    SHIPMENT {
        UUID id PK
        UUID order_id FK "References Core Order"
        String status "WAITING, IN_TRANSIT, DELIVERED"
        Point dropoff_location "PostGIS Point"
    }
```

---

## 🧪 Quality Assurance & Resilience Strategies

High reliability is enforced through rigorous testing methodologies:

* **Boundary Value Analysis:** Strict validation applied to business rules (e.g., Shipper onboarding enforces precise age limits: testing exact `18 years` vs `18 years - 1 day` thresholds).
* **Geospatial Validation:** Boundary testing for coordinate ingestion (`lat: -90 to 90`, `lng: -180 to 180`), completely neutralizing anomalous spatial data errors.
* **Concurrency & Transaction Management:** Engineered pessimistic/optimistic locking strategies during the highly concurrent "Driver Order Acceptance" phase to eliminate race conditions and double-booking.

---

## 🚀 Getting Started

### Prerequisites
* [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
* [Node.js 18+](https://nodejs.org/) (for local frontend execution)

### 1. One-Click Backend Deployment (Docker)
Spin up the entire infrastructure natively—including PostgreSQL/PostGIS, Eureka, API Gateway, Core, and Delivery services.

```bash
git clone https://github.com/sangvirgo/quickfood.git
cd quickfood
docker compose up --build -d
```
*(Note: Please allow ~30 seconds for the Eureka server to fully register all microservice instances before making API calls.)*

### 2. Start the Frontend Application
```bash
cd quickfood-fe
npm install
npm run dev
```

### 🌍 Application Access Points
| Component | Local URL | Purpose |
|---|---|---|
| **Next.js Web App** | `http://localhost:3000` | Full UI for Customers, Staff, and Drivers |
| **API Gateway** | `http://localhost:8080` | Centralized entry point for all API requests |
| **Eureka Dashboard** | `http://localhost:8761` | Microservice instance monitoring |
| **PostgreSQL DBs** | `localhost:5432` | Dual decoupled schemas via `init-db.sql` |

---

## 📡 API Documentation (Postman)

A pre-configured Postman collection is included for rapid API evaluation.

1.  Locate `QuickFood-API.postman_collection.json` in the `/BACKEND` directory.
2.  Import the collection into your Postman workspace.
3.  Execute the **Register/Login** endpoints to automatically inject the JWT into your environment variables.
4.  Explore the secure microservice endpoints (`Products`, `Orders`, `Shipments`).

---

## 📁 Repository Structure

```text
quickfood/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions CI/CD pipeline
├── BACKEND/
│   ├── api-gateway/            # Centralized edge routing & JWT verification
│   ├── eureka-server/          # Netflix Eureka Service Registry
│   ├── core-service/           # Product catalog, shopping cart, user management
│   └── delivery-service/       # Routing, PostGIS spatial queries, delivery lifecycle
├── quickfood-fe/               # Next.js 14 Frontend application (App Router)
├── docker-compose.yml          # Local development orchestration
├── docker-compose.prod.yml     # Production orchestration (used by CI/CD)
├── init-db.sql                 # Automated database initialization & PostGIS setup
├── sqa_report.md               # Software Quality Assurance & Edge-case test reports
└── README.md
```

---

## 👨‍💻 Author

**Nguyễn Lưu Tấn Sang**
