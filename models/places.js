import mongoose from 'mongoose'

const placeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    lat: { type: Number },
    lng: { type: Number },
  },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
})

const Place = mongoose.model('Place', placeSchema)
export default Place

// import bcrypt from 'bcrypt'

// // export const formatHashtags = (hashtags) =>
// //   hashtags.split(',').map((word) => (word.startsWith('#') ? word : `#${word}`))

// const userSchema = new mongoose.Schema({
//   email: { type: String, required: true, unique: true },
//   avatarUrl: String,
//   socialOnly: { type: Boolean, default: false },
//   username: { type: String, required: true, unique: true },
//   password: { type: String },
//   name: { type: String },
//   location: String,
//   videos: [
//     { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Video' },
//   ],
//   comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
// })
