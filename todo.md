# Ready2Spray AI - Project TODO

## Phase 1: Database Schema & Infrastructure
- [x] Design and implement complete database schema (users, organizations, customers, personnel, jobs_v2, products_complete, sites, equipment, job_statuses, maps, waitlist, conversations, messages)
- [x] Set up database migrations with Drizzle ORM
- [x] Configure environment variables for Anthropic API

## Phase 2: Authentication & Core Infrastructure
- [x] Implement JWT-based authentication with role-based access control
- [x] Create protectedProcedure wrapper for authenticated routes
- [x] Set up role enum (Admin, Manager, Technician, Pilot, Sales)
- [x] Configure subdomain detection (app. prefix routing)

## Phase 3: Marketing Landing Page
- [x] Build hero section with product description
- [x] Create feature cards (Job Management, EPA Compliance, Team Coordination, AI Assistant, Audit Logging, Bulk Import/Export)
- [x] Implement waitlist signup form with email collection
- [x] Design professional gradient background (slate-900 to purple-900)
- [x] Add GTM Planetary branding
- [x] Ensure responsive design
- [x] Route setup: / on main domain, app subdomain redirects to dashboard

## Phase 4: Dashboard Layout & Navigation
- [ ] Build sidebar navigation with collapsible menu
- [ ] Create user profile dropdown with logout
- [ ] Implement role-based access control UI
- [ ] Add responsive mobile menu
- [ ] Set up protected routes requiring authentication

## Phase 5: Jobs Management System
- [ ] Create/edit/delete spray jobs functionality
- [ ] Link customers, sites, personnel, equipment, products to jobs
- [ ] Implement custom status workflow (configurable statuses)
- [ ] Add job details fields (date, time, acres, application rate, weather conditions)
- [ ] Build job history and audit trail
- [ ] Implement bulk import/export functionality

## Phase 6: Chemical Products Database
- [ ] Build AI-powered EPA label extraction from screenshots/PDFs
- [ ] Extract product name, EPA registration number, REI, PHI, application rates, active ingredients
- [ ] Create product search and filtering
- [ ] Link products to jobs
- [ ] Store product images/labels

## Phase 7: Customer Management
- [ ] Create customer profiles with contact information
- [ ] Link customers to sites and jobs
- [ ] Add customer history and notes

## Phase 8: Personnel Management
- [ ] Build team member profiles (pilots, technicians, managers)
- [ ] Implement certification tracking
- [ ] Add role assignment
- [ ] Link personnel to jobs

## Phase 9: Equipment Tracking
- [ ] Create aircraft and spray equipment inventory
- [ ] Add maintenance schedules
- [ ] Implement equipment assignment to jobs

## Phase 10: Sites/Locations Management
- [ ] Add GPS coordinates and boundaries
- [ ] Integrate Google Maps with location picker
- [ ] Support KML/GPX/GeoJSON file upload
- [ ] Implement polygon drawing for site boundaries
- [ ] Link sites to customers and jobs

## Phase 11: AI Chat Assistant
- [ ] Build floating chat widget (bottom-right corner)
- [ ] Implement context-aware help for Ready2Spray features
- [ ] Add streaming responses using Anthropic Claude
- [ ] Store conversation history per user

## Phase 12: Settings & Configuration
- [ ] Create organization profile setup
- [ ] Build custom job status management
- [ ] Add user preferences
- [ ] Implement branding customization

## Phase 13: Testing & Deployment
- [ ] Test all features end-to-end
- [ ] Verify responsive design on mobile/tablet/desktop
- [ ] Test AI chat responses
- [ ] Verify database operations efficiency
- [ ] Test authentication flow
- [ ] Verify role-based access enforcement
- [ ] Test marketing page conversion
- [ ] Create deployment checkpoint


## QA & Testing
- [x] Write comprehensive test suite for all routers
- [x] Fix create mutations to return created records
- [x] Fix database functions to properly return inserted data
- [x] Run full test suite - all 15 tests passing

## Bug Fixes
- [x] Fix Sign In button on marketing page to redirect to login URL
- [x] Fix routing to redirect authenticated users from marketing page to dashboard
- [x] Fix DashboardLayout sidebar to show proper navigation menu (Jobs, Customers, Personnel, Equipment, Sites, Products, Settings)

