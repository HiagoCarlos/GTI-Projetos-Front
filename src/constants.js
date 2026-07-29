export const CATEGORIAS = [
  { value: 'INFRAESTRUTURA', label: 'Infraestrutura' },
  { value: 'DESENVOLVIMENTO', label: 'Desenvolvimento' },
  { value: 'SUPORTE', label: 'Suporte' },
  { value: 'MANUTENCAO', label: 'Manutenção' },
  { value: 'OUTROS', label: 'Outros' }
]

export const STATUS = [
  { value: 'PLANEJADO', label: 'Planejado' },
  { value: 'EM_ANDAMENTO', label: 'Em andamento' },
  { value: 'CONCLUIDO', label: 'Concluído' },
  { value: 'CANCELADO', label: 'Cancelado' }
]

export function labelStatus(value) {
  return STATUS.find((s) => s.value === value)?.label || value
}

export function labelCategoria(value) {
  return CATEGORIAS.find((c) => c.value === value)?.label || value
}
