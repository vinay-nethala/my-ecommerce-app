# 🛒 E-Commerce Product Catalog

A modern, full-stack e-commerce application built with Next.js, featuring Server-Side Rendering (SSR), secure user authentication with NextAuth.js, and a complete shopping cart system.

This project follows real-world engineering practices and is fully Dockerized for consistent development and evaluation.

---

## ✨ Features

- ⚡ Server-Side Rendering (SSR) for fast and SEO-friendly pages
- 🔍 Product Search & Pagination (server-side)
- 🔐 User Authentication using NextAuth.js (GitHub OAuth)
- 🛒 Shopping Cart
  - Add to cart
  - Update quantity
  - Remove items
- 🔒 Protected Routes (Cart accessible only to authenticated users)
- 🧩 RESTful API Routes with validation using Zod
- 🗄️ PostgreSQL database with Prisma ORM
- 🐳 Docker & Docker Compose support
- 🧪 data-testid attributes added for automated testing

---

## 🧰 Tech Stack

| Layer | Technology |
|------|-----------|
| Frontend | Next.js 16 (Pages Router), React 19, TypeScript |
| Styling | Tailwind CSS |
| Authentication | NextAuth.js v4 (GitHub OAuth) |
| Database | PostgreSQL 15 |
| ORM | Prisma |
| Validation | Zod |
| Data Fetching | SWR |
| Containerization | Docker, Docker Compose |

---

## 🏗️ System Architecture

``` mermaid
flowchart LR
  Browser -->|SSR Request| NextJS
  NextJS -->|API Calls| API[Next.js API Routes]
  API -->|Prisma ORM| DB[(PostgreSQL)]
  NextJS -->|Auth| NextAuth
  NextAuth --> GitHubOAuth[GitHub OAuth]
```
## 🛒 Cart Workflow
``` mermaid
sequenceDiagram
  participant User
  participant UI
  participant API
  participant DB

  User->>UI: Click Add to Cart
  UI->>API: POST /api/cart
  API->>DB: Create or Update CartItem
  DB-->>API: Success
  API-->>UI: Updated Cart Data
  UI-->>User: Cart Updated
```
## 🗄️ Database Schema
``` mermaid
erDiagram
  USER ||--|| CART : owns
  CART ||--o{ CART_ITEM : contains
  PRODUCT ||--o{ CART_ITEM : referenced_by

  USER {
    string id
    string email
  }

  PRODUCT {
    string id
    string name
    float price
  }

  CART {
    string id
    string userId
  }

  CART_ITEM {
    string id
    int quantity
    string productId
  }
```
## 🚀 Quick Start (Docker – Recommended)
## Prerequisites
Docker


Docker Compose
## Steps:
```
git clone <your-repository-url>
cd my-ecommerce-app
docker-compose up --build
```
## The application will be available at:
```
http://localhost:3000
```
## Docker automatically:
1.Starts PostgreSQL


2.Runs Prisma migrations


3.Seeds sample product data


4.Starts the Next.js application

## 💻 Running Locally Without Docker
## Prerequisites
1.Node.js 18+


2.PostgreSQL running locally
```
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```
## 📁 Project Structure
```
my-ecommerce-app/
├── pages / app
├── components
├── lib
├── prisma
│   ├── schema.prisma
│   ├── migrations
│   └── seed.ts
├── public
├── styles
├── Dockerfile
├── docker-compose.yml
├── docker-entrypoint.sh
├── .dockerignore
├── .env.example
├── package.json
└── README.md
```
## 🚧 Future Enhancements
1.Checkout & payment integration


2.Order history


3.Admin dashboard


4.Product reviews

## 👨‍💻 Author
Vinay Nethala
Full-Stack Developer




















