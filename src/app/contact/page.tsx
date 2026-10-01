"use client";

import { useState } from 'react';
import { Mail, Phone, Clock, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { Footer } from "@/components/common/Footer";
import { usePublicSettings } from "@/hooks/usePublicSettings";
import styles from './Contact.module.css';

export default function ContactPage() {
  const { general } = usePublicSettings();

  const storeName = general?.storeName || 'KickAt';
  const supportEmail = general?.supportEmail || 'kickat2021@gmail.com';
  const supportPhone = general?.supportPhone || '+91 96742 48592';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Open user's default email client prefilled with subject & message
    const mailtoUrl = `mailto:${supportEmail}?subject=${encodeURIComponent(formData.subject || 'KickAt Customer Inquiry')}&body=${encodeURIComponent(`Name: ${formData.firstName} ${formData.lastName}
Email: ${formData.email}

Message:
${formData.message}`)}`;
    window.location.href = mailtoUrl;
    setSubmitted(true);
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
            Whether you have a question about {storeName} products, need help with an order, or want personalized pet recommendations, our team is ready to assist.
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
                <h3 className={styles.infoTitle}>Email Support</h3>
                <p className={styles.infoText}>Drop us a line anytime. We aim to reply within 24 hours.</p>
                <a href={`mailto:${supportEmail}`} className={styles.infoAction}>{supportEmail}</a>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.iconCircle}>
                <Phone size={24} strokeWidth={2} />
              </div>
              <div className={styles.infoContent}>
                <h3 className={styles.infoTitle}>Call / WhatsApp Support</h3>
                <p className={styles.infoText}>Need immediate assistance? Our customer care team is available by phone.</p>
                <a href={`tel:${supportPhone.replace(/\s+/g, '')}`} className={styles.infoAction}>{supportPhone}</a>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.iconCircle}>
                <Clock size={24} strokeWidth={2} />
              </div>
              <div className={styles.infoContent}>
                <h3 className={styles.infoTitle}>Support Hours</h3>
                <p className={styles.infoText}>Monday to Friday: 9:00 AM – 7:00 PM (IST)</p>
                <p className={styles.infoText}>Saturday & Sunday: 10:00 AM – 5:00 PM (IST)</p>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.iconCircle}>
                <MapPin size={24} strokeWidth={2} />
              </div>
              <div className={styles.infoContent}>
                <h3 className={styles.infoTitle}>Office & Hub</h3>
                <p className={styles.infoText}>KickAt Pet Care Services<br/>India</p>
              </div>
            </div>

          </div>

          {/* Right Column: Form */}
          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>Send a Message</h2>
              <p className={styles.formSubtitle}>Fill out the form below and we'll get back to you shortly.</p>
            </div>

            {submitted ? (
              <div className="bg-white border border-[#EBE5DB] rounded-2xl p-8 text-center shadow-sm">
                <CheckCircle2 size={44} className="mx-auto text-green-600 mb-3" />
                <h3 className="text-xl font-bold text-[#1A1612] mb-2">Thank You!</h3>
                <p className="text-sm text-[#78746D] mb-4">
                  Your email client has been opened with your message directed to <strong>{supportEmail}</strong>.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ firstName: '', lastName: '', email: '', subject: '', message: '' });
                  }}
                  className="px-5 py-2.5 bg-[#211C15] text-white text-xs font-bold uppercase tracking-wider rounded cursor-pointer hover:bg-[#F99205] transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
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
            )}
          </div>

        </div>

      </main>
      <Footer />
    </div>
  );
}
