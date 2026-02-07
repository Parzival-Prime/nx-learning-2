"use client"

import { useEffect, useState } from "react"

const LOCATION_STORAGE_KEY = "user_location"
const LOCATION_EXPIRY_DAYS = 20

type Location = {
  country: string
  city: string
}

function getStoredLocation(): Location | null {
  if (typeof window === "undefined") return null

  const storedData = localStorage.getItem(LOCATION_STORAGE_KEY)
  if (!storedData) return null

  const parsedData = JSON.parse(storedData)
  const expiryTime = LOCATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000

  const isExpired = Date.now() - parsedData.timestamp > expiryTime
  return isExpired ? null : parsedData
}

function useLocationTracking() {
  const [location, setLocation] = useState<Location | null>(null)

  useEffect(() => {
    const storedLocation = getStoredLocation()
    if (storedLocation) {
      setLocation(storedLocation)
      return
    }

    fetch("https://ip-api.com/json/")
      .then(res => res.json())
      .then(data => {
        const newLocation = {
          country: data?.country,
          city: data?.city,
          timestamp: Date.now()
        }

        localStorage.setItem(
          LOCATION_STORAGE_KEY,
          JSON.stringify(newLocation)
        )

        setLocation(newLocation)
      })
      .catch(error => console.log("Failed to get location", error))
  }, [])

  return location
}

export default useLocationTracking
