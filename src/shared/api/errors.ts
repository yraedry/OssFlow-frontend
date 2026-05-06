import type { ApiError } from './client'

const ERROR_MESSAGES: Record<string, string> = {
  POSITION_NOT_FOUND: 'Posición no encontrada',
  POSITION_NAME_DUPLICATE: 'Ya existe una posición con ese nombre',
  TECHNIQUE_NOT_FOUND: 'Técnica no encontrada',
  INVALID_STATE_TRANSITION: 'Transición de estado no válida',
  PROFILE_NOT_FOUND: 'Perfil no encontrado',
  PROFILE_ALREADY_EXISTS: 'El perfil ya existe',
  PRIMARY_FEDERATION_REQUIRED: 'Se requiere una federación primaria',
  MULTIPLE_PRIMARY_FEDERATIONS: 'Solo puede haber una federación primaria',
}

export function getErrorMessage(err: ApiError): string {
  return ERROR_MESSAGES[err.code] ?? err.message
}
