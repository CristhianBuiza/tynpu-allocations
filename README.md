# Tynpu Allocations

Sistema de gestión de asignaciones de consultores a proyectos. Permite administrar consultores, proyectos y sus asignaciones con validación de conflictos de horarios.

---

## Requerimientos Implementados

### Backend (NestJS + SQL)

| Requerimiento | Estado | Detalles |
|---------------|--------|----------|
| API REST CRUD Consultores | ✅ Implementado | Endpoints completos GET, POST, PATCH, DELETE |
| API REST CRUD Proyectos | ✅ Implementado | Endpoints completos GET, POST, PATCH, DELETE |
| API REST CRUD Asignaciones | ✅ Implementado | Endpoints con filtros por consultor/proyecto |
| Validación de cruces de horarios | ✅ Implementado | `ScheduleValidatorService` valida conflictos antes de crear asignaciones |
| PostgreSQL + TypeORM | ✅ Implementado | Entidades con relaciones y columnas calculadas |
| Arquitectura Hexagonal/Clean | ⚠️ Parcial | Estructura modular por dominio (modules), pero no hexagonal pura |

### Mobile (React Native + TypeScript)

| Requerimiento | Estado | Detalles |
|---------------|--------|----------|
| Listado de proyectos | ✅ Implementado | Con scroll infinito usando `useInfiniteQuery` |
| Listado de consultores | ✅ Implementado | Con scroll infinito usando `useInfiniteQuery` |
| Scroll infinito (10 elementos) | ✅ Implementado | Carga progresiva con paginación |
| Formulario de asignación | ✅ Implementado | React Hook Form + Yup para validación |
| UI con TailwindCSS | ✅ Implementado | NativeWind (Tailwind para React Native) |
| Diseño limpio y funcional | ✅ Implementado | Tabs de navegación, cards, estados de carga |
| Offline-first (Bonus) | ⚠️ Parcial | Cache en memoria con TanStack Query (staleTime: 5min), sin persistencia en disco |

### Pendientes / Mejoras Futuras

- **Arquitectura Hexagonal completa**: Separar puertos y adaptadores del dominio
- **Persistencia offline**: Usar `@tanstack/query-async-storage-persister` para guardar cache en AsyncStorage
- **Tests unitarios y e2e**: Ampliar cobertura de tests

---

## Estructura del Proyecto

```
├── app/          # Aplicación móvil (React Native + Expo)
├── backend/      # API REST (NestJS)
```

## Tecnologías

### Backend
- **NestJS** - Framework Node.js
- **TypeORM** - ORM para base de datos
- **PostgreSQL** - Base de datos
- **Swagger** - Documentación de API
- **class-validator** - Validación de DTOs

### App Móvil
- **React Native + Expo** - Framework móvil
- **React Navigation** - Navegación
- **TanStack Query** - Manejo de estado del servidor
- **React Hook Form + Yup** - Formularios y validación
- **NativeWind** - Estilos (Tailwind para RN)
- **Axios** - Cliente HTTP

## Modelos de Datos

### Consultant (Consultor)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| name | string | Nombre del consultor |
| email | string | Email único |
| skills | string[] | Lista de habilidades |
| hourlyRate | decimal | Tarifa por hora |
| availability | enum | `available`, `busy`, `unavailable` |

### Project (Proyecto)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| name | string | Nombre del proyecto |
| client | string | Cliente |
| description | text | Descripción |
| startDate | date | Fecha de inicio |
| endDate | date | Fecha de fin |
| status | enum | `planning`, `active`, `completed`, `cancelled` |
| budget | decimal | Presupuesto |

### Assignment (Asignación)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| consultantId | UUID | ID del consultor |
| projectId | UUID | ID del proyecto |
| startTime | timestamp | Inicio de la asignación |
| endTime | timestamp | Fin de la asignación |
| hours | int | Horas calculadas automáticamente |
| status | enum | `scheduled`, `active`, `completed`, `cancelled` |
| notes | text | Notas adicionales |

## Funcionalidades

- CRUD completo de Consultores, Proyectos y Asignaciones
- Validación de conflictos de horarios (un consultor no puede estar asignado a dos proyectos a la misma hora)
- Paginación en listados
- Filtrado de asignaciones por consultor o proyecto
- Cálculo automático de horas trabajadas

## Instalación

### Backend

```bash
cd backend
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu configuración de PostgreSQL

# Ejecutar migraciones/seed (opcional)
npm run seed

# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

### App Móvil

```bash
cd app
npm install

# Desarrollo
npm start
# o
npm run ios
npm run android
```

## API Endpoints

### Consultants
- `GET /api/consultants` - Listar consultores (paginado)
- `GET /api/consultants/:id` - Obtener consultor
- `POST /api/consultants` - Crear consultor
- `PATCH /api/consultants/:id` - Actualizar consultor
- `DELETE /api/consultants/:id` - Eliminar consultor

### Projects
- `GET /api/projects` - Listar proyectos (paginado)
- `GET /api/projects/:id` - Obtener proyecto
- `POST /api/projects` - Crear proyecto
- `PATCH /api/projects/:id` - Actualizar proyecto
- `DELETE /api/projects/:id` - Eliminar proyecto

### Assignments
- `GET /api/assignments` - Listar asignaciones (paginado, filtrable por consultantId/projectId)
- `GET /api/assignments/:id` - Obtener asignación
- `POST /api/assignments` - Crear asignación (valida conflictos)
- `PATCH /api/assignments/:id` - Actualizar asignación
- `DELETE /api/assignments/:id` - Eliminar asignación

## Variables de Entorno

### Backend
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=tynpu_allocations
```

### App
```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```
