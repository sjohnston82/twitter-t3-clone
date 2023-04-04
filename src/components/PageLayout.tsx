import React, { type PropsWithChildren } from "react";

const PageLayout = ({ children }: PropsWithChildren) => {
  return (
    <main className="flex h-full w-full justify-center">
      <div className="h-full min-h-screen w-full border-x border-slate-400 md:max-w-2xl">
        {children}
      </div>
    </main>
  );
};

export default PageLayout;
