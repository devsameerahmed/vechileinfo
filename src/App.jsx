import { useEffect, useMemo, useState } from 'react'
import QRCode from 'qrcode'
import { supabase } from './supabase.js'
import { blankVehicle, insertVehicle, loadVehicles, removeVehicle, updateVehicle } from './vehicles.js'

function cn(...parts) {
  return parts.filter(Boolean).join(' ')
}

const button = 'inline-flex items-center justify-center gap-2 rounded-md font-semibold whitespace-nowrap transition duration-[180ms]'
const primaryColors = 'border border-[#293a35] bg-[#293a35] text-white shadow-[0_2px_4px_#1c342c1c] hover:-translate-y-px hover:border-[#3c514a] hover:bg-[#3c514a]'
const buttonPrimary = `${button} min-h-[37px] px-3.5 text-[10.5px] ${primaryColors}`
const buttonOutline = `${button} min-h-[37px] border border-[#e3e8e1] bg-white px-3.5 text-[10.5px] text-[#485851] hover:border-[#cbd6cd] hover:bg-[#fafbf8]`
const buttonLight = `${button} min-h-[37px] border border-[#e6eae5] bg-white px-3.5 text-[10.5px] text-[#68746e] hover:border-[#cbd6cd] hover:bg-[#fafbf8]`
const buttonDanger = `${button} min-h-[37px] border border-[#aa5147] bg-[#aa5147] px-3.5 text-[10.5px] text-white`
const buttonToolbar = `${button} min-h-[35px] border border-[#e6eae5] bg-white px-[11px] text-[10px] text-[#68746e] hover:border-[#cbd6cd] hover:bg-[#fafbf8] max-[760px]:px-[7px] max-[760px]:text-[9px]`
const iconButton = 'relative grid size-[34px] shrink-0 place-items-center rounded-full border bg-transparent text-[#52615b]'
const field = 'flex flex-col gap-1.5 text-[10px] font-semibold text-[#56645c]'
const control = 'h-[38px] w-full rounded-[5px] border border-[#e4e9e3] bg-white px-2.5 text-[10px] font-normal text-[#4c5a53] placeholder:text-[#b2bab4] max-[480px]:h-9'
const area = 'min-h-[72px] w-full resize-y rounded-[5px] border border-[#e4e9e3] bg-white p-2.5 text-[10px] leading-normal font-normal text-[#4c5a53]'
const optional = 'ml-[3px] text-[9px] font-normal text-[#a2aaa4] not-italic'
const modalShell = 'w-full overflow-y-auto rounded-[10px] border border-[#e8ebe5] bg-white shadow-[0_24px_70px_#16251f38] animate-rise max-[480px]:px-[17px] max-[480px]:pt-5 max-[480px]:pb-4'
const formModal = `${modalShell} max-h-[min(92vh,860px)] max-w-[720px] px-[26px] pt-[25px] pb-[22px]`
const deleteModalClass = `${modalShell} max-h-[min(90vh,760px)] max-w-[410px] p-[27px]`
const qrModalClass = `${modalShell} grid max-h-[min(90vh,760px)] max-w-[340px] place-items-center p-[18px]`
const backdrop = 'fixed inset-0 z-[8] grid animate-fade-in place-items-center bg-[#17231f80] p-5 backdrop-blur-[3px]'
const statCard = 'relative min-h-[148px] overflow-hidden rounded-lg border max-[1120px]:min-h-[135px] max-[760px]:min-h-[133px] max-[480px]:min-h-[127px]'
const statPad = 'border-[#e8ebe6] bg-white px-[17px] pt-4 pb-[13px] max-[760px]:p-[13px] max-[480px]:p-[11px]'
const td = 'h-[65px] text-[10px] max-[760px]:h-[61px]'
const sparkHeights = ['h-[28%]', 'h-[28%]', 'h-[76%]', 'h-[49%]', 'h-full', 'h-[76%]', 'h-[65%]', 'h-[49%]', 'h-[76%]', 'h-full', 'h-[28%]', 'h-[49%]']

function Icon({ name, size = 18, strokeWidth = 1.8 }) {
  const shared = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }

  const paths = {
    grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></>,
    car: <><path d="m5 11 1.4-4.2A2.5 2.5 0 0 1 8.8 5h6.4a2.5 2.5 0 0 1 2.4 1.8L19 11" /><path d="M3.5 11.5h17v6h-17z" /><path d="M6 17.5v2M18 17.5v2M3.5 14h17" /><circle cx="7.5" cy="14.5" r=".7" fill="currentColor" /><circle cx="16.5" cy="14.5" r=".7" fill="currentColor" /></>,
    users: <><path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20" /><circle cx="10" cy="7.5" r="3.5" /><path d="M16 4.2a3.5 3.5 0 0 1 0 6.7M20 20v-1.5a3.5 3.5 0 0 0-2.6-3.4" /></>,
    chart: <><path d="M4 19.5h16" /><path d="M6.5 16v-4M11.5 16V7M16.5 16v-6M21 16V4" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.3" /><path d="m16 16 4.2 4.2" /></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    down: <path d="m7 10 5 5 5-5" />,
    dots: <><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="currentColor" /></>,
    edit: <><path d="m14.5 5.5 4 4M4 20l4.5-.9L19 8.6a2.1 2.1 0 0 0-3-3L5.5 16.1 4 20Z" /><path d="M13 20h7" /></>,
    trash: <><path d="M4 7h16M10 11v5M14 11v5M5.5 7l1 13h11l1-13M9 7V4h6v3" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    filter: <><path d="M4 6h16M7 12h10M10 18h4" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 1 1 8 0v3M12 14v3" /></>,
    eye: <><path d="M2.5 12S6.2 6.5 12 6.5 21.5 12 21.5 12 17.8 17.5 12 17.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.6" /></>,
    qr: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM20 14v2M17 20h4M20 19v2" /></>,
  }

  return <svg {...shared}>{paths[name] || paths.grid}</svg>
}

