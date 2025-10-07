# Project Tracker Application

A comprehensive web-based, AI-powered project management application that enables teams to manage multiple projects, track tasks, monitor performance, and collaborate efficiently.

## Features

### Phase 1 (Current Implementation)

#### 1. User Management
- ✅ User Registration & Login (JWT-based authentication)
- ✅ Role-based access: Admin, Manager, Lead, Team members
- ✅ User profiles with department information
- ✅ Leave Management: Request and manage leave dates

#### 2. Project Management
- ✅ Create/Edit/Delete Projects
- ✅ Project status tracking (Active, On Hold, Completed)
- ✅ Assign team members with specific roles:
  - Developer, Tester, Business Analyst, Designer, DevOps, Project Manager
- ✅ View project details and team composition

#### 3. Task Management
- ✅ Create/Edit/Delete Tasks
- ✅ Task properties:
  - Priority levels (Low, Medium, High)
  - Status tracking (To Do, In Progress, Done, Blocked)
  - Complexity rating (1-5 stars)
  - Due dates and estimated hours
- ✅ Assign tasks to team members
- ✅ Subtasks and dependencies support
- ✅ File attachments for tasks

## Tech Stack

### Frontend
- **React 18** - UI Library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Router** - Routing
- **Axios** - HTTP client
- **React Icons** - Icon library
- **React Hot Toast** - Notifications
- **Recharts** - Data visualization

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **PostgreSQL** - Database
- **Knex.js** - Query builder and migrations
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

## Project Structure

```
project_tracking/
├── backend/
│   ├── src/
│   │   ├── config/           # Database configuration
│   │   ├── controllers/      # Request handlers
│   │   ├── database/
│   │   │   ├── migrations/   # Database migrations
│   │   │   └── seeds/        # Seed data (dev only)
│   │   ├── middleware/       # Auth & error handling
│   │   ├── routes/          # API routes
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Helper functions
│   │   └── server.ts        # App entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── knexfile.ts
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── stores/         # Zustand stores
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # API utilities
│   │   ├── App.tsx         # Main app component
│   │   ├── main.tsx        # Entry point
│   │   └── index.css       # Global styles
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
└── Documents/
    ├── README.md
    ├── How_to_setup.md
    └── requirements.md
```

## Future Phases

### Phase 2: Performance & Analytics
- Project dashboards with burn-down charts
- Performance insights and top performer identification
- Smart notifications for deadline overlaps with leave dates

### Phase 3: Search & Filters
- Global search across projects, tasks, and users
- Advanced filtering and custom views

### Phase 4: Settings & Configuration
- Customizable status labels and priority levels
- Theme support (light/dark mode)
- Notification preferences

### Phase 5: Security & Access Control
- Enhanced role-based permissions
- Audit logs for changes
- Secure file upload handling

### Phase 6: AI-Powered Features
- Task complexity estimation
- Smart assignee recommendations
- Developer performance analysis
- Leave-aware task reassignment
- Personalized improvement suggestions

### Phase 7: Optional Extensions
- Time tracking per task
- GitHub/GitLab integration
- REST API for external tools
- Mobile app

## Demo Credentials

```
Admin:
Email: admin@projecttracker.com
Password: password123

Manager:
Email: manager@projecttracker.com
Password: password123

Lead:
Email: lead@projecttracker.com
Password: password123

Team Member:
Email: john.doe@projecttracker.com
Password: password123
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user
- `PATCH /api/users/:id/role` - Update user role (admin only)
- `POST /api/users/:id/change-password` - Change password

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/members` - Add team member
- `DELETE /api/projects/:id/members/:memberId` - Remove member

### Tasks
- `GET /api/tasks` - Get all tasks (supports filters)
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task details
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/dependencies` - Add dependency

### Leaves
- `GET /api/leaves` - Get leave requests
- `POST /api/leaves` - Create leave request
- `PATCH /api/leaves/:id/status` - Update leave status
- `DELETE /api/leaves/:id` - Delete leave request

## Contributing

This is a development project. For any questions or issues, please refer to the requirements document or setup guide.

## License

Private project - All rights reserved

