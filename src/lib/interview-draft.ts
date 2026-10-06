import { z } from 'zod'
import { emptyInterview } from './interview-defaults'
import { asInterviewFormData, interviewSchema } from './interview-schema'
import type { InterviewFormData } from '../types/interview'

export const INTERVIEW_DRAFT_KEY = 'pme-discovery-interview-draft:v1'

export type InterviewDraft = {
  clientId: string
  data: InterviewFormData
  reviewed: boolean
  persistence: { savedAt: string; alreadySaved: boolean } | null
}

export function createInterviewDraft(data: InterviewFormData = emptyInterview): InterviewDraft {
  return { clientId: crypto.randomUUID(), data, reviewed: false, persistence: null }
}

export function readInterviewDraft(): InterviewDraft | null {
  try {
    const serialized = localStorage.getItem(INTERVIEW_DRAFT_KEY)
    if (!serialized) return null
    const stored: unknown = JSON.parse(serialized)
    if (!stored || typeof stored !== 'object') return null

    if (!('clientId' in stored)) {
      // Preservar os rascunhos da Etapa 1 usando a mesma chave de armazenamento.
      const legacyData = asInterviewFormData(stored)
      return legacyData ? createInterviewDraft(legacyData) : null
    }

    const parsed = z.object({
      clientId: z.uuid(),
      data: z.unknown(),
      reviewed: z.boolean(),
      persistence: z.object({ savedAt: z.iso.datetime(), alreadySaved: z.boolean() }).nullable(),
    }).safeParse(stored)
    if (!parsed.success) return null
    const data = asInterviewFormData(parsed.data.data)
    if (!data) return null
    const validInterview = interviewSchema.safeParse(data).success
    if (parsed.data.persistence && !validInterview) return null

    return {
      clientId: parsed.data.clientId,
      data,
      reviewed: validInterview && (parsed.data.reviewed || Boolean(parsed.data.persistence)),
      persistence: parsed.data.persistence,
    }
  } catch {
    return null
  }
}

export function writeInterviewDraft(draft: InterviewDraft): void {
  try {
    // Mesmo um rascunho vazio preserva o identificador da entrevista após reload.
    localStorage.setItem(INTERVIEW_DRAFT_KEY, JSON.stringify(draft))
  } catch {
    // Rascunhos continuam disponíveis durante a sessão se o armazenamento estiver indisponível.
  }
}

export function clearInterviewDraft(): void {
  try {
    localStorage.removeItem(INTERVIEW_DRAFT_KEY)
  } catch {
    // O formulário continua utilizável se o armazenamento estiver indisponível.
  }
}
