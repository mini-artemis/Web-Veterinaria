import { useState, useEffect } from 'react';
import logoVeterinaria from '../assets/LogoVeterinaria.jpeg';
import Veterinaria1 from '../assets/Veterinaria1.jpeg';
import Veterinaria2 from '../assets/Veterinaria2.jpeg';

// Servicios principales que se muestran en la página de inicio
const servicios = [
  { icono: '🩺', titulo: 'Consulta general', texto: 'Revisión completa, diagnóstico y tratamiento para perros, gatos y otras mascotas pequeñas.' },
  { icono: '💉', titulo: 'Vacunación y desparasitación', texto: 'Esquemas completos para cachorros y adultos, con recordatorios de tus próximas dosis.' },
  { icono: '🏥', titulo: 'Cirugía', texto: 'Esterilizaciones y cirugías generales en quirófano equipado, con monitoreo constante.' },
  { icono: '🔬', titulo: 'Laboratorio', texto: 'Análisis de sangre, orina y coprológicos con resultados el mismo día.' },
  { icono: '🛁', titulo: 'Estética y baño', texto: 'Baño, corte de pelo, corte de uñas y limpieza de oídos con productos especiales.' },
  { icono: '🛏️', titulo: 'Hospitalización', texto: 'Cuidado las 24 horas para mascotas que necesitan observación o recuperación.' },
];

// Pasos para agendar una cita
const pasosCita = [
  { titulo: 'Contáctanos', texto: 'Llámanos, escríbenos por WhatsApp o usa el botón "Agendar Cita".' },
  { titulo: 'Elige tu horario', texto: 'Te ofrecemos el día y la hora que mejor te acomoden.' },
  { titulo: 'Visítanos', texto: 'Llega unos minutos antes con la cartilla de vacunación de tu mascota.' },
];

// Opiniones de clientes
const testimonios = [
  { texto: 'Atendieron a mi perrita en una urgencia a medianoche y la trataron con muchísimo cariño. ¡Muy recomendados!', nombre: 'Mariana G.', mascota: 'Luna, Golden Retriever' },
  { texto: 'Mi gato odia salir de casa, pero aquí siempre lo tratan con paciencia. El doctor explica todo muy claro.', nombre: 'Carlos R.', mascota: 'Michi, gato doméstico' },
  { texto: 'Los precios son justos y me mandan recordatorios de las vacunas. Ya no se me olvida ninguna.', nombre: 'Sofía L.', mascota: 'Rocky, Schnauzer' },
];

// Horario de atención
const horarios = [
  { dia: 'Lunes a viernes', hora: '9:00 – 20:00' },
  { dia: 'Sábado', hora: '9:00 – 15:00' },
  { dia: 'Domingo', hora: '10:00 – 14:00' },
  { dia: 'Urgencias', hora: '24 horas, todos los días' },
];

// Lista de imágenes para el carrusel de la veterinaria
const heroImages = [
  {
    src: logoVeterinaria,
    alt: 'Logo de la clinica',
  },
  {
    src: Veterinaria1,
    alt: 'Imagen de la veterinaria 1',
  },
  {
    src: Veterinaria2,
    alt: 'Imagen de la veterinaria 2',
  },
];

