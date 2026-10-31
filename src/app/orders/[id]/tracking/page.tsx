"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  ExternalLink,
  MapPin,
  MessageCircle,
  Package,
  PackageCheck,
  Navigation,
  RefreshCw,
  RotateCcw,
  Truck,
  XCircle,
  AlertCircle,
  Loader2,
  AlertTriangle,
  FileCheck,
} from "lucide-react";
import styles from "./Tracking.module.css";
import { orderService } from "@/services/orderService";

interface TrackingCheckpoint {
  stage: string;
  title: string;
  location: string | null;
  timestamp: string | null;
  isCompleted: boolean;
  isCurrent: boolean;
  description?: string | null;
}

interface TrackingEvent {
  rawStatus: string;
  stage: string;
  description: string | null;
  location: string | null;
  eventAt?: string;
  timestamp?: string;
}

interface TrackingData {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  trackingNumber?: string;
  awbNumber?: string;
  courierPartner?: string;
  trackingUrl?: string;
  status?: string;
  currentStatus?: string;
  isRTO?: boolean;
  isCancelled?: boolean;
  cancellable?: boolean;
  cancellationBlockedReason?: string;
  origin?: string;
  destination?: string;
  location?: string;
  lastUpdated?: string;
  estimatedDelivery?: string;
  trackingMessage?: string | null;
  checkpoints?: TrackingCheckpoint[];
  events?: TrackingEvent[];
  hasTrackingEvents?: boolean;
  timeline?: TrackingCheckpoint[];
}

function getStepIcon(stage: string, size = 14) {
  switch (stage) {
    case "PLACED":
    case "ORDER_PLACED":
    case "ORDER_CONFIRMED":
      return <FileCheck size={size} strokeWidth={2.5} />;
    case "PACKED":
      return <Package size={size} strokeWidth={2.5} />;
    case "SHIPPED":
    case "IN_TRANSIT":
      return <Truck size={size} strokeWidth={2.5} />;
    case "OUT_FOR_DELIVERY":
      return <Navigation size={size} strokeWidth={2.5} />;
    case "DELIVERED":
      return <PackageCheck size={size} strokeWidth={2.5} />;
    case "CANCELLED":
      return <XCircle size={size} strokeWidth={2.5} />;
    case "RTO_INITIATED":
    case "RTO_DELIVERED":
      return <RotateCcw size={size} strokeWidth={2.5} />;
    default:
      return <Package size={size} strokeWidth={2.5} />;
  }
}

