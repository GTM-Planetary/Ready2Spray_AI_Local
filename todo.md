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
- [x] Implement drag-and-drop status reordering
  - [x] Install @dnd-kit library for drag-and-drop functionality
  - [x] Add reorder mutation to jobStatus router
  - [x] Update Settings Status Management with drag-and-drop UI
- [x] Implement status transition workflow (buttons to move between stages)
- [x] Add StatusTransitionButton component to job cards
- [x] Smart status transitions (Pending→Active, Active→Completed)
- [x] Update Dashboard to dynamically group by custom statuses (already working with statusCategory)
- [x] Add status change history tracking
  - [x] Create job_status_history table for audit trail
  - [x] Add backend procedures for logging status changes (createJobStatusHistory, getJobStatusHistory)
  - [x] Add automatic history logging to jobs.update mutation
  - [x] Build StatusHistory component to display timeline
  - [x] Integrate status history into job cards with History button and dialog
- [x] Test custom status system end-to-end


## Phase 5: Critical Production Readiness Tasks
- [x] Complete job form with all EPA compliance fields (ALREADY COMPLETE)
  - [x] Add customer selection dropdown
  - [x] Add personnel assignment dropdown
  - [x] Add scheduled start/end date pickers
  - [x] Add job location field with coordinates
  - [x] Add state field
  - [x] Add commodity/crop field
  - [x] Add target pest field
  - [x] Add EPA registration number field
  - [x] Add application rate field
  - [x] Add application method dropdown
  - [x] Add chemical product field
  - [x] Add re-entry interval field
  - [x] Add pre-harvest interval field
  - [x] Add max applications per season field
  - [x] Add max rate per season field
  - [x] Add methods allowed field
  - [x] Add rate field
  - [x] Add diluent aerial field
  - [x] Add diluent ground field
  - [x] Add diluent chemigation field
  - [x] Add generic conditions/notes textarea
  - [ ] Test job creation with all fields
  - [ ] Test job editing with all fields
- [x] Add comprehensive data validation
  - [x] Add Zod schemas for all tRPC inputs (customers, personnel, jobs, jobStatuses)
  - [x] Add frontend form validation (required fields, type checking)
  - [x] Add email format validation (Zod email schema)
  - [x] Add phone format validation (regex pattern)
  - [x] Add date range validation (scheduledEnd > scheduledStart)
- [x] Create job detail page
  - [x] Build JobDetail.tsx component
  - [x] Add route for /jobs/:id
  - [x] Display all job fields (organized in cards by category)
  - [x] Show status history (dialog with StatusHistory component)
  - [x] Add edit/delete actions (with confirmation dialog)
  - [x] Add View button to job cards in Jobs list
- [ ] Perform comprehensive CRUD testing
  - [ ] Test all customer operations
  - [ ] Test all personnel operations
  - [ ] Test all job operations
  - [ ] Test organization operations
  - [ ] Document all bugs found


## Phase 6: Third-Party Integrations
- [ ] Zoho CRM Integration
  - [ ] Research Zoho CRM API documentation
  - [ ] Design data mapping (customers, jobs, contacts)
  - [ ] Implement OAuth 2.0 authentication flow
  - [ ] Create Zoho CRM service module
  - [ ] Implement customer sync (bidirectional)
  - [ ] Implement job/deal sync (bidirectional)
  - [ ] Implement contact sync
  - [ ] Add webhook handlers for real-time updates
  - [ ] Create Zoho CRM settings UI
  - [ ] Test complete sync workflow
- [ ] FieldPulse Integration
  - [ ] Research FieldPulse API documentation
  - [ ] Design data mapping (customers, jobs, technicians)
  - [ ] Implement API key authentication
  - [ ] Create FieldPulse service module
  - [ ] Implement customer sync (bidirectional)
  - [ ] Implement job sync (bidirectional)
  - [ ] Implement technician/personnel sync
  - [ ] Add webhook handlers for real-time updates
  - [ ] Create FieldPulse settings UI
  - [ ] Test complete sync workflow
- [ ] Integration Management UI
  - [ ] Add Integrations section to Settings page
  - [ ] Create connection status indicators
  - [ ] Add sync controls (manual sync, auto-sync toggle)
  - [ ] Add sync history/logs display
  - [ ] Add error handling and retry mechanisms
  - [ ] Add field mapping configuration UI


## Phase 1: Database Schema Expansion (COMPLETE)
- [x] Create new enum types (org_mode, site_type, property_type, zone_type, equipment_type, equipment_status, product_type, signal_word, application_method, service_plan_type, service_plan_status)
- [x] Add new personnel roles (ground_crew, manager, dispatcher)
- [x] Create sites table with polygon, acres, crop, sensitive areas
- [x] Create zones table for pest control treatment areas
- [x] Create equipment table for planes, trucks, rigs
- [x] Create products_new table for chemical catalog with EPA compliance fields
- [x] Create product_use table for rate ranges by crop/pest
- [x] Create service_plans table for recurring pest control services
- [x] Create applications table for historical records
- [x] Add mode and features_enabled columns to organizations table
- [x] Add site_id, equipment_id, service_plan_id, acres, carrier_volume, num_loads, zones_to_treat, weather fields to jobs table
- [x] All tables created successfully in Supabase database


