# Legal Case Management System

## Project Overview
A comprehensive legal case management application built with React, Express, and in-memory storage. The application helps lawyers manage clients, cases, reminders, and provides dashboard analytics.

## Architecture
- **Frontend**: React with TypeScript, using Wouter for routing, TanStack Query for data fetching, and shadcn/ui components
- **Backend**: Express.js server with TypeScript
- **Storage**: In-memory storage implementation (MemStorage) instead of PostgreSQL for better Replit compatibility
- **UI Framework**: Tailwind CSS with shadcn/ui components

## Recent Changes
- **Date: 2025-01-26** - Migrated from PostgreSQL to in-memory storage (MemStorage)
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
- ✅ Successfully migrated to Replit environment
- ✅ In-memory storage implementation complete
- ✅ Server running on port 5000
- ✅ Frontend loading correctly
- ✅ Migration completed successfully