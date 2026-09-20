"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import {
  CreditCard,
  Plus,
  ShieldCheck,
  Trash2,
  Smartphone,
  Building2,
  ArrowLeft,
  CheckCircle2,
  X,
} from "lucide-react";
import styles from "../Account.module.css";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { profileService, CreatePaymentMethodDto } from "@/services/profileService";

function PaymentMethodsContent() {
  const [methods, setMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [methodType, setMethodType] = useState<"UPI" | "BANK_ACCOUNT">("UPI");
  const [upiId, setUpiId] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const res: any = await profileService.getPaymentMethods();
      if (res && res.methods) {
        setMethods(res.methods);
      }
    } catch (err: any) {
      console.error("Failed to fetch payment methods:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const resetForm = () => {
    setMethodType("UPI");
    setUpiId("");
    setAccountHolderName("");
    setAccountNumber("");
    setIfscCode("");
    setBankName("");
    setIsDefault(false);
    setErrorMsg(null);
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (methodType === "UPI" && !upiId.trim()) {
      setErrorMsg("Please enter a valid UPI ID (e.g. name@upi)");
      return;
    }

    if (methodType === "BANK_ACCOUNT") {
      if (!accountNumber.trim() || !ifscCode.trim()) {
        setErrorMsg("Please enter both Account Number and IFSC Code");
        return;
      }
    }

    try {
      setSubmitting(true);
      const dto: CreatePaymentMethodDto = {
        type: methodType,
        isDefault,
        ...(methodType === "UPI"
          ? { upiId: upiId.trim(), accountHolderName: accountHolderName.trim() || undefined }
          : {
              accountNumber: accountNumber.trim(),
              ifscCode: ifscCode.trim().toUpperCase(),
              accountHolderName: accountHolderName.trim() || undefined,
              bankName: bankName.trim() || undefined,
            }),
      };

      await profileService.addPaymentMethod(dto);
      setIsModalOpen(false);
      resetForm();
      await fetchPaymentMethods();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save payment method");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await profileService.deletePaymentMethod(deleteId);
      setDeleteId(null);
      await fetchPaymentMethods();
    } catch (err: any) {
      console.error("Failed to delete payment method:", err);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await profileService.setDefaultPaymentMethod(id);
      await fetchPaymentMethods();
    } catch (err: any) {
      console.error("Failed to set default payment method:", err);
    }
  };

  return (
    <>
      <div className={styles.backHeaderGroup}>
        <Link href="/account" className={styles.backToAccountBtn}>
          <ArrowLeft size={18} />
          <span>Back to Account</span>
        </Link>
      </div>

      <div className={styles.contentArea}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageH1}>Payment & Refund Methods</h1>
            <p className={styles.pageSubtitle}>
              Manage your saved UPI IDs and Bank Accounts for instant checkout and COD refunds
            </p>
          </div>
          <Button variant="primary" icon={<Plus size={16} />} onClick={handleOpenModal}>
            Add Payment Method
          </Button>
        </div>

        <div className={styles.trustBanner}>
          <ShieldCheck size={20} className={styles.trustIcon} />
          <div className={styles.trustText}>
            <strong>100% Encrypted & Secure</strong>
            <span>Your payout and payment details are encrypted following strict banking guidelines.</span>
          </div>
        </div>

        {loading ? (
          <div className={styles.paymentList}>
            <Skeleton style={{ height: 90, borderRadius: 16 }} />
            <Skeleton style={{ height: 90, borderRadius: 16 }} />
          </div>
        ) : methods.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", background: "#FAF7F2", borderRadius: 20 }}>
            <Building2 size={40} style={{ color: "#F28C0F", marginBottom: 12 }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 6px 0", color: "#2D261E" }}>
              No Payment Methods Saved
            </h3>
            <p style={{ fontSize: 14, color: "#6E6259", marginBottom: 20 }}>
              Add a UPI ID or Bank Account for fast checkouts and automatic COD refund processing.
            </p>
            <Button variant="primary" icon={<Plus size={16} />} onClick={handleOpenModal}>
              Add Your First Method
            </Button>
          </div>
        ) : (
          <div className={styles.paymentList}>
            {methods.map((method) => (
              <div key={method.id} className={styles.paymentCard}>
                <div className={styles.paymentLeft}>
                  <div className={styles.paymentIconWrap}>
                    {method.type === "UPI" ? (
                      <Smartphone size={20} />
                    ) : method.type === "BANK_ACCOUNT" ? (
                      <Building2 size={20} />
                    ) : (
                      <CreditCard size={20} />
                    )}
                  </div>
                  <div className={styles.paymentDetails}>
                    <div className={styles.paymentTitleRow}>
                      <span className={styles.paymentTitle}>
                        {method.type === "UPI"
                          ? `UPI ID: ${method.upiId}`
                          : method.type === "BANK_ACCOUNT"
                          ? `Bank Account (${method.bankName || "Bank"})`
                          : `${method.cardNetwork || "Card"} ending in ${method.cardLast4}`}
                      </span>
                      {method.isDefault && <span className={styles.paymentDefaultBadge}>Default</span>}
                    </div>
                    <span className={styles.paymentSub}>
                      {method.type === "UPI"
                        ? method.accountHolderName ? `Holder: ${method.accountHolderName}` : "Saved for Quick Payments & Refunds"
                        : method.type === "BANK_ACCOUNT"
                        ? `Acc: ${method.accountNumber} | IFSC: ${method.ifscCode}`
                        : "Tokenized via Gateway"}
                    </span>
                  </div>
                </div>

                <div className={styles.paymentActions}>
                  {!method.isDefault && (
                    <Button variant="secondary" size="sm" onClick={() => handleSetDefault(method.id)}>
                      Make Default
                    </Button>
                  )}
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<Trash2 size={14} />}
                    onClick={() => setDeleteId(method.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Payment Method Modal */}
      {isModalOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleGroup}>
                <h2>Add Payment / Refund Method</h2>
              </div>
              <button className={styles.modalCloseBtn} onClick={handleCloseModal}>
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div style={{ background: "#FEE2E2", color: "#DC2626", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 16 }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Method Type</label>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: 12,
                      border: methodType === "UPI" ? "2px solid #F28C0F" : "1px solid #EFE7DA",
                      background: methodType === "UPI" ? "#FFF9F0" : "#FFFFFF",
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                    onClick={() => setMethodType("UPI")}
                  >
                    <Smartphone size={16} /> UPI ID
                  </button>
                  <button
                    type="button"
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: 12,
                      border: methodType === "BANK_ACCOUNT" ? "2px solid #F28C0F" : "1px solid #EFE7DA",
                      background: methodType === "BANK_ACCOUNT" ? "#FFF9F0" : "#FFFFFF",
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                    onClick={() => setMethodType("BANK_ACCOUNT")}
                  >
                    <Building2 size={16} /> Bank Account
                  </button>
                </div>
              </div>

              {methodType === "UPI" ? (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>UPI ID (VPA)</label>
                    <input
                      type="text"
                      className={styles.modalInput}
                      placeholder="e.g. name@okicici, 9876543210@paytm"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Account Holder Name (Optional)</label>
                    <input
                      type="text"
                      className={styles.modalInput}
                      placeholder="Name as per UPI App"
                      value={accountHolderName}
                      onChange={(e) => setAccountHolderName(e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Account Holder Name</label>
                    <input
                      type="text"
                      className={styles.modalInput}
                      placeholder="Name as printed in Passbook"
                      value={accountHolderName}
                      onChange={(e) => setAccountHolderName(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Account Number</label>
                    <input
                      type="text"
                      className={styles.modalInput}
                      placeholder="Enter Bank Account Number"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>IFSC Code</label>
                      <input
                        type="text"
                        className={styles.modalInput}
                        placeholder="e.g. SBIN0001234"
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Bank Name (Optional)</label>
                      <input
                        type="text"
                        className={styles.modalInput}
                        placeholder="e.g. State Bank of India"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <input
                  type="checkbox"
                  id="isDefaultCheck"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: "#F28C0F" }}
                />
                <label htmlFor="isDefaultCheck" style={{ fontSize: 13, fontWeight: 500, color: "#4A423A", cursor: "pointer" }}>
                  Set as default method for payments & instant COD refunds
                </label>
              </div>

              <div className={styles.modalFooterActions}>
                <Button variant="secondary" type="button" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Payment Method"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Remove Payment Method"
        message="Are you sure you want to remove this saved payment method?"
        confirmText="Remove"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isDanger={true}
      />
    </>
  );
}

export default function PaymentMethodsPage() {
  return (
    <Suspense fallback={<div style={{ padding: "100px", textAlign: "center" }}>Loading...</div>}>
      <PaymentMethodsContent />
    </Suspense>
  );
}
