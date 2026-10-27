/** Ayudas para leer formularios sin repetir conversiones. */
export const texto = (datos: FormData, campo: string) => String(datos.get(campo) ?? '').trim();
export const textoONulo = (datos: FormData, campo: string) => texto(datos, campo) || null;
export const entero = (datos: FormData, campo: string) => {
  const n = Number(texto(datos, campo));
  return Number.isInteger(n) ? n : NaN;
};
export const numero = (datos: FormData, campo: string) => Number(texto(datos, campo) || '0');

export const pesos = (n: number) => n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

/** Fecha y hora de la base de datos mostrada en hora de México. */
export const fechaHora = (fecha: Date) =>
  fecha.toLocaleString('es-MX', { timeZone: 'America/Mexico_City', dateStyle: 'medium', timeStyle: 'short' });
