import { useState, useEffect, useCallback } from 'react';
import { attendanceAPI } from '../services/api';
import { currentMonth } from '../utils/helpers';

export function useAttendance(month = currentMonth()) {
  const [data, setData]       = useState({ records: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: res } = await attendanceAPI.my(month);
      setData(res);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => { fetch(); }, [fetch]);

  return { ...data, loading, error, refetch: fetch };
}

export function useTodayAttendance() {
  const [record, setRecord]   = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await attendanceAPI.today();
      setRecord(data.record);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { record, loading, refetch: fetch };
}
