"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import { OtpSuccessModal } from "@/components/common/OtpSuccessModal/OtpSuccessModal";

function GoogleCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { loginWithToken, setUser } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    const processCallback = async () => {
      const errorParam = searchParams.get("error");
      const codeParam = searchParams.get("code");
      const tokenParam = searchParams.get("token");
      const isNewUser = searchParams.get("isNewUser") === "true";
      const customRedirect = searchParams.get("redirect");

      if (errorParam) {
        router.push(`/login?error=${encodeURIComponent(errorParam)}`);
        return;
      }

      // If backend already exchanged code and passed Bearer token
      if (tokenParam) {
        try {
          const user = await loginWithToken(tokenParam);
          setLoggedInUser(user);
          setIsSuccessModalOpen(true);
          const isProfileComplete = Boolean(user?.isProfileComplete || user?.profileCompleted || (user?.name && (user?.email || user?.phone)));
          const redirectTarget = (!isProfileComplete && isNewUser) ? "/onboarding" : (customRedirect || "/account");
          setTimeout(() => {
            router.push(redirectTarget);
          }, 2500);
          return;
        } catch (err: any) {
          setErrorMessage(err?.message || "Failed to establish user session.");
          setTimeout(() => {
            router.push(`/login?error=${encodeURIComponent("Authentication session failed")}`);
          }, 2000);
          return;
        }
      }

      // If Google returned authorization code directly to frontend
      if (codeParam) {
        try {
          const redirectUri = window.location.origin + "/api/v1/auth/callback/google";
          const res = await authService.googleAuth(codeParam, redirectUri);
          
          if (res.accessToken) {
            setUser(res.user);
            setLoggedInUser(res.user);
            setIsSuccessModalOpen(true);
            
            const isProfileComplete = Boolean(res.user?.isProfileComplete || res.user?.profileCompleted || (res.user?.name && (res.user?.email || res.user?.phone)));
            const redirectTarget = (!isProfileComplete && res.isNewUser) ? "/onboarding" : (customRedirect || "/account");
            setTimeout(() => {
              router.push(redirectTarget);
            }, 2500);
          } else {
            throw new Error("Missing access token from server response");
          }
        } catch (err: any) {
          console.error("Google Auth Exchange Error:", err);
          const msg = err?.message || "Failed to complete Google authentication";
          setErrorMessage(msg);
          setTimeout(() => {
            router.push(`/login?error=${encodeURIComponent(msg)}`);
          }, 2500);
        }
        return;
      }

      // Neither token nor code present
      router.push(`/login?error=${encodeURIComponent("Authentication code or token missing")}`);
    };

    processCallback();
  }, [searchParams, loginWithToken, setUser, router]);

  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "#FAF9F6",
      }}
    >
      <OtpSuccessModal
        isOpen={isSuccessModalOpen}
        userName={loggedInUser?.name}
        title="Login Successful!"
      />

      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #EBE5DB",
          borderRadius: "24px",
          padding: "3rem 2.5rem",
          maxWidth: "420px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.04)",
        }}
      >
        <Link href="/" style={{ display: "inline-block", marginBottom: "1.5rem" }}>
          <Image
            src="/logo-clean.png"
            alt="KickAt Logo"
            width={140}
            height={60}
            style={{ objectFit: "contain", width: "auto", height: "auto" }}
            priority
          />
        </Link>

        {errorMessage ? (
          <div>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "#FEE2E2",
                color: "#991B1B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.25rem",
              }}
            >
              <AlertCircle size={28} />
            </div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#1A1612", marginBottom: "0.5rem" }}>
              Authentication Failed
            </h2>
            <p style={{ fontSize: "0.875rem", color: "#666055", marginBottom: "1.5rem" }}>
              {errorMessage}
            </p>
          </div>
        ) : (
          <div>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "rgba(249, 146, 5, 0.1)",
                color: "#F99205",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.25rem",
              }}
            >
              <Loader2 size={28} className="animate-spin" />
            </div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#1A1612", marginBottom: "0.5rem" }}>
              Signing you in...
            </h2>
            <p style={{ fontSize: "0.875rem", color: "#666055" }}>
              Completing Google OAuth authentication. Please wait.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GoogleCallbackApiPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "100px", textAlign: "center", background: "#FAF9F6", minHeight: "80vh" }}>
          Authenticating...
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
