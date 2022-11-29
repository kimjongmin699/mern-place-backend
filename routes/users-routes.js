import express from 'express'
import { check } from 'express-validator'
import { getUsers, login, signUp } from '../controllers/users-controller'
import { fileUplaod, fileUpload, imageUpload } from '../middleware'

const usersRouter = express.Router()

usersRouter.get('/', getUsers)

usersRouter.post(
  '/signup',
  imageUpload.single('image'),
  [
    check('name').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').not().isEmpty().isLength({ min: 5 }),
  ],
  signUp
)

// usersRouter.post('/file', fileUpload.single('file'), async (req, res) => {
//   console.log(req.file.location)
//   res.status(200).json({ location: file.location })
// })

usersRouter.post('/login', login)

export default usersRouter