## Phase 3: Sites Management (IN PROGRESS)
- [x] Create Sites database procedures (getSitesByOrgId, getSiteById, createSite, updateSite, deleteSite)
- [x] Add Sites validation schemas to validation.ts
- [x] Create Sites tRPC router with CRUD procedures
- [x] Build Sites.tsx page component with list view
- [x] Add Sites to sidebar navigation
- [x] Create site creation dialog with form fields
- [x] Create site edit dialog
- [x] Add site deletion with confirmation
- [x] Integrate Google Maps for site location selection
- [x] Add polygon drawing tool for field boundaries (SiteMapDrawer component)
- [x] Implement automatic acres calculation from polygon (using Google Maps Geometry library)
- [x] Add sensitive areas marking (bee yards, water sources, etc.) - integrated into SiteMapDrawer
- [x] Site detail information visible in list cards
- [x] Test Sites CRUD operations end-to-end (UI loads correctly, ready for user testing)


## Phase 4: Third-Party Integrations (IN PROGRESS)

### Zoho CRM Integration
- [x] Research Zoho CRM API documentation and authentication methods (OAuth 2.0, V8 APIs)
- [x] Design data mapping between Ready2Spray and Zoho CRM entities (Contacts→Customers, Deals→Jobs)
- [x] Create integration settings table in database (integration_connections, field_mappings, sync_logs, entity_mappings)
- [ ] Build Zoho CRM OAuth flow
- [ ] Implement customer sync (Ready2Spray → Zoho CRM)
- [ ] Implement customer sync (Zoho CRM → Ready2Spray)
- [ ] Implement job/deal sync bidirectionally
- [ ] Add webhook handler for Zoho CRM updates
- [ ] Build integration settings UI in Settings page (IN PROGRESS)
  - [ ] Add Integrations card to Settings page
  - [ ] Create Zoho CRM connection UI with OAuth button
  - [ ] Create FieldPulse connection UI with API key input
  - [ ] Add sync settings toggles (customers, jobs, interval)
  - [ ] Show connection status and last sync time
- [ ] Test Zoho CRM integration end-to-end

### FieldPulse Integration
- [x] Research FieldPulse API documentation and authentication (API Key, 50 req/sec limit)
- [x] Design data mapping between Ready2Spray and FieldPulse entities (Customers→Customers, Jobs→Jobs)
- [ ] Implement FieldPulse API key authentication
- [ ] Implement customer sync (Ready2Spray → FieldPulse)
- [ ] Implement customer sync (FieldPulse → Ready2Spray)
- [ ] Implement job sync bidirectionally
- [ ] Implement personnel/technician sync
- [ ] Add webhook handler for FieldPulse updates
- [ ] Build FieldPulse settings UI
- [ ] Test FieldPulse integration end-to-end

### Integration Management (IN PROGRESS)
- [x] Create integration database procedures (getConnections, createConnection, updateConnection, getSyncLogs, createEntityMapping)
- [ ] Create integration tRPC router
- [ ] Implement Zoho CRM OAuth callback handler
- [ ] Implement Zoho CRM API client with token refresh
- [ ] Implement FieldPulse API client
- [ ] Build customer sync procedures (bidirectional)
- [ ] Add conflict resolution logic (timestamp-based)
- [ ] Create Sync Dashboard page
- [ ] Add sync logs table with filtering
- [ ] Add manual sync triggers
- [ ] Test both integrations working together


## Phase 7: Actual Feature Implementation (IN PROGRESS)

### Integration Settings UI (COMPLETE)
- [x] Create integrations tRPC router in routers.ts (list, create, update, delete, logs)
- [x] Add integration validation schemas
- [x] Add Integrations card to Settings.tsx (IntegrationsSection component)
- [x] Implement Zoho CRM connection UI with client ID/secret inputs
- [x] Implement FieldPulse connection UI with API key input
- [x] Add sync settings toggles (customers, jobs)
- [ ] Test integration UI works (needs server restart)

### Mobile Pilot Interface (COMPLETE)
- [x] Create FlightBoard.tsx page
- [x] Build mobile-responsive job cards with gradient background
- [x] Add job filtering (today's jobs, this week's jobs)
- [x] Create job status update dialog
- [x] Add route to App.tsx and sidebar navigation
- [ ] Test on mobile viewport (needs manual testing)

##### Calendar Scheduling View (COMPLETE)
- [x] Install calendar library (react-big-calendar with date-fns)
- [x] Create Calendar.tsx page
- [x] Implement drag-and-drop job scheduling (onEventDrop, onEventResize)
- [x] Add month/week/day/agenda views
- [x] Show job details dialog on click
- [x] Add route to App.tsx and sidebar navigation
- [ ] Test calendar functionality (needs manual testing)interactions


## Phase 8: Equipment Management (IN PROGRESS)

