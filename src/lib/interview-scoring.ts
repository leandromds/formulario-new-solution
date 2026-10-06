import { frequencyOptions } from '../types/interview'
import type { InterviewFormData, InterviewScores } from '../types/interview'

export function frequencyScore(frequency: InterviewFormData['problem']['frequency']): number {
  return frequencyOptions.find((option) => option.value === frequency)?.score ?? 0
}

export function paymentEvidenceScore(data: InterviewFormData): number {
  if (data.payment.currentlyPays === 'Sim') return 5
  if (data.previousAttempts.involvedPayment === 'Sim') return 4

  const spendsOperationalResources = data.currentSolution.methods.some((method) =>
    ['Funcionário responsável', 'Prestador / consultoria', 'Contador'].includes(method),
  )
  const hours = Number(data.impact.hoursWeekly.replace(',', '.'))
  if (spendsOperationalResources || hours >= 4) return 3
  if (data.previousAttempts.tried === 'Sim') return 2
  return 1
}

export function calculateInterviewScores(data: InterviewFormData): InterviewScores {
  return {
    frequency: frequencyScore(data.problem.frequency),
    urgency: Number(data.urgency.rating) || 0,
    paymentEvidence: paymentEvidenceScore(data),
  }
}

export function parseBrazilianAmount(value: string): number | null {
  if (!value.trim()) return null
  let normalized = value.trim().replace(/[^\d,.-]/g, '')
  const comma = normalized.lastIndexOf(',')
  const dot = normalized.lastIndexOf('.')
  if (comma >= 0 && dot >= 0) {
    const decimalSeparator = comma > dot ? ',' : '.'
    const thousandsSeparator = decimalSeparator === ',' ? /\./g : /,/g
    normalized = normalized.replace(thousandsSeparator, '').replace(decimalSeparator, '.')
  } else if (comma >= 0) {
    normalized = normalized.replace(/\./g, '').replace(',', '.')
  } else if (dot >= 0 && !/\.\d{1,2}$/.test(normalized)) {
    normalized = normalized.replace(/\./g, '')
  }
  const amount = Number(normalized)
  return Number.isFinite(amount) ? amount : null
}
