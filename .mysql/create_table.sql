DROP DATABASE IF EXISTS `app_development`;
CREATE DATABASE `app_development`;

DROP TABLE IF EXISTS `app_development`.`images`;
CREATE TABLE `app_development`.`images` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `file_name` varchar(255) NOT NULL,
  `path` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
