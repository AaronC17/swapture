# Deploy en Vercel (MongoDB + Prisma)

## 1) Mover la base de datos a nube
Este proyecto usa Prisma con MongoDB. En Vercel no puedes usar `mongodb://127.0.0.1...`.

Usa un cluster en MongoDB Atlas y copia el URI de conexion en formato:

mongodb+srv://USER:PASSWORD@cluster.mongodb.net/swapture?retryWrites=true&w=majority

## 2) Configurar variables en Vercel
En Vercel -> Project -> Settings -> Environment Variables agrega:

- DATABASE_URL (obligatoria)
- MONGODB_URI (alternativa valida, la crea la integracion de Mongo Atlas en Vercel)
- JWT_SECRET (obligatoria)
- OPENAI_API_KEY (opcional)
- TELEGRAM_BOT_TOKEN (opcional)
- TELEGRAM_CHAT_ID (opcional)

Puedes usar `.env.example` como referencia. El codigo acepta `DATABASE_URL` o `MONGODB_URI`.
Si la URI viene sin nombre de base de datos (termina en `/`), el codigo aplica `swapture` por defecto.

## 3) Build y runtime
La app ya ejecuta Prisma Client en build con:

- `postinstall`: prisma generate
- `build`: prisma generate && next build

No se requiere `prisma migrate` porque esta configurado con MongoDB.

## 4) Redeploy
Despues de guardar variables:

1. Haz un nuevo deploy en Vercel.
2. Revisa logs de build y runtime.
3. Prueba login y endpoints que usan DB.

## 5) Mensaje de error protegido
Se agrego validacion para evitar errores silenciosos:

- Si falta `DATABASE_URL`, la app falla con mensaje claro.
- Si en produccion `DATABASE_URL` apunta a localhost/127.0.0.1, falla con mensaje claro.

## 6) Seed de datos (opcional)
El seed (`prisma/seed.js`) es para desarrollo inicial.
Si quieres datos en produccion, ejecuta seed apuntando al URI de Atlas desde tu maquina o CI con cuidado.
