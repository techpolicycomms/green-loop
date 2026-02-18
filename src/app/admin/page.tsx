"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);

  const load = async () => {
    const res = await fetch("/api/admin/users");
    setUsers(await res.json());
  };

  useEffect(() => void load(), []);

  return (
    <main>
      <h2>Admin Panel</h2>
      <p>List of users (admin-only API).</p>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ddd", textAlign: "left" }}>Email</th>
            <th style={{ borderBottom: "1px solid #ddd", textAlign: "left" }}>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>{u.email}</td>
              <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
