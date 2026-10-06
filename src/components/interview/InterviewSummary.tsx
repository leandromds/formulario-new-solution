import { frequencyOptions } from '../../types/interview'
import type { Interview } from '../../types/interview'
import type { InterviewSaveState } from '../../lib/interview-persistence'
import { Section } from './Field'

function SummaryItem({ label, children }: { label: string; children: string | number | null | undefined }) {
  const value = typeof children === 'string' ? children.trim() : children
  if (value === null || value === undefined || value === '') return null
  return <div><dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</dt><dd className="mt-1 whitespace-pre-wrap text-sm text-gray-900">{value}</dd></div>
}

function Score({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-center">
    <div className="text-3xl font-bold tabular-nums text-blue-900">{value}<span className="text-base font-medium text-blue-700">/5</span></div>
    <div className="mt-1 text-sm font-medium text-blue-900">{label}</div>
  </div>
}

export function InterviewSummary({ interview, saveState, alreadySaved, onSave, onEdit, onNew }: {
  interview: Interview
  saveState: InterviewSaveState
  alreadySaved: boolean
  onSave: () => void
  onEdit: () => void
  onNew: () => void
}) {
  const frequency = frequencyOptions.find((option) => option.value === interview.problem.frequency)?.label
  const segment = interview.company.segment === 'Outro' ? interview.company.segmentOther : interview.company.segment
  const role = interview.company.role === 'Outro' ? interview.company.roleOther : interview.company.role
  const financialImpact = interview.impact.consequences.includes('Dinheiro')
    ? interview.impact.financialNotEstimated ? 'Não consegue estimar' : interview.impact.financialMonthly === null ? '' : `R$ ${interview.impact.financialMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} por mês`
    : ''

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl space-y-5">
        <header className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <p className="text-sm font-semibold text-blue-800">Entrevista finalizada</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-950">Resumo da entrevista</h1>
          <p className="mt-2 text-sm text-gray-600">Confira as respostas e os indicadores calculados.</p>
        </header>

        <section aria-label="Indicadores" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Score label="Frequência" value={interview.scores.frequency} />
          <Score label="Urgência" value={interview.scores.urgency} />
          <Score label="Evidência de pagamento" value={interview.scores.paymentEvidence} />
        </section>

        <Section title="Empresa">
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <SummaryItem label="Empresa">{interview.company.name}</SummaryItem>
            <SummaryItem label="Segmento">{segment}</SummaryItem>
            <SummaryItem label="Entrevistado">{interview.company.interviewee}</SummaryItem>
            <SummaryItem label="Função">{role}</SummaryItem>
            <SummaryItem label="Equipe">{interview.company.teamSize}</SummaryItem>
            <SummaryItem label="Localização">{interview.company.location}</SummaryItem>
          </dl>
        </Section>

        <Section title="Problema">
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2"><SummaryItem label="Dor principal">{interview.problem.description}</SummaryItem></div>
            <SummaryItem label="Última ocorrência">{interview.problem.lastOccurrence}</SummaryItem>
            <SummaryItem label="Frequência">{frequency}</SummaryItem>
            <SummaryItem label="Categorias">{[...interview.problem.categories.filter((item) => item !== 'Outro'), ...(interview.problem.categories.includes('Outro') ? [interview.problem.categoryOther] : [])].join(', ')}</SummaryItem>
            <SummaryItem label="Atividade que mais toma tempo">{interview.problem.timeConsumingActivity}</SummaryItem>
          </dl>
        </Section>

        <Section title="Impacto e urgência">
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <SummaryItem label="Consequências">{interview.impact.consequences.join(', ')}</SummaryItem>
            <SummaryItem label="Impacto financeiro estimado">{financialImpact}</SummaryItem>
            <SummaryItem label="Horas por semana">{interview.impact.hoursNotEstimated ? 'Não consegue estimar' : interview.impact.hoursWeekly ? `${interview.impact.hoursWeekly} h` : ''}</SummaryItem>
            <SummaryItem label="Clientes/oportunidades perdidos por mês">{interview.impact.lostCustomersNotEstimated ? 'Não consegue estimar' : interview.impact.lostCustomersMonthly}</SummaryItem>
            <SummaryItem label="Nota de urgência">{interview.urgency.rating}</SummaryItem>
            <div className="sm:col-span-2"><SummaryItem label="Motivo da nota">{interview.urgency.reason}</SummaryItem></div>
          </dl>
        </Section>

        <Section title="Soluções e pagamento">
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <SummaryItem label="Solução atual">{interview.currentSolution.methods.join(', ')}</SummaryItem>
            <SummaryItem label="Ferramenta ou serviço">{interview.currentSolution.toolDetails}</SummaryItem>
            <div className="sm:col-span-2"><SummaryItem label="O que incomoda na solução">{interview.currentSolution.pain}</SummaryItem></div>
            <SummaryItem label="Tentativas anteriores">{interview.previousAttempts.tried === 'Sim' ? interview.previousAttempts.details : interview.previousAttempts.tried}</SummaryItem>
            <SummaryItem label="Tentativa paga">{interview.previousAttempts.involvedPayment}</SummaryItem>
            <SummaryItem label="Já paga atualmente?">{interview.payment.currentlyPays}</SummaryItem>
            <SummaryItem label="Ferramenta/pessoa/serviço pago">{interview.payment.currentTools}</SummaryItem>
            <SummaryItem label="Gasto atual">{interview.payment.currentlyPays === 'Sim' ? interview.payment.preferNotToSay ? 'Preferiu não informar' : interview.payment.monthlyCost === null ? '' : `R$ ${interview.payment.monthlyCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} por mês` : interview.payment.noPaymentReason === 'Outro' ? interview.payment.noPaymentReasonOther : interview.payment.noPaymentReason}</SummaryItem>
          </dl>
        </Section>

        <Section title="Compra, encerramento e avaliação">
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2"><SummaryItem label="O que faria valer o investimento">{interview.buying.improvement}</SummaryItem></div>
            <SummaryItem label="Decisor">{interview.buying.decisionMaker}</SummaryItem>
            <SummaryItem label="Outro problema mencionado">{interview.followUp.otherProblem}</SummaryItem>
            <SummaryItem label="Permite contato futuro">{interview.followUp.allowed}</SummaryItem>
            <SummaryItem label="Canal e contato">{interview.followUp.allowed === 'Sim' ? `${interview.followUp.channel}: ${interview.followUp.contact}` : ''}</SummaryItem>
            <SummaryItem label="Força da evidência">{interview.interviewer.evidenceStrength}</SummaryItem>
            <div className="sm:col-span-2"><SummaryItem label="Observações do entrevistador">{interview.interviewer.notes}</SummaryItem></div>
          </dl>
        </Section>

        <footer className="space-y-3 pb-4" aria-busy={saveState === 'saving'}>
          {saveState === 'success' && <p role="status" className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
            {alreadySaved ? 'Esta entrevista já parece ter sido salva.' : 'Entrevista salva com sucesso.'}
          </p>}
          {saveState === 'error' && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
            Não foi possível salvar a entrevista. Seus dados continuam armazenados neste dispositivo.
          </p>}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            {saveState !== 'success' && <button type="button" onClick={onEdit} disabled={saveState === 'saving'} className="min-h-11 rounded-lg border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">Editar entrevista</button>}
            <button type="button" onClick={onNew} disabled={saveState === 'saving'} className={`min-h-11 rounded-lg px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${saveState === 'success' ? 'bg-blue-700 text-white hover:bg-blue-800' : 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-50'}`}>Nova entrevista</button>
            <button type="button" onClick={onSave} disabled={saveState === 'saving' || saveState === 'success'} className="min-h-11 rounded-lg bg-blue-700 px-5 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              {saveState === 'saving' ? 'Salvando...' : saveState === 'success' ? 'Entrevista salva' : saveState === 'error' ? 'Tentar novamente' : 'Salvar entrevista'}
            </button>
          </div>
        </footer>
      </div>
    </main>
  )
}
