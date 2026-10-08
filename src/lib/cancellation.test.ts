import { describe, expect, it } from 'vitest';
import {
  MAX_REASON_NOTE_LENGTH,
  getCancellationBlockedReason,
  getDefaultReasonCode,
  isOrderCancellable,
  normalizeCancellationReasons,
  reasonRequiresNote,
  validateCancellationSelection,
} from './cancellation';

/**
 * The backend owns both cancellation rules. These tests pin the client to
 * consuming them, and in particular that the invented `delivery_delayed` code
 * can no longer be submitted.
 */

// Exactly what GET /orders/:id returns as `cancellationReasons`.
const API_REASONS = [
  { code: 'changed_mind', label: 'Changed my mind', requiresNote: false },
  { code: 'ordered_by_mistake', label: 'Ordered by mistake', requiresNote: false },
  { code: 'found_cheaper', label: 'Found a better price', requiresNote: false },
  { code: 'delivery_too_slow', label: 'Delivery taking too long', requiresNote: false },
  { code: 'change_items', label: 'Want to change items/quantity', requiresNote: false },
  { code: 'other', label: 'Other', requiresNote: true },
];

describe('1. Cancel button uses order.cancellable', () => {
  it('follows the backend flag, not the order status', () => {
    expect(isOrderCancellable({ cancellable: true, orderStatus: 'PROCESSING' })).toBe(true);

    // Pre-shipment status, but the backend blocked it (AWB / shipment exists).
    expect(isOrderCancellable({ cancellable: false, orderStatus: 'PROCESSING' })).toBe(false);
    // A status the old client-side list treated as cancellable.
    expect(isOrderCancellable({ cancellable: false, orderStatus: 'PLACED' })).toBe(false);
    // Backend said yes on a status the old list did not know about.
    expect(isOrderCancellable({ cancellable: true, orderStatus: 'SOMETHING_NEW' })).toBe(true);
  });

  it('defaults to not cancellable when the flag is absent or the order is missing', () => {
    expect(isOrderCancellable({ orderStatus: 'PLACED' })).toBe(false);
    expect(isOrderCancellable(null)).toBe(false);
    expect(isOrderCancellable(undefined)).toBe(false);
    // Never coerce a truthy non-true value.
    expect(isOrderCancellable({ cancellable: 'yes' })).toBe(false);
  });

  it('surfaces the backend blocked reason when present', () => {
    expect(
      getCancellationBlockedReason({
        cancellable: false,
        cancellationBlockedReason: 'This order is already packed for dispatch.',
      }),
    ).toBe('This order is already packed for dispatch.');
    expect(getCancellationBlockedReason({ cancellationBlockedReason: null })).toBeNull();
    expect(getCancellationBlockedReason({ cancellationBlockedReason: '  ' })).toBeNull();
  });
});

describe('2. Dropdown uses the API cancellationReasons', () => {
  it('renders exactly what the backend sent, in order', () => {
    const options = normalizeCancellationReasons(API_REASONS);
    expect(options.map((o) => o.code)).toEqual([
      'changed_mind',
      'ordered_by_mistake',
      'found_cheaper',
      'delivery_too_slow',
      'change_items',
      'other',
    ]);
    expect(options[3].label).toBe('Delivery taking too long');
  });

  it('has no hardcoded fallback list when the backend sends nothing', () => {
    expect(normalizeCancellationReasons(undefined)).toEqual([]);
    expect(normalizeCancellationReasons([])).toEqual([]);
    expect(getDefaultReasonCode([])).toBe('');
  });

  it('preselects the first backend-offered reason', () => {
    expect(getDefaultReasonCode(normalizeCancellationReasons(API_REASONS))).toBe(
      'changed_mind',
    );
  });

  it('tolerates bare string codes and skips unusable entries', () => {
    const options = normalizeCancellationReasons([
      'change_items',
      { code: 'other' },
      { label: 'no code here' },
      'change_items',
    ]);
    expect(options.map((o) => o.code)).toEqual(['change_items', 'other']);
    expect(options[0].label).toBe('Change items');
    expect(options[1].requiresNote).toBe(true);
  });
});

