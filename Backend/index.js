// index.js
const express = require("express");
const cors = require("cors");
const session = require('express-session');
const cookieParser = require('cookie-parser'); // ✅ NUEVO
const app = express();
const port = 5000;
const bodyParser = require("body-parser");
const morgan = require("morgan");
const multer = require("multer");
const path = require("path");

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// ✅ CONFIGURAR COOKIE-PARSER (ANTES DE LAS RUTAS)
app.use(cookieParser());

// ========== CONFIGURACIÓN CORS ==========
app.use(
    cors({
        origin: ["http://localhost:3000", "http://localhost:5173"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
);

// ========== CONFIGURACIÓN DE SESIONES ==========
app.use(session({
    secret: 'chinazo_secret_key_2026',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
        httpOnly: true,
        sameSite: 'lax'
    }
}));

// Middlewares
app.use(morgan("dev"));

// ========== CONFIGURACIÓN DE MULTER PARA FOTOS ==========
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
    console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
    console.log(`📁 Uploads: http://localhost:${port}/uploads`);
    console.log(`📡 API: http://localhost:${port}/api`);
});