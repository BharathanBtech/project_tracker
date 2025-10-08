# Project Tracker Application – Requirements Specification (Enhanced)

## Purpose:
To build a web-based, AI-powered application that enables teams to manage multiple projects, track tasks, monitor performance, and collaborate efficiently with intelligent insights and automation.

## Technology: 

Frontend - React + TypeScript
Backend -  Node.JS + Express

## Notes

1, Create Document folder in root of the repository and keep all the documents there ( README.md, How_to_setup.md,etc )

2, Dont use mock data, Insteed use script to create neccessary tables in database with sample data required. 
    Database details:
         DB_HOST=172.16.10.130
         DB_PORT=5432
         DB_USER=pega
         DB_PASSWORD=0okmNJI(8uhb 
         DB_NAME=project_tracker
         
         Use Knex add seeding should be done only for development environment not for production it should be configurable
    2.1: Use npm run migrate:latest to create all necessary tables in the database
    2.2: Use npm run seed:run to populate the database with sample data

3, UI Should be neat and professional

4, Develop project Phase by Phase

5, Code should be modular and group by folders for easy understanding

6, Develop the project Phase by Phase

7, Have rolePermissions file under config folder to have role based permissions


Phase 1: ✅ **COMPLETED**
## 1. Core Modules

### 1.1 User Management
- [x] User Registration & Login (Email/password, OAuth)
- [x] Role-based access: Admin, Manager, Lead, Team members
- [x] Profile: Name, email, avatar, department
- [x] Leave Management: Add/view leave dates

### 1.2 Project Management
- [x] Create/Edit/Delete Projects
  - [x] Title, description, start/end dates
  - [x] Status: Active, On Hold, Completed
- [x] Assign Members with Roles:
  - [x] Developer, Tester, Business Analyst, Designer, etc.
- [x] View Participant Breakdown by Role

### 1.3 Task Management
- [x] Create/Edit/Delete Tasks
  - [x] Title, description, priority (Low, Medium, High)
  - [x] Status: To Do, In Progress, Done, Blocked
  - [x] Due date, estimated hours
  - [x] Complexity Rating: ⭐ 1–5 stars
    - [x] 1–2 stars: Simple
    - [x] 3 stars: Moderate
    - [x] 4–5 stars: Complex
- [x] Assign Tasks to Users
- [x] Subtasks and Dependencies
- [x] Attachments (PDF, images, docs)
- [ ] AI Suggestions:
  - [ ] Auto-estimate complexity based on description
  - [ ] Recommend assignees based on availability and skill


Phase 2:
## 2. Performance & Analytics

### 2.1 Project Dashboard
- [ ] Task status overview
- [ ] Burn-down chart (if using sprints)
- [ ] Member workload distribution

### 2.2 Performer Insights
- [ ] Top Performer Identification (based on task completion, quality, speed)
- [ ] Performance Bar Chart:
  - [ ] Visualize contribution per member
  - [ ] Filter by role (Developer, Tester, BA, etc.)
- [ ] AI-Powered Suggestions:
  - [ ] Highlight areas for improvement (e.g., speed, quality, missed deadlines)
  - [ ] Personalized feedback for developers

### 2.3 Smart Notifications
- [ ] Alert if task deadline overlaps with user leave
  - [ ] Suggest reassignment
  - [ ] Notify manager and project lead

Phase 3:
## 3. Search & Filters
- [ ] Global search (projects, tasks, users)
- [ ] Filter tasks by:
  - [ ] Status, priority, complexity, assignee, due date
- [ ] Save custom views



Phase 4:
## 4. Settings & Configuration

### 4.1 Project Settings
- [ ] Custom status labels
- [ ] Priority levels
- [ ] Tags/categories

### 4.2 System Settings
- [ ] Theme (light/dark)
- [ ] Language/localization
- [ ] Notification preferences

Phase 5:
## 5. Security & Access Control
- [ ] Role-based permissions
- [ ] Audit logs for changes
- [ ] Secure file uploads

Phase 6:
## 6. AI-Powered Features
- [ ] Task complexity estimation
- [ ] Smart assignee recommendations
- [ ] Developer performance analysis
- [ ] Leave-aware task reassignment
- [ ] Personalized improvement suggestions

Phase 7:
## 7. Optional Extensions
- [ ] Time tracking per task
- [ ] GitHub/GitLab integration
- [ ] REST API for external tools
- [ ] Mobile app (React Native or Flutter)

Phase 8:
## 8. Tech Stack Suggestions
- [ ] Frontend: React + TypeScript
- [ ] Backend: Node.js + NestJS
- [ ] Database: PostgreSQL
- [ ] Auth: JWT or OAuth2
- [ ] AI Layer: OpenAI GPT-4o or similar
- [ ] Infra: Docker + CI/CD + Tailscale/Cloudflare Tunnel

---