function VintageCarMark() {
  return (
    <svg className="h-10 w-[57px] max-[760px]:w-12" viewBox="0 0 72 44" fill="none" aria-hidden="true">
      <path d="m10 26 3.7-9.4a5.2 5.2 0 0 1 4.8-3.2h24.8c2.5 0 4.7 1.1 6.2 3.2l6.2 8.5 6.1 2.1c1.7.6 2.8 2.1 2.8 3.9v3.4H6.5v-4.3c0-1.9 1.4-3.6 3.5-4.2Z" fill="currentColor" />
      <path d="m18 16.5-3.1 8.1h38.7l-5.7-7.7a3.2 3.2 0 0 0-2.6-1.3H19.3c-.6 0-1.1.3-1.3.9Z" fill="#263432" />
      <path d="m14.4 24.6 3.4-8.7M52.7 25l-6.3-8.4" stroke="#263432" strokeWidth="1.4" />
      <path d="M5 28.7h5.4M61.1 28.7h5.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="19.5" cy="34.5" r="5.2" fill="#263432" stroke="currentColor" strokeWidth="2" />
      <circle cx="51.5" cy="34.5" r="5.2" fill="#263432" stroke="currentColor" strokeWidth="2" />
      <circle cx="19.5" cy="34.5" r="1.7" fill="currentColor" />
      <circle cx="51.5" cy="34.5" r="1.7" fill="currentColor" />
      <path d="M3 29h4M65 29h4" stroke="#D99B6C" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

function Sparkline({ barClass }) {
  return (
    <div className="pointer-events-none absolute right-3 bottom-0 flex h-[34px] w-[70px] items-end gap-[3px] opacity-55" aria-hidden="true">
      {sparkHeights.map((height, index) => (
        <i key={`${height}-${index}`} className={cn('w-[3px] shrink-0 rounded-t-[3px]', height, barClass)} />
      ))}
    </div>
  )
}

function navItemClass(active) {
  return cn(
    'relative flex h-[43px] w-full items-center gap-[13px] rounded-[7px] border-0 bg-transparent px-[13px] text-left text-[12.5px] text-[#aeb9b3] transition duration-[180ms]',
    'max-[760px]:h-[38px] max-[760px]:w-auto max-[760px]:gap-[7px] max-[760px]:px-[9px] max-[760px]:text-[10px]',
    'max-[480px]:w-[34px] max-[480px]:justify-center max-[480px]:px-0',
    active ? 'bg-[#344742] font-semibold text-white hover:bg-[#344742]' : 'hover:bg-[#2b3d39] hover:text-white',
  )
}

const detailFields = [
  ['date', 'Date'],
  ['makeBody', 'Make / body type'],
  ['model', 'Model'],
  ['country', 'Country'],
  ['chassisNo', 'Chassis no'],
  ['engineNo', 'Engine no'],
  ['color', 'Color'],
  ['remarks', 'Remarks'],
]

function App({ user }) {
  const email = user?.email || ''
  const fullName = user?.user_metadata?.full_name || email.split('@')[0] || 'Administrator'
  const firstName = fullName.split(' ')[0]
  const initials = fullName.split(' ').filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'A'

  async function signOut() {
    await supabase.auth.signOut()
  }

  const [vehicles, setVehicles] = useState([])
  const [query, setQuery] = useState('')
  const [modal, setModal] = useState(null)
  const [qrVehicle, setQrVehicle] = useState(null)
  const [form, setForm] = useState(blankVehicle)
  const [toast, setToast] = useState('')
  const [activeNav, setActiveNav] = useState('Dashboard')
  const [actionMenu, setActionMenu] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true
    loadVehicles()
      .then((records) => {
        if (active) setVehicles(records)
      })
      .catch((error) => {
        if (!active) return
        const missingTable = String(error.message || '').includes('vehicle_certificates')
        setNotice(missingTable
          ? 'Supabase is connected, but the vehicle_certificates table is not created yet. Run supabase/vehicle_certificates.sql in the Supabase SQL editor, then refresh.'
          : (error.message || 'Could not load vehicles from Supabase'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!toast) return undefined
    const timeout = window.setTimeout(() => setToast(''), 2600)
    return () => window.clearTimeout(timeout)
  }, [toast])

  useEffect(() => {
    if (!actionMenu) return undefined
    function closeMenu() {
      setActionMenu(null)
    }
    function onKey(event) {
      if (event.key === 'Escape') setActionMenu(null)
    }
    window.addEventListener('scroll', closeMenu, true)
    window.addEventListener('resize', closeMenu)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('scroll', closeMenu, true)
      window.removeEventListener('resize', closeMenu)
      window.removeEventListener('keydown', onKey)
    }
  }, [actionMenu])

  const visibleVehicles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return vehicles.filter((vehicle) => {
      const searchable = [vehicle.date, vehicle.makeBody, vehicle.model, vehicle.country, vehicle.chassisNo, vehicle.engineNo, vehicle.color, vehicle.remarks]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return searchable.includes(normalizedQuery)
    })
  }, [vehicles, query])

  const chassisCount = vehicles.filter((vehicle) => vehicle.chassisNo).length
  const countryCount = new Set(vehicles.map((vehicle) => vehicle.country).filter(Boolean)).size
  const qrUrl = qrVehicle?.publicKey
    ? new URL(`/certificate/${encodeURIComponent(qrVehicle.publicKey)}`, window.location.origin).toString()
    : ''
  const qrValue = qrUrl

  function openCreate() {
    setForm(blankVehicle)
    setModal({ type: 'vehicle' })
  }

  function openEdit(vehicle) {
    setActionMenu(null)
    setForm({ ...blankVehicle, ...vehicle })
    setModal({ type: 'vehicle', vehicleId: vehicle.id })
  }

  function openView(vehicle) {
    setActionMenu(null)
    setModal({ type: 'view', vehicle })
  }

  function openQr(vehicle) {
    setActionMenu(null)
    setQrVehicle(vehicle)
  }

  function openDelete(vehicle) {
    setActionMenu(null)
    setModal({ type: 'delete', vehicle })
  }

  function toggleActions(event, vehicle) {
    const rect = event.currentTarget.getBoundingClientRect()
    setActionMenu((current) =>
      current?.vehicle.id === vehicle.id
        ? null
        : { vehicle, top: rect.bottom + 6, left: rect.left },
    )
  }

  async function saveVehicle(event) {
    event.preventDefault()
    setSaving(true)
    try {
      if (modal.vehicleId) {
        const updated = await updateVehicle(modal.vehicleId, form)
        setVehicles((current) => current.map((vehicle) => (vehicle.id === updated.id ? updated : vehicle)))
        setToast('Vehicle updated')
      } else {
        const created = await insertVehicle(form)
        setVehicles((current) => [created, ...current])
        setToast('Vehicle saved')
      }
      setModal(null)
    } catch (error) {
      setToast(error.message || 'Could not save the vehicle')
    } finally {
      setSaving(false)
    }
  }

  async function deleteVehicle(vehicleId) {
    setSaving(true)
    try {
      await removeVehicle(vehicleId)
      setVehicles((current) => current.filter((vehicle) => vehicle.id !== vehicleId))
      setModal(null)
      setToast('Vehicle removed from inventory')
    } catch (error) {
      setToast(error.message || 'Could not remove the vehicle')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-[2] flex w-[248px] flex-col bg-[#20312e] px-[17px] pt-[29px] pb-[18px] text-[#f4f3ee] max-[1120px]:w-[220px] max-[760px]:relative max-[760px]:inset-auto max-[760px]:h-auto max-[760px]:min-h-16 max-[760px]:w-full max-[760px]:flex-row max-[760px]:items-center max-[760px]:px-4 max-[760px]:py-[9px]">
        <a href="#" className="flex items-center gap-2.5 px-2 text-inherit no-underline max-[760px]:p-0 max-[480px]:gap-1.5" aria-label="Heritage Motors home" onClick={(event) => event.preventDefault()}>
          <span className="grid h-[47px] w-[58px] place-items-center text-[#d99b6c] max-[760px]:h-[41px] max-[760px]:w-[47px]"><VintageCarMark /></span>
          <span className="flex flex-col gap-px">
            <span className="font-display text-[15px] leading-none font-extrabold tracking-[2.1px] max-[480px]:text-xs max-[480px]:tracking-[1.4px]">HERITAGE</span>
            <span className="text-[8px] leading-[1.6] tracking-[2.1px] text-[#a9b4ae] max-[480px]:text-[7px] max-[480px]:tracking-[1.4px]">MOTOR COMPANY</span>
          </span>
        </a>

        <div className="mx-3 mt-[52px] mb-[13px] text-[9px] font-bold tracking-[1.4px] text-[#82908a] max-[760px]:hidden">WORKSPACE</div>
        <nav className="grid gap-[5px] max-[760px]:ml-auto max-[760px]:flex max-[760px]:gap-[3px] max-[480px]:gap-0" aria-label="Main navigation">
          {[
            ['Dashboard', 'grid'],
            ['Inventory', 'car'],
          ].map(([label, icon]) => (
            <button
              className={navItemClass(activeNav === label)}
              key={label}
              onClick={() => setActiveNav(label)}
            >
              {activeNav === label && (
                <>
                  <span className="absolute top-[calc(50%-11px)] -left-[17px] h-[22px] w-[3px] rounded-r-[3px] bg-[#d69a6c] max-[760px]:hidden" />
                  <span className="absolute -bottom-[9px] left-[9px] right-[9px] hidden h-0.5 bg-[#d69a6c] max-[760px]:block max-[480px]:left-[5px] max-[480px]:right-[5px]" />
                </>
              )}
              <Icon name={icon} size={18} />
              <span className="max-[480px]:hidden">{label}</span>
              {label === 'Inventory' && <span className="ml-auto grid h-[21px] min-w-6 place-items-center rounded-[5px] bg-[#40534d] px-1.5 text-[10px] text-[#d0d8d2] max-[760px]:hidden">{vehicles.length}</span>}
            </button>
          ))}
        </nav>

        <div className="mt-auto max-[760px]:hidden">
          <div className="mx-0.5 mb-[17px] flex items-center gap-[9px] rounded-lg border border-[#3a4a45] px-[9px] py-3">
            <span className="grid size-[29px] shrink-0 place-items-center rounded-[7px] bg-[#3c4842] text-[#d8a47d]"><Icon name="lock" size={16} /></span>
            <span className="flex min-w-0 flex-col gap-[3px]"><strong className="text-[10.5px] font-semibold">Admin access</strong><small className="text-[9px] text-[#9ca9a2]">Only you can manage listings</small></span>
            <span className="ml-auto size-1.5 shrink-0 self-start rounded-full bg-[#87b38f] shadow-[0_0_0_3px_#344b40]" />
          </div>
          <div className="flex w-full items-center gap-2.5 border-t border-[#3a4945] px-[5px] pt-3.5 text-inherit">
            <span className="grid size-[33px] shrink-0 place-items-center rounded-full bg-[#9c7053] font-display text-[10px] font-bold text-[#fbf5ed]">{initials}</span>
            <span className="flex min-w-0 flex-1 flex-col gap-[3px]"><strong className="text-[10.5px] font-semibold">{fullName}</strong><small className="text-[9px] text-[#9ca9a2]">{email}</small></span>
            <button className="ml-auto border-0 bg-transparent p-0 text-[9px] font-semibold text-[#c9b3a2] hover:text-white" onClick={signOut}>Sign out</button>
          </div>
        </div>
      </aside>

      <main className="ml-[248px] min-h-screen max-[1120px]:ml-[220px] max-[760px]:ml-0 max-[760px]:min-h-[calc(100vh_-_64px)]">
        <header className="flex h-[65px] items-center justify-between border-b border-[#e9ece7] bg-white/72 px-12 min-[1500px]:px-[62px] max-[1120px]:px-[30px] max-[760px]:h-[51px] max-[760px]:px-[19px]">
          <div className="flex items-center gap-2.5 text-[11px] text-[#9aa39e] max-[480px]:text-[9px]"><span>Workspace</span><Icon name="chevron" size={14} /><strong className="font-semibold text-[#4b5b55]">{activeNav}</strong></div>
          <div className="flex items-center gap-[18px] max-[760px]:min-w-0 max-[760px]:gap-0">
            <span className="shrink-0 text-[10px] whitespace-nowrap text-[#909b95] max-[1120px]:hidden">Monday, October 19, 2026</span>
            <button className={`${iconButton} border-[#e9ece7]`} aria-label="Notifications">
              <Icon name="bell" size={19} /><span className="absolute top-[7px] right-[7px] size-[5px] rounded-full border border-white bg-[#c87e58]" />
            </button>
            <span className="h-[25px] w-px bg-[#e7eae5] max-[760px]:hidden" />
            <span className="flex min-w-0 items-center gap-2">
              <span className="flex min-w-0 max-w-[220px] flex-col items-end gap-px overflow-hidden max-[760px]:max-w-[140px]"><strong className="max-w-full truncate text-[11px] font-semibold text-[#3d4c46] max-[760px]:hidden">{fullName}</strong><span className="max-w-full truncate text-[10px] text-[#8b9690]">{email}</span></span>
              <span className="grid size-[29px] shrink-0 basis-[29px] place-items-center rounded-full bg-[#9c7053] font-display text-[9px] font-bold text-[#fbf5ed]">{initials}</span>
            </span>
          </div>
        </header>

        <div className="mx-auto max-w-[1440px] px-12 pt-9 pb-[21px] min-[1500px]:px-[62px] max-[1120px]:px-[30px] max-[1120px]:pt-8 max-[1120px]:pb-5 max-[760px]:px-[19px] max-[760px]:pt-[27px] max-[760px]:pb-[18px] max-[480px]:px-[13px]">
          <section className="flex items-end justify-between gap-5 max-[760px]:items-start max-[480px]:flex-col max-[480px]:items-start max-[480px]:gap-3.5">
            <div>
              <div className="flex items-center gap-2 text-[9px] font-bold tracking-[1.4px] text-[#9a765b] max-[480px]:text-[8px]"><span className="h-px w-[19px] bg-[#c99b77]" /> MONDAY, OCTOBER 19, 2026</div>
              <h1 className="mt-2.5 font-display text-[27px] leading-[1.25] font-semibold tracking-[-0.8px] text-[#263430] max-[760px]:max-w-[370px] max-[760px]:text-[23px] max-[480px]:text-[22px]">Good morning, {firstName} <span className="inline-block rotate-[14deg] font-sans text-[19px] font-normal text-[#bc855e]">✳</span></h1>
              <p className="mt-[7px] text-[11.5px] text-[#89948e] max-[760px]:max-w-[270px] max-[760px]:leading-normal">Signed in as {email}</p>
            </div>
            <button className={`${buttonPrimary} max-[760px]:min-h-[34px] max-[760px]:px-2.5 max-[760px]:text-[9px] max-[480px]:-mt-0.5 max-[480px]:self-end`} onClick={openCreate}><Icon name="plus" size={18} /> Add a vehicle</button>
          </section>

          <section className="mt-[26px] grid grid-cols-[1fr_1fr_1.15fr_1fr] gap-[13px] max-[1120px]:grid-cols-2 max-[760px]:mt-[22px] max-[760px]:gap-[9px]" aria-label="Inventory overview">
            <article className={cn(statCard, statPad)}>
              <div className="flex items-center justify-between"><span className="grid size-8 place-items-center rounded-[7px] bg-[#edf3ed] text-[#53715f] max-[480px]:size-[29px]"><Icon name="car" size={19} /></span><span className="inline-flex items-center gap-[3px] rounded bg-[#edf5ee] px-1.5 py-1 text-[9px] font-semibold text-[#588163] max-[480px]:px-1 max-[480px]:py-[3px] max-[480px]:text-[8px]"><span className="text-[11px]">↗</span> 12.5%</span></div>
              <div className="relative z-[1] mt-3 font-display text-[26px] leading-none font-bold tracking-[-0.8px] text-[#293834] max-[760px]:text-[23px] max-[480px]:mt-2.5 max-[480px]:text-[21px]">{vehicles.length.toString().padStart(2, '0')}</div>
              <div className="relative z-[1] mt-[5px] text-[10px] font-semibold text-[#59665f] max-[480px]:text-[9px]">Total vehicles <span className="ml-[3px] text-[9px] font-normal text-[#9da59f] max-[760px]:mt-1 max-[760px]:ml-0 max-[760px]:block max-[480px]:text-[8px]">vs. last month</span></div>
              <Sparkline barClass="bg-[#b2c6b2]" />
            </article>
            <article className={cn(statCard, statPad)}>
              <div className="flex items-center justify-between"><span className="grid size-8 place-items-center rounded-[7px] bg-[#f8f0e8] text-[#a8784d] max-[480px]:size-[29px]"><Icon name="check" size={19} /></span><span className="inline-flex items-center gap-[3px] rounded bg-[#edf5ee] px-1.5 py-1 text-[9px] font-semibold text-[#588163] max-[480px]:px-1 max-[480px]:py-[3px] max-[480px]:text-[8px]"><span className="text-[11px]">↗</span> 8.2%</span></div>
              <div className="relative z-[1] mt-3 font-display text-[26px] leading-none font-bold tracking-[-0.8px] text-[#293834] max-[760px]:text-[23px] max-[480px]:mt-2.5 max-[480px]:text-[21px]">{chassisCount.toString().padStart(2, '0')}</div>
              <div className="relative z-[1] mt-[5px] text-[10px] font-semibold text-[#59665f] max-[480px]:text-[9px]">Chassis recorded <span className="ml-[3px] text-[9px] font-normal text-[#9da59f] max-[760px]:mt-1 max-[760px]:ml-0 max-[760px]:block max-[480px]:text-[8px]">in this collection</span></div>
              <Sparkline barClass="bg-[#ddc29f]" />
            </article>
            <article className={cn(statCard, statPad)}>
              <div className="flex items-center justify-between"><span className="grid size-8 place-items-center rounded-[7px] bg-[#f6eeeb] text-[#9f695d] max-[480px]:size-[29px]"><Icon name="chart" size={19} /></span><span className="inline-flex items-center gap-[3px] rounded bg-[#f5f3ed] px-1.5 py-1 text-[9px] font-medium text-[#99917f] max-[480px]:px-1 max-[480px]:py-[3px] max-[480px]:text-[8px]">Portfolio</span></div>
              <div className="relative z-[1] mt-3 font-display text-[26px] leading-none font-bold tracking-[-0.8px] text-[#293834] max-[760px]:text-[23px] max-[480px]:mt-2.5 max-[480px]:text-[21px]">{countryCount.toString().padStart(2, '0')}</div>
              <div className="relative z-[1] mt-[5px] text-[10px] font-semibold text-[#59665f] max-[480px]:text-[9px]">Countries of origin <span className="ml-[3px] text-[9px] font-normal text-[#9da59f] max-[760px]:mt-1 max-[760px]:ml-0 max-[760px]:block max-[480px]:text-[8px]">in this collection</span></div>
              <Sparkline barClass="bg-[#dab7a9]" />
            </article>
            <article className={cn(statCard, 'border-[#edece3] bg-[#edece3] px-[18px] py-[17px] max-[760px]:p-[13px] max-[480px]:px-3 max-[480px]:py-[13px]')}>
              <div className="flex items-center justify-between"><span className="text-[8px] font-bold tracking-[1.1px] text-[#928c77]">THE COLLECTION</span><span className="text-[19px] text-[#b98a59]">✳</span></div>
              <p className="mt-3 max-w-[208px] font-display text-xs leading-[1.55] font-medium text-[#47524b] max-[1120px]:max-w-[260px] max-[480px]:text-[10px]">“The best journeys are measured in stories, not miles.”</p>
              <span className="mt-1.5 block text-[8.5px] text-[#968f7b]">— A thought for the road</span>
              <div className="absolute inset-x-0 bottom-0 h-[3px] bg-[repeating-linear-gradient(90deg,#b58a60_0_15px,transparent_15px_21px)] opacity-60" aria-hidden="true" />
            </article>
          </section>

          <section className="mt-8 rounded-lg border border-[#e8ebe6] bg-white px-[22px] pt-[23px] shadow-[0_3px_12px_#283b2f04] max-[760px]:mt-[22px] max-[760px]:px-3.5 max-[760px]:pt-[18px] max-[480px]:px-2.5">
            <div className="flex items-center justify-between gap-[15px]">
              <div>
                <div className="text-[8px] font-bold tracking-[1.2px] text-[#a18165]">YOUR COLLECTION</div>
                <h2 className="mt-[5px] font-display text-lg leading-[1.3] font-semibold tracking-[-0.4px] text-[#2d3b36] max-[760px]:text-base">{activeNav === 'Dashboard' ? 'Vehicle inventory' : activeNav}</h2>
                <p className="mt-1 text-[10.5px] text-[#909b95] max-[760px]:text-[9px]">A considered collection, carefully cared for.</p>
              </div>
              <button className={`${buttonOutline} max-[760px]:min-h-[33px] max-[760px]:px-[9px] max-[760px]:text-[9px]`} onClick={openCreate}><Icon name="plus" size={17} /> Add vehicle</button>
            </div>

            {notice && <div className="mt-4 rounded-lg border border-[#ead9c2] bg-[#fbf6ef] px-3.5 py-3 text-xs leading-normal text-[#6a5340]" role="status">{notice}</div>}
            <div className="mt-5 flex items-center justify-between gap-3.5 border-b border-[#eff1ee] pb-[15px] max-[760px]:mt-[15px] max-[480px]:flex-col max-[480px]:items-stretch">
              <label className="flex h-[35px] w-[min(330px,48%)] items-center gap-2 rounded-[5px] border border-[#e8ebe7] bg-white px-[9px] text-[#96a09a] max-[760px]:w-[min(230px,55%)] max-[480px]:w-full">
                <Icon name="search" size={18} />
                <input className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[10px] text-[#47554e] outline-none placeholder:text-[#a9b0ab]" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search vehicles..." aria-label="Search vehicles" />
                <kbd className="rounded-[3px] border border-[#e7eae6] bg-[#fafbf9] px-1 py-0.5 font-sans text-[9px] text-[#9da69f] max-[760px]:hidden">⌘ K</kbd>
              </label>
              <div className="flex items-center gap-2 max-[760px]:gap-[5px] max-[480px]:justify-end">
                <button className={buttonToolbar} onClick={() => setQuery('')}>Reset</button>
              </div>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse text-left whitespace-nowrap">
                <thead className="text-[8px] font-bold tracking-[0.8px] text-[#9ba49e] [&_th]:h-[38px] [&_th]:font-bold">
                  <tr>
                    <th className="sticky left-0 z-[2] min-w-[108px] bg-white shadow-[10px_0_14px_-12px_#283b2f33]">ACTIONS</th>
                    <th>DATE</th>
                    <th>MAKE / BODY TYPE</th>
                    <th>MODEL</th>
                    <th>COUNTRY</th>
                    <th>CHASSIS NO</th>
                    <th>ENGINE NO</th>
                    <th>COLOR</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleVehicles.map((vehicle) => (
                    <tr className="group border-t border-[#f0f2ef] transition-colors duration-150 hover:bg-[#fcfdfa]" key={vehicle.id}>
                      <td className={cn(td, 'sticky left-0 z-[1] min-w-[108px] bg-white shadow-[10px_0_14px_-12px_#283b2f33] group-hover:bg-[#fcfdfa]')}>
                        <button
                          className="inline-flex h-[30px] items-center gap-1.5 rounded-[5px] border border-[#e3e8e1] bg-white px-2.5 text-[10px] font-semibold text-[#3f4e47] hover:border-[#cbd6cd] hover:bg-[#f7faf6] aria-expanded:border-[#cbd6cd] aria-expanded:bg-[#f7faf6]"
                          aria-haspopup="menu"
                          aria-expanded={actionMenu?.vehicle.id === vehicle.id}
                          aria-label={`Actions for ${vehicle.makeBody}`}
                          onClick={(event) => toggleActions(event, vehicle)}
                        >
                          Actions <Icon name="down" size={13} />
                        </button>
                      </td>
                      <td className={cn(td, 'text-[#727f77]')}>{vehicle.date}</td>
                      <td className={cn(td, 'text-[#506058]')}>
                        <div className="flex flex-col gap-[5px]">
                          <strong className="text-[10.5px] font-semibold text-[#34433d]">{vehicle.makeBody}</strong>
                          {vehicle.remarks && <span className="flex items-center gap-1.5 text-[8.5px] text-[#9aa49d]">{vehicle.remarks}</span>}
                        </div>
                      </td>
                      <td className={cn(td, 'text-[#727f77]')}>{vehicle.model}</td>
                      <td className={cn(td, 'text-[#727f77]')}>{vehicle.country}</td>
                      <td className={cn(td, 'text-[#727f77]')}>{vehicle.chassisNo}</td>
                      <td className={cn(td, 'text-[#727f77]')}>{vehicle.engineNo || '—'}</td>
                      <td className={cn(td, 'text-[#727f77]')}>{vehicle.color}</td>
                    </tr>
                  ))}
                  {visibleVehicles.length === 0 && (
                    <tr><td className={td} colSpan="8"><div className="flex flex-col items-center gap-2 px-2.5 py-8 text-center whitespace-normal text-[#929e96]"><span className="mb-0.5 grid size-[41px] place-items-center rounded-full bg-[#edf2ed] text-[#718577]"><Icon name="car" size={22} /></span><strong className="text-xs text-[#46554c]">{loading ? 'Loading vehicles' : 'No vehicles found'}</strong><span className="text-[10px]">{loading ? 'Reading records from Supabase.' : 'Add a vehicle to your collection.'}</span>{!loading && <button className="inline-flex items-center gap-1.5 bg-transparent p-[5px] text-[9px] font-semibold text-[#597965] hover:text-[#31473a]" onClick={openCreate}>Add a vehicle <Icon name="arrow" size={15} /></button>}</div></td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex min-h-[47px] items-center justify-between border-t border-[#eef0ed] text-[9px] text-[#9aa39d] max-[480px]:text-[8px]">
              <span>Showing <strong className="font-semibold text-[#6e7b73]">{visibleVehicles.length ? 1 : 0}–{visibleVehicles.length}</strong> of <strong className="font-semibold text-[#6e7b73]">{vehicles.length}</strong> vehicles</span>
              <button className="inline-flex items-center gap-1.5 bg-transparent py-[5px] pr-0 pl-2 text-[9px] font-semibold text-[#65786b] hover:text-[#31473a] max-[480px]:text-[8px]" onClick={() => setQuery('')}>View all vehicles <Icon name="arrow" size={15} /></button>
            </div>
          </section>
          <footer className="flex justify-between px-0.5 pt-[17px] text-[9px] text-[#a0a9a2] max-[760px]:text-[8px] max-[480px]:gap-2.5"><span>© 2026 Heritage Motor Company</span><span className="flex items-center gap-1.5"><i className="size-[5px] rounded-full bg-[#81a487]" /> Your collection is looking good</span></footer>
        </div>
      </main>

      {modal?.type === 'vehicle' && (
        <div className={backdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null) }}>
          <section className={formModal} role="dialog" aria-modal="true" aria-labelledby="vehicle-modal-title">
            <div className="mb-[22px] flex justify-between gap-[15px] max-[480px]:mb-[17px]">
              <div><span className="text-[8px] font-bold tracking-[1.2px] text-[#a18165]">{modal.vehicleId ? 'UPDATE VEHICLE' : 'NEW VEHICLE'}</span><h2 className="mt-1.5 font-display text-xl leading-[1.3] font-semibold tracking-[-0.4px] text-[#2d3b36]" id="vehicle-modal-title">{modal.vehicleId ? 'Edit vehicle' : 'Add a vehicle'}</h2><p className="mt-1 text-[10.5px] text-[#909b95]">Private inventory details for this collection.</p></div>
              <button className={`${iconButton} border-[#ecefea]`} onClick={() => setModal(null)} aria-label="Close"><Icon name="close" size={19} /></button>
            </div>
            <form onSubmit={saveVehicle}>
              <div className="grid grid-cols-2 gap-x-[13px] gap-y-[15px] max-[480px]:grid-cols-1 max-[480px]:gap-[11px]">
                <label className={field}><span>Certificate Number <em className={optional}>optional</em></span><input className={control} value={form.certificateNumber} onChange={(event) => setForm({ ...form, certificateNumber: event.target.value })} placeholder="29636" /></label>
                <label className={field}><span>Date</span><input className={control} required value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} placeholder="08/09/2026" /></label>
                <label className={field}><span>Make / Body Type</span><input className={control} required value={form.makeBody} onChange={(event) => setForm({ ...form, makeBody: event.target.value })} placeholder="LEXUS - LS460 (Sedan)" /></label>
                <label className={field}><span>Importer Name <em className={optional}>optional</em></span><input className={control} value={form.importerName} onChange={(event) => setForm({ ...form, importerName: event.target.value })} placeholder="Importer or owner name" /></label>
                <label className={field}><span>Declaration Number <em className={optional}>optional</em></span><input className={control} value={form.declarationNumber} onChange={(event) => setForm({ ...form, declarationNumber: event.target.value })} placeholder="Customs declaration number" /></label>
                <label className={field}><span>Model</span><input className={control} required value={form.model} onChange={(event) => setForm({ ...form, model: event.target.value })} placeholder="2014" /></label>
                <label className={field}><span>Country</span><input className={control} required value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })} placeholder="Japan" /></label>
                <label className={field}><span>Chassis No</span><input className={control} required value={form.chassisNo} onChange={(event) => setForm({ ...form, chassisNo: event.target.value })} placeholder="Chassis number" /></label>
                <label className={field}><span>Engine No <em className={optional}>optional</em></span><input className={control} value={form.engineNo} onChange={(event) => setForm({ ...form, engineNo: event.target.value })} placeholder="Engine number" /></label>
                <label className={field}><span>Color</span><input className={control} required value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })} placeholder="Gray" /></label>
                <label className={field}><span>User ID <em className={optional}>optional</em></span><input className={control} value={form.userId} onChange={(event) => setForm({ ...form, userId: event.target.value })} placeholder="Employee ID" /></label>
                <label className={field}><span>Status</span><input className={control} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} placeholder="VALID" /></label>
                <label className={cn(field, 'col-span-2 max-[480px]:col-span-1')}><span>Remarks <em className={optional}>optional</em></span><textarea className={area} value={form.remarks} onChange={(event) => setForm({ ...form, remarks: event.target.value })} placeholder="Notes" /></label>
              </div>
              <div className="mt-[22px] flex justify-end gap-2 border-t border-[#eef0ed] pt-4"><button type="button" className={buttonLight} onClick={() => setModal(null)} disabled={saving}>Cancel</button><button type="submit" className={buttonPrimary} disabled={saving}>{modal.vehicleId ? 'Save changes' : <><Icon name="plus" size={17} /> Add vehicle</>}</button></div>
            </form>
          </section>
        </div>
      )}

      {modal?.type === 'view' && (
        <div className={backdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null) }}>
          <section className={formModal} role="dialog" aria-modal="true" aria-labelledby="view-title">
            <div className="mb-[22px] flex justify-between gap-[15px] max-[480px]:mb-[17px]">
              <div><span className="text-[8px] font-bold tracking-[1.2px] text-[#a18165]">VEHICLE</span><h2 className="mt-1.5 font-display text-xl leading-[1.3] font-semibold tracking-[-0.4px] text-[#2d3b36]" id="view-title">{modal.vehicle.makeBody || 'Vehicle'}</h2></div>
              <button className={`${iconButton} border-[#ecefea]`} onClick={() => setModal(null)} aria-label="Close"><Icon name="close" size={19} /></button>
            </div>
            <dl className="m-0 grid gap-3">
              {detailFields.map(([key, label]) => (
                <div className="grid grid-cols-[140px_1fr] gap-3" key={key}>
                  <dt className="text-xs text-[#809087]">{label}</dt>
                  <dd className="m-0 text-sm font-semibold text-[#2d3b36]">{modal.vehicle[key] || '—'}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-[22px] flex justify-end gap-2 border-t border-[#eef0ed] pt-4"><button className={buttonLight} onClick={() => setModal(null)}>Close</button></div>
          </section>
        </div>
      )}

      {modal?.type === 'delete' && (
        <div className={backdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null) }}>
          <section className={deleteModalClass} role="alertdialog" aria-modal="true" aria-labelledby="delete-title">
            <span className="grid size-[39px] place-items-center rounded-lg bg-[#f8efed] text-[#a5554b]"><Icon name="trash" size={20} /></span>
            <h2 className="mt-4 font-display text-[17px] font-semibold text-[#2c3a34]" id="delete-title">Remove this vehicle?</h2>
            <p className="mt-2 text-[11px] leading-[1.65] text-[#7e8982]"><strong className="font-semibold text-[#56645c]">{modal.vehicle.makeBody}</strong> will be removed from your collection. This action cannot be undone.</p>
            <div className="mt-[22px] flex justify-end gap-2 border-t border-[#eef0ed] pt-4"><button className={buttonLight} onClick={() => setModal(null)} disabled={saving}>Keep vehicle</button><button className={buttonDanger} onClick={() => deleteVehicle(modal.vehicle.id)} disabled={saving}>Remove vehicle</button></div>
          </section>
        </div>
      )}

      {qrVehicle && (
        <QRCodeDialog
          vehicle={qrVehicle}
          value={qrValue}
          onClose={() => setQrVehicle(null)}
        />
      )}

      {actionMenu && (
        <>
          <button className="fixed inset-0 z-[6] border-0 bg-transparent" aria-label="Close actions" onClick={() => setActionMenu(null)} />
          <div className="fixed z-[7] min-w-[148px] rounded-lg border border-[#e6ebe4] bg-white p-[5px] shadow-[0_12px_32px_#16251f24]" role="menu" style={{ top: actionMenu.top, left: actionMenu.left }}>
            <button className="flex h-8 w-full items-center gap-2 rounded-[5px] border-0 bg-transparent px-2 text-left text-[11px] font-semibold text-[#3f4e47] hover:bg-[#f4f7f3]" role="menuitem" onClick={() => openView(actionMenu.vehicle)}><Icon name="eye" size={15} /> View</button>
            <button className="flex h-8 w-full items-center gap-2 rounded-[5px] border-0 bg-transparent px-2 text-left text-[11px] font-semibold text-[#3f4e47] hover:bg-[#f4f7f3]" role="menuitem" onClick={() => openQr(actionMenu.vehicle)}><Icon name="qr" size={15} /> QR code</button>
            <button className="flex h-8 w-full items-center gap-2 rounded-[5px] border-0 bg-transparent px-2 text-left text-[11px] font-semibold text-[#3f4e47] hover:bg-[#f4f7f3]" role="menuitem" onClick={() => openEdit(actionMenu.vehicle)}><Icon name="edit" size={15} /> Edit</button>
            <button className="flex h-8 w-full items-center gap-2 rounded-[5px] border-0 bg-transparent px-2 text-left text-[11px] font-semibold text-[#a35248] hover:bg-[#f8efed]" role="menuitem" onClick={() => openDelete(actionMenu.vehicle)}><Icon name="trash" size={15} /> Delete</button>
          </div>
        </>
      )}

      {toast && <div className="fixed right-[25px] bottom-6 z-[7] flex animate-rise items-center gap-[9px] rounded-[7px] border border-[#dce8dd] bg-white py-[11px] pr-[15px] pl-[11px] text-[11px] text-[#3f5146] shadow-[0_6px_25px_#263b2a19]" role="status"><span className="grid size-[23px] place-items-center rounded-full bg-[#edf5ee] text-[#588367]"><Icon name="check" size={16} /></span>{toast}</div>}
    </div>
  )
}

