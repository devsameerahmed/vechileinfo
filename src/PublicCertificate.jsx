import { useEffect, useState } from 'react'
import { CertificateSheet } from './certificate.jsx'
import { fetchVehicleByKey } from './vehicles.js'

function PublicCertificate({ publicKey }) {
  const [vehicle, setVehicle] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let active = true
    fetchVehicleByKey(publicKey)
      .then((record) => {
        if (!active) return
        setVehicle(record)
        setStatus(record ? 'ready' : 'missing')
      })
      .catch(() => {
        if (active) setStatus('error')
      })
    return () => {
      active = false
    }
  }, [publicKey])

  return (
    <main className="public-certificate">
      {status === 'loading' && <p className="public-message">Loading certificate…</p>}
      {status === 'missing' && <p className="public-message">This certificate link is not valid.</p>}
      {status === 'error' && <p className="public-message">The certificate could not be loaded.</p>}
      {status === 'ready' && vehicle && <CertificateSheet vehicle={vehicle} titleId="public-certificate-title" />}
    </main>
  )
}

export default PublicCertificate
