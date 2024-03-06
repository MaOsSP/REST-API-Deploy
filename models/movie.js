import { readJSON } from '../utils.js'
import { randomUUID } from 'node:crypto'// modulo para crear id's unicas
const movies = readJSON('./movies.json')

export class MovieModel {
  static async getAll ({ genre }) {
    if (genre) {
      // como se filtran los datos
      // y de donde se recuperan
      return movies.filter(
        movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
      )
    }
    return movies
  }

  static async getById ({ id }) {
    const movie = movies.find(movie => movie.id === id)
    return movie
  }

  static async create ({ input }) {
    // Esto no seria REST, porque se esta guardando
  // el estado de la aplicacion en memoria
    const newMovie = {
      id: randomUUID(), // generar id aleatorio
      ...input // sintaxis para traer y contruir el objeto json de igual forma de donde se trae
    }
    movies.push(newMovie)
    return newMovie
  }

  static async delete ({ id }) {
    const movieIndex = movies.findIndex(movie => movie.id === id)
    if (movieIndex === -1) return false
    movies.splice(movieIndex, 1)
    return true
  }

  static async update ({ id, input }) {
    const movieIndex = movies.findIndex(movie => movie.id === id)
    if (movieIndex === -1) return false

    movies[movieIndex] = {
      ...movies[movieIndex],
      ...input
    }
    return movies[movieIndex]
  }
}
