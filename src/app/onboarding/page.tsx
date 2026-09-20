"use client";

import { UseLocationButton } from '@/components/ui/UseLocationButton';
import { DetectedAddress } from '@/services/locationService';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronRight, CheckCircle2, User, MapPin, Bone, Loader2, AlertCircle } from 'lucide-react';
import styles from './Onboarding.module.css';
import { profileService } from '@/services/profileService';
import { useAuth } from '@/context/AuthContext';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, setUser, isAuthenticated, isLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
    dob: '',
    houseFlat: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    addressType: 'HOME' as 'HOME' | 'WORK' | 'OTHER',
    petName: '',
    petType: 'DOG' as 'DOG' | 'CAT' | 'BIRD' | 'FISH' | 'OTHER',
    petBreed: '',
    petAge: '',
    petGender: 'MALE' as 'MALE' | 'FEMALE' | 'UNKNOWN'
  });

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
        return;
      }

      const isProfileAlreadyComplete = Boolean(
        user?.isProfileComplete ||
        user?.profileCompleted ||
        (user?.name && user.name.trim().length > 0 && (user?.email || user?.phone))
      );

      if (isProfileAlreadyComplete) {
        router.replace('/account');
        return;
      }
    }
  }, [user, isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (user) {
      const nameParts = (user.name || '').trim().split(' ');
      setFormData(prev => ({
        ...prev,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (step === 1) {
        const fullName = `${formData.firstName} ${formData.lastName}`.trim();
        const res: any = await profileService.updateBasicProfile({
          name: fullName || undefined,
          email: formData.email || undefined,
          gender: formData.gender,
          dob: formData.dob || undefined,
        });

        const updatedUser = res?.profile?.user || res?.user || res;
        if (updatedUser) {
          setUser(updatedUser);
        }

        setStep(2);
      } else if (step === 2) {
        if (!formData.city || !formData.pincode) {
          setErrorMessage('Please enter at least City and Pincode for delivery address.');
          setIsSubmitting(false);
          return;
        }

        await profileService.addAddress({
          type: formData.addressType,
          houseFlat: formData.houseFlat || undefined,
          buildingStreet: formData.address || undefined,
          city: formData.city,
          state: formData.state || 'Maharashtra',
          pincode: formData.pincode,
          isDefault: true,
        });

        setStep(3);
      } else if (step === 3) {
        if (!formData.petName) {
          setErrorMessage("Please enter your pet's name.");
          setIsSubmitting(false);
          return;
        }

        await profileService.addPet({
          species: formData.petType,
          name: formData.petName,
          breed: formData.petBreed || undefined,
          age: formData.petAge ? Number(formData.petAge) : 1,
          ageUnit: 'YEARS',
          gender: formData.petGender,
        });

        // Refetch profile to get updated profileCompleted flag
        try {
          const profileRes: any = await profileService.getProfile();
          const refreshedUser = profileRes?.profile?.user || profileRes?.user;
          if (refreshedUser) {
            setUser(refreshedUser);
          }
        } catch {
          // Non-blocking catch
        }

        setStep(4);
      }
    } catch (err: any) {
      console.error('Onboarding step error:', err);
      setErrorMessage(err?.message || 'Failed to save details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setErrorMessage(null);
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const finishOnboarding = () => {
    router.push('/');
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

        {/* Error Message Banner */}
        {errorMessage && (
          <div 
            style={{
              margin: '1.25rem 3rem 0 3rem',
              padding: '0.75rem 1rem',
              background: '#FEE2E2',
              border: '1px solid #FCA5A5',
              borderRadius: '12px',
              color: '#991B1B',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Area */}
        <div className={styles.formContent} key={`step-${step}`}>
          {step === 1 && (
            <div>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>First Name</label>
                  <input 
                    type="text" 
                    name="firstName" 
                    value={formData.firstName} 
                    onChange={handleChange} 
                    className={styles.input} 
                    placeholder="e.g. Sahil" 
                    disabled={isSubmitting}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Last Name</label>
                  <input 
                    type="text" 
                    name="lastName" 
                    value={formData.lastName} 
                    onChange={handleChange} 
                    className={styles.input} 
                    placeholder="e.g. Hode" 
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    className={styles.input} 
                    placeholder="sahil@example.com" 
                    disabled={isSubmitting}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    className={styles.input} 
                    placeholder="+91 98765 43210" 
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Gender</label>
                  <select 
                    name="gender" 
                    value={formData.gender} 
                    onChange={handleChange} 
                    className={styles.input}
                    style={{ appearance: 'none', cursor: 'pointer' }}
                    disabled={isSubmitting}
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Date of Birth</label>
                  <input 
                    type="date" 
                    name="dob" 
                    value={formData.dob} 
                    onChange={handleChange} 
                    className={styles.input} 
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <UseLocationButton 
                onLocationDetected={(addr: DetectedAddress) => {
                  setFormData(prev => ({
                    ...prev,
                    pincode: addr.pincode || prev.pincode,
                    city: addr.city || prev.city,
                    state: addr.state || prev.state,
                    address: addr.street || prev.address,
                    houseFlat: addr.houseFlat || prev.houseFlat,
                  }));
                }}
              />
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Flat / House No. / Building</label>
                  <input 
                    type="text" 
                    name="houseFlat" 
                    value={formData.houseFlat} 
                    onChange={handleChange} 
                    className={styles.input} 
                    placeholder="e.g. Flat 402, Sunshine Heights" 
                    disabled={isSubmitting}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Street / Landmark</label>
                  <input 
                    type="text" 
                    name="address" 
                    value={formData.address} 
                    onChange={handleChange} 
                    className={styles.input} 
                    placeholder="e.g. MG Road, Near City Mall" 
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>City</label>
                  <input 
                    type="text" 
                    name="city" 
                    value={formData.city} 
                    onChange={handleChange} 
                    className={styles.input} 
                    placeholder="e.g. Mumbai" 
                    disabled={isSubmitting}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>State</label>
                  <input 
                    type="text" 
                    name="state" 
                    value={formData.state} 
                    onChange={handleChange} 
                    className={styles.input} 
                    placeholder="e.g. Maharashtra" 
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Pincode</label>
                  <input 
                    type="text" 
                    name="pincode" 
                    value={formData.pincode} 
                    onChange={handleChange} 
                    className={styles.input} 
                    placeholder="400001" 
                    disabled={isSubmitting}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Address Type</label>
                  <select 
                    name="addressType" 
                    value={formData.addressType} 
                    onChange={handleChange} 
                    className={styles.input}
                    style={{ appearance: 'none', cursor: 'pointer' }}
                    disabled={isSubmitting}
                  >
                    <option value="HOME">Home</option>
                    <option value="WORK">Work / Office</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Pet's Name</label>
                <input 
                  type="text" 
                  name="petName" 
                  value={formData.petName} 
                  onChange={handleChange} 
                  className={styles.input} 
                  placeholder="e.g. Bruno" 
                  disabled={isSubmitting}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Pet Type</label>
                  <select 
                    name="petType" 
                    value={formData.petType} 
                    onChange={handleChange} 
                    className={styles.input} 
                    style={{ appearance: 'none', cursor: 'pointer' }}
                    disabled={isSubmitting}
                  >
                    <option value="DOG">Dog</option>
                    <option value="CAT">Cat</option>
                    <option value="BIRD">Bird</option>
                    <option value="FISH">Fish</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Breed (Optional)</label>
                  <input 
                    type="text" 
                    name="petBreed" 
                    value={formData.petBreed} 
                    onChange={handleChange} 
                    className={styles.input} 
                    placeholder="e.g. Labrador Retriever" 
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Age (Years)</label>
                  <input 
                    type="number" 
                    name="petAge" 
                    value={formData.petAge} 
                    onChange={handleChange} 
                    className={styles.input} 
                    placeholder="e.g. 2" 
                    disabled={isSubmitting}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Pet Gender</label>
                  <select 
                    name="petGender" 
                    value={formData.petGender} 
                    onChange={handleChange} 
                    className={styles.input} 
                    style={{ appearance: 'none', cursor: 'pointer' }}
                    disabled={isSubmitting}
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="UNKNOWN">Unknown</option>
                  </select>
                </div>
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
                Welcome to KickAt. We've saved your profile, address, and pet preferences to personalize your experience.
              </p>
              <button className={styles.btnPrimary} onClick={finishOnboarding}>
                Explore KickAt
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {step < 4 && (
          <div className={styles.footer}>
            {step === 1 ? (
              <button className={styles.btnBack} onClick={() => router.back()} disabled={isSubmitting}>Cancel</button>
            ) : (
              <button className={styles.btnBack} onClick={handleBack} disabled={isSubmitting}>Back</button>
            )}
            
            <button className={styles.btnNext} onClick={handleNext} disabled={isSubmitting}>
              {isSubmitting ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Loader2 size={16} className="animate-spin" /> Saving...
                </span>
              ) : (
                <>
                  {step === 3 ? "Complete Profile" : "Continue"} <ChevronRight size={18} />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
