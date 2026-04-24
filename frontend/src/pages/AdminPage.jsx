import { useEffect, useState } from 'react';
import api from '../services/api';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    api.get('/api/admin/users', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(({ data }) => setUsers(Array.isArray(data) ? data : data.users || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Students</h1>
      {users.map((user) => (
        <div key={user._id || user.email}>
          <p>{user.name}</p>
          <p>{user.email}</p>
        </div>
      ))}
    </div>
  );
}
