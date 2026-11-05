import { texto, textoONulo } from './forms';
import { LOGO_HEIGHT, LOGO_JPEG_BASE64, LOGO_WIDTH } from './logo-pdf';

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
  estado: 'programada' | 'cancelada';
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

/** Devuelve la fecha ('AAAA-MM-DD') y hora ('HH:MM' en 24h) actuales en la Ciudad de México. */
export function ahoraEnMexico() {
  const ahora = new Date();
  const fecha = ahora.toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
  const hora = ahora.toLocaleTimeString('en-GB', {
    timeZone: 'America/Mexico_City',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return { fecha, hora };
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

  const actual = ahoraEnMexico();
  if (fecha < actual.fecha) {
    return { error: 'No se puede agendar una cita en una fecha que ya pasó.' };
  }
  if (fecha === actual.fecha && hora <= actual.hora) {
    return { error: `No puedes agendar a las ${etiquetaHora(hora)} porque esa hora de hoy ya pasó.` };
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

/** Dibuja un círculo relleno usando curvas de Bézier en coordenadas del PDF. */
function circuloPdf(cx: number, cy: number, r: number): string {
  const k = 0.55228475 * r;
  const f = (n: number) => n.toFixed(2);
  return [
    `${f(cx + r)} ${f(cy)} m`,
    `${f(cx + r)} ${f(cy + k)} ${f(cx + k)} ${f(cy + r)} ${f(cx)} ${f(cy + r)} c`,
    `${f(cx - k)} ${f(cy + r)} ${f(cx - r)} ${f(cy + k)} ${f(cx - r)} ${f(cy)} c`,
    `${f(cx - r)} ${f(cy - k)} ${f(cx - k)} ${f(cy - r)} ${f(cx)} ${f(cy - r)} c`,
    `${f(cx + k)} ${f(cy - r)} ${f(cx + r)} ${f(cy - k)} ${f(cx + r)} ${f(cy)} c`,
    'f',
  ].join(' ');
}

/** Dibuja una huella veterinaria decorativa en (cx, cy). */
function huellaPdf(cx: number, cy: number, escala = 1): string {
  return [
    circuloPdf(cx, cy, 7 * escala),
    circuloPdf(cx - 7.5 * escala, cy + 7.5 * escala, 3.2 * escala),
    circuloPdf(cx - 2.6 * escala, cy + 10.5 * escala, 3.2 * escala),
    circuloPdf(cx + 2.6 * escala, cy + 10.5 * escala, 3.2 * escala),
    circuloPdf(cx + 7.5 * escala, cy + 7.5 * escala, 3.2 * escala),
  ].join('\n');
}

/** Dibuja una cruz médica veterinaria centrada en (cx, cy). */
function cruzVeterinariaPdf(cx: number, cy: number, tam: number): string {
  const brazo = tam;
  const grosor = tam * 0.36;
  return [
    `${(cx - brazo).toFixed(2)} ${(cy - grosor).toFixed(2)} ${(brazo * 2).toFixed(2)} ${(grosor * 2).toFixed(2)} re f`,
    `${(cx - grosor).toFixed(2)} ${(cy - brazo).toFixed(2)} ${(grosor * 2).toFixed(2)} ${(brazo * 2).toFixed(2)} re f`,
  ].join('\n');
}

function aBytesAscii(str: string): Uint8Array {
  const arr = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) arr[i] = str.charCodeAt(i) & 0xff;
  return arr;
}

/** Genera un archivo PDF (estándar 1.4) con el logo y diseño clínico veterinario de Puppy and Kitty. */
export function generarPdfCita(cita: CitaDetallada): Uint8Array<ArrayBuffer> {
  const folio = `PK-${String(cita.id).padStart(4, '0')}`;
  const fechaLarga = formatearFechaCita(cita.fecha);
  const horaTexto = etiquetaHora(cita.hora);
  const cancelada = cita.estado === 'cancelada';

  const ops: string[] = [];

  // 1. Fondo general suave de hoja clínica y doble marco en verde veterinario (#0f766e)
  ops.push('0.988 0.996 0.995 rg');
  ops.push('28 28 556 736 re f');

  ops.push('0.059 0.463 0.431 RG');
  ops.push('2 w');
  ops.push('28 28 556 736 re S');

  ops.push('0.75 0.90 0.88 RG');
  ops.push('0.75 w');
  ops.push('33 33 546 726 re S');

  // 2. Encabezado superior con franja verde veterinario y azul marino
  ops.push('0.059 0.463 0.431 rg');
  ops.push('28 632 556 132 re f');

  // Franja decorativa inferior del encabezado en verde menta (#2dd4bf)
  ops.push('0.176 0.831 0.749 rg');
  ops.push('28 627 556 5 re f');

  // Recuadro blanco para el logo oficial de Puppy and Kitty
  ops.push('1 1 1 rg');
  ops.push('42 644 128 106 re f');
  ops.push('0.176 0.831 0.749 RG');
  ops.push('1.5 w');
  ops.push('42 644 128 106 re S');

  // Dibuja el logo JPEG incrustado (/Im1) dentro del recuadro blanco
  ops.push('q 118 0 0 96 47 649 cm /Im1 Do Q');

  // Textos del encabezado de la clínica
  ops.push('1 1 1 rg');
  ops.push('BT /F2 19 Tf 182 728 Td (PUPPYS AND KITTY) Tj ET');
  ops.push('0.80 0.98 0.95 rg');
  ops.push('BT /F2 10 Tf 182 711 Td (' + escaparTextoPdf('CLÍNICA VETERINARIA · SALUD Y BIENESTAR ANIMAL') + ') Tj ET');

  ops.push('1 1 1 rg');
  ops.push('BT /F1 9 Tf 182 691 Td (' + escaparTextoPdf('Av. de las Mascotas #123, Col. Del Parque · Tel: +52 (55) 1234-5678') + ') Tj ET');
  ops.push('BT /F1 9 Tf 182 677 Td (' + escaparTextoPdf('Correo: contacto@puppyandkitty.com · Urgencias 24/7') + ') Tj ET');
  ops.push('0.80 0.98 0.95 rg');
  ops.push('BT /F2 8.5 Tf 182 657 Td (' + escaparTextoPdf('+ Consultas  + Vacunación  + Cirugía  + Laboratorio  + Estética') + ') Tj ET');

  // Tarjeta de Folio y Estado a la derecha del encabezado
  ops.push('1 1 1 rg');
  ops.push('440 644 130 106 re f');

  // Cruz médica en la tarjeta del folio
  ops.push('0.059 0.463 0.431 rg');
  ops.push(cruzVeterinariaPdf(460, 732, 7));
  ops.push('BT /F2 9 Tf 472 729 Td (CARNET DE CITA) Tj ET');

  ops.push('0.11 0.21 0.36 rg');
  ops.push('BT /F2 15 Tf 454 702 Td (' + escaparTextoPdf(folio) + ') Tj ET');
  ops.push('0.42 0.45 0.50 rg');
  ops.push('BT /F1 8 Tf 454 689 Td (FOLIO DE REGISTRO) Tj ET');

  // Etiqueta de estado (PROGRAMADA en verde / CANCELADA en rojo)
  if (cancelada) {
    ops.push('0.99 0.88 0.88 rg');
    ops.push('452 654 106 24 re f');
    ops.push('0.60 0.11 0.11 rg');
    ops.push('BT /F2 10 Tf 471 662 Td (CANCELADA) Tj ET');
  } else {
    ops.push('0.80 0.98 0.95 rg');
    ops.push('452 654 106 24 re f');
    ops.push('0.067 0.369 0.349 rg');
    ops.push('BT /F2 10 Tf 467 662 Td (PROGRAMADA) Tj ET');
  }

  // Huellas decorativas suaves en el fondo clínico
  ops.push('0.90 0.97 0.96 rg');
  ops.push(huellaPdf(548, 598, 0.9));
  ops.push(huellaPdf(522, 585, 0.65));

  // Título del documento
  ops.push('0.11 0.21 0.36 rg');
  ops.push(cruzVeterinariaPdf(52, 600, 6));
  ops.push('BT /F2 13 Tf 65 595 Td (' + escaparTextoPdf('ORDEN Y COMPROBANTE DE CITA MÉDICA VETERINARIA') + ') Tj ET');

  // 3. Dos tarjetas clínicas lado a lado: FICHA DEL PACIENTE (izquierda) y PROPIETARIO (derecha)
  // Tarjeta izquierda: Paciente (Mascota)
  ops.push('1 1 1 rg');
  ops.push('42 465 256 115 re f');
  ops.push('0.059 0.463 0.431 RG');
  ops.push('1.2 w');
  ops.push('42 465 256 115 re S');

  ops.push('0.059 0.463 0.431 rg');
  ops.push('42 554 256 26 re f');
  ops.push('1 1 1 rg');
  ops.push('BT /F2 10 Tf 54 563 Td (' + escaparTextoPdf('FICHA DEL PACIENTE (MASCOTA)') + ') Tj ET');

  // Huellita decorativa dentro de la tarjeta de la mascota
  ops.push('0.91 0.98 0.96 rg');
  ops.push(huellaPdf(274, 486, 0.85));

  ops.push('0.42 0.45 0.50 rg');
  ops.push('BT /F2 8.5 Tf 54 536 Td (NOMBRE DEL PACIENTE:) Tj ET');
  ops.push('0.11 0.21 0.36 rg');
  ops.push('BT /F2 13 Tf 54 521 Td (' + escaparTextoPdf(cita.mascota.slice(0, 28)) + ') Tj ET');

  ops.push('0.42 0.45 0.50 rg');
  ops.push('BT /F2 8.5 Tf 54 501 Td (ESPECIE:) Tj ET');
  ops.push('0.059 0.463 0.431 rg');
  ops.push('BT /F2 11 Tf 105 501 Td (' + escaparTextoPdf(cita.especie) + ') Tj ET');

  ops.push('0.42 0.45 0.50 rg');
  ops.push('BT /F2 8.5 Tf 54 480 Td (SERVICIO SOLICITADO:) Tj ET');
  ops.push('0.12 0.16 0.22 rg');
  ops.push('BT /F2 10 Tf 160 480 Td (' + escaparTextoPdf(cita.servicio.slice(0, 26)) + ') Tj ET');

  // Tarjeta derecha: Datos del Propietario (Tutor)
  ops.push('1 1 1 rg');
  ops.push('314 465 256 115 re f');
  ops.push('0.059 0.463 0.431 RG');
  ops.push('1.2 w');
  ops.push('314 465 256 115 re S');

  ops.push('0.11 0.21 0.36 rg');
  ops.push('314 554 256 26 re f');
  ops.push('1 1 1 rg');
  ops.push('BT /F2 10 Tf 326 563 Td (' + escaparTextoPdf('DATOS DEL PROPIETARIO (TUTOR)') + ') Tj ET');

  ops.push('0.42 0.45 0.50 rg');
  ops.push('BT /F2 8.5 Tf 326 536 Td (NOMBRE DEL TUTOR:) Tj ET');
  ops.push('0.12 0.16 0.22 rg');
  ops.push('BT /F2 11.5 Tf 326 521 Td (' + escaparTextoPdf(cita.cliente_nombre.slice(0, 32)) + ') Tj ET');

  ops.push('0.42 0.45 0.50 rg');
  ops.push('BT /F2 8.5 Tf 326 501 Td (CORREO DE CONTACTO:) Tj ET');
  ops.push('0.12 0.16 0.22 rg');
  ops.push('BT /F1 9.5 Tf 326 487 Td (' + escaparTextoPdf(cita.cliente_correo.slice(0, 38)) + ') Tj ET');

  // 4. Recuadro central destacado: FECHA Y HORARIO DE LA CITA
  ops.push('0.94 0.99 0.98 rg');
  ops.push('42 372 528 78 re f');
  ops.push('0.059 0.463 0.431 RG');
  ops.push('1.5 w');
  ops.push('42 372 528 78 re S');

  ops.push('0.059 0.463 0.431 rg');
  ops.push('42 426 528 24 re f');
  ops.push('1 1 1 rg');
  ops.push('BT /F2 10 Tf 54 434 Td (' + escaparTextoPdf('FECHA Y HORARIO RESERVADO PARA LA ATENCIÓN') + ') Tj ET');

  ops.push('0.42 0.45 0.50 rg');
  ops.push('BT /F2 8.5 Tf 54 407 Td (' + escaparTextoPdf('DÍA PROGRAMADO:') + ') Tj ET');
  ops.push('0.11 0.21 0.36 rg');
  const fechaCapitalizada = fechaLarga.charAt(0).toUpperCase() + fechaLarga.slice(1);
  ops.push('BT /F2 12.5 Tf 54 388 Td (' + escaparTextoPdf(`${fechaCapitalizada} (${cita.fecha})`) + ') Tj ET');

  // Bloque resaltado de la hora a la derecha
  ops.push('0.059 0.463 0.431 rg');
  ops.push('410 380 146 38 re f');
  ops.push('1 1 1 rg');
  ops.push('BT /F1 8 Tf 424 406 Td (HORARIO DE CONSULTA) Tj ET');
  ops.push('BT /F2 14 Tf 440 388 Td (' + escaparTextoPdf(horaTexto) + ') Tj ET');

  // 5. Observaciones / Motivo clínico
  ops.push('1 1 1 rg');
  ops.push('42 288 528 70 re f');
  ops.push('0.75 0.82 0.81 RG');
  ops.push('1 w');
  ops.push('42 288 528 70 re S');

  ops.push('0.059 0.463 0.431 rg');
  ops.push('BT /F2 9.5 Tf 54 342 Td (' + escaparTextoPdf('OBSERVACIONES CLÍNICAS / NOTAS DEL PROPIETARIO:') + ') Tj ET');

  const textoNotas = cita.notas?.trim()
    ? cita.notas.trim()
    : 'Sin observaciones adicionales registradas al momento de agendar.';
  ops.push('0.22 0.25 0.32 rg');
  ops.push('BT /F1 10 Tf 54 322 Td (' + escaparTextoPdf(textoNotas.slice(0, 80)) + ') Tj ET');
  if (textoNotas.length > 80) {
    ops.push('BT /F1 10 Tf 54 306 Td (' + escaparTextoPdf(textoNotas.slice(80, 160)) + ') Tj ET');
  }

  // 6. Indicaciones médicas pre-consulta (izquierda) y Sello/Firma del Médico Veterinario (derecha)
  ops.push('1 1 1 rg');
  ops.push('42 140 326 132 re f');
  ops.push('0.75 0.82 0.81 RG');
  ops.push('1 w');
  ops.push('42 140 326 132 re S');

  ops.push('0.059 0.463 0.431 rg');
  ops.push(cruzVeterinariaPdf(56, 256, 4.5));
  ops.push('BT /F2 9.5 Tf 66 252 Td (' + escaparTextoPdf('INDICACIONES PARA SU VISITA VETERINARIA') + ') Tj ET');

  ops.push('0.22 0.25 0.32 rg');
  ops.push('BT /F1 9 Tf 54 230 Td (' + escaparTextoPdf('1. Llegar 10 minutos antes de su horario reservado.') + ') Tj ET');
  ops.push('BT /F1 9 Tf 54 212 Td (' + escaparTextoPdf('2. Presentar cartilla de vacunación y este carnet.') + ') Tj ET');
  ops.push('BT /F1 9 Tf 54 194 Td (' + escaparTextoPdf('3. Traer a perros con correa y gatos en transportadora.') + ') Tj ET');
  ops.push('BT /F1 9 Tf 54 176 Td (' + escaparTextoPdf('4. En caso de no poder asistir, puede cancelar su cita') + ') Tj ET');
  ops.push('BT /F1 9 Tf 64 162 Td (' + escaparTextoPdf('desde su perfil para liberar el horario.') + ') Tj ET');

  // Recuadro de Firma y Sello del Médico Veterinario
  ops.push('1 1 1 rg');
  ops.push('382 140 188 132 re f');
  ops.push('0.75 0.82 0.81 RG');
  ops.push('1 w');
  ops.push('382 140 188 132 re S');

  // Huella marca de agua en el espacio de sello
  ops.push('0.92 0.98 0.97 rg');
  ops.push(huellaPdf(476, 210, 1.4));

  ops.push('0.42 0.45 0.50 rg');
  ops.push('0.75 w');
  ops.push('402 180 m 550 180 l S');
  ops.push('0.11 0.21 0.36 rg');
  ops.push('BT /F2 9 Tf 412 166 Td (' + escaparTextoPdf('MÉDICO VETERINARIO (MVZ)') + ') Tj ET');
  ops.push('0.42 0.45 0.50 rg');
  ops.push('BT /F1 8 Tf 426 153 Td (' + escaparTextoPdf('Firma y sello de recepción') + ') Tj ET');

  // 7. Pie de página institucional
  ops.push('0.059 0.463 0.431 rg');
  ops.push('28 28 556 36 re f');
  ops.push('1 1 1 rg');
  ops.push(
    'BT /F2 9 Tf 72 42 Td (' +
      escaparTextoPdf('PUPPYS AND KITTY · Clínica Veterinaria · Cuidamos a tu mejor amigo con amor y ciencia') +
      ') Tj ET',
  );

  const contenidoStream = ops.join('\n');
  const logoBytes = Uint8Array.from(atob(LOGO_JPEG_BASE64), (c) => c.charCodeAt(0));

  const partes: Uint8Array[] = [];
  const offsets: number[] = [0];
  let longitudActual = 0;

  const empujarBytes = (bytes: Uint8Array) => {
    partes.push(bytes);
    longitudActual += bytes.byteLength;
  };
  const empujarTexto = (str: string) => empujarBytes(aBytesAscii(str));

  empujarTexto('%PDF-1.4\n');

  const objetosTexto = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> /XObject << /Im1 7 0 R >> >> /Contents 6 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n',
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n',
    `6 0 obj\n<< /Length ${contenidoStream.length} >>\nstream\n${contenidoStream}\nendstream\nendobj\n`,
  ];

  for (const obj of objetosTexto) {
    offsets.push(longitudActual);
    empujarTexto(obj);
  }

  // Objeto 7: Imagen JPEG del logo (/Im1)
  offsets.push(longitudActual);
  empujarTexto(
    `7 0 obj\n<< /Type /XObject /Subtype /Image /Width ${LOGO_WIDTH} /Height ${LOGO_HEIGHT} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${logoBytes.byteLength} >>\nstream\n`,
  );
  empujarBytes(logoBytes);
  empujarTexto('\nendstream\nendobj\n');

  const totalObjetos = 7;
  const xrefPos = longitudActual;
  let tablaXref = `xref\n0 ${totalObjetos + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= totalObjetos; i++) {
    tablaXref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  tablaXref += `trailer\n<< /Size ${totalObjetos + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;
  empujarTexto(tablaXref);

  const salida = new Uint8Array(new ArrayBuffer(longitudActual));
  let cursor = 0;
  for (const p of partes) {
    salida.set(p, cursor);
    cursor += p.byteLength;
  }
  return salida;
}
