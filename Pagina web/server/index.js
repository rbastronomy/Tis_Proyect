const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// Sirve los archivos estáticos de React desde la carpeta "cliente/build"
app.use(express.static(path.join(__dirname, '../cliente/build')));

// Define una ruta para las peticiones a la API (puedes modificarlo según tu lógica)
app.get('/api/saludo', (req, res) => {
    res.json({ mensaje: '¡Hola desde el servidor Node.js!' });
});

// Sirve la aplicación React para todas las rutas no definidas
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../cliente/build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
