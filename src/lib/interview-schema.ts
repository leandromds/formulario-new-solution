import { z } from 'zod'
import type { InterviewFormData } from '../types/interview'

const companySchema = z.object({
  name: z.string(),
  interviewee: z.string(),
  role: z.string(),
  roleOther: z.string(),
  segment: z.string(),
  segmentOther: z.string(),
  teamSize: z.string(),
  operatingTime: z.string(),
  customerType: z.string(),
  channels: z.array(z.string()),
  channelOther: z.string(),
  location: z.string(),
})

const problemSchema = z.object({
  description: z.string(),
  lastOccurrence: z.string(),
  frequency: z.enum(['daily', 'several_times_week', 'weekly', 'several_times_month', 'rarely']).or(z.literal('')),
  timeConsumingActivity: z.string(),
  categories: z.array(z.string()),
  categoryOther: z.string(),
})

const impactSchema = z.object({
  consequences: z.array(z.string()),
  financialMonthly: z.string(),
  financialNotEstimated: z.boolean(),
  hoursWeekly: z.string(),
  hoursNotEstimated: z.boolean(),
  lostCustomersMonthly: z.string(),
  lostCustomersNotEstimated: z.boolean(),
  other: z.string(),
})

const baseInterviewSchema = z.object({
  company: companySchema,
  problem: problemSchema,
  impact: impactSchema,
  urgency: z.object({ rating: z.union([z.number(), z.enum(['1', '2', '3', '4', '5']), z.literal('')]), reason: z.string() }),
  currentSolution: z.object({
    methods: z.array(z.string()),
    toolDetails: z.string(),
    pain: z.string(),
  }),
  previousAttempts: z.object({ tried: z.string().nullable(), details: z.string(), involvedPayment: z.string().nullable() }),
  payment: z.object({
    currentlyPays: z.string().nullable(),
    currentTools: z.string(),
    monthlyCost: z.string(),
    preferNotToSay: z.boolean(),
    noPaymentReason: z.string(),
    noPaymentReasonOther: z.string(),
  }),
  buying: z.object({ improvement: z.string(), decisionMaker: z.string() }),
  followUp: z.object({ otherProblem: z.string(), allowed: z.string().nullable(), channel: z.string(), contact: z.string() }),
  interviewer: z.object({ evidenceStrength: z.string().nullable(), notes: z.string() }),
})

export const interviewDraftSchema = baseInterviewSchema

export const interviewSchema = baseInterviewSchema.superRefine((data, context) => {
  const required = (value: string | null, path: (string | number)[], message = 'Campo obrigatório') => {
    if (!value?.trim()) context.addIssue({ code: 'custom', path, message })
  }

  required(data.company.name, ['company', 'name'])
  required(data.company.interviewee, ['company', 'interviewee'])
  required(data.company.role, ['company', 'role'])
  required(data.company.teamSize, ['company', 'teamSize'])
  if (data.company.role === 'Outro') required(data.company.roleOther, ['company', 'roleOther'])
  if (data.company.segment === 'Outro') required(data.company.segmentOther, ['company', 'segmentOther'])
  if (data.company.channels.includes('Outro')) required(data.company.channelOther, ['company', 'channelOther'])

  required(data.problem.description, ['problem', 'description'])
  required(data.problem.lastOccurrence, ['problem', 'lastOccurrence'])
  if (!data.problem.frequency) required('', ['problem', 'frequency'])
  if (data.problem.categories.includes('Outro')) required(data.problem.categoryOther, ['problem', 'categoryOther'])

  if (data.impact.consequences.includes('Dinheiro') && !data.impact.financialMonthly && !data.impact.financialNotEstimated) {
    required('', ['impact', 'financialMonthly'], 'Informe uma estimativa ou marque “Não consegue estimar”')
  }
  if (data.impact.consequences.includes('Tempo') && !data.impact.hoursWeekly && !data.impact.hoursNotEstimated) {
    required('', ['impact', 'hoursWeekly'], 'Informe uma estimativa ou marque “Não consegue estimar”')
  }
  if ((data.impact.consequences.includes('Clientes') || data.impact.consequences.includes('Vendas / oportunidades')) && !data.impact.lostCustomersMonthly && !data.impact.lostCustomersNotEstimated) {
    required('', ['impact', 'lostCustomersMonthly'], 'Informe uma estimativa ou marque “Não consegue estimar”')
  }
  if (data.impact.consequences.includes('Outro')) required(data.impact.other, ['impact', 'other'])

  const urgencyRating = Number(data.urgency.rating)
  if (!data.urgency.rating || urgencyRating < 1 || urgencyRating > 5) {
    required('', ['urgency', 'rating'], 'Escolha uma nota de 1 a 5')
  }
  if (urgencyRating >= 4) {
    required(data.urgency.reason, ['urgency', 'reason'])
  }

  if (!data.currentSolution.methods.includes('Não fazemos nada')) {
    required(data.currentSolution.pain, ['currentSolution', 'pain'])
  }
  if (data.currentSolution.methods.includes('Outro')) required(data.currentSolution.toolDetails, ['currentSolution', 'toolDetails'])
  required(data.previousAttempts.tried, ['previousAttempts', 'tried'])
  if (data.previousAttempts.tried === 'Sim') {
    required(data.previousAttempts.details, ['previousAttempts', 'details'])
    required(data.previousAttempts.involvedPayment, ['previousAttempts', 'involvedPayment'])
  }
  required(data.payment.currentlyPays, ['payment', 'currentlyPays'])
  if (data.payment.currentlyPays === 'Sim') required(data.payment.currentTools, ['payment', 'currentTools'])
  if (data.payment.currentlyPays === 'Não') {
    required(data.payment.noPaymentReason, ['payment', 'noPaymentReason'])
    if (data.payment.noPaymentReason === 'Outro') required(data.payment.noPaymentReasonOther, ['payment', 'noPaymentReasonOther'])
  }

  required(data.buying.improvement, ['buying', 'improvement'])
  required(data.buying.decisionMaker, ['buying', 'decisionMaker'])
  required(data.followUp.allowed, ['followUp', 'allowed'])
  if (data.followUp.allowed === 'Sim') {
    required(data.followUp.channel, ['followUp', 'channel'])
    required(data.followUp.contact, ['followUp', 'contact'])
  }
  required(data.interviewer.evidenceStrength, ['interviewer', 'evidenceStrength'])
})

export function asInterviewFormData(data: unknown): InterviewFormData | null {
  const parsed = interviewDraftSchema.safeParse(data)
  return parsed.success ? (parsed.data as InterviewFormData) : null
}
