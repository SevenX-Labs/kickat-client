"use client";

import { Suspense } from 'react';
import OrdersContent from '@/components/orders/OrdersContent';

export default function AccountOrdersPage() {
  return (
    <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center' }}>Loading orders...</div>}>
      <OrdersContent showBackToAccount={true} />
    </Suspense>
  );
}
