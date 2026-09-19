"use client";

import { useState, Suspense } from 'react';
import { Shield, Key, Download, MonitorSmartphone, AlertTriangle, ChevronRight, ToggleLeft, ToggleRight } from 'lucide-react';
import styles from '../Account.module.css';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Skeleton } from '@/components/ui/Skeleton';

function PrivacyContent() {
  const [loading, setLoading] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [is2FA, setIs2FA] = useState(false);

  return (
    <>
      <div className={styles.contentArea}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageH1}>Privacy & Security</h1>
            <p className={styles.pageSubtitle}>Manage your account security, passwords, and data</p>
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
                  <Button variant="secondary" size="sm">Update</Button>
                </div>
                <div className={styles.settingRow}>
                  <div className={styles.settingLeft}>
                    <Shield size={20} className={styles.settingIcon} />
                    <div className={styles.settingTextCol}>
                      <span className={styles.settingTitle}>Two-Factor Authentication (2FA)</span>
                      <span className={styles.settingDesc}>Coming soon to enhance your account security</span>
                    </div>
                  </div>
                  <button className={styles.toggleBtn} disabled>
                    <ToggleLeft size={32} color="var(--acc-muted)" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.privacySection}>
              <h3 className={styles.sectionTitle}>Active Sessions</h3>
              <div className={styles.settingsList}>
                <div className={styles.settingRow}>
                  <div className={styles.settingLeft}>
                    <MonitorSmartphone size={20} className={styles.settingIcon} />
                    <div className={styles.settingTextCol}>
                      <span className={styles.settingTitle}>Mac OS • Chrome</span>
                      <span className={styles.settingDesc}>Mumbai, India • Current Session</span>
                    </div>
                  </div>
                </div>
                <div className={styles.settingRow}>
                  <Button variant="ghost" size="sm" className={styles.fullWidthBtn}>Log out of all other sessions</Button>
                </div>
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
                  <Button variant="secondary" size="sm">Request Data</Button>
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
                <Button variant="danger" onClick={() => setIsDeleteOpen(true)}>Delete Account</Button>
              </div>
            </div>

          </div>
        )}
      </div>

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
