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

## Fix EPA Product Lookup Modal Display (User Reported Issue)
- [ ] Identify why modal component isn't rendering when button is clicked
- [ ] Fix the rendering issue (likely Dialog component or conditional render problem)
- [ ] Test modal opens when button is clicked
- [ ] Test modal closes when X or Cancel is clicked
- [ ] Test product search functionality works in modal
- [ ] Test product selection auto-populates job form

## EPA Product Lookup - Rebuild as Dedicated Page (Alternative Approach)
- [x] Create ProductLookup page component at client/src/pages/ProductLookup.tsx
- [x] Add route for /product-lookup in App.tsx
- [x] Change EPA Product Lookup button to navigate to the new page (use Link or router.push)
- [x] Implement product selection and data passing back to job form (via URL params or localStorage)
- [x] Test complete workflow: job form → product lookup → select product → return to job form with data
- [x] **VERIFIED WORKING**: EPA Registration Number (352-652) auto-populates when product is selected

## Connect Real Agrian API Integration
- [ ] Analyze Agrian Label Center website structure and search URL patterns
- [ ] Update searchProducts() in server/agrian.ts to scrape real search results
- [ ] Implement HTML parsing to extract product list (name, EPA #, distributor, registrant)
- [ ] Update getProductDetails() to scrape actual product detail pages
- [ ] Parse all EPA compliance fields (PPE, re-entry intervals, application rates, diluent info)
- [ ] Test with "corn" search to verify 50+ results are returned
- [ ] Verify all product detail fields are populated correctly
- [ ] Update ProductLookup page to display all scraped fields
- [ ] Expand auto-population logic to fill ALL EPA fields in job form (not just EPA Registration Number)

## Build EPA Product Database (New Approach - Replace Agrian Scraping)
- [ ] Design products database table schema with all EPA compliance fields
- [ ] Add products table to drizzle/schema.ts
- [ ] Run database migration (pnpm db:push)
- [ ] Create seed script to populate database with 50-100 real EPA-registered products
- [ ] Focus on common crops: corn, soybeans, wheat, cotton, almonds, grapes
- [ ] Include all fields: EPA #, product name, active ingredients, PPE, re-entry intervals, application rates, etc.
- [ ] Update server/agrian.ts or create new server/products.ts to query database
- [ ] Update tRPC router to use database queries instead of web scraping
- [ ] Test product search returns 50+ results for "corn"
- [ ] Test product detail view shows all EPA compliance data
- [ ] Verify auto-population fills ALL job form fields from selected product

## Agrian Label Center Widget Integration (Embeddable Solution)
- [x] Add Agrian widget script to ProductLookup page
- [x] Create iframe or container for Agrian label search widget
- [x] Test widget loads and displays Agrian search interface
- [x] Implement message passing/event listeners to capture product selection from widget
- [x] Extract EPA compliance data from selected product
- [x] Pass product data back to job form via localStorage
- [x] Update job form to populate ALL EPA fields from widget selection
- [x] Test complete workflow: open widget → search → select → auto-populate job form
- [x] Verify all EPA fields are correctly populated (EPA #, PPE, rates, intervals, etc.)

## Supabase Migration (Priority)
- [x] Update DATABASE_URL environment variable to point to Supabase
- [x] Update drizzle config to use Supabase PostgreSQL
- [x] Convert schema from MySQL to PostgreSQL
- [x] Create all tables in Supabase
- [x] Test database connection
- [x] Verify authentication works with Supabase
- [ ] Create checkpoint after successful migration

## EPA Product Database (ON HOLD - User will provide data)
- [ ] Design epaProducts table (199k EPA products - base data)
- [ ] Design productDetails table (AI-extracted compliance data)
- [ ] Design userProducts table (user favorites with custom pricing)
- [ ] Create EPA product tables in Supabase
- [ ] User imports EPA data
- [ ] Implement AI PDF label extraction service
- [ ] Create tRPC procedures for EPA product search
- [ ] Update ProductLookup page to search Supabase EPA database

## Login and Preview Issues (URGENT)
- [x] Debug why login is not working after Supabase migration
- [x] Check OAuth callback handler and session management
- [x] Verify database user upsert functionality works with Supabase
- [x] Fix SSL configuration (changed from 'require' to { rejectUnauthorized: false })
- [x] Fix server binding (added '0.0.0.0' to listen call)
- [x] Fix preview display issues in Management UI
- [ ] Test complete authentication flow end-to-end with actual login

## OAuth Callback Fix - Session Pooler (COMPLETED)
- [x] Identified IPv4 compatibility issue with direct Supabase connection
- [x] Updated connection string to use Session Pooler instead of direct connection
- [x] Changed hostname from db.yqimcvatzaldidmqmvtr.supabase.co to aws-1-us-west-1.pooler.supabase.com
- [x] Verified DNS resolution and connectivity to pooler endpoint
- [x] Tested login flow end-to-end - SUCCESS
- [x] User can now sign in and access dashboard

## Core CRUD Operations Testing
- [ ] Test organization creation
- [ ] Test organization read/list
- [ ] Test organization update
- [ ] Test organization delete
- [ ] Test customer creation
- [ ] Test customer read/list
- [ ] Test customer update
- [ ] Test customer delete
- [ ] Test personnel creation
- [ ] Test personnel read/list
- [ ] Test personnel update
- [ ] Test personnel delete
- [ ] Test job creation
- [ ] Test job read/list
- [ ] Test job update
- [ ] Test job delete
- [ ] Verify dashboard statistics update correctly

## Implement Full CRUD Operations
- [x] Customer CREATE - Working
- [x] Customer READ - Working
- [x] Customer UPDATE - Edit functionality implemented
- [x] Customer DELETE - Working
- [x] Personnel CREATE - Working
- [x] Personnel READ - Working
- [x] Personnel UPDATE - Edit functionality implemented
- [x] Personnel DELETE - Delete functionality implemented
- [x] Job CREATE - Working
- [x] Job READ - Working
- [x] Job UPDATE - Edit functionality implemented
- [x] Job DELETE - Working

## Settings Page Implementation
- [x] Create Settings.tsx page component
- [x] Add Settings to sidebar navigation
- [x] Implement Organization profile form (name, address, contact info)
- [x] Add organization update mutation
- [x] Add organization schema fields to database
- [ ] Test organization CRUD operations

## AI Chat MCP Enhancement
- [x] Analyze current AI Chat implementation
- [x] Design MCP integration for agricultural context
- [x] Implement MCP tools for spray operations (jobs, customers, personnel, weather, EPA)
- [x] Add context-aware prompts for agricultural queries
- [x] Integrate tool calling into sendMessage procedure
- [ ] Test AI Chat with real agricultural scenarios

## Customizable Job Status System
- [x] Design database schema for job_statuses table (name, color, displayOrder, category, isDefault, orgId)
- [x] Add migration to create job_statuses table
- [x] Create default statuses for existing organizations (Pending, Ready, In Progress, Completed, Cancelled)
- [x] Add CRUD procedures for job statuses in backend (getJobStatusesByOrgId, createJobStatus, updateJobStatus, deleteJobStatus)
- [x] Add tRPC jobStatuses router with list/create/update/delete procedures
- [x] Update getJobsByOrgId to join with job_statuses and return statusName, statusColor, statusCategory
- [x] Fix frontend TypeScript errors (Dashboard and Jobs pages now use statusName, statusColor, statusCategory)
- [x] Add Status dropdown to job form with custom statuses
- [x] Create Status Management section in Settings page
- [x] Add color picker for status visualization
- [x] Implement status CRUD in Settings (create, edit, delete)
- [ ] Implement drag-and-drop status reordering (optional enhancement)
- [x] Implement status transition workflow (buttons to move between stages)
- [x] Add StatusTransitionButton component to job cards
- [x] Smart status transitions (Pending→Active, Active→Completed)
- [ ] Update Dashboard to dynamically group by custom statuses
- [ ] Add status change history tracking (optional)
- [ ] Test custom status system end-to-end
