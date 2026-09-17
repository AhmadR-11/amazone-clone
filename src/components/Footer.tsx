import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <a href="#top" className="back-to-top">
        Back to top
      </a>

      <div className="footer-cols">
        <div className="footer-col">
          <h4>Get to Know Us</h4>
          <a href="#">Careers</a>
          <a href="#">Blog</a>
          <a href="#">About Amazon</a>
          <a href="#">Investor Relations</a>
          <a href="#">Amazon Devices</a>
          <a href="#">Amazon Science</a>
        </div>

        <div className="footer-col">
          <h4>Make Money with Us</h4>
          <a href="#">Sell products on Amazon</a>
          <a href="#">Sell on Amazon Business</a>
          <a href="#">Sell apps on Amazon</a>
          <a href="#">Become an Affiliate</a>
          <a href="#">Advertise Your Products</a>
          <a href="#">Self-Publish with Us</a>
          <a href="#">Host an Amazon Hub</a>
        </div>

        <div className="footer-col">
          <h4>Amazon Payment Products</h4>
          <a href="#">Amazon Business Card</a>
          <a href="#">Shop with Points</a>
          <a href="#">Reload Your Balance</a>
          <a href="#">Amazon Currency Converter</a>
        </div>

        <div className="footer-col">
          <h4>Let Us Help You</h4>
          <a href="#">Your Account</a>
          <a href="#">Your Orders</a>
          <a href="#">Shipping Rates & Policies</a>
          <a href="#">Returns & Replacements</a>
          <a href="#">Manage Your Content and Devices</a>
          <a href="#">Help</a>
        </div>
      </div>

      <div className="footer-mid">
        <div style={{ fontSize: '22px', fontWeight: 800 }}>
          amazon<span style={{ color: '#ff9900' }}>.clone</span>
        </div>
        <div className="footer-pill">🌐 English</div>
        <div className="footer-pill">PKR Pakistani Rupee</div>
        <div className="footer-pill">🇺🇸 United States</div>
      </div>

      <div className="footer-bottom-grid">
        <div className="bottom-links">
          <div className="bottom-link-item">
            <h5>Amazon Music</h5>
            <p>Stream millions of songs</p>
          </div>
          <div className="bottom-link-item">
            <h5>Amazon Ads</h5>
            <p>Reach customers wherever they spend time</p>
          </div>
          <div className="bottom-link-item">
            <h5>6pm</h5>
            <p>Score deals on fashion brands</p>
          </div>
          <div className="bottom-link-item">
            <h5>AbeBooks</h5>
            <p>Books, art & collectibles</p>
          </div>
          <div className="bottom-link-item">
            <h5>ACX</h5>
            <p>Audiobook Publishing Made Easy</p>
          </div>
          <div className="bottom-link-item">
            <h5>Sell on Amazon</h5>
            <p>Start a Selling Account</p>
          </div>
          <div className="bottom-link-item">
            <h5>Veeqo</h5>
            <p>Shipping Software Inventory Management</p>
          </div>
          <div className="bottom-link-item">
            <h5>Amazon Business</h5>
            <p>Everything For Your Business</p>
          </div>
          <div className="bottom-link-item">
            <h5>AmazonGlobal</h5>
            <p>Ship Orders Internationally</p>
          </div>
          <div className="bottom-link-item">
            <h5>Amazon Web Services</h5>
            <p>Scalable Cloud Computing Services</p>
          </div>
          <div className="bottom-link-item">
            <h5>Audible</h5>
            <p>Listen to Books & Original Audio Performances</p>
          </div>
          <div className="bottom-link-item">
            <h5>Goodreads</h5>
            <p>Book reviews & recommendations</p>
          </div>
          <div className="bottom-link-item">
            <h5>IMDb</h5>
            <p>Movies, TV & Celebrities</p>
          </div>
          <div className="bottom-link-item">
            <h5>Ring</h5>
            <p>Smart Home Security Systems</p>
          </div>
        </div>

        <div className="copyright-legal">
          <div className="legal-nav" style={{ marginBottom: '8px' }}>
            <a href="#">Conditions of Use</a>
            <a href="#">Privacy Notice</a>
            <a href="#">Consumer Health Data Privacy Disclosure</a>
            <a href="#">Your Ads Privacy Choices</a>
          </div>
          <p>© 1996-2026, Amazon.com, Inc. or its affiliates</p>
        </div>
      </div>
    </footer>
  );
}