function formatDateTime(ts: string | null | undefined): string {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDeliveryDate(ts: string | null | undefined): string {
  if (!ts) return "";
  const d = new Date(ts);
  const dayName = d.toLocaleDateString("en-IN", { weekday: "long" });
  const day = d.getDate();
  const month = d.toLocaleDateString("en-IN", { month: "short" });
  return `${dayName}, ${day} ${month}`;
}

function getDefaultCheckpoints(orderStatus: string, order: any, tracking: TrackingData): TrackingCheckpoint[] {
  const status = orderStatus.toUpperCase();
  const isCancelled = status === "CANCELLED" || tracking.isCancelled;
  const isRTO = status === "RETURN_INITIATED" || status === "RETURNED" || tracking.isRTO;

  const stages = ["PLACED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];
  const statusIndex: Record<string, number> = {
    PLACED: 0,
    CONFIRMED: 0,
    PROCESSING: 1,
    PACKED: 1,
    SHIPPED: 2,
    IN_TRANSIT: 2,
    OUT_FOR_DELIVERY: 3,
    DELIVERED: 4,
  };

  const currentIdx = statusIndex[status] ?? 0;

  if (isCancelled) {
    return [
      {
        stage: "PLACED",
        title: "Order Placed",
        location: null,
        timestamp: order?.createdAt || null,
        isCompleted: true,
        isCurrent: false,
      },
      {
        stage: "CANCELLED",
        title: "Order Cancelled",
        location: null,
        timestamp: order?.cancelledAt || null,
        isCompleted: true,
        isCurrent: true,
        description: order?.cancelReason ? `Reason: ${order.cancelReason}` : "This order was cancelled.",
      },
    ];
  }

  return stages.map((stage, idx) => ({
    stage,
    title:
      stage === "PLACED"
        ? "Order Placed"
        : stage === "PACKED"
        ? "Packed & Ready"
        : stage === "SHIPPED"
        ? "In Transit"
        : stage === "OUT_FOR_DELIVERY"
        ? "Out for Delivery"
        : isRTO
        ? "Return to Origin"
        : "Delivered",
    location: null,
    timestamp: null,
    isCompleted: idx <= currentIdx,
    isCurrent: idx === currentIdx,
  }));
}

export default function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  const router = useRouter();

  const [order, setOrder] = useState<any | null>(null);
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showAllEvents, setShowAllEvents] = useState(false);

  const copyToClipboard = (text: string, field: string) => {
    if (!text) return;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2500);
      })
      .catch(() => {});
  };

  const fetchData = async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const [orderRes, trackingRes] = await Promise.allSettled([
        orderService.getOrderById(orderId),
        orderService.getOrderTracking(orderId),
      ]);

      if (orderRes.status === "fulfilled" && orderRes.value?.success && orderRes.value.order) {
        setOrder(orderRes.value.order);
      }

      if (trackingRes.status === "fulfilled" && trackingRes.value?.success) {
        const t = trackingRes.value.tracking || trackingRes.value;
        setTracking(t as TrackingData);
      } else if (orderRes.status === "fulfilled" && orderRes.value?.success) {
        // No tracking yet but order exists — show order-based state
        setTracking(null);
      } else {
        setError("Could not load tracking information. Please try again.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load tracking data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      document.title = `Track Order | KickAt`;
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // Derived data
  const orderStatus = (
    tracking?.currentStatus ||
    tracking?.status ||
    order?.orderStatus ||
    order?.status ||
    "PLACED"
  ).toUpperCase();

  const isCancelled = orderStatus === "CANCELLED" || tracking?.isCancelled;
  const isRTO = tracking?.isRTO;
  const isDelivered = orderStatus === "DELIVERED";

  const checkpoints: TrackingCheckpoint[] =
    tracking?.checkpoints ??
    tracking?.timeline ??
    (order ? getDefaultCheckpoints(orderStatus, order, tracking || ({} as TrackingData)) : []);

  const events: TrackingEvent[] = tracking?.events || [];
  const displayEvents = showAllEvents ? events : events.slice(0, 4);

  const orderNumber = tracking?.orderNumber || order?.orderNumber || orderId;
  const awb = tracking?.awbNumber || tracking?.trackingNumber || order?.trackingNumber || "";
  const courier = tracking?.courierPartner || order?.courierPartner || "";
  const trackingUrl = tracking?.trackingUrl || "";
  const estimatedDelivery = tracking?.estimatedDelivery || order?.estimatedDelivery || order?.deliveryDate || "";
  const lastUpdated = tracking?.lastUpdated || order?.updatedAt || "";
  const currentLocation = tracking?.location || "";
  const destination = tracking?.destination || "";
  const origin = tracking?.origin || "";
  const trackingMessage = tracking?.trackingMessage;

  // Loading skeleton
  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <div className={styles.topBar}>
            <div className={`${styles.skel} ${styles.skelBack}`} />
          </div>
          <div className={styles.skelCard} style={{ minHeight: 120 }}>
            <div className={`${styles.skel} ${styles.skelPill}`} />
            <div className={`${styles.skel} ${styles.skelTitle}`} />
            <div className={`${styles.skel} ${styles.skelSubtitle}`} />
          </div>
          <div className={styles.skelCard} style={{ minHeight: 80 }}>
            <div className={`${styles.skel} ${styles.skelTitle}`} style={{ width: "60%" }} />
          </div>
          <div className={styles.skelCard} style={{ minHeight: 260 }}>
            <div className={`${styles.skel} ${styles.skelLineLong}`} />
            <div className={`${styles.skel} ${styles.skelLineLong}`} style={{ width: "50%", marginTop: 12 }} />
            <div className={`${styles.skel} ${styles.skelLineLong}`} style={{ width: "70%", marginTop: 12 }} />
            <div className={`${styles.skel} ${styles.skelLineLong}`} style={{ width: "40%", marginTop: 12 }} />
          </div>
          <div className={styles.skelCard} style={{ minHeight: 160 }}>
            <div className={`${styles.skel} ${styles.skelLineLong}`} style={{ width: "45%" }} />
            <div className={`${styles.skel} ${styles.skelLineLong}`} style={{ width: "80%", marginTop: 12 }} />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !order && !tracking) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <div className={styles.errorCard}>
            <div className={styles.errorIconWrap}>
              <AlertCircle size={32} />
            </div>
            <h1 className={styles.errorTitle}>Tracking Unavailable</h1>
            <p className={styles.errorDesc}>{error}</p>
            <div className={styles.errorActions}>
              <Link href={`/orders/${orderId}`} className={styles.errorBtnPrimary}>
                <ArrowLeft size={16} />
                <span>Order Details</span>
              </Link>
              <button type="button" onClick={fetchData} className={styles.errorBtnSecondary}>
                <RefreshCw size={16} />
                <span>Retry</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        {/* Top Bar */}
        <div className={styles.topBar}>
          <Link href={`/orders/${orderId}`} className={styles.backBtn}>
            <ArrowLeft size={16} />
            <span>Order Details</span>
          </Link>
          <button type="button" onClick={fetchData} className={styles.refreshBtn} aria-label="Refresh tracking">
            <RefreshCw size={15} />
          </button>
        </div>

        {/* 1. Order & Courier Header Card */}
        <section className={styles.heroCard}>
          <div className={styles.heroTopRow}>
            <div className={styles.orderIdGroup}>
              <span className={styles.orderIdLabel}>Order</span>
              <span className={styles.orderIdValue}>#{orderNumber}</span>
              <button
                type="button"
                className={`${styles.copyBtn} ${copiedField === "order" ? styles.copied : ""}`}
                onClick={() => copyToClipboard(String(orderNumber), "order")}
                aria-label="Copy order number"
              >
                {copiedField === "order" ? <Check size={12} /> : <Copy size={12} />}
              </button>
            </div>

            {courier && (
              <span className={styles.courierBadge}>
                <Truck size={13} />
                <span>{courier}</span>
              </span>
            )}
          </div>

          {/* AWB Row */}
          {awb ? (
            <div className={styles.awbRow}>
              <span className={styles.awbLabel}>AWB / Tracking</span>
              <span className={styles.awbValue}>{awb}</span>
              <button
                type="button"
                className={`${styles.copyBtn} ${copiedField === "awb" ? styles.copied : ""}`}
                onClick={() => copyToClipboard(awb, "awb")}
                aria-label="Copy AWB number"
              >
                {copiedField === "awb" ? <Check size={12} /> : <Copy size={12} />}
              </button>
            </div>
          ) : (
            <div className={styles.awbPending}>
              <Clock size={14} />
              <span>AWB will be generated once the order is dispatched.</span>
            </div>
          )}
        </section>

        {/* 2. Estimated Delivery / Status Banner */}
        {isCancelled ? (
          <section className={styles.alertBanner + " " + styles.alertBannerRed}>
            <XCircle size={20} />
            <div className={styles.alertBannerText}>
              <strong>Order Cancelled</strong>
              <span>{order?.cancelReason ? `Reason: ${order.cancelReason}` : "This order has been cancelled."}</span>
            </div>
          </section>
        ) : isRTO ? (
          <section className={styles.alertBanner + " " + styles.alertBannerAmber}>
            <AlertTriangle size={20} />
            <div className={styles.alertBannerText}>
              <strong>Return to Origin (RTO)</strong>
              <span>This shipment is being returned to the warehouse.</span>
            </div>
          </section>
        ) : isDelivered ? (
          <section className={styles.deliveryBanner + " " + styles.deliveryBannerGreen}>
            <CheckCircle2 size={22} />
            <div className={styles.deliveryBannerText}>
              <strong>Delivered</strong>
              <span>
                {order?.deliveryDate
                  ? `Delivered on ${formatDeliveryDate(order.deliveryDate)}`
                  : "Your package has been delivered."}
              </span>
            </div>
          </section>
        ) : estimatedDelivery ? (
          <section className={styles.deliveryBanner}>
            <Calendar size={22} />
            <div className={styles.deliveryBannerText}>
              <strong>Arriving by {formatDeliveryDate(estimatedDelivery)}</strong>
              <span>
                {trackingMessage || "Your package is on its way."}
              </span>
            </div>
          </section>
        ) : trackingMessage ? (
          <section className={styles.deliveryBanner + " " + styles.deliveryBannerMuted}>
            <Package size={20} />
            <div className={styles.deliveryBannerText}>
              <span>{trackingMessage}</span>
            </div>
          </section>
        ) : null}

        {/* 3. Milestone Stepper (Progress Bar) */}
        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <Truck size={18} className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>Shipment Progress</h2>
            </div>
          </div>

          <div className={styles.stepperContainer}>
            {checkpoints.map((cp, idx) => {
              const isDone = cp.isCompleted;
              const isCurrent = cp.isCurrent;
              const isCancelledStep = cp.stage === "CANCELLED";
              const isLast = idx === checkpoints.length - 1;

              return (
                <div
                  key={idx}
                  className={`${styles.stepperStep} ${
                    isCancelledStep && isCurrent
                      ? styles.stepCancelled
                      : isCurrent
                      ? styles.stepActive
                      : isDone
                      ? styles.stepDone
                      : styles.stepPending
                  }`}
                >
                  <div className={styles.stepNodeCol}>
                    <div
                      className={`${styles.stepDot} ${
                        isCancelledStep && isCurrent
                          ? styles.stepDotCancelled
                          : isCurrent
                          ? styles.stepDotActive
                          : isDone
                          ? styles.stepDotDone
                          : styles.stepDotPending
                      }`}
                    >
                      {getStepIcon(cp.stage)}
                      {isCurrent && !isCancelledStep && <span className={styles.pulseRing} />}
                      {isCurrent && isCancelledStep && <span className={`${styles.pulseRing} ${styles.pulseRingRed}`} />}
                    </div>
                    {!isLast && (
                      <div
                        className={`${styles.stepBar} ${
                          isCancelledStep
                            ? styles.stepBarCancelled
                            : isDone && !isCurrent
                            ? styles.stepBarDone
                            : styles.stepBarPending
                        }`}
                      />
                    )}
                  </div>

                  <div
                    className={`${styles.stepContent} ${
                      isCancelledStep && isCurrent
                        ? styles.stepContentCancelled
                        : isCurrent
                        ? styles.stepContentActive
                        : !isDone
                        ? styles.stepContentPending
                        : ""
                    }`}
                  >
                    <div className={styles.stepHead}>
                      <span className={styles.stepTitle}>{cp.title}</span>
                      {isCurrent && (
                        <span
                          className={`${styles.currentPill} ${
                            isCancelledStep ? styles.currentPillRed : ""
                          }`}
                        >
                          Current
                        </span>
                      )}
                    </div>
                    {cp.timestamp && (
                      <span className={styles.stepTimestamp}>{formatDateTime(cp.timestamp)}</span>
                    )}
                    {cp.location && (
                      <div className={styles.stepLocation}>
                        <MapPin size={12} />
                        <span>{cp.location}</span>
                      </div>
                    )}
                    {cp.description && <p className={styles.stepDesc}>{cp.description}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. Scan Activity Feed */}
        {events.length > 0 && (
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleGroup}>
                <Clock size={18} className={styles.sectionIcon} />
                <h2 className={styles.sectionTitle}>Scan Activity</h2>
              </div>
              <span className={styles.eventCount}>{events.length} event{events.length !== 1 ? "s" : ""}</span>
            </div>

            <div className={styles.eventsList}>
              {displayEvents.map((ev, idx) => {
                const eventTime = ev.eventAt || ev.timestamp;
                const d = eventTime ? new Date(eventTime) : null;
                const isValid = d && !isNaN(d.getTime());
                return (
                  <div key={idx} className={styles.eventRow}>
                    <div className={styles.eventTime}>
                      <span className={styles.eventDate}>
                        {isValid ? d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Recent"}
                      </span>
                      <span className={styles.eventHour}>
                        {isValid ? d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : ""}
                      </span>
                    </div>
                  <div className={styles.eventDivider}>
                    <div className={styles.eventDot} />
                    {idx < displayEvents.length - 1 && <div className={styles.eventLine} />}
                  </div>
                  <div className={styles.eventInfo}>
                    <span className={styles.eventStatus}>{ev.description || ev.rawStatus}</span>
                    {ev.location && (
                      <span className={styles.eventLocation}>
                        <MapPin size={11} />
                        {ev.location}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

            {events.length > 4 && (
              <button
                type="button"
                className={styles.showMoreBtn}
                onClick={() => setShowAllEvents(!showAllEvents)}
              >
                {showAllEvents ? (
                  <>
                    <ChevronUp size={15} />
                    <span>Show Less</span>
                  </>
                ) : (
                  <>
                    <ChevronDown size={15} />
                    <span>Show All {events.length} Events</span>
                  </>
                )}
              </button>
            )}
          </section>
        )}

        {/* Truthful empty state when no events yet */}
        {events.length === 0 && !isCancelled && !isDelivered && trackingMessage && (
          <section className={styles.sectionCard}>
            <div className={styles.emptyEventsNotice}>
              <Package size={20} />
              <p>{trackingMessage}</p>
            </div>
          </section>
        )}

        {/* 5. Shipment Info Grid */}
        <div className={styles.infoGrid}>
          {/* Route & Location Info */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleGroup}>
                <MapPin size={18} className={styles.sectionIcon} />
                <h2 className={styles.sectionTitle}>Shipment Info</h2>
              </div>
            </div>

            <div className={styles.infoTiles}>
              {origin && (
                <div className={styles.infoTile}>
                  <span className={styles.infoTileLabel}>Origin</span>
                  <span className={styles.infoTileValue}>{origin}</span>
                </div>
              )}
              {destination && (
                <div className={styles.infoTile}>
                  <span className={styles.infoTileLabel}>Destination</span>
                  <span className={styles.infoTileValue}>{destination}</span>
                </div>
              )}
              {currentLocation && !isDelivered && (
                <div className={styles.infoTile}>
                  <span className={styles.infoTileLabel}>Current Location</span>
                  <span className={styles.infoTileValue}>{currentLocation}</span>
                </div>
              )}
              {lastUpdated && (
                <div className={styles.infoTile}>
                  <span className={styles.infoTileLabel}>Last Updated</span>
                  <span className={styles.infoTileValue}>{formatDateTime(lastUpdated)}</span>
                </div>
              )}
            </div>
          </section>

          {/* Actions Card */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleGroup}>
                <ExternalLink size={18} className={styles.sectionIcon} />
                <h2 className={styles.sectionTitle}>Quick Actions</h2>
              </div>
            </div>

            <div className={styles.actionsList}>
              {trackingUrl && (
                <a
                  href={trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.actionBtn}
                >
                  <div className={styles.actionBtnIcon}>
                    <ExternalLink size={16} />
                  </div>
                  <div className={styles.actionBtnText}>
                    <span className={styles.actionBtnLabel}>
                      Track on {courier || "Courier"} Site
                    </span>
                    <span className={styles.actionBtnHint}>Opens official tracking portal</span>
                  </div>
                  <ChevronDown size={14} className={styles.actionChevron} />
                </a>
              )}

              <Link href={`/orders/${orderId}`} className={styles.actionBtn}>
                <div className={styles.actionBtnIcon}>
                  <Package size={16} />
                </div>
                <div className={styles.actionBtnText}>
                  <span className={styles.actionBtnLabel}>View Order Details</span>
                  <span className={styles.actionBtnHint}>Items, payment & delivery info</span>
                </div>
                <ChevronDown size={14} className={styles.actionChevron} />
              </Link>

              <a
                href="https://wa.me/919999999999?text=Hi%2C%20I%20need%20help%20with%20my%20order"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.actionBtn}
              >
                <div className={styles.actionBtnIcon + " " + styles.actionBtnIconGreen}>
                  <MessageCircle size={16} />
                </div>
                <div className={styles.actionBtnText}>
                  <span className={styles.actionBtnLabel}>Need Help?</span>
                  <span className={styles.actionBtnHint}>Chat with support on WhatsApp</span>
                </div>
                <ChevronDown size={14} className={styles.actionChevron} />
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
