# Ready2Spray AI - Project TODO

## Database Schema
- [x] Organizations table with subscription fields
- [x] Customers table
- [x] Jobs table
- [x] Personnel table
- [x] Products table
- [x] AI conversations and messages tables
- [x] AI usage tracking table

## Backend API (tRPC Procedures)
- [x] Organization management procedures
- [x] Customer CRUD procedures
- [x] Job CRUD procedures
- [x] Personnel CRUD procedures
- [x] Product search procedures
- [ ] Stripe subscription procedures
- [ ] OpenAI chat procedure with function calling
- [ ] Weather lookup integration

## Stripe Integration
- [ ] Stripe configuration and client setup
- [ ] Subscription creation endpoint
- [ ] Subscription update endpoint
- [ ] Subscription cancellation endpoint
- [ ] Webhook handler for subscription events
- [ ] Subscription status tracking

## OpenAI Integration
- [ ] OpenAI client configuration
- [ ] Chat procedure with streaming support
- [ ] Function calling for database operations
- [ ] Token usage tracking
- [ ] Cost calculation

## Frontend Pages
- [x] Dashboard with statistics
- [x] Jobs list and management page
- [ ] Job detail page
- [x] Customers list and management page
- [x] Personnel list and management page
- [ ] AI Chat interface
- [ ] Settings page with subscription management
- [x] Navigation and routing

## UI Components
- [ ] Dashboard layout with sidebar
- [ ] Job cards and list views
- [ ] Customer cards
- [ ] Personnel cards
- [ ] Chat interface with message history
- [ ] Subscription plan selector
- [ ] Loading states and error handling

## Features
- [ ] User authentication
- [ ] Role-based access control
- [ ] Job scheduling and tracking
- [ ] Customer management
- [ ] Personnel tracking
- [ ] EPA-compliant product management
- [ ] AI-powered chat assistant
- [ ] Weather integration
- [ ] Subscription billing

## Bug Fixes
- [x] Fix navigation sidebar to show proper menu items (Dashboard, Jobs, Customers, Personnel)
- [x] Ensure preview panel loads correctly

## AI Copilot Chat
- [x] Conversation history sidebar
- [x] Quick action buttons (Today's Jobs, Create Job, View Customers, Add Customer, Weather Check)
- [x] Streaming chat responses
- [x] Message history persistence
- [x] New conversation functionality

## Enhanced Personnel Section
- [x] Table view with all fields (Name, Role, Status, Email, Phone, Pilot License, Applicator License, Last seen)
- [x] Search functionality
- [x] Status filter dropdown
- [x] Role filter dropdown
- [x] Add person dialog with all fields
- [x] Training, Schedule, Bulk upload, Raw upload buttons

## Map Manager
- [x] Upload KML/GPX/GeoJSON files
- [x] Display uploaded map files list
- [x] Map preview/viewer
- [x] Generate public shareable links for maps
- [x] Delete map files

## Job Form Enhancements
- [ ] Add customer selection dropdown
- [ ] Add personnel assignment dropdown
- [ ] Add scheduled start/end date pickers
- [ ] Add job location field
- [ ] Add state/commodity/crop fields
- [ ] Add target pest field
- [ ] Add EPA registration number field
- [ ] Add application rate field
- [ ] Add application method dropdown
- [ ] Add chemical product selection
- [ ] Add crop specifics (Re-Entry Interval, Pre-harvest Interval)
- [ ] Add max applications per season
- [ ] Add max rate per season
- [ ] Add methods allowed field
- [ ] Add rate field
- [ ] Add diluent fields (Aerial, Ground)
- [ ] Add diluent (Chemigation) field
- [ ] Add generic conditions/notes textarea
