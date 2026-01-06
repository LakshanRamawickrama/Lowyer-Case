# Legal Case Management System

## Project Overview
A comprehensive legal case management application built with React and Django. The application helps lawyers manage clients, cases, reminders, and provides dashboard analytics.

## Architecture
- **Frontend**: React with TypeScript, using Wouter for routing, TanStack Query for data fetching, and shadcn/ui components.
- **Backend**: Django REST Framework (DRF) with Python.
- **Database**: SQLite (Development) / Compatible with PostgreSQL.
- **UI Framework**: Tailwind CSS with shadcn/ui components.

## Recent Changes
- **Date: 2026-01-06** - Migrated backend from Express.js to Django.
- **Date: 2026-01-06** - Implemented Django apps: `core`, `clients`, `cases`, `reminders`.
- **Date: 2026-01-06** - Set up custom User model and REST API viewsets.
- **Date: 2026-01-06** - Configured Vite proxy (port 5173 -> 8000) for seamless integration.
- **Date: 2026-01-06** - Successfully seeded database with initial lawyer, clients, and cases.

## Features
- User authentication (demo user: demo_lawyer/demo123)
- Dashboard with statistics
- Client management
- Case management with client relationships
- Reminder system with case associations
- RESTful API with Django REST Framework

## Tech Stack
- React 18+ with TypeScript
- Django 5.2+ (Python)
- Django REST Framework
- TanStack Query (React Query)
- Tailwind CSS + shadcn/ui
- Wouter for client-side routing

## Current Status
- ✅ Django backend operational on port 8000
- ✅ React frontend operational on port 5173 (via Vite)
- ✅ API Proxy configured and working
- ✅ Database migrated and seeded
- ✅ Express/Node.js files removed