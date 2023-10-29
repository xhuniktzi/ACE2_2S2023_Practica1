-- weather_db.temperatura definition

CREATE TABLE `temperatura` (
  `Value` decimal(10,2) NOT NULL DEFAULT '0',
  `Datetime` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;