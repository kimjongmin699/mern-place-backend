import axios from 'axios'
import HttpError from '../models/er'

const API_KEY = 'AIzaSyBtQ7yxIjkkP0LENLTRf9y7aPnViF1ijKo'

async function getCoordsForAddress(address) {
  // return {
  //   lat: 40.7484474,
  //   lng: -73.9871516
  // };
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${API_KEY}`
  )

  const data = response.data

  if (!data || data.status === 'ZERO_RESULTS') {
    const error = new HttpError(
      'Could not find location for the specified address.',
      422
    )
    throw error
  }
  console.log(data)

  const coordinates = data.results[0].geometry.location
  console.log(coordinates)

  return coordinates
}

module.exports = getCoordsForAddress