function QRCodeDialog({ vehicle, value, onClose }) {
  const [image, setImage] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!value) {
      setImage('')
      setError('This vehicle does not have details to encode yet.')
      return undefined
    }
    let active = true
    setError('')
    QRCode.toDataURL(value, { width: 280, margin: 2, errorCorrectionLevel: 'M' })
      .then((dataUrl) => {
        if (active) setImage(dataUrl)
      })
      .catch((generationError) => {
        if (active) setError(generationError.message || 'Could not generate the QR code.')
      })
    return () => {
      active = false
    }
  }, [value])

  async function copyLink() {
    if (!value) return

    try {
      let copiedToClipboard = false
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(value)
          copiedToClipboard = true
        } catch {
          copiedToClipboard = false
        }
      }

      if (!copiedToClipboard) {
        const input = document.createElement('textarea')
        input.value = value
        input.setAttribute('readonly', '')
        input.style.position = 'fixed'
        input.style.opacity = '0'
        document.body.appendChild(input)
        try {
          input.select()
          copiedToClipboard = document.execCommand('copy')
        } finally {
          input.remove()
        }
      }

      if (!copiedToClipboard) throw new Error('Clipboard access is unavailable in this browser.')
      setCopied(true)
      setError('')
    } catch (copyError) {
      setCopied(false)
      setError(copyError.message || 'Could not copy the certificate link. Please copy the link manually.')
    }
  }

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  async function downloadPdf() {
    if (!image) return

    try {
      const transparentImage = await QRCode.toDataURL(value, {
        width: 560,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: { light: '#ffffff00' },
      })
      const { jsPDF } = await import('jspdf')
      const pdf = new jsPDF({ unit: 'mm', format: [100, 100] })
      pdf.addImage(transparentImage, 'PNG', 10, 10, 80, 80)
      const filename = (vehicle.certificateNumber || vehicle.chassisNo || 'vehicle-qr')
        .toString()
        .replace(/[^a-z0-9-_]+/gi, '-')
        .replace(/^-|-$/g, '') || 'vehicle-qr'
      pdf.save(`${filename}.pdf`)
    } catch (downloadError) {
      setError(downloadError.message || 'Could not download the QR code PDF.')
    }
  }

  return (
    <div className={backdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className={qrModalClass} role="dialog" aria-modal="true" aria-label={`QR code for ${vehicle.makeBody || 'vehicle record'}`}>
        {image && <img className="block h-auto w-[min(280px,100%)] [image-rendering:pixelated]" src={image} alt={`QR code for ${vehicle.makeBody || 'vehicle record'}`} />}
        {value && (
          <a
            className="max-w-full break-all text-center text-xs text-[#485851] underline"
            href={value}
            target="_blank"
            rel="noreferrer"
          >
            {value}
          </a>
        )}
        <button
          className={buttonOutline}
          type="button"
          onClick={copyLink}
          disabled={!value}
        >
          {copied ? 'Link copied' : 'Copy link'}
        </button>
        {error && <p className="m-0 text-center text-xs text-[#aa5147]" role="alert">{error}</p>}
        <button className={`${buttonPrimary} disabled:cursor-not-allowed disabled:opacity-50`} type="button" onClick={downloadPdf} disabled={!image}>
          Download PDF
        </button>
      </section>
    </div>
  )
}

export default App