describe('3. change_items appears when the backend sends it', () => {
  it('is offered and submittable', () => {
    const options = normalizeCancellationReasons(API_REASONS);
    expect(options.some((o) => o.code === 'change_items')).toBe(true);

    const result = validateCancellationSelection({
      reasons: options,
      code: 'change_items',
      note: '',
    });
    expect(result).toEqual({ valid: true, payload: { reason: 'change_items' } });
  });
});

describe('4. delivery_too_slow is submitted', () => {
  it('builds the payload with the backend code and no note', () => {
    const result = validateCancellationSelection({
      reasons: normalizeCancellationReasons(API_REASONS),
      code: 'delivery_too_slow',
      note: '',
    });
    expect(result).toEqual({
      valid: true,
      payload: { reason: 'delivery_too_slow' },
    });
  });

  it('does not attach reasonOther to a reason that does not need one', () => {
    const result = validateCancellationSelection({
      reasons: normalizeCancellationReasons(API_REASONS),
      code: 'delivery_too_slow',
      note: 'stray text the user typed before switching reason',
    });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.payload.reasonOther).toBeUndefined();
    }
  });
});

describe('5. delivery_delayed is never submitted', () => {
  it('is absent from a backend-driven dropdown', () => {
    expect(
      normalizeCancellationReasons(API_REASONS).map((o) => o.code),
    ).not.toContain('delivery_delayed');
  });

  it('is rejected before any request is made', () => {
    const result = validateCancellationSelection({
      reasons: normalizeCancellationReasons(API_REASONS),
      code: 'delivery_delayed',
      note: '',
    });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBe('Please select a cancellation reason.');
    }
  });

  it('rejects an empty selection too', () => {
    const result = validateCancellationSelection({
      reasons: normalizeCancellationReasons(API_REASONS),
      code: '',
      note: '',
    });
    expect(result.valid).toBe(false);
  });
});

describe('6. other requires a note', () => {
  const reasons = normalizeCancellationReasons(API_REASONS);

  it('follows the backend requiresNote flag', () => {
    expect(reasonRequiresNote(reasons, 'other')).toBe(true);
    expect(reasonRequiresNote(reasons, 'changed_mind')).toBe(false);
  });

  it('blocks submission when the note is missing or blank', () => {
    for (const note of ['', '   ']) {
      const result = validateCancellationSelection({ reasons, code: 'other', note });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toBe('Please describe your reason for cancelling.');
      }
    }
  });

  it('submits the trimmed note when provided', () => {
    const result = validateCancellationSelection({
      reasons,
      code: 'other',
      note: '  Ordered the wrong size  ',
    });
    expect(result).toEqual({
      valid: true,
      payload: { reason: 'other', reasonOther: 'Ordered the wrong size' },
    });
  });

  it('honours requiresNote on a reason other than "other"', () => {
    const custom = normalizeCancellationReasons([
      { code: 'change_items', label: 'Change items', requiresNote: true },
    ]);
    expect(reasonRequiresNote(custom, 'change_items')).toBe(true);
    expect(
      validateCancellationSelection({ reasons: custom, code: 'change_items', note: '' }).valid,
    ).toBe(false);
  });
});

describe('7. the 200-character limit is respected', () => {
  const reasons = normalizeCancellationReasons(API_REASONS);

  it('matches the backend MaxLength', () => {
    expect(MAX_REASON_NOTE_LENGTH).toBe(200);
  });

  it('accepts exactly 200 characters', () => {
    const result = validateCancellationSelection({
      reasons,
      code: 'other',
      note: 'x'.repeat(200),
    });
    expect(result.valid).toBe(true);
  });

  it('rejects 201 characters rather than letting the backend 400', () => {
    const result = validateCancellationSelection({
      reasons,
      code: 'other',
      note: 'x'.repeat(201),
    });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain('200');
    }
  });

  it('measures the trimmed note, so padding alone does not fail', () => {
    const result = validateCancellationSelection({
      reasons,
      code: 'other',
      note: `   ${'x'.repeat(200)}   `,
    });
    expect(result.valid).toBe(true);
  });
});
