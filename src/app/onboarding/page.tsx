"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  MapPin,
  Bone,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { profileService, CreateAddressDto, CreatePetDto } from '../../services/profileService';
import { UseLocationButton } from '../../components/ui/UseLocationButton';
import { DetectedAddress } from '../../services/locationService';
import styles from './Onboarding.module.css';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, setUser } = useAuth();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'PREFER_NOT_TO_SAY',
    dob: '',
    houseFlat: '',
    address: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    addressType: 'HOME' as 'HOME' | 'WORK' | 'OTHER',
    petName: '',
    petType: 'DOG' as 'DOG' | 'CAT' | 'BIRD' | 'FISH' | 'RABBIT' | 'OTHER',
    petBreed: '',
    petAge: '',
    petGender: 'MALE' as 'MALE' | 'FEMALE' | 'PREFER_NOT_TO_SAY'
  });

  // Only check once on initial page entry whether the user already completed onboarding
  useEffect(() => {
    if (!isLoading && !initialCheckDone) {
      if (!isAuthenticated) {
        router.replace('/login');
        return;
      }

      const isProfileAlreadyComplete = Boolean(
        user?.isProfileComplete || user?.profileCompleted
      );

      if (isProfileAlreadyComplete) {
        router.replace('/account');
        return;
      }

      setInitialCheckDone(true);
    }
  }, [user, isAuthenticated, isLoading, router, initialCheckDone]);

  // Pre-fill user data from auth session
  useEffect(() => {
    if (user) {
      const nameParts = (user.name || '').trim().split(' ');
      setFormData(prev => ({
        ...prev,
        firstName: prev.firstName || nameParts[0] || '',
        lastName: prev.lastName || nameParts.slice(1).join(' ') || '',
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
    setErrorMessage(null);

    // STEP 1 VALIDATION (Local only, no premature API save)
    if (step === 1) {
      const trimmedFirst = formData.firstName.trim();
      const trimmedLast = formData.lastName.trim();

      if (!trimmedFirst) {
        setErrorMessage('Please enter your first name.');
        return;
      }

      const fullName = `${trimmedFirst} ${trimmedLast}`.trim();
      if (!/^[a-zA-Z\s]+$/.test(fullName)) {
        setErrorMessage('Name must contain only English letters and spaces.');
        return;
      }

      if (formData.dob) {
        const birthDate = new Date(formData.dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age < 13) {
          setErrorMessage('You must be at least 13 years old.');
          return;
        }
      }

      // Seamlessly advance to Step 2
      setStep(2);
      return;
    }

    // STEP 2 VALIDATION (Local only, no premature API save)
    if (step === 2) {
      if (!formData.houseFlat.trim()) {
        setErrorMessage('Please enter Flat / House No. / Building.');
        return;
      }
      if (!formData.address.trim()) {
        setErrorMessage('Please enter Street / Landmark.');
        return;
      }
      if (!formData.city.trim()) {
        setErrorMessage('Please enter your City.');
        return;
      }
      if (!formData.pincode.trim() || !/^\d{5,6}$/.test(formData.pincode.trim())) {
        setErrorMessage('Please enter a valid 5 or 6 digit Pincode.');
        return;
      }

      // Seamlessly advance to Step 3
      setStep(3);
      return;
    }

    // STEP 3: SUBMIT EVERYTHING AT ONCE
    if (step === 3) {
      if (!formData.petName.trim()) {
        setErrorMessage("Please enter your pet's name.");
        return;
      }

      setIsSubmitting(true);
      setErrorMessage(null);

      try {
        const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();
        const addressObj: CreateAddressDto = {
          type: formData.addressType,
          houseFlat: formData.houseFlat.trim(),
          buildingStreet: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim() || 'Maharashtra',
          pincode: formData.pincode.trim(),
          isDefault: true,
        };

        const petObj: CreatePetDto = {
          species: formData.petType,
          name: formData.petName.trim(),
          breed: formData.petBreed.trim() || undefined,
          age: formData.petAge ? Math.max(0, parseInt(formData.petAge, 10)) : 1,
          ageUnit: 'YEARS',
          gender: formData.petGender as any,
        };

        let refreshedUser: any = null;

        try {
          // Unified profile creation in one shot via POST /profile
          const res: any = await profileService.createOrUpdateProfile({
            name: fullName,
            email: formData.email ? formData.email.trim() : undefined,
            gender: formData.gender as any,
            dob: formData.dob || undefined,
            addresses: [addressObj],
            pets: [petObj],
          });
          refreshedUser = res?.profile?.user || res?.user || res;
        } catch (postErr: any) {
          console.warn('Unified POST /profile failed, executing graceful sequential fallback:', postErr);
          // Fallback sequential in case unified route hits validation or constraint
          await profileService.updateBasicProfile({
            name: fullName,
            email: formData.email ? formData.email.trim() : undefined,
            gender: formData.gender as any,
            dob: formData.dob || undefined,
          });
          await profileService.addAddress(addressObj);
          await profileService.addPet(petObj);

          try {
            const profRes: any = await profileService.getProfile();
            refreshedUser = profRes?.profile?.user || profRes?.user;
          } catch {
            // non-blocking
          }
        }

        if (refreshedUser) {
          setUser(refreshedUser);
        }

        setStep(4);
      } catch (err: any) {
        console.error('Submit onboarding error:', err);
        setErrorMessage(err?.message || 'Failed to save profile details. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    setErrorMessage(null);
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const finishOnboarding = () => {
    router.push('/account');
  };

  const stepTitles = [
    { title: "Let's set up your profile", sub: "This helps us personalize your experience." },
    { title: "Where should we deliver?", sub: "Add your default delivery address for faster checkout." },
    { title: "Tell us about your pet", sub: "We'll tailor nutrition and toy recommendations for them." }
  ];

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {step < 4 && (
          <div className={styles.header}>
            <h1 className={styles.title}>{stepTitles[step - 1].title}</h1>
            <p className={styles.subtitle}>{stepTitles[step - 1].sub}</p>
          </div>
        )}

        {/* Stepper Progress Bar */}
        {step < 4 && (
          <div className={styles.progressContainer}>
            <div className={`${styles.stepWrapper} ${step >= 1 ? styles.active : ''} ${step > 1 ? styles.completed : ''}`}>
              <div className={styles.stepNumber}>
                {step > 1 ? <Check size={14} strokeWidth={3} /> : <User size={13} />}
              </div>
              <span className={styles.stepLabel}>Profile</span>
            </div>

            <div className={`${styles.stepDivider} ${step > 1 ? styles.completed : ''}`} />

            <div className={`${styles.stepWrapper} ${step >= 2 ? styles.active : ''} ${step > 2 ? styles.completed : ''}`}>
              <div className={styles.stepNumber}>
                {step > 2 ? <Check size={14} strokeWidth={3} /> : <MapPin size={13} />}
              </div>
              <span className={styles.stepLabel}>Address</span>
            </div>

            <div className={`${styles.stepDivider} ${step > 2 ? styles.completed : ''}`} />

            <div className={`${styles.stepWrapper} ${step >= 3 ? styles.active : ''}`}>
              <div className={styles.stepNumber}>
                <Bone size={13} />
              </div>
              <span className={styles.stepLabel}>Pet Info</span>
            </div>
          </div>
        )}

        {/* Form Body */}
        <div className={styles.formContent}>
          {errorMessage && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#FEE2E2',
                border: '1px solid #FCA5A5',
                color: '#991B1B',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '1rem',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: Basic Profile */}
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
                    required
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <label className={styles.label} style={{ marginBottom: 0 }}>Email Address</label>
                    {Boolean(user?.email && (user?.isEmailVerified ?? true)) && (
                      <span style={{ color: '#16A34A', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <ShieldCheck size={13} /> Verified
                      </span>
                    )}
                  </div>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    className={styles.input} 
                    placeholder="sahil@example.com" 
                    disabled={isSubmitting || Boolean(user?.email && (user?.isEmailVerified ?? true))}
                    readOnly={Boolean(user?.email && (user?.isEmailVerified ?? true))}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <label className={styles.label} style={{ marginBottom: 0 }}>Phone Number</label>
                    {Boolean(user?.phone) && (
                      <span style={{ color: '#16A34A', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <ShieldCheck size={13} /> Verified
                      </span>
                    )}
                  </div>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    className={styles.input} 
                    placeholder="+91 98765 43210" 
                    disabled={isSubmitting || Boolean(user?.phone)}
                    readOnly={Boolean(user?.phone)}
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
                    disabled={isSubmitting}
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
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

          {/* STEP 2: Address */}
          {step === 2 && (
            <div>
              <div style={{ marginBottom: '0.75rem' }}>
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
              </div>

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

          {/* STEP 3: Pet Info */}
          {step === 3 && (
            <div>
              <div className={styles.formRow}>
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
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Pet Type</label>
                  <select 
                    name="petType" 
                    value={formData.petType} 
                    onChange={handleChange} 
                    className={styles.input} 
                    disabled={isSubmitting}
                  >
                    <option value="DOG">Dog</option>
                    <option value="CAT">Cat</option>
                    <option value="BIRD">Bird</option>
                    <option value="FISH">Fish</option>
                    <option value="RABBIT">Rabbit</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
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
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Age (Years)</label>
                  <input 
                    type="number" 
                    name="petAge" 
                    value={formData.petAge} 
                    onChange={handleChange} 
                    className={styles.input} 
                    placeholder="e.g. 2" 
                    min="0"
                    max="30"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Pet Gender</label>
                  <select 
                    name="petGender" 
                    value={formData.petGender} 
                    onChange={handleChange} 
                    className={styles.input} 
                    disabled={isSubmitting}
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="PREFER_NOT_TO_SAY">Unknown / Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Success Screen */}
          {step === 4 && (
            <div className={styles.successContainer}>
              <div className={styles.successIcon}>
                <CheckCircle2 size={36} strokeWidth={2.5} />
              </div>
              <h2 className={styles.successTitle}>Profile Complete!</h2>
              <p className={styles.successSubtitle}>
                Welcome to KickAt. We've saved your profile, default delivery address, and pet details.
              </p>
              <button className={styles.btnPrimary} onClick={finishOnboarding}>
                Go to Account
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {step < 4 && (
          <div className={styles.footer}>
            {step === 1 ? (
              <button className={styles.btnBack} onClick={() => router.push('/')} disabled={isSubmitting}>
                Cancel
              </button>
            ) : (
              <button className={styles.btnBack} onClick={handleBack} disabled={isSubmitting}>
                Back
              </button>
            )}
            
            <button className={styles.btnNext} onClick={handleNext} disabled={isSubmitting}>
              {isSubmitting ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Loader2 size={16} className="animate-spin" /> Saving...
                </span>
              ) : (
                <>
                  <span>{step === 3 ? "Submit" : "Next"}</span>
                  {step === 3 ? <Check size={18} /> : <ChevronRight size={18} />}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
