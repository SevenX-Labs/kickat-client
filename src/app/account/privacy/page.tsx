"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Key,
  Download,
  MonitorSmartphone,
  AlertTriangle,
  ArrowLeft,
  ToggleLeft,
  ShieldAlert,
  LogOut,
  CheckCircle2
} from 'lucide-react';
import styles from '../Account.module.css';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/context/AuthContext';

function PrivacyContent() {
  const router = useRouter();
  const { logout, logoutAll } = useAuth();

  const [loading, setLoading] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLogoutCurrentOpen, setIsLogoutCurrentOpen] = useState(false);
  const [isLogoutAllOpen, setIsLogoutAllOpen] = useState(false);
  const [isLoggingOutCurrent, setIsLoggingOutCurrent] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);
  const [logoutAllError, setLogoutAllError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  const handleCurrentDeviceLogout = async () => {
    if (isLoggingOutCurrent) return;
    setIsLoggingOutCurrent(true);
    try {
      await logout();
      router.push('/login');
    } catch (err: any) {
      setToastType('error');
      setToastMsg(err?.message || 'Failed to log out. Please try again.');
    } finally {
      setIsLoggingOutCurrent(false);
      setIsLogoutCurrentOpen(false);
    }
  };

  const handleLogoutAll = async () => {
    if (isLoggingOutAll) return;
    setIsLoggingOutAll(true);
    setLogoutAllError(null);

    try {
      await logoutAll();
      setToastType('success');
      setToastMsg('Logged out from all devices successfully.');
      setIsLogoutAllOpen(false);
      setTimeout(() => {
        router.push('/login');
      }, 1000);
    } catch (err: any) {
      const msg = err?.message || 'Failed to revoke sessions. Please try again.';
      setLogoutAllError(msg);
      setToastType('error');
      setToastMsg(msg);
    } finally {
      setIsLoggingOutAll(false);
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
            <h1 className={styles.pageH1}>Privacy & Security</h1>
            <p className={styles.pageSubtitle}>Manage your account security, passwords, and active device sessions</p>
          </div>
        </div>

        {loading ? (
          <div className={styles.privacyGrid}>
            <Skeleton style={{ height: 150 }} />
            <Skeleton style={{ height: 150 }} />
          </div>
        ) : (
          <div className={styles.privacySections}>
            
            <div className={styles.privacySection}>
              <h3 className={styles.sectionTitle}>Login & Security</h3>
              <div className={styles.settingsList}>
                <div className={styles.settingRow}>
                  <div className={styles.settingLeft}>
                    <Key size={20} className={styles.settingIcon} />
                    <div className={styles.settingTextCol}>
                      <span className={styles.settingTitle}>Password</span>
                      <span className={styles.settingDesc}>Last changed 3 months ago</span>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" style={{ minHeight: '44px' }}>Update</Button>
                </div>
                <div className={styles.settingRow}>
                  <div className={styles.settingLeft}>
                    <Shield size={20} className={styles.settingIcon} />
                    <div className={styles.settingTextCol}>
                      <span className={styles.settingTitle}>Two-Factor Authentication (2FA)</span>
                      <span className={styles.settingDesc}>Coming soon to enhance your account security</span>
                    </div>
                  </div>
                  <button className={styles.toggleBtn} disabled aria-label="2FA toggle disabled">
                    <ToggleLeft size={32} color="var(--acc-muted)" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Sessions */}
            <div className={styles.privacySection}>
              <h3 className={styles.sectionTitle}>Active Sessions</h3>
              <div className={styles.settingsList}>
                {/* Current Device Session */}
                <div className={styles.settingRow}>
                  <div className={styles.settingLeft}>
                    <MonitorSmartphone size={20} className={styles.settingIcon} />
                    <div className={styles.settingTextCol}>
                      <span className={styles.settingTitle}>Current Device</span>
                      <span className={styles.settingDesc}>Active session on this browser</span>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsLogoutCurrentOpen(true)}
                    style={{ minHeight: '44px', minWidth: '95px' }}
                  >
                    Log out
                  </Button>
                </div>

                {/* All Devices Session */}
                <div className={styles.settingRow}>
                  <div className={styles.settingLeft}>
                    <ShieldAlert size={20} className={styles.settingIcon} />
                    <div className={styles.settingTextCol}>
                      <span className={styles.settingTitle}>All Devices</span>
                      <span className={styles.settingDesc}>This will sign you out from all active KickAt sessions.</span>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setLogoutAllError(null);
                      setIsLogoutAllOpen(true);
                    }}
                    style={{ minHeight: '44px', minWidth: '175px' }}
                  >
                    Log out of all devices
                  </Button>
                </div>

                {logoutAllError && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      backgroundColor: '#FDECEC',
                      border: '1px solid rgba(220, 38, 38, 0.3)',
                      color: '#DC2626',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      fontSize: '0.875rem',
                      marginTop: '0.5rem',
                    }}
                  >
                    <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                    <span>{logoutAllError}</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.privacySection}>
              <h3 className={styles.sectionTitle}>Your Data</h3>
              <div className={styles.settingsList}>
                <div className={styles.settingRow}>
                  <div className={styles.settingLeft}>
                    <Download size={20} className={styles.settingIcon} />
                    <div className={styles.settingTextCol}>
                      <span className={styles.settingTitle}>Download Account Data</span>
                      <span className={styles.settingDesc}>Get a copy of your personal data, orders, and addresses</span>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" style={{ minHeight: '44px' }}>Request Data</Button>
                </div>
              </div>
            </div>

            <div className={styles.dangerZone}>
              <h3 className={styles.dangerTitle}><AlertTriangle size={18} /> Danger Zone</h3>
              <div className={styles.dangerBox}>
                <div className={styles.settingTextCol}>
                  <span className={styles.dangerBoxTitle}>Delete Account</span>
                  <span className={styles.dangerBoxDesc}>Permanently delete your account and all associated data. This action cannot be undone.</span>
                </div>
                <Button variant="danger" onClick={() => setIsDeleteOpen(true)} style={{ minHeight: '44px' }}>Delete Account</Button>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Confirmation Dialog: Current Device Logout */}
      <ConfirmDialog 
        isOpen={isLogoutCurrentOpen}
        title="Sign Out"
        message="Are you sure you want to sign out of this device?"
        confirmText={isLoggingOutCurrent ? "Logging out..." : "Log out"}
        cancelText="Cancel"
        onConfirm={handleCurrentDeviceLogout}
        onCancel={() => !isLoggingOutCurrent && setIsLogoutCurrentOpen(false)}
        isDanger={true}
        isLoading={isLoggingOutCurrent}
      />

      {/* Confirmation Dialog: Logout All Devices */}
      <ConfirmDialog 
        isOpen={isLogoutAllOpen}
        title="Log out of all devices?"
        message="This will sign you out of KickAt on all active devices, including this device."
        confirmText={isLoggingOutAll ? "Logging out..." : "Log out all devices"}
        cancelText="Cancel"
        onConfirm={handleLogoutAll}
        onCancel={() => !isLoggingOutAll && setIsLogoutAllOpen(false)}
        isDanger={true}
        isLoading={isLoggingOutAll}
      />

      {/* Confirmation Dialog: Delete Account */}
      <ConfirmDialog 
        isOpen={isDeleteOpen}
        title="Delete Account"
        message="Are you absolutely sure? This will permanently delete your account, order history, and saved addresses."
        confirmText="Yes, delete my account"
        cancelText="Keep my account"
        onConfirm={() => setIsDeleteOpen(false)}
        onCancel={() => setIsDeleteOpen(false)}
        isDanger={true}
        confirmPattern="DELETE"
      />

      {/* Toast Feedback */}
      {toastMsg && (
        <div
          className={styles.toastNotification}
          style={{
            borderColor: toastType === 'error' ? 'rgba(220, 38, 38, 0.35)' : undefined,
            color: toastType === 'error' ? '#DC2626' : undefined,
            background: '#FFFFFF',
          }}
        >
          {toastType === 'error' ? (
            <AlertTriangle size={18} color="#DC2626" />
          ) : (
            <CheckCircle2 size={18} color="var(--acc-success)" />
          )}
          <span>{toastMsg}</span>
        </div>
      )}
    </>
  );
}

export default function PrivacyPage() {
  return (
    <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center' }}>Loading...</div>}>
      <PrivacyContent />
    </Suspense>
  );
}
