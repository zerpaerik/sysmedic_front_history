import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { MedicalRecord, MedicalRecordStatus } from '@/types/medicalRecord';
import { Patient } from '@/types/patient';

export class PDFService {
  private static instance: PDFService;

  public static getInstance(): PDFService {
    if (!PDFService.instance) {
      PDFService.instance = new PDFService();
    }
    return PDFService.instance;
  }

  async generateMedicalRecordPDF(
    medicalRecord: MedicalRecord,
    patient: Patient | null,
    medicalHistory: any,
    specialtyHistory: any,
    companyName?: string
  ): Promise<void> {
    try {
      // Convertir firma a base64 si existe
      let signatureBase64 = '';
      if (medicalRecord.professional.signatureUrl) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://back-history-production.up.railway.app';
          const fullSignatureUrl = `${apiUrl}${medicalRecord.professional.signatureUrl}`;
          console.log('Loading signature from:', fullSignatureUrl);
          
          signatureBase64 = await this.imageUrlToBase64(fullSignatureUrl);
          console.log('Signature loaded successfully, base64 length:', signatureBase64.length);
        } catch (error) {
          console.error('Error loading signature image:', error);
          console.error('Signature URL was:', medicalRecord.professional.signatureUrl);
        }
      } else {
        console.log('No signature URL found for professional:', medicalRecord.professional.fullName);
      }

      // Crear un elemento HTML temporal para el PDF
      const pdfContent = this.createPDFContent(medicalRecord, patient, medicalHistory, specialtyHistory, signatureBase64, companyName);
      
      // Crear un contenedor temporal en el DOM
      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = pdfContent;
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '210mm'; // A4 width
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.padding = '20px';
      tempContainer.style.fontFamily = 'Arial, sans-serif';
      
      document.body.appendChild(tempContainer);

