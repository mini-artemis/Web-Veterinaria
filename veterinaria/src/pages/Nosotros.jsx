import { useState, useEffect, useRef } from 'react';
import logoVeterinaria from '../assets/LogoVeterinaria.jpeg';
import Veterinaria1 from '../assets/Veterinaria1.jpeg';
import Veterinaria2 from '../assets/Veterinaria2.jpeg';

// Capítulos de la historia (scrollytelling): cada uno ocupa una pantalla completa
const capitulos = [
  {
    etiqueta: '2016',
    titulo: 'Así empezamos',
    texto: 'En Puppy and Kitty creemos que las mascotas son parte de la familia. Abrimos nuestras puertas en 2016 con un pequeño consultorio y muchas ganas de cuidar a los perros y gatos de nuestra comunidad.',
    img: Veterinaria1,
  },
  {
    etiqueta: 'Nuestro equipo',
    titulo: 'Crecimos contigo',
    texto: 'Nuestro equipo de médicos veterinarios combina experiencia, tecnología moderna y, sobre todo, mucho cariño para que tu mascota se sienta en casa desde que cruza la puerta.',
    img: Veterinaria2,
  },
  {
    etiqueta: 'Hoy',
    titulo: 'Seguimos cuidando de ellos',
    texto: 'Acompañamos a las mascotas en cada etapa de su vida, desde su primera vacuna hasta sus años dorados.',
    img: logoVeterinaria,
    stats: [
      { numero: '10+', texto: 'Años de experiencia' },
      { numero: '5,000+', texto: 'Mascotas atendidas' },
      { numero: '24/7', texto: 'Atención de urgencias' },
    ],
  },
];

// Equipo de la clínica
const equipo = [
  { iniciales: 'MV', nombre: 'Dra. Ma.Fernanda Velazquéz', puesto: 'Directora médica', texto: 'Medicina interna de perros y gatos. Fundó la clínica en 2016.' },
  { iniciales: 'GV', nombre: 'Dr. Giovanni Vargas', puesto: 'Cirujano', texto: 'Especialista en cirugía general y ortopedia de pequeñas especies.' },
  { iniciales: 'AG', nombre: 'Dr. Ángel Garcia', puesto: 'Medicina felina', texto: 'Experto en el cuidado de gatos y en consultas libres de estrés.' },
  { iniciales: 'JT', nombre: 'Jorge Torres', puesto: 'Estilista canino', texto: 'Se encarga de que cada mascota salga limpia, bonita y tranquila.' },
];

// Lo que hay dentro de la clínica
const instalaciones = [
  'Quirófano equipado con monitoreo de signos vitales',
  'Laboratorio propio con resultados el mismo día',
  'Área de hospitalización con vigilancia las 24 horas',
  'Salas de espera separadas para perros y gatos',
  'Rayos X y ultrasonido',
  'Área de estética y baño',
];

// Preguntas frecuentes
const preguntas = [
  { pregunta: '¿Qué animales atienden?', respuesta: 'Principalmente perros y gatos, y también conejos, hurones y otras mascotas pequeñas.' },
  { pregunta: '¿Necesito cita para una consulta?', respuesta: 'Recomendamos agendar para evitar esperas, pero también recibimos pacientes sin cita según disponibilidad. Las urgencias se atienden de inmediato.' },
  { pregunta: '¿Qué formas de pago aceptan?', respuesta: 'Efectivo, tarjetas de débito y crédito, y transferencia bancaria.' },
  { pregunta: '¿Qué debo llevar a la primera consulta?', respuesta: 'La cartilla de vacunación (si la tienes), el nombre de los medicamentos que toma tu mascota y, para gatos, una transportadora.' },
];

