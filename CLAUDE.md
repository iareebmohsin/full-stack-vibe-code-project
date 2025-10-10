# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A dockerized full-stack development environment with Next.js frontend and Laravel backend for an **AI Tools Sharing Platform** - an internal company platform where teams can discover, share, and manage AI tools and resources.

**Tech Stack:**
- Frontend: Next.js 15 + React 19 + TypeScript + Tailwind CSS 4
- Backend: Laravel 12 + PHP 8.2 + Nginx + Sanctum Auth
- Database: MySQL 8.0
- Cache: Redis 7
- Dev Tools: Alpine container for utilities

**Port Allocation:**
- 8200: Frontend (Next.js)
- 8201: Backend (Laravel/Nginx)
- 8202: PHP-FPM
- 8203: MySQL
- 8204: Redis
- 8205: Tools container

**Application Features:**
- ✅ Role-based authentication (owner, backend, frontend, designer, etc.)
- ✅ User dashboard with role-specific UI
- ✅ AI tools catalog with categories and tags
- ✅ Comprehensive validation system (75+ validation rules)
- ✅ Tools submission and management
- ✅ Search and filtering capabilities
- ✅ Views tracking and favorites system

**Database Tables:**
- `users` - User accounts with roles
- `categories` - Tool categories with icons/colors
- `tools` - AI tools catalog (19 fields)
- `tags` - Tags for categorization
- `tool_tag` - Many-to-many relationship
- `personal_access_tokens` - Sanctum authentication

**Key Files:**
- `backend/VALIDATION_RULES.md` - Complete validation documentation
- `backend/TESTING.md` - **Comprehensive testing documentation** ⭐ NEW
- `backend/app/Http/Requests/` - Form validation classes
- `backend/app/Models/` - Eloquent models with relationships
- `backend/database/factories/` - Test data factories
- `backend/tests/Feature/` - API and integration tests
- `backend/tests/Unit/` - Model and unit tests
- `frontend/src/contexts/AuthContext.tsx` - Authentication context
- `frontend/src/app/dashboard/` - Role-based dashboard

## Essential Commands

### Starting/Stopping Environment
```bash
./start.sh              # Start all services (includes auto-setup)
./stop.sh               # Stop all services
docker compose ps       # Check service status
docker compose logs -f  # View all logs
```

### Frontend Development (Next.js)
```bash
# Access container
docker compose exec frontend sh

# Package management
docker compose exec frontend npm install <package>
docker compose exec frontend npm run dev     # Already running by default
docker compose exec frontend npm run build
docker compose exec frontend npm run lint

# View logs
docker compose logs frontend -f
```

Frontend source: `frontend/src/app/` (Next.js App Router)

### Backend Development (Laravel)
```bash
# Access PHP container
docker compose exec php_fpm sh

# Laravel Artisan commands
docker compose exec php_fpm php artisan migrate
docker compose exec php_fpm php artisan make:controller <Name>Controller
docker compose exec php_fpm php artisan make:model <Name> -m
docker compose exec php_fpm php artisan make:migration <name>
docker compose exec php_fpm php artisan db:seed
docker compose exec php_fpm php artisan route:list
docker compose exec php_fpm php artisan config:clear
docker compose exec php_fpm php artisan cache:clear

# Composer
docker compose exec php_fpm composer install
docker compose exec php_fpm composer require <package>
docker compose exec php_fpm composer update

# Testing (See backend/TESTING.md for complete documentation)
docker compose exec php_fpm php artisan test                          # Run all tests
docker compose exec php_fpm php artisan test --filter=ToolApiTest     # Run specific test
docker compose exec php_fpm php artisan test --coverage               # With coverage
docker compose exec php_fpm php artisan test --parallel               # Parallel execution
docker compose exec php_fpm vendor/bin/phpunit                        # Direct PHPUnit

# View logs
docker compose logs backend -f    # Nginx logs
docker compose logs php_fpm -f    # PHP logs
```

Laravel app structure: `backend/app/` (standard Laravel layout)