## Repository Migration
- [ ] Copy all pages from original repo (27 pages)
- [ ] Copy all custom components (FloatingChatWidget, KMLDrawingManager, LocationPicker, MaintenanceScheduler, AgrianProductLookup, etc.)
- [ ] Copy server routers and database functions
- [ ] Copy all UI components
- [ ] Update dependencies to match original repo
- [ ] Test all features after migration

## AI Widget Improvements
- [x] Fix AI widget message formatting (remove timestamp from user messages)
- [x] Add conversation history button to view past conversations
- [x] Add ability to delete conversations
- [x] Improve widget layout and styling

## API Key Management System
- [x] Create API keys table in database (id, name, key_hash, permissions, created_at, last_used_at, expires_at)
- [x] Build API key generation with secure hashing (bcrypt)
- [x] Create API key management UI page (list, create, delete)
- [x] Implement API key authentication middleware
- [x] Add rate limiting per API key
- [x] Add usage tracking and analytics

## Integration API Endpoints
- [x] Create /api/webhook/jobs endpoint (create, update, get, list)
- [x] Create /api/webhook/customers endpoint (create, update, get, list)
- [x] Create /api/webhook/sites endpoint (create, update, get, list)
- [x] Create /api/webhook/personnel endpoint (create, update, get, list)
- [x] Create /api/webhook/equipment endpoint (create, update, get, list)
- [x] Add comprehensive validation and error handling
- [ ] Add API documentation page

## Job Sharing Feature
- [x] Create job_shares table (id, job_id, share_token, expires_at, view_count, created_by)
- [x] Add "Share Job" button to job detail page
- [x] Create public job view page (/share/:token)
- [x] Implement file download from shared job page
- [ ] Add share management (list, revoke shares)
- [x] Track share access analytics

## Bug Fixes - Authentication
- [x] Fix login redirect - users are redirected back to marketing page instead of dashboard after authentication
- [x] Add Sign In button to marketing page header
- [x] Fix login loop - accessing /dashboard directly causes infinite redirect to login page instead of showing dashboard after authentication
- [x] Fix mobile responsive layout on marketing page - header buttons overlapping with content
- [ ] Fix persistent login loop issue - auth refresh not working properly on mobile
- [x] Move API Keys management into Settings page (remove separate API Keys page)
- [x] Integrate API Keys as a tab/section within existing Settings structure

## User Management Enhancements
- [x] Add phone number field to users table
- [x] Add license number field to users table
- [x] Add commission checkbox field to users table
- [x] Update UserManagement UI to include new fields
- [x] Update user creation/edit forms with new fields
- [x] Add validation for phone numbers and license numbers

## Email Functionality
- [x] Review and complete EmailTest page functionality
- [x] Ensure email sending works properly
- [x] Add email templates if needed
- [ ] Configure Mailgun credentials (MAILGUN_API_KEY, MAILGUN_DOMAIN, FROM_EMAIL)
- [ ] Test email delivery with real credentials

## OAuth Login Error Fix
- [x] Investigate OAuth error from server logs
- [x] Fix database query error (new user fields causing authentication failure)
- [x] Apply database migration for phone, license_number, commission fields
- [x] Verify override user testing capability is maintained
- [x] Test complete login flow

## Database Migration Issues
- [x] Apply complete database migration to create all missing tables
- [x] Verify sites table exists with correct schema
- [x] Verify service_plans table exists with correct schema
- [x] Test service plans page queries

## OAuth Callback Error After Supabase Connection
- [x] Investigate OAuth callback error in server logs
- [x] Fix database password authentication issue
- [x] Configure R2S_Supabase secret with correct password
- [x] Verify users table schema matches code expectations
- [x] Test complete login flow

## Jobs Table Query Error
- [ ] Find all database queries referencing 'jobs' table
- [ ] Update queries to use 'jobs_v2' table instead
- [ ] Verify dashboard pages load without errors
- [ ] Test job listing and detail pages

## Dashboard Routing Issue
- [x] Fix dashboard route to show actual dashboard instead of marketing page
- [ ] Verify authenticated users see dashboard content
- [ ] Test all dashboard navigation links work correctly

## Dashboard Null Reference Error
- [x] Fix "Cannot read properties of null (reading 'replace')" error in Dashboard component
- [x] Add null checks for data before calling string methods

