// Reaproveita CARGOS/labelCargo já existentes em constants.js -- não duplica.
import { CARGOS, labelCargo } from './constants'

export { CARGOS, labelCargo }

// Hierarquia: Analista só visualiza; Coordenador cria/edita;
// Vice-Diretor e Diretor têm acesso total (incl. excluir e gerenciar Responsáveis).
const NIVEL = {
  ANALISTA: 1,
  COORDENADOR: 2,
  VICE_DIRETOR: 3,
  DIRETOR: 3
}

export function podeCriar(cargo) {
  return (NIVEL[cargo] ?? 0) >= 2
}

export function podeEditar(cargo) {
  return (NIVEL[cargo] ?? 0) >= 2
}

export function podeExcluir(cargo) {
  return (NIVEL[cargo] ?? 0) >= 3
}

export function podeGerenciarResponsaveis(cargo) {
  return (NIVEL[cargo] ?? 0) >= 3
}