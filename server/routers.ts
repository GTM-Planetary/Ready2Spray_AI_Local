import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
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
  }),

  // Customer router
  customers: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getOrCreateUserOrganization, getCustomersByOrgId } = await import("./db");
      const org = await getOrCreateUserOrganization(ctx.user.id);
      return await getCustomersByOrgId(org.id);
    }),
    create: protectedProcedure
      .input((raw: any) => raw)
      .mutation(async ({ ctx, input }) => {
        const { getOrCreateUserOrganization, createCustomer } = await import("./db");
        const org = await getOrCreateUserOrganization(ctx.user.id);
        return await createCustomer({ ...input, orgId: org.id });
      }),
    update: protectedProcedure
      .input((raw: any) => raw)
      .mutation(async ({ input }) => {
        const { updateCustomer } = await import("./db");
        return await updateCustomer(input.id, input);
      }),
    delete: protectedProcedure
      .input((raw: any) => raw)
      .mutation(async ({ input }) => {
        const { deleteCustomer } = await import("./db");
        await deleteCustomer(input.id);
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
      .input((raw: any) => raw)
      .mutation(async ({ ctx, input }) => {
        const { getOrCreateUserOrganization, createJob } = await import("./db");
        const org = await getOrCreateUserOrganization(ctx.user.id);
        return await createJob({ ...input, orgId: org.id });
      }),
    update: protectedProcedure
      .input((raw: any) => raw)
      .mutation(async ({ input }) => {
        const { updateJob } = await import("./db");
        return await updateJob(input.id, input);
      }),
    delete: protectedProcedure
      .input((raw: any) => raw)
      .mutation(async ({ input }) => {
        const { deleteJob } = await import("./db");
        await deleteJob(input.id);
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
      .input((raw: any) => raw)
      .mutation(async ({ ctx, input }) => {
        const { getOrCreateUserOrganization, createPersonnel } = await import("./db");
        const org = await getOrCreateUserOrganization(ctx.user.id);
        return await createPersonnel({ ...input, orgId: org.id });
      }),
    update: protectedProcedure
      .input((raw: any) => raw)
      .mutation(async ({ input }) => {
        const { updatePersonnel } = await import("./db");
        return await updatePersonnel(input.id, input);
      }),
    delete: protectedProcedure
      .input((raw: any) => raw)
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
  }),
});

export type AppRouter = typeof appRouter;