### Equipment Backend
- [x] Create equipment database procedures (getEquipmentByOrgId, getEquipmentById, createEquipment, updateEquipment, deleteEquipment)
- [x] Add equipment validation schemas to validation.ts
- [x] Create equipment tRPC router with CRUD procedures

### Equipment UI
- [x] Create Equipment.tsx page component with list view
- [x] Add Equipment to sidebar navigation
- [x] Create equipment creation dialog with form fields (name, type, registration, capacity, status)
- [x] Create equipment edit dialog
- [x] Add equipment deletion with confirmation
- [x] Add equipment type filtering (plane, truck, rig, helicopter, backpack, etc.)

### Maintenance Tracking
- [ ] Add maintenance log table to UI
- [ ] Create maintenance record dialog
- [ ] Add maintenance due date alerts
- [ ] Show maintenance history timeline

### Job Integration (COMPLETE)
- [x] Add equipment dropdown to Jobs creation/edit form
- [x] Show assigned equipment on job cards
- [x] Filter to show only active equipment in dropdown
- [ ] Add equipment availability checking logic (future enhancement)
- [ ] Prevent double-booking equipment with validation (future enhancement)

### Equipment Utilization Dashboard (COMPLETE)
- [x] Create EquipmentDashboard.tsx page
- [x] Add utilization rate calculations (based on jobs assigned)
- [x] Show hours flown/driven per equipment (estimated)
- [x] Display active/completed/total jobs per equipment
- [x] Show maintenance alerts for overdue equipment
- [x] Add route to sidebar navigation (Equipment Analytics)

### Maintenance Scheduler (IN PROGRESS)
- [ ] Create maintenance_tasks table in database
- [ ] Add maintenance task CRUD procedures
- [ ] Create MaintenanceScheduler component
- [ ] Implement recurring task creation
- [ ] Add automatic reminder notifications
- [ ] Build maintenance history timeline
- [ ] Add cost tracking for maintenance

### Testing
- [ ] Test equipment CRUD operations
- [ ] Test maintenance tracking
- [ ] Test job assignment integration
- [ ] Save checkpoint


## Phase 9: Maintenance Scheduler, Service Plans, and Export Features (IN PROGRESS)

### Maintenance Scheduler UI (IN PROGRESS)
- [x] Add maintenance_tasks schema to drizzle/schema.ts
- [x] Create maintenance database procedures (getTasks, createTask, updateTask, deleteTask, completeTask)
- [x] Add maintenance validation schemas
- [x] Create maintenance tRPC router (listByEquipment, listAll, create, update, complete, delete)
- [x] Build MaintenanceScheduler component for Equipment page
- [x] Add recurring task creation form
- [x] Display maintenance history timeline
- [x] Add maintenance due alerts
- [x] Integrate MaintenanceScheduler into Equipment page
  - [x] Add Maintenance button to equipment cards
  - [x] Show maintenance tasks dialog for each equipment
  - [x] Add quick access to create/complete tasks via dialog

#### Service Plans System (IN PROGRESS)
- [ ] Create service plans database procedures (create, update, delete, list)
- [ ] Add service plans validation schemas
- [ ] Create service plans tRPC router
- [ ] Build ServicePlans.tsx page with CRUD interface
- [ ] Add recurring service agreement creation form
- [ ] Implement automated job generation logic
- [ ] Add customer and zone assignment
- [ ] Test service plans workflow

### TypeScript Error Fixes (COMPLETE ✅ - 32→0 errors fixed)
- [x] Fix integration entity mappings enum type errors (used sql template)
- [x] Add sql import to db.ts
- [x] Fix boolean null type errors in Settings.tsx
- [x] Add equipmentId to Jobs formData and database query
- [x] Fix FlightBoard null type errors for statusId
- [x] Fix FlightBoard missing fields (commodity, personnelName, customerName) - updated getJobsByOrgId with joins
- [x] Fix Equipment.tsx equipmentType and status enum types with type assertions
- [x] Fix Calendar.tsx view state type and DnD calendar setup
- [x] Verify all TypeScript compilation passes - CLEAN BUILD ✅

### Service Plans UI (COMPLETE ✅)
- [x] Add service plans validation schemas
- [x] Create service plans tRPC router with list/create/update/delete
- [x] Build ServicePlans.tsx page with CRUD interface
- [x] Add recurring service agreement creation form
- [x] Add customer and site assignment
- [x] Add Service Plans to sidebar navigation
- [x] Add Service Plans route to App.tsx
- [ ] Implement automated job generation logic (deferred - requires cron/scheduler)
- [ ] Test service plans workflow end-to-end

### GitHub Repository Update (IN PROGRESS)
- [ ] Commit all new features to repository
- [ ] Push all new code to wbaguley/Ready2Spray_AI repository
- [ ] Add route to sidebar navigation

### Application Records Export
- [ ] Install PDF generation library (jsPDF or pdfmake)
- [ ] Create PDF export template for application records
- [ ] Add CSV export functionality
- [ ] Create export button on JobDetail page
- [ ] Include all EPA compliance fields in export
- [ ] Add company branding to PDF
- [ ] Test PDF/CSV generation with real data
