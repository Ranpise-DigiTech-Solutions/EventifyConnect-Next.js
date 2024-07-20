import React, { Suspense } from "react";

const UserProfileLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main>
      <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
    </main>
  );
};

export default UserProfileLayout;
