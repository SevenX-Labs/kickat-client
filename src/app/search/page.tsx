"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ArrowLeft, Clock, TrendingUp, X } from 'lucide-react';
import styles from './Search.module.css';

const RECENT_SEARCHES = ['Dog food', 'Cat toys', 'Leash', 'Anti-slip bowl'];
const TRENDING_SEARCHES = ['Premium dog food', 'Cat tree', 'Winter coat for dogs', 'Automatic feeder'];

const MOCK_RESULTS = [
  { id: '1', name: 'Ceramic Anti-Slip Pet Bowl', category: 'Accessories', price: 1499, image: '/hero-products/pet_bowl.png' },
  { id: '2', name: 'Premium Leather Dog Collar', category: 'Accessories', price: 899, image: '/hero-products/pet_bowl.png' }, // using dummy image
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsSearching(true);
    }
  };

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.backBtn}>
          <ArrowLeft size={20} />
        </Link>
        <form className={styles.searchBar} onSubmit={handleSearch}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search for products, categories, or brands..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!e.target.value) setIsSearching(false);
            }}
            autoFocus
          />
        </form>
      </header>

      <div className={styles.container}>
        {!isSearching ? (
          <>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}><Clock size={18} /> Recent Searches</h2>
              <div className={styles.pillContainer}>
                {RECENT_SEARCHES.map(item => (
                  <div key={item} className={styles.pill} onClick={() => { setQuery(item); setIsSearching(true); }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}><TrendingUp size={18} color="#E7A03B" /> Trending Now</h2>
              <div className={styles.pillContainer}>
                {TRENDING_SEARCHES.map(item => (
                  <div key={item} className={styles.pill} onClick={() => { setQuery(item); setIsSearching(true); }}>
                    <Search size={14} color="#888" /> {item}
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className={styles.section}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Results for "{query}"</h2>
              <span style={{ color: '#888', fontSize: '0.9rem' }}>{MOCK_RESULTS.length} items found</span>
            </div>
            
            <div className={styles.resultsGrid}>
              {MOCK_RESULTS.map(product => (
                <Link href={`/product/${product.id}`} key={product.id} style={{ textDecoration: 'none' }}>
                  <div className={styles.productCard}>
                    <div className={styles.imageWrapper}>
                      <Image src={product.image} alt={product.name} fill style={{ objectFit: 'contain', padding: '1rem' }} />
                    </div>
                    <div className={styles.productTitle}>{product.name}</div>
                    <div className={styles.productMeta}>{product.category}</div>
                    <div className={styles.productPrice}>₹{product.price.toLocaleString()}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
