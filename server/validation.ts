import { z } from "zod";

/**
 * Validation schemas for tRPC procedures
 * Provides type-safe input validation with helpful error messages
 */

// Email validation with proper format checking
export const emailSchema = z.string().email("Invalid email format").or(z.literal(""));

// Phone validation (flexible format)
export const phoneSchema = z.string().regex(
  /^[\d\s\-\(\)\+\.]*$/,
  "Phone number can only contain digits, spaces, dashes, parentheses, plus signs, and dots"
).or(z.literal(""));

// Date validation helper
export const dateStringSchema = z.string().refine(
  (val) => !val || !isNaN(Date.parse(val)),
  "Invalid date format"
);

// Customer schemas
export const createCustomerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  notes: z.string().optional(),
});

export const updateCustomerSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Customer name is required").optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  notes: z.string().optional(),
});

export const deleteCustomerSchema = z.object({
  id: z.number(),
});

// Personnel schemas
export const createPersonnelSchema = z.object({
  name: z.string().min(1, "Personnel name is required"),
  role: z.enum(["pilot", "ground_crew", "manager", "technician"]),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  status: z.enum(["active", "inactive", "on_leave"]).default("active"),
  pilotLicense: z.string().optional(),
  applicatorLicense: z.string().optional(),
  notes: z.string().optional(),
});

export const updatePersonnelSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Personnel name is required").optional(),
  role: z.enum(["pilot", "ground_crew", "manager", "technician"]).optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  status: z.enum(["active", "inactive", "on_leave"]).optional(),
  pilotLicense: z.string().optional(),
  applicatorLicense: z.string().optional(),
  notes: z.string().optional(),
});

export const deletePersonnelSchema = z.object({
  id: z.number(),
});

// Job schemas
export const createJobSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  description: z.string().optional(),
  jobType: z.enum(["crop_dusting", "pest_control", "fertilization", "herbicide"]),
  statusId: z.number().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  locationAddress: z.string().optional(),
  locationLat: z.string().optional(),
  locationLng: z.string().optional(),
  customerId: z.number().optional(),
  assignedPersonnelId: z.number().optional(),
  scheduledStart: dateStringSchema.optional(),
  scheduledEnd: dateStringSchema.optional(),
  // Agricultural details
  state: z.string().optional(),
  commodityCrop: z.string().optional(),
  targetPest: z.string().optional(),
  epaNumber: z.string().optional(),
  applicationRate: z.string().optional(),
  applicationMethod: z.string().optional(),
  chemicalProduct: z.string().optional(),
  // Crop specifics
  reEntryInterval: z.string().optional(),
  preharvestInterval: z.string().optional(),
  maxApplicationsPerSeason: z.string().optional(),
  maxRatePerSeason: z.string().optional(),
  methodsAllowed: z.string().optional(),
  rate: z.string().optional(),
  diluentAerial: z.string().optional(),
  diluentGround: z.string().optional(),
  diluentChemigation: z.string().optional(),
  genericConditions: z.string().optional(),
}).refine(
  (data) => {
    // If scheduledEnd is provided, ensure it's after scheduledStart
    if (data.scheduledStart && data.scheduledEnd) {
      const start = new Date(data.scheduledStart);
      const end = new Date(data.scheduledEnd);
      return end > start;
    }
    return true;
  },
  {
    message: "Scheduled end time must be after start time",
    path: ["scheduledEnd"],
  }
);

export const updateJobSchema = z.object({
  id: z.number(),
  title: z.string().min(1, "Job title is required").optional(),
  description: z.string().optional(),
  jobType: z.enum(["crop_dusting", "pest_control", "fertilization", "herbicide"]).optional(),
  statusId: z.number().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  locationAddress: z.string().optional(),
  locationLat: z.string().optional(),
  locationLng: z.string().optional(),
  customerId: z.number().optional(),
  assignedPersonnelId: z.number().optional(),
  scheduledStart: dateStringSchema.optional(),
  scheduledEnd: dateStringSchema.optional(),
  // Agricultural details
  state: z.string().optional(),
  commodityCrop: z.string().optional(),
  targetPest: z.string().optional(),
  epaNumber: z.string().optional(),
  applicationRate: z.string().optional(),
  applicationMethod: z.string().optional(),
  chemicalProduct: z.string().optional(),
  // Crop specifics
  reEntryInterval: z.string().optional(),
  preharvestInterval: z.string().optional(),
  maxApplicationsPerSeason: z.string().optional(),
  maxRatePerSeason: z.string().optional(),
  methodsAllowed: z.string().optional(),
  rate: z.string().optional(),
  diluentAerial: z.string().optional(),
  diluentGround: z.string().optional(),
  diluentChemigation: z.string().optional(),
  genericConditions: z.string().optional(),
}).refine(
  (data) => {
    // If scheduledEnd is provided, ensure it's after scheduledStart
    if (data.scheduledStart && data.scheduledEnd) {
      const start = new Date(data.scheduledStart);
      const end = new Date(data.scheduledEnd);
      return end > start;
    }
    return true;
  },
  {
    message: "Scheduled end time must be after start time",
    path: ["scheduledEnd"],
  }
);

export const deleteJobSchema = z.object({
  id: z.number(),
});

// Job Status schemas
export const createJobStatusSchema = z.object({
  name: z.string().min(1, "Status name is required"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Color must be a valid hex code (e.g., #FF5733)"),
  displayOrder: z.number().int().min(0),
  category: z.enum(["pending", "active", "completed", "cancelled"]),
  isDefault: z.boolean().default(false),
});

export const updateJobStatusSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Status name is required").optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Color must be a valid hex code").optional(),
  displayOrder: z.number().int().min(0).optional(),
  category: z.enum(["pending", "active", "completed", "cancelled"]).optional(),
  isDefault: z.boolean().optional(),
});

export const deleteJobStatusSchema = z.object({
  id: z.number(),
});

export const reorderJobStatusesSchema = z.object({
  statusIds: z.array(z.number()).min(1, "At least one status ID is required"),
});

// Organization schemas
export const updateOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required").optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  website: z.string().url("Invalid website URL").or(z.literal("")).optional(),
  notes: z.string().optional(),
  mode: z.enum(["ag_aerial", "residential_pest", "both"]).optional(),
  featuresEnabled: z.array(z.string()).optional(),
});
