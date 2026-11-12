import { consulta, esDuplicado, transaccion } from './db';
import { entero, numero, texto } from './forms';

export const categoriasServicio = [
  'Consultas y Prevención',
  'Cirugía y Hospitalización',
  'Diagnóstico y Laboratorio',
  'Estética e Higiene',
  'Especialidades y Urgencias',
] as const;

export const especiesServicio = [
  'Perros y gatos',
  'Perros, gatos y pequeñas especies',
  'Perros',
  'Gatos',
] as const;

export interface ServicioVeterinario {
  id: number;
  codigo: string;
  nombre: string;
  categoria: string;
  icono: string;
  descripcion: string;
  especies: string;
  duracion_min: number;
  precio: number;
  activo: boolean;
}

/** Catálogo inicial de 24 servicios veterinarios que ofrece la clínica Puppy and Kitty. */
export const serviciosIniciales: Omit<ServicioVeterinario, 'id'>[] = [
  {
    codigo: 'SRV-001',
    nombre: 'Consulta médica general',
    categoria: 'Consultas y Prevención',
    icono: '🩺',
    descripcion: 'Revisión física integral de signos vitales, peso, temperatura, auscultación cardiopulmonar, diagnóstico clínico y receta médica.',
    especies: 'Perros, gatos y pequeñas especies',
    duracion_min: 30,
    precio: 350,
    activo: true,
  },
  {
    codigo: 'SRV-002',
    nombre: 'Consulta de especialidad',
    categoria: 'Especialidades y Urgencias',
    icono: '👨‍⚕️',
    descripcion: 'Valoración avanzada en dermatología, oftalmología, neurología u ortopedia por médico veterinario especialista.',
    especies: 'Perros y gatos',
    duracion_min: 45,
    precio: 650,
    activo: true,
  },
  {
    codigo: 'SRV-003',
    nombre: 'Atención de urgencias médicas 24/7',
    categoria: 'Especialidades y Urgencias',
    icono: '🚨',
    descripcion: 'Estabilización inmediata para pacientes en estado crítico, traumatismos, intoxicaciones, dificultad respiratoria o partos distócicos.',
    especies: 'Perros, gatos y pequeñas especies',
    duracion_min: 60,
    precio: 800,
    activo: true,
  },
  {
    codigo: 'SRV-004',
    nombre: 'Vacunación séxtuple canina',
    categoria: 'Consultas y Prevención',
    icono: '💉',
    descripcion: 'Inmunización contra moquillo, parvovirus, hepatitis infecciosa, parainfluenza, leptospirosis y coronavirus canino con registro en carnet.',
    especies: 'Perros',
    duracion_min: 20,
    precio: 420,
    activo: true,
  },
  {
    codigo: 'SRV-005',
    nombre: 'Vacunación triple felina',
    categoria: 'Consultas y Prevención',
    icono: '🐱',
    descripcion: 'Protección esencial contra panleucopenia felina, rinotraqueítis viral y calicivirus, incluye revisión general previa.',
    especies: 'Gatos',
    duracion_min: 20,
    precio: 400,
    activo: true,
  },
  {
    codigo: 'SRV-006',
    nombre: 'Vacunación antirrábica y refuerzos',
    categoria: 'Consultas y Prevención',
    icono: '🛡️',
    descripcion: 'Aplicación de vacuna antirrábica oficial y refuerzos de Bordetella o Giardia con expedición de certificado de vacunación.',
    especies: 'Perros y gatos',
    duracion_min: 20,
    precio: 280,
    activo: true,
  },
  {
    codigo: 'SRV-007',
    nombre: 'Desparasitación interna y externa',
    categoria: 'Consultas y Prevención',
    icono: '💊',
    descripcion: 'Tratamiento antiparasitario de amplio espectro contra parásitos gastrointestinales, pulgas, garrapatas y ácaros según el peso.',
    especies: 'Perros, gatos y pequeñas especies',
    duracion_min: 20,
    precio: 320,
    activo: true,
  },
  {
    codigo: 'SRV-008',
    nombre: 'Esterilización quirúrgica (OVH / Orquiectomía)',
    categoria: 'Cirugía y Hospitalización',
    icono: '🏥',
    descripcion: 'Cirugía preventiva bajo anestesia inhalatoria con monitoreo multiparamétrico, analgesia postoperatoria y retiro de puntos incluido.',
    especies: 'Perros y gatos',
    duracion_min: 90,
    precio: 1850,
    activo: true,
  },
  {
    codigo: 'SRV-009',
    nombre: 'Cirugía de tejidos blandos',
    categoria: 'Cirugía y Hospitalización',
    icono: '🧤',
    descripcion: 'Intervenciones quirúrgicas abdominales, extracción de cuerpos extraños, hernias, tumores cutáneos o mastectomías en quirófano estéril.',
    especies: 'Perros y gatos',
    duracion_min: 120,
    precio: 3500,
    activo: true,
  },
  {
    codigo: 'SRV-010',
    nombre: 'Cirugía ortopédica y traumatología',
    categoria: 'Cirugía y Hospitalización',
    icono: '🦴',
    descripcion: 'Reparación de fracturas, luxación patelar y ruptura de ligamento cruzado craneal mediante fijación especializada.',
    especies: 'Perros y gatos',
    duracion_min: 150,
    precio: 5200,
    activo: true,
  },
  {
    codigo: 'SRV-011',
    nombre: 'Profilaxis dental por ultrasonido',
    categoria: 'Estética e Higiene',
    icono: '🦷',
    descripcion: 'Eliminación de sarro dental supragingival y subgingival con cavitron ultrasónico, pulido dental y revisión periodontal bajo sedación segura.',
    especies: 'Perros y gatos',
    duracion_min: 60,
    precio: 1200,
    activo: true,
  },
  {
    codigo: 'SRV-012',
    nombre: 'Biometría hemática y química sanguínea',
    categoria: 'Diagnóstico y Laboratorio',
    icono: '🔬',
    descripcion: 'Análisis hematológico y perfil bioquímico completo para evaluar función renal, hepática, glucosa y proteínas con resultados el mismo día.',
    especies: 'Perros y gatos',
    duracion_min: 30,
    precio: 750,
    activo: true,
  },
  {
    codigo: 'SRV-013',
    nombre: 'Urianálisis y examen coproparasitoscópico',
    categoria: 'Diagnóstico y Laboratorio',
    icono: '🧪',
    descripcion: 'Estudio microscópico y fisicoquímico para detección temprana de infecciones urinarias, cristales y parásitos intestinales.',
    especies: 'Perros, gatos y pequeñas especies',
    duracion_min: 30,
    precio: 450,
    activo: true,
  },
  {
    codigo: 'SRV-014',
    nombre: 'Pruebas rápidas de enfermedades infecciosas',
    categoria: 'Diagnóstico y Laboratorio',
    icono: '📋',
    descripcion: 'Diagnóstico rápido en consultorio para Parvovirus, Moquillo, Leucemia/SIDA felino (FeLV/FIV), Ehrlichia y Dirofilaria.',
    especies: 'Perros y gatos',
    duracion_min: 25,
    precio: 580,
    activo: true,
  },
  {
    codigo: 'SRV-015',
    nombre: 'Radiología digital veterinaria (Rayos X)',
    categoria: 'Diagnóstico y Laboratorio',
    icono: '🩻',
    descripcion: 'Estudio radiográfico digital de alta definición (2 proyecciones) para evaluación ósea, torácica o abdominal con entrega digital.',
    especies: 'Perros, gatos y pequeñas especies',
    duracion_min: 30,
    precio: 850,
    activo: true,
  },
  {
    codigo: 'SRV-016',
    nombre: 'Ultrasonido abdominal y gestacional',
    categoria: 'Diagnóstico y Laboratorio',
    icono: '🖥️',
    descripcion: 'Evaluación ecográfica en tiempo real de órganos internos o diagnóstico y seguimiento de gestación con conteo y viabilidad fetal.',
    especies: 'Perros y gatos',
    duracion_min: 40,
    precio: 950,
    activo: true,
  },
  {
    codigo: 'SRV-017',
    nombre: 'Electrocardiograma y valoración cardiológica',
    categoria: 'Especialidades y Urgencias',
    icono: '❤️',
    descripcion: 'Estudio del ritmo cardíaco, presión arterial y valoración prequirúrgica para pacientes geriátricos o con soplo cardíaco.',
    especies: 'Perros y gatos',
    duracion_min: 45,
    precio: 900,
    activo: true,
  },
  {
    codigo: 'SRV-018',
    nombre: 'Hospitalización e internamiento 24 horas',
    categoria: 'Cirugía y Hospitalización',
    icono: '🛏️',
    descripcion: 'Internamiento en área climatizada independiente para perros y gatos, con terapia de fluidos intravenosa, medicación y monitoreo continuo.',
    especies: 'Perros y gatos',
    duracion_min: 1440,
    precio: 1100,
    activo: true,
  },
  {
    codigo: 'SRV-019',
    nombre: 'Baño higiénico y dermatológico',
    categoria: 'Estética e Higiene',
    icono: '🛁',
    descripcion: 'Baño con agua tibia, shampoo hipoalergénico o medicado, secado profesional, limpieza de oídos, corte de uñas y glándulas anales.',
    especies: 'Perros y gatos',
    duracion_min: 60,
    precio: 380,
    activo: true,
  },
  {
    codigo: 'SRV-020',
    nombre: 'Estética canina y felina completa',
    categoria: 'Estética e Higiene',
    icono: '✂️',
    descripcion: 'Servicio integral de peluquería según estándar de raza o corte higiénico a tijera, deslanado, baño completo, hidratación y loción.',
    especies: 'Perros y gatos',
    duracion_min: 90,
    precio: 520,
    activo: true,
  },
  {
    codigo: 'SRV-021',
    nombre: 'Implantación de microchip de identificación',
    categoria: 'Consultas y Prevención',
    icono: '📡',
    descripcion: 'Colocación subcutánea de microchip estándar ISO de 15 dígitos con registro de datos del propietario y certificado oficial.',
    especies: 'Perros y gatos',
    duracion_min: 20,
    precio: 680,
    activo: true,
  },
  {
    codigo: 'SRV-022',
    nombre: 'Certificado médico de salud y viaje',
    categoria: 'Consultas y Prevención',
    icono: '✈️',
    descripcion: 'Examen físico completo y expedición de certificado médico veterinario oficial para transporte aéreo o terrestre nacional e internacional.',
    especies: 'Perros y gatos',
    duracion_min: 30,
    precio: 550,
    activo: true,
  },
  {
    codigo: 'SRV-023',
    nombre: 'Fisioterapia y rehabilitación veterinaria',
    categoria: 'Especialidades y Urgencias',
    icono: '🐾',
    descripcion: 'Sesiones de láser terapéutico, electroestimulación, termoterapia y ejercicios asistidos para recuperación postquirúrgica o artrosis.',
    especies: 'Perros y gatos',
    duracion_min: 45,
    precio: 600,
    activo: true,
  },
  {
    codigo: 'SRV-024',
    nombre: 'Consulta geriátrica y control nutricional',
    categoria: 'Consultas y Prevención',
    icono: '⚖️',
    descripcion: 'Chequeo integral para mascotas senior o con sobrepeso, plan de alimentación personalizado y manejo preventivo articular y metabólico.',
    especies: 'Perros y gatos',
    duracion_min: 40,
    precio: 500,
    activo: true,
  },
];

