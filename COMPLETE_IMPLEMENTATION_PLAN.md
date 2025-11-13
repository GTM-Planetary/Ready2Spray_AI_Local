# Ready2Spray AI - Complete Implementation Plan
## "Application Canvas" Platform - Full Vision

**Plan Created:** January 12, 2025  
**Current Version:** ceea1c43  
**Target:** Complete dual-mode platform (Crop Dusting + Residential Pest Control)

---

## Overview

This plan outlines the complete implementation of the "Application Canvas" vision: a unified platform serving both crop dusting/aerial applicators and residential pest control companies with role-based mobile interfaces, advanced scheduling, product catalog with label guardrails, and third-party integrations.

**Estimated Timeline:** 8-12 weeks for complete platform  
**Estimated Effort:** ~400-500 hours of development

---

## Phase 1: Database Schema Expansion (Week 1)

### Objective
Expand database schema to support all core objects from the vision: Sites, Equipment, Products, ProductUse, Applications, ServicePlans, and Zones.

### Tasks

#### 1.1 Sites Table
Create sites table for fields (ag) and properties (pest control):

```sql
CREATE TABLE sites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  org_id INT NOT NULL,
  customer_id INT,
  name VARCHAR(255) NOT NULL,
  site_type ENUM('field', 'orchard', 'vineyard', 'pivot', 'property', 'commercial_building') NOT NULL,
  
  -- Location
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  polygon JSON, -- GeoJSON polygon for boundaries
  center_lat DECIMAL(10, 8),
  center_lng DECIMAL(11, 8),
  acres DECIMAL(10, 2),
  
  -- Ag-specific fields
  crop VARCHAR(100),
  variety VARCHAR(100),
  growth_stage VARCHAR(50),
  
  -- Sensitive areas nearby
  sensitive_areas JSON, -- [{type: 'bee_yard', distance: 500, notes: '...'}]
  
  -- Pest control-specific fields
  property_type ENUM('residential', 'commercial', 'multi_family', 'industrial'),
  units INT DEFAULT 1,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (org_id) REFERENCES organizations(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);
```

#### 1.2 Zones Table (for Pest Control)
Create zones table for interior/exterior treatment areas:

```sql
CREATE TABLE zones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  site_id INT NOT NULL,
  name VARCHAR(100) NOT NULL, -- 'Interior', 'Exterior', 'Yard', 'Garage', 'Attic'
  zone_type ENUM('interior', 'exterior', 'yard', 'garage', 'attic', 'basement', 'crawl_space', 'perimeter', 'custom') NOT NULL,
  description TEXT,
  special_instructions TEXT, -- 'Pets present', 'Children', 'Avoid kitchen'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
);
```

#### 1.3 Equipment Table
Create equipment table for planes, trucks, rigs, backpacks:

```sql
CREATE TABLE equipment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  org_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  equipment_type ENUM('plane', 'helicopter', 'ground_rig', 'truck', 'backpack', 'hand_sprayer', 'ulv', 'other') NOT NULL,
  
  -- Identification
  tail_number VARCHAR(50), -- for aircraft
  license_plate VARCHAR(50), -- for vehicles
  serial_number VARCHAR(100),
  
  -- Specifications
  tank_capacity DECIMAL(10, 2), -- gallons
  swath_width DECIMAL(10, 2), -- feet
  max_speed DECIMAL(10, 2), -- mph
  
  -- Status
  status ENUM('active', 'maintenance', 'inactive') DEFAULT 'active',
  
  -- Maintenance
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  maintenance_notes TEXT,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (org_id) REFERENCES organizations(id)
);
```

#### 1.4 Products Table
Create products table for chemical catalog:

