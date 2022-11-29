import express from 'express'
import multer from 'multer'
import multerS3 from 'multer-s3'
import aws from 'aws-sdk'
import HttpError from './models/er'
import jwt from 'jsonwebtoken'

const AWS_ID = 'AKIAUDWXLVGIJLGNJ5OC'
const AWS_SECRET = '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'

const s3 = new aws.S3({
  credentials: {
    accessKeyId: AWS_ID,
    secretAccessKey: AWS_SECRET,
  },
})

// const upload = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: 'some-bucket',
//     metadata: function (req, file, cb) {
//       cb(null, { fieldName: file.fieldname })
//     },
//     key: function (req, file, cb) {
//       cb(null, Date.now().toString())
//     },
//   }),
// })

const isHeroku = process.env.NODE_ENV === 'production'

const s3ImageUploader = multerS3({
  s3: s3,
  bucket: 'mern6858',
  acl: 'public-read',
})

const s3VideoUploader = multerS3({
  s3: s3,
  bucket: 'mern/videos',
  acl: 'public-read',
})

export const localsMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn)
  res.locals.loggedInUser = req.session.user || {}
  res.locals.siteName = 'jmTube'
  res.locals.isHeroku = isHeroku
  next()
}

export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    return next()
  } else {
    req.flash('error', 'Not authorized')
    return res.redirect('/login')
  }
}

export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next()
  } else {
    req.flash('error', 'Not authorized')
    return res.redirect('/')
  }
}

export const imageUpload = multer({
  dest: 'mern/avatars/',
  limits: {
    fileSize: 4000000,
  },
  storage: s3ImageUploader,
})
export const videoUpload = multer({
  dest: 'mern/videos/',
  limits: {
    fileSize: 250000000,
  },
  storage: s3VideoUploader,
})

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
}

export const fileUplaod = multer({
  limits: 500000,
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/images')
    },
    filename: (req, file, cb) => {
      const ext = MIME_TYPE_MAP[file.mimetype]
      cb(null, Date.now() + '.' + ext)
    },
  }),
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype]
    let error = isValid ? null : new Error('Invalid mime type')
    cb(error, isValid)
  },
})

export const checkAuth = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next()
  }
  try {
    const token = req.headers.authorization.split(' ')[1] //Authorization: 'Bearer TOKEN'
    if (!token) {
      throw new Error('Invaild Token11', 401)
    }
    const decodedToken = jwt.verify(token, 'supersecret_dont_share')
    req.userData = { userId: decodedToken.userId }
    next()
  } catch (err) {
    const error = HttpError('Invalid Token', 400)
    return next(error)
  }
}

// export const recording = (req, res, next) => {
//   res.header('Cross-Origin-Embedder-Policy', 'require-corp')
//   res.header('Cross-Origin-Opener-Policy', 'same-origin')
//   next()
// }