### Database Operations
```bash
./db-manage.sh connect   # Connect to MySQL CLI
./db-manage.sh backup    # Create database backup
./db-manage.sh redis     # Connect to Redis CLI

# Direct MySQL access
docker compose exec mysql mysql -u root -pvibecode-full-stack-starter-kit_mysql_pass vibecode-full-stack-starter-kit_app

# Run migrations
docker compose exec php_fpm php artisan migrate
```

### Laravel Initialization
```bash
./laravel-setup.sh      # Full Laravel setup (composer, migrations, cache, permissions)
```

## Database Configuration

**MySQL:**
- Internal host: `mysql`
- External host: `localhost:8203`
- Database: `vibecode-full-stack-starter-kit_app`
- Username: `root`
- Password: `vibecode-full-stack-starter-kit_mysql_pass`

**Redis:**
- Internal host: `redis`
- External host: `localhost:8204`
- Password: `vibecode-full-stack-starter-kit_redis_pass`

## Architecture Notes

### Docker Service Dependencies
- `frontend` depends on `backend`
- `backend` depends on `php_fpm`, `mysql`, `redis`
- All services are on the `vibecode-full-stack-starter-kit_network` bridge network

### Volume Mounts
- Frontend: `./frontend:/app` (cached) with excluded `/app/node_modules` and `/app/.next`
- Backend: `./backend:/var/www/html` (cached)
- Persistent volumes for MySQL and Redis data

### Environment Configuration
- Frontend env: `NEXT_PUBLIC_API_URL=http://localhost:8201/api`
- Backend env: Configured via docker-compose.yml and `backend/.env`
- Database/Redis connections are pre-configured in docker-compose.yml

### PHP-FPM Setup
- Custom PHP image built from `docker/Dockerfile.php`
- Includes supervisor for process management
- Laravel-specific user (`laravel`) for proper file permissions
- Health checks enabled

## Common Issues

**Port Conflicts:** Check if ports 8200-8205 are available before starting
**Permission Issues:** Run `./laravel-setup.sh` to fix Laravel storage/cache permissions
**Services Not Starting:** Check Docker is running with `docker ps`, view logs with `docker compose logs`

## Testing

Backend tests are configured with PHPUnit in `backend/phpunit.xml`:
- Unit tests: `backend/tests/Unit/`
- Feature tests: `backend/tests/Feature/`
- Run with: `docker compose exec php_fpm php artisan test`

---

## Development Protocols

### Protocol 1: Initial Project Setup (First Time)

**Prerequisites:**
- Docker and Docker Compose installed
- Ports 8200-8205 available

**Steps:**
1. **Verify Docker is running**
   ```bash
   docker ps
   # Should show running containers or at least not error
   ```

2. **Clone repository and navigate to project**
   ```bash
   cd /path/to/full-stack-starter-kit-https
   ```

3. **Check environment file exists**
   ```bash
   ls -la .env
   # If missing, copy from .env.example
   ```

4. **Start the environment**
   ```bash
   ./start.sh
   ```
   This script will:
   - Build the PHP Laravel image
   - Start all Docker services
   - Wait 15 seconds for services to initialize
   - Auto-generate Laravel APP_KEY if needed
   - Install Composer dependencies (if vendor/ missing)
   - Run database migrations
   - Cache Laravel configurations
   - Set proper permissions

5. **Verify all services are running**
   ```bash
   docker compose ps
   # All services should show "Up" status
   ```

6. **Test the applications**
   - Frontend: http://localhost:8200
   - Backend: http://localhost:8201
   - API Status: http://localhost:8201/api/status

7. **If Laravel needs additional setup**
   ```bash
   ./laravel-setup.sh
   ```
   Use this if you need to:
   - Reinstall Composer dependencies
   - Regenerate application key
   - Re-run migrations
   - Seed the database
   - Clear/rebuild caches

### Protocol 2: Daily Development Workflow

**Starting Your Day:**

1. **Start all services**
   ```bash
   ./start.sh
   ```

2. **Check service health**
   ```bash
   docker compose ps
   docker compose logs -f
   # Press Ctrl+C to exit logs
   ```

