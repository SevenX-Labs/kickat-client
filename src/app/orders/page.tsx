"use client";

import { Suspense } from 'react';
import OrdersPageClient from '@/components/orders/OrdersPageClient';

export default function StandaloneOrdersPage() {
  return (
    <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center' }}>Loading orders...</div>}>
      <OrdersPageClient showBackToAccount={false} />
    </Suspense>
  );
}
