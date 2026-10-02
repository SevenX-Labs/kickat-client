"use client";

import { useState } from "react";
import { Footer } from "@/components/common/Footer/Footer";
import {
  Mail,
  Phone,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  MessageSquare,
  Package,
  HelpCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import styles from "./Contact.module.css";
import { usePublicSettings } from "@/hooks/usePublicSettings";

const INQUIRY_CATEGORIES = [
  { id: "Order Status & Delivery", label: "Order & Delivery", icon: Package },
  { id: "Product Questions", label: "Product Info", icon: HelpCircle },
  { id: "Returns & Refunds", label: "Returns & Refund", icon: RefreshCw },
  { id: "Wholesale & Business", label: "Partnership / Wholesale", icon: Sparkles },
  { id: "General Feedback", label: "General Feedback", icon: MessageSquare },
];

export default function ContactPage() {
  const { general } = usePublicSettings();

  const storeName = general?.storeName || "KickAt";
  const supportEmail = general?.supportEmail || "kickat2021@gmail.com";
  const supportPhone = general?.supportPhone || "+91 98765 43210";

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    category: "Order Status & Delivery",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleCategorySelect = (categoryName: string) => {
    setFormData((prev) => ({ ...prev, category: categoryName }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const name = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();
    if (!name) {
      setErrorMessage("Please enter your name.");
      return;
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!formData.message.trim() || formData.message.trim().length < 5) {
      setErrorMessage("Please enter a message of at least 5 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/support/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          name: name,
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          category: formData.category,
          subject: formData.subject.trim() || formData.category,
          message: formData.message.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitSuccess(true);
        setTicketId(data.ticketId || null);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          category: "Order Status & Delivery",
          subject: "",
          message: "",
        });
      } else {
        setErrorMessage(
          data.error || "Could not send your message. Please try again or reach us on WhatsApp."
        );
      }
    } catch (err: any) {
      setErrorMessage(
        "Network error: Unable to connect to support server. Please check your internet connection."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.mainContent}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroBadge}>
            <Sparkles size={14} className={styles.heroBadgeIcon} />
            <span>Customer Care Hub</span>
          </div>
          <h1 className={styles.heroTitle}>
            We&apos;re here to <em className={styles.heroAccent}>help you &amp; your pet.</em>
          </h1>
          <p className={styles.heroSubtitle}>
            Have a question about {storeName} nutrition, an existing order, or need tailored feeding guidance? Our pet specialists are just a message away.
          </p>
        </section>

        {/* Contact Content Grid */}
        <div className={styles.contentWrapper}>
          {/* Left Column: Direct Contact Info & Value Cards */}
          <div className={styles.infoColumn}>
            <div className={styles.infoCard}>
              <div className={styles.iconCircle}>
                <Mail size={22} strokeWidth={2} />
              </div>
              <div className={styles.infoContent}>
                <span className={styles.infoTag}>Direct Inbox</span>
                <h3 className={styles.infoTitle}>Email Support</h3>
                <p className={styles.infoText}>
                  Send us your inquiries anytime. We typically respond within 2–4 business hours.
                </p>
                <a href={`mailto:${supportEmail}`} className={styles.infoAction}>
                  {supportEmail}
                </a>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.iconCircle}>
                <Phone size={22} strokeWidth={2} />
              </div>
              <div className={styles.infoContent}>
                <span className={styles.infoTag}>Instant Assistance</span>
                <h3 className={styles.infoTitle}>Call / WhatsApp Support</h3>
                <p className={styles.infoText}>
                  Speak directly with our team for quick order modifications or urgent queries.
                </p>
                <a href={`tel:${supportPhone.replace(/\s+/g, "")}`} className={styles.infoAction}>
                  {supportPhone}
                </a>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.iconCircle}>
                <Clock size={22} strokeWidth={2} />
              </div>
              <div className={styles.infoContent}>
                <span className={styles.infoTag}>Available Hours</span>
                <h3 className={styles.infoTitle}>Support Schedule</h3>
                <p className={styles.infoText}>
                  <strong>Monday – Friday:</strong> 9:00 AM – 7:00 PM (IST)<br />
                  <strong>Saturday – Sunday:</strong> 10:00 AM – 5:00 PM (IST)
                </p>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.iconCircle}>
                <MapPin size={22} strokeWidth={2} />
              </div>
              <div className={styles.infoContent}>
                <span className={styles.infoTag}>Headquarters</span>
                <h3 className={styles.infoTitle}>Office &amp; Fulfillment Hub</h3>
                <p className={styles.infoText}>
                  KickAt Pet Care Private Limited<br />
                  India
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Modern Interactive Support Form */}
          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>Send Us a Message</h2>
              <p className={styles.formSubtitle}>
                Fill out the details below and our team will get right back to you.
              </p>
            </div>

            {submitSuccess ? (
              <div className={styles.successBox}>
                <div className={styles.successIconWrapper}>
                  <CheckCircle2 size={48} className={styles.successCheckIcon} />
                </div>
                <h3 className={styles.successTitle}>Inquiry Sent Successfully!</h3>
                {ticketId && (
                  <div className={styles.ticketBadge}>
                    <span>Ticket Reference: <strong>{ticketId}</strong></span>
                  </div>
                )}
                <p className={styles.successText}>
                  Thank you for reaching out. We have received your message and sent a confirmation to your email. Our customer care team will reply shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitSuccess(false);
                    setTicketId(null);
                  }}
                  className={styles.resetBtn}
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.formGrid}>
                {/* Inquiry Category Selector */}
                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <label className={styles.label}>What can we help you with?</label>
                  <div className={styles.categoryPillsRow}>
                    {INQUIRY_CATEGORIES.map((cat) => {
                      const isSelected = formData.category === cat.id;
                      const Icon = cat.icon;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          className={`${styles.categoryPill} ${isSelected ? styles.categoryPillActive : ""}`}
                          onClick={() => handleCategorySelect(cat.id)}
                        >
                          <Icon size={14} className={styles.categoryIcon} />
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* First Name & Last Name */}
                <div className={styles.inputGroup}>
                  <label htmlFor="firstName" className={styles.label}>
                    First Name <span className={styles.requiredStar}>*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    className={styles.input}
                    placeholder="e.g. Rahul"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="lastName" className={styles.label}>
                    Last Name <span className={styles.requiredStar}>*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className={styles.input}
                    placeholder="e.g. Sharma"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Email Address & Phone Number */}
                <div className={styles.inputGroup}>
                  <label htmlFor="email" className={styles.label}>
                    Email Address <span className={styles.requiredStar}>*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={styles.input}
                    placeholder="rahul@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="phone" className={styles.label}>
                    Phone Number <span className={styles.optionalTag}>(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className={styles.input}
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                {/* Subject Title */}
                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <label htmlFor="subject" className={styles.label}>
                    Subject <span className={styles.optionalTag}>(Optional)</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    className={styles.input}
                    placeholder={`e.g. Regarding Order / ${formData.category}`}
                    value={formData.subject}
                    onChange={handleChange}
                  />
                </div>

                {/* Message Textarea */}
                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <div className={styles.labelWithCounter}>
                    <label htmlFor="message" className={styles.label}>
                      Your Message <span className={styles.requiredStar}>*</span>
                    </label>
                    <span className={styles.charCounter}>
                      {formData.message.length} / 5000
                    </span>
                  </div>
                  <textarea
                    id="message"
                    name="message"
                    className={styles.textarea}
                    placeholder="Please describe how we can assist you with your pet or order..."
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    maxLength={5000}
                    required
                  />
                </div>

                {/* Error Notification Banner */}
                {errorMessage && (
                  <div className={`${styles.errorBanner} ${styles.fullWidth}`}>
                    <AlertCircle size={18} className={styles.errorBannerIcon} />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Submit Action Button */}
                <div className={styles.fullWidth}>
                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className={styles.btnLoadingWrap}>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Sending Message...</span>
                      </span>
                    ) : (
                      <span className={styles.btnContentWrap}>
                        <Send size={16} />
                        <span>Send Message</span>
                      </span>
                    )}
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
