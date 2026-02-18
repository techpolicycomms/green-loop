import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <h1>Idea One (GreenLoop MVP)</h1>
      <p>Login, then use role-based dashboards.</p>

      <ul>
        <li><Link href="/login">Login</Link></li>
        <li><Link href="/volunteer">Volunteer</Link></li>
        <li><Link href="/organizer">Organizer</Link></li>
        <li><Link href="/admin">Admin</Link></li>
      </ul>
    </main>
  );
}