3. **Pull latest code changes** (if working in a team)
   ```bash
   git pull origin main
   ```

4. **Update dependencies if needed**

   Frontend:
   ```bash
   docker compose exec frontend npm install
   ```

   Backend:
   ```bash
   docker compose exec php_fpm composer install
   ```

5. **Run any new migrations**
   ```bash
   docker compose exec php_fpm php artisan migrate
   ```

**Ending Your Day:**

```bash
./stop.sh
# OR for complete cleanup:
docker compose down -v  # Warning: This removes volumes/data
```

### Protocol 3: Adding a New API Endpoint (Laravel)

1. **Create a new controller**
   ```bash
   docker compose exec php_fpm php artisan make:controller Api/ProductController --api
   ```
   File created: `backend/app/Http/Controllers/Api/ProductController.php`

2. **Create a model with migration**
   ```bash
   docker compose exec php_fpm php artisan make:model Product -m
   ```
   Files created:
   - Model: `backend/app/Models/Product.php`
   - Migration: `backend/database/migrations/YYYY_MM_DD_HHMMSS_create_products_table.php`

3. **Edit the migration file**
   - Open the migration file in `backend/database/migrations/`
   - Define your table schema in the `up()` method

4. **Run the migration**
   ```bash
   docker compose exec php_fpm php artisan migrate
   ```

5. **Define routes**
   - Edit `backend/routes/web.php` or create `backend/routes/api.php`
   - Add your route definitions

6. **Implement controller methods**
   - Edit the controller file
   - Add your business logic

7. **Test the endpoint**
   ```bash
   curl http://localhost:8201/api/your-endpoint
   # OR use Postman, Thunder Client, etc.
   ```

8. **Write tests**
   ```bash
   docker compose exec php_fpm php artisan make:test ProductTest
   ```
   Edit `backend/tests/Feature/ProductTest.php`

9. **Run tests**
   ```bash
   docker compose exec php_fpm php artisan test
   ```

### Protocol 4: Adding a New Frontend Page (Next.js)

1. **Create new page/route**
   ```bash
   # For route /products
   mkdir -p frontend/src/app/products
   touch frontend/src/app/products/page.tsx
   ```

2. **Create the page component**
   Edit `frontend/src/app/products/page.tsx`:
   ```typescript
   export default function ProductsPage() {
     return <div>Products Page</div>
   }
   ```

3. **Add API integration** (if needed)
   - Create a service/API file or add fetch calls in the component
   - Use `NEXT_PUBLIC_API_URL` environment variable

4. **Create components** (if needed)
   ```bash
   mkdir -p frontend/src/components
   touch frontend/src/components/ProductCard.tsx
   ```

5. **Test in browser**
   - Navigate to http://localhost:8200/products
   - Check browser console for errors

6. **Check build**
   ```bash
   docker compose exec frontend npm run build
   ```

### Protocol 5: Database Operations

**Running Migrations:**
```bash
# Run all pending migrations
docker compose exec php_fpm php artisan migrate

# Rollback last migration
docker compose exec php_fpm php artisan migrate:rollback

# Rollback all migrations and re-run
docker compose exec php_fpm php artisan migrate:fresh

# Fresh migration with seeding
docker compose exec php_fpm php artisan migrate:fresh --seed
```

**Creating Seeders:**
```bash
# Create seeder
docker compose exec php_fpm php artisan make:seeder ProductSeeder

# Run specific seeder
docker compose exec php_fpm php artisan db:seed --class=ProductSeeder

# Run all seeders
docker compose exec php_fpm php artisan db:seed
```

**Database Backups:**
```bash
# Create backup using utility script
./db-manage.sh backup

# Manual backup
docker compose exec mysql mysqldump -u root -pvibecode-full-stack-starter-kit_mysql_pass vibecode-full-stack-starter-kit_app > backup.sql

# Restore from backup
docker compose exec -T mysql mysql -u root -pvibecode-full-stack-starter-kit_mysql_pass vibecode-full-stack-starter-kit_app < backup.sql
```

