import { useWatch } from 'react-hook-form'
import { ChoiceGroup, ConditionalField, InlineCheck, RadioScale, Section, TextAreaField, TextField } from './Field'
import type { InterviewFormData } from '../../types/interview'

export function ImpactSection() {
  const consequences = useWatch<InterviewFormData, 'impact.consequences'>({ name: 'impact.consequences' }) ?? []
  const hasMoney = consequences.includes('Dinheiro')
  const hasTime = consequences.includes('Tempo')
  const hasLosses = consequences.includes('Clientes') || consequences.includes('Vendas / oportunidades')
  return (
    <Section title="3. Impacto" description="Registre as consequências e estimativas, quando a pessoa conseguir informar.">
      <ChoiceGroup name="impact.consequences" label="Quando isso acontece, o que a empresa perde ou sofre como consequência?" options={['Tempo', 'Dinheiro', 'Clientes', 'Vendas / oportunidades', 'Produtividade', 'Retrabalho', 'Atrasos', 'Sobrecarga', 'Não consegue mensurar', 'Outro']} multiple />
      {consequences.includes('Outro') && <ConditionalField><TextField name="impact.other" label="Qual outra consequência?" required /></ConditionalField>}
      {hasMoney && <ConditionalField>
        <TextField name="impact.financialMonthly" label="Consegue estimar o impacto financeiro aproximado por mês? (R$)" placeholder="Ex.: 1.500,00" />
        <InlineCheck name="impact.financialNotEstimated" label="Não consegue estimar" />
      </ConditionalField>}
      {hasTime && <ConditionalField>
        <TextField name="impact.hoursWeekly" label="Quantas horas por semana aproximadamente são gastas ou perdidas com isso?" type="number" />
        <InlineCheck name="impact.hoursNotEstimated" label="Não consegue estimar" />
      </ConditionalField>}
      {hasLosses && <ConditionalField>
        <TextField name="impact.lostCustomersMonthly" label="Quantos clientes ou oportunidades aproximadamente são perdidos por mês?" type="number" />
        <InlineCheck name="impact.lostCustomersNotEstimated" label="Não consegue estimar" />
      </ConditionalField>}
    </Section>
  )
}

export function UrgencySection() {
  const rating = useWatch<InterviewFormData, 'urgency.rating'>({ name: 'urgency.rating' })
  return (
    <Section title="4. Urgência" description="A escala ajuda a registrar a prioridade percebida hoje.">
      <RadioScale label="Quão importante é resolver esse problema hoje?" required />
      <TextAreaField name="urgency.reason" label="Por que você deu essa nota?" required={Number(rating) >= 4} rows={3} />
    </Section>
  )
}
