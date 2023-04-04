import type { User } from "@clerk/nextjs/dist/api";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";


const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profilePicture: user.profileImageUrl,
  };
};



export const postsRouter = createTRPCRouter({
  findUser: publicProcedure.input(z.object({
    username: z.string()
  })).query(async({ctx: {prisma}, input: {username}}) => {
    const foundUser = await prisma.post.findUnique({
      where: {
        username: username
      }
    })
  })
  
});