let tablaLista = false;

/** Garantiza que la tabla `servicios` exista y tenga al menos los 24 servicios iniciales. */
export async function asegurarTablaServicios() {
  if (tablaLista) return;
  await transaccion(async (db) => {
    await db.query(`
      CREATE TABLE IF NOT EXISTS servicios (
        id             INTEGER       PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
        codigo         TEXT          NOT NULL UNIQUE,
        nombre         TEXT          NOT NULL,
        categoria      TEXT          NOT NULL,
        icono          TEXT          NOT NULL DEFAULT '🩺',
        descripcion    TEXT          NOT NULL,
        especies       TEXT          NOT NULL DEFAULT 'Perros y gatos',
        duracion_min   INTEGER       NOT NULL DEFAULT 30 CHECK (duracion_min > 0),
        precio         NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (precio >= 0),
        activo         BOOLEAN       NOT NULL DEFAULT true,
        creado_en      TIMESTAMPTZ   NOT NULL DEFAULT now(),
        actualizado_en TIMESTAMPTZ   NOT NULL DEFAULT now()
      )
    `);
    for (const s of serviciosIniciales) {
      await db.query(
        `INSERT INTO servicios (codigo, nombre, categoria, icono, descripcion, especies, duracion_min, precio, activo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (codigo) DO NOTHING`,
        [s.codigo, s.nombre, s.categoria, s.icono, s.descripcion, s.especies, s.duracion_min, s.precio, s.activo],
      );
    }
  });
  tablaLista = true;
}

