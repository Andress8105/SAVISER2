# SAVISER - Sistema de Atención y Vida al Ser Humano

## Configuración

### Variables de Entorno

El archivo `.env` ya está configurado con:
```
MONGODB_URI=mongodb+srv://andresserayap17:3226325537An@basedto.zz2b4yw.mongodb.net/saviser_db?retryWrites=true&w=majority&appName=BaseDTO
VITE_API_URL=http://localhost:3001
```

## Ejecución

### 1. Iniciar el Backend (MongoDB)

```bash
npm start
```

Esto iniciará el servidor Express en el puerto 3001, conectándose a MongoDB.

### 2. Iniciar el Frontend (en otra terminal)

```bash
npm run dev
```

Esto iniciará el servidor de desarrollo de Vite.

## Arquitectura

- **Frontend**: React + TypeScript + Vite
- **Backend**: Express + Node.js
- **Base de Datos**: MongoDB Atlas
- **API**: RESTful API

Todas las peticiones del front-end van exclusivamente al back-end en el puerto 3001, que se comunica con MongoDB Atlas.

## Endpoints Disponibles

- `GET /api/health` - Verificar estado del servidor
- `GET /api/patients/search/:numeroIdentificacion` - Buscar paciente
- `POST /api/patients` - Crear paciente
- `PUT /api/patients/:id` - Actualizar paciente
- `POST /api/patients/:id/exams` - Agregar examen médico
- `POST /api/patients/:id/diagnoses` - Agregar diagnóstico
- `POST /api/patients/:id/treatments` - Agregar tratamiento
- `POST /api/patients/:id/images` - Subir imagen médica
- `DELETE /api/patients/images/:id` - Eliminar imagen médica
