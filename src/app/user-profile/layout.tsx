// src/app/user-profile/layout.js

import React, { Suspense } from "react";
import UserProfileSkeleton from "@/components/UserProfileSkeleton"; 

const UserProfileLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main>
      <Suspense fallback={<UserProfileSkeleton />}>{children}</Suspense>
    </main>
  );
};

export default UserProfileLayout;