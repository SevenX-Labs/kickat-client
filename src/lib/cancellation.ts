/**
 * Cancellation helpers for the order detail screen.
 *
 * The backend owns both of the business rules here:
 *  - whether an order may be cancelled (`order.cancellable`, computed server
 *    side from status + AWB + provider shipment id), and
 *  - which reason codes are valid (`cancellationReasons`, served with the
 *    order detail / list / tracking responses).
 *
 * Nothing in this file re-implements either rule. It only normalizes what the
 * API returned and mirrors the server's note constraints so the user gets
 * immediate feedback instead of a round-trip validation error.
 */

/** Reason code that requires a free-text note. Matches the backend enum. */
export const OTHER_REASON_CODE = 'other';

/** Mirrors `@MaxLength(200)` on the backend `CancelOrderDto.reasonOther`. */
export const MAX_REASON_NOTE_LENGTH = 200;

export interface CancellationReasonOption {
  code: string;
  label: string;
  requiresNote: boolean;
}

/** `true` only when the backend says this order can still be cancelled. */
export function isOrderCancellable(order: unknown): boolean {
  return (order as { cancellable?: unknown } | null)?.cancellable === true;
}

/** The backend's explanation for why cancelling is unavailable, if any. */
export function getCancellationBlockedReason(order: unknown): string | null {
  const reason = (order as { cancellationBlockedReason?: unknown } | null)
    ?.cancellationBlockedReason;
  return typeof reason === 'string' && reason.trim().length > 0 ? reason : null;
}

/**
 * Normalizes the API's reason catalog into a predictable shape, dropping
 * entries without a usable code. Returns [] when the API supplied nothing —
 * the client deliberately has no hardcoded fallback list, because that is
 * exactly the duplication that let the two sides drift apart.
 */
export function normalizeCancellationReasons(
  raw: unknown,
): CancellationReasonOption[] {
  if (!Array.isArray(raw)) return [];

  const options: CancellationReasonOption[] = [];
  const seen = new Set<string>();

  for (const entry of raw) {
    let code: string | null = null;
    let label: string | null = null;
    let requiresNote: boolean | null = null;

    if (typeof entry === 'string') {
      code = entry.trim();
    } else if (entry && typeof entry === 'object') {
      const obj = entry as Record<string, unknown>;
      const rawCode = obj.code ?? obj.value ?? obj.reason;
      if (typeof rawCode === 'string') code = rawCode.trim();
      if (typeof obj.label === 'string' && obj.label.trim()) {
        label = obj.label.trim();
      }
      if (typeof obj.requiresNote === 'boolean') requiresNote = obj.requiresNote;
    }

    if (!code || seen.has(code)) continue;
    seen.add(code);

    options.push({
      code,
      label: label ?? humanizeReasonCode(code),
      // Trust the backend flag when present; otherwise fall back to the one
      // code that is defined to need a note.
      requiresNote: requiresNote ?? code === OTHER_REASON_CODE,
    });
  }

  return options;
}

/** Last-resort label for a code the backend sent without one. */
function humanizeReasonCode(code: string): string {
  const words = code.replace(/[_-]+/g, ' ').trim();
  if (!words) return code;
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** The code to preselect: the first option the backend offered. */
export function getDefaultReasonCode(
  reasons: CancellationReasonOption[],
): string {
  return reasons[0]?.code ?? '';
}

/** Whether the chosen code needs a note, per the backend's own flag. */
export function reasonRequiresNote(
  reasons: CancellationReasonOption[],
  code: string,
): boolean {
  const match = reasons.find((option) => option.code === code);
  if (match) return match.requiresNote;
  // Unknown code (e.g. the catalog has not loaded yet): only `other` needs one.
  return code === OTHER_REASON_CODE;
}

export interface CancellationSubmission {
  reason: string;
  reasonOther?: string;
}

export type CancellationValidation =
  | { valid: true; payload: CancellationSubmission }
  | { valid: false; error: string };

/**
 * Validates the modal's selection against the backend contract and builds the
 * exact request payload. `reasonOther` is sent only for a code that needs it.
 */
export function validateCancellationSelection(params: {
  reasons: CancellationReasonOption[];
  code: string;
  note: string;
}): CancellationValidation {
  const { reasons, code, note } = params;
  const trimmedCode = code.trim();

  if (!trimmedCode) {
    return { valid: false, error: 'Please select a cancellation reason.' };
  }

  // Never submit a code the backend did not offer.
  if (reasons.length > 0 && !reasons.some((o) => o.code === trimmedCode)) {
    return { valid: false, error: 'Please select a cancellation reason.' };
  }

  if (!reasonRequiresNote(reasons, trimmedCode)) {
    return { valid: true, payload: { reason: trimmedCode } };
  }

  const trimmedNote = note.trim();
  if (!trimmedNote) {
    return { valid: false, error: 'Please describe your reason for cancelling.' };
  }
  if (trimmedNote.length > MAX_REASON_NOTE_LENGTH) {
    return {
      valid: false,
      error: `Please keep your reason under ${MAX_REASON_NOTE_LENGTH} characters.`,
    };
  }

  return {
    valid: true,
    payload: { reason: trimmedCode, reasonOther: trimmedNote },
  };
}
