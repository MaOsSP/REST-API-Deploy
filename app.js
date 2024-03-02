const express = require('express')
const crypto = require('node:crypto')// modulo para crear id's unicas
const movies = require('./movies.json')// lista de peliculas
const { validateMovie, validatePartialMovie } = require('./schemas/movies')// validadcion de esquema de objetos json con zod

const app = express()
app.use(express.json()) // midleware de express para evitar tener que reconstruir el body de un post
app.disable('x-powered-by')

// Metodos normales: GET/HEAD/POST
// Metodos complejos: PUT/PATCH/DELETE

// los metodos complejos tienen CORS PRE-Flight
// que requiere una peticion OPTION previa para ser ejecutados

const ACCEPTED_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:1234',
  'http://movies.com',
  'http://lyokam.dev'
]

app.get('/movies', (req, res) => {
  const origin = req.header('origin') // el navegador nunca envia cual es el origin cuando la peticion es realizada desde el mismo origin
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    // res.header('Access-Control-Allow-Origin', '*') ->para aceptar cualquier origen
    res.header('Access-Control-Allow-Origin', origin)
  }
  const { genre } = req.query // recuperar el query param
  if (genre) {
    const filteredMovies = movies.filter(
      movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
    )
    return res.json(filteredMovies)
  }
  res.json(movies)
})

app.get('/movies/:id', (req, res) => { // path-to-regexp
  const { id } = req.params // recuperar el parametro id de la request
  const movie = movies.find(movie => movie.id === id)
  if (movie) return res.json(movie)

  res.status(404).json({ message: 'Movie not found' })
})

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)

  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  // Esto no seria REST, porque se esta guardando
  // el estado de la aplicacion en memoria
  const newMovie = {
    id: crypto.randomUUID(), // generar id aleatorio
    ...result.data // sintaxis para traer y contruir el objeto json de igual forma de donde se trae
  }
  // Validacion de campos no recomendada, alternativa usar zod
  // if (!title || !genre || !year || !director || !duration || !poster) {
  //   return res.status(404).json({ message: 'Missing required fields' })
  // }

  movies.push(newMovie)

  res.status(201).json(newMovie) // se devuelve para actualizar la cache del cliente
})

app.delete('/movies/:id', (req, res) => {
  const origin = req.header('origin')
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
  }
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)
  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  movies.splice(movieIndex, 1)

  return res.json({ message: 'Movie deleted' })
})

app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body)

  if (!result.success) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)
  if (movieIndex === -1) return res.status(404).json({ message: 'Movie not found' })

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  movies[movieIndex] = updateMovie

  return res.json(updateMovie)
})

app.options('/movies/:id', (req, res) => {
  const origin = req.header('origin')
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
  }
  res.send(200)
})

const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
  console.log(`Server is listening on PORT: http://localhost:${PORT}`)
})
