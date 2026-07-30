# SELVAM MALIGAI STORE — E-Commerce Platform

Production-grade e-commerce build, delivered in phases so each layer is real,
tested, and reviewable instead of a wall of shallow stub code.

## Build Plan

| Phase | Scope | Status |
|-------|-------|--------|
| 1 | Project scaffold, full MySQL schema, backend core (config, security, logging, JWT+bcrypt auth) | ✅ delivered |
| 2 | Products, cart, orders, coupons, recommendations (business logic + APIs) | planned |
| 3 | Owner/admin APIs: analytics, inventory, grievances, settings | planned |
| 4 | React customer frontend (home, product, cart, checkout, tracking) | ✅ delivered (home + auth pages; product/cart data still mocked pending Phase 2) |
| 5 | React admin dashboard | planned |
| 6 | Security hardening pass, SEO, performance tuning, deployment config | planned |

## Phase 1 Contents

```
backend/
  package.json          # dependencies + scripts
  .env.example           # required environment variables
  server.js              # app entrypoint
  src/
    config/
      env.js              # validated environment loader
      db.js               # MySQL connection pool (mysql2/promise)
    database/
      schema.sql          # complete schema — every table in the spec
    middlewares/
      security.js          # helmet, cors, rate-limit, csrf, xss/sqlinjection guards
      errorHandler.js       # centralized error handling + 404
      auth.js               # JWT verification + role-based access control
    utils/
      logger.js             # winston logger (audit + app logs)
      jwt.js                 # sign/verify/refresh helpers
      validators.js          # express-validator chains
    models/
      User.js                # parameterized-query user model
    controllers/
      authController.js      # register/login/refresh/logout w/ lockout + audit log
    routes/
      authRoutes.js
```

## Running Phase 1

```bash
cd backend
cp .env.example .env      # fill in real secrets
npm install
# create the database, then:
mysql -u root -p < src/database/schema.sql
npm run dev
```

Health check: `GET http://localhost:5000/api/health`

## Why phased delivery

The original spec covers a full multi-role marketplace (customer app, admin
dashboard, recommendation engine, notifications, grievance system, analytics,
30+ DB tables). Generating all of it in one pass would exceed reasonable
output size and produce untested, low-quality code. Each phase is complete
and runnable on its own, and later phases build on this foundation without
rewriting it.
