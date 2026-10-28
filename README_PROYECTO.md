# Lumina • Movilidad Segura y Confiable (Versión Pro & Fluida)

Prototipo de aplicación móvil de transporte desarrollado a partir del diseño de Figma, diseñado para **hombres y mujeres** con arquitectura de alta fidelidad, animaciones fluidas, efectos de sonido hápticos y sincronización en tiempo real.

Simula la operación en **Chimbote y Nuevo Chimbote (Áncash, Perú)** con importes en soles (PEN) y las reglas de negocio de la Documentación Técnica Maestra ejecutándose en el navegador (tarifa fija, PIN, matching, efectivo/billetera, cancelaciones y SOS), más un **Panel Administrativo** (doc 7.2) con mapa en vivo, KYC, centro SOS, finanzas y una consola que muestra el contrato de API REST y eventos WebSocket de la Parte V.

---

## 🌟 Nuevas Mejoras Profesionales y Fluidez Avanzada

### 1. 🎵 Efectos de Sonido Hápticos Nativos (Web Audio API)
- Sintetizador de audio en tiempo real integrado directamente en el navegador sin dependencias lentas ni archivos de audio pesados.
- Sonido suave de pulsación al tocar botones interactivos.
- Efecto sonoro de escaneo biométrico con frecuencia ascendente.
- Sonido característico de notificación de nueva solicitud (*radar chime*) para la pantalla de conductora.
- Melodía armónica de éxito al validar el PIN y al completar el viaje.
- Sirena de advertencia en el protocolo de emergencia SOS.
- Control en el encabezado para activar/silenciar el audio (*Audio FX / Mudo*).

### 2. 🏝️ Dynamic Island Reactiva (Live Activity iOS 17/18)
- En la parte superior de cada teléfono, la Dynamic Island reacciona en vivo al estado del viaje:
  - **Buscando:** Pulso verde con estado activo.
  - **Conductora asignada:** *"Camila en camino • 4 min"*.
  - **Llegada:** *"¡En el lobby principal!"*.
  - **En marcha:** Indicador con minutos restantes en tiempo real.
  - **Completado:** Badge de viaje seguro finalizado.

### 3. 📹 Escáner Biométrico con Cámara Web Real
- En la pantalla de verificación de identidad, el usuario puede alternar entre la silueta cibernética 3D o **activar la cámara web de su laptop/PC en tiempo real**.
- La cámara muestra el rostro del usuario con el haz de luz láser verde esmeralda y el retículo biométrico.
- Cálculo de cotejo facial (99.4%) y cifrado local SHA-256.

### 4. 🗺️ Selector Dinámico de Destinos en Chimbote y Nuevo Chimbote
- En la configuración de ruta, al tocar el destino se despliega un selector con los puntos de mayor demanda de la ciudad (todos con tarifa calculada por el motor tarifario, no escrita a mano):
  - *Megaplaza Chimbote (Av. Panamericana Norte Km 424)*: 5.6 km • 14 min
  - *Plaza de Armas de Chimbote*: 8.2 km • 18 min
  - *Universidad Nacional del Santa (UNS)*: 1.8 km • 6 min
  - *Hospital Regional Eleazar Guzmán Barrón*: 2.4 km • 7 min
  - *Malecón Grau y Bahía El Ferrol*: 9.1 km • 20 min
- **"Abrir Google Maps (Chimbote y Nuevo Chimbote)"** abre el modal de Leaflet con teselas reales de Google (Calles / Satélite): arrastra los pines A (recogida) y B (destino), el modal recalcula distancia (Haversine), minutos y tarifa, y al tocar *Aplicar Ruta en Chimbote* ambos teléfonos quedan sincronizados con esa ruta.

### 5. 🚗 Mapa Nocturno con Estela de Partículas Luminosas
- El vehículo en movimiento genera una estela de partículas de luz verde neón (`particle trail`) que se desvanece suavemente a su paso.
- Manzanas urbanas con ventanas tenues, trazado Bézier suave y brújula táctica.

