"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import SafeImage from '@/components/ui/SafeImage';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Check,
  Truck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Smartphone,
  ChevronDown,
  User,
  MapPin,
  Lock,
  Edit3,
  X,
  Shield,
  AlertCircle,
  Plus,
  Loader2,
  Calendar,
  Mail,
  Package,
  ShoppingBag,
  Heart,
  RotateCcw,
  Headphones,
  PawPrint,
  Sparkles,
  Wallet,
  Building2,
  AlertTriangle,
  QrCode,
  Copy,
  CheckCheck,
  Printer,
  Receipt,
  FileText,
  Download,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { usePublicSettings } from '@/hooks/usePublicSettings';
import { checkoutService } from '@/services/checkoutService';
import { orderService } from '@/services/orderService';
import { profileService, CreateAddressDto } from '@/services/profileService';
import { authService } from '@/services/authService';
import { UseLocationButton } from '@/components/ui/UseLocationButton';
import { DetectedAddress } from '@/services/locationService';
import {
  CheckoutResponse,
  CheckoutAddress,
  ValidateAddressResponse,
  PaymentMethodItem,
  CheckoutPaymentMethodType,
  PlaceOrderResponse,
  PlaceOrderDto,
} from '@/types/checkout';
import { paymentService } from '@/services/paymentService';
import { loadRazorpayScript } from '@/utils/razorpay';
import { PaymentMethodType, RazorpayOptions } from '@/types/payment';
import { AnimatedOrderButton } from './AnimatedOrderButton';
import styles from './Checkout.module.css';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function CheckoutPage() {
  const { settings: publicSettings, delivery: publicDelivery, payment: publicPayment } = usePublicSettings();
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { items: cartItems, refreshCart, isLoading: cartLoading } = useCart();

  // Step Management
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Checkout Session State
  const [checkoutData, setCheckoutData] = useState<CheckoutResponse | null>(null);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState<boolean>(true);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Address Management State
  const [savedAddresses, setSavedAddresses] = useState<CheckoutAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isAddingNewAddress, setIsAddingNewAddress] = useState<boolean>(false);
  const [isValidatingAddress, setIsValidatingAddress] = useState<boolean>(false);
  const [addressValidation, setAddressValidation] = useState<ValidateAddressResponse | null>(null);
  const [addressValidationError, setAddressValidationError] = useState<string | null>(null);

  // New Address Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [houseFlat, setHouseFlat] = useState('');
  const [buildingStreet, setBuildingStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [isSavingNewAddress, setIsSavingNewAddress] = useState(false);

  // Payment Methods State
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodItem[]>([]);
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState<boolean>(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<CheckoutPaymentMethodType>('COD');
  const [paymentMethodError, setPaymentMethodError] = useState<string | null>(null);
  const [upiId, setUpiId] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [showInstructions, setShowInstructions] = useState<boolean>(false);

  // Order Placement State
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<PlaceOrderResponse | null>(null);
  const [finalOrderedItems, setFinalOrderedItems] = useState<any[]>([]);
  const [finalSummary, setFinalSummary] = useState<any>(null);
  const [copiedOrderNumber, setCopiedOrderNumber] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const idempotencyKeyRef = useRef<string>(generateUUID());

  // Payment Lifecycle State
  const [paymentFlowState, setPaymentFlowState] = useState<'idle' | 'creating_order' | 'gateway_open' | 'verifying' | 'success' | 'failed' | 'cancelled'>('idle');
  const [paymentStatusText, setPaymentStatusText] = useState<string>('');
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [pendingOrderNumber, setPendingOrderNumber] = useState<string | null>(null);

  // UI Accordions & Visuals
  const [isPriceDetailsOpen, setIsPriceDetailsOpen] = useState<boolean>(false);
  const [isPromoOpen, setIsPromoOpen] = useState<boolean>(false);
  const [isItemsExpanded, setIsItemsExpanded] = useState<boolean>(false);
  const [particles, setParticles] = useState<{ id: number; tx: string; ty: string; color: string }[]>([]);

  // Phone Verification Modal
  const [isPhoneVerified, setIsPhoneVerified] = useState(true);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState('');
  const [isSendingPhoneOtp, setIsSendingPhoneOtp] = useState(false);
  const [isVerifyingPhoneOtp, setIsVerifyingPhoneOtp] = useState(false);
  const [phoneOtpError, setPhoneOtpError] = useState<string | null>(null);

  // Title effect
  useEffect(() => {
    document.title = placedOrder
      ? `Order ${placedOrder.orderNumber || ''} Placed! | KickAt`
      : 'Checkout - Secure Payment | KickAt';
  }, [placedOrder]);

  // Prepopulate user details when user profile is loaded
  useEffect(() => {
    if (user) {
      if (user.phone) setPhone(user.phone);
      if (user.email) setEmail(user.email);
      if (user.name) setFullName(user.name);
      if (typeof user.isPhoneVerified === 'boolean') {
        setIsPhoneVerified(user.isPhoneVerified);
      }
    }
  }, [user]);

  // 1. Load Checkout Session
  const loadCheckoutSession = useCallback(async () => {
    if (!isAuthenticated && !authLoading) {
      setIsCheckoutLoading(false);
      return;
    }

    try {
      setIsCheckoutLoading(true);
      setCheckoutError(null);
      const res = await checkoutService.getCheckout();
      setCheckoutData(res);

      const addrs = res.addresses || [];
      setSavedAddresses(addrs);

      if (addrs.length > 0) {
        setIsAddingNewAddress(false);
        const defaultAddr = addrs.find((a) => a.isDefault) || addrs[0];
        setSelectedAddressId(defaultAddr.id);
      } else {
        setIsAddingNewAddress(true);
      }
    } catch (err: any) {
      console.error('[Checkout] Failed to load checkout session:', err);
      setCheckoutError(err?.message || 'Failed to load checkout details');
    } finally {
      setIsCheckoutLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (!authLoading) {
      loadCheckoutSession();
    }
  }, [authLoading, loadCheckoutSession]);

  // 2. Validate Address & Fetch Eligible Payment Methods
  const validateAndFetchMethods = useCallback(
    async (addressId: string, grandTotal?: number) => {
      if (!addressId) return;

      const currentAddress = savedAddresses.find((a) => a.id === addressId);
      const pincode = currentAddress?.pincode;

      setIsValidatingAddress(true);
      setAddressValidationError(null);

      try {
        const valRes = await checkoutService.validateAddress(addressId);
        setAddressValidation(valRes);

        if (!valRes.serviceable) {
          setAddressValidationError(valRes.message || 'Pincode is currently not serviceable');
          setPaymentMethods([]);
          return;
        }

        // Fetch eligible payment methods using backend grand total and pincode
        if (pincode) {
          const totalAmount = grandTotal || checkoutData?.summary?.grandTotal || 1;
          setIsLoadingPaymentMethods(true);
          try {
            const pmRes = await checkoutService.getPaymentMethods(totalAmount, pincode);
            if (pmRes.methods && Array.isArray(pmRes.methods)) {
              setPaymentMethods(pmRes.methods);

              // Auto-select first available payment method
              const firstAvailable = pmRes.methods.find((m) => m.available);
              if (firstAvailable) {
                setSelectedPaymentMethod(firstAvailable.type);
              }
            }
          } catch (pmErr: any) {
            console.error('[Checkout] Failed to fetch payment methods:', pmErr);
            setPaymentMethodError(pmErr?.message || 'Could not fetch payment methods');
          } finally {
            setIsLoadingPaymentMethods(false);
          }
        }
      } catch (err: any) {
        console.error('[Checkout] Address validation failed:', err);
        setAddressValidationError(err?.message || 'Address validation failed. Please check pincode.');
        setAddressValidation(null);
      } finally {
        setIsValidatingAddress(false);
      }
    },
    [savedAddresses, checkoutData?.summary?.grandTotal]
  );

  // Trigger validation whenever selectedAddressId changes
  useEffect(() => {
    if (selectedAddressId && savedAddresses.length > 0) {
      validateAndFetchMethods(selectedAddressId, checkoutData?.summary?.grandTotal);
    }
  }, [selectedAddressId, savedAddresses, validateAndFetchMethods, checkoutData?.summary?.grandTotal]);

  // Add and Save New Address
  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.replace(/\D/g, '').length !== 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!zipCode || !/^\d{6}$/.test(zipCode.trim())) {
      alert('Please enter a valid 6-digit pincode');
      return;
    }
    if (!buildingStreet || !city || !stateName) {
      alert('Please fill in all required address fields');
      return;
    }

    setIsSavingNewAddress(true);
    setAddressValidationError(null);

    try {
      const newAddressDto: CreateAddressDto = {
        houseFlat: houseFlat || undefined,
        buildingStreet: buildingStreet,
        city: city,
        state: stateName,
        pincode: zipCode.trim(),
        landmark: landmark || undefined,
        type: 'HOME',
        isDefault: savedAddresses.length === 0,
      };

      const savedRes: any = await profileService.addAddress(newAddressDto);
      const createdAddress: CheckoutAddress =
        savedRes?.address || {
          id: savedRes?.id || generateUUID(),
          ...newAddressDto,
          fullName: fullName || user?.name || 'Customer',
          phone: phone || user?.phone || '',
        };

      const updatedAddresses = [...savedAddresses, createdAddress];
      setSavedAddresses(updatedAddresses);
      setSelectedAddressId(createdAddress.id);
      setIsAddingNewAddress(false);

      // Validate newly added address
      await validateAndFetchMethods(createdAddress.id);
    } catch (err: any) {
      console.error('[Checkout] Failed to save address:', err);
      setAddressValidationError(err?.message || 'Failed to save address. Please try again.');
    } finally {
      setIsSavingNewAddress(false);
    }
  };

  // Phone OTP Verification Handlers
  const handleSendCheckoutPhoneOtp = async () => {
    if (!phone) {
      alert('Please enter a phone number first.');
      return;
    }
    setPhoneOtpError(null);
    setIsSendingPhoneOtp(true);
    setIsPhoneModalOpen(true);
    try {
      await authService.sendUserMobileVerification(phone);
    } catch (err: any) {
      setPhoneOtpError(err?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsSendingPhoneOtp(false);
    }
  };

  const handleVerifyCheckoutPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneOtp || phoneOtp.trim().length !== 6) {
      setPhoneOtpError('Please enter a 6-digit OTP code');
      return;
    }
    setIsVerifyingPhoneOtp(true);
    setPhoneOtpError(null);
    try {
      await authService.verifyUserMobile(phoneOtp.trim(), phone);
      setIsPhoneVerified(true);
      setIsPhoneModalOpen(false);
      setPhoneOtp('');
    } catch (err: any) {
      setPhoneOtpError(err?.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsVerifyingPhoneOtp(false);
    }
  };

  // Step 1 Validation Check
  const validateStep1 = () => {
    if (isAddingNewAddress) {
      const validPhone = phone.replace(/\D/g, '').length === 10;
      const validZip = /^\d{6}$/.test(zipCode.trim());
      const hasStreet = buildingStreet.trim().length > 0;
      const hasCity = city.trim().length > 0;
      const hasState = stateName.trim().length > 0;
      return validPhone && validZip && hasStreet && hasCity && hasState;
    }
    return Boolean(selectedAddressId && addressValidation?.serviceable);
  };

  // Proceed to Step 2
  const handleProceedToPayment = () => {
    if (isAddingNewAddress) {
      alert('Please save your address before proceeding.');
      return;
    }

    if (!selectedAddressId) {
      alert('Please select a delivery address.');
      return;
    }

    if (addressValidationError || (addressValidation && !addressValidation.serviceable)) {
      alert('Selected address is not serviceable. Please choose another address.');
      return;
    }

    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2 Form Validation
  const validatePlaceOrderForm = () => {
    if (!isAuthenticated) {
      alert('Please login to complete your order.');
      return false;
    }
    if (!selectedAddressId) {
      alert('Please select a valid delivery address.');
      return false;
    }
    if (addressValidation && !addressValidation.serviceable) {
      alert('Selected address is not serviceable.');
      return false;
    }
    if (!selectedPaymentMethod) {
      alert('Please select a payment method.');
      return false;
    }
    return true;
  };

  // Place Order Action (Async handler triggered by AnimatedOrderButton)
  const handleTriggerOrder = async (): Promise<boolean> => {
    if (!validatePlaceOrderForm()) {
      return false;
    }

    if (isSubmittingOrder) {
      return false;
    }

    setIsSubmittingOrder(true);
    setOrderError(null);

    const idempotencyKey = idempotencyKeyRef.current;

    try {
      const cleanUpiId = selectedPaymentMethod === 'UPI' ? (upiId.trim() || 'qr@razorpay') : undefined;

      const orderPayload: PlaceOrderDto = {
        addressId: selectedAddressId,
        paymentMethod: selectedPaymentMethod,
        deliveryInstructions: deliveryInstructions.trim() || undefined,
        upiId: cleanUpiId,
      };

      if (selectedPaymentMethod === 'COD') {
        setPaymentStatusText('Placing Cash on Delivery order...');
        const res = await checkoutService.placeOrder(orderPayload, idempotencyKey);
        try {
          await paymentService.confirmCod({ orderId: res.orderId }, idempotencyKey);
        } catch (codErr) {
          console.warn('[Checkout] COD confirmation note:', codErr);
        }
        setFinalOrderedItems([...(cartItems || [])]);
        setFinalSummary(checkoutData?.summary);
        setPlacedOrder(res);
        await refreshCart();
        return true;
      }

      // Online Gateway Payment Flow (Razorpay / UPI / Card / Netbanking / Wallet)
      const methodLower = (
        selectedPaymentMethod === 'CARD'
          ? 'card'
          : selectedPaymentMethod === 'NETBANKING'
          ? 'netbanking'
          : selectedPaymentMethod === 'WALLET'
          ? 'wallet'
          : 'upi'
      ) as PaymentMethodType;

      let activeOrderId = pendingOrderId;
      let activeOrderNumber = pendingOrderNumber;
      let activeOrderRes: PlaceOrderResponse | null = null;

      if (!activeOrderId) {
        setPaymentFlowState('creating_order');
        setPaymentStatusText('Creating secure order...');
        const orderRes = await checkoutService.placeOrder(orderPayload, idempotencyKey);
        activeOrderId = orderRes.orderId;
        activeOrderNumber = orderRes.orderNumber;
        activeOrderRes = orderRes;
        setPendingOrderId(orderRes.orderId);
        setPendingOrderNumber(orderRes.orderNumber);
      }

      setPaymentStatusText('Initializing Razorpay gateway...');
      let paymentRes: any = null;

      try {
        paymentRes = await paymentService.createPaymentOrder(
          {
            orderId: activeOrderId,
            paymentMethod: methodLower,
            upiId: cleanUpiId,
          },
          generateUUID()
        );
      } catch (createErr: any) {
        console.warn('[Checkout] createPaymentOrder note, falling back to retryPayment:', createErr);
        paymentRes = await paymentService.retryPayment(
          {
            orderId: activeOrderId,
            paymentMethod: methodLower,
            upiId: cleanUpiId,
          },
          generateUUID()
        );
      }

      if (!paymentRes || (!paymentRes.razorpayOrderId && !paymentRes.key)) {
        throw new Error(paymentRes?.message || 'Could not initialize payment gateway.');
      }

      setPaymentStatusText('Loading Razorpay payment window...');
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error('Could not load Razorpay SDK. Please check your network connection.');
      }

      setPaymentFlowState('gateway_open');
      setPaymentStatusText('Payment window open. Please complete payment...');

      return new Promise<boolean>((resolve) => {
        const options: RazorpayOptions = {
          key: paymentRes.key!,
          amount: Math.round((paymentRes.amount || checkoutData?.summary?.grandTotal || 0) * 100),
          currency: paymentRes.currency || 'INR',
          name: 'KickAt',
          description: `Order #${activeOrderNumber || activeOrderId}`,
          order_id: paymentRes.razorpayOrderId!,
          prefill: {
            name: fullName || user?.name || undefined,
            email: email || user?.email || undefined,
            contact: phone || user?.phone || undefined,
            vpa: cleanUpiId,
          },
          theme: {
            color: '#F99205',
          },
          handler: async (rzpRes) => {
            setPaymentFlowState('verifying');
            setPaymentStatusText('Verifying payment with server...');
            try {
              const verifyRes = await paymentService.verifyPayment({
                orderId: activeOrderId!,
                razorpayOrderId: rzpRes.razorpay_order_id,
                razorpayPaymentId: rzpRes.razorpay_payment_id,
                signature: rzpRes.razorpay_signature,
              });

              if (verifyRes.success) {
                setPaymentFlowState('success');
                await refreshCart();
                setPlacedOrder(activeOrderRes || {
                  success: true,
                  message: 'Order placed successfully',
                  orderId: activeOrderId!,
                  orderNumber: activeOrderNumber || `ORD-${activeOrderId}`,
                  status: 'PLACED',
                  grandTotal: paymentRes.amount || checkoutData?.summary?.grandTotal || 0,
                });
                setPendingOrderId(null);
                setPendingOrderNumber(null);
                resolve(true);
              } else {
                setPaymentFlowState('failed');
                setOrderError('Payment verification failed. Please retry.');
                resolve(false);
              }
            } catch (verifyErr: any) {
              console.error('[Checkout] Verification failed:', verifyErr);
              setPaymentFlowState('failed');
              setOrderError(verifyErr?.message || 'Payment verification failed.');
              resolve(false);
            }
          },
          modal: {
            ondismiss: () => {
              setPaymentFlowState((current) => {
                if (current === 'verifying' || current === 'success') return current;
                setOrderError('Payment window was closed. You can retry paying anytime.');
                return 'cancelled';
              });
              resolve(false);
            },
          },
        };

        const rzp = new window.Razorpay!(options);
        rzp.on('payment.failed', function (resp: any) {
          console.error('[Razorpay] Payment failed event:', resp.error);
          const reason = resp.error?.description || resp.error?.reason || 'Payment failed';
          setPaymentFlowState('failed');
          setOrderError(`Payment failed: ${reason}`);
          resolve(false);
        });
        rzp.open();
      });
    } catch (err: any) {
      console.error('[Checkout] Place order / payment failed:', err);
      const msg = err?.message || 'Failed to initialize payment. Please try again.';
      setPaymentFlowState('failed');
      setOrderError(msg);
      idempotencyKeyRef.current = generateUUID();
      return false;
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Completion Animation trigger
  const handleAnimatedComplete = () => {
    setParticles(
      Array.from({ length: 60 }).map((_, i) => {
        const angle = i * 6 * (Math.PI / 180);
        const velocity = 80 + Math.random() * 120;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;
        const colors = ['#F99205', '#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6', '#F43F5E'];
        return { id: i, tx: `${tx}px`, ty: `${ty}px`, color: colors[i % colors.length] };
      })
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ----------------------------------------------------
  // RENDER: Unauthenticated State
  // ----------------------------------------------------
  if (!authLoading && !isAuthenticated) {
    return (
      <div className={styles.pageBg}>
        <main className={styles.container}>
          <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', background: '#fff', padding: '3rem 2rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <Lock size={48} color="#F99205" style={{ margin: '0 auto 1.5rem auto' }} />
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.75rem', color: '#1A1816' }}>
              Please Log In to Checkout
            </h2>
            <p style={{ color: '#666', marginBottom: '2rem', lineHeight: 1.6 }}>
              You need to be logged in with your KickAt account to select delivery addresses, review cart totals, and place orders securely.
            </p>
            <Link
              href="/auth/login?redirect=/checkout"
              className={styles.nextStepBtnAlt}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', margin: '0 auto' }}
            >
              Sign In to Continue <ArrowRight size={18} style={{ marginLeft: 8 }} />
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER: Loading Skeleton
  // ----------------------------------------------------
  if (authLoading || isCheckoutLoading) {
    return (
      <div className={styles.pageBg}>
        <main className={styles.container}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '1rem' }}>
            <Loader2 size={40} className="animate-spin" color="#F99205" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#666', fontSize: '1.1rem', fontWeight: 500 }}>
              Loading checkout & calculating live totals...
            </p>
          </div>
        </main>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER: Empty Cart
  // ----------------------------------------------------
  const hasNoItems =
    (!checkoutData && !cartLoading) ||
    (checkoutData?.summary?.itemCount === 0 && (!cartItems || cartItems.length === 0));

  if (hasNoItems && !placedOrder) {
    return (
      <div className={styles.pageBg}>
        <main className={styles.container}>
          <div style={{ maxWidth: '540px', margin: '4rem auto', textAlign: 'center', background: '#fff', padding: '3.5rem 2rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <ShoppingBag size={52} color="#F99205" style={{ margin: '0 auto 1.5rem auto' }} />
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.75rem', color: '#1A1816' }}>
              Your Cart is Empty
            </h2>
            <p style={{ color: '#666', marginBottom: '2rem', lineHeight: 1.6 }}>
              There are currently no items ready for checkout. Explore our premium pet catalog and add your favorites!
            </p>
            <Link
              href="/shop"
              className={styles.nextStepBtnAlt}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', margin: '0 auto' }}
            >
              <ShoppingBag size={18} style={{ marginRight: 8 }} /> Explore Products
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER: Order Placed Success View (Master Branded Receipt UI)
  // ----------------------------------------------------
  if (placedOrder) {
    const isCod = selectedPaymentMethod === 'COD';
    const selectedAddr = savedAddresses.find((a) => a.id === selectedAddressId) || savedAddresses[0];
    const orderDateStr = new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());

    const summarySource = finalSummary || checkoutData?.summary;
    const itemsSource = finalOrderedItems.length > 0 ? finalOrderedItems : (cartItems || []);
    const receiptSubtotal = summarySource?.subtotal ?? (itemsSource.reduce((acc: number, item: any) => {
      const p = item.variant?.discountPrice ?? item.variant?.price ?? item.product?.discountPrice ?? item.product?.price ?? 0;
      return acc + (p * item.quantity);
    }, 0));
    const receiptDeliveryFee = summarySource?.deliveryFee ?? 0;
    const receiptGstAmount = summarySource?.gstAmount ?? 0;
    const receiptGstPercentage = summarySource?.gstPercentage ?? publicSettings?.tax?.gstPercentage;
    const receiptCodFee = isCod ? (summarySource?.codFee ?? 0) : 0;
    const receiptExtraFeeName = summarySource?.extraFeeName;
    const receiptExtraFeeAmount = summarySource?.extraFeeAmount ?? 0;
    const receiptGrandTotal = summarySource?.grandTotal ?? (placedOrder.grandTotal || (receiptSubtotal + receiptDeliveryFee + receiptGstAmount + receiptCodFee + receiptExtraFeeAmount));

    const handleCopyOrderNumber = (text: string) => {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(text);
        setCopiedOrderNumber(true);
        setTimeout(() => setCopiedOrderNumber(false), 2000);
      }
    };

    const handleDownloadInvoicePdf = async () => {
      if (!placedOrder) return;
      setIsDownloadingPdf(true);
      try {
        const orderIdentifier = placedOrder.orderId || placedOrder.orderNumber;
        if (orderIdentifier) {
          await orderService.downloadInvoicePdf(orderIdentifier, placedOrder.orderNumber);
        } else {
          window.print();
        }
      } catch (err) {
        console.warn('PDF download fallback to print:', err);
        window.print();
      } finally {
        setIsDownloadingPdf(false);
      }
    };

    const handlePrintReceipt = () => {
      if (typeof window !== 'undefined') {
        window.print();
      }
    };

    return (
      <main className={styles.container}>
        <div className={styles.successWrapper}>
          <div className={styles.confettiContainer}>
            {particles.map((p) => (
              <div
                key={p.id}
                className={styles.particle}
                style={{
                  backgroundColor: p.color,
                  '--tx': p.tx,
                  '--ty': p.ty,
                } as React.CSSProperties}
              />
            ))}
          </div>

          {/* Celebration Badge */}
          <div className={styles.successIconBadgeWrapper}>
            <div className={styles.successAuraRing} />
            <div className={`${styles.orbitItem} ${styles.pawTopRight}`}>
              <PawPrint size={24} fill="#F99205" color="#F99205" />
            </div>
            <div className={`${styles.orbitItem} ${styles.pawBottomLeft}`}>
              <PawPrint size={22} fill="#F99205" color="#F99205" />
            </div>
            <div className={`${styles.orbitItem} ${styles.pawTopLeft}`}>
              <Sparkles size={20} color="#F99205" />
            </div>
            <div className={styles.successIconBadge}>
              <Check size={44} strokeWidth={3.5} color="#FFFFFF" className={styles.animatedCheck} />
            </div>
          </div>

          <h1 className={styles.successTitle}>
            {isCod ? 'Order Placed' : 'Order Confirmed'}{' '}
            <span className={styles.successTitleOrange}>Successfully!</span>
          </h1>
          <p className={styles.successSubtitle}>
            {isCod
              ? 'Thank you for shopping with KickAt! We are preparing your pet goodies for quick dispatch.'
              : 'Your payment was received and your order is confirmed for express fulfillment.'}
          </p>

          <div className={styles.confirmationPill}>
            <Mail size={16} color="#10B981" style={{ flexShrink: 0 }} />
            <span>
              Official receipt sent to{' '}
              <strong className={styles.pillEmail}>{email || user?.email || 'your registered email'}</strong>
            </span>
          </div>

          {/* MASTER BRANDED RECEIPT CARD */}
          <div className={styles.receiptContainer} id="printable-order-receipt">
            <div className={styles.receiptNotchLeft} />
            <div className={styles.receiptNotchRight} />

            {/* Receipt Brand Header */}
            <div className={styles.receiptHeader}>
              <div className={styles.receiptBrand}>
                <div className={styles.receiptLogoBadge}>
                  <PawPrint size={20} fill="#F99205" color="#F99205" />
                  <span className={styles.receiptBrandName}>KickAt</span>
                </div>
                <div className={styles.receiptTagline}>
                  <span>OFFICIAL ORDER RECEIPT & TAX INVOICE</span>
                  <span className={styles.receiptVerifiedBadge}>
                    <Check size={11} strokeWidth={3} /> VERIFIED ORDER
                  </span>
                </div>
              </div>
              <div className={isCod ? styles.receiptPaymentPillCod : styles.receiptPaymentPillPaid}>
                {isCod ? (
                  <>
                    <Truck size={14} /> Cash on Delivery
                  </>
                ) : (
                  <>
                    <Shield size={14} /> Online Prepaid (Verified)
                  </>
                )}
              </div>
            </div>

            {/* Receipt Order Meta Strip */}
            <div className={styles.receiptMetaStrip}>
              <div className={styles.receiptMetaItem}>
                <span className={styles.receiptMetaLabel}>ORDER NUMBER</span>
                <div className={styles.receiptOrderNumberRow}>
                  <span className={styles.receiptOrderNumberText}>#{placedOrder.orderNumber}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyOrderNumber(placedOrder.orderNumber)}
                    className={styles.receiptCopyBtn}
                    title="Copy Order ID"
                  >
                    {copiedOrderNumber ? (
                      <>
                        <CheckCheck size={13} color="#10B981" />
                        <span className={styles.copiedText}>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className={styles.receiptMetaItem}>
                <span className={styles.receiptMetaLabel}>ORDER DATE & TIME</span>
                <span className={styles.receiptMetaValue}>
                  <Calendar size={13} /> {orderDateStr}
                </span>
              </div>
              <div className={`${styles.receiptMetaItem} ${styles.receiptMetaItemRight}`}>
                <span className={styles.receiptMetaLabel}>PAYMENT STATUS</span>
                <span className={isCod ? styles.statusPillCod : styles.statusPillPaid}>
                  {isCod ? 'Pay on Delivery' : 'Paid / Confirmed'}
                </span>
              </div>
            </div>

            {/* Live Progress Tracker */}
            <div className={styles.trackerContainer}>
              <div className={styles.trackerHeader}>
                <span className={styles.trackerLabel}>LIVE FULFILLMENT STATUS</span>
                <span className={styles.trackerStatusBadge}>
                  {placedOrder.status || 'Order Confirmed'}
                </span>
              </div>
              <div className={styles.trackerStepsRow}>
                <div className={`${styles.trackerStep} ${styles.trackerStepCompleted}`}>
                  <div className={styles.trackerDot}>
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span>Confirmed</span>
                </div>
                <div className={styles.trackerLineActive}></div>
                <div className={`${styles.trackerStep} ${styles.trackerStepCurrent}`}>
                  <div className={styles.trackerDotPulse}></div>
                  <span>Processing</span>
                </div>
                <div className={styles.trackerLine}></div>
                <div className={styles.trackerStep}>
                  <div className={styles.trackerDotOutline}></div>
                  <span>Shipped</span>
                </div>
                <div className={styles.trackerLine}></div>
                <div className={styles.trackerStep}>
                  <div className={styles.trackerDotOutline}></div>
                  <span>Delivered</span>
                </div>
              </div>
            </div>

            {/* Perforation Line */}
            <div className={styles.receiptPerforationLine} />

            {/* Purchased Items Table */}
            {itemsSource && itemsSource.length > 0 && (
              <div className={styles.receiptItemsSection}>
                <div className={styles.receiptItemsSectionHeader}>
                  <span>ITEM DESCRIPTION</span>
                  <span>QTY</span>
                  <span>AMOUNT</span>
                </div>
                <div className={styles.receiptItemsList}>
                  {itemsSource.map((item: any, idx: number) => {
                    const price = item.variant?.discountPrice ?? item.variant?.price ?? item.product?.discountPrice ?? item.product?.price ?? 0;
                    const totalPrice = price * item.quantity;
                    const itemImg = item.variant?.image || item.product?.images?.[0] || item.product?.image;
                    return (
                      <div key={item.id || idx} className={styles.receiptItemRow}>
                        <div className={styles.receiptItemInfo}>
                          <div className={styles.receiptItemThumb}>
                            <SafeImage
                              src={itemImg}
                              alt={item.product?.name || 'Product'}
                              fill
                              sizes="48px"
                              style={{ objectFit: 'cover' }}
                              productName={item.product?.name}
                            />
                          </div>
                          <div className={styles.receiptItemText}>
                            <div className={styles.receiptItemName}>{item.product?.name || 'Product Item'}</div>
                            {item.variant?.name && (
                              <div className={styles.receiptItemVariant}>{item.variant.name}</div>
                            )}
                          </div>
                        </div>
                        <div className={styles.receiptItemQty}>x{item.quantity}</div>
                        <div className={styles.receiptItemTotal}>
                          ₹{totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price Financials Breakdown Grid */}
            <div className={styles.receiptFinancialsGrid}>
              <div className={styles.receiptFinancialRow}>
                <span className={styles.receiptFinancialLabel}>Items Subtotal</span>
                <span className={styles.receiptFinancialValue}>
                  ₹{(receiptSubtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className={styles.receiptFinancialRow}>
                <span className={styles.receiptFinancialLabel}>Shipping & Delivery</span>
                <span className={receiptDeliveryFee === 0 ? styles.receiptFreeText : styles.receiptFinancialValue}>
                  {receiptDeliveryFee === 0 ? 'FREE' : `+₹${receiptDeliveryFee.toFixed(2)}`}
                </span>
              </div>
              {receiptGstAmount > 0 && (
                <div className={styles.receiptFinancialRow}>
                  <span className={styles.receiptFinancialLabel}>
                    Tax / GST {receiptGstPercentage ? `(${receiptGstPercentage}%)` : ''}
                  </span>
                  <span className={styles.receiptFinancialValue}>
                    +₹{receiptGstAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              {isCod && receiptCodFee > 0 && (
                <div className={styles.receiptFinancialRow}>
                  <span className={styles.receiptFinancialLabel}>Cash on Delivery Surcharge</span>
                  <span className={styles.receiptFinancialValue}>+₹{receiptCodFee.toFixed(2)}</span>
                </div>
              )}
              {receiptExtraFeeAmount > 0 && (
                <div className={styles.receiptFinancialRow}>
                  <span className={styles.receiptFinancialLabel}>{receiptExtraFeeName || 'Special Handling Fee'}</span>
                  <span className={styles.receiptFinancialValue}>+₹{receiptExtraFeeAmount.toFixed(2)}</span>
                </div>
              )}

              {/* Grand Total Bar */}
              <div className={styles.receiptGrandTotalBar}>
                <div>
                  <div className={styles.receiptGrandTotalLabel}>TOTAL AMOUNT {isCod ? 'PAYABLE' : 'PAID'}</div>
                  <div className={styles.receiptTaxInclusiveNote}>All taxes & delivery charges included</div>
                </div>
                <div className={styles.receiptGrandTotalAmount}>
                  ₹{(placedOrder.grandTotal || receiptGrandTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Delivery Address Section */}
            <div className={styles.receiptAddressTile}>
              <div className={styles.receiptAddressIconCircle}>
                <MapPin size={18} color="#F99205" />
              </div>
              <div className={styles.receiptAddressDetails}>
                <div className={styles.receiptAddressHeading}>
                  DELIVERING TO: <strong>{selectedAddr?.fullName || user?.name || 'Customer'}</strong> ({selectedAddr?.phone || phone || user?.phone || 'Verified Phone'})
                </div>
                <div className={styles.receiptAddressText}>
                  {selectedAddr?.houseFlat || selectedAddr?.houseNumber ? `${selectedAddr?.houseFlat || selectedAddr?.houseNumber}, ` : ''}
                  {selectedAddr?.buildingStreet || selectedAddr?.street ? `${selectedAddr?.buildingStreet || selectedAddr?.street}, ` : ''}
                  {selectedAddr?.landmark ? `Near ${selectedAddr.landmark}, ` : ''}
                  {selectedAddr?.city || ''}, {selectedAddr?.state || ''} - <strong>{selectedAddr?.pincode || ''}</strong>
                </div>
              </div>
            </div>

            {/* Bottom Barcode / Security Stamp & Print CTA */}
            <div className={styles.receiptSecurityFooter}>
              <div className={styles.receiptBarcodeSimulation}>
                <div className={styles.barcodeBars} />
                <span className={styles.barcodeText}>KCKT-{placedOrder.orderNumber}-AUTH-OK</span>
              </div>
              <button
                type="button"
                onClick={handleDownloadInvoicePdf}
                disabled={isDownloadingPdf}
                className={styles.printReceiptBtn}
                title="Download Official Invoice PDF Bill"
              >
                {isDownloadingPdf ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Generating PDF Bill...
                  </>
                ) : (
                  <>
                    <Download size={15} /> Download PDF Bill
                  </>
                )}
              </button>
            </div>

            {/* Print-Only Official Invoice Bill Footer */}
            <div className={styles.printOnlyFooter}>
              <p>This is an authentic computer-generated Tax Invoice / Cash Bill &bull; No signature required.</p>
              <p>KickAt Pet Care Essentials &bull; www.kickat.co.in</p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className={styles.successCtaGroup}>
            <Link href={`/orders/${placedOrder.orderId || placedOrder.orderNumber}`} className={styles.primarySuccessBtn}>
              <Package size={20} /> View Order Details & Tracking <ArrowRight size={20} />
            </Link>
            <div className={styles.secondaryActionsRow}>
              <button
                type="button"
                onClick={handleDownloadInvoicePdf}
                disabled={isDownloadingPdf}
                className={styles.outlineBtnAlt}
              >
                {isDownloadingPdf ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Generating PDF...
                  </>
                ) : (
                  <>
                    <Download size={16} /> Download Invoice PDF
                  </>
                )}
              </button>
              <button type="button" onClick={handlePrintReceipt} className={styles.outlineBtnAlt}>
                <Printer size={16} /> Print Receipt
              </button>
              <Link href="/shop" className={styles.outlineBtnAlt}>
                <ShoppingBag size={16} /> Continue Shopping
              </Link>
            </div>
          </div>

          <div className={styles.successFooter}>
            <PawPrint
              size={15}
              fill="#F99205"
              color="#F99205"
              style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}
            />
            Thanks for shopping with KickAt!<br />
            <span style={{ color: '#888', fontSize: '0.85rem' }}>Your pet&apos;s happiness is our priority.</span>
          </div>
        </div>
      </main>
    );
  }

  // ----------------------------------------------------
  // RENDER: Active Checkout Flow (Steps 1 & 2)
  // ----------------------------------------------------
  const summary = checkoutData?.summary;
  const subtotal = summary?.subtotal ?? 0;
  const deliveryFee = summary?.deliveryFee ?? (publicDelivery ? (publicDelivery.deliveryFeeEnabled ? publicDelivery.deliveryFee : 0) : 0);
  const gstAmount = summary?.gstAmount ?? 0;
  const gstPercentage = summary?.gstPercentage ?? publicSettings?.tax?.gstPercentage;
  const codFee = summary?.codFee;
  const extraFeeAmount = summary?.extraFeeAmount ?? (publicDelivery?.extraFeeEnabled ? (publicDelivery.extraFeeAmount ?? 0) : 0);
  const extraFeeName = summary?.extraFeeName ?? publicDelivery?.extraFeeName;
  const currentMethodItem = paymentMethods.find((m) => m.type === selectedPaymentMethod);
  const isCodFeeActive = Boolean(publicPayment?.cod?.extraFeeEnabled);
  const rawCodFee = (summary?.codFee !== undefined && summary.codFee > 0)
    ? summary.codFee
    : isCodFeeActive
    ? (currentMethodItem?.extraFee ?? publicPayment?.cod?.extraFee ?? 0)
    : 0;
  const activeCodFee = (selectedPaymentMethod === 'COD' && rawCodFee > 0) ? rawCodFee : 0;
  const isTaxInclusive = publicSettings?.tax?.taxInclusive ?? false;
  const taxForTotal = isTaxInclusive ? 0 : gstAmount;
  const grandTotal = summary?.grandTotal ?? 0;
  const effectiveGrandTotal = (grandTotal > 0 ? grandTotal : (subtotal + deliveryFee + taxForTotal + extraFeeAmount)) + activeCodFee;
  const totalItemsCount = summary?.itemCount ?? cartItems?.reduce((acc, i) => acc + i.quantity, 0) ?? 0;

  const displayedItems = isItemsExpanded ? (cartItems || []) : (cartItems || []).slice(0, 2);
  const hiddenItemsCount = Math.max(0, (cartItems || []).length - 2);

  const selectedAddr = savedAddresses.find((a) => a.id === selectedAddressId);

  return (
    <div className={styles.pageBg}>
      <main className={styles.container}>
        {/* Header Row */}
        <div className={styles.headerRow}>
          <div className={styles.checkoutHeader}>
            <h1 className={styles.title}>
              <Link href="/cart" className={styles.titleIcon} title="Back to Cart">
                <ChevronLeft size={24} />
              </Link>
              Secure Checkout
            </h1>
          </div>

          {/* Stepper Indicator */}
          <div className={styles.stepperContainer}>
            <div
              className={`${styles.stepItem} ${currentStep === 1 ? styles.active : ''}`}
              onClick={() => setCurrentStep(1)}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.stepIcon}>1</div>
              <span>Shipping & Delivery</span>
            </div>
            <div className={styles.stepDivider} />
            <div
              className={`${styles.stepItem} ${currentStep === 2 ? styles.active : ''}`}
              onClick={() => {
                if (validateStep1()) setCurrentStep(2);
              }}
              style={{ cursor: validateStep1() ? 'pointer' : 'not-allowed' }}
            >
              <div className={currentStep === 2 ? styles.stepIcon : styles.stepIconOutline}>2</div>
              <span>Payment & Review</span>
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {orderError && (
          <div
            style={{
              background: '#FEE2E2',
              border: '1px solid #F87171',
              color: '#B91C1C',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
            }}
          >
            <AlertCircle size={18} />
            <span>{orderError}</span>
          </div>
        )}

        <div className={styles.checkoutLayout}>
          {/* Left Column: Multi-Step Forms */}
          <div className={styles.formSection}>
            <div className={styles.mainCard}>
              {/* Header Box */}
              <div className={styles.mainCardHeader}>
                <div className={styles.mainCardHeaderInner}>
                  <div className={styles.mainCardIcon}>
                    {currentStep === 1 ? <MapPin size={22} color="#ea580c" /> : <CreditCard size={22} color="#ea580c" />}
                  </div>
                  <div>
                    <h2 className={styles.mainCardTitle}>
                      {currentStep === 1 ? '1. Shipping Address' : '2. Payment Method'}
                    </h2>
                    <p className={styles.mainCardSubtitle}>
                      {currentStep === 1
                        ? 'Select or add your delivery address'
                        : 'Choose your preferred payment method'}
                    </p>
                  </div>
                </div>

                {currentStep === 2 && (
                  <button
                    type="button"
                    className={styles.editChangeBtn}
                    onClick={() => setCurrentStep(1)}
                  >
                    <Edit3 size={14} /> Change Address
                  </button>
                )}
              </div>

              {/* STEP 1: SHIPPING & ADDRESS */}
              {currentStep === 1 && (
                <div className={styles.stepBodyAlt}>
                  {savedAddresses.length > 0 && !isAddingNewAddress ? (
                    <div className={styles.savedAddressContainer}>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                          gap: '12px',
                          marginBottom: '1.5rem',
                        }}
                      >
                        {savedAddresses.map((addr) => {
                          const isSelected = addr.id === selectedAddressId;
                          return (
                            <div
                              key={addr.id}
                              onClick={() => setSelectedAddressId(addr.id)}
                              style={{
                                border: isSelected ? '2px solid #F99205' : '1px solid #E5E7EB',
                                backgroundColor: isSelected ? '#FFF8ED' : '#FAFAFA',
                                borderRadius: '12px',
                                padding: '14px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                position: 'relative',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    color: '#F99205',
                                    background: '#FEEAD2',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                  }}
                                >
                                  {addr.type || 'HOME'}
                                </span>
                                {addr.isDefault && (
                                  <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>Default</span>
                                )}
                              </div>
                              <div style={{ fontWeight: 600, fontSize: '14px', color: '#1F2937', marginBottom: '4px' }}>
                                {addr.fullName || user?.name || 'Customer'}
                              </div>
                              <div style={{ fontSize: '13px', color: '#4B5563', lineHeight: 1.4, marginBottom: '6px' }}>
                                {addr.houseFlat || addr.houseNumber ? `${addr.houseFlat || addr.houseNumber}, ` : ''}
                                {addr.buildingStreet || addr.street || ''}
                                <br />
                                {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                              </div>
                              <div style={{ fontSize: '12px', color: '#6B7280' }}>
                                📞 {addr.phone || user?.phone || 'Phone on file'}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Address Serviceability Validation Feedback */}
                      {isValidatingAddress && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '13px',
                            color: '#6B7280',
                            padding: '10px 14px',
                            background: '#F3F4F6',
                            borderRadius: '8px',
                            marginBottom: '1rem',
                          }}
                        >
                          <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                          <span>Validating delivery serviceability for pincode {selectedAddr?.pincode}...</span>
                        </div>
                      )}

                      {!isValidatingAddress && addressValidation && addressValidation.serviceable && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '13px',
                            color: '#065F46',
                            padding: '10px 14px',
                            background: '#D1FAE5',
                            border: '1px solid #A7F3D0',
                            borderRadius: '8px',
                            marginBottom: '1rem',
                          }}
                        >
                          <Check size={16} color="#10B981" />
                          <span>
                            <strong>Pincode {selectedAddr?.pincode} is serviceable!</strong> Estimated delivery:{' '}
                            {addressValidation.estimatedDays || '2-4 business days'}.
                          </span>
                        </div>
                      )}

                      {!isValidatingAddress && addressValidationError && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '13px',
                            color: '#B91C1C',
                            padding: '10px 14px',
                            background: '#FEE2E2',
                            border: '1px solid #FCA5A5',
                            borderRadius: '8px',
                            marginBottom: '1rem',
                          }}
                        >
                          <AlertTriangle size={16} />
                          <span>{addressValidationError}</span>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <button
                          type="button"
                          className={styles.addNewAddressBtn}
                          onClick={() => setIsAddingNewAddress(true)}
                        >
                          <Plus size={16} /> Add New Address
                        </button>

                        <button
                          type="button"
                          className={styles.nextStepBtnAlt}
                          onClick={handleProceedToPayment}
                          disabled={Boolean(isValidatingAddress || addressValidationError || (addressValidation && !addressValidation.serviceable))}
                          style={
                            Boolean(isValidatingAddress || addressValidationError || (addressValidation && !addressValidation.serviceable))
                              ? { opacity: 0.6, cursor: 'not-allowed' }
                              : undefined
                          }
                        >
                          Proceed to Payment <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Add New Address Form */
                    <form onSubmit={handleSaveNewAddress}>
                      <div className={styles.formSectionAlt}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <h3 className={styles.sectionTitleAlt}>
                            <User size={18} strokeWidth={1.5} /> Contact & Delivery Information
                          </h3>
                          {savedAddresses.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setIsAddingNewAddress(false)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#F99205',
                                fontWeight: 600,
                                fontSize: '13px',
                                cursor: 'pointer',
                              }}
                            >
                              ← Back to Saved Addresses
                            </button>
                          )}
                        </div>

                        <div className={styles.formGrid}>
                          <div className={styles.inputGroup}>
                            <label className={styles.label}>Full Name</label>
                            <div className={styles.inputWrapper}>
                              <input
                                type="text"
                                required
                                className={styles.input}
                                placeholder="e.g. Sahil Hode"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className={styles.inputGroup}>
                            <label className={styles.labelAlt}>Phone Number</label>
                            <div className={`${styles.inputWrapper} ${styles.phoneInputWrapper}`}>
                              <div className={styles.phonePrefixAlt}>
                                <span>🇮🇳</span>
                                <span>+91</span>
                              </div>
                              <div className={styles.verticalDividerAlt}></div>
                              <input
                                type="tel"
                                required
                                className={styles.inputAlt}
                                placeholder="10-digit mobile number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                        <div style={{ marginTop: '1.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>Address Details</h4>
                            <UseLocationButton
                              onLocationDetected={(addr: DetectedAddress) => {
                                if (addr.pincode) setZipCode(addr.pincode);
                                if (addr.city) setCity(addr.city);
                                if (addr.state) setStateName(addr.state);
                                if (addr.street) setBuildingStreet(addr.street);
                                if (addr.houseFlat) setHouseFlat(addr.houseFlat);
                              }}
                            />
                          </div>

                          <div className={styles.formGrid}>
                            <div className={styles.inputGroup}>
                              <label className={styles.label}>Flat / House No.</label>
                              <div className={styles.inputWrapper}>
                                <input
                                  type="text"
                                  className={styles.input}
                                  placeholder="e.g. Flat 402, Building A"
                                  value={houseFlat}
                                  onChange={(e) => setHouseFlat(e.target.value)}
                                />
                              </div>
                            </div>

                            <div className={styles.inputGroup}>
                              <label className={styles.label}>Building / Society / Street *</label>
                              <div className={styles.inputWrapper}>
                                <input
                                  type="text"
                                  required
                                  className={styles.input}
                                  placeholder="e.g. Sunshine Residency, MG Road"
                                  value={buildingStreet}
                                  onChange={(e) => setBuildingStreet(e.target.value)}
                                />
                              </div>
                            </div>

                            <div className={styles.inputGroup}>
                              <label className={styles.label}>Landmark (Optional)</label>
                              <div className={styles.inputWrapper}>
                                <input
                                  type="text"
                                  className={styles.input}
                                  placeholder="e.g. Opposite Metro Station"
                                  value={landmark}
                                  onChange={(e) => setLandmark(e.target.value)}
                                />
                              </div>
                            </div>

                            <div className={styles.inputGroup}>
                              <label className={styles.label}>City *</label>
                              <div className={styles.inputWrapper}>
                                <input
                                  type="text"
                                  required
                                  className={styles.input}
                                  placeholder="e.g. Mumbai"
                                  value={city}
                                  onChange={(e) => setCity(e.target.value)}
                                />
                              </div>
                            </div>

                            <div className={styles.inputGroup}>
                              <label className={styles.label}>State *</label>
                              <div className={styles.inputWrapper}>
                                <input
                                  type="text"
                                  required
                                  className={styles.input}
                                  placeholder="e.g. Maharashtra"
                                  value={stateName}
                                  onChange={(e) => setStateName(e.target.value)}
                                />
                              </div>
                            </div>

                            <div className={styles.inputGroup}>
                              <label className={styles.label}>Pincode *</label>
                              <div className={styles.inputWrapper}>
                                <input
                                  type="text"
                                  required
                                  maxLength={6}
                                  className={styles.input}
                                  placeholder="6-digit pincode"
                                  value={zipCode}
                                  onChange={(e) => setZipCode(e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {addressValidationError && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '13px',
                              color: '#B91C1C',
                              padding: '10px 14px',
                              background: '#FEE2E2',
                              border: '1px solid #FCA5A5',
                              borderRadius: '8px',
                              marginTop: '1rem',
                            }}
                          >
                            <AlertTriangle size={16} />
                            <span>{addressValidationError}</span>
                          </div>
                        )}

                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '12px' }}>
                          <button
                            type="submit"
                            className={styles.nextStepBtnAlt}
                            disabled={isSavingNewAddress}
                          >
                            {isSavingNewAddress ? (
                              <>
                                <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                                Saving Address...
                              </>
                            ) : (
                              <>Save & Continue to Payment <ChevronRight size={18} /></>
                            )}
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* STEP 2: PAYMENT METHOD SELECTION */}
              {currentStep === 2 && (
                <div className={styles.stepBodyAlt}>
                  {/* Compact Delivery Summary Chip */}
                  <div className={styles.deliverySummaryBanner}>
                    <div className={styles.deliverySummaryContent}>
                      <div className={styles.deliveryPinIcon}>
                        <MapPin size={16} color="#EA580C" />
                      </div>
                      <div className={styles.deliveryTextWrap}>
                        <span className={styles.deliveryLabel}>Deliver to:</span>{' '}
                        <span className={styles.deliveryAddressText}>
                          {selectedAddr?.fullName ? <strong>{selectedAddr.fullName} — </strong> : ''}
                          {selectedAddr?.houseFlat || selectedAddr?.houseNumber ? `${selectedAddr?.houseFlat || selectedAddr?.houseNumber}, ` : ''}
                          {selectedAddr?.buildingStreet || selectedAddr?.street}, {selectedAddr?.city} ({selectedAddr?.pincode})
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={styles.changeAddressPillBtn}
                      onClick={() => setCurrentStep(1)}
                    >
                      Change
                    </button>
                  </div>

                  {isLoadingPaymentMethods && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px', color: '#666' }}>
                      <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Checking eligible payment methods...</span>
                    </div>
                  )}

                  {!isLoadingPaymentMethods && paymentMethods.length === 0 && (
                    <div className={styles.paymentOptionsGrid}>
                      <div
                        className={`${styles.paymentOptionCard} ${selectedPaymentMethod === 'COD' ? styles.selected : ''}`}
                        onClick={() => setSelectedPaymentMethod('COD')}
                      >
                        <div className={styles.paymentOptionHeader}>
                          <div className={styles.paymentOptionIcon}>
                            <Truck size={20} color="#ea580c" />
                          </div>
                          <div className={styles.paymentOptionDetails}>
                            <p className={styles.paymentOptionTitle}>Cash on Delivery (COD)</p>
                            <p className={styles.paymentOptionSubtitle}>Pay with cash when your package arrives</p>
                          </div>
                          <div className={styles.paymentRadioCircle}>
                            <div className={styles.paymentRadioDot} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!isLoadingPaymentMethods && paymentMethods.length > 0 && (
                    <div className={styles.paymentOptionsGrid}>
                      {paymentMethods.map((method) => {
                        const isSelected = selectedPaymentMethod === method.type;
                        const isAvailable = method.available;

                        const getMethodIcon = () => {
                          switch (method.type) {
                            case 'UPI':
                              return <Smartphone size={18} color="#EA580C" />;
                            case 'CARD':
                              return <CreditCard size={18} color="#EA580C" />;
                            case 'WALLET':
                              return <Wallet size={18} color="#EA580C" />;
                            case 'NETBANKING':
                              return <Building2 size={18} color="#EA580C" />;
                            case 'COD':
                            default:
                              return <Truck size={18} color="#EA580C" />;
                          }
                        };

                        return (
                          <div
                            key={method.type}
                            className={`${styles.paymentOptionCard} ${isSelected ? styles.selected : ''}`}
                            onClick={() => {
                              if (isAvailable) setSelectedPaymentMethod(method.type);
                            }}
                            style={!isAvailable ? { opacity: 0.5, cursor: 'not-allowed', background: '#F9FAFB' } : undefined}
                          >
                            <div className={styles.paymentOptionHeader}>
                              <div className={styles.paymentOptionIcon}>{getMethodIcon()}</div>
                              <div className={styles.paymentOptionDetails}>
                                <div className={styles.paymentOptionTitleRow}>
                                  <p className={styles.paymentOptionTitle}>{method.name || method.type}</p>
                                  {method.type === 'UPI' && <span className={styles.recommendedBadge}>FASTEST ⚡</span>}
                                  {method.type === 'COD' && activeCodFee > 0 ? (
                                    <span className={styles.extraFeeBadge}>+₹{activeCodFee} fee</span>
                                  ) : method.type !== 'COD' && method.extraFee && method.extraFee > 0 ? (
                                    <span className={styles.extraFeeBadge}>+₹{method.extraFee} fee</span>
                                  ) : null}
                                </div>
                                <p className={styles.paymentOptionSubtitle}>
                                  {isAvailable
                                    ? method.type === 'UPI'
                                      ? 'Google Pay, PhonePe, Paytm, QR & all UPI Apps'
                                      : method.type === 'COD'
                                      ? 'Pay upon package arrival'
                                      : 'Fast & 100% encrypted online payment'
                                    : method.reason || 'Not available for this order'}
                                </p>
                              </div>
                              <div className={styles.paymentRadioCircle}>
                                {isSelected && <div className={styles.paymentRadioDot} />}
                              </div>
                            </div>

                            {/* Compact UPI Apps Strip */}
                            {isSelected && method.type === 'UPI' && (
                              <div className={styles.compactUpiStrip}>
                                <span className={styles.upiPill}>📸 Dynamic QR</span>
                                <span className={styles.upiPill}>Google Pay</span>
                                <span className={styles.upiPill}>PhonePe</span>
                                <span className={styles.upiPill}>Paytm</span>
                                <span className={styles.upiPill}>CRED</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Optional Delivery Instructions */}
                  <div className={styles.instructionsContainer}>
                    {!showInstructions && !deliveryInstructions ? (
                      <button
                        type="button"
                        className={styles.toggleInstructionsBtn}
                        onClick={() => setShowInstructions(true)}
                      >
                        + Add delivery instructions or note (optional)
                      </button>
                    ) : (
                      <div className={styles.instructionsInputBox}>
                        <label className={styles.instructionsLabel}>Delivery Instructions (Optional)</label>
                        <input
                          type="text"
                          className={styles.input}
                          placeholder="e.g. Please deliver after 5 PM / Leave at gate"
                          value={deliveryInstructions}
                          onChange={(e) => setDeliveryInstructions(e.target.value)}
                          maxLength={300}
                        />
                      </div>
                    )}
                  </div>

                  {/* Payment Error / Retry Banner */}
                  {orderError && (
                    <div
                      style={{
                        marginTop: '1rem',
                        padding: '0.85rem 1rem',
                        borderRadius: '10px',
                        background: '#FEF2F2',
                        border: '1px solid #FCA5A5',
                        color: '#991B1B',
                        fontSize: '0.875rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                        <AlertCircle size={17} color="#DC2626" />
                        <span>Payment Notice</span>
                      </div>
                      <p style={{ margin: 0, lineHeight: 1.4 }}>{orderError}</p>
                      {pendingOrderId && (
                        <div style={{ marginTop: '0.4rem' }}>
                          <Link
                            href={`/payments/retry?orderId=${pendingOrderId}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '7px 13px',
                              backgroundColor: '#DC2626',
                              color: '#FFFFFF',
                              borderRadius: '7px',
                              textDecoration: 'none',
                              fontSize: '0.825rem',
                              fontWeight: 600,
                            }}
                          >
                            <RotateCcw size={14} /> Retry Payment for Order #{pendingOrderNumber || pendingOrderId}
                          </Link>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Primary Order & Payment Action */}
                  <div className={styles.actionBtnWrap}>
                    <AnimatedOrderButton
                      onValidate={validatePlaceOrderForm}
                      onTriggerOrder={handleTriggerOrder}
                      onComplete={handleAnimatedComplete}
                      isSubmitting={isSubmittingOrder}
                      disabled={isSubmittingOrder || !selectedPaymentMethod}
                      label={
                        selectedPaymentMethod === 'COD'
                          ? `Place Order (Cash on Delivery) • ₹${effectiveGrandTotal.toLocaleString()}`
                          : `Proceed to Pay ₹${effectiveGrandTotal.toLocaleString()} Securely`
                      }
                      loadingText={
                        paymentStatusText ||
                        (selectedPaymentMethod === 'COD'
                          ? 'Placing Cash on Delivery order...'
                          : 'Opening secure payment gateway...')
                      }
                    />
                    <div className={styles.trustBadgesRow}>
                      <span>🔒 256-bit Encrypted Checkout</span>
                      <span>🛡️ 100% Buyer Protection</span>
                      <span>⚡ Instant Confirmation</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Floating Order Summary */}
          <div className={styles.summaryColumn}>
            <div className={styles.floatingSummaryCard}>
              <h2
                className={styles.summaryTitleAlt}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                Order Summary
                <span style={{ fontSize: '0.85rem', color: '#666', fontWeight: 500 }}>
                  ({totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'})
                </span>
              </h2>

              {/* Items List */}
              <div className={styles.checkoutStaticList}>
                {displayedItems.map((item) => {
                  const itemPrice = item.variant ? (item.variant.discountPrice ?? item.variant.price) : (item.product?.discountPrice ?? item.product?.price ?? 0);
                  const itemImage = (item.variant as any)?.imageUrl || (item.variant as any)?.image || (item.variant as any)?.images?.[0] || item.product?.imageUrl || (item.product as any)?.image || (item.product as any)?.images?.[0] || (item as any)?.imageUrl || (item as any)?.image;
                  const itemName = item.product?.name || 'Pet Product';
                  const variantName = item.variant?.name;

                  return (
                    <div key={item.id} className={styles.staticProductCard}>
                      <div className={styles.staticProductImage}>
                        <SafeImage
                          src={itemImage}
                          productName={itemName}
                          alt={itemName}
                          fill
                          style={{ objectFit: 'contain' }}
                          sizes="(max-width: 768px) 60px, 80px"
                        />
                      </div>
                      <div className={styles.staticProductInfo}>
                        <div className={styles.staticProductTop}>
                          <h3 className={styles.staticProductName}>{itemName}</h3>
                          <div className={styles.staticProductPrice}>
                            ₹{(itemPrice * item.quantity).toLocaleString()}
                          </div>
                        </div>
                        {variantName && (
                          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                            Variant: {variantName}
                          </div>
                        )}
                        <div className={styles.staticProductQty}>Qty: {item.quantity}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {hiddenItemsCount > 0 && (
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsItemsExpanded(!isItemsExpanded)}
                    className={styles.expandItemsBtn}
                  >
                    {isItemsExpanded ? 'Show less ↑' : `+ ${hiddenItemsCount} more items ↓`}
                  </button>
                </div>
              )}

              {/* Price Details Breakdown (Always visible, fully transparent) */}
              <div style={{ padding: '0.5rem 0', borderBottom: '1px solid #E5E7EB', marginBottom: '0.75rem' }}>
                <div className={styles.summaryRowAlt}>
                  <span>Items Subtotal</span>
                  <span className={styles.summaryValueAlt}>₹{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                {gstAmount > 0 && (
                  <div className={styles.summaryRowAlt}>
                    <span>{isTaxInclusive ? 'Inclusive Tax' : 'Tax / GST'} {gstPercentage ? `(${gstPercentage}%)` : ''}</span>
                    <span className={styles.summaryValueAlt}>
                      {isTaxInclusive
                        ? `Included (₹${gstAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`
                        : `₹${gstAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    </span>
                  </div>
                )}
                <div className={styles.summaryRowAlt}>
                  <span>Shipping &amp; Delivery</span>
                  <span className={styles.shippingValueAlt} style={{ color: deliveryFee === 0 ? '#16A34A' : '#111827', fontWeight: 700 }}>
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </span>
                </div>
                {selectedPaymentMethod === 'COD' && activeCodFee > 0 && (
                  <div className={styles.summaryRowAlt} style={{ color: '#ea580c', fontWeight: 600 }}>
                    <span>Cash on Delivery Fee</span>
                    <span className={styles.summaryValueAlt} style={{ color: '#ea580c' }}>
                      +₹{activeCodFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                {extraFeeAmount > 0 && (
                  <div className={styles.summaryRowAlt}>
                    <span>{extraFeeName || 'Handling Fee'}</span>
                    <span className={styles.summaryValueAlt}>₹{extraFeeAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>

              {/* Promo Code Section */}
              <div className={styles.promoContainerAlt}>
                <div
                  className={styles.promoHeaderAlt}
                  onClick={() => setIsPromoOpen(!isPromoOpen)}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                      <line x1="7" y1="7" x2="7.01" y2="7" />
                    </svg>
                    Have a coupon code?
                  </div>
                  <ChevronDown
                    size={16}
                    color="#888"
                    style={{
                      transform: isPromoOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s',
                    }}
                  />
                </div>
                {isPromoOpen && (
                  <div className={styles.promoInputWrapperAlt}>
                    <input type="text" className={styles.promoInputAlt} placeholder="Enter coupon code" />
                    <button type="button" className={styles.promoBtnAlt}>
                      Apply
                    </button>
                  </div>
                )}
              </div>

              {/* Grand Total Row */}
              <div className={styles.totalRowAlt}>
                <span className={styles.totalLabelAlt}>
                  Grand Total <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#888' }}>(incl. taxes)</span>
                </span>
                <span>₹{effectiveGrandTotal.toLocaleString()}</span>
              </div>

              <div className={styles.sslFooter}>
                <Lock size={12} /> Secure 256-bit SSL Checkout
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Phone OTP Verification Modal */}
      {isPhoneModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => !isVerifyingPhoneOtp && setIsPhoneModalOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleGroup}>
                <Shield size={20} color="#F28C0F" />
                <h2>Verify Mobile Number</h2>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setIsPhoneModalOpen(false)}
                disabled={isVerifyingPhoneOtp}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleVerifyCheckoutPhoneOtp} className={styles.modalForm}>
              <p style={{ fontSize: 13, color: '#6E6259', margin: '0 0 12px 0' }}>
                We sent a 6-digit OTP code to <strong>{phone}</strong>.
              </p>

              <div className={styles.inputGroup} style={{ marginBottom: 12 }}>
                <label className={styles.label}>6-Digit OTP</label>
                <input
                  type="text"
                  maxLength={6}
                  className={styles.input}
                  placeholder="Enter 6-digit code"
                  value={phoneOtp}
                  onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ''))}
                  disabled={isVerifyingPhoneOtp}
                  required
                />
              </div>

              {phoneOtpError && (
                <div style={{ color: '#EF4444', fontSize: 12, marginBottom: 12 }}>
                  {phoneOtpError}
                </div>
              )}

              <button
                type="submit"
                className={styles.nextStepBtnAlt}
                style={{ width: '100%' }}
                disabled={isVerifyingPhoneOtp || phoneOtp.trim().length !== 6}
              >
                {isVerifyingPhoneOtp ? 'Verifying OTP...' : 'Verify & Confirm'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
