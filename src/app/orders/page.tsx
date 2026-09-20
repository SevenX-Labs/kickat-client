"use client";

import { Suspense } from 'react';
import OrdersContent from '@/components/orders/OrdersContent';
import styles from '@/app/account/Account.module.css';

export default function StandaloneOrdersPage() {
  return (
    <div className={styles.pageWrapper}>
      <main className={styles.container}>
        <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center' }}>Loading orders...</div>}>
          <OrdersContent showBackToAccount={false} />
        </Suspense>
      </main>
    </div>
  );
}
