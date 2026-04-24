import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../services/api';

export function useAdminStats() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await adminAPI.stats();
      setStats(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { stats, loading, error, refetch: fetch };
}

export function useAdminUsers(params = {}) {
  const [users, setUsers]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getUsers(params);
      const users = Array.isArray(data) ? data : data.users || [];
      setUsers(users);
      setTotal(Array.isArray(data) ? users.length : data.total || users.length);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { users, total, loading, refetch: fetch };
}
