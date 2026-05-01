"use client"

import { SignIn } from "@clerk/nextjs"

export default function Page() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh' 
    }}>
      <SignIn 
        fallbackRedirectUrl="/dashboard"
        signUpFallbackRedirectUrl="/onboarding"
      />
    </div>
  );
}