export function formatearDuracion(minutos: number): string {
  if (minutos >= 1440 && minutos % 1440 === 0) {
    const dias = minutos / 1440;
    return dias === 1 ? '24 horas' : `${dias * 24} horas`;
  }
  if (minutos >= 60) {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return m > 0 ? `${h} h ${m} min` : `${h} ${h === 1 ? 'hora' : 'horas'}`;
  }
  return `${minutos} min`;
}

export function leerServicio(datos: FormData) {
  const servicio = {
    codigo: texto(datos, 'codigo').toUpperCase(),
    nombre: texto(datos, 'nombre'),
    categoria: texto(datos, 'categoria'),
    icono: texto(datos, 'icono') || '🩺',
    descripcion: texto(datos, 'descripcion'),
    especies: texto(datos, 'especies') || 'Perros y gatos',
    duracion_min: entero(datos, 'duracion_min'),
    precio: numero(datos, 'precio'),
    activo: texto(datos, 'activo') !== '0',
  };

  if (!servicio.codigo || !servicio.nombre) {
    return { error: 'El código y el nombre del servicio son obligatorios.' };
  }
  if (!categoriasServicio.includes(servicio.categoria as (typeof categoriasServicio)[number])) {
    return { error: 'Selecciona una categoría válida.' };
  }
  if (!servicio.descripcion) {
    return { error: 'La descripción del servicio es obligatoria.' };
  }
  if (!Number.isInteger(servicio.duracion_min) || servicio.duracion_min <= 0) {
    return { error: 'La duración debe ser un número entero mayor a 0 minutos.' };
  }
  if (!(servicio.precio >= 0)) {
    return { error: 'El precio no puede ser negativo.' };
  }

  return { servicio };
}

export const mensajeErrorServicio = (e: unknown) =>
  esDuplicado(e) ? 'Ya existe un servicio registrado con ese código.' : 'No se pudo guardar el servicio. Revisa los datos.';

export async function listarServicios(filtros: { q?: string; categoria?: string; especie?: string; verBajas?: boolean } = {}) {
  await asegurarTablaServicios();
  const q = filtros.q?.trim() ?? '';
  const categoria = filtros.categoria?.trim() ?? '';
  const especie = filtros.especie?.trim() ?? '';
  const verBajas = Boolean(filtros.verBajas);

  return consulta<ServicioVeterinario>(
    `SELECT id, codigo, nombre, categoria, icono, descripcion, especies, duracion_min, precio, activo
       FROM servicios
      WHERE ($1 = '' OR nombre ILIKE '%' || $1 || '%' OR codigo ILIKE '%' || $1 || '%' OR descripcion ILIKE '%' || $1 || '%')
        AND ($2 = '' OR categoria = $2)
        AND ($3 = '' OR especies ILIKE '%' || $3 || '%')
        AND ($4 OR activo)
      ORDER BY codigo ASC, nombre ASC`,
    [q, categoria, especie, verBajas],
  );
}
