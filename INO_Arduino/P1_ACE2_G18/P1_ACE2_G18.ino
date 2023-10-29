#define MQ135pin (3) 

const int sensorPin = A1;   // Pin analógico del sensor KY-018 conectado a A0 de Arduino

// Variables para la calibración. Ajusta estos valores según tu calibración.
const int valorMinimo = 0;   // Valor mínimo leído por el sensor en completa oscuridad
const int valorMaximo = 1023;  // Valor máximo leído por el sensor en una fuente de luz conocida

#include <DHT.h>
 
// Definimos el pin digital donde se conecta el sensor
#define DHTPIN 2
// Dependiendo del tipo de sensor
#define DHTTYPE DHT11
 
// Inicializamos el sensor DHT11
DHT dht(DHTPIN, DHTTYPE);
float sensorValue; //variable para guardar el valor analógico del sensor

void setup()
{
  Serial.begin(9600); // Inicializamos el puerto serial a 9600
  // Comenzamos el sensor DHT
  dht.begin();
  
}

void loop()
{
  float temperatura = MedirTemperatura();
  float humedad = MedirHumedad();
  float lumen = MedirLuz();
  float co2 = MedirCo2();
  
  if(MedicionesValidas(temperatura, humedad, lumen, co2)){
      Serial.print(temperatura);
      Serial.print(",");
      //delay(1000);
      Serial.print(humedad);
      Serial.print(",");
      //delay(1000);
      Serial.print(lumen);
      Serial.print(",");
      //delay(1000);
      Serial.print(co2);
      Serial.println();
      delay(1000);    
    }

}

bool MedicionesValidas(float temperatura, float humedad, float lumen, float co2) {
  // Verificar si alguna medición es NaN
  if (isnan(temperatura) || isnan(humedad) || isnan(lumen) || isnan(co2)) {
    return false;
  }
  return true;
}


float MedirCo2(){
  sensorValue = analogRead(MQ135pin); // lectura de la entrada analogica "A0""
  return sensorValue;
}

float MedirTemperatura(){
   // Leemos la temperatura en grados centígrados (por defecto)
  float t = dht.readTemperature();
  return t;
}

float MedirHumedad(){
  // Leemos la humedad relativa
  float h = dht.readHumidity();
  return h;
}

 float MedirLuz(){
  float lecturaSensor = analogRead(sensorPin); // Leer el valor analógico del sensor
  float voltage = lecturaSensor * (5.0/1025) * 1000;
  float resistencia = 10000 * (voltage / (5000.0 - voltage));
  // Realizar la conversión utilizando una regla de tres simple para ajustar el rango leído al rango de lux
  float lux = (500.0 / resistencia) * 1000;
  return lux;  
}
