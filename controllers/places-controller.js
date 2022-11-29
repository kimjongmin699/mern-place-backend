import { validationResult } from 'express-validator'
import mongoose from 'mongoose'
import Place from '../models/places'
import User from '../models/users'
import getCoordsForAddress from '../util/location'
import fs from 'fs'

// let DUMMY_PLACES = [
//   {
//     id: 'p1',
//     title: 'Empire State Building',
//     description: 'One of the most famous Building',
//     location: {
//       lat: 40.7484474,
//       lng: -73.9871516,
//     },
//     address: '경남 산청군 시천면',
//     creator: 'u1',
//   },
//   {
//     id: 'p2',
//     title: '맛찬들 고기집',
//     description: 'One of the most famous Building',
//     location: {
//       lat: 40.7484474,
//       lng: -73.9871516,
//     },
//     address: '순천시 해룡면',
//     creator: 'u1',
//   },
//   {
//     id: 'p3',
//     title: '할머니맥주',
//     description: 'One of the most famous Building',
//     location: {
//       lat: 40.7484474,
//       lng: -73.9871516,
//     },
//     address: '부산광역시 해운대구',
//     creator: 'u3',
//   },
// ]

export const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid

  let place
  try {
    place = await Place.findById(placeId)
  } catch (err) {
    const error = new Error('Could aa not find place', 500)
    return next(error)
  }

  if (!place) {
    const error = new Error(' aaaa Could not find a place')
    error.code = 404
    throw error //throw는 return을 써주지 않아도 됨
    //return next(error) return이 없으면 아래 res.json이 실행됨,
    // return res.status(404).json({ message: 'could not find place' })
  }
  res.json({ place })
}

export const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid
  console.log(userId)
  //let places
  let userWithPlaces
  try {
    //places = await Place.find({ creator: userId })
    userWithPlaces = await User.findById(userId).populate('places')
  } catch (err) {
    const error = new Error('Could not find places', 500)
    return next(error)
  }
  if (!userWithPlaces || userWithPlaces.length === 0) {
    return res.status(404).json({ message: 'aaa could not find place' })
    // return next(new Error('could not find place', 404))
  }
  console.log(userWithPlaces)
  res.status(200).json({
    places: userWithPlaces,
    //  places: userWithPlaces.map((place) => place.toObject({ getter: true })),
  })
}

export const createPlace = async (req, res, next) => {
  console.log(req)
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log(errors)
    res.status(422).json({ message: 'Inavalid data' })
  }

  const { title, description, address, creator } = req.body

  console.log(req.file)
  console.log(req.body)

  let coordinates
  try {
    coordinates = await getCoordsForAddress(address)
  } catch (error) {
    return next(error)
  }

  const createPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.location,
    creator,
  })
  console.log('creator', creator)

  let user

  try {
    user = await User.findById(creator)
  } catch (err) {
    const error = new Error('Please try again', 500)
    return next(error)
  }

  if (!user) {
    const error = new Error('Could not find user', 404)
    return next(error)
  }

  console.log(user)

  try {
    // // const sess = await mongoose.startSession()
    // // sess.startTransaction()
    // await createPlace.save({ session: sess })
    // user.places.push(createPlace)
    // await user.save({ session: sess })
    // await sess.commitTransaction()
    await createPlace.save()
    user.places.push(createPlace._id)
    await user.save()
  } catch (err) {
    const error = new Error('Create place failed', 500)
    return next(error)
  }

  res.status(201).json({ place: createPlace })
}

export const updatePlaceById = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log(errors)
    res.status(422).json({ message: 'Inavalid data' })
  }
  const { title, description } = req.body
  const placeId = req.params.pid

  let place
  try {
    place = await Place.findById(placeId)
  } catch (err) {
    const error = new Error('Could not update', 500)
    return next(error)
  }

  if (place.creator.toString() !== req.userData.userId) {
    //mongoose가 creator을 id로 인식할 수 있게 toString()를 붙임.
    const error = new Error('Could not update', 401)
    return next(error)
  }

  place.title = title
  place.description = description

  try {
    await place.save()
  } catch (err) {
    const error = new Error('Could not update, something wrong', 500)
    return next(error)
  }

  res.status(200).json({ place })
}
export const deletePlaceById = async (req, res, next) => {
  const placeId = req.params.pid
  let place
  try {
    place = await Place.findById(placeId).populate('creator')
  } catch (err) {
    const error = new Error('Could not delete, something wrong', 500)
    return next(error)
  }

  if (!place) {
    const error = new Error('Could not find place for this id', 404)
    return next(error)
  }

  if (place.creator.id !== req.userData.userId) {
    ///toString()을 않붙이는 이유는 getter를 해주어서
    const error = new Error('You are not edit', 401)
    return next(error)
  }

  const imagePath = place.image

  try {
    // const sess = await mongoose.startSession()
    // sess.transaction()
    // await place.remove({ session: sess })
    // place.creator.places.pull(place)
    // await place.creator.save({ session: sess })
    // await sess.commitTransaction()
    await place.remove()
  } catch (err) {
    const error = new Error('Could not delete, something wrong', 500)
    return next(error)
  }
  fs.unlink(imagePath, (err) => {
    console.log(err)
  })
  res.status(200).json({ message: 'Delete place' })
}
