'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function ReportPage() {
  const [image, setImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [location, setLocation] = useState('')
  const [wasteType, setWasteType] = useState('')
  const [estimatedKg, setEstimatedKg] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()

  // Auto-detect location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            )
            const data = await res.json()
            const addr = data?.display_name || `${latitude}, ${longitude}`
            setLocation(addr)
          } catch (err) {
            setLocation(`${latitude}, ${longitude}`)
          }
        },
        () => {
          setLocation('Location not available')
        }
      )
    } else {
      setLocation('Geolocation not supported')
    }
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      setPreviewUrl(URL.createObjectURL(file))

      // Fake analysis logic
      const fakeTypes = ['Plastic', 'Organic', 'Metal', 'E-waste']
      const randomType = fakeTypes[Math.floor(Math.random() * fakeTypes.length)]
      const randomKg = Math.floor(Math.random() * 5) + 1

      setWasteType(randomType)
      setEstimatedKg(randomKg)
    }
  }

  const handleSubmit = () => {
    if (!image || !location || !wasteType || estimatedKg === null) {
      alert('Please upload image and wait for auto analysis.')
      return
    }

    const report = {
      id: Date.now(),
      wasteType,
      estimatedKg,
      location,
      image: previewUrl
    }

    const existing = JSON.parse(localStorage.getItem('reports') || '[]')
    existing.push(report)
    localStorage.setItem('reports', JSON.stringify(existing))

    setSubmitted(true)

    setTimeout(() => {
      router.push('/')
    }, 2000)
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Report Waste</h1>

      <Input type="file" accept="image/*" onChange={handleImageChange} className="mb-4" />

      {previewUrl && (
        <div className="mb-4">
          <Image src={previewUrl} alt="Preview" width={300} height={200} className="rounded-md" />
        </div>
      )}

      {wasteType && estimatedKg !== null && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
          <p><strong>Detected Waste Type:</strong> {wasteType}</p>
          <p><strong>Estimated Weight:</strong> {estimatedKg} kg</p>
        </div>
      )}

      <Input
        placeholder="Location (auto-filled)"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="mb-4"
      />

      <Button onClick={handleSubmit} className="w-full bg-green-600 text-white">
        Submit Report
      </Button>

      {submitted && (
        <p className="mt-4 text-green-600 text-center">✅ Report submitted successfully!</p>
      )}
    </div>
  )
}
