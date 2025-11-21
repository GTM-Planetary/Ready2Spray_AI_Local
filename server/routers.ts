import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { stripeRouter } from "./stripeRouter";
import { teamRouter } from "./teamRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { updateOrganizationSchema, createSiteSchema, updateSiteSchema, deleteSiteSchema, createEquipmentSchema, updateEquipmentSchema, deleteEquipmentSchema } from "./validation";

export const appRouter = router({
  // Waitlist router (public)
  waitlist: router({
    join: publicProcedure
      .input(z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email format"),
        company: z.string().optional(),
        phone: z.string().optional(),
        message: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { createWaitlistEntry } = await import("./db");
        return await createWaitlistEntry(input);
      }),
  }),

  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  stripe: stripeRouter,
  team: teamRouter,
  auth: router({
    me: publicProcedure.query(opts => {
      console.log('[auth.me] User from context:', opts.ctx.user ? 'authenticated' : 'not authenticated');
      return opts.ctx.user;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Organization router
  organization: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const { getOrCreateUserOrganization } = await import("./db");
      return await getOrCreateUserOrganization(ctx.user.id);
    }),
    update: protectedProcedure
      .input(updateOrganizationSchema)
      .mutation(async ({ ctx, input }) => {
        const { updateOrganization } = await import("./db");
        const { getOrCreateUserOrganization } = await import("./db");
        const org = await getOrCreateUserOrganization(ctx.user.id);
        return await updateOrganization(org.id, input);
      }),
  }),

  // Customer router
  customers: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getOrCreateUserOrganization, getCustomersByOrgId } = await import("./db");
      const org = await getOrCreateUserOrganization(ctx.user.id);
      return await getCustomersByOrgId(org.id);
    }),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1, "Customer name is required"),
        email: z.string().email("Invalid email format").optional().or(z.literal("")),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getOrCreateUserOrganization, createCustomer, createAuditLog } = await import("./db");
        const org = await getOrCreateUserOrganization(ctx.user.id);
        const customer = await createCustomer({ ...input, orgId: org.id });
        
        await createAuditLog({
          userId: ctx.user.id,
          organizationId: org.id,
          action: "create",
          entityType: "customer",
          entityId: customer.id,
          changes: JSON.stringify({ created: input }),
          ipAddress: ctx.req.ip || null,
          userAgent: ctx.req.get("user-agent") || null,
        });
        
        return customer;
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1, "Customer name is required").optional(),
        email: z.string().email("Invalid email format").optional().or(z.literal("")),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { updateCustomer, getOrCreateUserOrganization, createAuditLog } = await import("./db");
        const org = await getOrCreateUserOrganization(ctx.user.id);
        const customer = await updateCustomer(input.id, input);
        
        await createAuditLog({
          userId: ctx.user.id,
          organizationId: org.id,
          action: "update",
          entityType: "customer",
          entityId: input.id,
          changes: JSON.stringify({ updated: input }),
          ipAddress: ctx.req.ip || null,
          userAgent: ctx.req.get("user-agent") || null,
        });
        
        return customer;
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { deleteCustomer, getOrCreateUserOrganization, createAuditLog } = await import("./db");
        const org = await getOrCreateUserOrganization(ctx.user.id);
        
        await deleteCustomer(input.id);
        
        await createAuditLog({
          userId: ctx.user.id,
          organizationId: org.id,
          action: "delete",
          entityType: "customer",
          entityId: input.id,
          changes: JSON.stringify({ deleted: true }),
          ipAddress: ctx.req.ip || null,
          userAgent: ctx.req.get("user-agent") || null,
        });
        
        return { success: true };
      }),
  }),

  // Jobs router
  jobs: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getOrCreateUserOrganization, getJobsByOrgId } = await import("./db");
      const org = await getOrCreateUserOrganization(ctx.user.id);
      return await getJobsByOrgId(org.id);
    }),
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1, "Job title is required"),
        description: z.string().optional(),
        jobType: z.enum(["crop_dusting", "pest_control", "fertilization", "herbicide"]),
        statusId: z.number().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
        locationAddress: z.string().optional(),
        locationLat: z.string().optional(),
        locationLng: z.string().optional(),
        customerId: z.number().optional(),
        siteId: z.number().optional(),
        assignedPersonnelId: z.number().optional(),
        equipmentId: z.number().optional(),
        scheduledStart: z.string().optional(),
        scheduledEnd: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getOrCreateUserOrganization, createJob, createAuditLog } = await import("./db");
        const org = await getOrCreateUserOrganization(ctx.user.id);
        const job = await createJob({ ...input, orgId: org.id });
        
        // Create audit log
        await createAuditLog({
          userId: ctx.user.id,
          organizationId: org.id,
          action: "create",
          entityType: "job",
          entityId: job.id as number,
          changes: JSON.stringify({ created: input }),
          ipAddress: ctx.req.ip || null,
          userAgent: ctx.req.get("user-agent") || null,
        });
        
        return job;
      }),
    update: protectedProcedure
      .input(z.object({
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
        equipmentId: z.number().optional(),
        productId: z.number().optional(),
        scheduledStart: z.string().optional(),
        scheduledEnd: z.string().optional(),
        state: z.string().optional(),
        commodityCrop: z.string().optional(),
        targetPest: z.string().optional(),
        epaNumber: z.string().optional(),
        applicationRate: z.string().optional(),
        applicationMethod: z.string().optional(),
        chemicalProduct: z.string().optional(),
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
      }))
      .mutation(async ({ ctx, input }) => {
        const { updateJob, getJobById, createJobStatusHistory, getOrCreateUserOrganization, createAuditLog } = await import("./db");
        const org = await getOrCreateUserOrganization(ctx.user.id);
        
        // Get current job state for audit log
        const currentJob = await getJobById(input.id);
        
        // If status is being changed, log it to history
        // Status history tracking disabled - statusId field not in current schema
        // TODO: Re-enable when status tracking is needed
        // if (input.statusId !== undefined) {
        //   if (currentJob && currentJob.statusId !== input.statusId) {
        //     await createJobStatusHistory({
        //       jobId: input.id,
        //       fromStatusId: currentJob.statusId,
        //       toStatusId: input.statusId,
        //       changedByUserId: ctx.user.id,
        //     });
        //   }
        // }
        
        const updatedJob = await updateJob(input.id, input);
        
        // Create audit log
        await createAuditLog({
          userId: ctx.user.id,
          organizationId: org.id,
          action: "update",
          entityType: "job",
          entityId: input.id,
          changes: JSON.stringify({ before: currentJob, after: input }),
          ipAddress: ctx.req.ip || null,
          userAgent: ctx.req.get("user-agent") || null,
        });
        
        return updatedJob;
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { deleteJob, getJobById, getOrCreateUserOrganization, createAuditLog } = await import("./db");
        const org = await getOrCreateUserOrganization(ctx.user.id);
        
        // Get job before deletion for audit log
        const job = await getJobById(input.id);
        
        await deleteJob(input.id);
        
        // Create audit log
        if (job) {
          await createAuditLog({
            userId: ctx.user.id,
            organizationId: org.id,
            action: "delete",
            entityType: "job",
            entityId: input.id,
            changes: JSON.stringify({ deleted: job }),
            ipAddress: ctx.req.ip || null,
            userAgent: ctx.req.get("user-agent") || null,
          });
        }
        
        return { success: true };
      }),
    history: protectedProcedure
      .input(z.object({ jobId: z.number() }))
      .query(async ({ input }) => {
        const { getJobStatusHistory } = await import("./db");
        return await getJobStatusHistory(input.jobId);
      }),
    bulkImport: protectedProcedure
      .input(z.object({
        csvContent: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getOrCreateUserOrganization, bulkImportJobs, findCustomerByName, findPersonnelByName, findEquipmentByName } = await import("./db");
        const { parseCSV, validateJobRow, normalizeJobType, normalizePriority } = await import("./csvUtils");
        
        const org = await getOrCreateUserOrganization(ctx.user.id);
        
        // Parse CSV
        const parsed = parseCSV(input.csvContent);
        
        if (parsed.errors.length > 0) {
          return {
            success: false,
            totalRows: 0,
            successCount: 0,
            errorCount: parsed.errors.length,
            errors: parsed.errors.map((err: any) => ({
              row: err.row || 0,
              message: err.message,
            })),
            createdJobs: [],
          };
        }
        
        const jobsToImport = [];
        const errors: Array<{ row: number; field?: string; message: string; data?: any }> = [];
        
        // Validate and prepare jobs
        for (let i = 0; i < parsed.data.length; i++) {
          const row = parsed.data[i];
          const rowNum = i + 2; // +2 because row 1 is header, and we're 0-indexed
          
          const validation = validateJobRow(row, rowNum);
          if (!validation.valid) {
            validation.errors.forEach(err => {
              errors.push({ row: rowNum, message: err, data: row });
            });
            continue;
          }
          
          // Resolve customer, personnel, equipment by name
          let customerId: number | undefined;
          let assignedPersonnelId: number | undefined;
          let equipmentId: number | undefined;
          
          if (row.customerName) {
            const customer = await findCustomerByName(org.id, row.customerName);
            if (customer) {
              customerId = customer.id;
            } else {
              errors.push({ row: rowNum, field: 'customerName', message: `Customer not found: ${row.customerName}`, data: row });
            }
          }
          
          if (row.personnelName) {
            const personnel = await findPersonnelByName(org.id, row.personnelName);
            if (personnel) {
              assignedPersonnelId = personnel.id;
            } else {
              errors.push({ row: rowNum, field: 'personnelName', message: `Personnel not found: ${row.personnelName}`, data: row });
            }
          }
          
          if (row.equipmentName) {
            const equipment = await findEquipmentByName(org.id, row.equipmentName);
            if (equipment) {
              equipmentId = equipment.id;
            } else {
              errors.push({ row: rowNum, field: 'equipmentName', message: `Equipment not found: ${row.equipmentName}`, data: row });
            }
          }
          
          jobsToImport.push({
            title: row.title,
            description: row.description,
            jobType: normalizeJobType(row.jobType || 'crop_dusting'),
            priority: normalizePriority(row.priority),
            customerId,
            assignedPersonnelId,
            equipmentId,
            scheduledStart: row.scheduledDate ? new Date(row.scheduledDate) : undefined,
            locationAddress: row.locationAddress,
            acres: row.acres ? parseFloat(row.acres) : undefined,
            chemicalProduct: row.chemicalProduct,
            epaNumber: row.epaRegistrationNumber,
            targetPest: row.targetPest,
            applicationRate: row.applicationRate,
            notes: row.notes,
          });
        }
        
        // Import jobs
        const results = await bulkImportJobs(org.id, jobsToImport);
        
        const createdJobs = results
          .filter(r => r.success && r.job)
          .map(r => ({ id: r.job.id, title: r.job.title }));
        
        const importErrors = results
          .map((r, idx) => {
            if (!r.success) {
              return {
                row: idx + 2,
                message: r.error || 'Unknown error',
              };
            }
            return null;
          })
          .filter(Boolean) as Array<{ row: number; message: string }>;
        
        return {
          success: errors.length === 0 && importErrors.length === 0,
          totalRows: parsed.data.length,
          successCount: createdJobs.length,
          errorCount: errors.length + importErrors.length,
          errors: [...errors, ...importErrors],
          createdJobs,
        };
      }),
  }),

  // Job Statuses router
  jobStatuses: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getOrCreateUserOrganization, getJobStatusesByOrgId } = await import("./db");
      const org = await getOrCreateUserOrganization(ctx.user.id);
      return await getJobStatusesByOrgId(org.id);
    }),
    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          color: z.string(),
          displayOrder: z.number(),
          category: z.string(),
          isDefault: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { getOrCreateUserOrganization, createJobStatus } = await import("./db");
        const org = await getOrCreateUserOrganization(ctx.user.id);
        return await createJobStatus({ ...input, orgId: org.id });
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          color: z.string().optional(),
          displayOrder: z.number().optional(),
          category: z.string().optional(),
          isDefault: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { updateJobStatus } = await import("./db");
        const { id, ...data } = input;
        return await updateJobStatus(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteJobStatus } = await import("./db");
        await deleteJobStatus(input.id);
        return { success: true };
      }),
    reorder: protectedProcedure
      .input(
        z.object({
          statusIds: z.array(z.number()),
        })
      )
      .mutation(async ({ input }) => {
        const { reorderJobStatuses } = await import("./db");
        await reorderJobStatuses(input.statusIds);
        return { success: true };
      }),
  }),

  // Personnel router
  personnel: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getOrCreateUserOrganization, getPersonnelByOrgId } = await import("./db");
      const org = await getOrCreateUserOrganization(ctx.user.id);
      return await getPersonnelByOrgId(org.id);
    }),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1, "Personnel name is required"),
        role: z.enum(["pilot", "ground_crew", "manager", "technician"]),
        email: z.string().email("Invalid email format").optional().or(z.literal("")),
        phone: z.string().optional(),
        status: z.enum(["active", "inactive", "on_leave"]).default("active"),
        pilotLicense: z.string().optional(),
        applicatorLicense: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getOrCreateUserOrganization, createPersonnel } = await import("./db");
        const org = await getOrCreateUserOrganization(ctx.user.id);
        return await createPersonnel({ ...input, orgId: org.id });
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1, "Personnel name is required").optional(),
        role: z.enum(["pilot", "ground_crew", "manager", "technician"]).optional(),
        email: z.string().email("Invalid email format").optional().or(z.literal("")),
        phone: z.string().optional(),
        status: z.enum(["active", "inactive", "on_leave"]).optional(),
        pilotLicense: z.string().optional(),
        applicatorLicense: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { updatePersonnel } = await import("./db");
        return await updatePersonnel(input.id, input);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deletePersonnel } = await import("./db");
        await deletePersonnel(input.id);
        return { success: true };
      }),
  }),

  // Products router
  products: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getOrCreateUserOrganization, getProductsByOrgId } = await import("./db");
      const org = await getOrCreateUserOrganization(ctx.user.id);
      return await getProductsByOrgId(org.id);
    }),
    extractFromScreenshot: protectedProcedure
      .input(z.object({
        imageData: z.string(), // base64 encoded image
      }))
      .mutation(async ({ ctx, input }) => {
        const { invokeLLM } = await import("./_core/llm");
        
        try {
          // Call LLM with vision to extract product details from screenshot
          const response = await invokeLLM({
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "image_url",
                    image_url: {
                      url: input.imageData,
                    },
                  },
                  {
                    type: "text",
                    text: `Extract all product information from this Agrian Label Center screenshot. Return a JSON object with these fields:
- productName: string
- epaNumber: string
- registrant: string
- activeIngredients: string (with percentages)
- reEntryInterval: string
- preharvestInterval: string
- maxApplicationsPerSeason: string
- maxRatePerSeason: string
- methodsAllowed: string
- rate: string
- diluentAerial: string
- diluentGround: string
- diluentChemigation: string
- ppeInformation: string
- labelSignalWord: string
- genericConditions: string

If a field is not visible in the screenshot, set it to an empty string. Be precise and extract exactly what you see.`,
                  },
                ],
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "product_extraction",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    productName: { type: "string" },
                    epaNumber: { type: "string" },
                    registrant: { type: "string" },
                    activeIngredients: { type: "string" },
                    reEntryInterval: { type: "string" },
                    preharvestInterval: { type: "string" },
                    maxApplicationsPerSeason: { type: "string" },
                    maxRatePerSeason: { type: "string" },
                    methodsAllowed: { type: "string" },
                    rate: { type: "string" },
                    diluentAerial: { type: "string" },
                    diluentGround: { type: "string" },
                    diluentChemigation: { type: "string" },
                    ppeInformation: { type: "string" },
                    labelSignalWord: { type: "string" },
                    genericConditions: { type: "string" },
                  },
                  required: [
                    "productName",
                    "epaNumber",
                    "registrant",
                    "activeIngredients",
                    "reEntryInterval",
                    "preharvestInterval",
                    "maxApplicationsPerSeason",
                    "maxRatePerSeason",
                    "methodsAllowed",
                    "rate",
                    "diluentAerial",
                    "diluentGround",
                    "diluentChemigation",
                    "ppeInformation",
                    "labelSignalWord",
                    "genericConditions",
                  ],
                  additionalProperties: false,
                },
              },
            },
          });

          const content = response.choices[0]?.message?.content;
          if (!content || typeof content !== 'string') {
            return {
              success: false,
              error: "No response from AI",
            };
          }

          const extractedData = JSON.parse(content);
          
          return {
            success: true,
            extractedData,
          };
        } catch (error: any) {
          console.error("Error extracting product data:", error);
          return {
            success: false,
            error: error.message || "Failed to extract product data",
          };
        }
      }),
    create: protectedProcedure
      .input(z.object({
        productName: z.string(),
        epaNumber: z.string(),
        registrant: z.string().optional(),
        activeIngredients: z.string().optional(),
        reEntryInterval: z.string().optional(),
        preharvestInterval: z.string().optional(),
        maxApplicationsPerSeason: z.string().optional(),
        maxRatePerSeason: z.string().optional(),
        methodsAllowed: z.string().optional(),
        rate: z.string().optional(),
        diluentAerial: z.string().optional(),
        diluentGround: z.string().optional(),
        diluentChemigation: z.string().optional(),
        ppeInformation: z.string().optional(),
        labelSignalWord: z.string().optional(),
        genericConditions: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getOrCreateUserOrganization, createProduct } = await import("./db");
        const org = await getOrCreateUserOrganization(ctx.user.id);
        const product = await createProduct({ ...input, orgId: org.id });
        return product;
      }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const { getProductById } = await import("./db");
        return await getProductById(input.id);
      }),
    search: protectedProcedure
      .input(z.object({ searchTerm: z.string() }))
      .query(async ({ input }) => {
        const { searchProducts } = await import("./db");
        return await searchProducts(input.searchTerm);
      }),
  }),

  // AI Chat router
  ai: router({
    listConversations: protectedProcedure.query(async ({ ctx }) => {
      const { getOrCreateUserOrganization, getConversationsByOrgId } = await import("./db");
      const org = await getOrCreateUserOrganization(ctx.user.id);
      return await getConversationsByOrgId(org.id);
    }),
    createConversation: protectedProcedure
      .input((raw: any) => raw)
      .mutation(async ({ ctx, input }) => {
        const { getOrCreateUserOrganization, createConversation } = await import("./db");
        const org = await getOrCreateUserOrganization(ctx.user.id);
        return await createConversation({ orgId: org.id, userId: ctx.user.id, ...input });
      }),
    getMessages: protectedProcedure
      .input((raw: any) => raw)
      .query(async ({ input }) => {
        const { getMessagesByConversationId } = await import("./db");
        return await getMessagesByConversationId(input.conversationId);
      }),
    sendMessage: protectedProcedure
      .input((raw: any) => raw)
      .mutation(async ({ ctx, input }) => {
        const { createMessage, getOrCreateUserOrganization, getMessagesByConversationId } = await import("./db");
        const { getClaudeResponse } = await import("./claude");
        
        const org = await getOrCreateUserOrganization(ctx.user.id);
        
        // Save user message
        const userMessage = await createMessage({
          conversationId: input.conversationId,
          role: "user",
          content: input.content,
        });

        // Get conversation history
        const history = await getMessagesByConversationId(input.conversationId);
        const messages = history.slice(-10).map((m: any) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));

        // Get AI response with MCP tools
        try {
          const { mcpTools, executeMCPTool } = await import("./mcpTools");
          
          const response = await getClaudeResponse({
            messages,
            systemPrompt: `You are a helpful agricultural operations assistant for Ready2Spray. You help with job scheduling, weather conditions, EPA compliance, and agricultural operations.

You have access to tools to query jobs, customers, personnel, weather, and EPA products. Use these tools when users ask about specific data.

Be concise and practical. When presenting data from tools, format it clearly.`,
            tools: mcpTools,
            maxTokens: 2048,
          });

          let assistantContent = "";
          const toolResults: string[] = [];

          // Process response content and handle tool calls
          for (const block of response.content) {
            if (block.type === 'text') {
              assistantContent += block.text;
            } else if (block.type === 'tool_use') {
              // Execute the tool
              const toolResult = await executeMCPTool(
                block.name,
                block.input,
                { organizationId: org.id, userId: ctx.user.id }
              );
              toolResults.push(`Tool: ${block.name}\nResult: ${JSON.stringify(toolResult, null, 2)}`);
              
              // If tool was used, get follow-up response from Claude with tool results
              if (response.stopReason === 'tool_use') {
                const followUpMessages = [
                  ...messages,
                  {
                    role: 'assistant' as const,
                    content: JSON.stringify(block)
                  },
                  {
                    role: 'user' as const,
                    content: `Tool result: ${JSON.stringify(toolResult)}`
                  }
                ];
                
                const followUpResponse = await getClaudeResponse({
                  messages: followUpMessages,
                  systemPrompt: `You are a helpful agricultural operations assistant for Ready2Spray. Present the tool results in a clear, user-friendly format.`,
                  maxTokens: 2048,
                });
                
                for (const followUpBlock of followUpResponse.content) {
                  if (followUpBlock.type === 'text') {
                    assistantContent += followUpBlock.text;
                  }
                }
              }
            }
          }

          if (!assistantContent && toolResults.length > 0) {
            assistantContent = toolResults.join('\n\n');
          } else if (!assistantContent) {
            assistantContent = "I apologize, but I couldn't generate a response. Please try again.";
          }

          // Save assistant message
          const assistantMessage = await createMessage({
            conversationId: input.conversationId,
            role: "assistant",
            content: assistantContent,
          });

          return { 
            userMessage, 
            assistantMessage,
            usage: response.usage,
          };
        } catch (error: any) {
          console.error('[AI] Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            cause: error.cause
          });
          // Save error message
          const errorMessage = await createMessage({
            conversationId: input.conversationId,
            role: "assistant",
            content: `I apologize, but I encountered an error: ${error.message}. Please try again.`,
          });
          return { userMessage, assistantMessage: errorMessage };
        }
      }),
    deleteConversation: protectedProcedure
      .input((raw: any) => raw)
      .mutation(async ({ input }) => {
        const { deleteConversation } = await import("./db");
        await deleteConversation(input.conversationId);
        return { success: true };
      }),
  }),

  // Maps router
  maps: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getOrCreateUserOrganization, getMapsByOrgId } = await import("./db");
      const org = await getOrCreateUserOrganization(ctx.user.id);
      return await getMapsByOrgId(org.id);
    }),
    upload: protectedProcedure
      .input((raw: any) => raw)
      .mutation(async ({ ctx, input }) => {
        const { getOrCreateUserOrganization, createMap } = await import("./db");
        const { storagePut } = await import("./storage");
        const org = await getOrCreateUserOrganization(ctx.user.id);

        // Decode base64 and upload to S3
        const base64Data = input.fileData.split(",")[1];
        const buffer = Buffer.from(base64Data, "base64");
        const fileKey = `maps/${org.id}/${Date.now()}-${input.fileName}`;
        const { url } = await storagePut(fileKey, buffer, `application/${input.fileType}`);

        return await createMap({
          orgId: org.id,
          name: input.name,
          fileUrl: url,
          fileKey,
          fileType: input.fileType,
          publicUrl: url,
        });
      }),
    delete: protectedProcedure
      .input((raw: any) => raw)
      .mutation(async ({ input }) => {
        const { deleteMap } = await import("./db");
        await deleteMap(input.id);
        return { success: true };
      }),
  }),

  // Agrian EPA Product Lookup router
  // Sites router
  equipment: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getOrCreateUserOrganization, getEquipmentByOrgId } = await import("./db");
      const org = await getOrCreateUserOrganization(ctx.user.id);
      return await getEquipmentByOrgId(org.id);
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const { getEquipmentById } = await import("./db");
        return await getEquipmentById(input.id);
      }),
    create: protectedProcedure
      .input(createEquipmentSchema)
      .mutation(async ({ ctx, input }) => {
        const { getOrCreateUserOrganization, createEquipment } = await import("./db");
        const org = await getOrCreateUserOrganization(ctx.user.id);
        return await createEquipment({ ...input, orgId: org.id });
      }),
    update: protectedProcedure
      .input(updateEquipmentSchema)
      .mutation(async ({ input }) => {
        const { updateEquipment } = await import("./db");
        const { id, ...data } = input;
        return await updateEquipment(id, data);
      }),
    delete: protectedProcedure
      .input(deleteEquipmentSchema)
      .mutation(async ({ input }) => {
        const { deleteEquipment } = await import("./db");
        await deleteEquipment(input.id);
        return { success: true };
      }),
  }),

  maintenance: router({
    listByEquipment: protectedProcedure
      .input(z.object({ equipmentId: z.number() }))
      .query(async ({ input }) => {
        const { getMaintenanceTasksByEquipmentId } = await import("./db");
        return await getMaintenanceTasksByEquipmentId(input.equipmentId);
      }),
    listAll: protectedProcedure.query(async ({ ctx }) => {
      const { getOrCreateUserOrganization, getAllMaintenanceTasks } = await import("./db");
      const org = await getOrCreateUserOrganization(ctx.user.id);
      return await getAllMaintenanceTasks(org.id);
    }),
    create: protectedProcedure
      .input(z.object({
        equipmentId: z.number(),
        taskName: z.string(),
        description: z.string().optional(),
        taskType: z.enum(["inspection", "oil_change", "filter_replacement", "tire_rotation", "annual_certification", "engine_overhaul", "custom"]),
        frequencyType: z.enum(["hours", "days", "months", "one_time"]),
        frequencyValue: z.number(),
        nextDueDate: z.string().optional(),
        isRecurring: z.boolean().default(true),
        estimatedCost: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { createMaintenanceTask } = await import("./db");
        const { nextDueDate, ...data } = input;
        const taskData = {
          ...data,
          ...(nextDueDate ? { nextDueDate: new Date(nextDueDate) } : {}),
        };
        return await createMaintenanceTask(taskData);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        taskName: z.string().optional(),
        description: z.string().optional(),
        taskType: z.enum(["inspection", "oil_change", "filter_replacement", "tire_rotation", "annual_certification", "engine_overhaul", "custom"]).optional(),
        frequencyType: z.enum(["hours", "days", "months", "one_time"]).optional(),
        frequencyValue: z.number().optional(),
        nextDueDate: z.string().optional(),
        isRecurring: z.boolean().optional(),
        estimatedCost: z.string().optional(),
        actualCost: z.string().optional(),
        status: z.enum(["pending", "in_progress", "completed", "overdue"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { updateMaintenanceTask } = await import("./db");
        const { id, nextDueDate, ...data } = input;
        const updates = {
          ...data,
          ...(nextDueDate ? { nextDueDate: new Date(nextDueDate) } : {}),
        };
        return await updateMaintenanceTask(id, updates);
      }),
    complete: protectedProcedure
      .input(z.object({
        id: z.number(),
        actualCost: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { completeMaintenanceTask } = await import("./db");
        return await completeMaintenanceTask(input.id, input.actualCost, input.notes);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteMaintenanceTask } = await import("./db");
        await deleteMaintenanceTask(input.id);
        return { success: true };
      }),
  }),

  sites: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getOrCreateUserOrganization, getSitesByOrgId } = await import("./db");
      const org = await getOrCreateUserOrganization(ctx.user.id);
      return await getSitesByOrgId(org.id);
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const { getSiteById } = await import("./db");
        return await getSiteById(input.id);
      }),
    create: protectedProcedure
      .input(createSiteSchema)
      .mutation(async ({ ctx, input }) => {
        const { getOrCreateUserOrganization, createSite } = await import("./db");
        const org = await getOrCreateUserOrganization(ctx.user.id);
        return await createSite({ ...input, orgId: org.id });
      }),
    update: protectedProcedure
      .input(updateSiteSchema)
      .mutation(async ({ input }) => {
        const { updateSite } = await import("./db");
        const { id, ...data } = input;
        return await updateSite(id, data);
      }),
    delete: protectedProcedure
      .input(deleteSiteSchema)
      .mutation(async ({ input }) => {
        const { deleteSite } = await import("./db");
        await deleteSite(input.id);
        return { success: true };
      }),
  }),

  integrations: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getOrCreateUserOrganization, getIntegrationConnections } = await import("./db");
      const org = await getOrCreateUserOrganization(ctx.user.id);
      return await getIntegrationConnections(org.id);
    }),
    create: protectedProcedure
      .input(z.object({
        integrationType: z.enum(['zoho_crm', 'fieldpulse']),
        zohoClientId: z.string().optional(),
        zohoClientSecret: z.string().optional(),
        fieldpulseApiKey: z.string().optional(),
        syncCustomers: z.boolean().optional(),
        syncJobs: z.boolean().optional(),
        syncPersonnel: z.boolean().optional(),
        syncIntervalMinutes: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getOrCreateUserOrganization, createIntegrationConnection } = await import("./db");
        const org = await getOrCreateUserOrganization(ctx.user.id);
        return await createIntegrationConnection({
          organizationId: org.id,
          ...input
        });
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        isEnabled: z.boolean().optional(),
        fieldpulseApiKey: z.string().optional(),
        syncCustomers: z.boolean().optional(),
        syncJobs: z.boolean().optional(),
        syncPersonnel: z.boolean().optional(),
        syncIntervalMinutes: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { updateIntegrationConnection } = await import("./db");
        const { id, ...data } = input;
        return await updateIntegrationConnection(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteIntegrationConnection } = await import("./db");
        await deleteIntegrationConnection(input.id);
        return { success: true };
      }),
    logs: protectedProcedure
      .input(z.object({ connectionId: z.number(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        const { getSyncLogs } = await import("./db");
        return await getSyncLogs(input.connectionId, input.limit);
      }),
  }),

  agrian: router({
    searchProducts: protectedProcedure
      .input((raw: any) => raw)
      .query(async ({ input }) => {
        const { searchAgrianProducts } = await import("./agrian");
        return await searchAgrianProducts(input);
      }),
    getProductDetail: protectedProcedure
      .input((raw: any) => raw)
      .query(async ({ input }) => {
        const { getAgrianProductDetail } = await import("./agrian");
        return await getAgrianProductDetail(input.url, input.state, input.commodity);
      }),
  }),

  // Service Plans router
  servicePlans: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getOrCreateUserOrganization, getServicePlansByOrgId } = await import("./db");
      const org = await getOrCreateUserOrganization(ctx.user.id);
      return await getServicePlansByOrgId(org.id);
    }),
    create: protectedProcedure
      .input(z.object({
        customerId: z.number().min(1, "Customer is required"),
        siteId: z.number().optional(),
        planName: z.string().min(1, "Plan name is required"),
        planType: z.enum(["monthly", "quarterly", "bi_monthly", "annual", "one_off"]),
        startDate: z.string().min(1, "Start date is required"),
        endDate: z.string().optional(),
        nextServiceDate: z.string().optional(),
        defaultZones: z.string().optional(), // JSON string
        defaultProducts: z.string().optional(), // JSON string
        defaultTargetPests: z.string().optional(), // JSON string
        pricePerService: z.string().optional(),
        currency: z.string().default("USD"),
        status: z.enum(["active", "paused", "cancelled", "completed"]).default("active"),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getOrCreateUserOrganization, createServicePlan } = await import("./db");
        const org = await getOrCreateUserOrganization(ctx.user.id);
        return await createServicePlan({
          orgId: org.id,
          ...input,
          defaultZones: input.defaultZones ? JSON.parse(input.defaultZones) : null,
          defaultProducts: input.defaultProducts ? JSON.parse(input.defaultProducts) : null,
          defaultTargetPests: input.defaultTargetPests ? JSON.parse(input.defaultTargetPests) : null,
        });
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        customerId: z.number().optional(),
        siteId: z.number().optional(),
        planName: z.string().min(1, "Plan name is required").optional(),
        planType: z.enum(["monthly", "quarterly", "bi_monthly", "annual", "one_off"]).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        nextServiceDate: z.string().optional(),
        defaultZones: z.string().optional(), // JSON string
        defaultProducts: z.string().optional(), // JSON string
        defaultTargetPests: z.string().optional(), // JSON string
        pricePerService: z.string().optional(),
        currency: z.string().optional(),
        status: z.enum(["active", "paused", "cancelled", "completed"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { updateServicePlan } = await import("./db");
        const { id, ...rest } = input;
        return await updateServicePlan(id, {
          ...rest,
          defaultZones: rest.defaultZones ? JSON.parse(rest.defaultZones) : undefined,
          defaultProducts: rest.defaultProducts ? JSON.parse(rest.defaultProducts) : undefined,
          defaultTargetPests: rest.defaultTargetPests ? JSON.parse(rest.defaultTargetPests) : undefined,
        });
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteServicePlan } = await import("./db");
        await deleteServicePlan(input.id);
        return { success: true };
      }),
    processNow: protectedProcedure
      .mutation(async ({ ctx }) => {
        const { user } = ctx;
        // Only allow admin users to trigger processing
        if (user.role !== 'admin') {
          throw new Error('Only administrators can trigger service plan processing');
        }
        const { triggerServicePlanProcessing } = await import("./servicePlanScheduler");
        const result = await triggerServicePlanProcessing();
        return result;
      }),
  }),
  email: router({
    sendTest: protectedProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input, ctx }) => {
        const { user } = ctx;
        // Only allow admin users to send test emails
        if (user.role !== 'admin') {
          throw new Error('Only administrators can send test emails');
        }
        const { sendTestEmail } = await import("./email");
        const result = await sendTestEmail(input.email);
        if (!result.success) {
          throw new Error('Failed to send test email');
        }
        return { success: true, messageId: result.messageId };
      }),
  }),
  
  // Audit Log router
  auditLogs: router({
    list: protectedProcedure
      .input(z.object({
        userId: z.number().optional(),
        action: z.enum(["create", "update", "delete", "login", "logout", "role_change", "status_change", "export", "import", "view"]).optional(),
        entityType: z.enum(["user", "customer", "personnel", "job", "site", "equipment", "product", "service_plan", "maintenance_task", "organization", "integration", "job_status"]).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        const { getOrCreateUserOrganization, getAuditLogs } = await import("./db");
        const org = await getOrCreateUserOrganization(ctx.user.id);
        
        const filters = input ? {
          ...input,
          startDate: input.startDate ? new Date(input.startDate) : undefined,
          endDate: input.endDate ? new Date(input.endDate) : undefined,
        } : undefined;
        
        return await getAuditLogs(org.id, filters);
      }),
    
    getByEntity: protectedProcedure
      .input(z.object({
        entityType: z.enum(["user", "customer", "personnel", "job", "site", "equipment", "product", "service_plan", "maintenance_task", "organization", "integration", "job_status"]),
        entityId: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        const { getOrCreateUserOrganization, getAuditLogsByEntity } = await import("./db");
        const org = await getOrCreateUserOrganization(ctx.user.id);
        return await getAuditLogsByEntity(org.id, input.entityType, input.entityId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        action: z.enum(["create", "update", "delete", "login", "logout", "role_change", "status_change", "export", "import", "view"]),
        entityType: z.enum(["user", "customer", "personnel", "job", "site", "equipment", "product", "service_plan", "maintenance_task", "organization", "integration", "job_status"]),
        entityId: z.number().optional(),
        entityName: z.string().optional(),
        changes: z.any().optional(),
        metadata: z.any().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getOrCreateUserOrganization, createAuditLog } = await import("./db");
        const org = await getOrCreateUserOrganization(ctx.user.id);
        
        // Get IP address and user agent from request
        const ipAddress = ctx.req.ip || ctx.req.socket.remoteAddress || null;
        const userAgent = ctx.req.headers['user-agent'] || null;
        
        return await createAuditLog({
          organizationId: org.id,
          userId: ctx.user.id,
          action: input.action,
          entityType: input.entityType,
          entityId: input.entityId || null,
          entityName: input.entityName || null,
          changes: input.changes || null,
          ipAddress,
          userAgent,
          metadata: input.metadata || null,
        });
      }),
  }),
  
  // User Management router
  users: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getOrCreateUserOrganization, getUsersByOrgId } = await import("./db");
      const org = await getOrCreateUserOrganization(ctx.user.id);
      return await getUsersByOrgId(org.id);
    }),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email format"),
        userRole: z.enum(["admin", "manager", "technician", "pilot", "sales"]),
      }))
      .mutation(async ({ input, ctx }) => {
        // Only admins can create users
        if (ctx.user.userRole !== 'admin') {
          throw new Error('Only administrators can create users');
        }
        const { createUser } = await import("./db");
        const user = await createUser(input);
        return user;
      }),
    updateRole: protectedProcedure
      .input(z.object({
        userId: z.number(),
        userRole: z.enum(["admin", "manager", "technician", "pilot", "sales"]),
      }))
      .mutation(async ({ input, ctx }) => {
        // Only admins can update roles
        if (ctx.user.userRole !== 'admin') {
          throw new Error('Only administrators can update user roles');
        }
        const { updateUserRole } = await import("./db");
        await updateUserRole(input.userId, input.userRole);
        return { success: true };
      }),
  }),

  // Jobs V2 router - Comprehensive job management
  jobsV2: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getOrCreateUserOrganization, getJobsV2WithRelations } = await import("./db");
      const org = await getOrCreateUserOrganization(ctx.user.id);
      return await getJobsV2WithRelations(org.id);
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const { getJobV2WithProduct } = await import("./db");
        return await getJobV2WithProduct(input.id);
      }),
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1, "Job title is required"),
        description: z.string().optional(),
        jobType: z.enum(["crop_dusting", "pest_control", "fertilization", "herbicide"]).optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        status: z.enum(["pending", "ready", "in_progress", "completed", "cancelled"]).optional(),
        customerId: z.number().optional(),
        personnelId: z.number().optional(),
        equipmentId: z.number().optional(),
        location: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        scheduledStart: z.string().optional(), // ISO date string
        scheduledEnd: z.string().optional(), // ISO date string
      }))
      .mutation(async ({ ctx, input }) => {
        const { getOrCreateUserOrganization, createJobV2 } = await import("./db");
        const org = await getOrCreateUserOrganization(ctx.user.id);
        return await createJobV2({
          orgId: org.id,
          title: input.title,
          description: input.description || null,
          jobType: input.jobType || "crop_dusting",
          priority: input.priority || "medium",
          statusId: input.statusId || null,
          customerId: input.customerId || null,
          assignedPersonnelId: input.personnelId || null,
          equipmentId: input.equipmentId || null,
          locationAddress: input.location || null,
          locationLat: input.latitude ? input.latitude.toString() : null,
          locationLng: input.longitude ? input.longitude.toString() : null,
          scheduledStart: input.scheduledStart ? new Date(input.scheduledStart) : null,
          scheduledEnd: input.scheduledEnd ? new Date(input.scheduledEnd) : null,
        });
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1, "Job title is required").optional(),
        description: z.string().optional(),
        jobType: z.enum(["crop_dusting", "pest_control", "fertilization", "herbicide"]).optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        status: z.enum(["pending", "ready", "in_progress", "completed", "cancelled"]).optional(),
        customerId: z.number().nullable().optional(),
        personnelId: z.number().nullable().optional(),
        equipmentId: z.number().nullable().optional(),
        location: z.string().nullable().optional(),
        latitude: z.number().nullable().optional(),
        longitude: z.number().nullable().optional(),
        scheduledStart: z.string().nullable().optional(),
        scheduledEnd: z.string().nullable().optional(),
      }))
      .mutation(async ({ input }) => {
        const { updateJobV2 } = await import("./db");
        const { id, ...updates } = input;
        return await updateJobV2(id, {
          ...updates,
          scheduledStart: updates.scheduledStart ? new Date(updates.scheduledStart) : undefined,
          scheduledEnd: updates.scheduledEnd ? new Date(updates.scheduledEnd) : undefined,
        });
      }),
    linkProduct: protectedProcedure
      .input(z.object({
        jobId: z.number(),
        productId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const { updateJobV2Product } = await import("./db");
        return await updateJobV2Product(input.jobId, input.productId);
      }),
    // Dropdown data endpoints
    getCustomers: protectedProcedure.query(async ({ ctx }) => {
      const { getOrCreateUserOrganization, getCustomersByOrgId } = await import("./db");
      const org = await getOrCreateUserOrganization(ctx.user.id);
      return await getCustomersByOrgId(org.id);
    }),
    getPersonnel: protectedProcedure.query(async ({ ctx }) => {
      const { getOrCreateUserOrganization, getPersonnelByOrgId } = await import("./db");
      const org = await getOrCreateUserOrganization(ctx.user.id);
      return await getPersonnelByOrgId(org.id);
    }),
    getEquipment: protectedProcedure.query(async ({ ctx }) => {
      const { getOrCreateUserOrganization, getEquipmentByOrgId } = await import("./db");
      const org = await getOrCreateUserOrganization(ctx.user.id);
      return await getEquipmentByOrgId(org.id);
    }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteJobV2 } = await import("./db");
        return await deleteJobV2(input.id);
      }),
    // Map Files endpoints
    uploadMapFile: protectedProcedure
      .input(z.object({
        jobId: z.number(),
        name: z.string(),
        fileType: z.enum(["kml", "gpx", "geojson"]),
        fileContent: z.string(), // Base64 encoded file content
        fileSize: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const { getOrCreateUserOrganization, createMapFile } = await import("./db");
          const { storagePut } = await import("./storage");
          const org = await getOrCreateUserOrganization(ctx.user.id);
          
          // Decode base64 and upload to S3
          const fileBuffer = Buffer.from(input.fileContent, 'base64');
          const fileKey = `org-${org.id}/jobs/${input.jobId}/maps/${Date.now()}-${input.name}`;
          const { url } = await storagePut(fileKey, fileBuffer, `application/${input.fileType}`);
          
          console.log('[uploadMapFile] About to insert:', {
            jobId: input.jobId,
            orgId: org.id,
            name: input.name,
            fileType: input.fileType,
            fileUrl: url,
            fileKey,
            fileSize: input.fileSize,
            uploadedBy: ctx.user.id,
          });
          
          const result = await createMapFile({
            jobId: input.jobId,
            orgId: org.id,
            name: input.name,
            fileType: input.fileType,
            fileUrl: url,
            fileKey,
            fileSize: input.fileSize,
            uploadedBy: ctx.user.id,
          });
          
          console.log('[uploadMapFile] Insert successful:', result);
          return result;
        } catch (error) {
          console.error('[uploadMapFile] ERROR:', error);
          console.error('[uploadMapFile] Error stack:', error instanceof Error ? error.stack : 'No stack');
          console.error('[uploadMapFile] Error message:', error instanceof Error ? error.message : String(error));
          throw error;
        }
      }),
    getMapFiles: protectedProcedure
      .input(z.object({ jobId: z.number() }))
      .query(async ({ input }) => {
        const { getMapFilesByJobId } = await import("./db");
        return await getMapFilesByJobId(input.jobId);
      }),
    deleteMapFile: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteMapFile } = await import("./db");
        // TODO: Also delete from S3 using fileKey
        return await deleteMapFile(input.id);
      }),
  }),

  // API Key Management
  apiKeys: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getOrCreateUserOrganization, getApiKeysByOrgId } = await import("./db");
      const org = await getOrCreateUserOrganization(ctx.user.id);
      return await getApiKeysByOrgId(org.id);
    }),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1, "Name is required"),
        description: z.string().optional(),
        permissions: z.array(z.string()),
        expiresAt: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getOrCreateUserOrganization, createApiKey } = await import("./db");
        const bcrypt = await import("bcrypt");
        const crypto = await import("crypto");
        
        const org = await getOrCreateUserOrganization(ctx.user.id);
        
        // Generate API key: rts_live_<random>
        const randomBytes = crypto.randomBytes(32).toString("hex");
        const apiKey = `rts_live_${randomBytes}`;
        const keyHash = await bcrypt.hash(apiKey, 10);
        const keyPrefix = apiKey.substring(0, 12); // rts_live_xxx
        
        const newKey = await createApiKey({
          organizationId: org.id,
          name: input.name,
          description: input.description,
          keyHash,
          keyPrefix,
          permissions: input.permissions,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
          createdBy: ctx.user.id,
        });
        
        // Return the plain key only once
        return { ...newKey, plainKey: apiKey };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteApiKey } = await import("./db");
        await deleteApiKey(input.id);
        return { success: true };
      }),
  }),

  // Job Sharing
  jobShares: router({
    list: protectedProcedure
      .input(z.object({ jobId: z.number() }))
      .query(async ({ input }) => {
        const { getJobSharesByJobId } = await import("./db");
        return await getJobSharesByJobId(input.jobId);
      }),
    create: protectedProcedure
      .input(z.object({
        jobId: z.number(),
        title: z.string().optional(),
        expiresAt: z.string().optional(),
        allowDownloads: z.boolean().default(true),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createJobShare } = await import("./db");
        const crypto = await import("crypto");
        
        const shareToken = crypto.randomBytes(32).toString("hex");
        
        return await createJobShare({
          jobId: input.jobId,
          shareToken,
          title: input.title,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
          allowDownloads: input.allowDownloads,
          createdBy: ctx.user.id,
        });
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteJobShare } = await import("./db");
        await deleteJobShare(input.id);
        return { success: true };
      }),
    getByToken: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const { getJobShareByToken, updateJobShareAccess, getJobById } = await import("./db");
        
        const share = await getJobShareByToken(input.token);
        if (!share) {
          throw new Error("Share not found");
        }
        
        if (!share.isActive) {
          throw new Error("Share has been revoked");
        }
        
        if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
          throw new Error("Share has expired");
        }
        
        // Update access tracking
        await updateJobShareAccess(share.id);
        
        // Get job details
        const job = await getJobById(share.jobId);
        
        return { share, job };
      }),
  }),
});

export type AppRouter = typeof appRouter;
