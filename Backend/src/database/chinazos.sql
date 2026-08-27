-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         12.3.2-MariaDB - MariaDB Server
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.17.0.7270
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para chinazos
CREATE DATABASE IF NOT EXISTS `chinazos` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */;
USE `chinazos`;

-- Volcando estructura para tabla chinazos.chinazos
CREATE TABLE IF NOT EXISTS `chinazos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `quien_dijo_id` int(11) NOT NULL,
  `chinazo` text NOT NULL,
  `fecha` char(10) NOT NULL,
  `anotado_por_id` int(11) NOT NULL,
  `fecha_registro` char(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_chinazos_fecha` (`fecha`),
  KEY `idx_chinazos_quien_dijo` (`quien_dijo_id`),
  KEY `idx_chinazos_anotado_por` (`anotado_por_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla chinazos.ganadores
CREATE TABLE IF NOT EXISTS `ganadores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `chinazo_id` int(11) NOT NULL,
  `mes` char(7) NOT NULL,
  `total_votos` int(11) NOT NULL,
  `total_votantes` int(11) NOT NULL,
  `porcentaje` decimal(5,2) NOT NULL,
  `fecha_registro` char(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_mes` (`mes`),
  KEY `idx_ganadores_mes` (`mes`),
  KEY `idx_ganadores_chinazo` (`chinazo_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla chinazos.sicarios
CREATE TABLE IF NOT EXISTS `sicarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `alias` varchar(50) NOT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `fecha_registro` char(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `alias` (`alias`),
  KEY `idx_sicarios_alias` (`alias`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla chinazos.votos
CREATE TABLE IF NOT EXISTS `votos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `chinazo_id` int(11) NOT NULL,
  `device_id` varchar(100) NOT NULL,
  `fecha_voto` char(10) DEFAULT NULL,
  `fecha_registro` char(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_voto_chinazo_device` (`chinazo_id`,`device_id`),
  KEY `idx_votos_chinazo` (`chinazo_id`),
  KEY `idx_votos_device` (`device_id`),
  KEY `idx_votos_fecha` (`fecha_voto`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- La exportación de datos fue deseleccionada.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
