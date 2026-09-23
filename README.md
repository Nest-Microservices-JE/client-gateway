# Client Gateway

API Gateway desarrollado con NestJS para la arquitectura de microservicios de la aplicación de productos. Este servicio actúa como el punto de entrada HTTP para los clientes, validando peticiones, transformando excepciones y enrutando los mensajes hacia los microservicios correspondientes mediante comunicación RPC (TCP).

---

## Características principales

- Puerta de Enlace HTTP (API Gateway): Expone endpoints RESTful con el prefijo global `/api`.
- Comunicación mediante Microservicios RPC: Conexión mediante transporte TCP con el microservicio de productos (`PRODUCT_SERVICE`).
- Validación Estricta de Datos: Uso de `ValidationPipe` global con `whitelist` y `forbidNonWhitelisted` mediante `class-validator` y `class-transformer`.
- Validación de Variables de Entorno: Configuración con `dotenv` y validación estricta del esquema mediante `Joi`.
- Manejo Centralizado de Excepciones RPC: Filtro global de excepciones `RpcCustomExceptionFilter` para convertir errores RPC devueltos por los microservicios en respuestas HTTP limpias y estructuradas con su correspondiente código de estado HTTP.
- Paginación reutilizable: DTO genérico de paginación (`PaginationDto`) para consultas de listado.

---

## Requisitos previos

- Node.js (versión LTS recomendada)
- npm
- Microservicio de Productos en ejecución (Products Microservice)

---

## Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto basado en `.env.template`:

```env
PORT=3000
PRODUCT_MICROSERVICE_HOST=localhost
PRODUCT_MICROSERVICE_PORT=3001
```

### Descripción de variables

| Variable | Descripción | Valor por defecto / Ejemplo |
| --- | --- | --- |
| `PORT` | Puerto en el que se ejecuta el API Gateway | `3000` |
| `PRODUCT_MICROSERVICE_HOST` | Host o dirección donde escucha el microservicio de productos | `localhost` |
| `PRODUCT_MICROSERVICE_PORT` | Puerto TCP donde escucha el microservicio de productos | `3001` |

---

## Instalación y Configuración

1. Clonar el repositorio e ingresar al directorio del proyecto:

```bash
cd client-gateway
```

2. Instalar las dependencias:

```bash
npm install
```

3. Crear y configurar el archivo de variables de entorno:

```bash
cp .env.template .env
```

---

## Ejecución del Proyecto

### Modo Desarrollo (con Live Reload)

```bash
npm run start:dev
```

### Modo Producción

```bash
npm run build
npm run start:prod
```

### Pruebas y Linter

```bash
# Ejecutar linter (oxlint)
npm run lint

# Formatear código (prettier)
npm run format

# Pruebas unitarias
npm run test

# Pruebas e2e
npm run test:e2e
```

---

## Endpoints de la API

La ruta base de la API es `/api/products`.

### Productos (`/api/products`)

#### 1. Crear un producto
- Método: `POST`
- Ruta: `/api/products`
- Cuerpo de la petición (JSON):
  ```json
  {
    "name": "Teclado Mecánico",
    "price": 59.99
  }
  ```
- Patrón RPC enviado: `{ cmd: 'create_product' }`

#### 2. Obtener todos los productos
- Método: `GET`
- Ruta: `/api/products`
- Parámetros de consulta (Query Params - Opcionales):
  - `page`: Número de página (ej. `1`)
  - `limit`: Cantidad de elementos por página (ej. `10`)
- Ejemplo: `/api/products?page=1&limit=5`
- Patrón RPC enviado: `{ cmd: 'find_all_products' }`

#### 3. Obtener un producto por ID
- Método: `GET`
- Ruta: `/api/products/:id`
- Ejemplo: `/api/products/1`
- Patrón RPC enviado: `{ cmd: 'find_one_product' }`

#### 4. Actualizar un producto
- Método: `PATCH`
- Ruta: `/api/products/:id`
- Cuerpo de la petición (JSON):
  ```json
  {
    "name": "Teclado Mecánico RGB",
    "price": 64.99
  }
  ```
- Patrón RPC enviado: `{ cmd: 'update_product' }`

#### 5. Eliminar un producto
- Método: `DELETE`
- Ruta: `/api/products/:id`
- Ejemplo: `/api/products/1`
- Patrón RPC enviado: `{ cmd: 'delete_product' }`

---

## Estructura del Proyecto

```text
src/
├── common/
│   ├── dto/
│   │   └── pagination.dto.ts         # DTO para parámetros de paginación (page, limit)
│   ├── exceptions/
│   │   └── rpc-custom-exception.filter.ts # Filtro global para transformar RpcException a HTTP Exception
│   └── index.ts
├── config/
│   ├── envs.ts                       # Validación y exportación de variables de entorno con Joi
│   ├── services.ts                   # Definición de tokens de inyección (PRODUCT_SERVICE)
│   └── index.ts
├── products/
│   ├── dto/
│   │   ├── create-product.dto.ts     # DTO para creación de productos
│   │   └── update-product.dto.ts     # DTO para actualización parcial de productos
│   ├── products.controller.ts        # Controlador REST que redirige solicitudes al microservicio
│   └── products.module.ts            # Módulo de productos con registro de ClientProxy (TCP)
├── app.module.ts                     # Módulo principal de la aplicación
└── main.ts                           # Punto de entrada de NestJS (configuración de pipes, filtros, puerto)
```

---

## Arquitectura y Flujo de Manejo de Errores

1. El cliente realiza una petición HTTP al Gateway (`/api/products`).
2. El `ValidationPipe` valida el cuerpo y parámetros de la solicitud.
3. El `ProductsController` delega la petición al microservicio mediante `ClientProxy` emitiendo un patrón de comando RPC por TCP (ej. `{ cmd: 'find_one_product' }`).
4. Si el microservicio responde con un error RPC (`RpcException`), el filtro personalizado `RpcCustomExceptionFilter` intercepta la excepción en el Gateway y devuelve una respuesta estructurada al cliente con el código HTTP correspondiente (`400 Bad Request`, `404 Not Found`, etc.), evitando respuestas genéricas 500.


## Levantar servidor NATS 
docker run -d --name nats-main -p 4222:4222 -p 6222:6222 -p 8222:8222 nats