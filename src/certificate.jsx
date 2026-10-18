import { useEffect, useState } from 'react'
import { toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'
import QRCode from 'qrcode'
import { staticRuns } from './clearanceLayout.js'

export const certificateFields = [
  { key: 'certificateNumber', label: 'Certificate Number', arabic: 'رقم البطاقة' },
  { key: 'date', label: 'Date', arabic: 'تاريخ' },
  { key: 'makeBody', label: 'Make / Body Type', arabic: 'نوع المركبة / الشكل' },
  { key: 'importerName', label: 'Importer Name', arabic: 'اسم المستورد / المالك' },
  { key: 'declarationNumber', label: 'Declaration Number', arabic: 'رقم البيان الجمركي' },
  { key: 'model', label: 'Model', arabic: 'سنة الصنع' },
  { key: 'country', label: 'Country', arabic: 'بلد الصنع' },
  { key: 'chassisNo', label: 'Chassis No', arabic: 'رقم القاعدة' },
  { key: 'engineNo', label: 'Engine No', arabic: 'رقم المحرك' },
  { key: 'color', label: 'Color', arabic: 'اللون' },
  { key: 'remarks', label: 'Remarks', arabic: 'الملاحظات' },
  { key: 'userId', label: 'User ID', arabic: 'الموظف' },
  { key: 'status', label: 'Status', arabic: 'البطاقة' },
]

export const certificateVehicle = {
  certificateNumber: '29636',
  date: '08/09/2026',
  makeBody: 'LEXUS - LS460 (Sedan)',
  importerName: 'NOOR USED CARS TR LLC',
  declarationNumber: '2026-53-4-50832',
  model: '(2014)',
  country: 'Japan',
  chassisNo: 'JTHBL5EF6E5130108',
  engineNo: '',
  color: 'GRAY',
  remarks: '',
  userId: '',
  status: 'VALID',
}

export const blankVehicle = {
  certificateNumber: '',
  date: '',
  makeBody: '',
  importerName: '',
  declarationNumber: '',
  model: '',
  country: '',
  chassisNo: '',
  engineNo: '',
  color: '',
  remarks: '',
  userId: '',
  status: 'VALID',
}

export async function downloadCertificatePdf(vehicle) {
  const card = document.querySelector('.clearance-card')
  if (!card) throw new Error('The certificate is not open')
  const dataUrl = await toPng(card, {
    pixelRatio: 2,
    skipFonts: true,
    backgroundColor: '#ffffff',
  })
  const image = new Image()
  image.src = dataUrl
  await image.decode()
  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  const context = canvas.getContext('2d')
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(image, 0, 0)
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const margin = 16
  const width = pageWidth - margin * 2
  const height = width * (image.naturalHeight / image.naturalWidth)
  pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', margin, margin, width, height)
  const name = (vehicle.chassisNo || vehicle.certificateNumber || 'certificate').replace(/[^\w.-]+/g, '_')
  pdf.save(`${name}.pdf`)
}

export function CertificateSheet({ vehicle, titleId = 'view-title' }) {
  const link = vehicle.publicKey ? `${window.location.origin}/c/${vehicle.publicKey}` : ''
  const [qrSrc, setQrSrc] = useState('')

  useEffect(() => {
    if (!link) return undefined
    let active = true
    QRCode.toDataURL(link, {
      margin: 0,
      width: 280,
      errorCorrectionLevel: 'M',
      color: { dark: '#000000ff', light: '#00000000' },
    }).then((url) => {
      if (active) setQrSrc(url)
    })
    return () => {
      active = false
    }
  }, [link])

  const values = [
    { x: 96.2, y: 735.37, size: 10, stroke: true, text: vehicle.certificateNumber },
    { x: 495.98, y: 735.37, size: 10, stroke: true, text: vehicle.date },
    { x: 311, y: 693.1, size: 8, text: vehicle.makeBody },
    { x: 311, y: 665.1, size: 8, text: vehicle.model },
    { x: 311, y: 636.1, size: 8, text: vehicle.country },
    { x: 311, y: 606.1, size: 8, text: vehicle.chassisNo },
    { x: 311, y: 574.1, size: 8, text: vehicle.color },
    { x: 311, y: 544.1, size: 8, text: vehicle.engineNo },
    { x: 15, y: 606.1, size: 8, text: vehicle.importerName },
    { x: 15, y: 576.1, size: 8, text: vehicle.declarationNumber },
    { x: 310, y: 476.5, size: 8, text: vehicle.remarks },
  ]

  return (
    <div className="clearance-frame">
      <article className="clearance-card" aria-labelledby={titleId}>
        <div className="card-border" />
        <div className="footer-rule" />
        <div className="footer-split" />
        <div className="title-frame" />
        <img className="logo-customs" src="/cert/logo-customs.png" alt="جمارك الإمارات UAE Customs" />
        <img className="logo-sharjah" src="/cert/logo-sharjah.png" alt="حكومة الشارقة Government of Sharjah" />
        <img className="logo-gcc" src="/cert/logo-gcc.png" alt="مجلس التعاون لدول الخليج العربية" />
        <h2 id={titleId} className="sr-only">Vehicle Clearance Certificate Card</h2>
        {staticRuns.map((run) => (
          <span key={`${run.x}-${run.y}-${run.text}`} className={run.stroke ? 'run pen' : 'run'} style={runStyle(run)}>
            {/[\u0600-\uFEFF]/.test(run.text) ? <bdo dir="ltr">{run.text}</bdo> : run.text}
          </span>
        ))}
        {values.map((run) => run.text ? (
          <span key={`v-${run.x}-${run.y}`} className={run.stroke ? 'run pen' : 'run'} style={runStyle(run)}>{run.text}</span>
        ) : null)}
        {qrSrc ? <img className="card-qr" src={qrSrc} alt={`QR code for card ${vehicle.certificateNumber || ''}`} /> : <span className="card-qr" />}
      </article>
    </div>
  )
}

function runStyle(run) {
  return {
    left: `${((run.x - 2) / 591) * 100}%`,
    bottom: `${((run.y - 424) / 416) * 100}%`,
    fontSize: `${run.size}em`,
  }
}