**Database Inspection:**
```bash
# Connect to MySQL CLI
./db-manage.sh connect
# Password: vibecode-full-stack-starter-kit_mysql_pass

# OR direct connection
docker compose exec mysql mysql -u root -pvibecode-full-stack-starter-kit_mysql_pass vibecode-full-stack-starter-kit_app

# Once in MySQL:
SHOW TABLES;
DESCRIBE products;
SELECT * FROM users LIMIT 10;
```

**Redis Operations:**
```bash
# Connect to Redis CLI
./db-manage.sh redis

# Once in Redis:
KEYS *
GET key_name
FLUSHALL  # Clear all cache (careful!)
```

### Protocol 6: Adding Dependencies

**Frontend (NPM):**
```bash
# Install package
docker compose exec frontend npm install package-name

# Install dev dependency
docker compose exec frontend npm install -D package-name

# Remove package
docker compose exec frontend npm uninstall package-name

# Update packages
docker compose exec frontend npm update
```

**Backend (Composer):**
```bash
# Install package
docker compose exec php_fpm composer require vendor/package

# Install dev dependency
docker compose exec php_fpm composer require --dev vendor/package

# Remove package
docker compose exec php_fpm composer remove vendor/package

# Update packages
docker compose exec php_fpm composer update
```

### Protocol 7: Debugging and Troubleshooting

**View Logs:**
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs frontend -f
docker compose logs backend -f
docker compose logs php_fpm -f
docker compose logs mysql -f

# Last 100 lines
docker compose logs --tail=100 php_fpm
```

**Access Container Shell:**
```bash
# Frontend (Node/Alpine)
docker compose exec frontend sh

# Backend PHP-FPM
docker compose exec php_fpm sh

# MySQL
docker compose exec mysql bash

# Tools container
docker compose exec tools sh
```

**Check Service Status:**
```bash
# List running containers
docker compose ps

# Detailed service info
docker compose ps --all

# Resource usage
docker stats
```

**Restart Services:**
```bash
# Restart specific service
docker compose restart frontend
docker compose restart php_fpm
docker compose restart mysql

# Restart all services
docker compose restart
```

**Clear Caches:**
```bash
# Laravel caches
docker compose exec php_fpm php artisan config:clear
docker compose exec php_fpm php artisan route:clear
docker compose exec php_fpm php artisan view:clear
docker compose exec php_fpm php artisan cache:clear

# Rebuild caches
docker compose exec php_fpm php artisan config:cache
docker compose exec php_fpm php artisan route:cache
docker compose exec php_fpm php artisan view:cache
```

**Fix Permission Issues:**
```bash
./laravel-setup.sh
# OR manually:
docker compose exec php_fpm chown -R laravel:laravel /var/www/html/storage
docker compose exec php_fpm chown -R laravel:laravel /var/www/html/bootstrap/cache
```

**Rebuild Containers:**
```bash
# Rebuild specific service
docker compose build php_fpm

# Rebuild all services
docker compose build

# Rebuild and restart
docker compose up -d --build

# Force rebuild (no cache)
docker compose build --no-cache
```

**Complete Environment Reset:**
```bash
# Stop and remove containers, networks
docker compose down

# Stop and remove containers, networks, volumes (WARNING: Deletes data!)
docker compose down -v

# Remove all images too
docker compose down -v --rmi all

# Start fresh
./start.sh
```

### Protocol 8: Testing Workflow

**Backend Testing (PHPUnit):**
```bash
# Run all tests
docker compose exec php_fpm php artisan test

# Run specific test file
docker compose exec php_fpm php artisan test tests/Feature/ProductTest.php

# Run specific test method
docker compose exec php_fpm php artisan test --filter testCanCreateProduct

# Run with coverage (if configured)
docker compose exec php_fpm php artisan test --coverage

# Run PHPUnit directly
docker compose exec php_fpm vendor/bin/phpunit

# Via Composer script
docker compose exec php_fpm composer test
```

**Create New Tests:**
```bash
# Feature test
docker compose exec php_fpm php artisan make:test ProductTest

