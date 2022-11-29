import { validationResult } from 'express-validator'
import User from '../models/users'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// const DUMMY_USERS = [
//   {
//     id: 'u1',
//     name: 'kjmkjm',
//     email: 'kjm@daum.net',
//     password: '123123',
//   },
//   {
//     id: 'u2',
//     name: 'kbskbs',
//     email: 'kbs@daum.net',
//     password: '121212',
//   },
//   {
//     id: 'u3',
//     name: 'sss',
//     email: 'sss@daum.net',
//     password: '3213321',
//   },
// ]

export const getUsers = async (req, res, next) => {
  let users

  try {
    users = await User.find()
  } catch (err) {
    const error = new Error('Fetching users failed', 500)
    return next(error)
  }

  res.json({ users: users.map((user) => user.toObject({ getter: true })) })
}

export const signUp = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log(errors)
    res.status(422).json({ message: 'Inavalid data' })
  }

  const { name, email, password } = req.body

  let existingUser
  try {
    existingUser = await User.findOne({ email: email })
  } catch (err) {
    const error = new Error('User is already exist111', 500)
    return next(error)
  }

  if (existingUser) {
    const error = new Error('User exists alreadt', 400)
    return next(error)
  }

  let hashedPassword
  try {
    hashedPassword = await bcrypt.hash(password, 12)
  } catch (err) {
    const error = new Error('could not create User', 500)
    return next(error)
  }

  const createUser = new User({
    name,
    email,
    password: hashedPassword,
    image: req.file.location,
    places: [],
  })

  try {
    await createUser.save()
  } catch (err) {
    const error = new Error('Creating User failed', 500)
    return next(error)
  }

  let token
  try {
    token = jwt.sign(
      { userId: createUser.id, email: createUser.email },
      'supersecret_dont_share',
      { expiresIn: '200h' }
    )
  } catch (err) {
    const error = new Error('making token failed', 500)
    return next(error)
  }

  //res.status(200).json({ user: createUser.toObject({ getter: true }) })
  res
    .status(200)
    .json({ userId: createUser.id, email: createUser.email, token: token })
}
export const login = async (req, res, next) => {
  const { email, password } = req.body

  let existingUser

  try {
    existingUser = await User.findOne({ email: email })
  } catch (err) {
    const error = new Error('Logged in fail')
    return next(error)
  }

  if (!existingUser) {
    const error = new Error('Invalid credential', 401)
    return next(error)
  }

  let isValidPassword = false
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password)
  } catch (err) {
    const error = new Error('Could not login', 500)
    return next(error)
  }
  if (!isValidPassword) {
    const error = new Error('Invalid password', 401)
    return next(error)
  }

  let token
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      'supersecret_dont_share',
      { expiresIn: '200h' }
    )
  } catch (err) {
    const error = new Error('making token failed', 500)
    return next(error)
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
  })
}
