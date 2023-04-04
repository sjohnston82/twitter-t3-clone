import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import type { RouterOutputs } from "~/utils/api";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][0];

export const PostView = ({ post, author }: PostWithUser) => {
  if (!post) return null;
  return (
    <div className="flex items-center space-x-4 border-b border-slate-400 p-4 last:border-none">
      {author && (
        <Image
          src={author.profilePicture}
          alt={author.username ?? ""}
          width={56}
          height={56}
          className="rounded-full"
        />
      )}
      <div className="flex flex-col">
        <div className="text-slate-300">
          <Link href={`/${author.username}`}>
            <span>{`@${author.username}`}</span> ∙{" "}
          </Link>
          <Link href={`/post/${post.id}`}>
            <span className="text-sm">{dayjs(post.createdAt).fromNow()}</span>
          </Link>
        </div>
        <div className="text-2xl">{post.content}</div>
      </div>
    </div>
  );
};
