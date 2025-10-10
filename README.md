Full-Stack Development Environment

Generated on: Thu Sep  4 01:37:12 PM EEST 2025
Location: /home/softart/scripts/vibecode-full-stack-starter-kit

## 🚀 Tech Stack

- **Frontend**: Next.js + React + TypeScript (Port 8200)
- **Backend**: Laravel + PHP 8.2 + Nginx (Port 8201)  
- **Database**: MySQL 8.0 (Port 8203)
- **Cache**: Redis 7 (Port 8204)
- **Development Tools**: Alpine container (Port 8205)
- **MCP Server**: AI Tools Platform (Port 5055)

1## 🚀 Installation & Setup

### Prerequisites

Before you begin, ensure you have the following installed on your system:

**Required Software:**
- **Docker Desktop** (version 20.10 or higher)
  - [Download for Windows](https://docs.docker.com/desktop/install/windows-install/)
  - [Download for Mac](https://docs.docker.com/desktop/install/mac-install/)
  - [Download for Linux](https://docs.docker.com/desktop/install/linux-install/)
- **Git** (for cloning the repository)
  - [Download Git](https://git-scm.com/downloads)

**System Requirements:**
- **RAM**: Minimum 8GB (16GB recommended)
- **Disk Space**: Minimum 10GB free space
- **Ports Available**: 8200-8205 must not be in use

**Verify Installation:**

```bash
# Check Docker version
docker --version
# Expected: Docker version 20.10.x or higher

# Check Docker Compose version
docker compose version
# Expected: Docker Compose version v2.x.x or higher

# Verify Docker is running
docker ps
# Should show running containers or empty list (no errors)

# Check Git version
git --version
# Expected: git version 2.x.x or higher
```

### Installation Steps

#### Step 1: Clone the Repository

```bash
# Clone the repository
git clone <your-repository-url>

# Navigate to project directory
cd full-stack-starter-kit-https
```

#### Step 2: Verify Project Structure

Ensure your project has the following structure:

```
full-stack-starter-kit-https/
├── backend/              # Laravel backend
├── frontend/             # Next.js frontend
├── docker/               # Docker configurations
├── nginx/                # Nginx config
├── mysql/                # MySQL initialization
├── start.sh              # Start script
├── stop.sh               # Stop script
├── laravel-setup.sh      # Laravel setup script
├── db-manage.sh          # Database management
├── docker-compose.yml    # Docker orchestration
└── README.md             # This file
```

#### Step 3: Configure Environment Variables

The environment variables are pre-configured in `docker-compose.yml` and `backend/.env`. No manual configuration is needed for development.

**Optional: Customize Settings**

If you need to customize any settings, edit `backend/.env`:

```env
# Application
APP_NAME="AI Tools Platform"
APP_ENV=local
APP_DEBUG=true

# Database (pre-configured for Docker)
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=vibecode-full-stack-starter-kit_app
DB_USERNAME=root
DB_PASSWORD=vibecode-full-stack-starter-kit_mysql_pass

# Redis (pre-configured for Docker)
REDIS_HOST=redis
REDIS_PASSWORD=vibecode-full-stack-starter-kit_redis_pass

# Mail (development mode - logs to file)
MAIL_MAILER=log
```

#### Step 4: Start the Application

```bash
# Make scripts executable (Linux/Mac)
chmod +x start.sh stop.sh laravel-setup.sh db-manage.sh

# Start all services
./start.sh
```

**What `start.sh` does automatically:**
1. ✅ Builds PHP/Laravel Docker image
2. ✅ Starts all Docker containers (frontend, backend, database, redis)
3. ✅ Waits 15 seconds for services to initialize
4. ✅ Generates Laravel application key (if missing)
5. ✅ Installs Composer dependencies (if vendor/ missing)
6. ✅ Runs database migrations
7. ✅ Caches Laravel configurations
8. ✅ Sets proper file permissions

**Expected Output:**

```
Building PHP Laravel image...
[+] Building 45.2s (12/12) FINISHED
Starting services...
[+] Running 6/6
 ✔ Container vibecode-full-stack-starter-kit_mysql     Started
 ✔ Container vibecode-full-stack-starter-kit_redis     Started
 ✔ Container vibecode-full-stack-starter-kit_tools     Started
 ✔ Container vibecode-full-stack-starter-kit_php_fpm   Started
 ✔ Container vibecode-full-stack-starter-kit_backend   Started
 ✔ Container vibecode-full-stack-starter-kit_frontend  Started

Waiting 15 seconds for services to start...
Running Laravel setup...
✔ Application key generated
✔ Composer dependencies installed
✔ Migrations completed
✔ Configurations cached
✔ Permissions set

🎉 Environment is ready!
```

#### Step 5: Verify Installation

**Check Running Services:**

```bash
docker compose ps
```

**Expected Output:**
```
NAME                                       STATUS
vibecode-full-stack-starter-kit_backend    Up (healthy)
vibecode-full-stack-starter-kit_frontend   Up
vibecode-full-stack-starter-kit_mysql      Up (healthy)
vibecode-full-stack-starter-kit_php_fpm    Up (healthy)
vibecode-full-stack-starter-kit_redis      Up
vibecode-full-stack-starter-kit_tools      Up
```

**Access the Applications:**

1. **Frontend (Next.js)**: http://localhost:8200
   - Should show the AI Tools Platform landing page

2. **Backend API**: http://localhost:8201/api/status
   - Should return: `{"status":"ok","message":"API is running"}`

3. **Login Page**: http://localhost:8200/login
   - Should show the login form

#### Step 6: Seed Initial Data

To populate the database with sample categories, tags, and users:

```bash
# Seed the database
docker compose exec php_fpm php artisan db:seed

# Or run fresh migrations with seeding
docker compose exec php_fpm php artisan migrate:fresh --seed
```

**This will create:**
- ✅ Sample categories (AI/ML, Development, Design, etc.)
- ✅ Sample tags (chatbot, code-generation, automation, etc.)
- ✅ Test users with different roles

#### Step 7: Create Your First Admin User

```bash
# Access Laravel Tinker
docker compose exec php_fpm php artisan tinker
```

Then run:

```php
// Create owner/admin user
User::create([
    'name' => 'Admin User',
    'email' => 'admin@example.com',
    'password' => Hash::make('password'),
    'role' => 'owner'
]);

// Create a frontend developer user
User::create([
    'name' => 'Elena Frontend',
    'email' => 'elena@frontend.local',
    'password' => Hash::make('password'),
    'role' => 'frontend'
]);

// Exit Tinker
exit;
```

#### Step 8: Login and Explore

1. Navigate to http://localhost:8200/login
2. Enter credentials:
   - Email: `admin@example.com`
   - Password: `password`
3. Check Laravel logs for 2FA code:
   ```bash
   docker compose exec php_fpm tail -f storage/logs/laravel.log
   ```
4. Enter the 6-digit code on the verification page
5. You'll be redirected to the dashboard!

### Stopping the Application

```bash
# Stop all services (containers remain)
./stop.sh

# Or stop and remove containers
docker compose down

# Stop and remove containers + volumes (⚠️ deletes all data)
docker compose down -v
```

### Restarting After Initial Setup

On subsequent starts, simply run:

```bash
./start.sh
```

The setup script will skip steps that are already completed.

## 📋 Quick Start (For Returning Users)

1. **Start the environment:**
   ```bash
   ./start.sh
   ```

2. **Access your applications:**
   - Frontend: http://localhost:8200
   - Backend: http://localhost:8201
   - API Status: http://localhost:8201/api/status

3. **Stop the environment:**
   ```bash
   ./stop.sh
   ```

## 🔧 Management Scripts

- `./start.sh` - Start all services with auto-setup
- `./stop.sh` - Stop all services
- `./laravel-setup.sh` - Full Laravel initialization
- `./db-manage.sh` - Database management utilities

## 📁 Project Structure

```
vibecode-full-stack-starter-kit/
├── frontend/             # Next.js application
│   ├── src/             # Source code
│   ├── public/          # Static assets
│   ├── package.json     # Frontend dependencies
│   └── next.config.js   # Next.js configuration
├── backend/             # Laravel application
│   ├── app/             # Application code
│   ├── public/          # Web root
│   ├── routes/          # API routes
│   ├── database/        # Migrations, seeders
│   ├── .env            # Laravel configuration
│   └── composer.json    # Backend dependencies
├── nginx/              # Nginx configuration
├── docker/             # Docker configurations
├── mysql/init/         # Database initialization
├── tools/              # Development utilities
├── .mcp.json          # MCP server configuration
├── .claude/agents/    # AI agents configuration
├── docker-compose.yml  # Container orchestration
└── README.md          # This documentation
```

## 🐳 Docker Services

All services are isolated with unique names: `vibecode-full-stack-starter-kit_*`

- **frontend** - Next.js development server
- **backend** - Nginx reverse proxy
- **php_fpm** - PHP-FPM for Laravel
- **mysql** - MySQL 8.0 database
- **redis** - Redis cache server
- **tools** - Development utilities container

## 🧩 MCP Server - AI Tools Platform

The project includes a Model Context Protocol (MCP) server that provides AI tools catalog functionality and integrates with Claude Desktop.

### MCP Server Configuration

**Server Details:**
- **Name**: ai-tools
- **Version**: 1.0.0
- **Port**: 5055
- **Transport**: STDIO (compatible with Claude Desktop / MCP CLI)
- **Configuration File**: `.mcp.json`

### Available MCP Tools

#### 1. `list_ai_tools`
- **Purpose**: Returns a curated list of AI development tools
- **Returns**: List of AI tools including:
  - Claude API Connector
  - OpenAI Assistant SDK
  - LangChain Agent Hub
  - Vector Store Analyzer

### Starting the MCP Server

```bash
# Start MCP server manually
node backend/mcp-server.js

# Or configure in Claude Desktop using .mcp.json
```

### MCP Configuration (.mcp.json)

```json
{
  "mcpServers": {
    "ai-tools": {
      "command": "node",
      "args": ["backend/mcp-server.js"],
      "env": {
        "PORT": "5055"
      }
    }
  }
}
```

### AI Tools Platform Engineer Agent

The project includes a specialized AI agent (`.claude/agents/ai-tools-platform-engineer.md`) designed for:

- **Database Architecture & Modeling** - Design database schemas for AI tools catalog
- **CRUD Operations** - Create, read, update, delete operations for tools management
- **Input Interface Development** - Build forms for adding new AI tools
- **Listing & Filtering Interface** - Create search and filtering interfaces
- **API Endpoint Design** - RESTful API for tools management

**Key Features:**
- Normalized database schemas with proper relationships
- Support for categories, roles, and tags
- Comprehensive validation and error handling
- Future-proof extensible design

## 🛠️ AI Tools Platform Features

The project includes a comprehensive AI Tools Platform that allows users to discover, submit, and organize AI tools by categories, roles, and tags.

### Core Functionality

#### 1. **User Authentication & Authorization**
- **Login/Logout System**: Secure authentication using Laravel Sanctum
- **Two-Factor Authentication (2FA)**: Email-based verification for enhanced security
- **Role-Based Access Control (RBAC)**: Comprehensive role system with different permissions
- **Protected Routes**: Only authenticated users can add/edit tools
- **User Management**: Users can view and manage their own tools

### 🔐 Role-Based Access Control (RBAC)

The platform implements a comprehensive role-based access control system that governs what users can see and do throughout the application.

#### Available User Roles

| Role | Description | Access Level | Use Case |
|------|-------------|--------------|----------|
| **owner** | Platform administrator | Full access | System administration, user management, platform configuration |
| **backend** | Backend developer | Standard user | Backend development tools, APIs, databases |
| **frontend** | Frontend developer | Standard user | Frontend frameworks, UI libraries, design tools |
| **designer** | UI/UX designer | Standard user | Design tools, prototyping, creative resources |
| **devops** | DevOps engineer | Standard user | Infrastructure, deployment, monitoring tools |
| **data-scientist** | Data scientist | Standard user | ML/AI tools, data analysis, visualization |
| **qa** | Quality assurance | Standard user | Testing tools, automation, quality frameworks |

#### Role-Based Navigation Visibility

The navigation menu dynamically shows/hides items based on the authenticated user's role:

**Navigation Items & Role Requirements:**

```typescript
// Visible to ALL authenticated users:
- Dashboard          → /dashboard
- AI Tools (Browse)  → /tools
- Add Tool           → /tools/add
- My Tools           → /dashboard/my-tools
- Profile            → /profile

// Visible ONLY to 'owner' role:
- Admin Panel        → /admin
```

**Implementation:** Navigation component filters items based on user role:
```typescript
// Navigation.tsx (lines 66-69)
const visibleItems = items.filter((item) => {
  if (!item.roles || item.roles.length === 0) return true;
  return user && item.roles.includes(user.role);
});
```

#### Dashboard Customization by Role

Each role sees a personalized dashboard with role-specific quick actions:

**Owner Dashboard:**
- User Management → Manage users, roles, and permissions
- All AI Tools → Browse and moderate all tools
- Analytics Dashboard → Platform statistics and metrics
- Platform Settings → Configure system settings
- Categories & Tags → Manage taxonomy
- Content Moderation → Review submitted tools

**Frontend Developer Dashboard:**
- Frontend Tools → AI tools for frontend development
- UI Libraries → Component libraries and design systems
- Design Resources → Design tools and assets
- My Contributions → Tools shared by the user

**Backend Developer Dashboard:**
- Backend Tools → AI tools for backend development
- API Resources → API tools, SDKs, and services
- Database Tools → Database management tools
- My Contributions → Tools shared by the user

**Designer Dashboard:**
- Design Tools → AI-powered design and creative tools
- UI/UX Resources → User experience design tools
- Prototyping Tools → Rapid prototyping and wireframing
- My Contributions → Tools shared by the user

#### Authorization Rules

##### Tool Management Authorization

**Creating Tools:**
- ✅ All authenticated users can create tools
- ✅ Users can save tools as "draft" (private) or "published" (public)
- ✅ Created tools are automatically assigned to the user (`user_id`)

**Editing Tools:**
- ✅ Users can edit their own tools
- ✅ **Owners** can edit ANY tool (platform-wide access)
- ❌ Users cannot edit tools created by other users

**Deleting Tools:**
- ✅ Users can delete their own tools
- ✅ **Owners** can delete ANY tool
- ❌ Users cannot delete tools created by other users

**Featuring Tools:**
- ✅ **Only owners** can mark tools as featured (`is_featured`)
- ❌ Regular users cannot set featured status

**Backend Implementation:**
```php
// ToolController.php - Update Authorization
public function update(UpdateToolRequest $request, $id) {
    $tool = Tool::findOrFail($id);

    // Check authorization
    if (auth()->user()->role !== 'owner' && $tool->user_id !== auth()->id()) {
        return response()->json([
            'success' => false,
            'message' => 'Unauthorized to update this tool',
        ], 403);
    }
    // ... proceed with update
}
```

##### Admin Panel Access

**Access Requirements:**
- ✅ **ONLY** users with `role = 'owner'` can access `/admin`
- ❌ All other roles are redirected to their dashboard
- The Admin navigation link is hidden from non-owner users

**Admin Panel Features (Owner-Only):**
- **Users Tab**: View, search, filter all users; lock/unlock accounts; delete users
- **Overview Tab**: Platform statistics and analytics (coming soon)
- **Tools Tab**: Manage all tools across the platform (coming soon)
- **Settings Tab**: Platform configuration (coming soon)

**Frontend Protection:**
```typescript
// admin/page.tsx (lines 40-46)
useEffect(() => {
  if (!isLoading && !user) {
    router.push('/login');
  } else if (!isLoading && user && user.role !== 'owner') {
    router.push('/dashboard'); // Redirect non-owners
  }
}, [user, isLoading, router]);
```

**Backend Protection:**
```php
// UserController.php
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/users', [UserController::class, 'index'])
        ->middleware('role:owner'); // Only owners can access
});
```

#### API Endpoint Authorization

**Public Endpoints** (No authentication required):
```
GET  /api/tools              - Browse published tools
GET  /api/tools/{id}         - View tool details
GET  /api/tools/{id}/comments - View comments
GET  /api/categories         - List categories
GET  /api/tags              - List tags
POST /api/login             - User login
```

**Authenticated Endpoints** (Requires valid token):
```
POST   /api/tools                    - Create tool (All users)
PUT    /api/tools/{id}               - Update tool (Owner or creator)
DELETE /api/tools/{id}               - Delete tool (Owner or creator)
GET    /api/my-tools                 - List user's tools
POST   /api/tools/{id}/favorite      - Toggle favorite
POST   /api/tools/{id}/comments      - Add comment
POST   /api/logout                   - Logout
GET    /api/user                     - Get current user
GET    /api/user/stats               - User statistics
GET    /api/user/activities          - User activity feed
```

**Owner-Only Endpoints:**
```
GET    /api/users                    - List all users
POST   /api/users/{id}/toggle-status - Lock/unlock user
DELETE /api/users/{id}               - Delete user
PUT    /api/tools/{id}               - Can edit ANY tool (not just own)
DELETE /api/tools/{id}               - Can delete ANY tool
```

#### Database Schema for Roles

**Users Table:**
```sql
CREATE TABLE users (
    id BIGINT UNSIGNED PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    role ENUM('owner', 'backend', 'frontend', 'designer', 'devops', 'data-scientist', 'qa'),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

**Tool-Role Relationship (Many-to-Many):**
```sql
CREATE TABLE tool_role (
    id BIGINT UNSIGNED PRIMARY KEY,
    tool_id BIGINT UNSIGNED,
    role VARCHAR(50),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,

    FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE,
    UNIQUE KEY unique_tool_role (tool_id, role)
);
```

**Relationships:**
```
User (1) ──→ (∞) Tools         [User owns many tools]
Tool (∞) ←──→ (∞) Roles         [Tool can be relevant for multiple roles]
User (∞) ←──→ (∞) Tools         [User can favorite many tools via favorites table]
User (∞) ──→ (∞) Comments       [User can comment on many tools]
```

#### Frontend Role Management

**Authentication Context:**
```typescript
// AuthContext.tsx
interface User {
  id: number;
  name: string;
  email: string;
  role: 'owner' | 'backend' | 'frontend' | 'designer' | 'devops' | 'data-scientist' | 'qa';
}

// Check user role
const { user } = useAuth();
if (user?.role === 'owner') {
  // Show admin features
}
```

**Conditional Rendering:**
```typescript
// Show button only for tool owners or platform owners
{(user?.id === tool.user_id || user?.role === 'owner') && (
  <Button onClick={handleEdit}>Edit Tool</Button>
)}
```

#### Security Best Practices

1. **Never trust client-side checks** - Always validate authorization on the backend
2. **Use middleware** - Protect routes with Laravel middleware (`auth:sanctum`, `role:owner`)
3. **Validate ownership** - Check `user_id` matches authenticated user or user is owner
4. **Hide UI elements** - Don't show actions users can't perform (better UX)
5. **Return proper HTTP codes** - Use 401 (Unauthorized), 403 (Forbidden), 404 (Not Found)
6. **Log security events** - Track failed authorization attempts

#### Testing Authorization

**Test User Roles:**
```bash
# Create test users with different roles
docker compose exec php_fpm php artisan tinker

# Owner user
User::create([
    'name' => 'Admin Owner',
    'email' => 'admin@example.com',
    'password' => Hash::make('password'),
    'role' => 'owner'
]);

# Frontend user
User::create([
    'name' => 'Elena Frontend',
    'email' => 'elena@example.com',
    'password' => Hash::make('password'),
    'role' => 'frontend'
]);

# Backend user
User::create([
    'name' => 'John Backend',
    'email' => 'john@example.com',
    'password' => Hash::make('password'),
    'role' => 'backend'
]);
```

**Testing Scenarios:**
1. Login as `owner` → Can access Admin panel ✅
2. Login as `frontend` → Admin link hidden, cannot access `/admin` ✅
3. Create tool as `frontend` user → Can edit/delete own tool ✅
4. Try to edit another user's tool → Should fail with 403 ✅
5. Login as `owner` → Can edit ANY tool ✅

### 🔒 Two-Factor Authentication (2FA)

The platform implements email-based two-factor authentication to provide an additional layer of security for all user accounts.

#### How 2FA Works

**Login Flow:**
1. **Step 1**: User enters email and password on login page
2. **Step 2**: System validates credentials and generates a 6-digit code
3. **Step 3**: Code is sent to user's email address
4. **Step 4**: User enters the code on verification page
5. **Step 5**: System validates code and grants access

**Security Features:**
- ✅ 6-digit numeric codes (e.g., "123456")
- ✅ Codes expire after 10 minutes
- ✅ One-time use codes (cleared after successful verification)
- ✅ Resend code functionality
- ✅ Protection against inactive accounts
- ✅ Secure email delivery via Laravel notifications

#### Database Schema

**New Columns Added to `users` Table:**

```sql
ALTER TABLE users ADD COLUMN (
    two_factor_code VARCHAR(6) NULL,              -- 6-digit verification code
    two_factor_expires_at TIMESTAMP NULL,          -- Code expiration time (10 minutes)
    two_factor_verified_at TIMESTAMP NULL          -- Last successful verification
);
```

**Example Data Flow:**
```
1. User logs in → two_factor_code = "485293", two_factor_expires_at = "2025-10-10 16:10:00"
2. User verifies → two_factor_code = NULL, two_factor_verified_at = "2025-10-10 16:05:23"
```

#### API Endpoints

**Authentication Endpoints:**

```
POST /api/login
    Request:  { "email": "user@example.com", "password": "password123" }
    Response: { "requires_2fa": true, "message": "A verification code has been sent to your email.", "email": "user@example.com" }

POST /api/verify-2fa
    Request:  { "email": "user@example.com", "code": "123456" }
    Response: { "success": true, "user": {...}, "token": "sanctum_token_here" }

POST /api/resend-2fa
    Request:  { "email": "user@example.com" }
    Response: { "success": true, "message": "A new verification code has been sent to your email." }
```

**Error Responses:**
```json
// Invalid code
{ "errors": { "code": ["Invalid verification code."] } }

// Expired code
{ "errors": { "code": ["Verification code has expired. Please login again."] } }

// No code found
{ "errors": { "code": ["No verification code found. Please login again."] } }
```

#### Frontend Components

**Login Page (`/login`)**
- Modified to detect 2FA requirement
- Redirects to verification page when 2FA is needed
- Traditional login preserved for compatibility

**2FA Verification Page (`/verify-2fa`)**
- Clean, user-friendly interface
- 6-digit code input (numbers only, auto-formatted)
- Real-time validation
- Resend code button
- Expiration countdown (10 minutes)
- Back to login option

**Key Features:**
```typescript
// Code input validation
<input
  type="text"
  maxLength={6}
  value={code}
  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
  className="text-center text-2xl tracking-widest font-mono"
/>

// Automatic verification when 6 digits entered
{code.length === 6 && <Button>Verify Code</Button>}
```

#### Email Notification

**Email Template (`TwoFactorCodeNotification.php`):**

```
Subject: Your Two-Factor Authentication Code

Hello [User Name]!

You are receiving this email because a login attempt was made to your account.

Your verification code is:
**123456**

This code will expire in 10 minutes.

If you did not attempt to log in, please ignore this email or contact support immediately.

Thank you for keeping your account secure!
```

**Email Configuration (Development):**

By default, emails are logged to `storage/logs/laravel.log`:

```env
MAIL_MAILER=log
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="AI Tools Platform"
```

**Email Configuration (Production):**

For production, configure a real mail service in `backend/.env`:

```env
# Using Gmail SMTP
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="AI Tools Platform"

# Using Mailgun
MAIL_MAILER=mailgun
MAILGUN_DOMAIN=your-domain.mailgun.org
MAILGUN_SECRET=your-mailgun-secret
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="AI Tools Platform"

# Using SendGrid
MAIL_MAILER=smtp
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=your-sendgrid-api-key
MAIL_ENCRYPTION=tls
```

#### Testing 2FA

**Step-by-Step Testing:**

1. **Navigate to login page:**
   ```
   http://localhost:8200/login
   ```

2. **Enter credentials:**
   - Email: `ivan@admin.local`
   - Password: `password`
   - Click "Sign in"

3. **Check Laravel logs for the code:**
   ```bash
   docker compose exec php_fpm tail -f storage/logs/laravel.log
   ```
   Look for the 6-digit code in the email content (e.g., `**123456**`)

4. **Verify the code:**
   - You'll be redirected to `/verify-2fa?email=ivan@admin.local`
   - Enter the 6-digit code from the log
   - Click "Verify Code"

5. **Test additional scenarios:**
   - **Resend Code**: Click "Resend Code" to get a new code
   - **Invalid Code**: Enter wrong code and verify error message
   - **Expired Code**: Wait 10+ minutes, try to verify (should fail)
   - **Back to Login**: Test navigation back to login page

**Expected Results:**
- ✅ Valid code → Authenticated and redirected to dashboard
- ❌ Invalid code → Error: "Invalid verification code."
- ❌ Expired code → Error: "Verification code has expired. Please login again."
- ✅ Resend code → New code sent, old code invalidated

**Example Test Users:**

```bash
# Create test users with different roles
docker compose exec php_fpm php artisan tinker

# Owner user
User::create([
    'name' => 'Ivan Admin',
    'email' => 'ivan@admin.local',
    'password' => Hash::make('password'),
    'role' => 'owner'
]);

# Frontend user
User::create([
    'name' => 'Elena Frontend',
    'email' => 'elena@frontend.local',
    'password' => Hash::make('password'),
    'role' => 'frontend'
]);
```

#### Backend Implementation Details

**AuthController.php Methods:**

1. **`login()`** - Generates and sends 2FA code
   ```php
   // Generate 6-digit code
   $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

   // Save code and expiration
   $user->two_factor_code = $code;
   $user->two_factor_expires_at = Carbon::now()->addMinutes(10);
   $user->save();

   // Send email notification
   $user->notify(new TwoFactorCodeNotification($code));
   ```

2. **`verifyTwoFactor()`** - Validates code and creates auth token
   ```php
   // Check expiration
   if (Carbon::now()->isAfter($user->two_factor_expires_at)) {
       throw ValidationException::withMessages([
           'code' => ['Verification code has expired.']
       ]);
   }

   // Verify code
   if ($user->two_factor_code !== $request->code) {
       throw ValidationException::withMessages([
           'code' => ['Invalid verification code.']
       ]);
   }

   // Clear code and create token
   $user->two_factor_code = null;
   $user->two_factor_expires_at = null;
   $user->two_factor_verified_at = Carbon::now();
   $user->save();

   $token = $user->createToken('auth-token')->plainTextToken;
   ```

3. **`resendTwoFactorCode()`** - Generates new code
   ```php
   // Generate new code
   $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

   // Update user
   $user->two_factor_code = $code;
   $user->two_factor_expires_at = Carbon::now()->addMinutes(10);
   $user->save();

   // Send new email
   $user->notify(new TwoFactorCodeNotification($code));
   ```

#### Security Considerations

**Strengths:**
- ✅ Protection against password-only attacks
- ✅ Time-limited codes prevent replay attacks
- ✅ One-time use codes
- ✅ Secure random code generation
- ✅ Email verification ownership

**Limitations:**
- ⚠️ Email interception possible (use HTTPS in production)
- ⚠️ Dependent on email delivery reliability
- ⚠️ 10-minute window for phishing attacks

**Best Practices:**
1. Always use HTTPS in production
2. Configure SPF/DKIM for email authentication
3. Monitor failed verification attempts
4. Log all 2FA events for audit purposes
5. Consider adding rate limiting on code requests
6. Implement account lockout after multiple failed attempts

#### Future Enhancements

Potential improvements for the 2FA system:

1. **SMS-based 2FA** - Add phone number verification
2. **Authenticator App Support** - TOTP (Time-based OTP) with apps like Google Authenticator
3. **Backup Codes** - Generate one-time backup codes for account recovery
4. **Remember Device** - Option to skip 2FA on trusted devices
5. **Biometric Authentication** - WebAuthn/FIDO2 support
6. **Email Notification** - Alert users when new device logs in
7. **Admin Controls** - Force 2FA for specific roles or all users
8. **2FA Status Dashboard** - Show users when 2FA was last used

### 📝 How to Add Tools - Complete User Guide

This guide walks you through adding a new AI tool to the platform step-by-step.

#### Prerequisites
- ✅ You must be logged in with any role (owner, frontend, backend, designer, etc.)
- ✅ You must have completed 2FA verification
- ✅ The platform must be running (see Installation section)

#### Step-by-Step Guide

**Step 1: Navigate to Add Tool Page**

1. Login to your account at http://localhost:8200/login
2. Complete 2FA verification
3. Click "Add Tool" in the navigation menu
4. You'll be redirected to http://localhost:8200/tools/add

**Step 2: Fill in Required Fields**

The form has several required fields marked with a red asterisk (*):

**1. Name/Title** (Required)
- Enter the tool's official name
- Examples: "ChatGPT", "GitHub Copilot", "Midjourney"
- Minimum 3 characters, maximum 255 characters
- Must be unique (no duplicate tool names)

```
Good: "ChatGPT"
Good: "GitHub Copilot"
Bad: "AI Tool" (too generic)
Bad: "" (empty)
```

**2. Description** (Required)
- Detailed explanation of what the tool does
- Describe key features, use cases, and benefits
- Minimum 20 characters, maximum 2000 characters

```
Example:
"ChatGPT is an advanced AI language model developed by OpenAI. It can
understand and generate human-like text, making it perfect for content
creation, code generation, answering questions, and providing creative
assistance. The tool supports conversations in multiple languages and can
help with a wide variety of tasks from writing to problem-solving."
```

**3. Category** (Required)
- Select the most appropriate category from the dropdown
- Available categories: AI/ML, Development, Design, Analytics, Utilities, Productivity
- Choose only ONE category

```
Examples:
- ChatGPT → AI/ML
- GitHub Copilot → Development
- Figma → Design
```

**4. Tool Type** (Required)
- Select what kind of tool it is
- Options:
  - **Library**: Code library or package
  - **Framework**: Development framework
  - **API**: API service
  - **Service**: Web service/SaaS application
  - **Application**: Standalone application

```
Examples:
- ChatGPT → Service
- TensorFlow → Library
- React → Framework
- OpenAI API → API
```

**5. Pricing Model** (Required)
- How is the tool monetized?
- Options:
  - **Free**: Completely free to use
  - **Freemium**: Free with paid premium features
  - **Paid**: Requires payment
  - **Open Source**: Open source project

```
Examples:
- ChatGPT → Freemium (free version + ChatGPT Plus)
- VS Code → Open Source
- GitHub Copilot → Paid
```

**6. Tags** (Required)
- Select 1-10 relevant tags
- Tags help users discover your tool
- Click tags to select/deselect them
- Selected tags turn blue

```
Examples for ChatGPT:
✅ ai-assistant
✅ chatbot
✅ text-processing
✅ automation
❌ image-generation (not relevant)
```

**7. Relevant Roles** (Required)
- Select which roles would benefit from this tool
- Multiple selections allowed
- Available roles: Owner, Backend, Frontend, Designer, DevOps, Data Scientist, QA

```
Examples for ChatGPT:
✅ Backend (code generation)
✅ Frontend (code generation)
✅ Designer (content creation)
✅ QA (test case generation)
```

**Step 3: Fill in Optional Fields**

These fields enhance the tool listing but aren't required:

**1. Link/URL** (Optional)
- Official website URL
- Must be a valid, reachable URL
- Format: `https://example.com`

```
Examples:
✅ https://chat.openai.com
✅ https://github.com/copilot
❌ example.com (missing https://)
❌ not a url (invalid format)
```

**2. Official Documentation** (Optional)
- Link to documentation
- Format: `https://docs.example.com`

```
Examples:
✅ https://platform.openai.com/docs
✅ https://docs.github.com/copilot
```

**3. GitHub Repository** (Optional)
- GitHub repository URL (if applicable)
- **Must** be a valid github.com URL
- Format: `https://github.com/username/repo`

```
Examples:
✅ https://github.com/openai/openai-python
✅ https://github.com/features/copilot
❌ https://gitlab.com/repo (not GitHub)
❌ github.com/repo (missing https://)
```

**4. Thumbnail Image URL** (Optional)
- URL to tool's logo or screenshot
- Displays on tool cards
- Format: `https://example.com/image.jpg`

```
Examples:
✅ https://cdn.example.com/chatgpt-logo.png
✅ https://example.com/images/tool.jpg
```

**Step 4: Choose Status**

- **Draft**: Tool is saved but NOT visible to other users (private)
  - Use when you're not ready to publish
  - You can edit it later
  - Only you can see it

- **Published**: Tool is visible to all users (public)
  - Immediately appears in the tools catalog
  - Other users can view, favorite, and comment
  - Recommended for completed submissions

**Step 5: Review and Submit**

1. **Review all fields** - Check for typos and accuracy
2. **Character count** - Ensure description is 20-2000 characters
3. **Tags count** - Verify you have 1-10 tags selected
4. **Roles count** - Ensure at least one role is selected
5. Click **"Add Tool"** button

**Expected Behavior:**
- ✅ Success: "Tool added successfully! Redirecting to dashboard..."
- ✅ You'll be redirected to the dashboard after 2 seconds
- ❌ Error: Red error messages will appear below invalid fields

**Step 6: View Your Tool**

After successful submission:

1. **View in Dashboard**: Check the "My Tools" section on your dashboard
2. **View in Catalog**: If published, find it at http://localhost:8200/tools
3. **Share with Team**: Others can now discover and use your tool

#### Common Errors and Solutions

**Error: "Please provide a title for the tool."**
- Solution: Enter a tool name in the Title field

**Error: "A tool with this title already exists."**
- Solution: Choose a different, more specific name
- Example: Instead of "AI Tool", use "ChatGPT for Enterprise"

**Error: "The description must be at least 20 characters."**
- Solution: Add more detail to your description
- Explain what the tool does, its features, and use cases

**Error: "The URL must be a valid, reachable website."**
- Solution: Ensure URL starts with `https://` or `http://`
- Check that the website is accessible

**Error: "Please provide a valid GitHub repository URL."**
- Solution: GitHub URL must match format `https://github.com/username/repo`
- Other git hosts (GitLab, Bitbucket) are not accepted in this field

**Error: "Please add at least one tag."**
- Solution: Click on at least one tag from the list

**Error: "You can add a maximum of 10 tags."**
- Solution: Deselect some tags to stay within the 10-tag limit

#### Real-World Examples

**Example 1: Adding ChatGPT**

```
Name: ChatGPT
Description: ChatGPT is an advanced AI language model that can understand
and generate human-like text. Perfect for content creation, coding,
problem-solving, and conversations. Supports multiple languages and offers
both free and premium plans.

Category: AI/ML
Tool Type: Service
Pricing Model: Freemium
Link: https://chat.openai.com
Documentation: https://platform.openai.com/docs
GitHub: (leave empty - no public repo)
Thumbnail: https://cdn.example.com/chatgpt-logo.png

Tags: ai-assistant, chatbot, text-processing, code-generation, automation
Roles: Backend, Frontend, Designer, QA
Status: Published
```

**Example 2: Adding TensorFlow**

```
Name: TensorFlow
Description: TensorFlow is an open-source machine learning framework
developed by Google. It provides comprehensive tools for building and
training neural networks. Supports Python, JavaScript, and other languages.
Ideal for deep learning, computer vision, and NLP tasks.

Category: AI/ML
Tool Type: Library
Pricing Model: Open Source
Link: https://www.tensorflow.org
Documentation: https://www.tensorflow.org/api_docs
GitHub: https://github.com/tensorflow/tensorflow
Thumbnail: https://www.tensorflow.org/images/tf_logo.png

Tags: machine-learning, deep-learning, neural-networks, python, open-source
Roles: Backend, Data Scientist
Status: Published
```

**Example 3: Adding Figma**

```
Name: Figma
Description: Figma is a collaborative design tool for creating user
interfaces, websites, and mobile apps. Real-time collaboration allows
multiple designers to work simultaneously. Includes prototyping, design
systems, and developer handoff features.

Category: Design
Tool Type: Service
Pricing Model: Freemium
Link: https://www.figma.com
Documentation: https://help.figma.com
GitHub: (leave empty)
Thumbnail: https://cdn.example.com/figma-logo.png

Tags: design, ui-ux, prototyping, collaboration
Roles: Designer, Frontend
Status: Published
```

#### Pro Tips

1. **Write Clear Descriptions**
   - Focus on benefits, not just features
   - Use simple language
   - Include use cases

2. **Choose Accurate Categories**
   - Select the MOST relevant category
   - Don't force-fit tools into wrong categories

3. **Select Relevant Roles**
   - Think about who would actually use this tool
   - Don't select all roles just to get more visibility

4. **Use Tags Wisely**
   - Choose specific, relevant tags
   - Popular tags: ai-assistant, automation, code-generation, design, testing

5. **Provide Links**
   - Always include official website if available
   - Documentation link helps users get started
   - GitHub link builds trust for open-source projects

6. **Save as Draft First**
   - If unsure, save as draft
   - Review it later before publishing
   - Ask colleagues for feedback

#### Managing Your Tools

**Edit a Tool:**
1. Go to http://localhost:8200/profile
2. Scroll to "My Tools" section
3. Find your tool
4. Click "Edit" button
5. Make changes
6. Click "Save Changes"

**Delete a Tool:**
1. Go to your Profile page
2. Find the tool in "My Tools"
3. Click "Delete" button
4. Confirm deletion (this cannot be undone)

**Change Tool Status:**
- Edit the tool
- Change Status from "Draft" to "Published" (or vice versa)
- Save changes

#### 2. **Tool Submission Form**
The platform provides a comprehensive form for adding new AI tools with the following fields:

**Required Fields:**
- **Name/Title**: Tool's official name (e.g., "ChatGPT", "GitHub Copilot")
- **Description**: Detailed description (minimum 20 characters, maximum 2000)
- **Category**: Select from predefined categories (AI/ML, Development, Design, etc.)
- **Tool Type**: Choose from library, framework, API, service, or application
- **Pricing Model**: Free, freemium, paid, or open source
- **Tags**: Select 1-10 relevant tags for discovery
- **Relevant Roles**: Select which roles this tool is suitable for

**Optional Fields:**
- **Link/URL**: Official website URL
- **Official Documentation**: Link to documentation
- **GitHub Repository**: GitHub repository URL
- **Thumbnail Image**: URL to tool's logo/thumbnail
- **Status**: Draft (private) or Published (public)

#### 3. **Tools Catalog & Discovery**
- **Comprehensive Listing**: All published tools displayed in an organized grid
- **Advanced Filtering**:
  - Filter by **Category** (dropdown selection)
  - Filter by **Role** (multiselect checkboxes)
  - Filter by **Tags** (multiselect checkboxes)
  - **Search by name** (real-time text search)
- **Clear Filters**: Easy reset of all active filters
- **Results Counter**: Shows number of matching tools
- **Tool Details**: Each tool card shows title, description, category, tags, roles, and view count

#### 4. **Database Schema**
The platform uses a well-structured database with the following models:

**Tools Table:**
```sql
- id, user_id, category_id
- title, slug, description
- url, github_url, documentation_url, thumbnail_url
- tool_type, pricing_model, status
- views_count, favorites_count, is_featured
- published_at, created_at, updated_at
```

**Categories Table:**
```sql
- id, name, slug, description
- icon (emoji), color (hex), order
- is_active, created_at, updated_at
```

**Tags Table:**
```sql
- id, name, slug, usage_count
- created_at, updated_at
```

**Tool-Role Relationship:**
```sql
- tool_role table with tool_id, role, timestamps
- Supports multiple roles per tool
- Prevents duplicate role assignments
```

**Tool-Tag Relationship:**
```sql
- tool_tag junction table
- Many-to-many relationship
- Tracks tag usage statistics
```

#### 5. **API Endpoints**

**Public Endpoints:**
```
GET /api/tools              - List all published tools (with filtering)
GET /api/tools/{id}         - Get specific tool details
GET /api/categories         - List all categories
GET /api/tags              - List all tags
POST /api/login            - User authentication
```

**Protected Endpoints (Requires Authentication):**
```
POST /api/tools            - Create new tool
PUT /api/tools/{id}        - Update existing tool
DELETE /api/tools/{id}     - Delete tool
GET /api/my-tools          - Get user's own tools
POST /api/logout           - Logout user
GET /api/user              - Get current user info
```

**Query Parameters for Filtering:**
```
?category_id=1             - Filter by category
?role[]=backend&role[]=frontend  - Filter by multiple roles
?tag[]=1&tag[]=2           - Filter by multiple tags
?search=chatgpt           - Search by name/description
?featured=true            - Show only featured tools
```

#### 6. **Frontend Components**

**Authentication System:**
- `AuthContext.tsx` - Global authentication state management
- `ClientOnly.tsx` - Prevents hydration mismatches
- Login/logout functionality with localStorage persistence

**Tool Management:**
- `tools/add/page.tsx` - Comprehensive tool submission form
- `tools/page.tsx` - Tools catalog with advanced filtering
- Real-time form validation with error handling
- Responsive design with Tailwind CSS

**Dashboard:**
- `dashboard/page.tsx` - Role-based dashboard with quick actions
- Personalized welcome message based on user role
- Quick access to add tools and browse catalog

#### 7. **Validation & Security**

**Server-Side Validation:**
- Comprehensive validation rules in `StoreToolRequest.php`
- Custom error messages for better user experience
- URL validation for external links
- GitHub URL format validation
- Category and tag existence validation
- Role enumeration validation

**Authorization:**
- Users can only edit/delete their own tools
- Owners have full access to all tools
- Protected API routes using Laravel Sanctum
- CSRF protection on forms

**Data Integrity:**
- Foreign key constraints in database
- Unique constraints on tool titles
- Proper cascade deletes for relationships
- Soft delete capability for important entities

### Usage Examples

#### Adding a New Tool:
1. Navigate to `/tools/add` (requires login)
2. Fill in the tool name (e.g., "Midjourney")
3. Add description of what the tool does
4. Select appropriate category (e.g., "AI/ML")
5. Choose relevant roles (e.g., "Designer", "Frontend")
6. Select tags (e.g., "image-generation", "ai-art")
7. Add URLs for documentation and GitHub if available
8. Choose tool type and pricing model
9. Save as draft or publish immediately

#### Discovering Tools:
1. Visit `/tools` to see the catalog
2. Use filters to narrow down results:
   - Select "Frontend" role to see tools for frontend developers
   - Choose "AI/ML" category for AI-related tools
   - Search for "chat" to find chatbot tools
3. Click on any tool card to view details
4. Use "Clear All" to reset filters

#### Filtering Examples:
- **Find AI tools for designers**: Filter by role "Designer" + category "AI/ML"
- **Find free development tools**: Filter by pricing model "Free" + role "Backend"
- **Find image generation tools**: Search for "image" or select "image-generation" tag

## 💻 Development Commands

### Frontend Development
```bash
# Access frontend container
docker compose exec frontend sh

# Install packages
docker compose exec frontend npm install package-name

# View frontend logs
docker compose logs frontend -f
```

### Backend Development
```bash
# Access PHP container
docker compose exec php_fpm sh

# Laravel Artisan commands
docker compose exec php_fpm php artisan --version
docker compose exec php_fpm php artisan migrate
docker compose exec php_fpm php artisan make:controller UserController
docker compose exec php_fpm php artisan make:model Product -m

# Composer commands
docker compose exec php_fpm composer install
docker compose exec php_fpm composer require laravel/sanctum

# View backend logs
docker compose logs backend -f
docker compose logs php_fpm -f
```

### MCP Server Development
```bash
# Start MCP server
node backend/mcp-server.js

# Check MCP server status
netstat -an | findstr :5055

# View MCP server logs (if running in background)
# The server outputs to stdout/stderr when started manually
```

### Database Operations
```bash
# Connect to MySQL
./db-manage.sh connect

# Create backup
./db-manage.sh backup

# Connect to Redis
./db-manage.sh redis

# Direct MySQL access
docker compose exec mysql mysql -u root -pvibecode-full-stack-starter-kit_mysql_pass vibecode-full-stack-starter-kit_app

# Run Laravel migrations
docker compose exec php_fpm php artisan migrate

# Seed initial data (categories, tags, users)
docker compose exec php_fpm php artisan db:seed

# Reset database (migrate + seed)
docker compose exec php_fpm php artisan migrate:fresh --seed
```

## 🔐 Database Configuration

**MySQL Credentials:**
- Host: mysql (internal) / localhost:8203 (external)
- Database: vibecode-full-stack-starter-kit_app
- Username: root
- Password: vibecode-full-stack-starter-kit_mysql_pass

**Redis Configuration:**
- Host: redis (internal) / localhost:8204 (external)  
- Password: vibecode-full-stack-starter-kit_redis_pass

## 🚀 AI Tools Platform Setup

### Initial Setup Steps

1. **Start the environment:**
   ```bash
   ./start.sh
   ```

2. **Run database migrations:**
   ```bash
   docker compose exec php_fpm php artisan migrate
   ```

3. **Seed initial data:**
   ```bash
   docker compose exec php_fpm php artisan db:seed
   ```

4. **Create initial admin user:**
   ```bash
   docker compose exec php_fpm php artisan tinker
   ```
   Then run:
   ```php
   User::create([
       'name' => 'Admin User',
       'email' => 'admin@example.com',
       'password' => Hash::make('password'),
       'role' => 'owner'
   ]);
   ```

### Default Categories & Tags

The platform comes with pre-configured categories and tags:

**Categories:**
- 🤖 AI/ML (Artificial Intelligence & Machine Learning)
- 💻 Development (Programming & Development Tools)
- 🎨 Design (Design & Creative Tools)
- 📊 Analytics (Data Analysis & Business Intelligence)
- 🔧 Utilities (General Purpose Tools)
- 📝 Productivity (Productivity & Collaboration)

**Available Roles:**
- Owner (Full access to all features)
- Backend (Backend Development)
- Frontend (Frontend Development)
- Designer (UI/UX Design)
- DevOps (DevOps & Infrastructure)
- Data Scientist (Data Science & Analytics)
- QA (Quality Assurance & Testing)

**Sample Tags:**
- ai-assistant, chatbot, code-generation, image-generation
- text-processing, automation, api, framework
- library, open-source, paid, free

### Environment Configuration

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8201/api
```

**Backend (.env):**
```env
APP_URL=http://localhost:8201
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=vibecode-full-stack-starter-kit_app
DB_USERNAME=root
DB_PASSWORD=vibecode-full-stack-starter-kit_mysql_pass
```

## 🛠️ Troubleshooting

### Common Issues

1. **Port conflicts:**
   - Check if ports 8200-8205 are available
   - Use `netstat -tulpn | grep :PORT` to check port usage

2. **Permission issues:**
   - Run `./laravel-setup.sh` to fix Laravel permissions

3. **Services not starting:**
   - Check Docker is running: `docker ps`
   - View logs: `docker compose logs`

### Useful Commands

```bash
# Check service status
docker compose ps

# View all logs
docker compose logs -f

# Restart specific service
docker compose restart frontend
docker compose restart backend

# Rebuild services
docker compose up -d --build

# Clean up (removes containers and volumes)
docker compose down -v
```

## 📊 Monitoring

- **Service Status**: `docker compose ps`
- **Resource Usage**: `docker stats`
- **Logs**: `docker compose logs -f [service_name]`

## 🔄 Updates

To update the environment:
1. Pull latest images: `docker compose pull`
2. Rebuild services: `docker compose up -d --build`

---

**Generated with create-fullstack-env.sh**  
**Project ID**: vibecode-full-stack-starter-kit  
**Created**: Thu Sep  4 01:37:12 PM EEST 2025
