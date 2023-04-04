import {
  SignInButton, useUser
} from "@clerk/nextjs";
import { type NextPage } from "next";
import Image from "next/image";
import { useState } from "react";

import { api } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import LoadingSpinner from "~/components/LoadingSpinner";
import { ZodError } from "zod";
import { toast } from "react-hot-toast";
import PageLayout from "~/components/PageLayout";
import { PostView } from "~/components/PostView";
dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();
  const [formInput, setFormInput] = useState("");

  if (!user) return null;

  const createPostRoute = api.useContext().posts;

  const { mutate, isLoading: isPosting } = api.posts.createPost.useMutation({
    onSuccess: () => {
      setFormInput("");
      void createPostRoute.invalidate();
    },
    onError: () => {
      if (ZodError) {
        toast.error("You can only post emojis!");
      }
    },
  });

  return (
    <div className="flex w-full space-x-4">
      <Image
        src={user.profileImageUrl}
        alt={user.fullName ?? ""}
        width={56}
        height={56}
        className="rounded-full"
      />
      <div className="flex w-full items-center justify-between">
        <input
          type="text"
          placeholder="Type some emojis here!"
          className="grow rounded-xl bg-transparent p-3 focus:outline-none"
          value={formInput}
          onChange={(e) => setFormInput(e.target.value)}
          disabled={isPosting}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (formInput !== "") mutate({ content: formInput });
            }
          }}
        />
        {/* {isPosting && <LoadingSpinner />} */}
        {formInput.length > 0 &&
          (isPosting ? (
            <LoadingSpinner size={20} />
          ) : (
            <button onClick={() => mutate({ content: formInput })}>Post</button>
          ))}
      </div>
    </div>
  );
};



const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading)
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center">
        <h1 className="text-xl">Loading...</h1>
        {/* <BiLoader className="animate-spin text-7xl" /> */}
        <LoadingSpinner size={64} />
      </div>
    );

  if (!data) return <div className="">Something went wrong!</div>;

  return (
    <div className="flex flex-col">
      {data?.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  // start fetching asap, if you fetch multiple times it will just used cached data
  api.posts.getAll.useQuery();

  if (!userLoaded) return <div />;

  return (
    <>
      <PageLayout>
        <div className="flex border-b border-slate-400 p-4">
          {!isSignedIn && (
            <div className="flex w-full items-center justify-center ">
              <SignInButton />
            </div>
          )}
          {isSignedIn && <CreatePostWizard />}
        </div>
        <Feed />
      </PageLayout>
    </>
  );
};

export default Home;
