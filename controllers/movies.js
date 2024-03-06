import { MovieModel } from '../models/movie.js'
import { validateMovie, validatePartialMovie } from '../schemas/movies.js'// validadcion de esquema de objetos json con zod

export class MovieController {
  static async getAll (req, res) {
    const { genre } = req.query // recuperar el query param
    const movies = await MovieModel.getAll({ genre })
    res.json(movies)
  }

  static async getById (req, res) {
  // path-to-regexp
    const { id } = req.params // recuperar el parametro id de la request
    const movie = await MovieModel.getById({ id })
    if (movie) return res.json(movie)
    res.status(404).json({ message: 'Movie not found' })
  }

  static async create (req, res) {
    const result = validateMovie(req.body)

    if (result.error) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }
    const newMovie = await MovieModel.create({ input: result.data })
    res.status(201).json(newMovie) // se devuelve para actualizar la cache del cliente
  }

  static async delete (req, res) {
    const { id } = req.params
    const result = await MovieModel.delete({ id })

    if (result === false) {
      return res.status(404).json({ message: 'Movie not found' })
    }

    return res.json({ message: 'Movie deleted' })
  }

  static async update (req, res) {
    const result = validatePartialMovie(req.body)

    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const { id } = req.params
    const updateMovie = await MovieModel.update({ id, input: result.data })

    return res.json(updateMovie)
  }
}
