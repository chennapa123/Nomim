import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="container footer-grid">
      <div className="footer-brand">
        <div className="footer-logo">🌾 Nomim</div>
        <p>Connecting farmers directly with vendors — no middlemen, fair prices, fresh produce.</p>
        <div className="footer-socials">
          <a href="#!" aria-label="Facebook">📘</a>
          <a href="#!" aria-label="Twitter">🐦</a>
          <a href="#!" aria-label="Instagram">📸</a>
          <a href="#!" aria-label="WhatsApp">💬</a>
        </div>
      </div>
      <div className="footer-col">
        <h4>Platform</h4>
        <Link to="/products">Browse Products</Link>
        <Link to="/farmers">Find Farmers</Link>
        <Link to="/register">Sell on Nomim</Link>
      </div>
      <div className="footer-col">
        <h4>Support</h4>
        <a href="#!">How It Works</a>
        <a href="#!">FAQs</a>
        <a href="#!">Contact Us</a>
      </div>
      <div className="footer-col">
        <h4>Legal</h4>
        <a href="#!">Privacy Policy</a>
        <a href="#!">Terms of Service</a>
      </div>
    </div>
    <div className="footer-bottom">
      <p>© {new Date().getFullYear()} Nomim. Built for Indian Farmers & Vendors.</p>
    </div>
  </footer>
);

export default Footer;
