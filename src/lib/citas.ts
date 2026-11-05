import { texto, textoONulo } from './forms';

export const especiesCita = ['Perro', 'Gato', 'Otro'] as const;

export const serviciosCita = [
  'Consulta general',
  'Vacunación y desparasitación',
  'Cirugía',
  'Laboratorio',
  'Estética y baño',
  'Hospitalización',
] as const;

/** Bloques de 1 hora de 9:00 a 19:00 (horario de consulta). */
export const horariosCita = [
  { valor: '09:00', etiqueta: '09:00 a. m.' },
  { valor: '10:00', etiqueta: '10:00 a. m.' },
  { valor: '11:00', etiqueta: '11:00 a. m.' },
  { valor: '12:00', etiqueta: '12:00 p. m.' },
  { valor: '13:00', etiqueta: '01:00 p. m.' },
  { valor: '14:00', etiqueta: '02:00 p. m.' },
  { valor: '15:00', etiqueta: '03:00 p. m.' },
  { valor: '16:00', etiqueta: '04:00 p. m.' },
  { valor: '17:00', etiqueta: '05:00 p. m.' },
  { valor: '18:00', etiqueta: '06:00 p. m.' },
  { valor: '19:00', etiqueta: '07:00 p. m.' },
] as const;

export interface CitaDetallada {
  id: number;
  usuario_id: number;
  cliente_nombre: string;
  cliente_correo: string;
  mascota: string;
  especie: string;
  servicio: string;
  notas: string | null;
  fecha: string;
  hora: string;
  creado_en: Date;
}

export function etiquetaHora(hora: string) {
  return horariosCita.find((h) => h.valor === hora)?.etiqueta ?? `${hora} hrs`;
}

