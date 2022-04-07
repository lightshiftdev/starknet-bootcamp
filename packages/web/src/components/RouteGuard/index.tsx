import { useStarknet } from '@starknet-react/core';
import { useRouter } from 'next/router';
import { FC, ReactNode, useCallback, useEffect, useState } from 'react';

interface Props {
  children: ReactNode,
}

const RouteGuard:FC<Props> = ({ children }) => {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const starknetState = useStarknet();

  
  const authCheck = useCallback((url: string) => {
    // redirect to login page if accessing a private page and not logged in 
    const publicPaths = ['/'];
    const path = url.split('?')[0];
    
    if (!starknetState.account && !publicPaths.includes(path)) {
      setAuthorized(false);
      router.push({
        pathname: '/',
        query: { returnUrl: router.asPath }
      });
    } else {
      setAuthorized(true);
    }
  }, [starknetState.account, router, setAuthorized]);
  
  useEffect(() => {
    // on initial load - run auth check 
    authCheck(router.asPath);
    
    // on route change start - hide page content by setting authorized to false  
    const hideContent = () => setAuthorized(false);
    router.events.on('routeChangeStart', hideContent);
    
    // on route change complete - run auth check 
    router.events.on('routeChangeComplete', authCheck)
    
    // unsubscribe from events in useEffect return function
    return () => {
      router.events.off('routeChangeStart', hideContent);
      router.events.off('routeChangeComplete', authCheck);
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [starknetState.account, router, setAuthorized, authCheck]);

  return (authorized ? <>{children}</> : null);
}

export default RouteGuard;