### 6. 📱 Chasis Móvil de Titanio y Transiciones de Página Cinematográficas
- Marcos con bisel de titanio pulido (`linear-gradient` metálico), reflejo de cristal diagonal hiperrealista y sombras ambientales profundas.
- Transiciones `cubic-bezier(0.16, 1, 0.3, 1)` suaves sin saltos bruscos.
- Botón de **"Pantalla Completa"** en el header para proyectar limpiamente en auditorios o salones de clase.

---

## 🧮 Reglas de negocio implementadas (Documentación Técnica Maestra)

Toda la lógica vive en `src/utils/transportValidators.js` (funciones puras y testeables) y la orquesta `src/context/TransportContext.jsx`, que simula en el navegador el comportamiento del backend documentado. No hay tarifas, PIN ni conductores escritos a mano en las pantallas.

| Documento | Regla | Cómo se ve en el prototipo |
| --- | --- | --- |
| 5.1 | **Tarifa fija**: `S/ 5.00 base + S/ 1.80/km (S/ 2.10 nocturno, S/ 2.30 comfort) + S/ 0.15/min`, mínima S/ 6.00, redondeo al alza a S/ 0.50 | Pantalla "Revisa y confirma" muestra el desglose (base, km, min) y el mismo número usa el teléfono de la conductora |
| 5.2 | **Matching por cercanía**: radio 5 km, orden por distancia, máximo 5 candidatos, job de 15 s por candidato | Panel "Oferta X de 5 • expira en Ys"; si nadie responde, *Ninguna conductora aceptó en 15 s* |
| 5.3 | **PIN de abordaje** aleatorio de 4 dígitos por viaje, sólo se comparte dentro del vehículo correcto | El pasajero lo ve en su pantalla; la conductora debe escribirlo: si no coincide, el viaje sigue bloqueado |
| 7.1 | **Validaciones Perú**: DNI 8 dígitos, celular 9 dígitos iniciando en 9, placa formato Áncash (H2B-419) | Altas de pasajero y conductora |
| 8.1 | **Pago en efectivo**: la comisión del 15 % no pasa por pasarela y queda como deuda; bloqueo del "ponerse en línea" al llegar a −S/ 50.00 | Recibo "Efectivo entregado en mano", tarjeta Billetera en el dashboard, modal de deuda y pago vía Yape/Plin |
| 8.2 | **Cancelaciones**: gratis en los primeros 3 min, después S/ 3.00 que se acreditan a la conductora; tasa de aceptación mínima 80 %, cada rechazo no respondido resta 7 puntos | Botón "Cancelar viaje (sin cargo / con cargo)", ganancia de hoy +S/ 3.00, conductora bloqueada bajo 80 % |
| 8.3 | **SOS**: alerta con coordenadas del viaje (posición interpolada), destino, placa y contacto de emergencia; enlace prioritario con PNP 105 | Modal "Protocolo SOS activado" con cuenta regresiva de 5 s y los dos botones de llamada |

La comisión trunca a céntimos (nunca redondea al alza) y el neto es el residuo, de modo que `comisión + ganancia neta = tarifa fija` al céntimo exacto.

### Estados del viaje
`IDLE → REQUESTING → DRIVER_ACCEPTED → DRIVER_ARRIVED → IN_PROGRESS → COMPLETED`, con las ramas `CANCELLED` (con o sin cargo) y `NO_DRIVER` (rotación agotada). El estado actual se muestra en el pie de la vista de sustentación.

### Controles de sustentación ("Casos borde")
En el pie de página, además del stepper de 8 pantallas de pasajero y 6 de conductora, hay cuatro botones que disparam las reglas sin esperar el reloj real:
- **Conductora no responde** → expira el job de 15 s, penaliza la tasa y pasa al siguiente candidato.
- **Cancelación gratis** → cancela dentro de los 3 minutos.
- **Cancelación +3 min (S/ 3)** → monta el viaje aceptado y aplica la penalización de S/ 3.00.
- **Deuda efectivo S/ 50** → lleva la billetera al límite y bloquea el turno hasta pagar con Yape/Plin.

