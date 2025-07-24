import { useUser } from '@clerk/nextjs';

export function useAdmin() {
  const { user, isLoaded } = useUser();
  
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_USER;
  
  const isAdmin = isLoaded && user && adminEmail && 
    user.emailAddresses.some(email => email.emailAddress === adminEmail);
  
  return {
    isAdmin: !!isAdmin,
    isLoaded,
    user
  };
}
