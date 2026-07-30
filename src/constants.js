export const CATEGORIAS = [
  { value: 'INFRAESTRUTURA', label: 'Infraestrutura', descricaoCurta: 'Redes, servidores, cloud e hardware' },
  { value: 'DESENVOLVIMENTO', label: 'Desenvolvimento', descricaoCurta: 'Sistemas, APIs, aplicações e automações' },
  { value: 'SUPORTE', label: 'Suporte', descricaoCurta: 'Atendimento técnico e chamados internos' },
  { value: 'MANUTENCAO', label: 'Manutenção', descricaoCurta: 'Correções, melhorias e atualizações' },
  { value: 'OUTROS', label: 'Outros', descricaoCurta: 'Iniciativas que não se enquadram acima' }
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