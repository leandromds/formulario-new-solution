import { useWatch } from 'react-hook-form'
import { ChoiceGroup, ConditionalField, Section, SelectField, TextAreaField, TextField } from './Field'
import type { InterviewFormData } from '../../types/interview'

export function CompanySection() {
  const { role, segment, channels } = useWatch<InterviewFormData, 'company'>({ name: 'company' })
  return (
    <Section title="1. Empresa" description="Vamos começar entendendo o contexto do negócio.">
      <TextField name="company.name" label="Nome da empresa" required />
      <TextField name="company.interviewee" label="Nome do entrevistado" required />
      <SelectField name="company.role" label="Função do entrevistado" options={['Proprietário / Sócio', 'Gestor', 'Comercial / Vendas', 'Administrativo / Financeiro', 'Atendimento', 'Outro']} required />
      {role === 'Outro' && <ConditionalField><TextField name="company.roleOther" label="Qual é a função?" required /></ConditionalField>}
      <SelectField name="company.segment" label="Segmento" options={['Alimentação', 'Beleza / Estética', 'Comércio / Varejo', 'Construção', 'Educação', 'Saúde', 'Serviços profissionais', 'Serviços automotivos', 'Tecnologia', 'Turismo / Hospedagem', 'Outro']} />
      {segment === 'Outro' && <ConditionalField><TextField name="company.segmentOther" label="Qual é o segmento?" required /></ConditionalField>}
      <SelectField name="company.teamSize" label="Tamanho da equipe" options={['Somente o proprietário', '2–5', '6–10', '11–20', '21–50', '51+']} required />
      <SelectField name="company.operatingTime" label="Tempo de operação" options={['Menos de 1 ano', '1–2 anos', '3–5 anos', '6–10 anos', 'Mais de 10 anos']} />
      <SelectField name="company.customerType" label="Tipo predominante de cliente" options={['B2C', 'B2B', 'Ambos']} />
      <ChoiceGroup name="company.channels" label="Principais canais de venda/atendimento" options={['WhatsApp', 'Instagram', 'Loja física', 'Telefone', 'Site', 'Marketplace', 'E-mail', 'Indicação', 'Outro']} multiple />
      {channels?.includes('Outro') && <ConditionalField><TextField name="company.channelOther" label="Qual outro canal?" required /></ConditionalField>}
      <TextField name="company.location" label="Cidade / bairro" />
    </Section>
  )
}

export function ProblemSection() {
  const { categories } = useWatch<InterviewFormData, 'problem'>({ name: 'problem' })
  return (
    <Section title="2. Problema" description="Comece pela experiência espontânea, sem sugerir categorias.">
      <TextAreaField name="problem.description" label="Pensando no dia a dia da empresa, qual problema mais atrapalha o negócio atualmente?" required rows={5} />
      <TextAreaField name="problem.lastOccurrence" label="Quando isso aconteceu pela última vez? O que aconteceu?" required rows={4} />
      <SelectField name="problem.frequency" label="Com que frequência isso acontece?" options={[
        { value: 'daily', label: 'Todos os dias' },
        { value: 'several_times_week', label: 'Algumas vezes por semana' },
        { value: 'weekly', label: 'Aproximadamente uma vez por semana' },
        { value: 'several_times_month', label: 'Algumas vezes por mês' },
        { value: 'rarely', label: 'Raramente' },
      ]} required />
      <TextAreaField name="problem.timeConsumingActivity" label="Qual atividade mais toma seu tempo atualmente?" rows={3} />
      <div className="space-y-2 border-t border-gray-100 pt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-800">Preenchimento do entrevistador</p>
        <ChoiceGroup name="problem.categories" label="Categoria da dor (selecione todas as aplicáveis)" options={['Vendas', 'Atendimento', 'Financeiro', 'Cobrança', 'Operação / Processos', 'Marketing', 'Pessoas', 'Tributário', 'Tecnologia', 'Outro']} multiple />
        {categories?.includes('Outro') && <ConditionalField><TextField name="problem.categoryOther" label="Qual outra categoria?" required /></ConditionalField>}
      </div>
    </Section>
  )
}
