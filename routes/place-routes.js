import express from 'express'
import validator from 'express-validator'
import { check } from 'express-validator'
import { checkAuth, fileUplaod, imageUpload } from '../middleware'

const {
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  updatePlaceById,
  deletePlaceById,
} = require('../controllers/places-controller')
const HttpError = require('../models/er')

const placesRouter = express.Router()

placesRouter.get('/:pid([0-9a-f]{24})', getPlaceById)
placesRouter.get('/user/:uid([0-9a-f]{24})', getPlacesByUserId)

placesRouter.use(checkAuth)

placesRouter.post(
  '/',
  imageUpload.single('image'),
  [
    check('title').not().isEmpty().isLength({ min: 5 }),
    check('address').not().isEmpty().isLength({ min: 5 }),
    check('description').not().isEmpty().isLength({ min: 5 }),
  ],
  createPlace
)
placesRouter.patch(
  '/:pid',
  [
    check('title').not().isEmpty().isLength({ min: 5 }),
    check('description').not().isEmpty().isLength({ min: 5 }),
  ],
  updatePlaceById
)
placesRouter.delete('/:pid', deletePlaceById)

export default placesRouter
