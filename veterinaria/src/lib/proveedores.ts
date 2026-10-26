/** Los 10 campos del proveedor, en el orden en que se muestran. */
export const camposProveedor = [
  { campo: 'nombre', etiqueta: 'Nombre comercial' },
  { campo: 'razon_social', etiqueta: 'Razón social' },
  { campo: 'rfc', etiqueta: 'RFC' },
  { campo: 'contacto', etiqueta: 'Contacto' },
  { campo: 'telefono', etiqueta: 'Teléfono' },
  { campo: 'correo', etiqueta: 'Correo' },
  { campo: 'direccion', etiqueta: 'Dirección' },
  { campo: 'ciudad', etiqueta: 'Ciudad' },
  { campo: 'estado', etiqueta: 'Estado' },
  { campo: 'codigo_postal', etiqueta: 'Código postal' },
] as const;

export type Proveedor = { id: number } & Record<(typeof camposProveedor)[number]['campo'], string | null>;
