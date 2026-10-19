import { useCallback, useEffect, useState } from 'react';

export function useRouter() {
  const [pathname, setPathname] = useState<string>(() =>
    typeof window !== 'undefined' ? window.location.pathname : '/',
  );

  useEffect(() => {
    const onPopState = () => {
      setPathname(window.location.pathname);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((to: string, replace = false) => {
    if (typeof window === 'undefined') return;

    // Normalizing URL path
    const targetPath = to.startsWith('/') ? to : `/${to}`;
    if (window.location.pathname === targetPath) return;

    if (replace) {
      window.history.replaceState({}, '', targetPath);
    } else {
      window.history.pushState({}, '', targetPath);
    }
    setPathname(targetPath);
  }, []);

  return { pathname, navigate };
}
