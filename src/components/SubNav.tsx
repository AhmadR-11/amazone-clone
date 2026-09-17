import React from 'react';
import Link from 'next/link';

export default function SubNav() {
  return (
    <nav className="sub-nav">
      <button className="menu-all-btn">
        <span>☰</span> All
      </button>
      <div className="sub-nav-links">
        <Link href="/">Prime Video</Link>
        <Link href="/">Coupons</Link>
        <Link href="/">Customer Service</Link>
        <Link href="/">Today's Deals</Link>
        <Link href="/">Registry</Link>
        <Link href="/">Gift Cards</Link>
        <Link href="/">Sell</Link>
      </div>
    </nav>
  );
}
