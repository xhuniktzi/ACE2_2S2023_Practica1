create procedure historic_temp (
IN ini_date date,
IN end_date date
)
begin

	SELECT Value, `Date`, `Time` FROM weather_db.temperatura
	where Date >= ini_date and Date <= end_date
	order by Date asc;
end

