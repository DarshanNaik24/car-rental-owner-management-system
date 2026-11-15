# AutoOwner — Car Rental Owner Management System

A simple, modern, professional Car Rental Management System built exclusively for the vehicle owner to manage, track, and monitor their personal car rental business without unnecessary complexity.

---

## 1. System Overview

This platform is **exclusively for the car owner**. It is **not** a customer-facing portal. Customers are managed solely as business records by the owner. There is no customer authentication, user registration, or multi-tenant complexity.

### Core Features
- **Dashboard & Business Analytics**: Real-time fleet health cards (Available, Rented, Maintenance), total revenue, collected payments, outstanding dues, total kilometres driven, and interactive monthly income & distance charts (Recharts).
- **Single Car Drill-Down**: Car switcher on the dashboard to view individual car metrics, active rentals, total earnings, lifetime mileage, and recent rental history.
- **Fleet Management (My Cars)**: Add, edit, view car specs, odometer tracking, vehicle photos, and direct rental booking.
- **Customer Directory**: Add, update, and search client records; view customer lifetime trips, total spend, and outstanding balances.
- **Rental Life Cycle**:
  - **Create Rental**: Car availability validation (prevents duplicate active rentals), inline customer assignment, pickup odometer, fuel gauge level, agreed rent, and optional advance payment.
  - **Complete Return**: Return odometer (auto-distance calculation), return fuel level, additional charges (late fee, extra km), damages, missing accessories, maintenance flag, and return payment settlement.
- **Vehicle Inspections**:
  - Pickup and Return inspections with standard checklist categories (Interior, Exterior, Mechanical, Accessories).
  - Status per item: `OK`, `NOT OK`, `NOT APPLICABLE`, notes, and photo uploads.
  - Custom checklist item creation.
  - **Side-by-side Inspection Comparison**: Highlights newly recorded damages and scratches between handover and return.
- **Payment Ledger**: Record multiple installment payments per rental (Cash, UPI, Bank Transfer), with automatic outstanding balance calculation using Java `BigDecimal` for currency accuracy.
- **Comprehensive Reports**: Filterable by car and date range; car-wise performance breakdown, monthly income/km summary, customer spending, and one-click CSV export.

---

## 2. Technology Stack

### Frontend
- **React 18** with **Vite 6**
- **JavaScript (ES Modules)**
- **Tailwind CSS 3** with modern typography (`Plus Jakarta Sans`)
- **Axios** with API client interceptors
- **Recharts** for monthly revenue & mileage analytics
- **Lucide React** icons

### Backend
- **Java 25 / 21 LTS**
- **Spring Boot 3.2+**
- **Spring Data JPA & Hibernate**
- **Spring Web & Validation**
- **PostgreSQL 16** with **Flyway** database migrations
- Monolithic layered architecture (`Controller → Service → Repository → PostgreSQL`)

### Production & Deployment
- **Frontend**: Cloudflare Pages (Free global CDN) or served directly via Nginx
- **Backend & Database**: Oracle Cloud Always Free eligible Ubuntu VM
- **Containerization**: Docker & Docker Compose
- **Web Server / Reverse Proxy**: Nginx with SSL (Certbot / Cloudflare Origin)

---

## 3. Project Directory Structure

```
car-rental-owner-management-system/
├── backend/
│   ├── pom.xml                               # Maven project configuration
│   ├── mvnw / mvnw.cmd / mvnw.ps1            # Maven wrappers
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/carrental/
│   │   │   │   ├── CarRentalApplication.java # Spring Boot main entry
│   │   │   │   ├── common/                   # Global responses, exceptions & storage
│   │   │   │   ├── vehicle/                  # Fleet & car management
│   │   │   │   ├── customer/                 # Customer records & spending
│   │   │   │   ├── rental/                   # Rental bookings & completion
│   │   │   │   ├── inspection/               # Inspections, checklist & comparison
│   │   │   │   ├── payment/                  # Payments ledger & balance
│   │   │   │   ├── photo/                    # Vehicle & inspection photo gallery
│   │   │   │   ├── dashboard/                # Aggregated metrics & monthly charts
│   │   │   │   └── report/                   # Detailed business reports
│   │   │   └── resources/
│   │   │       ├── application.yml           # Base Spring configuration
│   │   │       ├── application-postgres.yml  # PostgreSQL production profile
│   │   │       ├── application-local.yml     # Standalone local dev profile
│   │   │       └── db/migration/
│   │   │           ├── V1__create_initial_schema.sql
│   │   │           └── V2__seed_default_checklist.sql
│   │   └── test/                             # Unit tests for calculations & business rules
├── frontend/
│   ├── package.json                          # Vite & React dependencies
│   ├── vite.config.js                        # Vite config with backend API proxy
│   ├── tailwind.config.js                    # Tailwind styling configuration
│   ├── index.html                            # HTML template
│   ├── public/_redirects                     # Cloudflare Pages SPA client-side routing
│   └── src/
│       ├── App.jsx                           # Main application coordinator
│       ├── main.jsx                          # React DOM mount point
│       ├── api/client.js                     # Centralized Axios API client
│       ├── components/                       # Reusable UI components & modals
│       └── pages/                            # Full dashboard, car, customer, trip pages
├── docker/
│   ├── backend.Dockerfile                    # Multi-stage JDK/JRE build container
│   ├── frontend.Dockerfile                   # Production Node build + Nginx static container
│   ├── docker-compose.yml                    # PostgreSQL + Backend + Nginx orchestration
│   └── nginx.conf                            # Reverse proxy with gzip & caching
└── README.md
```

