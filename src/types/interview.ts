export const frequencyOptions = [
  { value: 'daily', label: 'Todos os dias', score: 5 },
  { value: 'several_times_week', label: 'Algumas vezes por semana', score: 4 },
  { value: 'weekly', label: 'Aproximadamente uma vez por semana', score: 3 },
  { value: 'several_times_month', label: 'Algumas vezes por mês', score: 2 },
  { value: 'rarely', label: 'Raramente', score: 1 },
] as const

export type Frequency = (typeof frequencyOptions)[number]['value']
export type InterviewFormData = {
  company: {
    name: string
    interviewee: string
    role: string
    roleOther: string
    segment: string
    segmentOther: string
    teamSize: string
    operatingTime: string
    customerType: string
    channels: string[]
    channelOther: string
    location: string
  }
  problem: {
    description: string
    lastOccurrence: string
    frequency: Frequency | ''
    timeConsumingActivity: string
    categories: string[]
    categoryOther: string
  }
  impact: {
    consequences: string[]
    financialMonthly: string
    financialNotEstimated: boolean
    hoursWeekly: string
    hoursNotEstimated: boolean
    lostCustomersMonthly: string
    lostCustomersNotEstimated: boolean
    other: string
  }
  urgency: { rating: number | '' | '1' | '2' | '3' | '4' | '5'; reason: string }
  currentSolution: { methods: string[]; toolDetails: string; pain: string }
  previousAttempts: { tried: string | null; details: string; involvedPayment: string | null }
  payment: {
    currentlyPays: string | null
    currentTools: string
    monthlyCost: string
    preferNotToSay: boolean
    noPaymentReason: string
    noPaymentReasonOther: string
  }
  buying: { improvement: string; decisionMaker: string }
  followUp: { otherProblem: string; allowed: string | null; channel: string; contact: string }
  interviewer: { evidenceStrength: string | null; notes: string }
}

export type InterviewScores = {
  frequency: number
  urgency: number
  paymentEvidence: number
}

export type Interview = Omit<InterviewFormData, 'impact' | 'payment' | 'urgency'> & {
  clientId: string
  impact: Omit<InterviewFormData['impact'], 'financialMonthly'> & {
    financialMonthly: number | null
  }
  payment: Omit<InterviewFormData['payment'], 'monthlyCost'> & { monthlyCost: number | null }
  urgency: { rating: number; reason: string }
  scores: InterviewScores
}
