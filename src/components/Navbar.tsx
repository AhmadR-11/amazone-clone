'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [cartCount, setCartCount] = useState<number>(0);

  useEffect(() => {
    // Check session
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
          // Fetch cart
          fetch('/api/cart')
            .then((res) => res.json())
            .then((cartData) => {
              if (cartData.cart && cartData.cart.items) {
                const total = cartData.cart.items.reduce((sum: number, i: any) => sum + i.quantity, 0);
                setCartCount(total);
              }
            });
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setCartCount(0);
    window.location.reload();
  };

  return (
    <header className="main-header">
      <div className="nav-left">
        <Link href="/" className="nav-logo">
          amazon<span className="logo-smile">.clone</span>
        </Link>
        <div className="nav-deliver">
          <span style={{ fontSize: '18px' }}>📍</span>
          <div className="deliver-text">
            <span className="line-1">Deliver to</span>
            <span className="line-2">Pakistan</span>
          </div>
        </div>
      </div>

      <div className="nav-search">
        <select className="search-category-select">
          <option value="all">All</option>
          <option value="toys">Toys & Games</option>
          <option value="kitchen">Kitchen</option>
          <option value="electronics">Electronics</option>
          <option value="fashion">Fashion</option>
        </select>
        <input type="text" className="search-input" placeholder="Search Amazon" />
        <button className="search-btn" aria-label="Search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </div>

      <div className="nav-right">
        <div className="nav-item" style={{ flexDirection: 'row', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
          <span>🇺🇸</span> EN ▾
        </div>

        {user ? (
          <div className="nav-item" onClick={handleLogout} title="Click to Sign Out">
            <span className="line-1">Hello, {user.name}</span>
            <span className="line-2">Sign Out ▾</span>
          </div>
        ) : (
          <Link href="/auth/login" className="nav-item">
            <span className="line-1">Hello, sign in</span>
            <span className="line-2">Account & Lists ▾</span>
          </Link>
        )}

        <div className="nav-item">
          <span className="line-1">Returns</span>
          <span className="line-2">& Orders</span>
        </div>

        <Link href="/cart" className="nav-item">
          <div className="cart-icon-box">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span className="cart-count-badge">{cartCount}</span>
            <span style={{ fontSize: '13px', fontWeight: 700, marginLeft: '24px' }}>Cart</span>
          </div>
        </Link>
      </div>
    </header>
  );
}
