import type { InterviewFormData } from '../types/interview'

export const emptyInterview: InterviewFormData = {
  company: {
    name: '', interviewee: '', role: '', roleOther: '', segment: '', segmentOther: '',
    teamSize: '', operatingTime: '', customerType: '', channels: [], channelOther: '', location: '',
  },
  problem: {
    description: '', lastOccurrence: '', frequency: '', timeConsumingActivity: '', categories: [], categoryOther: '',
  },
  impact: {
    consequences: [], financialMonthly: '', financialNotEstimated: false, hoursWeekly: '',
    hoursNotEstimated: false, lostCustomersMonthly: '', lostCustomersNotEstimated: false, other: '',
  },
  urgency: { rating: '', reason: '' },
  currentSolution: { methods: [], toolDetails: '', pain: '' },
  previousAttempts: { tried: '', details: '', involvedPayment: '' },
  payment: {
    currentlyPays: '', currentTools: '', monthlyCost: '', preferNotToSay: false,
    noPaymentReason: '', noPaymentReasonOther: '',
  },
  buying: { improvement: '', decisionMaker: '' },
  followUp: { otherProblem: '', allowed: '', channel: '', contact: '' },
  interviewer: { evidenceStrength: '', notes: '' },
}
