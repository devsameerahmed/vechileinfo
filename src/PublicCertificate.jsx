import { useEffect, useState } from 'react'
import { certificateFields } from './certificate.jsx'
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
      {status === 'ready' && vehicle && (
        <article className="details-sheet">
          <h1>Vehicle Certificate Details</h1>
          <p lang="ar">تفاصيل شهادة المركبة</p>
          <table>
            <thead>
              <tr>
                <th />
                <th />
                <th />
              </tr>
            </thead>
            <tbody>
              {certificateFields.map((field) => (
                <tr key={field.key}>
                  <td className="label">{field.label}</td>
                  <td className={`value${field.key === 'status' ? ` details-status-${(vehicle.status || '').toLowerCase()}` : ''}`}>{vehicle[field.key]}</td>
                  <td className="arabic" lang="ar">{field.arabic}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      )}
    </main>
  )
}

export default PublicCertificate
