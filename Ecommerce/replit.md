# Overview

This is a modern e-commerce web application built with React, TypeScript, and Express.js. The application provides a complete online shopping experience with product browsing, shopping cart functionality, checkout process, and order tracking. It includes both customer-facing features and an admin panel for product management. The application uses a PostgreSQL database with Drizzle ORM for data persistence and Neon Database for cloud hosting.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is built using React with TypeScript and follows a component-based architecture:

- **UI Framework**: Utilizes shadcn/ui components built on top of Radix UI primitives for consistent, accessible UI components
- **Styling**: TailwindCSS for utility-first styling with CSS custom properties for theming
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Context API for cart state management with localStorage persistence
- **Data Fetching**: TanStack Query (React Query) for server state management with custom query functions
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

## Backend Architecture

The backend follows a RESTful API design using Express.js:

- **API Structure**: RESTful endpoints for products (`/api/products`) and orders (`/api/orders`)
- **Request Handling**: Express middleware for JSON parsing, URL encoding, and request logging
- **Error Handling**: Centralized error handling middleware with structured error responses
- **Development Setup**: Vite integration for hot module replacement in development mode

## Data Storage Solutions

The application uses a PostgreSQL database with modern ORM tooling:

- **Database**: PostgreSQL as the primary database
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Schema Definition**: Centralized schema in `/shared/schema.ts` with tables for users, products, and orders
- **Migrations**: Drizzle Kit for database migrations and schema updates
- **Development Storage**: In-memory storage implementation for development/testing

## Database Schema Design

- **Products Table**: Stores product information including name, description, price, category, stock, images, ratings, and status
- **Orders Table**: Manages order data with customer information, status tracking, items (JSON), and shipping addresses
- **Users Table**: Basic user authentication structure with username and password fields
- **Data Validation**: Zod schemas derived from Drizzle table definitions for runtime validation

## External Dependencies

### Third-Party Services

- **Neon Database**: Cloud PostgreSQL hosting service for production database
- **Replit Integration**: Development environment integration with cartographer and runtime error overlay plugins

### UI and Component Libraries

- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives for building the design system
- **Lucide React**: Icon library providing consistent iconography throughout the application
- **TailwindCSS**: Utility-first CSS framework for rapid UI development

### Development and Build Tools

- **Vite**: Fast build tool and development server with React plugin support
- **TypeScript**: Static type checking for enhanced developer experience and code reliability
- **ESBuild**: Fast JavaScript bundler used by Vite for production builds

### Data Management

- **TanStack Query**: Powerful data synchronization library for managing server state
- **React Hook Form**: Performant forms library with minimal re-renders
- **Zod**: TypeScript-first schema validation library
- **Date-fns**: Utility library for date manipulation and formatting

### Authentication and Sessions

- **connect-pg-simple**: PostgreSQL session store for Express sessions (configured but not actively used in current implementation)