# Unit test
docker compose exec php_fpm php artisan make:test ProductTest --unit
```

**Frontend Testing:**
```bash
# If you add Jest or other testing framework
docker compose exec frontend npm test
docker compose exec frontend npm run test:watch
```

### Protocol 9: Git Workflow Integration

**Before Committing:**
```bash
# Run linters
docker compose exec frontend npm run lint
docker compose exec php_fpm composer run-script lint  # if configured

# Run tests
docker compose exec php_fpm php artisan test
docker compose exec frontend npm test  # if configured

# Check formatting (if configured)
docker compose exec php_fpm ./vendor/bin/pint  # Laravel Pint
```

**Branch Workflow:**
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes, then test
docker compose exec php_fpm php artisan test

# Commit and push
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
```

### Protocol 10: Production Build Testing

**Test Frontend Production Build:**
```bash
# Build production bundle
docker compose exec frontend npm run build

# Check for build errors
docker compose exec frontend npm run build 2>&1 | grep -i error

# Test production server (if configured)
docker compose exec frontend npm run start
```

**Test Backend Production Readiness:**
```bash
# Clear all caches
docker compose exec php_fpm php artisan config:clear
docker compose exec php_fpm php artisan route:clear
docker compose exec php_fpm php artisan view:clear

# Optimize for production
docker compose exec php_fpm php artisan config:cache
docker compose exec php_fpm php artisan route:cache
docker compose exec php_fpm php artisan view:cache
docker compose exec php_fpm composer install --optimize-autoloader --no-dev

# Run tests
docker compose exec php_fpm php artisan test
```

### Protocol 11: Environment Variables Management

**Backend (.env):**
- Location: `backend/.env`
- Auto-generated on first `./start.sh` run
- Key values are also set in `docker-compose.yml` for PHP container

**Frontend:**
- Environment variables prefixed with `NEXT_PUBLIC_` are exposed to browser
- Set in `docker-compose.yml` under `frontend` service
- Default: `NEXT_PUBLIC_API_URL=http://localhost:8201/api`

**Updating Environment Variables:**
```bash
# After editing .env or docker-compose.yml
docker compose down
docker compose up -d

# Clear Laravel config cache
docker compose exec php_fpm php artisan config:clear
docker compose exec php_fpm php artisan config:cache
```

### Protocol 12: Multi-Container Debugging

**Debug Frontend → Backend Communication:**
```bash
# Terminal 1: Watch backend logs
docker compose logs backend -f

# Terminal 2: Watch PHP logs
docker compose logs php_fpm -f

# Terminal 3: Watch frontend logs
docker compose logs frontend -f

# Terminal 4: Test API endpoint
curl http://localhost:8201/api/status
```

**Network Debugging:**
```bash
# Check network exists
docker network ls | grep vibecode-full-stack-starter-kit

# Inspect network
docker network inspect vibecode-full-stack-starter-kit_network

# Test connectivity between containers
docker compose exec frontend ping mysql
docker compose exec frontend wget -O- http://backend
```

**Database Connection Testing:**
```bash
# From PHP container
docker compose exec php_fpm php artisan tinker
>>> DB::connection()->getPdo();

# Check MySQL is accessible
docker compose exec php_fpm php -r "echo (new PDO('mysql:host=mysql;dbname=vibecode-full-stack-starter-kit_app', 'root', 'vibecode-full-stack-starter-kit_mysql_pass'))->getAttribute(PDO::ATTR_CONNECTION_STATUS);"
```

---

## Container Healthchecks

### Overview

Docker healthchecks monitor container health by periodically running test commands inside the container. Containers are marked as **healthy** or **unhealthy** based on command exit codes.

### Current Healthcheck Configuration

Only the `php_fpm` container has a healthcheck configured in `docker-compose.yml`:

```yaml
healthcheck:
  test: ["CMD-SHELL", "php -v || exit 1"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 30s
```

### Healthcheck Parameters

- **`test`**: Command to run for health verification
  - `["CMD-SHELL", "php -v || exit 1"]` - Checks if PHP binary is functional
  - Exit code 0 = healthy, exit code 1 = unhealthy

