import { useEffect, useState } from 'react'
import { loadPublicVehicle } from './vehicles.js'

const FONT = 'Arial, Helvetica, "Noto Naskh Arabic", sans-serif'
const GOLD = '#bc9e6a'
const BORDER = '#d0d0d0'

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
    const previousHtmlBg = document.documentElement.style.backgroundColor
    const previousBodyBg = document.body.style.backgroundColor
    document.title = 'Vehicle Certificate Details'
    document.documentElement.style.backgroundColor = '#ffffff'
    document.body.style.backgroundColor = '#ffffff'
    return () => {
      document.title = previousTitle
      document.documentElement.style.backgroundColor = previousHtmlBg
      document.body.style.backgroundColor = previousBodyBg
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
      value: vehicle[key],
      arabic,
      status: key === 'status' && vehicle[key]?.toUpperCase() === 'VALID',
    }))
    : []

  return (
    <main
      style={{
        minHeight: '100vh',
        width: '100%',
        margin: 0,
        background: '#ffffff',
        fontFamily: FONT,
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <div
        style={{
          boxSizing: 'border-box',
          width: '100%',
          maxWidth: '600px',
          margin: '0 auto',
          padding: '0 12px',
        }}
      >
        <div style={{ marginTop: '3.25rem', textAlign: 'center' }}>
          <h3
            style={{
              marginTop: 0,
              marginBottom: '0.5rem',
              padding: 0,
              fontFamily: FONT,
              fontSize: '1.75rem',
              fontWeight: 500,
              lineHeight: 1.2,
              color: '#000000',
              letterSpacing: 'normal',
            }}
          >
            Vehicle Certificate Details
          </h3>
          <p
            lang="ar"
            dir="rtl"
            style={{
              margin: '8px 0 0',
              padding: 0,
              fontFamily: FONT,
              fontSize: '24px',
              fontWeight: 400,
              lineHeight: '30px',
              color: '#000000',
            }}
          >
            تفاصيل شهادة المركبة
          </p>
        </div>
        {loading ? (
          <p style={{ margin: '18px 0', textAlign: 'center', fontSize: '14px', color: '#000000' }} role="status">Loading vehicle record…</p>
        ) : error ? (
          <p style={{ margin: '18px 0', textAlign: 'center', fontSize: '14px', color: '#a35248' }} role="alert">{error}</p>
        ) : !vehicle ? (
          <p style={{ margin: '18px 0', textAlign: 'center', fontSize: '14px', color: '#000000' }} role="status">This public vehicle record could not be found.</p>
        ) : (
          <table
            style={{
              width: '100%',
              marginTop: '16px',
              borderCollapse: 'collapse',
              borderSpacing: 0,
              tableLayout: 'fixed',
              border: `1px solid ${BORDER}`,
              background: '#ffffff',
              fontFamily: FONT,
            }}
          >
            <colgroup>
              <col style={{ width: '25%' }} />
              <col style={{ width: '50%' }} />
              <col style={{ width: '25%' }} />
            </colgroup>
            <thead>
              <tr>
                {[0, 1, 2].map((i) => (
                  <th
                    key={i}
                    style={{
                      height: '34px',
                      padding: 0,
                      backgroundColor: GOLD,
                      borderTop: `1px solid ${GOLD}`,
                      borderBottom: `1px solid ${GOLD}`,
                      borderLeft: i === 0 ? `1px solid ${GOLD}` : '2px solid #fff',
                      borderRight: i === 2 ? `1px solid ${GOLD}` : '2px solid #fff',
                      fontSize: 0,
                      lineHeight: 0,
                    }}
                  />
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <th
                    scope="row"
                    style={{
                      border: `1px solid ${BORDER}`,
                      padding: '6px 8px',
                      verticalAlign: 'middle',
                      textAlign: 'left',
                      fontFamily: FONT,
                      fontSize: '14px',
                      fontWeight: 400,
                      lineHeight: '18px',
                      color: '#000000',
                      boxSizing: 'border-box',
                    }}
                  >
                    {row.label}
                  </th>
                  <td
                    style={{
                      border: `1px solid ${BORDER}`,
                      padding: '6px 8px',
                      verticalAlign: 'middle',
                      textAlign: 'center',
                      fontFamily: FONT,
                      fontSize: '14px',
                      fontWeight: 700,
                      lineHeight: '18px',
                      color: row.status ? '#008000' : '#000000',
                      whiteSpace: 'normal',
                      overflowWrap: 'anywhere',
                      boxSizing: 'border-box',
                    }}
                  >
                    {row.value || ''}
                  </td>
                  <td
                    lang="ar"
                    dir="rtl"
                    style={{
                      border: `1px solid ${BORDER}`,
                      padding: '6px 8px',
                      verticalAlign: 'middle',
                      textAlign: 'right',
                      fontFamily: FONT,
                      fontSize: '14px',
                      fontWeight: 400,
                      lineHeight: '18px',
                      color: '#000000',
                      boxSizing: 'border-box',
                    }}
                  >
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

export default PublicCertificate
