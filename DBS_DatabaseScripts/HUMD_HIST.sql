create procedure historic_humd (
IN ini_date date,
IN end_date date
)
begin

	SELECT Value, `Date`, `Time` FROM weather_db.humedad h 
	where Date >= ini_date and Date <= end_date
	order by Date asc;
end