function Inicio() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Cambio automático cada 4 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Funciones para pasar las fotos manualmente con los botones
  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + heroImages.length) % heroImages.length);
  };

  return (
    <>
      {/* SECCIÓN PRINCIPAL (HERO CON CARRUSEL MANUAL/AUTOMÁTICO Y DIFUMINADO) */}
      <header className="vet-hero" style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${heroImages[currentImageIndex].src})` }}>

        {/* Botones de navegación manual del carrusel */}
        <button className="carousel-btn prev-btn" onClick={prevImage}>&#10094;</button>
        <button className="carousel-btn next-btn" onClick={nextImage}>&#10095;</button>

        <div className="vet-hero-content">
          <h1>CUIDAMOS A TU MASCOTA</h1>
          <p>Atención veterinaria de primer nivel, instalaciones modernas y profesionales apasionados listos para ayudarte en todo momento.</p>
          <button className="vet-btn-light">Agendar Consulta</button>
        </div>
        {/* Capa de difuminado inferior */}
        <div className="vet-hero-fade"></div>
      </header>

      {/* SECCIÓN DE BENEFICIOS */}
      <section className="vet-features">
        <h2>Por qué elegirnos</h2>
        <div className="vet-cards">
          <div className="vet-card">
            <h3>Expertos Calificados</h3>
            <p>Médicos veterinarios especializados en distintas áreas para el cuidado ideal de tu animal de compañía.</p>
          </div>
          <div className="vet-card">
            <h3>Historial Digital</h3>
            <p>Lleva el control de vacunas, recetas y próximas citas de forma organizada.</p>
          </div>
          <div className="vet-card">
            <h3>Urgencias 24/7</h3>
            <p>Estamos disponibles a cualquier hora para atender cualquier emergencia imprevista.</p>
          </div>
        </div>
      </section>

      {/* SERVICIOS PRINCIPALES */}
      <section className="vet-section vet-section-alt">
        <div className="vet-section-inner">
          <div className="vet-section-head">
            <h2>Nuestros servicios</h2>
            <p>Todo lo que tu mascota necesita para estar sana y feliz, en un solo lugar.</p>
          </div>
          <div className="vet-grid">
            {servicios.map((servicio) => (
              <div key={servicio.titulo} className="vet-service">
                <span className="vet-service-icon" aria-hidden="true">{servicio.icono}</span>
                <h3>{servicio.titulo}</h3>
                <p>{servicio.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO AGENDAR UNA CITA */}
      <section className="vet-section">
        <div className="vet-section-inner">
          <div className="vet-section-head">
            <h2>Agenda tu cita en 3 pasos</h2>
            <p>Sin complicaciones y sin largas esperas.</p>
          </div>
          <ol className="vet-steps">
            {pasosCita.map((paso, i) => (
              <li key={paso.titulo}>
                <span className="vet-step-num">{i + 1}</span>
                <h3>{paso.titulo}</h3>
                <p>{paso.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="vet-section vet-section-alt">
        <div className="vet-section-inner">
          <div className="vet-section-head">
            <h2>Lo que dicen nuestros clientes</h2>
            <p>La confianza de las familias es nuestra mejor carta de presentación.</p>
          </div>
          <div className="vet-grid">
            {testimonios.map((testimonio) => (
              <figure key={testimonio.nombre} className="vet-testimonial">
                <span className="vet-stars" aria-label="5 de 5 estrellas">★★★★★</span>
                <blockquote>“{testimonio.texto}”</blockquote>
                <figcaption>
                  <strong>{testimonio.nombre}</strong>
                  <span>{testimonio.mascota}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* HORARIOS Y UBICACIÓN */}
      <section className="vet-section">
        <div className="vet-section-inner vet-info">
          <div className="vet-info-card">
            <h2>Horario de atención</h2>
            <dl className="vet-hours">
              {horarios.map((horario) => (
                <div key={horario.dia}>
                  <dt>{horario.dia}</dt>
                  <dd>{horario.hora}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="vet-info-card">
            <h2>Visítanos</h2>
            <p>📍 Av. de las Mascotas #123, Col. Del Parque</p>
            <p>📞 +52 (55) 1234-5678</p>
            <p>✉️ contacto@puppyandkitty.com</p>
            <p className="vet-info-note">Contamos con estacionamiento gratuito y sala de espera separada para perros y gatos.</p>
          </div>
        </div>
      </section>

      {/* LLAMADO A LA ACCIÓN */}
      <section className="vet-cta">
        <h2>¿Tu mascota necesita atención?</h2>
        <p>Agenda hoy mismo y recibe una revisión general con el cariño que merece.</p>
        <button className="vet-btn-light">Agendar Consulta</button>
      </section>
    </>
  );
}

export default Inicio;