function Nosotros() {
  const [capituloActivo, setCapituloActivo] = useState(0);
  const capitulosRefs = useRef([]);

  // El capítulo que cruza la mitad de la pantalla se vuelve el activo
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setCapituloActivo(Number(entry.target.dataset.index));
        });
      },
      { rootMargin: '-50% 0px -50% 0px' }
    );
    capitulosRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* ENCABEZADO DE LA PÁGINA */}
      <header
        className="vet-page-banner"
        style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${Veterinaria2})` }}
      >
        <h1>Sobre Nosotros</h1>
        <p>Conoce a la familia que cuida de la tuya.</p>
      </header>

      {/* MISIÓN, VISIÓN Y VALORES */}
      <section className="vet-features">
        <h2>Lo que nos mueve</h2>
        <p className="vet-features-intro">
          Somos una clínica veterinaria familiar dedicada al bienestar de perros, gatos y otras mascotas pequeñas.
          Todo lo que hacemos parte de estas tres ideas.
        </p>
        <div className="vet-cards">
          <div className="vet-card">
            <h3>Misión</h3>
            <p>Brindar atención veterinaria de calidad, cercana y responsable para mejorar la vida de las mascotas y sus familias.</p>
          </div>
          <div className="vet-card">
            <h3>Visión</h3>
            <p>Ser la clínica veterinaria de confianza de nuestra comunidad, reconocida por su calidez y excelencia médica.</p>
          </div>
          <div className="vet-card">
            <h3>Valores</h3>
            <p>Amor por los animales, honestidad, compromiso, respeto y mejora constante.</p>
          </div>
        </div>
      </section>

      {/* NUESTRO EQUIPO */}
      <section className="vet-section vet-section-alt">
        <div className="vet-section-inner">
          <div className="vet-section-head">
            <h2>Nuestro equipo</h2>
            <p>Profesionales que aman a los animales tanto como tú.</p>
          </div>
          <div className="vet-grid">
            {equipo.map((persona) => (
              <div key={persona.nombre} className="vet-team-card">
                <span className="vet-avatar" aria-hidden="true">{persona.iniciales}</span>
                <h3>{persona.nombre}</h3>
                <span className="vet-team-role">{persona.puesto}</span>
                <p>{persona.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INSTALACIONES */}
      <section className="vet-section">
        <div className="vet-section-inner vet-split">
          <img className="vet-split-img" src={Veterinaria2} alt="Instalaciones de Puppy and Kitty" />
          <div>
            <h2>Nuestras instalaciones</h2>
            <p>Un espacio limpio, moderno y pensado para que tu mascota esté tranquila en cada visita.</p>
            <ul className="vet-checklist">
              {instalaciones.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* NUESTRA HISTORIA (SCROLLYTELLING) */}
      <section className="vet-story" aria-label="Nuestra historia">
        {/* Fondo fijo que cambia de imagen según el capítulo activo */}
        <div className="vet-story-visual" aria-hidden="true">
          {capitulos.map((capitulo, i) => (
            <div
              key={capitulo.titulo}
              className={`vet-story-bg ${i === capituloActivo ? 'active' : ''}`}
              style={{ backgroundImage: `url(${capitulo.img})` }}
            ></div>
          ))}
          <div className="vet-story-overlay"></div>
          <ol className="vet-story-dots">
            {capitulos.map((capitulo, i) => (
              <li key={capitulo.titulo} className={i === capituloActivo ? 'active' : ''}></li>
            ))}
          </ol>
        </div>

        {/* Textos que van pasando encima del fondo */}
        <div className="vet-story-steps">
          {capitulos.map((capitulo, i) => (
            <article
              key={capitulo.titulo}
              ref={(el) => (capitulosRefs.current[i] = el)}
              data-index={i}
              className={`vet-story-step ${i === capituloActivo ? 'active' : ''}`}
            >
              <div className="vet-story-card">
                <span className="vet-story-num">{capitulo.etiqueta}</span>
                <h2>{capitulo.titulo}</h2>
                <p>{capitulo.texto}</p>
                {capitulo.stats && (
                  <div className="vet-about-stats">
                    {capitulo.stats.map((stat) => (
                      <div key={stat.texto}>
                        <span className="vet-stat-number">{stat.numero}</span>
                        <span className="vet-stat-label">{stat.texto}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* PREGUNTAS FRECUENTES */}
      <section className="vet-section vet-section-alt">
        <div className="vet-section-inner vet-faq">
          <div className="vet-section-head">
            <h2>Preguntas frecuentes</h2>
            <p>Si tienes otra duda, escríbenos y con gusto te ayudamos.</p>
          </div>
          {preguntas.map((item) => (
            <details key={item.pregunta}>
              <summary>{item.pregunta}</summary>
              <p>{item.respuesta}</p>
            </details>
          ))}
        </div>
      </section>

      {/* LLAMADO A LA ACCIÓN */}
      <section className="vet-cta">
        <h2>Conócenos en persona</h2>
        <p>Ven a visitarnos con tu mascota. Te mostramos la clínica y resolvemos todas tus dudas.</p>
        <button className="vet-btn-light">Agendar Cita</button>
      </section>
    </>
  );
}

export default Nosotros;
