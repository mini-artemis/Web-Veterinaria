import React, { useState, useEffect } from 'react';
import './App.css';

// Lista de imágenes para el carrusel de la veterinaria
const heroImages = [
  "https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&w=1920&q=80", // Perro feliz
  "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1920&q=80", // Gato tierno
  "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=1920&q=80"  // Perrito cachorro
];

function App() {
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
    <div className="vet-container">
      {/* NAVEGACIÓN */}
      <nav className="vet-nav">
        <div className="vet-logo">VET<span>CARE</span></div>
        <div className="vet-links">
          <a href="#">Inicio</a>
          <a href="#">Servicios</a>
          <a href="#">Especialistas</a>
          <a href="#">Nosotros</a>
        </div>
        <button className="vet-btn-primary">Agendar Cita</button>
      </nav>

      {/* SECCIÓN PRINCIPAL (HERO CON CARRUSEL MANUAL/AUTOMÁTICO Y DIFUMINADO) */}
      <header className="vet-hero" style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${heroImages[currentImageIndex]})` }}>
        
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

      {/* FOOTER / INFORMACIÓN DE CONTACTO Y REDES SOCIALES */}
      <footer className="vet-footer">
        <div className="vet-footer-content">
          <div className="footer-col">
            <h3>VET<span>CARE</span></h3>
            <p>Brindando amor y salud para tus mejores amigos desde 2016.</p>
          </div>
          <div className="footer-col">
            <h4>Contacto</h4>
            <p>📍 Av. de las Mascotas #123, Col. Del Parque</p>
            <p>📞 Teléfono: +52 (55) 1234-5678</p>
            <p>✉️ Correo: contacto@vetcare.com</p>
          </div>
          <div className="footer-col">
            <h4>Síguenos en Redes</h4>
            <div className="social-links">
              <a href="#" target="_blank" rel="noreferrer">Facebook</a>
              <a href="#" target="_blank" rel="noreferrer">Instagram</a>
              <a href="#" target="_blank" rel="noreferrer">WhatsApp</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 VetCare. Proyecto escolar de veterinaria.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;