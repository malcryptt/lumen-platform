/**
 * Per-user request queue for Gemini API rate limiting.
 * MVP: max 1 heavy Gemini call in-flight per user.
 * Max 20 heavy calls/day per user. Resets at midnight UTC.
 */

interface UserQuota {
    inFlight: boolean;
    dailyCount: number;
    resetDate: string; // YYYY-MM-DD UTC
}

const quotas = new Map<string, UserQuota>();
const MAX_DAILY = 20;

function getTodayUTC(): string {
    return new Date().toISOString().slice(0, 10);
}

function getQuota(userId: string): UserQuota {
    let q = quotas.get(userId);
    const today = getTodayUTC();

    if (!q || q.resetDate !== today) {
        q = { inFlight: false, dailyCount: 0, resetDate: today };
        quotas.set(userId, q);
    }
    return q;
}

export interface RateLimitResult {
    allowed: boolean;
    reason?: string;
    waitMs?: number;
}

/**
 * Check if a user can make a heavy AI call.
 * Call releaseSlot() after the request completes.
 */
export function acquireSlot(userId: string): RateLimitResult {
    const q = getQuota(userId);

    if (q.inFlight) {
        return { allowed: false, reason: 'A scan or generation is already in progress. Please wait.', waitMs: 5000 };
    }

    if (q.dailyCount >= MAX_DAILY) {
        const msUntilReset = new Date(`${getTodayUTC()}T23:59:59Z`).getTime() - Date.now();
        return {
            allowed: false,
            reason: `Daily AI budget exhausted (${MAX_DAILY} calls/day). Resets at midnight UTC.`,
            waitMs: msUntilReset
        };
    }

    q.inFlight = true;
    q.dailyCount++;
    quotas.set(userId, q);
    return { allowed: true };
}

/**
 * Release the in-flight slot for a user after a Gemini call completes.
 */
export function releaseSlot(userId: string): void {
    const q = quotas.get(userId);
    if (q) {
        q.inFlight = false;
        quotas.set(userId, q);
    }
}

/**
 * Get current quota status for a user.
 */
export function getQuotaStatus(userId: string): { remaining: number; inFlight: boolean } {
    const q = getQuota(userId);
    return {
        remaining: Math.max(0, MAX_DAILY - q.dailyCount),
        inFlight: q.inFlight
    };
}
