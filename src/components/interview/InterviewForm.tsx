import { useEffect, useRef, useState } from 'react'
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FieldPath, SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { CompanySection, ProblemSection } from './CompanyProblemSections'
import { BuyingSection, ClosingSection, InterviewerSection } from './BuyingClosingSections'
import { ImpactSection, UrgencySection } from './ImpactUrgencySections'
import { CurrentSolutionSection, PaymentSection, PreviousAttemptsSection } from './SolutionPaymentSections'
import { InterviewSummary } from './InterviewSummary'
import { emptyInterview } from '../../lib/interview-defaults'
import { clearInterviewDraft, createInterviewDraft, readInterviewDraft, writeInterviewDraft } from '../../lib/interview-draft'
import { interviewSchema } from '../../lib/interview-schema'
import { normalizeInterview } from '../../lib/normalize-interview'
import { saveInterview } from '../../lib/interview-persistence'
import type { InterviewSaveState } from '../../lib/interview-persistence'
import type { Interview, InterviewFormData } from '../../types/interview'

const steps = [
  { title: 'Empresa', fields: ['company.name', 'company.interviewee', 'company.role', 'company.roleOther', 'company.segment', 'company.segmentOther', 'company.teamSize', 'company.operatingTime', 'company.customerType', 'company.channels', 'company.channelOther', 'company.location'], content: <CompanySection /> },
  { title: 'Problema', fields: ['problem.description', 'problem.lastOccurrence', 'problem.frequency', 'problem.timeConsumingActivity', 'problem.categories', 'problem.categoryOther'], content: <ProblemSection /> },
  { title: 'Impacto', fields: ['impact.consequences', 'impact.financialMonthly', 'impact.financialNotEstimated', 'impact.hoursWeekly', 'impact.hoursNotEstimated', 'impact.lostCustomersMonthly', 'impact.lostCustomersNotEstimated', 'impact.other'], content: <ImpactSection /> },
  { title: 'Urgência', fields: ['urgency.rating', 'urgency.reason'], content: <UrgencySection /> },
  { title: 'Solução atual', fields: ['currentSolution.methods', 'currentSolution.toolDetails', 'currentSolution.pain'], content: <CurrentSolutionSection /> },
  { title: 'Tentativas', fields: ['previousAttempts.tried', 'previousAttempts.details', 'previousAttempts.involvedPayment'], content: <PreviousAttemptsSection /> },
  { title: 'Pagamento', fields: ['payment.currentlyPays', 'payment.currentTools', 'payment.monthlyCost', 'payment.preferNotToSay', 'payment.noPaymentReason', 'payment.noPaymentReasonOther'], content: <PaymentSection /> },
  { title: 'Compra', fields: ['buying.improvement', 'buying.decisionMaker'], content: <BuyingSection /> },
  { title: 'Encerramento', fields: ['followUp.otherProblem', 'followUp.allowed', 'followUp.channel', 'followUp.contact'], content: <ClosingSection /> },
  { title: 'Avaliação', fields: ['interviewer.evidenceStrength', 'interviewer.notes'], content: <InterviewerSection /> },
] satisfies { title: string; fields: FieldPath<InterviewFormData>[]; content: React.ReactNode }[]

function DraftBehavior() {
  const { control, setValue } = useFormContext<InterviewFormData>()
  const allowed = useWatch({ control, name: 'followUp.allowed' })
  const tried = useWatch({ control, name: 'previousAttempts.tried' })
  const currentlyPays = useWatch({ control, name: 'payment.currentlyPays' })
  const prefersNotToSay = useWatch({ control, name: 'payment.preferNotToSay' })

  useEffect(() => {
    if (allowed === 'Não') {
      setValue('followUp.channel', '')
      setValue('followUp.contact', '')
    }
  }, [allowed, setValue])

  useEffect(() => {
    if (tried === 'Não') {
      setValue('previousAttempts.details', '')
      setValue('previousAttempts.involvedPayment', '')
    }
  }, [tried, setValue])

  useEffect(() => {
    if (currentlyPays === 'Não') {
      setValue('payment.currentTools', '')
      setValue('payment.monthlyCost', '')
      setValue('payment.preferNotToSay', false)
    } else if (currentlyPays === 'Sim') {
      setValue('payment.noPaymentReason', '')
      setValue('payment.noPaymentReasonOther', '')
    }
  }, [currentlyPays, setValue])

  useEffect(() => {
    if (prefersNotToSay) setValue('payment.monthlyCost', '')
  }, [prefersNotToSay, setValue])

  return null
}

