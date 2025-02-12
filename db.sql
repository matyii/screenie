-- --------------------------------------------------------
-- Host:                         192.168.0.18
-- Server version:               10.11.10-MariaDB-deb12 - mariadb.org binary distribution
-- Server OS:                    debian-linux-gnu
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for screenie
CREATE DATABASE IF NOT EXISTS `screenie` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `screenie`;

-- Dumping structure for table screenie.archives
CREATE TABLE IF NOT EXISTS `archives` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `file_name` varchar(255) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `valid` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `archives_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table screenie.archives: ~0 rows (approximately)

-- Dumping structure for table screenie.badges
CREATE TABLE IF NOT EXISTS `badges` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `color` varchar(7) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table screenie.badges: ~2 rows (approximately)
INSERT INTO `badges` (`id`, `name`, `color`) VALUES
	(1, 'Early User', 'warning'),
	(2, 'Bug Hunter', 'accent');

-- Dumping structure for table screenie.domains
CREATE TABLE IF NOT EXISTS `domains` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `domain_name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table screenie.domains: ~4 rows (approximately)
INSERT INTO `domains` (`id`, `domain_name`) VALUES
	(1, 'localhost'),
	(3, '127.0.0.1'),
	(4, 'fbi.com'),
	(6, 'localtest.me');

-- Dumping structure for table screenie.permission_levels
CREATE TABLE IF NOT EXISTS `permission_levels` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `color` tinytext DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=102 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table screenie.permission_levels: ~4 rows (approximately)
INSERT INTO `permission_levels` (`id`, `name`, `color`) VALUES
	(1, 'User', 'neutral'),
	(2, 'Moderator', 'info'),
	(3, 'Admin', 'warning'),
	(100, 'Owner', 'error'),
	(1000, 'Server Administrator', 'accent');

-- Dumping structure for table screenie.storage_capacities
CREATE TABLE IF NOT EXISTS `storage_capacities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` tinytext DEFAULT NULL,
  `capacity` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table screenie.storage_capacities: ~3 rows (approximately)
INSERT INTO `storage_capacities` (`id`, `name`, `capacity`) VALUES
	(1, 'Basic', 512),
	(2, 'Pro', 1024),
	(3, 'Diamond', 1048576);

-- Dumping structure for table screenie.uploads
CREATE TABLE IF NOT EXISTS `uploads` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `file_name` varchar(255) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `url` varchar(255) NOT NULL,
  `raw_url` varchar(255) NOT NULL,
  `embed_title` varchar(255) DEFAULT NULL,
  `embed_description` text DEFAULT NULL,
  `embed_color` varchar(7) DEFAULT NULL,
  `upload_date` datetime NOT NULL,
  `embed_url` varchar(255) DEFAULT NULL,
  `embed_image` varchar(255) DEFAULT NULL,
  `embed_footer` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `uploads_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table screenie.uploads: ~0 rows (approximately)

-- Dumping structure for table screenie.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `discord_id` varchar(255) DEFAULT NULL,
  `upload_key` varchar(255) DEFAULT NULL,
  `domain` varchar(255) DEFAULT NULL,
  `subdomain` varchar(255) DEFAULT NULL,
  `embed_author` varchar(255) DEFAULT NULL,
  `embed_title` varchar(255) DEFAULT NULL,
  `embed_description` varchar(255) DEFAULT NULL,
  `embed_color` varchar(7) DEFAULT NULL,
  `embed_url` varchar(255) DEFAULT NULL,
  `embed_image` varchar(255) DEFAULT NULL,
  `embed_footer` varchar(255) DEFAULT NULL,
  `registration_date` datetime DEFAULT NULL,
  `private` tinyint(4) DEFAULT 0,
  `profile_picture` varchar(255) DEFAULT NULL,
  `vanityURL` varchar(255) DEFAULT NULL,
  `permission_level` int(11) DEFAULT 1,
  `badges` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `storage_capacity_id` int(11) DEFAULT 1,
  `youtubeURL` varchar(255) DEFAULT NULL,
  `pronouns` tinytext DEFAULT NULL,
  `bio` varchar(255) DEFAULT NULL,
  `hideNavbar` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `storage_capacity_id` (`storage_capacity_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`storage_capacity_id`) REFERENCES `storage_capacities` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table screenie.users: ~0 rows (approximately)

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
