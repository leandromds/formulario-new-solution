import { useWatch, useFormContext } from 'react-hook-form'
import { ChoiceGroup, ConditionalField, Section, SelectField, TextAreaField, TextField } from './Field'
import type { InterviewFormData } from '../../types/interview'

export function BuyingSection() {
  return (
    <Section title="8. Critério de compra" description="Concentre-se no que precisaria mudar para o investimento fazer sentido.">
      <TextAreaField name="buying.improvement" label="O que uma solução precisaria melhorar para valer o investimento?" required rows={4} />
      <SelectField name="buying.decisionMaker" label="Quem normalmente decide quando a empresa compra uma ferramenta ou contrata um serviço desse tipo?" options={['Eu', 'Outro sócio', 'Eu + outro sócio', 'Gestor', 'Financeiro', 'Matriz / Franqueador', 'Outro']} required />
    </Section>
  )
}

export function ClosingSection() {
  const allowed = useWatch<InterviewFormData, 'followUp.allowed'>({ name: 'followUp.allowed' })
  const channel = useWatch<InterviewFormData, 'followUp.channel'>({ name: 'followUp.channel' })
  const { setValue } = useFormContext<InterviewFormData>()
  const chooseChannel = (value: string) => {
    setValue('followUp.channel', value, { shouldValidate: true })
    setValue('followUp.contact', '')
  }
  return (
    <Section title="9. Encerramento" description="Feche a conversa sem pressionar por um próximo contato.">
      <TextAreaField name="followUp.otherProblem" label="Existe algum outro problema importante da empresa que não conversamos?" rows={3} />
      <ChoiceGroup name="followUp.allowed" label="Posso falar com você novamente caso eu queira entender melhor esse problema ou testar alguma solução?" options={['Sim', 'Não']} required />
      {allowed === 'Sim' && <ConditionalField>
        <fieldset>
          <legend className="text-sm font-medium text-gray-800">Canal preferido</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {['WhatsApp', 'E-mail', 'Telefone'].map((item) => (
              <button key={item} type="button" onClick={() => chooseChannel(item)} aria-pressed={channel === item} className={`min-h-11 rounded-lg border px-4 text-sm font-medium ${channel === item ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}>{item}</button>
            ))}
          </div>
        </fieldset>
        {channel && <TextField name="followUp.contact" label={channel === 'E-mail' ? 'E-mail para contato' : channel === 'Telefone' ? 'Telefone para contato' : 'WhatsApp para contato'} type={channel === 'E-mail' ? 'email' : 'text'} required />}
      </ConditionalField>}
    </Section>
  )
}

export function InterviewerSection() {
  return (
    <Section title="10. Avaliação do entrevistador" description="Anotações internas, separadas das respostas do empresário.">
      <ChoiceGroup name="interviewer.evidenceStrength" label="Força da evidência da dor" options={['Fraca', 'Moderada', 'Forte']} required />
      <TextAreaField name="interviewer.notes" label="Observações do entrevistador" placeholder="Ex.: relatou perder aproximadamente 10 orçamentos/mês; usa WhatsApp + planilha; já testou CRM de R$149/mês e cancelou porque era complexo." rows={5} />
    </Section>
  )
}
