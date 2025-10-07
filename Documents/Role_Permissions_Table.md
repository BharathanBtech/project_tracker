# Role-Based Access Control (RBAC) - Project Tracker

## Overview
This document outlines the role-based permissions and access control system implemented in the Project Tracker application.

## User Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| **Admin** | Full system administrator | Complete access to all features |
| **Manager** | Project and team manager | High-level management capabilities |
| **Lead** | Team lead or project lead | Leadership responsibilities |
| **Member** | Regular team member | Basic user functionality |

## Navigation Menu Access

| Menu Item | Admin | Manager | Lead | Member | Description |
|-----------|-------|---------|------|--------|-------------|
| **Dashboard** | ✅ | ✅ | ✅ | ✅ | Overview and statistics |
| **My Projects** | ✅ | ✅ | ✅ | ✅ | Projects user is involved in |
| **All Projects** | ✅ | ✅ | ✅ | ❌ | All projects in system |
| **My Tasks** | ✅ | ✅ | ✅ | ✅ | Tasks assigned to user |
| **All Tasks** | ✅ | ✅ | ✅ | ❌ | All tasks across projects |
| **Team** | ✅ | ✅ | ✅ | ❌ | Team members directory |
| **User Management** | ✅ | ✅ | ❌ | ❌ | Manage user accounts |
| **Leave Requests** | ✅ | ✅ | ✅ | ✅ | Request leave |
| **Leave Approvals** | ✅ | ✅ | ✅ | ❌ | Approve/reject leave |

## Feature Permissions

### Project Management

| Feature | Admin | Manager | Lead | Member |
|---------|-------|---------|------|--------|
| **Create Projects** | ✅ | ✅ | ✅ | ❌ |
| **Edit Projects** | ✅ | ✅ | ✅ | ❌ |
| **Delete Projects** | ✅ | ✅ | ❌ | ❌ |
| **View All Projects** | ✅ | ✅ | ✅ | ❌ |
| **View My Projects** | ✅ | ✅ | ✅ | ✅ |
| **Add Project Members** | ✅ | ✅ | ✅ | ❌ |
| **Remove Project Members** | ✅ | ✅ | ✅ | ❌ |
| **Change Member Roles** | ✅ | ✅ | ✅ | ❌ |

### Task Management

| Feature | Admin | Manager | Lead | Member |
|---------|-------|---------|------|--------|
| **Create Tasks** | ✅ | ✅ | ✅ | ✅ |
| **Edit Tasks** | ✅ | ✅ | ✅ | ✅ |
| **Delete Tasks** | ✅ | ✅ | ✅ | ✅ |
| **View All Tasks** | ✅ | ✅ | ✅ | ❌ |
| **View My Tasks** | ✅ | ✅ | ✅ | ✅ |
| **Assign Tasks** | ✅ | ✅ | ✅ | ✅ |
| **Add Dependencies** | ✅ | ✅ | ✅ | ✅ |
| **Upload Attachments** | ✅ | ✅ | ✅ | ✅ |

### User Management

| Feature | Admin | Manager | Lead | Member |
|---------|-------|---------|------|--------|
| **View All Users** | ✅ | ✅ | ✅ | ❌ |
| **Edit User Profiles** | ✅ | ✅ | ❌ | ❌ |
| **Change User Roles** | ✅ | ✅ | ❌ | ❌ |
| **Deactivate Users** | ✅ | ❌ | ❌ | ❌ |
| **View User Directory** | ✅ | ✅ | ✅ | ❌ |

### Leave Management

| Feature | Admin | Manager | Lead | Member |
|---------|-------|---------|------|--------|
| **Request Leave** | ✅ | ✅ | ✅ | ✅ |
| **View All Leave Requests** | ✅ | ✅ | ✅ | ❌ |
| **Approve Leave** | ✅ | ✅ | ✅ | ❌ |
| **Reject Leave** | ✅ | ✅ | ✅ | ❌ |
| **View Leave Calendar** | ✅ | ✅ | ✅ | ✅ |

### Dashboard & Analytics

| Feature | Admin | Manager | Lead | Member |
|---------|-------|---------|------|--------|
| **View All Stats** | ✅ | ✅ | ✅ | ❌ |
| **View Project Analytics** | ✅ | ✅ | ✅ | ❌ |
| **View Team Performance** | ✅ | ✅ | ✅ | ❌ |
| **View Personal Stats** | ✅ | ✅ | ✅ | ✅ |

## Page Access Summary

### Admin Access
- **All pages and features**
- Full system control
- User management capabilities
- Project and task oversight

### Manager Access
- **All projects and tasks** (view and manage)
- **Team management** (view team, manage projects)
- **Leave approvals**
- **User management** (limited - cannot deactivate users)
- **Cannot access:** Full user management (deactivation)

### Lead Access
- **Project creation and management** (cannot delete projects)
- **Task management** (full access)
- **Team viewing** (cannot manage users)
- **Leave approvals** (can approve team leave)
- **Cannot access:** User management, project deletion

### Member Access
- **Personal projects and tasks only**
- **Leave requests**
- **Profile management**
- **Cannot access:** System-wide views, user management, project creation

## Implementation Details

### Frontend Implementation
- **Role-based navigation** - Menu items filtered by user role
- **Conditional rendering** - UI elements shown/hidden based on permissions
- **Route protection** - Access controlled at component level

### Backend Implementation
- **JWT-based authentication** - User role embedded in token
- **Middleware authorization** - Route-level permission checks
- **API endpoint protection** - Server-side role validation

### Database Considerations
- **User roles stored** in users table
- **Project membership** tracked in project_members table
- **Task assignment** recorded in tasks table
- **Audit trail** maintained for sensitive operations

## Security Notes

1. **Never trust frontend** - All permissions validated on backend
2. **JWT token expiration** - Tokens expire after 7 days
3. **Role changes** - Require re-authentication to take effect
4. **Sensitive operations** - Always logged for audit purposes

## Testing Different Roles

Use the following demo accounts to test role-based features:

```
Admin: admin@projecttracker.com / password123
Manager: manager@projecttracker.com / password123  
Lead: lead@projecttracker.com / password123
Member: john.doe@projecttracker.com / password123
```

## Future Enhancements

- **Custom roles** - Ability to create custom role definitions
- **Permission inheritance** - Hierarchical permission system
- **Temporary permissions** - Time-limited access grants
- **Audit logging** - Detailed permission usage tracking
