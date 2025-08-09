# 4marketdays - African Foods E-commerce Platform

## Overview

4marketdays is a full-stack e-commerce platform specializing in authentic African foods for diaspora communities. The application connects African food enthusiasts worldwide with traditional ingredients, spices, and products from their homeland.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **State Management**: React Context API for cart state, TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite with custom configuration

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Pattern**: RESTful API with Express routes
- **Session Management**: Express sessions with PostgreSQL store

### Development Environment
- **Development Server**: Vite dev server with Express backend
- **Hot Module Replacement**: Vite HMR for frontend development
- **TypeScript**: Full TypeScript support across frontend and backend
- **Replit Integration**: Custom Replit cartographer and error modal plugins

## Key Components

### Database Schema
The application uses a comprehensive e-commerce schema with the following entities:
- **Users**: Customer accounts with authentication
- **Categories**: Product categorization system
- **Products**: Detailed product information including dual pricing (USD/NGN)
- **Cart Items**: Shopping cart with session and user support
- **Orders & Order Items**: Order processing and tracking
- **Newsletter Subscribers**: Email marketing integration

### Frontend Components
- **Header**: Navigation with cart integration and mobile responsiveness
- **Hero Section**: Landing page with value propositions
- **Product Categories**: Visual category browsing
- **Featured Products**: Highlighted product showcase
- **Product Cards**: Reusable product display components
- **Shopping Cart**: Context-based cart management
- **Newsletter Signup**: Email subscription with form validation
- **Testimonials**: Customer review display
- **Trust Indicators**: Security and quality badges

### API Endpoints
- `/api/categories` - Product category management
- `/api/products` - Product catalog and featured items
- `/api/products/category/:id` - Category-specific product listings
- `/api/cart` - Shopping cart operations
- `/api/newsletter/subscribe` - Newsletter subscription
- `/api/orders` - Order management

## Data Flow

### User Journey
1. **Browse Products**: Users can explore categories and featured products
2. **Add to Cart**: Products are added to session-based or user-based cart
3. **Checkout Process**: Users proceed through order creation
4. **Newsletter Signup**: Optional email subscription for updates

### State Management
- **Cart State**: Managed via React Context with localStorage session tracking
- **Server State**: TanStack Query handles API data fetching and caching
- **Form State**: React Hook Form with Zod validation for type safety

### Authentication Flow
- Session-based authentication with PostgreSQL session store
- Guest shopping cart functionality with session ID tracking
- User registration and login system

## External Dependencies

### Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting
- **WebSocket Support**: Real-time database connections via ws library

### UI & Styling
- **Radix UI**: Accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Embla Carousel**: Image carousel functionality

### Development Tools
- **Drizzle Kit**: Database migration and management
- **Zod**: Runtime type validation
- **React Hook Form**: Form management
- **Date-fns**: Date manipulation utilities

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds React application to `dist/public`
2. **Backend Build**: esbuild compiles Express server to `dist/index.js`
3. **Database Migration**: Drizzle Kit handles schema changes

### Environment Configuration
- **Development**: Local development with Vite dev server
- **Production**: Node.js Express server serving static files
- **Database**: Environment-based DATABASE_URL configuration

### Performance Optimizations
- **Code Splitting**: Vite automatic code splitting
- **Image Optimization**: Placeholder system with Unsplash integration
- **Caching**: TanStack Query provides intelligent caching
- **Bundle Analysis**: Vite plugin for bundle size monitoring

## Changelog

Changelog:
- July 06, 2025. Initial setup
- July 06, 2025. Complete mobile responsiveness implementation
- July 06, 2025. Navigation system and authentication flow implementation
- July 06, 2025. Enhanced hover effects with green color scheme
- July 06, 2025. Added product detail page with full product information
- July 06, 2025. Created order history page for logged-in users

## User Preferences

Preferred communication style: Simple, everyday language.