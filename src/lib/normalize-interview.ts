import type { Interview, InterviewFormData } from '../types/interview'
import { calculateInterviewScores, parseBrazilianAmount } from './interview-scoring'

export function normalizeInterview(data: InterviewFormData, clientId: string): Interview {
  return {
    ...data,
    clientId,
    impact: { ...data.impact, financialMonthly: parseBrazilianAmount(data.impact.financialMonthly) },
    payment: { ...data.payment, monthlyCost: parseBrazilianAmount(data.payment.monthlyCost) },
    urgency: { ...data.urgency, rating: Number(data.urgency.rating) },
    scores: calculateInterviewScores(data),
  }
}
