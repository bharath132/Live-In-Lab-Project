'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/report'); // Auto-redirects to report
  }, [router]);

  return (
    <div style={{ padding: '60px', textAlign: 'center' }}>
      <h1>Redirecting...</h1>
      <p>Taking you to the Report Page.</p>
    </div>
  );
}
