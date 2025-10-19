const WORKFLOW_TRANSITIONS = [
  {
    from: 'INICIO',
    to: 'REGISTRO_PACIENTE',
    action: 'REGISTRAR',
    description: 'Registrar nuevo paciente o paciente existente',
  },
  {
    from: 'REGISTRO_PACIENTE',
    to: 'TRIAJE',
    action: 'EVALUAR_URGENCIA',
    description: 'Evaluar nivel de urgencia del paciente',
  },
  {
    from: 'TRIAJE',
    to: 'SALA_ESPERA',
    action: 'PASAR_ESPERA',
    description: 'Paciente pasa a sala de espera',
  },
  {
    from: 'SALA_ESPERA',
    to: 'ASIGNACION_MEDICO',
    action: 'ASIGNAR_DOCTOR',
    description: 'Asignar médico disponible',
  },
  {
    from: 'ASIGNACION_MEDICO',
    to: 'CONSULTA_INICIAL',
    action: 'INICIAR_CONSULTA',
    description: 'Iniciar consulta médica',
  },
  {
    from: 'CONSULTA_INICIAL',
    to: 'DIAGNOSTICO_PRELIMINAR',
    action: 'EVALUAR_SINTOMAS',
    description: 'Evaluar síntomas y realizar diagnóstico preliminar',
  },
  {
    from: 'DIAGNOSTICO_PRELIMINAR',
    to: 'SOLICITUD_EXAMENES',
    action: 'SOLICITAR_EXAMENES',
    description: 'Solicitar exámenes médicos adicionales',
  },
  {
    from: 'DIAGNOSTICO_PRELIMINAR',
    to: 'DIAGNOSTICO_FINAL',
    action: 'SALTAR_EXAMENES',
    description: 'Diagnóstico claro, no requiere exámenes',
  },
  {
    from: 'SOLICITUD_EXAMENES',
    to: 'REALIZACION_EXAMENES',
    action: 'REALIZAR_EXAMENES',
    description: 'Realizar exámenes solicitados',
  },
  {
    from: 'REALIZACION_EXAMENES',
    to: 'ESPERA_RESULTADOS',
    action: 'ESPERAR_RESULTADOS',
    description: 'Esperar procesamiento de resultados',
  },
  {
    from: 'ESPERA_RESULTADOS',
    to: 'REVISION_RESULTADOS',
    action: 'REVISAR_RESULTADOS',
    description: 'Revisar resultados de exámenes',
  },
  {
    from: 'REVISION_RESULTADOS',
    to: 'DIAGNOSTICO_FINAL',
    action: 'EMITIR_DIAGNOSTICO',
    description: 'Emitir diagnóstico final basado en resultados',
  },
  {
    from: 'DIAGNOSTICO_FINAL',
    to: 'PRESCRIPCION_TRATAMIENTO',
    action: 'PRESCRIBIR_TRATAMIENTO',
    description: 'Prescribir tratamiento médico',
  },
  {
    from: 'PRESCRIPCION_TRATAMIENTO',
    to: 'FARMACIA',
    action: 'DESPACHAR_MEDICAMENTO',
    description: 'Despachar medicamentos en farmacia',
  },
  {
    from: 'PRESCRIPCION_TRATAMIENTO',
    to: 'HOSPITALIZACION',
    action: 'HOSPITALIZAR',
    description: 'Hospitalizar paciente para tratamiento',
  },
  {
    from: 'PRESCRIPCION_TRATAMIENTO',
    to: 'SEGUIMIENTO',
    action: 'SALTAR_HOSPITALIZACION',
    description: 'Tratamiento ambulatorio, no requiere hospitalización',
  },
  {
    from: 'FARMACIA',
    to: 'SEGUIMIENTO',
    action: 'DAR_SEGUIMIENTO',
    description: 'Iniciar seguimiento del tratamiento',
  },
  {
    from: 'HOSPITALIZACION',
    to: 'CIRUGIA',
    action: 'PROGRAMAR_CIRUGIA',
    description: 'Programar cirugía',
  },
  {
    from: 'HOSPITALIZACION',
    to: 'RECUPERACION',
    action: 'SALTAR_CIRUGIA',
    description: 'No requiere cirugía, pasar a recuperación',
  },
  {
    from: 'CIRUGIA',
    to: 'RECUPERACION',
    action: 'RECUPERAR',
    description: 'Pasar a recuperación post-quirúrgica',
  },
  {
    from: 'RECUPERACION',
    to: 'SEGUIMIENTO',
    action: 'DAR_SEGUIMIENTO',
    description: 'Iniciar seguimiento post-hospitalización',
  },
  {
    from: 'SEGUIMIENTO',
    to: 'ALTA_MEDICA',
    action: 'DAR_ALTA',
    description: 'Dar alta médica al paciente',
  },
  {
    from: 'ALTA_MEDICA',
    to: 'CITA_CONTROL',
    action: 'PROGRAMAR_CONTROL',
    description: 'Programar cita de control',
  },
  {
    from: 'CITA_CONTROL',
    to: 'FIN',
    action: 'FINALIZAR',
    description: 'Finalizar proceso médico',
  },
];

class HospitalAutomaton {
  constructor(initialState = 'INICIO') {
    this.currentState = initialState;
    this.history = [];
  }

  getCurrentState() {
    return this.currentState;
  }

  getHistory() {
    return [...this.history];
  }

  getAvailableActions() {
    return WORKFLOW_TRANSITIONS.filter((t) => t.from === this.currentState);
  }

