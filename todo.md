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


## GTM Planetary Branding
- [x] Generate agricultural-themed logo with orbital/planetary design
- [x] Apply GTM Planetary color palette (Galactic Purple, Cyan, Pink, Dark Purple)
- [x] Update typography to Montserrat font family
- [x] Replace logo throughout application
- [x] Update theme colors in index.css
- [x] Update button and component colors to match brand


## Claude/Anthropic AI Integration
- [x] Request ANTHROPIC_API_KEY via secrets management
- [x] Integrate Claude AI with streaming support
- [x] Add MCP tool calling support for 3rd party apps
- [x] Implement rate limiting per user/organization
- [x] Add usage tracking and throttling
- [x] Update AI chat interface to use Claude
- [x] Connect MCP tools (Stripe, Supabase, Jotform, Gmail, Calendar, Canva, tl;dv)

## Agrian EPA Product Lookup Integration
- [x] Analyze Agrian Label Center website structure and API
- [x] Create backend scraping service for Agrian product search
- [x] Implement product detail extraction (EPA #, PPE, rates, intervals)
- [x] Build product search UI with country/state/crop filters
- [x] Create product results list component
- [x] Build product detail modal/dialog
- [x] Integrate product lookup into job creation form
- [x] Auto-populate job form fields from selected product
- [ ] Debug dialog rendering issue (component built but not displaying)
- [ ] Test complete workflow: search → select → populate job form

## EPA Product Lookup Dialog Fix
- [x] Created backend Agrian scraping service (server/agrian.ts)
- [x] Added tRPC endpoints for product search and details (agrian router)
- [x] Built AgrianProductLookup component with full UI (filters, search, results table, detail tabs)
- [x] Integrated component into Jobs page with EPA Product Lookup button
- [x] Wired state management (showAgrianLookup state, onClick handler)
- [ ] **BLOCKER**: Debug why modal isn't displaying when button is clicked (component renders but modal doesn't show)
- [ ] Test complete product search and selection workflow once modal displays
