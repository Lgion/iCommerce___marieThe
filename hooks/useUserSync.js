import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export function useUserSync() {
  const { user, isLoaded } = useUser();
  const [dbUser, setDbUser] = useState(null);
  const [isSync, setIsSync] = useState(false);

  useEffect(() => {
    if (isLoaded && user && !isSync) {
      syncUserToDatabase();
    }
  }, [isLoaded, user, isSync]);

  const syncUserToDatabase = async () => {
    try {
      setIsSync(true);
      
      const response = await fetch('/api/users/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName
        })
      });

      if (response.ok) {
        const result = await response.json();
        setDbUser(result.user);
        
        if (result.created) {
          console.log('✅ Nouvel utilisateur synchronisé avec la DB');
        } else {
          console.log('✅ Utilisateur existant mis à jour');
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation:', error);
    }
  };

  return {
    clerkUser: user,
    dbUser,
    isLoaded,
    isSync
  };
}