function InterviewFormBody({ onComplete, restored, onClear }: {
  onComplete: (data: InterviewFormData) => void
  restored: boolean
  onClear: () => void
}) {
  const { control, trigger, handleSubmit } = useFormContext<InterviewFormData>()
  const [stepIndex, setStepIndex] = useState(0)
  const currentValues = useWatch({ control })
  const progress = Math.round(((stepIndex + 1) / steps.length) * 100)

  const onSubmit: SubmitHandler<InterviewFormData> = (data) => {
    onComplete(data)
  }

  const onInvalid: SubmitErrorHandler<InterviewFormData> = (errors) => {
    const firstPath = Object.keys(errors)[0]
    if (!firstPath) return
    const errorGroup = firstPath.split('.')[0]
    const index = steps.findIndex((step) => step.fields.some((field) => field.startsWith(`${errorGroup}.`)))
    if (index >= 0) setStepIndex(index)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const next = async () => {
    const isValid = await trigger(steps[stepIndex].fields)
    if (isValid) setStepIndex((index) => Math.min(index + 1, steps.length - 1))
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clearDraft = () => {
    if (!window.confirm('Limpar o rascunho e apagar os dados preenchidos?')) return
    onClear()
    setStepIndex(0)
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-5 sm:px-6 sm:py-9">
      <div className="mx-auto max-w-2xl space-y-5">
        <header className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-blue-800">Product Discovery · PME</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-950">Roteiro de entrevista</h1>
              <p className="mt-2 text-sm text-gray-600">Converse sobre experiências reais e registre o que acontece no dia a dia.</p>
            </div>
            <button type="button" onClick={clearDraft} className="min-h-10 shrink-0 rounded-lg px-3 text-sm font-medium text-gray-600 underline decoration-gray-300 underline-offset-4 hover:text-gray-900">Limpar rascunho</button>
          </div>
          {restored && <p role="status" className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">Rascunho anterior restaurado.</p>}
        </header>

        <div aria-label="Progresso da entrevista" className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-800">Etapa {stepIndex + 1} de {steps.length}: {steps[stepIndex].title}</span>
            <span className="tabular-nums text-gray-500">{progress}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-blue-700 transition-all" style={{ width: `${progress}%` }} /></div>
        </div>

        <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
          {steps[stepIndex].content}
          <div className="mt-4 flex flex-col-reverse gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:justify-between">
            <button type="button" onClick={() => setStepIndex((index) => Math.max(index - 1, 0))} disabled={stepIndex === 0} className="min-h-11 rounded-lg border border-gray-300 px-5 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40">Voltar</button>
            {stepIndex < steps.length - 1 ? <button type="button" onClick={next} className="min-h-11 rounded-lg bg-blue-700 px-5 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">Continuar</button> : <button type="submit" className="min-h-11 rounded-lg bg-blue-700 px-5 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">Finalizar entrevista</button>}
          </div>
        </form>
        <p className="pb-4 text-center text-xs text-gray-500">Rascunho salvo automaticamente neste navegador.</p>
      </div>
      <span className="sr-only" aria-live="polite">{currentValues ? 'Formulário atualizado' : ''}</span>
    </main>
  )
}

export function InterviewForm() {
  const [initialDraft] = useState(readInterviewDraft)
  const [draft, setDraft] = useState(() => initialDraft ?? createInterviewDraft())
  const [interview, setInterview] = useState<Interview | null>(() => initialDraft?.reviewed
    ? normalizeInterview(initialDraft.data, initialDraft.clientId) : null)
  const [saveState, setSaveState] = useState<InterviewSaveState>(() => initialDraft?.persistence ? 'success' : 'idle')
  const saveInFlight = useRef(false)
  const [restored, setRestored] = useState(Boolean(initialDraft))
  const methods = useForm<InterviewFormData>({
    resolver: zodResolver(interviewSchema),
    defaultValues: draft.data,
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
  })
  const { getValues, subscribe } = methods

  useEffect(() => {
    // A entrevista encerrada já foi gravada localmente e não pode mais mudar.
    if (draft.persistence) return
    let timeout: ReturnType<typeof setTimeout> | undefined
    const persistDraft = () => writeInterviewDraft({ ...draft, data: getValues() })
    persistDraft()
    const unsubscribe = subscribe({
      formState: { values: true },
      callback: () => {
        clearTimeout(timeout)
        timeout = setTimeout(persistDraft, 500)
      },
    })
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') persistDraft()
    }
    window.addEventListener('pagehide', persistDraft)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      clearTimeout(timeout)
      unsubscribe()
      window.removeEventListener('pagehide', persistDraft)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [draft, getValues, subscribe])

  const resetInterview = () => {
    clearInterviewDraft()
    const nextDraft = createInterviewDraft()
    methods.reset(emptyInterview)
    writeInterviewDraft(nextDraft)
    setDraft(nextDraft)
    setInterview(null)
    setSaveState('idle')
    saveInFlight.current = false
    setRestored(false)
    window.scrollTo({ top: 0 })
  }

  const completeInterview = (data: InterviewFormData) => {
    const reviewedDraft = { ...draft, data, reviewed: true }
    writeInterviewDraft(reviewedDraft)
    setDraft(reviewedDraft)
    setInterview(normalizeInterview(data, draft.clientId))
    setSaveState('idle')
  }

  const editInterview = () => {
    if (draft.persistence || saveInFlight.current) return
    const editableDraft = { ...draft, data: getValues(), reviewed: false }
    writeInterviewDraft(editableDraft)
    setDraft(editableDraft)
    setSaveState('idle')
    setInterview(null)
  }

  const persistInterview = async () => {
    if (!interview || draft.persistence || saveInFlight.current) return
    saveInFlight.current = true
    setSaveState('saving')
    writeInterviewDraft({ ...draft, data: getValues() })
    try {
      const { alreadySaved } = await saveInterview(interview)
      const savedDraft = {
        ...draft,
        data: getValues(),
        persistence: { savedAt: new Date().toISOString(), alreadySaved },
      }
      writeInterviewDraft(savedDraft)
      setDraft(savedDraft)
      setSaveState('success')
    } catch {
      saveInFlight.current = false
      setSaveState('error')
    }
  }

  const beginNewInterview = () => {
    if (saveInFlight.current && !draft.persistence) return
    if (!window.confirm('Começar uma nova entrevista? Os dados desta entrevista e o rascunho atual serão apagados.')) return
    resetInterview()
  }

  if (interview) return <InterviewSummary interview={interview} saveState={saveState}
    alreadySaved={draft.persistence?.alreadySaved ?? false} onSave={persistInterview}
    onEdit={editInterview} onNew={beginNewInterview} />

  return <FormProvider {...methods}>
    <DraftBehavior />
    <InterviewFormBody onComplete={completeInterview} restored={restored} onClear={resetInterview} />
  </FormProvider>
}
