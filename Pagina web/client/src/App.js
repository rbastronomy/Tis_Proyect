import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      {/* Header with navigation */}
      <header className="App-header">
        <div className="logo">Taxi Aeropuerto</div>
        <nav className="nav-links">
          <a href="#home">Inicio</a>
          <a href="#about">Sobre Nosotros</a>
          <a href="#services">Servicios</a>
          <a href="#contact">Contacto</a>
        </nav>
      </header>

      <div className="container">
        {/* Left section with search bar */}
        <div className="search-section">
          <h1>Taxi Aeropuerto</h1>
          <p>¡Ingresa la dirección para pedir tu taxi!</p>
          <input type="text" placeholder="Ingresa tu destino" className="search-bar" />
          <button className="search-button">Buscar Taxi</button>
        </div>

        {/* Right section with map */}
        <div className="map-section">
          <iframe
            title="Iquique Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13474.414444256749!2d-70.14722465694053!3d-20.21321130764373!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x915c1fc12bdbed6b%3A0x78ff4e5b51f450d2!2sIquique%2C%20Tarapac%C3%A1!5e0!3m2!1ses!2scl!4v1633871229576!5m2!1ses!2scl"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  );
}

export default App;
