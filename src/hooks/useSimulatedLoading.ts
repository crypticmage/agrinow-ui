import { useState, useEffect } from "react";

export function useSimulatedLoading(delayMs: number = 1000) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [delayMs]);

  return loading;
}
