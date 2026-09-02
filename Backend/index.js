// index.js
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const session = require('express-session');
const cookieParser = require('cookie-parser');
const app = express();
const port = process.env.PORT || 5000;
const bodyParser = require("body-parser");
const morgan = require("morgan");
const multer = require("multer");
const path = require("path");

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// ✅ PERMITIR COOKIES SEGURAS DETRÁS DE PROXY REVERSO NGINX (HTTPS)
app.set('trust proxy', 1);

// ✅ CONFIGURAR COOKIE-PARSER (ANTES DE LAS RUTAS)
app.use(cookieParser());

// ========== CONFIGURACIÓN CORS ==========
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8080",
    "http://localhost:4173",
    "https://chinazosapp.up.railway.app",
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
    cors({
        origin: function (origin, callback) {
            // Permitir peticiones sin origin (ej. apps móviles, Postman o curl)
            if (!origin) return callback(null, true);
            if (
                allowedOrigins.indexOf(origin) !== -1 ||
                /^http:\/\/localhost:\d+$/.test(origin) ||
                /^http:\/\/127\.0\.0\.1:\d+$/.test(origin) ||
                (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) ||
                origin.endsWith('.up.railway.app')
            ) {
                return callback(null, true);
            }
            return callback(null, false); // No arrojar Error para evitar 500 Internal Server Error
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
    })
);

// ========== CONFIGURACIÓN DE SESIONES ==========
app.use(session({
    secret: process.env.SESSION_SECRET || 'chinazo_secret_key_2026',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));

// Middlewares
app.use(morgan("dev"));

// ========== CONFIGURACIÓN DE MULTER PARA FOTOS ==========
const fs = require('fs');
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// ========== ENDPOINT PARA SUBIR IMÁGENES ==========
app.post("/upload", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).send("No se subió ningún archivo.");
    }
    res.json({ 
        message: "Imagen subida correctamente", 
        filename: req.file.filename 
    });
});

// ========== SERVIR ARCHIVOS ESTÁTICOS ==========
app.use("/api/files", express.static(path.join(__dirname, "uploads")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ========== RUTAS ==========
app.use("/api/chinazo/sicarios", require(path.join(__dirname, "src/routes/sicario.routes")));
app.use("/api/chinazo/chinazos", require(path.join(__dirname, "src/routes/chinazo.routes")));
app.use("/api/chinazo/ganadores", require(path.join(__dirname, "src/routes/ganador.routes")));
app.use("/api/votos", require(path.join(__dirname, "src/routes/voto.routes")));

// ========== INICIAR SERVIDOR ==========
app.listen(port, () => {
    console.log(`🚀 Servidor corriendo en puerto ${port}`);
    console.log(`📁 Uploads: /uploads`);
    console.log(`📡 API: /api`);
});