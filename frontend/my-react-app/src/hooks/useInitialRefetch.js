// hooks/useInitialRefetch.js
import { useEffect } from "react";

export function useInitialRefetch(refetchFn, delay = 3000) {
  useEffect(() => {
    const timer = setTimeout(() => refetchFn(), delay);
    return () => clearTimeout(timer);
  }, [refetchFn, delay]);
}
