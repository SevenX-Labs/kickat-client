"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  X,
  MapPin,
  Home,
  Briefcase,
  Plus,
  Check,
  Loader2,
  Navigation,
  Building,
  CheckCircle2,
} from "lucide-react";
import { profileService, CreateAddressDto } from "@/services/profileService";
import { useAuth } from "@/context/AuthContext";
import styles from "./AddressSelectionDrawer.module.css";

export interface AddressItem {
  id?: string;
  type?: string;
  houseFlat?: string;
  buildingStreet?: string;
  addressLine?: string;
  street?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

interface AddressSelectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPincode: string | null;
  onSelectAddress: (addr: { pincode: string; city: string; state: string; isDefault?: boolean }) => void;
  onCheckPincode: (pincode: string) => void;
  isCheckingDelivery?: boolean;
}

export function AddressSelectionDrawer({
  isOpen,
  onClose,
  selectedPincode,
  onSelectAddress,
  onCheckPincode,
  isCheckingDelivery = false,
}: AddressSelectionDrawerProps) {
  const { isAuthenticated } = useAuth();
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [quickPinInput, setQuickPinInput] = useState("");
  const [quickPinError, setQuickPinError] = useState<string | null>(null);

  // Add Address Form State
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [formType, setFormType] = useState<"HOME" | "WORK" | "OTHER">("HOME");
  const [formHouseFlat, setFormHouseFlat] = useState("");
  const [formStreet, setFormStreet] = useState("");
  const [formPincode, setFormPincode] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formState, setFormState] = useState("Maharashtra");
  const [formIsDefault, setFormIsDefault] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch customer saved addresses
  const loadAddresses = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingAddresses(true);
    try {
      const res: any = await profileService.getProfile();
      const addrs = res?.user?.addresses || res?.addresses || [];
      if (Array.isArray(addrs)) {
        setAddresses(addrs);
      }
    } catch (err) {
      console.warn("Failed to load customer addresses in drawer:", err);
    } finally {
      setIsLoadingAddresses(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isOpen) {
      loadAddresses();
      setIsAddFormOpen(false);
      setQuickPinError(null);
      setFormError(null);
    }
  }, [isOpen, loadAddresses]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Quick Pincode Submit
  const handleQuickPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = quickPinInput.trim();
    if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
      setQuickPinError("Please enter a valid 6-digit pincode.");
      return;
    }
    setQuickPinError(null);
    onCheckPincode(cleanPin);
    onClose();
  };

  // Add New Address Submit
  const handleAddAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStreet.trim() || !formCity.trim() || !formPincode.trim()) {
      setFormError("Please fill in Street, City, and 6-digit Pincode.");
      return;
    }
    if (!/^[1-9][0-9]{5}$/.test(formPincode.trim())) {
      setFormError("Enter a valid 6-digit pincode.");
      return;
    }

    setIsSavingAddress(true);
    setFormError(null);

    try {
      const payload: CreateAddressDto = {
        type: formType,
        houseFlat: formHouseFlat.trim() || undefined,
        buildingStreet: formStreet.trim(),
        city: formCity.trim(),
        state: formState.trim() || "Maharashtra",
        pincode: formPincode.trim(),
        isDefault: formIsDefault,
      };

      await profileService.addAddress(payload);
      
      // Auto select the newly created address
      onSelectAddress({
        pincode: formPincode.trim(),
        city: formCity.trim(),
        state: formState.trim() || "Maharashtra",
        isDefault: formIsDefault,
      });

      setIsAddFormOpen(false);
      onClose();
    } catch (err: any) {
      console.error("Failed to add address:", err);
      setFormError(err?.message || "Failed to save address. Please try again.");
    } finally {
      setIsSavingAddress(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.drawer} role="dialog" aria-modal="true" aria-labelledby="delivery-drawer-title">
        {/* Drawer Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIconWrap}>
              <MapPin size={20} />
            </div>
            <div>
              <h2 id="delivery-drawer-title" className={styles.headerTitle}>
                Delivery Location
              </h2>
              <p className={styles.headerSubtitle}>
                Select a saved address or check another pincode
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close delivery options"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Content */}
        <div className={styles.content}>
          {/* 1. Quick Pincode Checker */}
          <div className={styles.pincodeSection}>
            <div className={styles.sectionLabel}>
              <Navigation size={14} color="#F15722" />
              <span>Check another pincode</span>
            </div>
            <form onSubmit={handleQuickPinSubmit} className={styles.pincodeForm}>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={quickPinInput}
                onChange={(e) => {
                  setQuickPinInput(e.target.value.replace(/\D/g, ""));
                  setQuickPinError(null);
                }}
                placeholder="Enter 6-digit pincode"
                className={styles.pincodeInput}
                disabled={isCheckingDelivery}
                aria-label="Enter pincode"
              />
              <button
                type="submit"
                className={styles.pincodeCheckBtn}
                disabled={isCheckingDelivery || quickPinInput.trim().length !== 6}
              >
                {isCheckingDelivery ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  "Check"
                )}
              </button>
            </form>
            {quickPinError && <p className={styles.inputError}>{quickPinError}</p>}
          </div>

          {/* 2. Customer Saved Addresses */}
          {isAuthenticated ? (
            <div className={styles.addressesSection}>
              <div className={styles.sectionLabel}>
                <Building size={14} color="#F15722" />
                <span>Your Saved Addresses</span>
              </div>

              {isLoadingAddresses ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 0", gap: "0.5rem", color: "#78746D", fontSize: "0.85rem" }}>
                  <Loader2 size={16} className="animate-spin" color="#F15722" />
                  <span>Loading saved addresses...</span>
                </div>
              ) : addresses.length > 0 ? (
                addresses.map((addr, idx) => {
                  const isSelected = selectedPincode === addr.pincode;
                  const typeUpper = (addr.type || "HOME").toUpperCase();
                  const addressLine = [addr.houseFlat, addr.buildingStreet || addr.addressLine || addr.street]
                    .filter(Boolean)
                    .join(", ");

                  return (
                    <div
                      key={addr.id || idx}
                      className={`${styles.addressCard} ${isSelected ? styles.addressCardSelected : ""}`}
                      onClick={() => {
                        onSelectAddress({
                          pincode: addr.pincode,
                          city: addr.city,
                          state: addr.state,
                          isDefault: addr.isDefault,
                        });
                        onClose();
                      }}
                    >
                      <div className={styles.radioIndicator}>
                        {isSelected && <div className={styles.radioDot} />}
                      </div>
                      <div className={styles.addressBody}>
                        <div className={styles.addressTopRow}>
                          <span className={styles.typeBadge}>
                            {typeUpper === "WORK" ? (
                              <Briefcase size={11} />
                            ) : typeUpper === "HOME" ? (
                              <Home size={11} />
                            ) : (
                              <MapPin size={11} />
                            )}
                            <span>{typeUpper}</span>
                          </span>
                          {addr.isDefault && (
                            <span className={styles.defaultBadge}>Default</span>
                          )}
                        </div>
                        {addressLine && <p className={styles.addressLines}>{addressLine}</p>}
                        <p className={styles.addressCityPin}>
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p style={{ fontSize: "0.85rem", color: "#78746D", margin: 0 }}>
                  No saved addresses found in your account.
                </p>
              )}

              {/* + Add New Address Toggle / Form */}
              {!isAddFormOpen ? (
                <button
                  type="button"
                  className={styles.addAddressToggleBtn}
                  onClick={() => setIsAddFormOpen(true)}
                >
                  <Plus size={16} />
                  <span>Add a new delivery address</span>
                </button>
              ) : (
                <form onSubmit={handleAddAddressSubmit} className={styles.addForm}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1A1612" }}>
                      New Address Details
                    </span>
                    <button
                      type="button"
                      style={{ background: "none", border: "none", color: "#78746D", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600 }}
                      onClick={() => setIsAddFormOpen(false)}
                    >
                      Close Form
                    </button>
                  </div>

                  <div className={styles.formCol}>
                    <label className={styles.formLabel}>Address Type</label>
                    <div className={styles.typePills}>
                      {(["HOME", "WORK", "OTHER"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          className={`${styles.typePill} ${formType === t ? styles.typePillActive : ""}`}
                          onClick={() => setFormType(t)}
                        >
                          {t === "WORK" ? <Briefcase size={12} /> : <Home size={12} />}
                          <span>{t}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.formCol}>
                    <label className={styles.formLabel}>Flat, House No., Building *</label>
                    <input
                      type="text"
                      value={formHouseFlat}
                      onChange={(e) => setFormHouseFlat(e.target.value)}
                      placeholder="e.g. Flat 402, Sunshine Apts"
                      className={styles.formInput}
                      required
                    />
                  </div>

                  <div className={styles.formCol}>
                    <label className={styles.formLabel}>Street Address / Area *</label>
                    <input
                      type="text"
                      value={formStreet}
                      onChange={(e) => setFormStreet(e.target.value)}
                      placeholder="e.g. MG Road, Near Central Park"
                      className={styles.formInput}
                      required
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formCol}>
                      <label className={styles.formLabel}>PIN Code *</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={formPincode}
                        onChange={(e) => setFormPincode(e.target.value.replace(/\D/g, ""))}
                        placeholder="6-digit PIN"
                        className={styles.formInput}
                        required
                      />
                    </div>
                    <div className={styles.formCol}>
                      <label className={styles.formLabel}>City *</label>
                      <input
                        type="text"
                        value={formCity}
                        onChange={(e) => setFormCity(e.target.value)}
                        placeholder="e.g. Dombivli / Mumbai"
                        className={styles.formInput}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.formCol}>
                    <label className={styles.formLabel}>State *</label>
                    <input
                      type="text"
                      value={formState}
                      onChange={(e) => setFormState(e.target.value)}
                      placeholder="e.g. Maharashtra"
                      className={styles.formInput}
                      required
                    />
                  </div>

                  <label className={styles.checkboxRow}>
                    <input
                      type="checkbox"
                      checked={formIsDefault}
                      onChange={(e) => setFormIsDefault(e.target.checked)}
                      style={{ accentColor: "#F15722", width: "16px", height: "16px" }}
                    />
                    <span>Set as default address</span>
                  </label>

                  {formError && <p className={styles.inputError}>{formError}</p>}

                  <div className={styles.formActions}>
                    <button
                      type="submit"
                      className={styles.submitAddressBtn}
                      disabled={isSavingAddress}
                    >
                      {isSavingAddress ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Check size={16} />
                          <span>Save &amp; Deliver Here</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className={styles.cancelFormBtn}
                      onClick={() => setIsAddFormOpen(false)}
                      disabled={isSavingAddress}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className={styles.guestPromptCard}>
              <h3 className={styles.guestPromptTitle}>Want to see your saved addresses?</h3>
              <p className={styles.guestPromptDesc}>
                Sign in to your KickAt account to select from your saved delivery locations or add new addresses.
              </p>
              <Link
                href={`/login?redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/shop")}`}
                className={styles.guestLoginBtn}
                onClick={onClose}
              >
                Sign In to Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
