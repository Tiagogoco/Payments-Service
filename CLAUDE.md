# Proyecto: Microservicio de Pagos — ShopScale

Proyecto escolar (8vo semestre, Servicios). Microservicio REST de pagos simulados con soporte para proveedores externos (PayPal).

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Runtime | Node.js 20 (ESM — `"type": "module"`) |
| Framework | Express 5 |
| Base de datos | MongoDB Atlas via Mongoose 9 |
| Contrato API | OpenAPI 3.0.3 (`contrato/payments.yaml`) |
| Config | dotenv |
| IDs | uuid |
| Dev | nodemon |
| Contenedor | Docker (node:20-alpine) |

---

## Estructura del proyecto

```
proyecto/
├── Dockerfile                  # Imagen de producción (node:20-alpine)
├── .dockerignore
├── contrato/
│   └── payments.yaml           # Contrato OpenAPI 3.0.3
│   └── screenshots/            # Capturas de pantalla del contrato
└── api/
    ├── .env                    # MONGO_URI, PORT=3011
    ├── package.json
    ├── server.js               # Entry point: conecta DB y levanta servidor
    └── src/
        ├── app.js              # Express app, monta rutas en /api
        ├── config/
        │   └── db.js           # connectDB() via mongoose
        ├── models/
        │   └── payment.model.js
        ├── routes/
        │   └── payment.routes.js
        └── controllers/
            └── payment.controller.js
```

---

## Endpoints implementados

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/payments` | Pago interno (card, cash) |
| POST | `/api/payments/external` | Pago externo (PayPal) |
| GET | `/api/payments/:paymentId` | Consultar pago por ID |

Todos los POST requieren header `Idempotency-Key` (idempotencia contra cobros duplicados).

---

## Convenciones del proyecto

- **ESM puro**: todos los archivos usan `import/export`, sin `require`.
- **Idempotencia**: se verifica `idempotencyKey` único en MongoDB (índice `unique: true`) antes de crear un pago. Si ya existe, devuelve el registro existente con 200.
- **Validación manual**: sin librería de validación externa (Joi/Zod). Todo se valida en `validateBasePayload` dentro del controller.
- **orderId simulado**: se valida que empiece con `ord_` para simular existencia de la orden.
- **providerReference**: para pagos PayPal se genera como `PAYPAL-${Date.now()}`.
- **Respuesta normalizada**: `toPaymentResponse()` mapea `_id` → `id` y normaliza nulls.
- **Puerto**: 3011 (dev), 3000 (Docker/prod).
- **Scripts**: `npm run dev` (nodemon) / `npm start` (node).

---

## Tareas

### Completadas
- [x] Estructura base del proyecto (ESM, Express, Mongoose)
- [x] Configuración de conexión a MongoDB Atlas
- [x] Modelo `Payment` con Mongoose (timestamps, enum validations)
- [x] Controller con 3 handlers: `createPayment`, `createExternalPayment`, `getPaymentById`
- [x] Idempotencia via `idempotencyKey` único + manejo de error 11000
- [x] Rutas montadas en `/api/payments`
- [x] Dockerfile de producción (node:20-alpine, `npm ci --omit=dev`)
- [x] Contrato OpenAPI 3.0.3 completo (`contrato/payments.yaml`)

### Pendientes
- [ ] Middleware de autenticación JWT (el contrato define `bearerAuth` pero no está implementado)
- [ ] Validación de que el `orderId` realmente existe (actualmente solo checa prefijo `ord_`)
- [ ] Manejo real del proveedor PayPal (actualmente simulado con `PAYPAL-${Date.now()}`)
- [ ] Tests (unitarios / integración)
- [ ] `docker-compose.yml` para levantar API + MongoDB local juntos
- [ ] Variable `NODE_ENV` en `.env` de desarrollo
- [ ] `.env.example` para documentar variables requeridas

---

## Comandos útiles

```bash
# Desarrollo
cd api && npm run dev

# Producción (Docker)
docker build -t payments-api .
docker run -p 3000:3000 --env-file api/.env payments-api
```
