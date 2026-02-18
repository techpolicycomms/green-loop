"use client";

export default function Nav() {
  return (
    <nav style={{ padding: 12, borderBottom: "1px solid #ddd" }}>
      <a href="/" style={{ marginRight: 12 }}>Home</a>
      <a href="/volunteer" style={{ marginRight: 12 }}>Volunteer</a>
      <a href="/organizer" style={{ marginRight: 12 }}>Organizer</a>
      <a href="/admin" style={{ marginRight: 12 }}>Admin</a>

      <form action="/auth/signout" method="post" style={{ display: "inline" }}>
        <button style={{ marginLeft: 12 }} type="submit">Sign out</button>
      </form>
    </nav>
  );
}
