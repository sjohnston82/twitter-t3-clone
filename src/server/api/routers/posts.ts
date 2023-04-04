
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";

import { filterUserForClient } from "~/server/helpers/filterUserForClient";


// Create a new ratelimiter, that allows 3 requests per 1 minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */
  prefix: "@upstash/ratelimit",
});

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
      orderBy: {
        createdAt: "desc",
      },
    });

    const users = (
      await clerkClient.users.getUserList({
        userId: posts.map((post) => post.authorId),
        limit: 100,
      })
    ).map(filterUserForClient);

    return posts.map((post) => {
      const author = users.find((user) => user.id === post.authorId);

      if (!author || !author.username)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Author does not exist.",
        });

      return {
        post,
        author: {
          ...author,
          username: author.username,
        },
      };
    });
  }),

  createPost: privateProcedure
    .input(
      z.object({
        content: z.string().emoji().min(1).max(288),
      })
    )
    .mutation(async ({ ctx: { prisma, userId }, input: { content } }) => {

      const authorId = userId;

      const {success} = await ratelimit.limit(authorId)

      if (!success) throw new TRPCError({code: "TOO_MANY_REQUESTS", message: "You are only allowed five posts per minute."})

      await prisma.post.create({
        data: {
          content,
          authorId
        },
      });
    }),

  // getPostsByUsername: publicProcedure.input(z.object({username: z.string()})).query(async ({ ctx: { prisma, input}}) => {
  //   const [user] = await clerkClient.users.getUserList({
  //       username: [input.username],
  //     });

  //     if (!user)
  //       throw new TRPCError({
  //         code: "BAD_REQUEST",
  //         message: "User not found.",
  //       });
    
  //   const posts = await prisma.post.findMany({
  //     where: {
  //       authorId
  //     }
  //   })
  // })
});
