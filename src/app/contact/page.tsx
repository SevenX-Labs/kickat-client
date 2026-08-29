"use client";

import { useState } from 'react';
import { Mail, Phone, Clock, MapPin } from 'lucide-react';
import { Footer } from "@/components/common/Footer";
import styles from './Contact.module.css';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy submit logic
    alert('Thank you for contacting KickAt! This is a UI demonstration.');
    setFormData({ firstName: '', lastName: '', email: '', subject: '', message: '' });
  };

  return (
    <div className={styles.pageWrapper}>
      <main>
        
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <h1 className={styles.heroTitle}>
            We'd love to <em className={styles.heroAccent}>hear from you.</em>
          </h1>
          <p className={styles.heroSubtitle}>
            Whether you have a question about our products, need help with an order, or just want to share a picture of your pet, our team is ready to help.
          </p>
        </section>

        {/* Contact Content */}
        <div className={styles.contentWrapper}>
          
          {/* Left Column: Info Cards */}
          <div className={styles.infoColumn}>
            
            <div className={styles.infoCard}>
              <div className={styles.iconCircle}>
                <Mail size={24} strokeWidth={2} />
              </div>
              <div className={styles.infoContent}>
                <h3 className={styles.infoTitle}>Email Us</h3>
                <p className={styles.infoText}>Drop us a line anytime. We aim to reply within 24 hours.</p>
                <a href="mailto:hello@kickat.com" className={styles.infoAction}>hello@kickat.com</a>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.iconCircle}>
                <Phone size={24} strokeWidth={2} />
              </div>
              <div className={styles.infoContent}>
                <h3 className={styles.infoTitle}>Call Support</h3>
                <p className={styles.infoText}>Need immediate assistance? Our support team is a call away.</p>
                <a href="tel:18001234567" className={styles.infoAction}>1-800-123-4567</a>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.iconCircle}>
                <Clock size={24} strokeWidth={2} />
              </div>
              <div className={styles.infoContent}>
                <h3 className={styles.infoTitle}>Support Hours</h3>
                <p className={styles.infoText}>Monday to Friday: 9 AM - 6 PM (IST)</p>
                <p className={styles.infoText}>Weekend: 10 AM - 4 PM (IST)</p>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.iconCircle}>
                <MapPin size={24} strokeWidth={2} />
              </div>
              <div className={styles.infoContent}>
                <h3 className={styles.infoTitle}>Headquarters</h3>
                <p className={styles.infoText}>123 Pet Lovers Lane, Andheri East<br/>Mumbai, Maharashtra 400069</p>
              </div>
            </div>

          </div>

          {/* Right Column: Form */}
          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>Send a Message</h2>
              <p className={styles.formSubtitle}>Fill out the form below and we'll get back to you shortly.</p>
            </div>

            <form onSubmit={handleSubmit} className={styles.formGrid}>
              
              <div className={styles.inputGroup}>
                <label htmlFor="firstName" className={styles.label}>First Name</label>
                <input 
                  type="text" 
                  id="firstName" 
                  name="firstName" 
                  className={styles.input} 
                  placeholder="Jane"
                  value={formData.firstName}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="lastName" className={styles.label}>Last Name</label>
                <input 
                  type="text" 
                  id="lastName" 
                  name="lastName" 
                  className={styles.input} 
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label htmlFor="email" className={styles.label}>Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  className={styles.input} 
                  placeholder="jane@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label htmlFor="subject" className={styles.label}>Subject</label>
                <input 
                  type="text" 
                  id="subject" 
                  name="subject" 
                  className={styles.input} 
                  placeholder="How can we help?"
                  value={formData.subject}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label htmlFor="message" className={styles.label}>Message</label>
                <textarea 
                  id="message" 
                  name="message" 
                  className={styles.textarea} 
                  placeholder="Write your message here..."
                  value={formData.message}
                  onChange={handleChange}
                  required 
                ></textarea>
              </div>

              <div className={styles.fullWidth}>
                <button type="submit" className={styles.submitBtn}>
                  Send Message
                </button>
              </div>

            </form>
          </div>

        </div>

      </main>
      <Footer />
    </div>
  );
}
