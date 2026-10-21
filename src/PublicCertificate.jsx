import { useEffect, useState } from 'react'
import { loadPublicVehicle } from './vehicles.js'

const certificateFields = [
  ['certificateNumber', 'Certificate Number', 'رقم البطاقة'],
  ['date', 'Date', 'تاريخ'],
  ['makeBody', 'Make / Body Type', 'نوع المركبة / الشكل'],
  ['importerName', 'Importer Name', 'اسم المستورد / المالك'],
  ['declarationNumber', 'Declaration Number', 'رقم البيان الجمركي'],
  ['model', 'Model', 'سنة الصنع'],
  ['country', 'Country', 'بلد الصنع'],
  ['chassisNo', 'Chassis No', 'رقم القاعدة'],
  ['engineNo', 'Engine No', 'رقم المحرك'],
  ['color', 'Color', 'اللون'],
  ['remarks', 'Remarks', 'الملاحظات'],
  ['userId', 'User ID', 'الموظف'],
  ['status', 'Status', 'البطاقة'],
]

function PublicCertificate({ publicKey }) {
  const [vehicle, setVehicle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Vehicle Certificate Details'
    document.documentElement.classList.add('certificate-active')
    return () => {
      document.title = previousTitle
      document.documentElement.classList.remove('certificate-active')
    }
  }, [])

  useEffect(() => {
    let active = true
    loadPublicVehicle(publicKey)
      .then((record) => {
        if (active) setVehicle(record)
      })
      .catch((loadError) => {
        if (!active) return
        const errorMessage = loadError.message || ''
        setError(/get_public_vehicle_certificate|permission denied|not allowed/i.test(errorMessage)
          ? 'Public vehicle access is not enabled yet. The site administrator needs to run supabase/vehicle_certificates.sql in the Supabase SQL editor.'
          : 'Could not load this vehicle record. Please try again later.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [publicKey])

  const rows = vehicle
    ? certificateFields.map(([key, label, arabic]) => ({
      label,
      value: key === 'makeBody' ? formatMakeBody(vehicle[key]) : vehicle[key],
      arabic,
      status: key === 'status' && vehicle[key]?.toUpperCase() === 'VALID',
    }))
    : []

  return (
    <main className="certificate-page">
      <div className="certificate">
        <h1>Vehicle Certificate Details</h1>
        <p className="certificate-ar" lang="ar" dir="rtl">
          تفاصيل شهادة المركبة
        </p>
        {loading ? (
          <p className="certificate-message" role="status">Loading vehicle record…</p>
        ) : error ? (
          <p className="certificate-message certificate-error" role="alert">{error}</p>
        ) : !vehicle ? (
          <p className="certificate-message" role="status">This public vehicle record could not be found.</p>
        ) : (
          <table>
            <colgroup>
              <col className="col-label" />
              <col className="col-value" />
              <col className="col-arabic" />
            </colgroup>
            <thead>
              <tr>
                <th />
                <th />
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  <td>
                    <CellValue value={row.value} status={row.status} />
                  </td>
                  <td className="arabic" lang="ar" dir="rtl">
                    {row.arabic}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  )
}

function formatMakeBody(value) {
  const match = value?.match(/^(.*?)(\s*\([^)]*\))$/)
  return match ? [match[1], match[2].trim()] : value
}

function CellValue({ value, status }) {
  const lines = Array.isArray(value) ? value : [value || '']
  return (
    <span className={status ? 'is-valid' : undefined}>
      {lines.map((line) => (
        <span key={line || 'empty'} className="value-line">
          {line}
        </span>
      ))}
    </span>
  )
}

export default PublicCertificate