### 5.1 Contrato de API y WebSocket simulado (Partes V, doc 6.1 y 6.2)
El prototipo no levanta backend, pero **cada acción de las dos apps emite el evento exacto que documenta la Parte V**, visible en vivo en *Panel Admin → API / WebSocket*:

| Documento | Evento simulado | Se dispara cuando… |
| --- | --- | --- |
| 6.1 | `POST /api/auth/login` → 200 JWT | abre la demo (una sola vez, roles `passenger` + `driver`) |
| 6.1 | `POST /api/trips/estimate` | el pasajero confirma el destino (Km, min, perfil y tarifa del motor tarifario) |
| 6.1 | `POST /api/trips/request` | se solicita el viaje (`status=REQUESTING` + Nº de candidatas en radio de 5 km) |
| 6.2 | `WS matching_candidate_expired` | un candidato deja vencer su job de 15 s o rechaza |
| 6.1 | `PATCH /api/trips/:id/accept` | la conductora acepta (`status=ACCEPTED`) |
| 6.1 | `POST /api/trips/:id/verify-pin` | se escribe el PIN → `200` (inicia) o `401` (viaje bloqueado) |
| 6.1 | `PATCH /api/trips/:id/cancel` | el pasajero cancela, con o sin cargo de S/ 3.00 |
| 6.1 | `PATCH /api/trips/:id/finish` | el viaje llega a destino (tarifa, comisión, neto y método de pago) |
| 6.2 | `WS wallet_balance_updated` | el viaje fue en efectivo y la comisión quedó como deuda |
| 6.1 | `POST /api/drivers/location` | cada 3 s mientras el viaje está `IN_PROGRESS` (lat/lng interpolados) |
| 6.2 | `WS driver_location_update` | reenvío del punto anterior a la sala `trip_actual` |
| 6.2 | `WS trip_status_changed` | cualquier cambio de estado del viaje |
| 6.2 | `WS sos_triggered` | se activa el botón de pánico (coordenadas + conductora + placa) |

### 5.2 Panel Administrativo / Backoffice (doc 7.2)
Cuarta vista en el header (**Panel Admin**), construida en React sobre los mismos datos del `Context`:
- **Mapa en vivo**: Leaflet con las teselas de Google; puntos `#00E599` libres, `#38BDF8` en viaje, ámbar si su KYC no está aprobado, rojo con radio SOS, y polyline punteado con la ruta del viaje activo.
- **KYC (Know Your Customer)**: listado de `verification_status`, licencia y vencimiento de SOAT por conductor (campos de la tabla `drivers`, doc 4.2). *Aprobar* o *Rechazar* **altera la cola de matching en el instante**: el motor `filterVerifiedDrivers` sólo deja entrar a quienes tienen `APPROVED`.
- **Centro SOS**: escucha el evento `sos_triggered` y muestra la alerta con destino, placa y hora, con enlace directo a la PNP 105.
- **Finanzas**: billeteras (`wallet_balance`) y deudas por viajes en efectivo con el límite −S/ 50.00; el botón *Cobrar Yape/Plin* regulariza la deuda desde el backoffice.
- **API / WebSocket**: consola con los últimos 40 eventos de la tabla anterior.

---

## 🧪 Verificación

```
npm test          # 29 pruebas unitarias del motor de reglas (Vitest)
npm run lint      # oxlint, 0 errores
npm run build     # build de producción
npm run dev       # servidor local
```

## 🚀 Cómo Ejecutar

```
npm install
npm run dev
```

Abre en tu navegador:
```
http://localhost:5173/
```
O desde cualquier celular en tu misma red Wi-Fi:
```
http://192.168.0.5:5173/
```
