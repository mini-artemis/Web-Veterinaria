import { useState, useEffect } from 'react';
import './App.css';
import Inicio from './pages/Inicio';
import Nosotros from './pages/Nosotros';

// Lee la página a mostrar desde la dirección (ej. #/nosotros)
const getPage = () => (window.location.hash === '#/nosotros' ? 'nosotros' : 'inicio');

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [page, setPage] = useState(getPage);

  // Cambia de página cuando cambia la dirección y regresa al inicio de la pantalla
  useEffect(() => {
    const onHashChange = () => {
      setPage(getPage());
      setMenuOpen(false);
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Con el menú abierto no se desplaza la página y la tecla Esc lo cierra
  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEsc = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEsc);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', closeOnEsc);
    };
  }, [menuOpen]);

  return (
    <div className="vet-container">
      {/* NAVEGACIÓN */}
      <nav className="vet-nav">
        <a href="#/" className="vet-logo">Puppy and <span>Kitty</span></a>
        {/* Botón de menú (solo visible en celular) */}
        <button
          className="vet-menu-btn"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
        {/* Fondo difuminado: al tocarlo se cierra el menú (solo en celular) */}
        <div
          className={`vet-menu-backdrop ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(false)}
        ></div>
        <div className={`vet-nav-menu ${menuOpen ? 'open' : ''}`}>
          <div className="vet-links">
            <a href="#/" className={page === 'inicio' ? 'active' : ''} onClick={() => setMenuOpen(false)}>Inicio</a>
            <a href="#" onClick={() => setMenuOpen(false)}>Servicios</a>
            <a href="#" onClick={() => setMenuOpen(false)}>Especialistas</a>
            <a href="#/nosotros" className={page === 'nosotros' ? 'active' : ''} onClick={() => setMenuOpen(false)}>Nosotros</a>
          </div>
          <button className="vet-btn-primary">Agendar Cita</button>
        </div>
      </nav>

      {/* CONTENIDO DE LA PÁGINA ACTUAL */}
      <main className="vet-main">
        {page === 'nosotros' ? <Nosotros /> : <Inicio />}
      </main>

      {/* FOOTER / INFORMACIÓN DE CONTACTO Y REDES SOCIALES */}
      <footer className="vet-footer">
        <div className="vet-footer-content">
          <div className="footer-col">
            <h3>Puppy and <span>Kitty</span></h3>
            <p>Brindando amor y salud para tus mejores amigos desde 2016.</p>
          </div>
          <div className="footer-col">
            <h4>Contacto</h4>
            <p>📍 Av. de las Mascotas #123, Col. Del Parque</p>
            <p>📞 Teléfono: +52 (55) 1234-5678</p>
            <p>✉️ Correo: contacto@puppyandkitty.com</p>
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
          <p>&copy; 2026 Puppy and Kitty. Proyecto escolar de veterinaria.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;