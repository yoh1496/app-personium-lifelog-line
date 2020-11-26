import { useState, useEffect } from 'react';
import liff from '@line/liff';

export function useLiffInitialize(liffId) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    liff
      .init({ liffId })
      .then(() => {
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        setError(err);
      });
  });

  return { loading, error };
}
