"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Search, ArrowLeft, Clock, TrendingUp, X } from 'lucide-react';
import styles from './Search.module.css';
import { CATALOG_PRODUCTS } from '@/data/categoryData';
import ProductCard from '@/components/common/ProductCard/ProductCard';

const RECENT_SEARCHES = ['Dog food', 'Cat toys', 'Leash', 'Anti-slip bowl'];
const TRENDING_SEARCHES = ['Premium dog food', 'Cat tree', 'Winter coat for dogs', 'Automatic feeder'];


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
              <span style={{ color: '#888', fontSize: '0.9rem' }}>2 items found</span>
            </div>
            
            <div className={styles.resultsGrid}>
              {CATALOG_PRODUCTS.slice(0, 2).map(product => (
                <ProductCard key={product.id} product={product as any} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
