"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OrdersPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/account/orders');
  }, [router]);

  return (
    <div style={{ padding: '100px', textAlign: 'center', color: '#78746D' }}>
      Redirecting to My Orders...
    </div>
  );
}
