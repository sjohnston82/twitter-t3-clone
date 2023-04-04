import type { User } from "@clerk/nextjs/dist/api";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

import { filterUserForClient } from "~/server/helpers/filterUserForClient";

export const profileRouter = createTRPCRouter({
  getUserByUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      const [user] = await clerkClient.users.getUserList({
        username: [input.username],
      });

      if (!user)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User not found.",
        });

      return filterUserForClient(user);
    }),
});
