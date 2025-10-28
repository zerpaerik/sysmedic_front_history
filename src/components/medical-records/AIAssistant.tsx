import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Bot, 
  Sparkles, 
  Loader2, 
  CheckCircle, 
  AlertTriangle,
  Stethoscope,
  FileText,
  Target,
  Eye,
  Calendar,
  X
} from 'lucide-react';
import { aiService, MedicalSuggestions, MedicalSuggestionsRequest } from '@/services/aiService';
import { toast } from 'sonner';

interface AIAssistantProps {
  specialty: string;
  patientAge?: number;
  patientGender?: string;
  currentFindings?: string;
  vitalSigns?: string;
  onSuggestionInsert?: (field: string, value: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  specialty,
  patientAge,
  patientGender,
  currentFindings,
  vitalSigns,
  onSuggestionInsert,
  isOpen,
  onClose
}) => {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<MedicalSuggestions | null>(null);

  const handleGenerateSuggestions = async () => {
    if (!symptoms.trim()) {
      toast.error('Por favor, describe los síntomas del paciente');
      return;
    }

    setLoading(true);
    try {
      const request: MedicalSuggestionsRequest = {
        symptoms: symptoms.trim(),
        specialty,
        patientAge,
        patientGender,
        currentFindings,
        vitalSigns
      };

      const result = await aiService.generateMedicalSuggestions(request);
      setSuggestions(result);
      toast.success('Sugerencias generadas exitosamente');
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error(error instanceof Error ? error.message : 'Error al generar sugerencias');
    } finally {
      setLoading(false);
    }
  };

  const handleInsertSuggestion = (field: string, value: string) => {
    if (onSuggestionInsert) {
      onSuggestionInsert(field, value);
      toast.success(`Sugerencia insertada en ${field}`);
    }
  };

  const renderSuggestionSection = (
    title: string,
    items: string[],
    icon: React.ReactNode,
    color: string,
    field: string
  ) => (
    <div className={`border-l-4 ${color} pl-4 mb-6`}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h4 className="font-semibold text-gray-800">{title}</h4>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-start justify-between bg-gray-50 p-3 rounded-lg">
            <span className="text-sm text-gray-700 flex-1">{item}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleInsertSuggestion(field, item)}
              className="ml-2 text-xs"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Usar
            </Button>
          </div>
        ))}
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot className="w-6 h-6" />
              <div>
                <CardTitle className="text-xl">Asistente de IA Médica</CardTitle>
                <p className="text-blue-100 text-sm">
                  Especialidad: {specialty} | {patientAge ? `Edad: ${patientAge} años` : ''} {patientGender ? `| Género: ${patientGender}` : ''}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Input de síntomas */}
          <div className="mb-6">
            <Label htmlFor="symptoms" className="text-base font-medium mb-2 block">
              Describe los síntomas del paciente
            </Label>
            <Textarea
              id="symptoms"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Ej: Dolor abdominal en epigastrio, náuseas, vómitos, fiebre de 38.5°C desde hace 2 días..."
              className="min-h-[100px] resize-none"
              disabled={loading}
            />
          </div>

          {/* Botón generar */}
          <div className="mb-6">
            <Button
              onClick={handleGenerateSuggestions}
              disabled={loading || !symptoms.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generando sugerencias...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generar Sugerencias con IA
                </>
              )}
            </Button>
          </div>

          {/* Sugerencias */}
          {suggestions && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-800">Sugerencias Generadas</span>
                </div>
                <p className="text-sm text-blue-700">
                  Las siguientes sugerencias son generadas por IA y deben ser evaluadas por criterio médico profesional.
                  Haz clic en "Usar" para insertar una sugerencia en el formulario.
                </p>
              </div>

              {renderSuggestionSection(
                'Diagnósticos Diferenciales',
                suggestions.differentialDiagnosis,
                <Target className="w-4 h-4 text-red-600" />,
                'border-red-500',
                'diagnosis'
              )}

              {renderSuggestionSection(
                'Exámenes Recomendados',
                suggestions.recommendedTests,
                <FileText className="w-4 h-4 text-blue-600" />,
                'border-blue-500',
                'tests'
              )}

              {renderSuggestionSection(
                'Sugerencias de Tratamiento',
                suggestions.treatmentSuggestions,
                <Stethoscope className="w-4 h-4 text-green-600" />,
                'border-green-500',
                'treatment'
              )}

              {renderSuggestionSection(
                'Señales de Alarma',
                suggestions.redFlags,
                <AlertTriangle className="w-4 h-4 text-orange-600" />,
                'border-orange-500',
                'redFlags'
              )}

              {renderSuggestionSection(
                'Enfoque del Examen Físico',
                suggestions.physicalExamFocus,
                <Eye className="w-4 h-4 text-purple-600" />,
                'border-purple-500',
                'physicalExam'
              )}

              {renderSuggestionSection(
                'Recomendaciones de Seguimiento',
                suggestions.followUpRecommendations,
                <Calendar className="w-4 h-4 text-indigo-600" />,
                'border-indigo-500',
                'followUp'
              )}
            </div>
          )}

          {/* Disclaimer */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Importante:</p>
                <p>
                  Las sugerencias generadas por IA son herramientas de apoyo y no reemplazan el juicio clínico profesional.
                  Siempre valida y adapta las sugerencias según tu experiencia médica y el contexto específico del paciente.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
