import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { api } from "~/utils/api";
import { IoArrowBackSharp } from "react-icons/io5";

// type PageProps = InferGetStaticPropsType<typeof getStaticProps>
const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading)
    return (
      <div className="mt-16 flex h-full w-full items-center justify-center">
        <LoadingSpinner size={64} />
      </div>
    );
  if (!data || data.length === 0)
    return <div className="">User has no posts.</div>;
  return (
    <div className="flex flex-col">
      {data?.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({
    username,
  });

  if (!data) return <div className="">Something went wrong!</div>;

  console.log(data);

  return (
    <>
      <Head>
        <title>{`${username}'s Profile`}</title>
      </Head>
      <div className="group absolute left-2 top-2">
        <Link
          href="/"
          className="flex items-center gap-1 group-hover:text-slate-400"
        >
          <IoArrowBackSharp />
          Return Home
        </Link>
      </div>
      <PageLayout>
        <div className="relative h-36">
          <div className="absolute -bottom-10 left-6 h-full w-full">
            <Image
              src={data.profilePicture}
              alt={data.username ?? ""}
              width={200}
              height={200}
              className="rounded-full border-4 border-black"
            />
          </div>
        </div>
        <div className="flex h-36 items-end justify-end bg-slate-700 p-4 text-4xl ">
          @{data.username}
        </div>
        <div className="">
          <ProfileFeed userId={data.id} />
        </div>
      </PageLayout>
    </>
  );
};

import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import superjson from "superjson";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import PageLayout from "~/components/PageLayout";
import LoadingSpinner from "~/components/LoadingSpinner";
import { PostView } from "~/components/PostView";
import Link from "next/link";

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson, // optional - adds superjson serialization
  });

  const slug = context.params?.slug;
  if (typeof slug !== "string") throw new Error("No slug.");

  const username = slug.replace("@", "");

  await ssg.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;