- **`interval: 30s`**: Run healthcheck every 30 seconds
  - Continuous monitoring throughout container lifetime

- **`timeout: 10s`**: Maximum execution time for healthcheck command
  - Commands exceeding this are marked as failed

- **`retries: 3`**: Consecutive failures before marking unhealthy
  - Prevents false positives from temporary glitches

- **`start_period: 30s`**: Grace period during container startup
  - Healthcheck failures don't count toward retries during this time
  - Allows PHP-FPM to fully initialize

### Health States

- **`starting`**: Container initializing, within start_period
- **`healthy`**: Healthcheck passing consistently
- **`unhealthy`**: Failed retries times consecutively

### Checking Container Health

```bash
# Quick status overview
docker compose ps
# Output shows: "Up About an hour (healthy)"

# Detailed health information
docker inspect vibecode-full-stack-starter-kit_php_fpm --format='{{json .State.Health}}'

# Pretty-print health details
docker inspect vibecode-full-stack-starter-kit_php_fpm --format='{{json .State.Health}}' | python -m json.tool

# View recent healthcheck logs
docker inspect --format='{{json .State.Health.Log}}' vibecode-full-stack-starter-kit_php_fpm

# Check health status only
docker inspect --format='{{.State.Health.Status}}' vibecode-full-stack-starter-kit_php_fpm
```

### Health Status Output

The health status includes:
- **Status**: Current state (healthy/unhealthy/starting)
- **FailingStreak**: Number of consecutive failures
- **Log**: Last 5 healthcheck results with:
  - Start/End timestamps
  - Exit codes
  - Command output

Example output:
```json
{
    "Status": "healthy",
    "FailingStreak": 0,
    "Log": [
        {
            "Start": "2025-10-07T12:37:00.211720152Z",
            "End": "2025-10-07T12:37:00.371734473Z",
            "ExitCode": 0,
            "Output": "PHP 8.2.29 (cli) ..."
        }
    ]
}
```

### Why Only PHP-FPM Has Healthcheck

- **php_fpm**: Critical application service requiring monitoring
- **mysql/redis**: Have built-in health mechanisms
- **nginx**: Simple proxy, depends on PHP-FPM health
- **frontend**: Node dev server is self-recovering

### Production Healthcheck Recommendations

For production environments, use more comprehensive healthchecks:

**Better PHP-FPM healthcheck:**
```yaml
healthcheck:
  test: ["CMD-SHELL", "curl -f http://localhost/api/status || exit 1"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

**MySQL healthcheck:**
```yaml
healthcheck:
  test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p$$MYSQL_ROOT_PASSWORD"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 30s
```

**Redis healthcheck:**
```yaml
healthcheck:
  test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
  interval: 30s
  timeout: 10s
  retries: 3
```

**Frontend healthcheck:**
```yaml
healthcheck:
  test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 60s
```

### Benefits of Healthchecks

1. **Automatic Monitoring**: Docker knows if services are truly functional
2. **Service Dependencies**: Other services can wait for healthy status
3. **Load Balancing**: Route traffic away from unhealthy containers
4. **Alerting**: Trigger notifications when containers become unhealthy
5. **Auto-Recovery**: Configure restart policies based on health status
6. **Orchestration**: Tools like Kubernetes use health status for deployment decisions

---

## Database Schema & Validation

### Overview

The platform includes a comprehensive database schema for managing AI tools, categories, tags, and user submissions with full validation rules.

### Database Tables

**Core Tables:**
```
users (existing + auth)
├── id, name, email, password, role
├── created_at, updated_at
└── Relationships: hasMany tools

categories
├── id, name, slug, description
├── icon (emoji), color (hex), order, is_active
├── created_at, updated_at
└── Relationships: hasMany tools

tools
├── id, user_id, category_id
├── title, slug, description
├── url, github_url, documentation_url, thumbnail_url
├── tool_type (enum), pricing_model (enum), status (enum)
├── views_count, favorites_count, is_featured
├── published_at, created_at, updated_at
└── Relationships: belongsTo user, category; belongsToMany tags

