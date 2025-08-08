import React, { useState, useEffect } from 'react';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true); // เริ่มที่ true
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/users')
      .then((res) => {
        if (!res.ok) throw new Error('โหลดไม่สำเร็จ');
        return res.json();
      })
      .then((data) => setUsers(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []); // ทำแค่ตอนแรก

  if (loading) return <p>กำลังโหลดข้อมูล...</p>;
  if (error) return <p>เกิดข้อผิดพลาด: {error}</p>;

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name} ({user.email})</li>
      ))}
    </ul>
  );
};

export default UserList;