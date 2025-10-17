import React, { useState, useEffect } from 'react';
import { Activity, ArrowRight, Clock, CheckCircle } from 'lucide-react';
import { createAutomaton, type WorkflowState, type WorkflowAction, type WorkflowTransition } from '../automaton';
import { supabaseService, type Patient } from '../services/supabaseService';

interface WorkflowPanelProps {
  patient: Patient;
  onStateChange?: (newState: WorkflowState) => void;
}

export function WorkflowPanel({ patient, onStateChange }: WorkflowPanelProps) {
  const [automaton, setAutomaton] = useState(() =>
    createAutomaton(patient.workflow_state, patient.workflow_history)
  );
  const [availableActions, setAvailableActions] = useState<WorkflowTransition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const newAutomaton = createAutomaton(patient.workflow_state, patient.workflow_history);
    setAutomaton(newAutomaton);
    setAvailableActions(newAutomaton.getAvailableActions());
  }, [patient.workflow_state, patient.workflow_history]);

  const handleAction = async (action: WorkflowAction, toState: WorkflowState) => {
    setLoading(true);
    setError(null);

    try {
      const result = automaton.performAction(action);

      if (!result.success) {
        setError(result.error || 'Error al ejecutar la acción');
        return;
      }

      await supabaseService.transitionWorkflowState(
        patient.id,
        patient.workflow_state,
        toState,
        action,
        { timestamp: new Date().toISOString() }
      );

      setAvailableActions(automaton.getAvailableActions());

      if (onStateChange) {
        onStateChange(toState);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error en transición de workflow:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentStateInfo = automaton.getStateInfo(patient.workflow_state);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Flujo Hospitalario</h2>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Estado Actual</span>
          <span className="text-xs text-gray-500">{currentStateInfo.category}</span>
        </div>
        <div className={`${currentStateInfo.color} text-white rounded-lg p-4 shadow-sm`}>
          <h3 className="text-xl font-bold mb-1">{currentStateInfo.name}</h3>
          <p className="text-sm opacity-90">{currentStateInfo.description}</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Acciones Disponibles</h3>
        {availableActions.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-gray-600">Proceso completado o sin acciones disponibles</p>
          </div>
        ) : (
          <div className="space-y-3">
            {availableActions.map((transition, index) => {
              const targetStateInfo = automaton.getStateInfo(transition.to);
              return (
                <button
                  key={index}
                  onClick={() => handleAction(transition.action, transition.to)}
                  disabled={loading}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 rounded-lg transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-800 mb-1">
                      {transition.description}
                    </div>
                    <div className="text-xs text-gray-600 flex items-center gap-2">
                      <span className="font-medium">{currentStateInfo.name}</span>
                      <ArrowRight className="w-3 h-3" />
                      <span className="font-medium">{targetStateInfo.name}</span>
                    </div>
                  </div>
                  <div className={`${targetStateInfo.color} text-white px-3 py-1 rounded-full text-xs font-medium`}>
                    {targetStateInfo.category}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Historial de Estados
        </h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {patient.workflow_history.map((entry, index) => {
            const stateInfo = automaton.getStateInfo(entry.state);
            return (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className={`${stateInfo.color} w-2 h-2 rounded-full flex-shrink-0`}></div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800 text-sm">{stateInfo.name}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(entry.timestamp).toLocaleString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <div className="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded border border-gray-200">
                  {entry.action}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