```sql
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  epa_reg_number VARCHAR(50) NOT NULL UNIQUE,
  
  -- Basic info
  brand_name VARCHAR(255) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  manufacturer VARCHAR(255),
  
  -- Active ingredients
  active_ingredients JSON, -- [{name: 'Glyphosate', percentage: 41.0}]
  
  -- Classification
  product_type ENUM('herbicide', 'insecticide', 'fungicide', 'rodenticide', 'adjuvant', 'other') NOT NULL,
  signal_word ENUM('caution', 'warning', 'danger') NOT NULL,
  is_rup BOOLEAN DEFAULT FALSE, -- Restricted Use Pesticide
  
  -- Use site flags
  indoor_allowed BOOLEAN DEFAULT FALSE,
  outdoor_allowed BOOLEAN DEFAULT TRUE,
  aerial_allowed BOOLEAN DEFAULT FALSE,
  ground_boom_allowed BOOLEAN DEFAULT TRUE,
  backpack_allowed BOOLEAN DEFAULT FALSE,
  hand_wand_allowed BOOLEAN DEFAULT FALSE,
  ulv_allowed BOOLEAN DEFAULT FALSE,
  chemigation_allowed BOOLEAN DEFAULT FALSE,
  
  -- Use site categories
  use_sites JSON, -- ['corn', 'soy', 'wheat', 'residential_indoor', 'residential_outdoor']
  
  -- Label references
  label_pdf_url TEXT,
  sds_url TEXT,
  manufacturer_url TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 1.5 ProductUse Table (Rate Ranges)
Create product_use table for rate limits by crop/pest:

```sql
CREATE TABLE product_use (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  
  -- Use context
  crop VARCHAR(100), -- 'Corn', 'Soy', 'Wheat', NULL for structural
  pest VARCHAR(100), -- 'Aphids', 'Weeds', 'Ants', 'Termites'
  site_category VARCHAR(100), -- 'Agricultural', 'Residential Indoor', 'Residential Outdoor'
  
  -- Rate limits
  min_rate DECIMAL(10, 4),
  max_rate DECIMAL(10, 4),
  rate_unit VARCHAR(50), -- 'oz/acre', 'lb/acre', 'oz/1000sqft', 'ml/gallon'
  
  -- Application limits
  max_applications_per_season INT,
  max_total_per_season DECIMAL(10, 4),
  max_total_unit VARCHAR(50),
  
  -- Carrier volume
  min_carrier_volume DECIMAL(10, 2),
  max_carrier_volume DECIMAL(10, 2),
  carrier_unit VARCHAR(50), -- 'GPA' (gallons per acre), 'gallons'
  
  -- Intervals
  phi_days INT, -- Pre-harvest interval
  rei_hours INT, -- Restricted-entry interval
  reentry_conditions TEXT, -- 'Until sprays have dried', 'After ventilation'
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

#### 1.6 Applications Table
Create applications table for historical records:

```sql
CREATE TABLE applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  org_id INT NOT NULL,
  job_id INT NOT NULL,
  site_id INT,
  customer_id INT,
  
  -- Personnel
  applicator_id INT, -- personnel who performed application
  supervisor_id INT,
  
  -- Equipment
  equipment_id INT,
  
  -- Application details
  application_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  
  -- Products applied
  products_applied JSON, -- [{product_id, epa_reg_number, amount, unit, rate, carrier_volume}]
  
  -- Area treated
  acres_treated DECIMAL(10, 2),
  area_unit VARCHAR(20) DEFAULT 'acres',
  
  -- Method
  application_method ENUM('aerial', 'ground_boom', 'backpack', 'hand_wand', 'ulv', 'chemigation', 'other') NOT NULL,
  
  -- Conditions
  temperature_f DECIMAL(5, 2),
  wind_speed_mph DECIMAL(5, 2),
  wind_direction VARCHAR(10),
  humidity_percent DECIMAL(5, 2),
  weather_conditions VARCHAR(255),
  
  -- Target
  target_pest VARCHAR(255),
  crop VARCHAR(100),
  
  -- Compliance
  phi_date DATE, -- Pre-harvest interval end date
  rei_datetime TIMESTAMP, -- Restricted-entry interval end datetime
  
  -- Record keeping
  completed_by_id INT, -- user who marked job complete
  verified_by_id INT,
  verification_date DATE,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (org_id) REFERENCES organizations(id),
  FOREIGN KEY (job_id) REFERENCES jobs(id),
  FOREIGN KEY (site_id) REFERENCES sites(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (applicator_id) REFERENCES personnel(id),
  FOREIGN KEY (equipment_id) REFERENCES equipment(id)
);
```

#### 1.7 Service Plans Table (Pest Control)
Create service_plans table for recurring services:

```sql
CREATE TABLE service_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  org_id INT NOT NULL,
  customer_id INT NOT NULL,
  site_id INT,
  
  -- Plan details
  plan_name VARCHAR(255) NOT NULL,
  plan_type ENUM('monthly', 'quarterly', 'bi_monthly', 'annual', 'one_off') NOT NULL,
  
  -- Scheduling
  start_date DATE NOT NULL,
  end_date DATE,
  next_service_date DATE,
  
  -- Service details
  default_zones JSON, -- [zone_id1, zone_id2]
  default_products JSON, -- [{product_id, rate}]
  default_target_pests JSON, -- ['Ants', 'Spiders', 'Roaches']
  
  -- Pricing
  price_per_service DECIMAL(10, 2),
  currency VARCHAR(10) DEFAULT 'USD',
  
  -- Status
  status ENUM('active', 'paused', 'cancelled', 'completed') DEFAULT 'active',
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (org_id) REFERENCES organizations(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (site_id) REFERENCES sites(id)
);
```

#### 1.8 Update Jobs Table
Add new fields to existing jobs table:

```sql
ALTER TABLE jobs
  ADD COLUMN site_id INT AFTER customer_id,
  ADD COLUMN equipment_id INT AFTER assigned_personnel_id,
  ADD COLUMN acres DECIMAL(10, 2),
  ADD COLUMN carrier_volume DECIMAL(10, 2),
  ADD COLUMN carrier_unit VARCHAR(50) DEFAULT 'GPA',
  ADD COLUMN num_loads INT,
  ADD COLUMN service_plan_id INT,
  ADD COLUMN zones_to_treat JSON, -- [zone_id1, zone_id2]
  ADD COLUMN weather_conditions VARCHAR(255),
  ADD COLUMN temperature_f DECIMAL(5, 2),
  ADD COLUMN wind_speed_mph DECIMAL(5, 2),
  ADD COLUMN wind_direction VARCHAR(10),
  ADD FOREIGN KEY (site_id) REFERENCES sites(id),
  ADD FOREIGN KEY (equipment_id) REFERENCES equipment(id),
  ADD FOREIGN KEY (service_plan_id) REFERENCES service_plans(id);
```

#### 1.9 Update Organizations Table
Add mode selection to organizations:

```sql
ALTER TABLE organizations
  ADD COLUMN mode ENUM('ag_aerial', 'residential_pest', 'both') DEFAULT 'ag_aerial',
  ADD COLUMN features_enabled JSON; -- ['service_plans', 'zones', 'load_sheets', 'flight_board']
```

### Deliverables
- ✅ All new tables created in database
- ✅ Migration scripts tested
- ✅ Updated Drizzle schema.ts with all new tables
- ✅ Type exports for all new entities

---

## Phase 2: Organization Mode & UI Adaptation (Week 1-2)

### Objective
Implement organization mode selection and adapt UI based on mode (Ag Aerial vs Residential Pest).

### Tasks

#### 2.1 Organization Mode Selection
- Add mode field to organization settings
- Create mode selection UI in Settings page
- Add "features enabled" checkboxes for optional features
- Save mode and features to database

#### 2.2 UI Adaptation System
- Create `useOrgMode()` hook to access current mode
- Create `<ModeAware>` component that shows/hides content based on mode
- Update terminology throughout app:
  - Ag mode: "Fields", "Acres", "Flight Board", "Load Sheet"
  - Pest mode: "Properties", "Square Feet", "Route Board", "Service Plans"

#### 2.3 Navigation Updates
- Show/hide menu items based on mode:
  - Ag mode: Show "Flight Board", "Load Sheets", hide "Service Plans", "Zones"
  - Pest mode: Show "Service Plans", "Routes", hide "Flight Board", "Load Sheets"
  - Both modes: Show "Sites", "Equipment", "Products"

### Deliverables
- ✅ Mode selection UI in Settings
- ✅ `useOrgMode()` hook
- ✅ Conditional navigation menu
- ✅ Mode-aware terminology throughout app

---

## Phase 3: Sites Management & Map Integration (Week 2-3)

### Objective
Build Sites management with polygon boundaries, map integration, and acres calculation.

### Tasks

#### 3.1 Sites CRUD Interface
- Create Sites page (`/sites`)
- Add Sites to navigation menu
- Build site creation form:
  - Name, type (field/orchard/property)
  - Customer assignment
  - Address fields
  - Crop/variety (ag mode)
  - Property type/units (pest mode)
  - Notes
- Build site list view with map thumbnails
- Build site detail page showing:
  - Full site info
  - Map with polygon boundary
  - Application history
  - Associated jobs
  - Sensitive areas (ag mode)
  - Zones (pest mode)

#### 3.2 Polygon Drawing & Import
- Integrate Google Maps Drawing Manager
- Add "Draw Boundary" button on site creation/edit
- Allow polygon drawing on map
- Calculate acres automatically from polygon
- Import KML/GPX/GeoJSON from Maps manager
- Convert imported maps to Sites automatically

#### 3.3 Zones Management (Pest Mode)
- Add Zones section to site detail page
- Create zone creation form (name, type, instructions)
- Display zones as list with edit/delete actions
- Allow zone selection when creating pest control jobs

#### 3.4 Sensitive Areas (Ag Mode)
- Add Sensitive Areas section to site detail page
- Create sensitive area markers on map:
  - Type (bee yard, organic field, water, house)
  - Distance from field
  - Notes
- Display sensitive areas on job detail when site is assigned

#### 3.5 Connect Sites to Jobs
- Update job creation form:
  - Replace "location address" text field with site dropdown
  - Auto-populate address, acres, crop from selected site
  - Show site boundary on job detail page
- Update job detail page to show site info and map

### Deliverables
- ✅ Sites CRUD interface
- ✅ Polygon drawing and import
- ✅ Acres calculation
- ✅ Zones management (pest mode)
- ✅ Sensitive areas (ag mode)
- ✅ Sites connected to jobs

---

## Phase 4: Product Catalog & Label Guardrails (Week 3-4)

### Objective
Build product catalog with label guardrails and real-time validation against label limits.

### Tasks

#### 4.1 Products CRUD Interface
- Create Products page (`/products`)
- Add Products to navigation menu
- Build product creation form:
  - EPA reg number (required, unique)
  - Brand/product name, manufacturer
  - Active ingredients (repeatable fields)
  - Product type, signal word, RUP flag
  - Use site flags (indoor/outdoor/aerial/etc.)
  - Use sites (multi-select)
  - Label PDF URL, SDS URL
- Build product list view with search/filter
- Build product detail page showing:
  - Full product info
  - Use instructions
  - Rate tables (ProductUse records)
  - "View Label PDF" button
  - Jobs using this product

#### 4.2 ProductUse (Rate Tables)
- Add Rate Tables section to product detail page
- Create rate table entry form:
  - Crop, pest, site category
  - Min/max rate with unit
  - Max applications per season
  - Carrier volume range
  - PHI, REI
  - Reentry conditions
- Display rate tables as expandable rows
- Allow edit/delete of rate entries

#### 4.3 EPA Product Lookup Integration
- Enhance Agrian widget integration
- Add "Import from EPA" button on product creation
- Auto-populate product fields from Agrian selection
- Parse rate tables from Agrian data (if available)

#### 4.4 Label Guardrail Validation
- Implement real-time validation on job form:
  - When product + crop + pest selected, fetch ProductUse record
  - Validate application rate against min/max
  - Show warning if rate outside limits
  - Validate application method against product flags
  - Block if method not allowed (e.g., aerial for indoor-only product)
  - Show PHI/REI info
  - Calculate PHI date from scheduled date
  - Warn if PHI conflicts with harvest date (future enhancement)
- Add validation summary to job detail page
- Display warnings/errors prominently

#### 4.5 Product Selection in Jobs
- Update job form product field:
  - Change from free text to product dropdown
  - Show EPA reg number, brand name, signal word
  - Filter products by:
    - Application method (aerial/ground/etc.)
    - Use site (ag vs residential)
    - Indoor/outdoor
- Allow multiple products per job
- Store products as JSON array with rates

### Deliverables
- ✅ Products CRUD interface
- ✅ ProductUse rate tables
- ✅ EPA product lookup integration
- ✅ Real-time label validation on job form
- ✅ Product dropdown in job form

---

## Phase 5: Mobile Field Interfaces (Week 4-5)

### Objective
Build mobile-optimized interfaces for pilots, ground crew, and pest techs.

### Tasks

#### 5.1 Role-Based Dashboard Routing
- Detect user role on login
- Route to appropriate dashboard:
  - Admin/Manager/Dispatcher → Full dashboard
  - Pilot → Flight board
  - Ground crew → Load sheet view
  - Pest tech → Route board
- Add "Switch View" button for multi-role users

#### 5.2 Pilot Flight Board
- Create `/flight-board` page
- Mobile-first design with large touch targets
- Show today's jobs assigned to current pilot
- Job card displays:
  - Site name and map thumbnail
  - Crop, target pest
  - Products and target rate
  - Acres, carrier volume (GPA)
  - Buffer zones, sensitive areas
  - Weather conditions
  - Notes
- Job actions:
  - "View Map" (full-screen site boundary)
  - "Start Job" → mark in progress
  - "Complete Job" → mark done, capture actual data
- Job completion form:
  - Actual start/end time
  - Actual acres treated
  - Actual products used (amounts)
  - Weather conditions (temp, wind speed/direction)
  - Notes
- Offline capability (cache today's jobs)

#### 5.3 Ground Crew Load Sheet View
- Create `/load-sheets` page
- Mobile-first design
- Show today's jobs assigned to current user
- Load sheet displays:
  - Job title, site name
  - Products to mix
  - Amount per load
  - Number of loads
  - Mixing instructions
  - Safety notes (signal word, PPE)
- Load tracking:
  - "Load 1 Ready", "Load 2 Ready", etc.
  - Capture who loaded (current user)
  - Timestamp each load
  - "Plane Ready" button when all loads complete
- Simple workflow: tap buttons, minimal typing

#### 5.4 Pest Tech Route Board
- Create `/routes` page
- Mobile-first design
- Show today's jobs assigned to current tech
- Jobs ordered by route sequence
- Job card displays:
  - Customer name, address
  - Property type
  - Zones to treat (checkboxes)
  - Planned products and rates
  - Service plan type (monthly/quarterly)
  - Special instructions (pets, kids, access notes)
- Job actions:
  - "Navigate" (open Google Maps)
  - "Start Service" → mark in progress
  - "Complete Service" → mark done, capture data
- Service completion form:
  - Zones treated (checkboxes)
  - Actual products used (amounts)
  - Conditions (temp, weather)
  - Photos (before/after)
  - Customer signature (optional)
  - Notes
- Generate customer-facing summary on completion

#### 5.5 Offline Support
- Use service workers for offline capability
- Cache today's jobs on page load
- Store completed job data in IndexedDB
- Sync when connection restored
- Show "Offline Mode" indicator

### Deliverables
- ✅ Role-based dashboard routing
- ✅ Pilot flight board (mobile-optimized)
- ✅ Ground crew load sheet view (mobile-optimized)
- ✅ Pest tech route board (mobile-optimized)
- ✅ Offline support for field use

---

## Phase 6: Calendar Scheduling & Resource Management (Week 5-6)

### Objective
Build calendar/schedule view with drag-and-drop, resource assignment, and conflict detection.

### Tasks

#### 6.1 Calendar View Component
- Install calendar library (FullCalendar or react-big-calendar)
- Create `/schedule` page
- Add Schedule to navigation menu
- Display jobs as calendar events:
  - Color-coded by status
  - Show job title, customer, site
  - Click event to open job detail
- View modes: Day, Week, Month
- Filter by:
  - Personnel (show only jobs for selected pilot/tech)
  - Customer
  - Status
  - Equipment

#### 6.2 Drag-and-Drop Scheduling
- Enable drag-and-drop on calendar
- Drag job to new date/time → update scheduled_start/end
- Drag to resize → adjust duration
- Show confirmation dialog before saving
- Validate:
  - Personnel availability (not double-booked)
  - Equipment availability
  - Weather constraints (future enhancement)

#### 6.3 Resource Management View
- Add "Resources" tab to schedule page
- Show personnel schedule (Gantt-style):
  - Row per person
  - Jobs displayed as blocks on timeline
  - Identify conflicts (overlapping jobs)
- Show equipment schedule:
  - Row per plane/truck/rig
  - Jobs using that equipment
  - Identify conflicts
- Click conflict to resolve (reassign personnel/equipment)

#### 6.4 Quick Job Creation from Calendar
- Double-click calendar date → open quick job form
- Pre-populate scheduled date from clicked date
- Minimal fields: customer, site, personnel
- Save and show on calendar immediately

#### 6.5 Schedule Optimization (Future Enhancement)
- Add "Optimize Route" button for pest tech schedules
- Reorder jobs by proximity to minimize drive time
- Add "Suggest Best Time" for new jobs based on:
  - Personnel availability
  - Weather forecast
  - Customer preferences

### Deliverables
- ✅ Calendar view with day/week/month modes
- ✅ Drag-and-drop job scheduling
- ✅ Resource management view (personnel, equipment)
- ✅ Conflict detection and resolution
- ✅ Quick job creation from calendar

---

## Phase 7: Residential Pest Control Features (Week 6-7)

### Objective
Add pest control-specific features: service plans, recurring job generation, appointment reminders, and customer-facing summaries.

### Tasks

#### 7.1 Service Plans CRUD
- Create Service Plans page (`/service-plans`)
- Add to navigation menu (pest mode only)
- Build service plan creation form:
  - Customer, site
  - Plan name, type (monthly/quarterly/etc.)
  - Start date, end date
  - Default zones to treat
  - Default products and rates
  - Default target pests
  - Price per service
  - Notes
- Build service plan list view
- Build service plan detail page showing:
  - Full plan info
  - Upcoming jobs (generated from plan)
  - Completed jobs history
  - Customer info
  - Site/zones info

#### 7.2 Recurring Job Generation
- Create background job scheduler (cron or similar)
- Generate jobs automatically from active service plans:
  - Monthly plans: generate job 1 week before next service date
  - Quarterly plans: generate job 2 weeks before
  - Set scheduled_start to next_service_date
  - Assign default tech (if specified in plan)
  - Pre-populate zones, products, pests from plan
- Update service_plan.next_service_date after job completion
- Mark plan as "completed" when end_date reached

#### 7.3 Appointment Reminders
- Add appointment reminder settings to service plans
- Send reminders via:
  - Email (using built-in notification system)
  - SMS (future enhancement with Twilio)
- Reminder timing options:
  - 1 day before
  - 2 hours before
  - Custom
- Reminder content:
  - Service date/time
  - Tech name
  - Zones to be treated
  - Reentry instructions
  - Contact info

#### 7.4 Customer-Facing Service Summaries
- Generate PDF summary after job completion:
  - Customer name, address
  - Service date/time
  - Tech name
  - Zones treated
  - Products applied (brand names, EPA reg numbers)
  - Amounts used
  - Target pests
  - Reentry instructions (REI or "until dry")
  - Next service date (if recurring plan)
  - Company contact info
- Email summary to customer automatically
- Add "View Summary" button on job detail page
- Store summaries in S3

#### 7.5 Customer Portal (Future Enhancement)
- Create public-facing customer portal
- Customers can:
  - View service history
  - Download past summaries
  - Request additional service
  - Update contact info
  - Manage service plan (pause, cancel)
- Login via email link (magic link, no password)

### Deliverables
- ✅ Service plans CRUD interface
- ✅ Recurring job generation (automated)
- ✅ Appointment reminders (email)
- ✅ Customer-facing service summaries (PDF)
- ✅ Email delivery of summaries

---

## Phase 8: Zoho CRM & FieldPulse Integrations (Week 7-8)

### Objective
Implement bidirectional sync with Zoho CRM and FieldPulse for customers, jobs, and personnel.

### Tasks

#### 8.1 Zoho CRM Integration Architecture
- Research Zoho CRM API v2.1/v8
- Design data mapping:
  - Zoho Accounts → Ready2Spray Customers
  - Zoho Contacts → Customer contact persons (store in customers.notes or separate table)
  - Zoho Deals → Ready2Spray Jobs
  - Zoho Products → Ready2Spray Products (optional)
- Create integration settings UI in Settings page:
  - OAuth 2.0 connection flow
  - Data center selection (US, EU, etc.)
  - Field mapping configuration
  - Sync direction (one-way or bidirectional)
  - Auto-sync toggle

#### 8.2 Zoho CRM OAuth Implementation
- Implement OAuth 2.0 authorization code flow
- Store access token and refresh token in database (encrypted)
- Handle token refresh automatically
- Create `/api/integrations/zoho/callback` endpoint
- Create `/api/integrations/zoho/connect` endpoint

#### 8.3 Zoho CRM Sync Service
- Create `server/integrations/zoho.ts` service module
- Implement sync functions:
  - `syncAccountsToCustomers()` - pull Zoho Accounts → create/update Customers
  - `syncCustomersToAccounts()` - push Customers → create/update Zoho Accounts
  - `syncDealsToJobs()` - pull Zoho Deals → create/update Jobs
  - `syncJobsToDeals()` - push Jobs → create/update Zoho Deals
- Handle field mapping (configurable)
- Handle conflicts (last-write-wins or manual resolution)
- Log sync activity

#### 8.4 Zoho CRM Webhooks
- Create webhook endpoints:
  - `/api/integrations/zoho/webhooks/account` - Zoho Account created/updated
  - `/api/integrations/zoho/webhooks/deal` - Zoho Deal created/updated
- Verify webhook signatures
- Process webhook events in real-time:
  - Create/update corresponding Customer or Job
  - Log event

#### 8.5 FieldPulse Integration Architecture
- Research FieldPulse API
- Design data mapping:
  - FieldPulse Customers → Ready2Spray Customers
  - FieldPulse Jobs → Ready2Spray Jobs
  - FieldPulse Technicians → Ready2Spray Personnel
- Create integration settings UI in Settings page:
  - API key authentication
  - Field mapping configuration
  - Sync direction
  - Auto-sync toggle

#### 8.6 FieldPulse Sync Service
- Create `server/integrations/fieldpulse.ts` service module
- Implement sync functions:
  - `syncCustomers()` - bidirectional
  - `syncJobs()` - bidirectional
  - `syncTechnicians()` - pull only (FieldPulse → Ready2Spray)
- Handle field mapping
- Handle conflicts
- Log sync activity

#### 8.7 FieldPulse Webhooks
- Create webhook endpoints:
  - `/api/integrations/fieldpulse/webhooks/customer`
  - `/api/integrations/fieldpulse/webhooks/job`
  - `/api/integrations/fieldpulse/webhooks/technician`
- Process webhook events in real-time

#### 8.8 Integration Management UI
- Create Integrations section in Settings page
- Show connection status for each integration:
  - Connected (green) / Disconnected (red)
  - Last sync time
  - Sync errors (if any)
- Add "Connect" / "Disconnect" buttons
- Add "Sync Now" button for manual sync
- Add "View Sync Logs" button
- Display sync history table:
  - Timestamp
  - Integration (Zoho/FieldPulse)
  - Entity (Customer/Job/Personnel)
  - Action (Created/Updated)
  - Status (Success/Failed)
  - Error message (if failed)

### Deliverables
- ✅ Zoho CRM OAuth integration
- ✅ Zoho CRM bidirectional sync (Accounts, Deals)
- ✅ Zoho CRM webhooks for real-time updates
- ✅ FieldPulse API key integration
- ✅ FieldPulse bidirectional sync (Customers, Jobs, Technicians)
- ✅ FieldPulse webhooks for real-time updates
- ✅ Integration management UI in Settings
- ✅ Sync logs and error handling

---

## Phase 9: Application Records & Export (Week 8-9)

### Objective
Create application records system with PDF/CSV export for compliance and customer records.

### Tasks

#### 9.1 Application Records Generation
- Auto-create Application record when job status = "completed"
- Snapshot all job data into applications table:
  - Job details (site, customer, personnel, equipment)
  - Products applied (from job.products JSON)
  - Application date/time (from job.scheduled_start or actual completion time)
  - Weather conditions (from job or manual entry)
  - Acres treated (from site or manual entry)
  - PHI/REI dates (calculated from products)
- Allow manual creation of application records (for jobs completed outside system)
- Allow editing of application records (before verification)

#### 9.2 Application Records CRUD Interface
- Create Applications page (`/applications`)
- Add Applications to navigation menu
- Build application list view:
  - Filterable by date range, customer, site, product, applicator
  - Searchable
  - Sortable by date, customer, site
- Build application detail page showing:
  - Full application info
  - Products applied table
  - Weather conditions
  - PHI/REI info
  - Verification status
  - Notes
- Add "Verify" button (admin/manager only)
- Add "Edit" button (before verification)
- Add "Export to PDF" button
- Add "Email to Customer" button

#### 9.3 PDF Export (Individual Records)
- Create PDF template for application records:
  - Company header (logo, name, contact info)
  - Application date, site, customer
  - Applicator name, license number
  - Products applied table (EPA reg #, brand, amount, rate)
  - Target pest, crop
  - Weather conditions
  - PHI/REI warnings
  - Applicator signature line
  - Regulatory statement
- Generate PDF using reportlab or similar
- Store PDF in S3
- Return download link

#### 9.4 CSV Export (Bulk Records)
- Add "Export to CSV" button on applications list
- Export filtered/searched records to CSV
- Include all fields:
  - Date, customer, site, address
  - Applicator, equipment
  - Products (one row per product)
  - Rates, amounts
  - Weather
  - PHI/REI
- Download CSV file

#### 9.5 Email Delivery
- Add "Email to Customer" button on application detail
- Send email with:
  - PDF attachment
  - Summary in email body
  - Reentry instructions
  - Company contact info
- Track email delivery status

#### 9.6 Compliance Reports
- Create Reports page (`/reports`)
- Add Reports to navigation menu
- Build report templates:
  - Applications by Date Range (all applications in period)
  - Applications by Product (all uses of specific product)
  - Applications by Customer (all applications for customer)
  - Applications by Applicator (all applications by person)
  - PHI/REI Compliance (upcoming PHI/REI dates)
- Export reports to PDF or CSV

### Deliverables
- ✅ Auto-generation of application records from completed jobs
- ✅ Application records CRUD interface
- ✅ PDF export (individual records)
- ✅ CSV export (bulk records)
- ✅ Email delivery to customers
- ✅ Compliance reports

---

## Phase 10: Equipment Management (Week 9)

### Objective
Build equipment management system with assignment to jobs and maintenance tracking.

### Tasks

#### 10.1 Equipment CRUD Interface
- Create Equipment page (`/equipment`)
- Add Equipment to navigation menu
- Build equipment creation form:
  - Name, type (plane/helicopter/truck/rig/backpack)
  - Tail number (aircraft), license plate (vehicles)
  - Serial number
  - Tank capacity, swath width, max speed
  - Status (active/maintenance/inactive)
  - Maintenance dates and notes
- Build equipment list view with filter by type and status
- Build equipment detail page showing:
  - Full equipment info
  - Maintenance history
  - Jobs using this equipment (upcoming and past)
  - Utilization stats (hours, acres, jobs)

#### 10.2 Equipment Assignment to Jobs
- Update job form to include equipment dropdown
- Filter equipment by:
  - Type (aerial jobs → planes/helicopters only)
  - Status (active only)
  - Availability (not assigned to overlapping job)
- Show equipment info on job detail page
- Show equipment on calendar/schedule view

#### 10.3 Maintenance Tracking
- Add "Schedule Maintenance" button on equipment detail
- Create maintenance record:
  - Date, type (routine/repair/inspection)
  - Performed by (internal or external)
  - Cost
  - Notes
- Set equipment status to "maintenance" during maintenance period
- Block assignment to jobs during maintenance
- Send reminder when next maintenance due

#### 10.4 Equipment Utilization Reports
- Add Equipment Utilization report:
  - Hours flown/driven per equipment per period
  - Acres treated per equipment
  - Jobs completed per equipment
  - Downtime (maintenance hours)
- Export to PDF/CSV

### Deliverables
- ✅ Equipment CRUD interface
- ✅ Equipment assignment to jobs
- ✅ Maintenance tracking
- ✅ Equipment utilization reports

---

## Phase 11: Advanced Features (Week 10-11)

### Objective
Add advanced features: weather integration, route optimization, analytics dashboard, and AI enhancements.

### Tasks

#### 11.1 Weather Integration
- Integrate weather API (OpenWeatherMap, Weather.com, or similar)
- Display weather forecast on:
  - Job detail page (forecast for scheduled date)
  - Schedule/calendar view (weather icons on events)
  - Flight board (current conditions)
- Capture weather conditions automatically when job marked complete:
  - Temperature, wind speed/direction, humidity
  - Store in job record and application record
- Add weather-based rescheduling suggestions:
  - "High winds forecasted, consider rescheduling"
  - "Rain expected, delay application"

#### 11.2 Route Optimization (Pest Control)
- Add "Optimize Route" button on schedule page (pest mode)
- Use Google Maps Directions API or route optimization service
- Reorder jobs by proximity to minimize drive time
- Show optimized route on map
- Update job sequence numbers
- Recalculate estimated start times based on drive time

#### 11.3 Analytics Dashboard
- Create Analytics page (`/analytics`)
- Add Analytics to navigation menu
- Build analytics widgets:
  - **Jobs Overview:** Total jobs, by status, by type
  - **Revenue:** Total revenue, by customer, by service type (if pricing added)
  - **Efficiency:** Acres treated per day, jobs per day, avg job duration
  - **Compliance:** Upcoming PHI/REI dates, expired licenses
  - **Product Usage:** Top products used, total amounts, cost per acre
  - **Personnel Performance:** Jobs completed per person, avg job time
  - **Equipment Utilization:** Hours per equipment, downtime
- Add date range filter
- Add export to PDF button

#### 11.4 AI Label Copilot (Future Enhancement)
- Add "Upload Label PDF" button on product creation
- Use OCR + LLM to parse label PDF:
  - Extract EPA reg number, brand name, manufacturer
  - Extract active ingredients
  - Extract use sites, pests, crops
  - Extract rate tables (min/max rates, PHI/REI)
  - Extract application methods allowed
- Auto-populate product fields and rate tables
- Show confidence scores for extracted data
- Allow manual review and correction

#### 11.5 Season-Long Program Planner (Future Enhancement)
- Create Program Planner page
- Allow users to plan multi-application programs:
  - Select site, crop, target pests
  - Add multiple applications with products and dates
  - System checks:
    - PHI conflicts with harvest date
    - REI conflicts between applications
    - Max applications per season limits
    - Resistance management (rotate modes of action)
- Generate recommended program based on:
  - Pest pressure forecast
  - Crop growth stage
  - Label limits
  - Resistance management best practices

#### 11.6 Benchmarking (Future Enhancement)
- Add Benchmarking page
- Compare performance metrics across:
  - Time periods (this year vs last year)
  - Customers (which customers are most profitable)
  - Personnel (which applicators are most efficient)
  - Equipment (which planes/trucks have best utilization)
- Metrics:
  - Cost per acre
  - Passes per field
  - Revenue per customer
  - Jobs per day per person

### Deliverables
- ✅ Weather integration with forecasts and auto-capture
- ✅ Route optimization for pest control
- ✅ Analytics dashboard with key metrics
- ⏳ AI label copilot (future)
- ⏳ Season-long program planner (future)
- ⏳ Benchmarking (future)

---

## Phase 12: Testing & Production Readiness (Week 11-12)

### Objective
Comprehensive testing of all features, bug fixes, and production deployment.

### Tasks

#### 12.1 Comprehensive Manual Testing
- Follow testing checklist (TESTING_RESULTS.md)
- Test all CRUD operations:
  - Customers, Personnel, Sites, Jobs, Products, Equipment, Service Plans, Applications
- Test all workflows:
  - Crop dusting: dispatcher → ground crew → pilot → application record
  - Pest control: office → tech → service summary → next appointment
- Test integrations:
  - Zoho CRM sync (create/update/delete)
  - FieldPulse sync (create/update/delete)
  - Webhooks (real-time updates)
- Test mobile interfaces:
  - Flight board on phone
  - Load sheets on tablet
  - Route board on phone
- Test role-based access:
  - Admin sees everything
  - Pilot sees only flight board
  - Tech sees only route board
- Test validation:
  - Label guardrails (rate limits, method restrictions)
  - Required fields
  - Date validations
- Test exports:
  - Application records PDF
  - Bulk CSV export
  - Reports

#### 12.2 Automated Testing (Optional)
- Write Vitest tests for tRPC procedures
- Write integration tests for Zoho/FieldPulse sync
- Write E2E tests for critical workflows (Playwright)

#### 12.3 Performance Testing
- Test with large datasets:
  - 1000+ jobs
  - 500+ customers
  - 100+ products
- Measure page load times
- Optimize slow queries
- Add database indexes where needed
- Implement pagination for large lists

#### 12.4 Security Audit
- Review authentication and authorization
- Test role-based access control
- Check for SQL injection vulnerabilities
- Check for XSS vulnerabilities
- Validate all user inputs
- Encrypt sensitive data (API keys, tokens)
- Add rate limiting to API endpoints

#### 12.5 Bug Fixes
- Fix all critical bugs found during testing
- Fix high-priority bugs
- Document known issues (low-priority bugs)

#### 12.6 Documentation
- Update README.md with:
  - Feature overview
  - User roles and permissions
  - Getting started guide
  - Integration setup instructions
- Create user guide (PDF or wiki):
  - How to create jobs
  - How to use flight board
  - How to set up service plans
  - How to connect Zoho CRM
  - How to export application records
- Create API documentation (if exposing API to third parties)

#### 12.7 Production Deployment
- Create final production checkpoint
- Test deployment on staging environment
- Perform smoke tests on staging
- Deploy to production via Manus UI
- Monitor for errors
- Set up error tracking (Sentry or similar)

### Deliverables
- ✅ All features tested and working
- ✅ Critical bugs fixed
- ✅ Performance optimized
- ✅ Security audit complete
- ✅ Documentation complete
- ✅ Production deployment successful

---

## Summary

### Total Estimated Timeline: 10-12 weeks

| Phase | Focus | Duration | Deliverables |
|-------|-------|----------|--------------|
| 1 | Database Schema | 1 week | Sites, Equipment, Products, Applications, Service Plans tables |
| 2 | Organization Mode | 1 week | Mode selection, UI adaptation |
| 3 | Sites Management | 1-2 weeks | Sites CRUD, polygon mapping, zones, sensitive areas |
| 4 | Product Catalog | 1-2 weeks | Products CRUD, rate tables, label validation |
| 5 | Mobile Interfaces | 1-2 weeks | Flight board, load sheets, route board |
| 6 | Scheduling | 1-2 weeks | Calendar view, drag-and-drop, resource management |
| 7 | Pest Control | 1-2 weeks | Service plans, recurring jobs, summaries |
| 8 | Integrations | 1-2 weeks | Zoho CRM, FieldPulse bidirectional sync |
| 9 | Application Records | 1 week | Auto-generation, PDF/CSV export |
| 10 | Equipment | 1 week | Equipment CRUD, assignment, maintenance |
| 11 | Advanced Features | 1-2 weeks | Weather, route optimization, analytics |
| 12 | Testing & Deployment | 1-2 weeks | Comprehensive testing, bug fixes, production |

### Priority Order

**Critical (Must Have for V1):**
1. Database schema expansion
2. Organization mode selection
3. Sites management with polygon boundaries
4. Product catalog with label guardrails
5. Mobile field interfaces (flight board, load sheets, route board)
6. Calendar scheduling view
7. Application records with PDF export
8. Zoho CRM and FieldPulse integrations

**Important (Should Have for V1):**
9. Pest control features (service plans, recurring jobs)
10. Equipment management
11. Weather integration
12. Route optimization

**Nice to Have (V2+):**
13. AI label copilot
14. Season-long program planner
15. Advanced analytics and benchmarking
16. Customer portal

---

## Next Steps

1. **Review and approve this plan**
2. **Start Phase 1: Database Schema Expansion**
3. **Set up project tracking** (use todo.md or project management tool)
4. **Establish testing cadence** (test after each phase)
5. **Plan user feedback sessions** (after Phases 5, 8, and 12)

Let me know if you want to proceed with Phase 1 or if you'd like to adjust the plan!
