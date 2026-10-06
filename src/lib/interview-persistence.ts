import type { Interview } from '../types/interview'
import { supabase } from './supabase'

export type InterviewSaveState = 'idle' | 'saving' | 'success' | 'error'

export type InterviewDatabaseInsert = {
  client_id: string
  company_name: string
  segment: string
  frequency_score: number
  urgency_score: number
  payment_score: number
  answers: Interview
  schema_version: 1
}

export class InterviewSaveError extends Error {
  constructor() {
    super('Não foi possível salvar a entrevista. Seus dados continuam armazenados neste dispositivo.')
    this.name = 'InterviewSaveError'
  }
}

export function toInterviewDatabaseInsert(interview: Interview): InterviewDatabaseInsert {
  return {
    client_id: interview.clientId,
    company_name: interview.company.name,
    segment: interview.company.segment === 'Outro' ? interview.company.segmentOther : interview.company.segment,
    frequency_score: interview.scores.frequency,
    urgency_score: interview.scores.urgency,
    payment_score: interview.scores.paymentEvidence,
    answers: interview,
    schema_version: 1,
  }
}

export async function saveInterview(interview: Interview): Promise<{ alreadySaved: boolean }> {
  if (!supabase) throw new InterviewSaveError()

  try {
    // Não solicitar o retorno da linha: o cliente anônimo não possui SELECT.
    const { error } = await supabase
      .from('interviews')
      .insert(toInterviewDatabaseInsert(interview))
      .abortSignal(AbortSignal.timeout(20_000))

    if (error?.code === '23505' && error.message.includes('interviews_client_id_key')) {
      return { alreadySaved: true }
    }
    if (error) throw new InterviewSaveError()
    return { alreadySaved: false }
  } catch {
    // Não propagar detalhes que possam conter respostas ou dados pessoais.
    throw new InterviewSaveError()
  }
}
