"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User, UserCheck,
  Mail,
  Phone,
  Calendar, Clock,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Edit3,
  Crown,
  X,
  Loader2,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import styles from "../Account.module.css";
import { useAuth } from "@/context/AuthContext";
import { profileService } from "@/services/profileService";
import { authService } from "@/services/authService";

function ProfileDetailsContent() {
  const router = useRouter();
  const { user, setUser, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent("/account/profile")}`);
    }
  }, [isLoading, isAuthenticated, router]);

  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const [userData, setUserData] = useState({
    firstName: "KickAt",
    lastName: "Member",
    email: "",
    phone: "",
    isEmailVerified: false,
    isPhoneVerified: false,
    gender: "Not specified",
    dob: "Not specified",
    memberSince: "2025",
    totalOrders: 0,
    points: 100,
    tier: "KickAt VIP",
    currency: "INR (₹)",
  });

  const fetchFullProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const res: any = await profileService.getProfile();
      const profileUser = res?.profile?.user || res?.user || res?.data || res;

      if (profileUser) {
        setUser(profileUser);
        const nameParts = (profileUser.name || "").trim().split(" ");
        const firstName =
          nameParts[0] ||
          (profileUser.email
            ? profileUser.email.split("@")[0]
            : profileUser.phone
            ? `User_${profileUser.phone.slice(-4)}`
            : "KickAt");
        const lastName = nameParts.slice(1).join(" ") || "Member";

        setUserData((prev) => ({
          ...prev,
          firstName,
          lastName,
          email: profileUser.email || "Not provided",
          phone: profileUser.phone
            ? profileUser.phone.startsWith("+91")
              ? profileUser.phone
              : `+91 ${profileUser.phone}`
            : "Not provided",
          gender: (profileUser.gender || profileUser.profile?.gender) ? ((profileUser.gender || profileUser.profile?.gender) === 'PREFER_NOT_TO_SAY' ? 'Not specified' : (profileUser.gender || profileUser.profile?.gender).charAt(0).toUpperCase() + (profileUser.gender || profileUser.profile?.gender).slice(1).toLowerCase()) : 'Not specified',
          dob: (profileUser.dob || profileUser.profile?.dob) ? new Date(profileUser.dob || profileUser.profile?.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not specified',
          memberSince: profileUser.createdAt ? new Date(profileUser.createdAt).getFullYear().toString() : (prev.memberSince || '2025'),
          isEmailVerified: Boolean(profileUser.isEmailVerified),
          isPhoneVerified: Boolean(profileUser.isPhoneVerified),
        }));
      }
    } catch (err: any) {
      console.error("Failed to load profile details:", err);
      if (err?.message?.includes("Unauthorized") || err?.message?.includes("401")) {
        router.replace(`/login?redirect=${encodeURIComponent("/account/profile")}`);
      }
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    document.title = "Profile Details | KickAt";
    if (!isAuthenticated && !isLoading) return;
    fetchFullProfile();
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (user) {
      const nameParts = (user.name || "").trim().split(" ");
      const firstName =
        nameParts[0] ||
        (user.email
          ? user.email.split("@")[0]
          : user.phone
          ? `User_${user.phone.slice(-4)}`
          : "KickAt");
      const lastName = nameParts.slice(1).join(" ") || "Member";

      setUserData((prev) => ({
        ...prev,
        firstName,
        lastName,
        email: user.email || "Not provided",
        phone: user.phone
          ? user.phone.startsWith("+91")
            ? user.phone
            : `+91 ${user.phone}`
          : "Not provided",
        gender: ((user as any)?.gender || (user as any)?.profile?.gender) ? (((user as any)?.gender || (user as any)?.profile?.gender) === 'PREFER_NOT_TO_SAY' ? 'Not specified' : ((user as any)?.gender || (user as any)?.profile?.gender).charAt(0).toUpperCase() + ((user as any)?.gender || (user as any)?.profile?.gender).slice(1).toLowerCase()) : 'Not specified',
        dob: ((user as any)?.dob || (user as any)?.profile?.dob) ? new Date((user as any)?.dob || (user as any)?.profile?.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not specified',
        memberSince: (user as any).createdAt ? new Date((user as any).createdAt).getFullYear().toString() : (prev.memberSince || '2025'),
        isEmailVerified: Boolean(user.isEmailVerified),
        isPhoneVerified: Boolean(user.isPhoneVerified),
      }));
    }
  }, [user]);

  // Modals & Toast State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // OTP Verification Modal State
  const [verifyModalType, setVerifyModalType] = useState<"PHONE" | "EMAIL" | null>(null);
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [isResending, setIsResending] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resentSuccessMsg, setResentSuccessMsg] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend OTP countdown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
  });

  const openEditModal = () => {
    const rawDob = (user as any)?.dob || (user as any)?.profile?.dob;
    const formattedDobInput = rawDob ? new Date(rawDob).toISOString().split('T')[0] : "";
    setProfileForm({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email === "Not provided" ? "" : userData.email,
      phone: userData.phone === "Not provided" ? "" : userData.phone.replace("+91 ", ""),
      gender: (user as any)?.gender || (user as any)?.profile?.gender || "",
      dob: formattedDobInput,
    });
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const fullName = `${profileForm.firstName.trim()} ${profileForm.lastName.trim()}`.trim();
      let rawPhone = profileForm.phone.trim();
      if (rawPhone && !rawPhone.startsWith('+91') && /^\d{10}$/.test(rawPhone)) {
        rawPhone = `+91 ${rawPhone}`;
      }
      await profileService.updateBasicProfile({
        name: fullName,
        email: profileForm.email.trim() || undefined,
        phone: rawPhone || undefined,
        gender: (profileForm.gender as any) || undefined,
        dob: profileForm.dob || undefined,
      });

      showToast("Profile details updated successfully!");
      setIsEditProfileOpen(false);
      await fetchFullProfile();
    } catch (err: any) {
      alert(err?.message || "Failed to update profile details");
    } finally {
      setIsSaving(false);
    }
  };

  // Trigger Send OTP for verification
  const handleOpenVerifyModal = async (type: "PHONE" | "EMAIL") => {
    setVerifyModalType(type);
    setOtpDigits(["", "", "", "", "", ""]);
    setOtpError(null);
    setResentSuccessMsg(null);
    setIsResending(false);

    // If cooldown expired, send verification code in background
    if (resendCooldown <= 0) {
      setResendCooldown(60);
      try {
        if (type === "PHONE") {
          await authService.sendUserMobileVerification(user?.phone || userData.phone);
        } else {
          await authService.sendUserEmailVerification(user?.email || userData.email);
        }
      } catch (err: any) {
        setOtpError(err?.message || "Failed to send verification code. You can click Resend OTP to try again.");
      }
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResending || isVerifyingOtp || !verifyModalType) return;
    setIsResending(true);
    setOtpError(null);
    setResentSuccessMsg(null);

    const targetDestination = verifyModalType === "PHONE"
      ? (user?.phone || userData.phone)
      : (user?.email || userData.email);

    try {
      if (verifyModalType === "PHONE") {
        await authService.sendUserMobileVerification(user?.phone || userData.phone);
      } else {
        await authService.sendUserEmailVerification(user?.email || userData.email);
      }
      setResendCooldown(60);
      setResentSuccessMsg(`OTP resent successfully to ${targetDestination}!`);
    } catch (err: any) {
      setOtpError(err?.message || "Failed to resend OTP code. Please wait a moment.");
    } finally {
      setIsResending(false);
    }
  };

  const handleDigitChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, "");
    if (!cleaned) {
      const next = [...otpDigits];
      next[index] = "";
      setOtpDigits(next);
      return;
    }

    const next = [...otpDigits];
    next[index] = cleaned[cleaned.length - 1];
    setOtpDigits(next);

    if (index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleDigitPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!paste) return;
    const next = [...otpDigits];
    for (let i = 0; i < paste.length; i++) {
      next[i] = paste[i];
    }
    setOtpDigits(next);
    const focusIdx = Math.min(paste.length, 5);
    otpInputRefs.current[focusIdx]?.focus();
  };

  // Submit OTP Verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otpDigits.join("");
    if (fullCode.length !== 6) {
      setOtpError("Please enter all 6 digits of the OTP code");
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError(null);
    try {
      let updatedUser: any = null;
      if (verifyModalType === "PHONE") {
        const res: any = await authService.verifyUserMobile(fullCode, user?.phone || userData.phone);
        updatedUser = res?.user;
        showToast("Mobile number verified successfully!");
      } else {
        const res: any = await authService.verifyUserEmail(fullCode, user?.email || userData.email);
        updatedUser = res?.user;
        showToast("Email address verified successfully!");
      }

      if (updatedUser) {
        setUser((prev: any) => ({
          ...prev,
          ...updatedUser,
          isEmailVerified: verifyModalType === "EMAIL" ? true : prev?.isEmailVerified,
          isPhoneVerified: verifyModalType === "PHONE" ? true : prev?.isPhoneVerified,
        }));
      }

      setVerifyModalType(null);
      setOtpDigits(["", "", "", "", "", ""]);
      setResentSuccessMsg(null);
      await fetchFullProfile();
    } catch (err: any) {
      setOtpError(err?.message || "Invalid OTP code. Please check and try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <>
      {toastMsg && (
        <div className={styles.toastNotification}>
          <CheckCircle2 size={18} color="#16A34A" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className={styles.backHeaderGroup}>
        <Link href="/account" className={styles.backToAccountBtn}>
          <ArrowLeft size={18} />
          <span>Back to Account</span>
        </Link>
      </div>

      <div className={styles.sectionBlockCard}>
        <div className={styles.sectionBlockHeader}>
          <div>
            <h1 className={styles.blockTitle}>Profile Details</h1>
            <p className={styles.blockSubtitle}>
              Manage your personal identity, contact preferences, and security settings.
            </p>
          </div>
          <button type="button" className={styles.editHeaderBtn} onClick={openEditModal}>
            <Edit3 size={15} />
            <span>Edit Profile</span>
          </button>
        </div>

        {isLoadingProfile ? (
          <div style={{ padding: "3rem 2rem", textAlign: "center", color: "#78746D" }}>
            <Loader2 size={28} className="animate-spin" style={{ margin: "0 auto 0.75rem", color: "#F28C0F" }} />
            <p style={{ fontWeight: 500 }}>Loading profile details...</p>
          </div>
        ) : (
          <div className={styles.infoFieldsGrid}>
            <div className={styles.infoFieldBox}>
              <div className={styles.fieldIconWrap}>
                <User size={18} />
              </div>
              <div className={styles.fieldMeta}>
                <span className={styles.fieldLabel}>Full Name</span>
                <span className={styles.fieldValue}>
                  {userData.firstName} {userData.lastName}
                </span>
              </div>
            </div>

            <div className={styles.infoFieldBox}>
              <div className={styles.fieldIconWrap}>
                <Mail size={18} />
              </div>
              <div className={styles.fieldMeta}>
                <div className={styles.fieldHeaderRow}>
                  <span className={styles.fieldLabel}>Email Address</span>
                  {userData.isEmailVerified ? (
                    <span className={styles.verifiedBadge}>
                      <ShieldCheck size={13} /> Verified
                    </span>
                  ) : (
                    <span className={styles.unverifiedBadge}>
                      <AlertCircle size={13} /> Unverified
                    </span>
                  )}
                </div>
                <div className={styles.fieldValueRow}>
                  <span className={styles.fieldValue}>{userData.email}</span>
                  {!userData.isEmailVerified && userData.email !== "Not provided" && (
                    <button
                      type="button"
                      className={styles.verifyBtn}
                      onClick={() => handleOpenVerifyModal("EMAIL")}
                    >
                      Verify Now
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.infoFieldBox}>
              <div className={styles.fieldIconWrap}>
                <Phone size={18} />
              </div>
              <div className={styles.fieldMeta}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                  <span className={styles.fieldLabel}>Phone Number</span>
                  {userData.isPhoneVerified ? (
                    <span style={{ color: "#16A34A", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 3 }}>
                      <ShieldCheck size={13} /> Verified
                    </span>
                  ) : (
                    <span style={{ color: "#D97706", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 3 }}>
                      <AlertCircle size={13} /> Unverified
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
                  <span className={styles.fieldValue}>{userData.phone}</span>
                  {!userData.isPhoneVerified && userData.phone !== "Not provided" && (
                    <button
                      type="button"
                      style={{
                        background: "#FFF9F0",
                        border: "1px solid #F28C0F",
                        color: "#F28C0F",
                        padding: "2px 8px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                      onClick={() => handleOpenVerifyModal("PHONE")}
                    >
                      Verify Phone
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.infoFieldBox}>
              <div className={styles.fieldIconWrap}>
                <UserCheck size={18} />
              </div>
              <div className={styles.fieldMeta}>
                <span className={styles.fieldLabel}>Gender</span>
                <span className={styles.fieldValue}>{userData.gender}</span>
              </div>
            </div>

            <div className={styles.infoFieldBox}>
              <div className={styles.fieldIconWrap}>
                <Calendar size={18} />
              </div>
              <div className={styles.fieldMeta}>
                <span className={styles.fieldLabel}>Date of Birth</span>
                <span className={styles.fieldValue}>{userData.dob}</span>
              </div>
            </div>

            <div className={styles.infoFieldBox}>
              <div className={styles.fieldIconWrap}>
                <Clock size={18} />
              </div>
              <div className={styles.fieldMeta}>
                <span className={styles.fieldLabel}>Member Since</span>
                <span className={styles.fieldValue}>{userData.memberSince}</span>
              </div>
            </div>

            <div className={styles.infoFieldBox}>
              <div className={styles.fieldIconWrap}>
                <Crown size={18} />
              </div>
              <div className={styles.fieldMeta}>
                <span className={styles.fieldLabel}>Membership Tier</span>
                <span className={styles.fieldValue}>{userData.tier}</span>
              </div>
            </div>

            <div className={styles.infoFieldBox}>
              <div className={styles.fieldIconWrap}>
                <ShieldCheck size={18} />
              </div>
              <div className={styles.fieldMeta}>
                <span className={styles.fieldLabel}>Account Security</span>
                <span
                  className={styles.fieldValue}
                  style={{
                    color: userData.isEmailVerified && userData.isPhoneVerified ? "#16A34A" : "#D97706",
                    fontWeight: 700,
                  }}
                >
                  {userData.isEmailVerified && userData.isPhoneVerified
                    ? "Fully Verified"
                    : "Partial Verification Required"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className={styles.modalBackdrop} onClick={() => !isSaving && setIsEditProfileOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleGroup}>
                <Edit3 size={20} color="#F28C0F" />
                <h2>Edit Personal Details</h2>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setIsEditProfileOpen(false)}
                disabled={isSaving}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className={styles.modalForm}>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>First Name</label>
                  <input
                    type="text"
                    required
                    className={styles.modalInput}
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                    disabled={isSaving}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Last Name</label>
                  <input
                    type="text"
                    required
                    className={styles.modalInput}
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label className={styles.inputLabel} style={{ marginBottom: 0 }}>Email Address</label>
                  {userData.isEmailVerified && (
                    <span style={{ color: '#16A34A', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <ShieldCheck size={12} /> Verified
                    </span>
                  )}
                </div>
                <input
                  type="email"
                  required
                  className={styles.modalInput}
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  disabled={isSaving || userData.isEmailVerified}
                  readOnly={userData.isEmailVerified}
                  style={userData.isEmailVerified ? { cursor: 'not-allowed', backgroundColor: '#F9FAFB', color: '#6B7280' } : undefined}
                />
              </div>

              <div className={styles.inputGroup}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label className={styles.inputLabel} style={{ marginBottom: 0 }}>Phone Number</label>
                  {userData.isPhoneVerified && (
                    <span style={{ color: '#16A34A', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <ShieldCheck size={12} /> Verified
                    </span>
                  )}
                </div>
                <input
                  type="tel"
                  required
                  className={styles.modalInput}
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  disabled={isSaving || userData.isPhoneVerified}
                  readOnly={userData.isPhoneVerified}
                  style={userData.isPhoneVerified ? { cursor: 'not-allowed', backgroundColor: '#F9FAFB', color: '#6B7280' } : undefined}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Gender</label>
                  <select
                    className={styles.modalInput}
                    value={profileForm.gender}
                    onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                    disabled={isSaving}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Date of Birth</label>
                  <input
                    type="date"
                    className={styles.modalInput}
                    value={profileForm.dob}
                    onChange={(e) => setProfileForm({ ...profileForm, dob: e.target.value })}
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className={styles.modalFooterActions}>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={() => setIsEditProfileOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`${styles.actionBtn} ${styles.primaryBtn}`}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {verifyModalType && (
        <div className={styles.modalBackdrop} onClick={() => !isVerifyingOtp && setVerifyModalType(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleGroup}>
                <ShieldCheck size={22} color="#F59E0B" />
                <h2>Verify {verifyModalType === "PHONE" ? "Mobile Number" : "Email Address"}</h2>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setVerifyModalType(null)}
                disabled={isVerifyingOtp}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleVerifyOtp} className={styles.modalForm}>
              <p style={{ fontSize: '0.88rem', color: '#4B5563', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                We sent a 6-digit verification code to{" "}
                <strong style={{ color: '#111827' }}>
                  {verifyModalType === "PHONE" ? user?.phone || userData.phone : user?.email || userData.email}
                </strong>
                . Enter the code below to complete verification.
              </p>

              {resentSuccessMsg && !otpError && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  color: '#065F46',
                  padding: '10px 14px',
                  borderRadius: 10,
                  fontSize: 13,
                  marginBottom: 16
                }}>
                  <CheckCircle2 size={16} style={{ flexShrink: 0, color: '#10B981' }} />
                  <span>{resentSuccessMsg}</span>
                </div>
              )}

              {otpError && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: '#FEE2E2',
                  border: '1px solid #FCA5A5',
                  color: '#991B1B',
                  padding: '10px 14px',
                  borderRadius: 10,
                  fontSize: 13,
                  marginBottom: 16
                }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{otpError}</span>
                </div>
              )}

              <div style={{ textAlign: 'center', margin: '8px 0 20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#4B5563',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '10px'
                }}>
                  Enter 6-Digit OTP Code
                </label>
                <div className={styles.otpBoxesContainer}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { otpInputRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      autoFocus={idx === 0}
                      className={styles.otpBoxInput}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                      onPaste={handleDigitPaste}
                      disabled={isVerifyingOtp}
                    />
                  ))}
                </div>
              </div>

              <div className={styles.modalFooterActions}>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || isResending || isVerifyingOtp}
                  style={{ minWidth: '135px' }}
                >
                  {isResending ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Loader2 size={14} className="animate-spin" /> Sending...
                    </span>
                  ) : resendCooldown > 0 ? (
                    `Resend in ${resendCooldown}s`
                  ) : (
                    "Resend OTP"
                  )}
                </button>
                <button
                  type="submit"
                  className={`${styles.actionBtn} ${styles.primaryBtn}`}
                  disabled={isVerifyingOtp || otpDigits.join('').length !== 6}
                >
                  {isVerifyingOtp ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Loader2 size={16} className="animate-spin" /> Verifying...
                    </span>
                  ) : (
                    "Verify & Save"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
</>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div style={{ padding: "100px", textAlign: "center" }}>Loading profile details...</div>}>
      <ProfileDetailsContent />
    </Suspense>
  );
}
