import { Suspense } from 'react';
import { ProductDetail } from '@/components/shop/ProductDetail/ProductDetail';
import { ProductDetailSkeleton } from '@/components/shop/ProductDetail/ProductDetailSkeleton';
import { productService } from '@/services/productService';
import { transformBackendProduct } from '@/types/product';
import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const res = await productService.getProductById(resolvedParams.id);
    if (res.success && res.product) {
      return {
        title: `${res.product.name} | KickAt`,
        description: res.product.description?.slice(0, 160) || 'Premium pet products for your best friend.',
      };
    }
  } catch {}
  return {
    title: 'KickAt | Product Details',
    description: 'Premium pet products for your best friend.',
  };
}

async function ProductContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const idOrSlug = resolvedParams.id;

  let product = null;

  try {
    const res = await productService.getProductById(idOrSlug);
    if (res.success && res.product) {
      product = transformBackendProduct(res.product);
    }
  } catch (err) {
    console.error('Failed to load product by id/slug:', idOrSlug, err);
  }

  if (!product) {
    return (
      <div style={{ padding: '6rem 1rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: '#FEE2E2',
          color: '#DC2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
        }}>
          <AlertCircle size={32} />
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1A1612', marginBottom: '0.75rem' }}>
          Product Not Found
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#78746D', marginBottom: '2rem', lineHeight: 1.5 }}>
          The pet essential you are looking for might have been moved, sold out, or does not exist.
        </p>
        <Link href="/category">
          <Button variant="primary" icon={<ArrowLeft size={16} />}>
            Explore Products
          </Button>
        </Link>
      </div>
    );
  }

  return <ProductDetail product={product as any} />;
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  );
}