export function formatearFechaCita(fecha: string) {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  if (!anio || !mes || !dia) return fecha;
  const d = new Date(Date.UTC(anio, mes - 1, dia, 12, 0, 0));
  return d.toLocaleDateString('es-MX', {
    timeZone: 'UTC',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function leerCita(datos: FormData) {
  const mascota = texto(datos, 'mascota');
  const especie = texto(datos, 'especie');
  const servicio = texto(datos, 'servicio');
  const notas = textoONulo(datos, 'notas');
  const fecha = texto(datos, 'fecha');
  const hora = texto(datos, 'hora');

  if (!mascota) return { error: 'El nombre de la mascota es obligatorio.' };
  if (!especiesCita.includes(especie as (typeof especiesCita)[number])) {
    return { error: 'Selecciona una especie válida.' };
  }
  if (!servicio) return { error: 'Selecciona el servicio o motivo de la cita.' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return { error: 'Selecciona una fecha válida.' };
  if (!horariosCita.some((h) => h.valor === hora)) {
    return { error: 'Selecciona un horario válido.' };
  }

  return {
    cita: { mascota, especie, servicio, notas, fecha, hora },
  };
}

/** Convierte texto UTF-8 a bytes Windows-1252 / Latin1 y escapa paréntesis para PDF. */
function escaparTextoPdf(cadena: string): string {
  let resultado = '';
  for (let i = 0; i < cadena.length; i++) {
    const code = cadena.charCodeAt(i);
    if (cadena[i] === '\\' || cadena[i] === '(' || cadena[i] === ')') {
      resultado += '\\' + cadena[i];
    } else if (code >= 32 && code <= 126) {
      resultado += cadena[i];
    } else if (code >= 160 && code <= 255) {
      resultado += '\\' + code.toString(8).padStart(3, '0');
    } else {
      resultado += ' ';
    }
  }
  return resultado;
}

/** Genera un archivo PDF (estándar 1.4) con los datos completos del comprobante de la cita. */
export function generarPdfCita(cita: CitaDetallada): Uint8Array<ArrayBuffer> {
  const folio = `PK-${String(cita.id).padStart(4, '0')}`;
  const fechaLarga = formatearFechaCita(cita.fecha);
  const horaTexto = etiquetaHora(cita.hora);

  const ops: string[] = [];

  // Fondo superior verde (#0f766e -> 0.059, 0.463, 0.431)
  ops.push('0.059 0.463 0.431 rg');
  ops.push('40 680 532 80 re f');

  // Título del encabezado en blanco
  ops.push('1 1 1 rg');
  ops.push('BT /F2 20 Tf 60 728 Td (PUPPY AND KITTY) Tj ET');
  ops.push('BT /F1 11 Tf 60 708 Td (' + escaparTextoPdf('Clínica Veterinaria · Comprobante de Cita') + ') Tj ET');
  ops.push('BT /F2 12 Tf 430 728 Td (' + escaparTextoPdf(`Folio: ${folio}`) + ') Tj ET');
  ops.push('BT /F1 10 Tf 430 708 Td (' + escaparTextoPdf(`Fecha: ${cita.fecha}`) + ') Tj ET');

  // Marco de la tarjeta de datos
  ops.push('0.85 0.87 0.90 RG');
  ops.push('1 w');
  ops.push('40 330 532 330 re S');

  // Subtítulo de sección
  ops.push('0.059 0.463 0.431 rg');
  ops.push('BT /F2 13 Tf 60 630 Td (' + escaparTextoPdf('Datos de la cita agendada') + ') Tj ET');

  ops.push('0.85 0.87 0.90 RG');
  ops.push('60 620 m 552 620 l S');

  const filas: [string, string][] = [
    ['Cliente:', cita.cliente_nombre],
    ['Correo:', cita.cliente_correo],
    ['Mascota:', cita.mascota],
    ['Especie:', cita.especie],
    ['Servicio / Motivo:', cita.servicio],
    ['Fecha de la cita:', `${fechaLarga} (${cita.fecha})`],
    ['Horario:', horaTexto],
    ['Notas adicionales:', cita.notas || 'Sin notas adicionales'],
  ];

  let y = 592;
  for (const [etiqueta, valor] of filas) {
    // Etiqueta en gris oscuro y negrita
    ops.push('0.22 0.25 0.32 rg');
    ops.push(`BT /F2 11 Tf 60 ${y} Td (${escaparTextoPdf(etiqueta)}) Tj ET`);
    // Valor
    ops.push('0.12 0.16 0.22 rg');
    const valorRecortado = valor.length > 65 ? valor.slice(0, 62) + '...' : valor;
    ops.push(`BT /F1 11 Tf 190 ${y} Td (${escaparTextoPdf(valorRecortado)}) Tj ET`);

    // Línea divisoria suave
    ops.push('0.93 0.94 0.96 RG');
    ops.push(`60 ${y - 10} m 552 ${y - 10} l S`);
    y -= 30;
  }

  // Recuadro de indicaciones e información de la clínica
  ops.push('0.94 0.99 0.98 rg');
  ops.push('40 215 532 95 re f');
  ops.push('0.059 0.463 0.431 RG');
  ops.push('40 215 532 95 re S');

  ops.push('0.059 0.463 0.431 rg');
  ops.push('BT /F2 11 Tf 60 288 Td (' + escaparTextoPdf('Indicaciones para tu visita') + ') Tj ET');

  ops.push('0.22 0.25 0.32 rg');
  ops.push('BT /F1 10 Tf 60 268 Td (' + escaparTextoPdf('· Por favor llega 10 minutos antes de tu hora programada.') + ') Tj ET');
  ops.push('BT /F1 10 Tf 60 252 Td (' + escaparTextoPdf('· Trae la cartilla de vacunación de tu mascota y este comprobante.') + ') Tj ET');
  ops.push(
    'BT /F1 10 Tf 60 232 Td (' +
      escaparTextoPdf('Dirección: Av. de las Mascotas #123, Col. Del Parque · Tel: +52 (55) 1234-5678') +
      ') Tj ET',
  );

  const contenidoStream = ops.join('\n');

  const objetos = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj',
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj',
    `6 0 obj\n<< /Length ${contenidoStream.length} >>\nstream\n${contenidoStream}\nendstream\nendobj`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (const obj of objetos) {
    offsets.push(pdf.length);
    pdf += obj + '\n';
  }

  const xrefPos = pdf.length;
  pdf += `xref\n0 ${objetos.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= objetos.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;

  const bytes = new Uint8Array(new ArrayBuffer(pdf.length));
  for (let i = 0; i < pdf.length; i++) {
    bytes[i] = pdf.charCodeAt(i) & 0xff;
  }
  return bytes;
}
