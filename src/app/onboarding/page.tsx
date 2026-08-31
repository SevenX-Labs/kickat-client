"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Check, ChevronRight, CheckCircle2, User, MapPin, Bone } from 'lucide-react';
import styles from './Onboarding.module.css';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    petName: '',
    petType: 'Dog',
    petBreed: '',
    petAge: ''
  });

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const finishOnboarding = () => {
    router.push('/account'); // Navigate to account page on finish
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>
            {step === 1 && "Let's set up your profile"}
            {step === 2 && "Where do we deliver?"}
            {step === 3 && "Tell us about your pet"}
            {step === 4 && "All set!"}
          </h1>
          <p className={styles.subtitle}>
            {step === 1 && "This helps us personalize your experience."}
            {step === 2 && "Add your primary address for faster checkouts."}
            {step === 3 && "So we can recommend the best products for them."}
            {step === 4 && "Your profile has been created successfully."}
          </p>
        </div>

        {/* Progress Tracker (Hide on success step) */}
        {step < 4 && (
          <div className={styles.progressContainer}>
            <div className={`${styles.stepWrapper} ${step >= 1 ? styles.active : ''} ${step > 1 ? styles.completed : ''}`}>
              <div className={styles.stepNumber}>{step > 1 ? <Check size={16} /> : <User size={14} />}</div>
              <span className={styles.stepLabel}>Profile</span>
            </div>
            <div className={`${styles.stepDivider} ${step > 1 ? styles.completed : ''}`} />
            
            <div className={`${styles.stepWrapper} ${step >= 2 ? styles.active : ''} ${step > 2 ? styles.completed : ''}`}>
              <div className={styles.stepNumber}>{step > 2 ? <Check size={16} /> : <MapPin size={14} />}</div>
              <span className={styles.stepLabel}>Address</span>
            </div>
            <div className={`${styles.stepDivider} ${step > 2 ? styles.completed : ''}`} />

            <div className={`${styles.stepWrapper} ${step >= 3 ? styles.active : ''}`}>
              <div className={styles.stepNumber}><Bone size={14} /></div>
              <span className={styles.stepLabel}>Pet Info</span>
            </div>
          </div>
        )}

        {/* Form Area */}
        <div className={styles.formContent} key={`step-${step}`}>
          {step === 1 && (
            <div>
              <div className={styles.avatarUpload}>
                <div className={styles.avatarCircle}>
                  <Camera size={24} />
                </div>
                <div>
                  <button className={styles.avatarBtn} type="button">Upload Photo</button>
                  <p className={styles.avatarText} style={{ marginTop: '0.5rem' }}>JPG, PNG or GIF up to 2MB</p>
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>First Name</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className={styles.input} placeholder="e.g. John" />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className={styles.input} placeholder="e.g. Doe" />
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className={styles.input} placeholder="john@example.com" />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={styles.input} placeholder="+91 98765 43210" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Street Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} className={styles.input} placeholder="Flat / House No. / Building" />
              </div>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} className={styles.input} placeholder="e.g. Mumbai" />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>State</label>
                  <input type="text" name="state" value={formData.state} onChange={handleChange} className={styles.input} placeholder="e.g. Maharashtra" />
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Pincode</label>
                <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className={styles.input} placeholder="400001" style={{ maxWidth: '200px' }} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Pet's Name</label>
                <input type="text" name="petName" value={formData.petName} onChange={handleChange} className={styles.input} placeholder="e.g. Max" />
              </div>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Pet Type</label>
                  <select name="petType" value={formData.petType} onChange={handleChange} className={styles.input} style={{ appearance: 'none', cursor: 'pointer' }}>
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Breed (Optional)</label>
                  <input type="text" name="petBreed" value={formData.petBreed} onChange={handleChange} className={styles.input} placeholder="e.g. Golden Retriever" />
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Age (Years)</label>
                <input type="number" name="petAge" value={formData.petAge} onChange={handleChange} className={styles.input} placeholder="e.g. 2" style={{ maxWidth: '150px' }} />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className={styles.successContainer}>
              <div className={styles.successIcon}>
                <CheckCircle2 size={40} strokeWidth={2.5} />
              </div>
              <h2 className={styles.successTitle}>Profile Complete!</h2>
              <p className={styles.successSubtitle}>
                Welcome to KickAt. We've saved your preferences to give you a personalized shopping experience.
              </p>
              <button className={styles.btnPrimary} onClick={finishOnboarding}>
                Go to my Account
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {step < 4 && (
          <div className={styles.footer}>
            {step === 1 ? (
              <button className={styles.btnBack} onClick={() => router.back()}>Cancel</button>
            ) : (
              <button className={styles.btnBack} onClick={handleBack}>Back</button>
            )}
            
            <button className={styles.btnNext} onClick={handleNext}>
              {step === 3 ? "Complete Profile" : "Continue"} <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
