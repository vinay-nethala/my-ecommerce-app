# E-Commerce Product Catalog

A modern, full-stack e-commerce application built with Next.js, featuring Server-Side Rendering (SSR), secure user authentication with NextAuth.js, and a complete shopping cart system.

## Features

- **Server-Side Rendering (SSR)**: Dynamic product catalog with fresh data on every request
- **Product Search & Pagination**: Server-side search and pagination for efficient browsing
- **User Authentication**: Secure OAuth authentication via GitHub using NextAuth.js
- **Shopping Cart**: Full cart management with add, remove, and quantity adjustment
- **Protected Routes**: Cart page only accessible to authenticated users via middleware
- **API Routes**: RESTful API with request validation using Zod
- **Database**: PostgreSQL with Prisma ORM for type-safe database operations
- **Containerization**: Docker and Docker Compose for consistent development and deployment
- **Testing Ready**: All interactive UI elements instrumented with data-testid attributes

## Tech Stack

- **Frontend**: Next.js 16 (Pages Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js 4 with GitHub OAuth
- **Database**: PostgreSQL 15, Prisma ORM
- **Validation**: Zod
- **Data Fetching**: SWR
- **Containerization**: Docker & Docker Compose

## Quick Start with Docker Compose

### Prerequisites

- Docker and Docker Compose installed

### Setup

1. **Clone the repository and navigate to project**
   ```bash
   cd my-ecommerce-app
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env.local
   ```

3. **Start the application**
   ```bash
   docker-compose up
   ```

The application will start on `http://localhost:3000` with:
- PostgreSQL database with sample products
- NextAuth.js authentication
- All migrations and seeding automated

## Running Locally Without Docker

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15 running locally

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   Update DATABASE_URL for local PostgreSQL connection.

3. **Set up database**
   ```bash
   npm run prisma:migrate
   npm run prisma:seed
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application** at `http://localhost:3000`

## Project Structure

```
├── pages/
│   ├── index.tsx                 # Home page with SSR, search, pagination
│   ├── cart.tsx                  # Protected shopping cart page
│   ├── products/[id].tsx         # Dynamic product detail page
│   ├── auth/signin.tsx           # Sign-in page
│   └── api/
│       ├── auth/[...nextauth].ts # NextAuth configuration
│       └── cart/index.ts         # Cart API endpoints
├── components/
│   ├── Navbar.tsx                # Navigation component
│   └── ProductCard.tsx           # Product card component
├── prisma/
│   ├── schema.prisma             # Database schema
│   ├── seed.ts                   # Database seeding script
│   └── seed-data/                # SQL seed data directory
├── middleware.ts                 # Route protection middleware
├── Dockerfile                    # Docker image configuration
├── docker-compose.yml            # Docker Compose services
├── .env.example                  # Environment variables template
└── submission.json               # Test credentials
```

## API Documentation

### Cart Endpoints (Requires Authentication)

#### GET /api/cart
Fetch the current user's cart.

#### POST /api/cart
Add product to cart.
```json
{
  "productId": "string",
  "quantity": number
}
```

#### DELETE /api/cart
Remove product from cart.
```json
{
  "productId": "string"
}
```

## Features Overview

### Server-Side Rendering
- Products fetched fresh on every request via `getServerSideProps`
- Ensures users always see current pricing and availability
- Product detail pages also use SSR with 404 handling for invalid products

### Search & Pagination
- Server-side search filtering by product name/description
- URL-based pagination with configurable items per page
- Query parameters: `?q=searchterm&page=2`

### Authentication
- OAuth via GitHub using NextAuth.js
- Automatic session management and CSRF protection
- Test user credentials in `submission.json`

### Shopping Cart
- Full CRUD operations via API
- Protected cart page accessible only to authenticated users
- Quantity management and item removal
- Real-time cart total calculation

### Data Validation
- Zod schema validation on all API endpoints
- Request body validation with detailed error messages
- Type-safe request/response handling

## Data-TestID Coverage

All interactive elements have data-testid attributes for automated testing:

**Home Page**: search-input, search-button, product-card-{id}, add-to-cart-button-{id}, pagination-next, pagination-prev

**Product Detail**: product-name, product-price, product-description, add-to-cart-button

**Cart Page**: cart-item-{id}, remove-item-button-{id}, quantity-input-{id}, cart-total

**Navigation**: signin-button, signout-button

## Environment Variables

Required:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_URL`: Application URL (e.g., http://localhost:3000)
- `NEXTAUTH_SECRET`: Secret for NextAuth.js (generate with: openssl rand -base64 32)

OAuth (at least one):
- `GITHUB_ID`: GitHub OAuth app ID
- `GITHUB_SECRET`: GitHub OAuth app secret

## Setting Up GitHub OAuth

1. Go to GitHub Settings → Developer Settings → OAuth Apps → New OAuth App
2. Set Authorization callback URL to `http://localhost:3000/api/auth/callback/github`
3. Copy Client ID and Secret to .env.local

## Troubleshooting

**Docker fails to start**: Ensure ports 3000 and 5432 are free. Run `docker-compose down` before retrying.

**Database connection error**: Verify DATABASE_URL and ensure PostgreSQL is running.

**Cannot add to cart**: Verify you are logged in and session is valid.

**Search not working**: Check that database is seeded with products.

## Production Deployment

1. Set production environment variables
2. Build: `npm run build`
3. Start: `npm run start`
4. Or use Docker: `docker build -t myapp . && docker run -p 3000:3000 myapp`
