import { Footer, Navbar } from "@/components/global";
import React from "react";

const PrivacyPolicyLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="min-h-screen">
      <Navbar />
      {children}
      <Footer />
    </main>
  );
};

export default PrivacyPolicyLayout;