  canPerformAction(action) {
    return WORKFLOW_TRANSITIONS.some(
      (t) => t.from === this.currentState && t.action === action
    );
  }

  performAction(action, metadata) {
    const transition = WORKFLOW_TRANSITIONS.find(
      (t) => t.from === this.currentState && t.action === action
    );

    if (!transition) {
      return {
        success: false,
        error: `Acción "${action}" no válida desde el estado "${this.currentState}"`,
      };
    }

    const oldState = this.currentState;
    this.currentState = transition.to;

    this.history.push({
      state: transition.to,
      timestamp: new Date().toISOString(),
      action,
      metadata,
    });

    return {
      success: true,
      newState: this.currentState,
    };
  }

  setState(state, history) {
    this.currentState = state;
    if (history) {
      this.history = history;
    }
  }

  reset() {
    this.currentState = 'INICIO';
    this.history = [];
  }

  getStateInfo(state) {
    const stateInfoMap = {
      INICIO: {
        name: 'Inicio',
        description: 'Estado inicial del proceso',
        category: 'Registro',
        color: 'bg-slate-500',
      },
      REGISTRO_PACIENTE: {
        name: 'Registro de Paciente',
        description: 'Registro de datos del paciente',
        category: 'Registro',
        color: 'bg-blue-500',
      },
      TRIAJE: {
        name: 'Triaje',
        description: 'Evaluación de urgencia',
        category: 'Evaluación',
        color: 'bg-yellow-500',
      },
      SALA_ESPERA: {
        name: 'Sala de Espera',
        description: 'Paciente en espera de atención',
        category: 'Espera',
        color: 'bg-gray-500',
      },
      ASIGNACION_MEDICO: {
        name: 'Asignación de Médico',
        description: 'Asignación de médico tratante',
        category: 'Asignación',
        color: 'bg-cyan-500',
      },
      CONSULTA_INICIAL: {
        name: 'Consulta Inicial',
        description: 'Primera consulta médica',
        category: 'Consulta',
        color: 'bg-green-500',
      },
      DIAGNOSTICO_PRELIMINAR: {
        name: 'Diagnóstico Preliminar',
        description: 'Evaluación inicial de síntomas',
        category: 'Diagnóstico',
        color: 'bg-orange-500',
      },
      SOLICITUD_EXAMENES: {
        name: 'Solicitud de Exámenes',
        description: 'Solicitud de pruebas diagnósticas',
        category: 'Exámenes',
        color: 'bg-teal-500',
      },
      REALIZACION_EXAMENES: {
        name: 'Realización de Exámenes',
        description: 'Ejecución de pruebas médicas',
        category: 'Exámenes',
        color: 'bg-teal-600',
      },
      ESPERA_RESULTADOS: {
        name: 'Espera de Resultados',
        description: 'Procesamiento de resultados',
        category: 'Exámenes',
        color: 'bg-teal-700',
      },
      REVISION_RESULTADOS: {
        name: 'Revisión de Resultados',
        description: 'Análisis de resultados de exámenes',
        category: 'Exámenes',
        color: 'bg-teal-800',
      },
      DIAGNOSTICO_FINAL: {
        name: 'Diagnóstico Final',
        description: 'Diagnóstico definitivo',
        category: 'Diagnóstico',
        color: 'bg-red-500',
      },
      PRESCRIPCION_TRATAMIENTO: {
        name: 'Prescripción de Tratamiento',
        description: 'Prescripción médica',
        category: 'Tratamiento',
        color: 'bg-pink-500',
      },
      FARMACIA: {
        name: 'Farmacia',
        description: 'Despacho de medicamentos',
        category: 'Tratamiento',
        color: 'bg-emerald-500',
      },
      HOSPITALIZACION: {
        name: 'Hospitalización',
        description: 'Ingreso hospitalario',
        category: 'Hospitalización',
        color: 'bg-violet-500',
      },
      CIRUGIA: {
        name: 'Cirugía',
        description: 'Procedimiento quirúrgico',
        category: 'Hospitalización',
        color: 'bg-fuchsia-500',
      },
      RECUPERACION: {
        name: 'Recuperación',
        description: 'Recuperación post-tratamiento',
        category: 'Hospitalización',
        color: 'bg-lime-500',
      },
      SEGUIMIENTO: {
        name: 'Seguimiento',
        description: 'Monitoreo del paciente',
        category: 'Seguimiento',
        color: 'bg-sky-500',
      },
      ALTA_MEDICA: {
        name: 'Alta Médica',
        description: 'Alta del paciente',
        category: 'Finalización',
        color: 'bg-green-600',
      },
      CITA_CONTROL: {
        name: 'Cita de Control',
        description: 'Programación de control',
        category: 'Finalización',
        color: 'bg-blue-600',
      },
      FIN: {
        name: 'Fin',
        description: 'Proceso finalizado',
        category: 'Finalización',
        color: 'bg-slate-700',
      },
    };

    return stateInfoMap[state] || {
      name: state,
      description: 'Estado desconocido',
      category: 'Desconocido',
      color: 'bg-gray-500',
    };
  }
}

function createAutomaton(currentState, history) {
  const automaton = new HospitalAutomaton(currentState);
  if (history) {
    automaton.setState(currentState || 'INICIO', history);
  }
  return automaton;
}

module.exports = {
  WORKFLOW_TRANSITIONS,
  HospitalAutomaton,
  createAutomaton,
};

export { HospitalAutomaton, createAutomaton }