tags
├── id, name, slug, usage_count
├── created_at, updated_at
└── Relationships: belongsToMany tools

tool_tag (pivot)
├── id, tool_id, tag_id
├── created_at, updated_at
└── Unique constraint: [tool_id, tag_id]
```

### Database Relationships

```
User (1) ──→ (∞) Tools
Category (1) ──→ (∞) Tools
Tools (∞) ←──→ (∞) Tags (via tool_tag pivot)
```

### Enumerations

**Tool Types:**
- `library` - Code library/package
- `framework` - Development framework
- `api` - API service
- `service` - Web service/SaaS
- `application` - Standalone application

**Pricing Models:**
- `free` - Completely free
- `freemium` - Free with paid features
- `paid` - Paid only
- `open_source` - Open source project

**Tool Status:**
- `draft` - Not yet published
- `published` - Live and visible
- `archived` - No longer active

### Models & Eloquent Relationships

**Location:** `backend/app/Models/`

**Category Model:**
```php
// Relationships
public function tools(): HasMany
public function publishedTools(): HasMany

// Scopes
scopeActive($query)
scopeOrdered($query)
```

**Tool Model:**
```php
// Relationships
public function user(): BelongsTo
public function category(): BelongsTo
public function tags(): BelongsToMany

// Scopes
scopePublished($query)
scopeFeatured($query)
scopeByCategory($query, $categoryId)
scopeByType($query, $type)
scopeSearch($query, $search)

// Methods
incrementViews()
isPublished(): bool
```

**Tag Model:**
```php
// Relationships
public function tools(): BelongsToMany

// Methods
incrementUsage()
decrementUsage()

// Scopes
scopePopular($query, $limit = 10)
```

**User Model (additions):**
```php
// New relationships
public function tools(): HasMany
public function publishedTools(): HasMany
```

### Validation Rules

**Location:** `backend/app/Http/Requests/`

#### StoreToolRequest (Creating Tools)

**Authorization:** All authenticated users can submit tools.

**Validation Rules:**
```php
'title' => 'required|string|min:3|max:255|unique:tools'
'description' => 'required|string|min:20|max:2000'
'category_id' => 'required|integer|exists:categories,id (active only)'
'url' => 'nullable|url|max:500|active_url'
'github_url' => 'nullable|url|max:500|regex:/^https?:\/\/(www\.)?github\.com\/.*$/'
'documentation_url' => 'nullable|url|max:500'
'thumbnail_url' => 'nullable|url|max:500'
'tool_type' => 'required|in:library,framework,api,service,application'
'pricing_model' => 'required|in:free,freemium,paid,open_source'
'status' => 'sometimes|in:draft,published'
'tags' => 'required|array|min:1|max:10'
'tags.*' => 'integer|exists:tags,id'
```

**Auto-Generated:**
- `slug` - Generated from title via Str::slug()
- `user_id` - Set to auth()->id()
- `published_at` - Set if status is 'published'

**Key Features:**
- Title must be unique across all tools
- Description requires 20-2000 characters
- URLs are validated for format and reachability
- GitHub URLs must match GitHub.com domain
- 1-10 tags required per tool
- Custom user-friendly error messages

#### UpdateToolRequest (Updating Tools)

**Authorization:** Users can update their own tools OR owners can update any tool.

**Validation Rules:**
```php
'title' => 'sometimes|string|min:3|max:255|unique:tools (ignore current)'
'description' => 'sometimes|string|min:20|max:2000'
'category_id' => 'sometimes|integer|exists:categories,id (active only)'
// ... same URL validations as create
'status' => 'sometimes|in:draft,published,archived'
'is_featured' => 'sometimes|boolean|prohibited (non-owners)'
```

**Key Features:**
- All fields optional (partial updates)
- Unique validation ignores current record
- Only owners can set `is_featured` flag
- Authorization checks ownership or owner role
- Slug regenerated if title changes
- `published_at` set when transitioning to published

#### StoreCategoryRequest (Creating Categories)

**Authorization:** Only users with 'owner' role can create categories.

**Validation Rules:**
```php
'name' => 'required|string|min:2|max:100|unique:categories'
'description' => 'nullable|string|max:500'
'icon' => 'nullable|string|max:10|regex:/^[\x{1F300}-\x{1F9FF}]$/u'
'color' => 'nullable|string|regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'
'order' => 'nullable|integer|min:0'
'is_active' => 'sometimes|boolean'
```

**Auto-Generated:**
- `slug` - Generated from name
- `color` - Defaults to '#3B82F6' (blue)

**Key Features:**
- Emoji icon validation (Unicode range)
- Hex color validation (#RRGGBB or #RGB)
- Category ordering support
- Active/inactive status

### Validation Error Messages

Custom error messages provide clear user guidance:

```php
'title.required' => 'Please provide a title for the tool.'
'title.unique' => 'A tool with this title already exists.'
'description.min' => 'The description must be at least 20 characters.'
'url.active_url' => 'The URL must be a valid, reachable website.'
'github_url.regex' => 'Please provide a valid GitHub repository URL.'
'tags.min' => 'Please add at least one tag.'
'tags.max' => 'You can add a maximum of 10 tags.'
```

### Database Indexes

**Performance Optimization:**
```sql
-- tools table
INDEX (status, published_at)
INDEX (category_id, status)
INDEX (user_id)

