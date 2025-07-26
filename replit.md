# Legal Case Management System

## Project Overview
A comprehensive legal case management application built with React, Express, and in-memory storage. The application helps lawyers manage clients, cases, reminders, and provides dashboard analytics.

## Architecture
- **Frontend**: React with TypeScript, using Wouter for routing, TanStack Query for data fetching, and shadcn/ui components
- **Backend**: Express.js server with TypeScript
- **Storage**: Supabase PostgreSQL database with intelligent fallback to in-memory storage
- **UI Framework**: Tailwind CSS with shadcn/ui components

## Recent Changes
- **Date: 2025-01-26** - Successfully integrated Supabase database for backend storage
- **Date: 2025-01-26** - Implemented intelligent fallback system: Supabase primary, in-memory backup
- **Date: 2025-01-26** - Database schema pushed to Supabase, all tables created and populated
- **Date: 2025-01-26** - Fixed type compatibility issues between schema and storage implementation
- **Date: 2025-01-26** - Successfully converted from Replit Agent to standard Replit environment

## Features
- User authentication (demo user: demo_lawyer/demo123)
- Dashboard with statistics
- Client management
- Case management with client relationships
- Reminder system with case associations
- RESTful API with proper validation using Zod schemas

## Tech Stack
- React 18+ with TypeScript
- Express.js with TypeScript
- Zod for schema validation
- TanStack Query for state management
- Tailwind CSS + shadcn/ui for styling
- Wouter for client-side routing

## User Preferences
*No specific user preferences documented yet*

## Current Status
- ✅ Supabase database integration complete and working
- ✅ Intelligent fallback system operational
- ✅ Database schema deployed and populated with sample data  
- ✅ Server running on port 5000
- ✅ Frontend loading correctly with persistent data
- ✅ All CRUD operations functional with Supabase backend