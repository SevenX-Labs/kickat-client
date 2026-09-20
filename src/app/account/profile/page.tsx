"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  Calendar,
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
  const [otpCode, setOtpCode] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const openEditModal = () => {
    setProfileForm({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email === "Not provided" ? "" : userData.email,
      phone: userData.phone === "Not provided" ? "" : userData.phone.replace("+91 ", ""),
    });
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const fullName = `${profileForm.firstName.trim()} ${profileForm.lastName.trim()}`.trim();
      await profileService.updateBasicProfile({
        name: fullName,
        email: profileForm.email.trim() || undefined,
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
    setOtpCode("");
    setOtpError(null);
    setIsSendingOtp(true);
    try {
      if (type === "PHONE") {
        await authService.sendUserMobileVerification(user?.phone || userData.phone);
      } else {
        await authService.sendUserEmailVerification(user?.email || userData.email);
      }
    } catch (err: any) {
      setOtpError(err?.message || "Failed to send OTP code. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Submit OTP Verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP code");
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError(null);
    try {
      if (verifyModalType === "PHONE") {
        await authService.verifyUserMobile(otpCode.trim(), user?.phone || userData.phone);
        showToast("Mobile number verified successfully!");
      } else {
        await authService.verifyUserEmail(otpCode.trim(), user?.email || userData.email);
        showToast("Email address verified successfully!");
      }
      setVerifyModalType(null);
      setOtpCode("");
      await fetchFullProfile();
    } catch (err: any) {
      setOtpError(err?.message || "Invalid OTP code. Please try again.");
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
                <Calendar size={18} />
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
                <label className={styles.inputLabel}>Email Address</label>
                <input
                  type="email"
                  required
                  className={styles.modalInput}
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  disabled={isSaving}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Phone Number</label>
                <input
                  type="tel"
                  required
                  className={styles.modalInput}
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  disabled={isSaving}
                />
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
                <ShieldCheck size={20} color="#F28C0F" />
                <h2>Verify {verifyModalType === "PHONE" ? "Mobile Number" : "Email Address"}</h2>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setVerifyModalType(null)}
                disabled={isVerifyingOtp}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleVerifyOtp} className={styles.modalForm}>
              <p style={{ fontSize: 13, color: "#6E6259", margin: "0 0 12px 0" }}>
                We sent a 6-digit OTP code to{" "}
                <strong>
                  {verifyModalType === "PHONE" ? user?.phone || userData.phone : user?.email || userData.email}
                </strong>
                .
              </p>

              {otpError && (
                <div style={{ background: "#FEE2E2", color: "#DC2626", padding: "10px 14px", borderRadius: 10, fontSize: 13 }}>
                  {otpError}
                </div>
              )}

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Enter 6-Digit OTP</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  className={styles.modalInput}
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  disabled={isVerifyingOtp || isSendingOtp}
                  style={{ textAlign: "center", letterSpacing: "4px", fontSize: 18, fontWeight: 700 }}
                />
              </div>

              <div className={styles.modalFooterActions}>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={() => handleOpenVerifyModal(verifyModalType)}
                  disabled={isSendingOtp || isVerifyingOtp}
                >
                  {isSendingOtp ? "Resending..." : "Resend OTP"}
                </button>
                <button
                  type="submit"
                  className={`${styles.actionBtn} ${styles.primaryBtn}`}
                  disabled={isVerifyingOtp || otpCode.length !== 6}
                >
                  {isVerifyingOtp ? "Verifying..." : "Verify & Save"}
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
