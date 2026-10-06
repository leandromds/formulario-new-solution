import { useWatch } from 'react-hook-form'
import { ChoiceGroup, ConditionalField, InlineCheck, Section, SelectField, TextAreaField, TextField } from './Field'
import type { InterviewFormData } from '../../types/interview'

export function CurrentSolutionSection() {
  const methods = useWatch<InterviewFormData, 'currentSolution.methods'>({ name: 'currentSolution.methods' }) ?? []
  const asksForDetails = methods.some((method) => ['Software / sistema', 'Prestador / consultoria', 'Contador', 'Outro'].includes(method))
  return (
    <Section title="5. Solução atual" description="Entenda o que acontece na prática hoje.">
      <ChoiceGroup name="currentSolution.methods" label="Como vocês lidam com esse problema hoje?" options={['Manualmente', 'Papel / caderno', 'Planilha', 'WhatsApp', 'Software / sistema', 'Funcionário responsável', 'Prestador / consultoria', 'Contador', 'Não fazemos nada', 'Outro']} multiple />
      {asksForDetails && <ConditionalField><TextField name="currentSolution.toolDetails" label="Qual ferramenta, sistema ou serviço?" /></ConditionalField>}
      <TextAreaField
        name="currentSolution.pain"
        label="O que mais incomoda na solução atual?"
        required={!methods.includes('Não fazemos nada')}
        rows={4}
      />
    </Section>
  )
}

export function PreviousAttemptsSection() {
  const tried = useWatch<InterviewFormData, 'previousAttempts.tried'>({ name: 'previousAttempts.tried' })
  return (
    <Section title="6. Tentativas anteriores" description="Experiências passadas ajudam a entender o que já foi colocado em prática.">
      <ChoiceGroup name="previousAttempts.tried" label="Você já tentou resolver esse problema de outra forma?" options={['Sim', 'Não']} required />
      {tried === 'Sim' && <ConditionalField>
        <TextAreaField name="previousAttempts.details" label="O que tentou e por que não continuou?" required rows={4} />
        <ChoiceGroup name="previousAttempts.involvedPayment" label="Essa tentativa envolvia alguma solução paga?" options={['Sim', 'Não', 'Não sabe informar']} required />
      </ConditionalField>}
    </Section>
  )
}

export function PaymentSection() {
  const currentlyPays = useWatch<InterviewFormData, 'payment.currentlyPays'>({ name: 'payment.currentlyPays' })
  const prefersNot = useWatch<InterviewFormData, 'payment.preferNotToSay'>({ name: 'payment.preferNotToSay' })
  const noPaymentReason = useWatch<InterviewFormData, 'payment.noPaymentReason'>({ name: 'payment.noPaymentReason' })
  return (
    <Section title="7. Evidência de pagamento" description="Registre gastos e escolhas já feitos, sem perguntar sobre intenção hipotética de compra.">
      <ChoiceGroup name="payment.currentlyPays" label="Hoje vocês pagam alguma ferramenta, pessoa ou serviço para tentar resolver esse problema?" options={['Sim', 'Não']} required />
      {currentlyPays === 'Sim' && <ConditionalField>
        <TextAreaField name="payment.currentTools" label="O que vocês utilizam?" required rows={3} />
        {!prefersNot && <TextField name="payment.monthlyCost" label="Quanto aproximadamente isso custa por mês? (R$)" placeholder="Ex.: 149,00" />}
        <InlineCheck name="payment.preferNotToSay" label="Prefere não informar o valor" />
      </ConditionalField>}
      {currentlyPays === 'Não' && <ConditionalField>
        <SelectField name="payment.noPaymentReason" label="Qual o principal motivo para ainda não contratar uma solução?" options={['Nunca encontrei algo adequado', 'Achei as soluções existentes muito caras', 'Nunca foi prioridade', 'Não sabia que existiam soluções', 'Prefiro resolver internamente', 'Ainda não senti necessidade', 'Outro']} required />
        {noPaymentReason === 'Outro' && <TextField name="payment.noPaymentReasonOther" label="Qual o motivo?" required />}
      </ConditionalField>}
    </Section>
  )
}
