import express, { json } from 'express'

import { moviesRouter } from './routes/movies.js'
import { corsMiddleware } from './middlewares/cors.js'

const app = express()
app.use(json()) // midleware de express para evitar tener que reconstruir el body de un post
app.use(corsMiddleware())
app.disable('x-powered-by')

// Metodos normales: GET/HEAD/POST
// Metodos complejos: PUT/PATCH/DELETE

// los metodos complejos tienen CORS PRE-Flight
// que requiere una peticion OPTION previa para ser ejecutados en origenes distintos al local

app.use('/movies', moviesRouter)

const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
  console.log(`Server is listening on PORT: http://localhost:${PORT}`)
})
