"use client";

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AccountOrderTrackingRedirect({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  useEffect(() => {
    if (resolvedParams?.id) {
      router.replace(`/orders/${resolvedParams.id}/tracking`);
    }
  }, [resolvedParams, router]);

  return (
    <div style={{ padding: '100px', textAlign: 'center', color: '#78746D' }}>
      Redirecting to Order tracking...
    </div>
  );
}
