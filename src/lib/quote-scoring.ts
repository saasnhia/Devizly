/**
 * Quote scoring algorithm — predicts probability of signature.
 *
 * Score based on behavioral signals (total 100 points):
 *  +30 pts : Quote opened at least once
 *  +20 pts : Quote opened 3+ times
 *  +15 pts : Opened within 48h of send
 *  +10 pts : Client has history of signing (rate > 50%)
 *  +10 pts : Amount within client's usual range (±30%)
 *  -10 pts : Quote expired past 50%
 *  -15 pts : Never opened after 7 days
 *  -20 pts : Never opened after 14 days
 *  +5  pts : Deposit proposed
 */

interface ScoreInput {
  // Quote data
  status: string;
  viewCount: number;
  viewedAt: string | null;
  createdAt: string;
  validUntil: string | null;
  depositPercent: number | null;
  totalTtc: number;
  // Client history
  clientSignedCount: number;
  clientTotalCount: number;
  clientAvgAmount: number | null;
}

export interface ScoreSignal {
  label: string;
  points: number;
  positive: boolean;
}

export interface QuoteScore {
  score: number;
  signals: ScoreSignal[];
  level: "hot" | "warm" | "cold";
  advice: string | null;
}

export function calculateQuoteScore(input: ScoreInput): QuoteScore {
  const signals: ScoreSignal[] = [];
  let score = 50; // Base score

  const now = new Date();
  const created = new Date(input.createdAt);
  const daysSinceCreated = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));

  // +30: Opened at least once
  if (input.viewCount >= 1) {
    signals.push({ label: "Devis consult\u00e9 par le client", points: 30, positive: true });
    score += 30;
  }

  // +20: Opened 3+ times
  if (input.viewCount >= 3) {
    signals.push({ label: `Consult\u00e9 ${input.viewCount} fois`, points: 20, positive: true });
    score += 20;
  }

  // +15: Opened within 48h of send
  if (input.viewedAt) {
    const viewed = new Date(input.viewedAt);
    const hoursToOpen = (viewed.getTime() - created.getTime()) / (1000 * 60 * 60);
    if (hoursToOpen <= 48) {
      signals.push({ label: "Ouvert dans les 48h", points: 15, positive: true });
      score += 15;
    }
  }

  // +10: Client history > 50% signature rate
  if (input.clientTotalCount >= 2) {
    const rate = input.clientSignedCount / input.clientTotalCount;
    if (rate > 0.5) {
      signals.push({ label: `Client fiable (${Math.round(rate * 100)}% sign\u00e9s)`, points: 10, positive: true });
      score += 10;
    }
  }

  // +10: Amount within client's usual range
  if (input.clientAvgAmount !== null && input.clientAvgAmount > 0) {
    const ratio = input.totalTtc / input.clientAvgAmount;
    if (ratio >= 0.7 && ratio <= 1.3) {
      signals.push({ label: "Montant dans la fourchette habituelle", points: 10, positive: true });
      score += 10;
    }
  }

  // +5: Deposit proposed
  if (input.depositPercent && input.depositPercent > 0) {
    signals.push({ label: `Acompte ${input.depositPercent}% propos\u00e9`, points: 5, positive: true });
    score += 5;
  }

  // -10: Quote validity expired past 50%
  if (input.validUntil) {
    const validDate = new Date(input.validUntil);
    const totalDays = Math.floor((validDate.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    if (totalDays > 0) {
      const elapsed = daysSinceCreated / totalDays;
      if (elapsed > 0.5 && elapsed <= 1) {
        signals.push({ label: "Validit\u00e9 bient\u00f4t expir\u00e9e", points: -10, positive: false });
        score -= 10;
      } else if (elapsed > 1) {
        signals.push({ label: "Devis expir\u00e9", points: -15, positive: false });
        score -= 15;
      }
    }
  }

  // -15/-20: Never opened after 7/14 days
  if (input.viewCount === 0 && input.status === "envoy\u00e9") {
    if (daysSinceCreated > 14) {
      signals.push({ label: "Jamais ouvert depuis 14 jours", points: -20, positive: false });
      score -= 20;
    } else if (daysSinceCreated > 7) {
      signals.push({ label: "Jamais ouvert depuis 7 jours", points: -15, positive: false });
      score -= 15;
    }
  }

  // Clamp 0-100
  score = Math.max(0, Math.min(100, score));

  const level: QuoteScore["level"] = score >= 70 ? "hot" : score >= 40 ? "warm" : "cold";

  // Actionable advice
  let advice: string | null = null;
  if (input.viewCount === 0 && daysSinceCreated > 3) {
    advice = "Ce devis n\u2019a pas \u00e9t\u00e9 ouvert \u2014 relancez le client par email ou t\u00e9l\u00e9phone.";
  } else if (input.viewCount >= 3 && input.status === "envoy\u00e9") {
    advice = "Le client a consult\u00e9 le devis plusieurs fois \u2014 appelez-le pour conclure.";
  } else if (score < 30) {
    advice = "Score faible \u2014 envisagez de proposer un ajustement de prix ou un acompte r\u00e9duit.";
  }

  return { score, signals, level, advice };
}
