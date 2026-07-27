# SELVAM MALIGAI STORE Production Deployment

This project has three deployment parts:

```text
Vercel React frontend
        |
        | /api/* rewrite
        v
Node.js + Express backend
        |
        v
Production MySQL database
```

## Current implementation status

The current backend implements these routes:

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

The current frontend uses:

- Axios `baseURL: '/api'`
- Mock product data in `frontend/src/data/mockProducts.js`
- Browser `localStorage` for product manager changes
- In-memory cart state
- WhatsApp checkout messaging

Product, cart, order, and admin database APIs are not currently implemented in the backend. The database schema contains tables for those future features, but deploying the schema alone does not create API behavior.

## 1. Create the MySQL database

Use a MySQL 8+ production instance supplied by your database host. Do not use `localhost`, `127.0.0.1`, or the local `root` account from a hosted backend.

Import the existing schema:

```bash
mysql -h YOUR_MYSQL_HOST -P 3306 -u YOUR_MYSQL_USER -p < src/database/schema.sql
```

The schema creates these tables:

- `users`
- `admins`
- `addresses`
- `categories`
- `brands`
- `products`
- `product_images`
- `inventory_logs`
- `cart_items`
- `wishlist_items`
- `recently_viewed`
- `coupons`
- `coupon_usages`
- `orders`
- `order_items`
- `order_status_history`
- `payments`
- `reviews`
- `notifications`
- `grievances`
- `settings`
- `banners`
- `audit_logs`

The schema uses `CREATE TABLE IF NOT EXISTS`, so importing it into an existing database does not intentionally create duplicate tables. Review the schema and take a database backup before applying future schema changes.

## 2. Configure the backend host

Deploy the `backend` directory to a Node.js-compatible host such as Render, Railway, Fly.io, Azure App Service, or another service that runs `npm start`.

Set these environment variables on the backend host. Use real values from your providers and never commit them:

```text
NODE_ENV=production
PORT=5000
CLIENT_URL=https://selvammaligai.vercel.app

DB_HOST=YOUR_MYSQL_HOST
DB_PORT=3306
DB_USER=YOUR_MYSQL_USER
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=YOUR_MYSQL_DATABASE

JWT_ACCESS_SECRET=LONG_RANDOM_SECRET
JWT_REFRESH_SECRET=DIFFERENT_LONG_RANDOM_SECRET
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

COOKIE_SECRET=LONG_RANDOM_SECRET
CSRF_SECRET=LONG_RANDOM_SECRET
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
```

Generate secrets with a secure generator, for example:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Use a different generated value for every secret variable. Do not put these variables in the frontend or in a committed `.env` file.

The backend now:

- Requires production secrets and database variables.
- Rejects localhost database/client values in production.
- Uses MySQL instead of the local JSON user store in production.
- Uses `process.env.PORT` and binds to `0.0.0.0`.
- Uses secure HTTP-only refresh cookies.
- Restricts CORS to `CLIENT_URL` with credentials enabled.

## 3. Test the backend before connecting Vercel

After deployment, test:

```text
GET https://YOUR-BACKEND-DOMAIN.com/api/health
```

A healthy response is:

```json
{"success":true,"status":"ok","db":"connected"}
```

A `503` response means the backend is running but cannot connect to MySQL. Check `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, network allowlists, and SSL requirements from your database provider.

Test registration and login only after the health endpoint reports `db: connected`:

```bash
curl -i -X POST https://YOUR-BACKEND-DOMAIN.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"unique@example.com","phone":"9999999999","password":"StrongPass1"}'

curl -i -c cookies.txt -X POST https://YOUR-BACKEND-DOMAIN.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"unique@example.com","password":"StrongPass1"}'

curl -i -b cookies.txt -c cookies.txt -X POST https://YOUR-BACKEND-DOMAIN.com/api/auth/refresh

curl -i -b cookies.txt -X POST https://YOUR-BACKEND-DOMAIN.com/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 4. Connect the Vercel frontend

The frontend intentionally keeps:

```js
baseURL: '/api'
```

After the backend has a real public URL, edit `frontend/vercel.json` and replace the destination value:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://YOUR-BACKEND-DOMAIN.com/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

The current repository still contains `YOUR-BACKEND-URL.com` because no real backend URL has been supplied or deployed. Do not deploy the frontend with that placeholder if live authentication is required.

Deploy Vercel with:

- Root Directory: `frontend`
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

Set the backend `CLIENT_URL` to the exact Vercel origin, without a trailing slash:

```text
https://selvammaligai.vercel.app
```

Then redeploy the frontend and test the browser flows.

## 5. Production test checklist

### Currently implemented

- [ ] `GET /api/health` returns `db: connected`
- [ ] Registration creates a row in `users`
- [ ] Login returns an access token and sets an HTTP-only refresh cookie
- [ ] Refresh returns a new access token using the refresh cookie
- [ ] Logout clears the refresh cookie
- [ ] Refreshing the browser restores the session through `/api/auth/refresh`
- [ ] Invalid or expired access tokens return `401`
- [ ] A Vercel-origin request receives the correct CORS headers

### Not implemented in the current codebase

- [ ] Product listing/create/update/delete API routes
- [ ] Cart persistence API routes
- [ ] Order create/retrieve/update API routes
- [ ] Admin login and admin authorization routes
- [ ] Database-backed frontend product manager
- [ ] Database-backed frontend cart and order screens

These items require implementation work in addition to deployment. The schema tables exist, but they are not connected to Express routes or frontend API calls yet.
