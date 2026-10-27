import { consulta, esDuplicado } from './db';
import { entero, numero, texto, textoONulo } from './forms';

/** Catálogos para los <select> del formulario de producto. */
export async function catalogos() {
  const [categorias, proveedores] = await Promise.all([
    consulta<{ id: number; nombre: string }>('SELECT id, nombre FROM categorias ORDER BY nombre'),
    consulta<{ id: number; nombre: string }>('SELECT id, nombre FROM proveedores ORDER BY nombre'),
  ]);
  return { categorias, proveedores };
}

/** Lee y valida los campos del formulario. Devuelve los datos o un mensaje de error. */
export function leerProducto(datos: FormData) {
  const producto = {
    codigo: texto(datos, 'codigo').toUpperCase(),
    nombre: texto(datos, 'nombre'),
    descripcion: textoONulo(datos, 'descripcion'),
    categoria_id: entero(datos, 'categoria_id'),
    proveedor_id: texto(datos, 'proveedor_id') ? entero(datos, 'proveedor_id') : null,
    unidad: texto(datos, 'unidad') || 'pieza',
    precio_compra: numero(datos, 'precio_compra'),
    precio_venta: numero(datos, 'precio_venta'),
    stock_minimo: entero(datos, 'stock_minimo'),
    lote: textoONulo(datos, 'lote'),
    fecha_caducidad: textoONulo(datos, 'fecha_caducidad'),
  };
  if (!producto.codigo || !producto.nombre) return { error: 'El código y el nombre son obligatorios.' };
  if (!Number.isInteger(producto.categoria_id)) return { error: 'Elige una categoría.' };
  if (!(producto.precio_compra >= 0) || !(producto.precio_venta >= 0)) return { error: 'Los precios no pueden ser negativos.' };
  if (!(producto.stock_minimo >= 0)) return { error: 'El stock mínimo debe ser un número entero de 0 o más.' };
  return { producto };
}

export const mensajeDeError = (e: unknown) =>
  esDuplicado(e) ? 'Ya existe un producto con ese código.' : 'No se pudo guardar. Revisa los datos.';
