-- weather_db.air definition

CREATE TABLE `air` (
  `Value` decimal(10,2) NOT NULL DEFAULT '0',
  `Date` date NOT NULL,
  `Time` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- weather_db.humedad definition

CREATE TABLE `humedad` (
  `Value` decimal(10,2) NOT NULL DEFAULT '0',
  `Date` date NOT NULL,
  `Time` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- weather_db.lumen definition

CREATE TABLE `lumen` (
  `Value` decimal(10,2) NOT NULL DEFAULT '0',
  `Date` date NOT NULL,
  `Time` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- weather_db.temperatura definition

CREATE TABLE `temperatura` (
  `Value` decimal(10,2) NOT NULL DEFAULT '0',
  `Date` date NOT NULL,
  `Time` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

create procedure historic_humd (
IN ini_date date,
IN end_date date
)
begin

	SELECT Value, `Date`, `Time` FROM weather_db.humedad h 
	where Date >= ini_date and Date <= end_date
	order by Date asc;
end

create procedure historic_lumen (
IN ini_date date,
IN end_date date
)
begin

	SELECT Value, `Date`, `Time` FROM weather_db.lumen l
	where Date >= ini_date and Date <= end_date
	order by Date asc;
end

create procedure historic_temp (
IN ini_date date,
IN end_date date
)
begin

	SELECT Value, `Date`, `Time` FROM weather_db.temperatura
	where Date >= ini_date and Date <= end_date
	order by Date asc;
end

create procedure historic_air (
IN ini_date date,
IN end_date date
)
begin

	SELECT Value, `Date`, `Time` FROM weather_db.air
	where Date >= ini_date and Date <= end_date
	order by Date asc;
end