---

## 4. Local Development Setup

### Prerequisites
- Java 21 or Java 25 JDK
- Node.js (v18+) and npm
- PostgreSQL (or run backend with `./mvnw spring-boot:run` against local DB)

### 1. Run the Spring Boot Backend
Navigate to `backend`:
```powershell
cd backend
./mvnw.cmd spring-boot:run
```
*(On Linux/macOS: `./mvnw spring-boot:run`)*

The backend starts at `http://localhost:8080/api`. Flyway automatically runs database migrations on startup.

### 2. Run the React Frontend
In a separate terminal, navigate to `frontend`:
```powershell
cd frontend
npm install
npm run dev
```

Open your browser at `http://localhost:5173`. Requests to `/api/*` are automatically forwarded to `http://localhost:8080/api` via the Vite development proxy.

---

## 5. Production Deployment Guide (Oracle Cloud VM + Cloudflare)

This setup uses **100% free-tier eligible resources**:
1. **Oracle Cloud Always Free VM**: Ubuntu 22.04 LTS (AMD or Ampere A1 Compute).
2. **Cloudflare Pages**: Free static hosting and edge CDN for the React frontend (or served directly through Nginx on the VM).
3. **Free SSL**: Cloudflare SSL or Let's Encrypt via Certbot.

### Step 1: Launch Oracle Cloud Free Ubuntu Instance
1. In Oracle Cloud Console, navigate to **Compute > Instances > Create Instance**.
2. Select **Ubuntu 22.04 LTS** (Always Free Eligible).
3. In the VCN Security List, add Ingress Rules for ports:
   - `22` (SSH)
   - `80` (HTTP)
   - `443` (HTTPS)
4. SSH into your Ubuntu VM:
   ```bash
   ssh -i your_ssh_key.key ubuntu@<YOUR_VM_PUBLIC_IP>
   ```

### Step 2: Install Docker & Docker Compose on the VM
Run the following commands on the VM:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl gnupg lsb-release git

# Install Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Allow ubuntu user to run docker
sudo usermod -aG docker $USER
newgrp docker
```

### Step 3: Clone Repository and Build
```bash
git clone <YOUR_REPOSITORY_URL> car-rental-system
cd car-rental-system

# Build the frontend production bundle
cd frontend
npm install
npm run build
cd ..
```

### Step 4: Configure Environment & Launch Docker Compose
1. Open `docker/docker-compose.yml` and set a secure password for `POSTGRES_PASSWORD`.
2. Start all containers:
   ```bash
   cd docker
   docker compose up -d --build
   ```
3. Check container status:
   ```bash
   docker compose ps
   ```
   PostgreSQL, Spring Boot Backend, and Nginx will now be running.

### Step 5: Free HTTPS Configuration
#### Option A: Cloudflare Free SSL (Recommended & Easiest)
1. Point your domain (e.g. `rental.yourdomain.com`) in Cloudflare DNS to your Oracle VM public IP with **Proxy status: Proxied (Orange Cloud)**.
2. In Cloudflare Dashboard, set SSL/TLS mode to **Flexible** or **Full**.
3. HTTPS is active immediately with automatic renewal and DDoS protection!

#### Option B: Let's Encrypt / Certbot on the VM
Run Certbot directly inside the VM to obtain free certificates:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d rental.yourdomain.com
```

### Step 6: Deploying Frontend to Cloudflare Pages (Alternative)
If you prefer hosting the React frontend on Cloudflare Pages:
1. Connect your Git repository in **Cloudflare Pages**.
2. Build Settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `frontend`
3. Add Environment Variable:
   - `VITE_API_URL`: `https://api.yourdomain.com/api`
4. Deploy! Cloudflare Pages serves the React application globally with 0 ms cold starts.

---

## 6. Database Migrations (Flyway)

The PostgreSQL database schema is automatically managed by Flyway:
- `V1__create_initial_schema.sql`: Creates `vehicles`, `customers`, `rentals`, `inspections`, `checklist_items`, `inspection_results`, `payments`, and `rental_photos` tables with foreign keys and performance indexes.
- `V2__seed_default_checklist.sql`: Seeds default inspection items (Interior condition, Exterior scratches, Tyre condition, Warning lights, Cleanliness, Accessories, etc.).

No manual SQL execution is required upon deployment.

---

## 7. Business Logic & Validation Rules

- **Strict Owner Domain**: No customer login accounts or authentication tokens.
- **Car Availability Locking**: A car marked `RENTED` cannot be selected for a new rental until its current trip is completed or cancelled.
- **Mileage Consistency**: Return odometer must be $\ge$ pickup odometer. Odometer of the car is automatically updated upon trip completion.
- **Financial Precision**: All monetary fields (agreed rent, discounts, late charges, payments, and balances) use `BigDecimal` with exact scale.
- **Audit History**: Completed rental records cannot be accidentally deleted to preserve financial audit and maintenance history.
