import { useEffect, useState } from 'react'
import { loadPublicVehicle } from './vehicles.js'

const certificateFields = [
  ['date', 'Date'],
  ['makeBody', 'Make / body type'],
  ['model', 'Model'],
  ['country', 'Country of origin'],
  ['chassisNo', 'Chassis number'],
  ['engineNo', 'Engine number'],
  ['color', 'Color'],
  ['remarks', 'Remarks'],
]

function PublicCertificate({ publicKey, user }) {
  const [vehicle, setVehicle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    loadPublicVehicle(publicKey)
      .then((record) => {
        if (active) setVehicle(record)
      })
      .catch((loadError) => {
        if (active) setError(loadError.message || 'Could not load this vehicle record.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [publicKey])

  return (
    <main className={`public-certificate ${user ? 'public-certificate-admin' : ''}`}>
      <header className="public-certificate-header">
        <a className="public-certificate-brand" href="/" aria-label="Heritage Motors dashboard">
          <span className="brand-name">HERITAGE</span>
          <span className="brand-caption">MOTOR COMPANY</span>
        </a>
        {user ? (
          <div className="public-view-status">
            <span>Administrator preview</span>
            <a href="/">Back to dashboard</a>
          </div>
        ) : (
          <div className="public-view-status">
            <span>Public record</span>
            <a href="/">Administrator sign in</a>
          </div>
        )}
      </header>
      <section className="public-certificate-card">
        <div className="public-certificate-kicker"><span /> VEHICLE CERTIFICATE</div>
        {loading ? (
          <p className="public-record-message" role="status">Loading vehicle record…</p>
        ) : error ? (
          <p className="public-record-message public-record-error" role="alert">{error}</p>
        ) : !vehicle ? (
          <p className="public-record-message" role="status">This public vehicle record could not be found.</p>
        ) : (
          <>
            <h1>{vehicle.makeBody || 'Vehicle record'}</h1>
            <p className="public-certificate-intro">Verified record from the Heritage Motor Company collection.</p>
            <dl className="public-certificate-details">
              {certificateFields.map(([key, label]) => (
                <div key={key}>
                  <dt>{label}</dt>
                  <dd>{vehicle[key] || '—'}</dd>
                </div>
              ))}
            </dl>
            <p className="public-certificate-note">This record is available to anyone with its QR code or public link.</p>
          </>
        )}
      </section>
      <footer className="public-certificate-footer">© 2026 Heritage Motor Company</footer>
    </main>
  )
}

export default PublicCertificate
