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
    return () => {
      document.title = previousTitle
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

  const bodyCell = 'border border-[#d7d7d7] px-2 py-[11px] align-middle text-sm leading-tight tracking-normal max-[720px]:px-1.5 max-[720px]:py-2.5 max-[720px]:text-[13.5px]'

  return (
    <main className="min-h-screen w-full max-w-none bg-white font-certificate text-[#333]">
      <div className="mx-auto w-full max-w-[430px] px-3 pt-[34px] pb-12 max-[720px]:px-2.5 max-[720px]:pt-7 max-[720px]:pb-10">
        <h1 className="m-0 max-w-none text-center font-certificate text-[26px] leading-[1.25] font-medium tracking-normal text-[#2a2a2a] max-[720px]:text-2xl">Vehicle Certificate Details</h1>
        <p className="mt-2 mb-[18px] text-center font-arabic text-2xl leading-[1.4] font-medium text-[#2a2a2a] max-[720px]:text-[22px]" lang="ar" dir="rtl">
          تفاصيل شهادة المركبة
        </p>
        {loading ? (
          <p className="my-[18px] text-center text-sm leading-normal text-[#333]" role="status">Loading vehicle record…</p>
        ) : error ? (
          <p className="my-[18px] text-center text-sm leading-normal text-[#a35248]" role="alert">{error}</p>
        ) : !vehicle ? (
          <p className="my-[18px] text-center text-sm leading-normal text-[#333]" role="status">This public vehicle record could not be found.</p>
        ) : (
          <table className="w-full table-fixed border-collapse bg-white">
            <colgroup>
              <col className="w-[30%]" />
              <col className="w-[42%]" />
              <col className="w-[28%]" />
            </colgroup>
            <thead>
              <tr>
                <th className="h-[34px] border border-[#c5a15a] border-x-[#efe4cc] bg-[#c5a15a] p-0" />
                <th className="h-[34px] border border-[#c5a15a] border-x-[#efe4cc] bg-[#c5a15a] p-0" />
                <th className="h-[34px] border border-[#c5a15a] border-x-[#efe4cc] bg-[#c5a15a] p-0" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <th
                    className={`${bodyCell} text-left font-certificate font-normal text-[#3a3a3a]`}
                    scope="row"
                  >
                    {row.label}
                  </th>
                  <td className={`${bodyCell} text-center font-certificate font-bold text-[#111]`}>
                    <CellValue value={row.value} status={row.status} />
                  </td>
                  <td
                    className={`${bodyCell} text-right font-arabic leading-[1.45] font-medium text-[#333]`}
                    lang="ar"
                    dir="rtl"
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

function formatMakeBody(value) {
  const match = value?.match(/^(.*?)(\s*\([^)]*\))$/)
  return match ? [match[1], match[2].trim()] : value
}

function CellValue({ value, status }) {
  const lines = Array.isArray(value) ? value : [value || '']
  return (
    <span className={status ? 'font-bold text-[#1e9a1e]' : undefined}>
      {lines.map((line) => (
        <span key={line || 'empty'} className="block">
          {line}
        </span>
      ))}
    </span>
  )
}

export default PublicCertificate