      // Generar canvas del contenido
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794, // A4 width in pixels at 96 DPI
        height: tempContainer.scrollHeight
      });

      // Crear PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Agregar primera página
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Agregar páginas adicionales si es necesario
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Limpiar elemento temporal
      document.body.removeChild(tempContainer);

      // Descargar PDF
      const fileName = `Historia_Clinica_HC-${medicalRecord.recordNumber}_${patient?.firstName || 'Paciente'}_${patient?.firstLastname || ''}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Error al generar el PDF');
    }
  }

  private async imageUrlToBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL('image/png');
            console.log('Image converted to base64 successfully');
            resolve(dataUrl);
          } else {
            reject(new Error('Could not get canvas context'));
          }
        } catch (error) {
          console.error('Error converting image to base64:', error);
          reject(error);
        }
      };
      
      img.onerror = (error) => {
        console.error('Failed to load image from URL:', url, error);
        reject(new Error(`Failed to load image from: ${url}`));
      };
      
      // Importante: setear src después de los event listeners
      img.src = url;
    });
  }

  private createPDFContent(
    medicalRecord: MedicalRecord,
    patient: Patient | null,
    medicalHistory: any,
    specialtyHistory: any,
    signatureBase64: string = '',
    companyName?: string
  ): string {
    const formatDate = (date: Date | string) => {
      return new Date(date).toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const hasTriageData = (medicalRecord: MedicalRecord): boolean => {
      return !!(medicalRecord.triage && (
        medicalRecord.triage.weight ||
        medicalRecord.triage.height ||
        medicalRecord.triage.bloodPressure ||
        medicalRecord.triage.oxygenSaturation ||
        medicalRecord.triage.heartRate ||
        medicalRecord.triage.temperature ||
        medicalRecord.triage.observations
      ));
    };

    return `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px; page-break-inside: avoid;">
          ${companyName ? `<p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600; opacity: 0.95;">${companyName}</p>` : ''}
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">HISTORIA CLÍNICA</h1>
          <h2 style="margin: 10px 0 0 0; font-size: 20px; opacity: 0.9;">HC-${medicalRecord.recordNumber}</h2>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.8;">Sistema de Gestión Médica - SYSMEDIC</p>
        </div>

        <!-- Información del Paciente -->
        <div style="margin-bottom: 25px; padding: 20px; background: #f8f9ff; border-left: 5px solid #4f46e5; border-radius: 8px; page-break-inside: avoid;">
          <h3 style="margin: 0 0 15px 0; color: #4f46e5; font-size: 18px; display: flex; align-items: center;">
            <span style="display: inline-block; width: 20px; height: 20px; background: #4f46e5; border-radius: 50%; margin-right: 10px;"></span>
            INFORMACIÓN DEL PACIENTE
          </h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
              <strong>Nombre Completo:</strong><br>
              ${patient ? `${patient.firstName} ${patient.secondName || ''} ${patient.firstLastname} ${patient.secondLastname || ''}`.trim() : `${medicalRecord.patient.firstName} ${medicalRecord.patient.firstLastname}`}
            </div>
            <div>
              <strong>DNI:</strong><br>
              ${patient?.identificationNumber || medicalRecord.patient.identificationNumber}
            </div>
            ${patient?.email ? `
            <div>
              <strong>Email:</strong><br>
              ${patient.email}
            </div>
            ` : ''}
            ${patient?.phone ? `
            <div>
              <strong>Teléfono:</strong><br>
              ${patient.phone}
            </div>
            ` : ''}
          </div>
        </div>

        <!-- Información de la Consulta -->
        <div style="margin-bottom: 25px; padding: 20px; background: #f0f9ff; border-left: 5px solid #0ea5e9; border-radius: 8px; page-break-inside: avoid;">
          <h3 style="margin: 0 0 15px 0; color: #0ea5e9; font-size: 18px; display: flex; align-items: center;">
            <span style="display: inline-block; width: 20px; height: 20px; background: #0ea5e9; border-radius: 50%; margin-right: 10px;"></span>
            INFORMACIÓN DE LA CONSULTA
          </h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
              <strong>Especialidad:</strong><br>
              ${medicalRecord.specialty.name}
            </div>
            <div>
              <strong>Profesional:</strong><br>
              Dr. ${medicalRecord.professional.firstName} ${medicalRecord.professional.firstLastname}
            </div>
            <div>
              <strong>Fecha:</strong><br>
              ${medicalRecord.appointmentDate ? formatDate(medicalRecord.appointmentDate) : 'No especificada'}
            </div>
            <div>
              <strong>Estado:</strong><br>
              <span style="padding: 4px 8px; border-radius: 12px; background: #dcfce7; color: #166534; font-size: 12px;">
                ${medicalRecord.status === MedicalRecordStatus.COMPLETED ? 'Completada' : medicalRecord.status}
              </span>
            </div>
          </div>
        </div>

        ${hasTriageData(medicalRecord) && medicalRecord.triage ? `
        <!-- Triaje -->
        <div style="margin-bottom: 25px; padding: 20px; background: #f0fdf4; border-left: 5px solid #22c55e; border-radius: 8px; page-break-inside: avoid;">
          <h3 style="margin: 0 0 15px 0; color: #22c55e; font-size: 18px; display: flex; align-items: center;">
            <span style="display: inline-block; width: 20px; height: 20px; background: #22c55e; border-radius: 50%; margin-right: 10px;"></span>
            TRIAJE
          </h3>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
            ${medicalRecord.triage.weight ? `
            <div style="padding: 10px; background: white; border-radius: 6px; border: 1px solid #bbf7d0;">
              <strong style="color: #059669;">Peso:</strong><br>
              ${medicalRecord.triage.weight} kg
            </div>
            ` : ''}
            ${medicalRecord.triage.height ? `
            <div style="padding: 10px; background: white; border-radius: 6px; border: 1px solid #bbf7d0;">
              <strong style="color: #059669;">Talla:</strong><br>
              ${medicalRecord.triage.height} cm
            </div>
            ` : ''}
            ${medicalRecord.triage.bloodPressure ? `
            <div style="padding: 10px; background: white; border-radius: 6px; border: 1px solid #bbf7d0;">
              <strong style="color: #059669;">Presión Arterial:</strong><br>
              ${medicalRecord.triage.bloodPressure}
            </div>
            ` : ''}
            ${medicalRecord.triage.oxygenSaturation ? `
            <div style="padding: 10px; background: white; border-radius: 6px; border: 1px solid #bbf7d0;">
              <strong style="color: #059669;">Saturación O₂:</strong><br>
              ${medicalRecord.triage.oxygenSaturation}%
            </div>
            ` : ''}
            ${medicalRecord.triage.heartRate ? `
            <div style="padding: 10px; background: white; border-radius: 6px; border: 1px solid #bbf7d0;">
              <strong style="color: #059669;">Freq. Cardíaca:</strong><br>
              ${medicalRecord.triage.heartRate} lpm
            </div>
            ` : ''}
            ${medicalRecord.triage.temperature ? `
            <div style="padding: 10px; background: white; border-radius: 6px; border: 1px solid #bbf7d0;">
              <strong style="color: #059669;">Temperatura:</strong><br>
              ${medicalRecord.triage.temperature}°C
            </div>
            ` : ''}
          </div>
          ${medicalRecord.triage.observations ? `
          <div style="margin-top: 15px; padding: 15px; background: white; border-radius: 6px; border: 1px solid #bbf7d0;">
            <strong style="color: #059669;">Observaciones:</strong><br>
            ${medicalRecord.triage.observations}
          </div>
          ` : ''}
        </div>
        ` : ''}

        ${medicalHistory ? `
        <!-- Antecedentes Médicos -->
        <div style="margin-bottom: 25px; padding: 20px; background: #fefce8; border-left: 5px solid #eab308; border-radius: 8px; page-break-inside: avoid;">
          <h3 style="margin: 0 0 15px 0; color: #eab308; font-size: 18px; display: flex; align-items: center;">
            <span style="display: inline-block; width: 20px; height: 20px; background: #eab308; border-radius: 50%; margin-right: 10px;"></span>
            ANTECEDENTES MÉDICOS
          </h3>
          
          ${medicalHistory.personalHistory ? `
          <div style="margin-bottom: 15px; padding: 15px; background: white; border-radius: 6px; border: 1px solid #fde047;">
            <strong style="color: #a16207;">Antecedentes Personales:</strong><br>
            ${medicalHistory.personalHistory}
          </div>
          ` : ''}
          
          ${medicalHistory.chronicDiseases ? `
          <div style="margin-bottom: 15px; padding: 15px; background: white; border-radius: 6px; border: 1px solid #fde047;">
            <strong style="color: #a16207;">Enfermedades Crónicas:</strong><br>
            ${medicalHistory.chronicDiseases}
          </div>
          ` : ''}
          
          ${medicalHistory.allergies ? `
          <div style="margin-bottom: 15px; padding: 15px; background: white; border-radius: 6px; border: 1px solid #fde047;">
            <strong style="color: #a16207;">Alergias:</strong><br>
            ${medicalHistory.allergies}
          </div>
          ` : ''}
          
          ${medicalHistory.surgicalHistory ? `
          <div style="margin-bottom: 15px; padding: 15px; background: white; border-radius: 6px; border: 1px solid #fde047;">
            <strong style="color: #a16207;">Antecedentes Quirúrgicos:</strong><br>
            ${medicalHistory.surgicalHistory}
          </div>
          ` : ''}
          
          ${medicalHistory.medications ? `
          <div style="margin-bottom: 15px; padding: 15px; background: white; border-radius: 6px; border: 1px solid #fde047;">
            <strong style="color: #a16207;">Medicamentos:</strong><br>
            ${medicalHistory.medications}
          </div>
          ` : ''}
          
          ${medicalHistory.familyHistory ? `
          <div style="margin-bottom: 15px; padding: 15px; background: white; border-radius: 6px; border: 1px solid #fde047;">
            <strong style="color: #a16207;">Antecedentes Familiares:</strong><br>
            ${medicalHistory.familyHistory}
          </div>
          ` : ''}
        </div>
        ` : ''}

        ${specialtyHistory ? `
        <!-- Historia Clínica por Especialidad -->
        <div style="margin-bottom: 25px; padding: 20px; background: #fdf2f8; border-left: 5px solid #ec4899; border-radius: 8px; page-break-inside: avoid;">
          <h3 style="margin: 0 0 15px 0; color: #ec4899; font-size: 18px; display: flex; align-items: center;">
            <span style="display: inline-block; width: 20px; height: 20px; background: #ec4899; border-radius: 50%; margin-right: 10px;"></span>
            HISTORIA CLÍNICA - ${medicalRecord.specialty.name.toUpperCase()}
          </h3>
          
          ${specialtyHistory.chiefComplaint ? `
          <div style="margin-bottom: 15px; padding: 15px; background: white; border-radius: 6px; border: 1px solid #fbcfe8;">
            <strong style="color: #be185d;">Motivo de Consulta:</strong><br>
            ${specialtyHistory.chiefComplaint}
          </div>
          ` : ''}
          
          ${specialtyHistory.currentIllness ? `
          <div style="margin-bottom: 15px; padding: 15px; background: white; border-radius: 6px; border: 1px solid #fbcfe8;">
            <strong style="color: #be185d;">Enfermedad Actual:</strong><br>
            ${specialtyHistory.currentIllness}
          </div>
          ` : ''}
          
          ${specialtyHistory.systemsReview ? `
          <div style="margin-bottom: 15px; padding: 15px; background: white; border-radius: 6px; border: 1px solid #fbcfe8;">
            <strong style="color: #be185d;">Revisión por Sistemas:</strong><br>
            ${specialtyHistory.systemsReview}
          </div>
          ` : ''}
          
          ${specialtyHistory.generalPhysicalExam ? `
          <div style="margin-bottom: 15px; padding: 15px; background: white; border-radius: 6px; border: 1px solid #fbcfe8;">
            <strong style="color: #be185d;">Examen Físico General:</strong><br>
            ${specialtyHistory.generalPhysicalExam}
          </div>
          ` : ''}
          
          ${specialtyHistory.diagnoses && Array.isArray(specialtyHistory.diagnoses) && specialtyHistory.diagnoses.length > 0 ? `
          <div style="margin-bottom: 15px; padding: 15px; background: white; border-radius: 6px; border: 1px solid #fbcfe8;">
            <strong style="color: #be185d;">Diagnósticos:</strong><br>
            ${specialtyHistory.diagnoses.map((diagnosis: any, index: number) => `
              <div style="margin: 10px 0; padding: 10px; background: #fce7f3; border-radius: 4px;">
                <span style="background: #ec4899; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-right: 8px;">
                  ${diagnosis.type || 'Diagnóstico'}
                </span>
                <span style="background: #be185d; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">
                  ${diagnosis.certainty || 'Sin especificar'}
                </span>
                <br><br>
                ${diagnosis.description}
              </div>
            `).join('')}
          </div>
          ` : ''}
          
          ${specialtyHistory.treatmentPlan ? `
          <div style="margin-bottom: 15px; padding: 15px; background: white; border-radius: 6px; border: 1px solid #fbcfe8;">
            <strong style="color: #be185d;">Plan de Tratamiento:</strong><br>
            ${specialtyHistory.treatmentPlan}
          </div>
          ` : ''}
          
          ${specialtyHistory.observations ? `
          <div style="margin-bottom: 15px; padding: 15px; background: white; border-radius: 6px; border: 1px solid #fbcfe8;">
            <strong style="color: #be185d;">Observaciones:</strong><br>
            ${specialtyHistory.observations}
          </div>
          ` : ''}
        </div>
        ` : ''}

        <!-- Información de Registro -->
        <div style="margin-bottom: 25px; padding: 20px; background: #f1f5f9; border-left: 5px solid #64748b; border-radius: 8px; page-break-inside: avoid;">
          <h3 style="margin: 0 0 15px 0; color: #64748b; font-size: 18px; display: flex; align-items: center;">
            <span style="display: inline-block; width: 20px; height: 20px; background: #64748b; border-radius: 50%; margin-right: 10px;"></span>
            INFORMACIÓN DE REGISTRO
          </h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
              <strong>Fecha de Creación:</strong><br>
              ${formatDate(medicalRecord.createdAt)}
            </div>
            <div>
              <strong>Última Actualización:</strong><br>
              ${formatDate(medicalRecord.updatedAt)}
            </div>
          </div>
        </div>

        <!-- Firma Digital -->
        <div style="margin-top: 40px; padding: 20px; background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; text-align: center;">
          <h3 style="margin: 0 0 20px 0; color: #475569; font-size: 16px;">FIRMA DIGITAL DEL ESPECIALISTA</h3>
          <div style="display: flex; justify-content: space-between; align-items: end; margin-top: 30px;">
            <div style="text-align: center; width: 200px;">
              <div style="height: 80px; border-bottom: 2px solid #475569; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; background: #f1f5f9;">
                ${signatureBase64 ? `
                  <img 
                    src="${signatureBase64}" 
                    alt="Firma del profesional" 
                    style="max-height: 70px; max-width: 180px; object-fit: contain;"
                  />
                ` : `
                  <span style="color: #64748b; font-style: italic; font-size: 12px;">[Sin Firma Digital]</span>
                `}
              </div>
              <div style="font-size: 14px; color: #475569;">
                <strong>Dr. ${medicalRecord.professional.firstName} ${medicalRecord.professional.firstLastname}</strong><br>
                <span style="font-size: 12px;">CMP: ${medicalRecord.professional.licenseNumber || 'N/A'}</span><br>
                <span style="font-size: 12px;">${medicalRecord.specialty.name}</span>
              </div>
            </div>
            <div style="text-align: center; font-size: 12px; color: #64748b;">
              <strong>Fecha y Hora:</strong><br>
              ${formatDate(new Date())}<br>
              ${new Date().toLocaleTimeString('es-PE')}
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="margin-top: 30px; padding: 15px; text-align: center; background: #1e293b; color: white; border-radius: 8px; font-size: 12px;">
          <p style="margin: 0;">Este documento fue generado automáticamente por SYSMEDIC - Sistema de Gestión Médica</p>
          <p style="margin: 5px 0 0 0; opacity: 0.7;">Documento confidencial - Solo para uso médico autorizado</p>
        </div>
      </div>
    `;
  }
}

export const pdfService = PDFService.getInstance();
