-- weather_db.humedad definition

CREATE TABLE `humedad` (
  `Value` decimal(10,2) NOT NULL DEFAULT '0',
  `Date` date NOT NULL,
  `Time` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;