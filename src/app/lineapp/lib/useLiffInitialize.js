import { useState, useEffect, useCallback } from 'react';
import liff from '@line/liff';

export function useLiffInitialize(liffId) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const startInit = useCallback(() => {
    return liff.init({ liffId });
  }, [liffId]);

  useEffect(() => {
    console.log(liff.ready);
    liff.ready
      .then(() => {
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        setError(err);
      });
  });

  return { loading, error, startInit };
}