-- tags table
INDEX (usage_count)

-- tool_tag table
UNIQUE (tool_id, tag_id)
```

### Running Migrations

```bash
# Run all migrations
docker compose exec php_fpm php artisan migrate

# Check migration status
docker compose exec php_fpm php artisan migrate:status

# Rollback last batch
docker compose exec php_fpm php artisan migrate:rollback

# Fresh migration (drops all tables)
docker compose exec php_fpm php artisan migrate:fresh

# Fresh with seeding
docker compose exec php_fpm php artisan migrate:fresh --seed
```

### Checking Database Structure

```bash
# List all tables
docker compose exec mysql mysql -u root -p[password] [database] -e "SHOW TABLES;"

# Describe table structure
docker compose exec mysql mysql -u root -p[password] [database] -e "DESCRIBE tools;"

# View table indexes
docker compose exec mysql mysql -u root -p[password] [database] -e "SHOW INDEX FROM tools;"
```

### Validation Documentation

Complete validation rules documentation is available in:
```
backend/VALIDATION_RULES.md
```

This includes:
- Comprehensive validation rules reference
- Authorization logic explanation
- Custom error messages catalog
- Validation patterns (regex)
- Best practices guide
- Testing examples
- Real-world usage examples

### Common Validation Patterns

**URL Validation:**
```php
'url:http,https'  // Allow only HTTP/HTTPS
'active_url'      // Check URL is reachable
'max:500'         // Max length
```

**Enum Validation:**
```php
Rule::in(['draft', 'published', 'archived'])
```

**Unique with Ignore:**
```php
Rule::unique('tools', 'title')->ignore($toolId)
```

**Exists with Conditions:**
```php
Rule::exists('categories', 'id')->where('is_active', true)
```

**Conditional Rules:**
```php
Rule::when(auth()->user()->role !== 'owner', ['prohibited'])
```

**Array Validation:**
```php
'tags' => 'required|array|min:1|max:10'
'tags.*' => 'integer|exists:tags,id'
```

### Model Scopes Usage

**Query Examples:**
```php
// Get published tools
Tool::published()->get()

// Get featured tools in a category
Tool::featured()->byCategory(1)->get()

// Search tools
Tool::search('chatgpt')->published()->get()

// Get popular tags
Tag::popular(10)->get()

// Get active categories with order
Category::active()->ordered()->get()
```

### Security Features

1. **Authorization:** Role-based access control in Form Requests
2. **Ownership Validation:** Users can only edit their own tools
3. **Active URL Check:** Prevents dead links
4. **Input Sanitization:** Through validation rules
5. **SQL Injection Prevention:** Using Eloquent ORM
6. **Mass Assignment Protection:** $fillable arrays in models
7. **CSRF Protection:** Laravel default
8. **Rate Limiting:** Ready via middleware