## Chat Widget Visibility Issue
- [x] Fix React hooks error caused by early return in FloatingChatWidget
- [x] Move conditional check after all hooks are called
- [x] Hide floating chat widget on /chat page
- [x] Show chat widget on all other pages

## Chat Widget UI Improvements
- [x] Fix missing input box at bottom of widget
- [x] Fix header icon alignment (minimize and close buttons)
- [x] Add proper scrolling to message area
- [ ] Make history view take full widget space
- [x] Return to conversation view when clicking into a past conversation

## AI Chat Page Scrolling Issue
- [x] Add proper scrolling to AI Chat page message area
- [x] Ensure input box stays visible at bottom
- [x] Fix message container to use proper flex layout

## Stripe Integration & Multi-Tenant Signup
- [x] Add Stripe feature to project using webdev_add_feature
- [x] Create organizations table with Stripe customer/subscription IDs
- [x] Link users to organizations with role-based access
- [ ] Build signup flow that creates organization + Stripe customer
- [ ] Implement subscription status checks to protect routes
- [ ] Build invitation system for users to join organizations
- [ ] Test complete signup and billing flow
- [ ] Prevent users from creating multiple organizations with same email

- [x] Build signup flow that creates organization + Stripe customer
- [x] Create Stripe router with subscription endpoints
- [x] Create Stripe webhook handler for subscription events
- [x] Register webhook endpoint with raw body parser
- [x] Create organization setup page UI
- [x] Create plan selection page UI with pricing tiers
- [x] Add subscription status hook for frontend
- [x] Integrate subscription check into DashboardLayout

## Landing Page Updates
- [x] Replace "Join Waitlist" buttons with "Sign Up" buttons
- [x] Update button links to point to /signup/organization
- [ ] Test signup flow from landing page

## Invitation-Only Signup
- [x] Add INVITATION_CODE environment variable
- [x] Add invitation code validation to createOrganization endpoint
- [x] Add invitation code input field to OrganizationSetup page
- [x] Owner account bypasses invitation code requirement
- [x] Test invitation code validation (correct and incorrect codes)

## Owner Login Redirect Issue
- [x] Check if owner has organization in database
- [x] Fix redirect logic to send owner to dashboard even without organization
- [x] Auto-create organization for owner on first login
- [x] Test owner login flow

## Email Notifications & Team Invitations
- [x] Send owner notification when new organization signs up
- [x] Create team invitation system with unique invite tokens
- [x] Send email to invited team members with invite link
- [x] Notify owner when team member accepts invitation
- [x] Build Team Management page in dashboard
- [x] Add "Invite Team Member" form with email and role selection
- [x] Display pending invitations list
- [x] Add "Resend Invite" button for pending invitations
- [x] Add "Revoke Invite" button to cancel invitations
- [x] Create invitation acceptance page for new team members
- [ ] Test email notifications end-to-end

## Stripe Checkout and Billing Portal
- [ ] Implement Stripe Checkout session creation
- [ ] Create a webhook handler for Stripe events
- [ ] Implement the customer billing portal
- [ ] Add a payment history of payments page
-on UI for purchasing AI credits purchase
- [ ] Create a page to display payment history
- [ ] payment history
- [ ] payment history

- [x] Fix signup flow routing - "Continue to Plan Selection" should go to Stripe plan page, not OAuth login

- [ ] Fix Stripe API key validation error - "Invalid prod secret key: must start with 'sk_live_'" even though live keys are configured

- [x] Fix TypeScript error in SharedJob.tsx - Property 'notes' does not exist
- [x] Fix TypeScript error in routers.ts - Property 'statusId' should be 'status'
- [x] Fix all database queries to use 'jobs' table instead of 'jobsV2'
- [x] Fix field name mismatches (status→statusId, location→locationAddress, personnelId→assignedPersonnelId)
- [x] Resolve all 45 TypeScript compilation errors

## TypeScript Error Fixes - Round 2
- [x] Fix getJobsByOrgId query to include all job fields (notes, statusId, chemicalProduct, applicationRate, etc.)
- [x] Fix field name mismatches in frontend components (location vs locationAddress, latitude vs locationLat)
- [x] Fix status vs statusId inconsistencies across all components
- [ ] Fix InsertJob type import errors
- [x] Fix JobDetail.tsx to use correct field names
- [ ] Fix FlightBoard.tsx to use correct field names
- [ ] Resolve all 52 remaining TypeScript errors
- [x] Push code to GitHub repository
