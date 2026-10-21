import { useEffect, useMemo, useState } from 'react'
import QRCode from 'qrcode'
import { supabase } from './supabase.js'
import { blankVehicle, insertVehicle, loadVehicles, removeVehicle, updateVehicle } from './vehicles.js'

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
    <svg className="vintage-car-mark" viewBox="0 0 72 44" fill="none" aria-hidden="true">
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
    <div className="app-shell">
      <aside className="sidebar">
        <a href="#" className="brand" aria-label="Heritage Motors home" onClick={(event) => event.preventDefault()}>
          <span className="brand-mark"><VintageCarMark /></span>
          <span className="brand-copy">
            <span className="brand-name">HERITAGE</span>
            <span className="brand-caption">MOTOR COMPANY</span>
          </span>
        </a>

        <div className="workspace-label">WORKSPACE</div>
        <nav className="primary-nav" aria-label="Main navigation">
          {[
            ['Dashboard', 'grid'],
            ['Inventory', 'car'],
          ].map(([label, icon]) => (
            <button
              className={`nav-item ${activeNav === label ? 'active' : ''}`}
              key={label}
              onClick={() => setActiveNav(label)}
            >
              <Icon name={icon} size={18} />
              <span>{label}</span>
              {label === 'Inventory' && <span className="nav-count">{vehicles.length}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="access-card">
            <span className="access-icon"><Icon name="lock" size={16} /></span>
            <span className="access-copy"><strong>Admin access</strong><small>Only you can manage listings</small></span>
            <span className="access-indicator" />
          </div>
          <div className="profile-row">
            <span className="avatar">{initials}</span>
            <span className="profile-copy"><strong>{fullName}</strong><small>{email}</small></span>
            <button className="sign-out-button" onClick={signOut}>Sign out</button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><Icon name="chevron" size={14} /><strong>{activeNav}</strong></div>
          <div className="topbar-actions">
            <span className="today-label">Monday, October 19, 2026</span>
            <button className="icon-button notification-button" aria-label="Notifications">
              <Icon name="bell" size={19} /><span className="notification-dot" />
            </button>
            <span className="topbar-divider" />
            <span className="signed-in">
              <span className="signed-in-copy"><strong>{fullName}</strong><span>{email}</span></span>
              <span className="avatar top-avatar">{initials}</span>
            </span>
          </div>
        </header>

        <div className="page-wrap">
          <section className="welcome-row">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" /> MONDAY, OCTOBER 19, 2026</div>
              <h1>Good morning, {firstName} <span className="wave">✳</span></h1>
              <p className="welcome-subtitle">Signed in as {email}</p>
            </div>
            <button className="button button-primary" onClick={openCreate}><Icon name="plus" size={18} /> Add a vehicle</button>
          </section>

          <section className="stats-grid" aria-label="Inventory overview">
            <article className="stat-card">
              <div className="stat-top"><span className="stat-icon sage"><Icon name="car" size={19} /></span><span className="stat-change"><span className="change-arrow">↗</span> 12.5%</span></div>
              <div className="stat-value">{vehicles.length.toString().padStart(2, '0')}</div>
              <div className="stat-label">Total vehicles <span>vs. last month</span></div>
              <div className="stat-sparkline spark-green" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
            </article>
            <article className="stat-card">
              <div className="stat-top"><span className="stat-icon amber"><Icon name="check" size={19} /></span><span className="stat-change"><span className="change-arrow">↗</span> 8.2%</span></div>
              <div className="stat-value">{chassisCount.toString().padStart(2, '0')}</div>
              <div className="stat-label">Chassis recorded <span>in this collection</span></div>
              <div className="stat-sparkline spark-amber" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
            </article>
            <article className="stat-card">
              <div className="stat-top"><span className="stat-icon rose"><Icon name="chart" size={19} /></span><span className="stat-change muted-change">Portfolio</span></div>
              <div className="stat-value">{countryCount.toString().padStart(2, '0')}</div>
              <div className="stat-label">Countries of origin <span>in this collection</span></div>
              <div className="stat-sparkline spark-rose" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
            </article>
            <article className="stat-card stat-card-note">
              <div className="note-top"><span className="note-overline">THE COLLECTION</span><span className="note-sun">✳</span></div>
              <p>“The best journeys are measured in stories, not miles.”</p>
              <span className="note-author">— A thought for the road</span>
              <div className="note-road" aria-hidden="true"><span /></div>
            </article>
          </section>

          <section className="inventory-section">
            <div className="section-heading">
              <div>
                <div className="section-kicker">YOUR COLLECTION</div>
                <h2>{activeNav === 'Dashboard' ? 'Vehicle inventory' : activeNav}</h2>
                <p>A considered collection, carefully cared for.</p>
              </div>
              <button className="button button-outline" onClick={openCreate}><Icon name="plus" size={17} /> Add vehicle</button>
            </div>

            {notice && <div className="setup-banner" role="status">{notice}</div>}
            <div className="inventory-toolbar">
              <label className="search-box">
                <Icon name="search" size={18} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search vehicles..." aria-label="Search vehicles" />
                <kbd>⌘ K</kbd>
              </label>
              <div className="toolbar-right">
                <button className="button button-light" onClick={() => setQuery('')}>Reset</button>
              </div>
            </div>

            <div className="table-wrap">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th className="actions-col">ACTIONS</th>
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
                    <tr key={vehicle.id}>
                      <td className="actions-col">
                        <button
                          className="actions-button"
                          aria-haspopup="menu"
                          aria-expanded={actionMenu?.vehicle.id === vehicle.id}
                          aria-label={`Actions for ${vehicle.makeBody}`}
                          onClick={(event) => toggleActions(event, vehicle)}
                        >
                          Actions <Icon name="down" size={13} />
                        </button>
                      </td>
                      <td className="table-muted">{vehicle.date}</td>
                      <td>
                        <div className="vehicle-info">
                          <strong>{vehicle.makeBody}</strong>
                          {vehicle.remarks && <span>{vehicle.remarks}</span>}
                        </div>
                      </td>
                      <td className="table-muted">{vehicle.model}</td>
                      <td className="table-muted">{vehicle.country}</td>
                      <td className="table-muted">{vehicle.chassisNo}</td>
                      <td className="table-muted">{vehicle.engineNo || '—'}</td>
                      <td className="table-muted">{vehicle.color}</td>
                    </tr>
                  ))}
                  {visibleVehicles.length === 0 && (
                    <tr><td colSpan="8"><div className="empty-state"><span className="empty-icon"><Icon name="car" size={22} /></span><strong>{loading ? 'Loading vehicles' : 'No vehicles found'}</strong><span>{loading ? 'Reading records from Supabase.' : 'Add a vehicle to your collection.'}</span>{!loading && <button onClick={openCreate}>Add a vehicle <Icon name="arrow" size={15} /></button>}</div></td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="table-footer">
              <span>Showing <strong>{visibleVehicles.length ? 1 : 0}–{visibleVehicles.length}</strong> of <strong>{vehicles.length}</strong> vehicles</span>
              <button className="view-all-button" onClick={() => setQuery('')}>View all vehicles <Icon name="arrow" size={15} /></button>
            </div>
          </section>
          <footer className="page-footer"><span>© 2026 Heritage Motor Company</span><span><i /> Your collection is looking good</span></footer>
        </div>
      </main>

      {modal?.type === 'vehicle' && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null) }}>
          <section className="modal-card vehicle-modal" role="dialog" aria-modal="true" aria-labelledby="vehicle-modal-title">
            <div className="modal-header">
              <div><span className="section-kicker">{modal.vehicleId ? 'UPDATE VEHICLE' : 'NEW VEHICLE'}</span><h2 id="vehicle-modal-title">{modal.vehicleId ? 'Edit vehicle' : 'Add a vehicle'}</h2><p>Private inventory details for this collection.</p></div>
              <button className="icon-button modal-close" onClick={() => setModal(null)} aria-label="Close"><Icon name="close" size={19} /></button>
            </div>
            <form onSubmit={saveVehicle}>
              <div className="form-grid">
                <label className="form-field"><span>Date</span><input required value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} placeholder="08/09/2026" /></label>
                <label className="form-field"><span>Make / Body Type</span><input required value={form.makeBody} onChange={(event) => setForm({ ...form, makeBody: event.target.value })} placeholder="LEXUS - LS460 (Sedan)" /></label>
                <label className="form-field"><span>Model</span><input required value={form.model} onChange={(event) => setForm({ ...form, model: event.target.value })} placeholder="2014" /></label>
                <label className="form-field"><span>Country</span><input required value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })} placeholder="Japan" /></label>
                <label className="form-field"><span>Chassis No</span><input required value={form.chassisNo} onChange={(event) => setForm({ ...form, chassisNo: event.target.value })} placeholder="Chassis number" /></label>
                <label className="form-field"><span>Engine No <em>optional</em></span><input value={form.engineNo} onChange={(event) => setForm({ ...form, engineNo: event.target.value })} placeholder="Engine number" /></label>
                <label className="form-field"><span>Color</span><input required value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })} placeholder="Gray" /></label>
                <label className="form-field span-2"><span>Remarks <em>optional</em></span><textarea value={form.remarks} onChange={(event) => setForm({ ...form, remarks: event.target.value })} placeholder="Notes" /></label>
              </div>
              <div className="modal-actions"><button type="button" className="button button-light" onClick={() => setModal(null)} disabled={saving}>Cancel</button><button type="submit" className="button button-primary" disabled={saving}>{modal.vehicleId ? 'Save changes' : <><Icon name="plus" size={17} /> Add vehicle</>}</button></div>
            </form>
          </section>
        </div>
      )}

      {modal?.type === 'view' && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null) }}>
          <section className="modal-card vehicle-modal" role="dialog" aria-modal="true" aria-labelledby="view-title">
            <div className="modal-header">
              <div><span className="section-kicker">VEHICLE</span><h2 id="view-title">{modal.vehicle.makeBody || 'Vehicle'}</h2></div>
              <button className="icon-button modal-close" onClick={() => setModal(null)} aria-label="Close"><Icon name="close" size={19} /></button>
            </div>
            <dl className="detail-list">
              {detailFields.map(([key, label]) => (
                <div key={key}>
                  <dt>{label}</dt>
                  <dd>{modal.vehicle[key] || '—'}</dd>
                </div>
              ))}
            </dl>
            <div className="modal-actions"><button className="button button-light" onClick={() => setModal(null)}>Close</button></div>
          </section>
        </div>
      )}

      {modal?.type === 'delete' && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null) }}>
          <section className="modal-card delete-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-title">
            <span className="delete-icon"><Icon name="trash" size={20} /></span>
            <h2 id="delete-title">Remove this vehicle?</h2>
            <p><strong>{modal.vehicle.makeBody}</strong> will be removed from your collection. This action cannot be undone.</p>
            <div className="modal-actions"><button className="button button-light" onClick={() => setModal(null)} disabled={saving}>Keep vehicle</button><button className="button button-danger" onClick={() => deleteVehicle(modal.vehicle.id)} disabled={saving}>Remove vehicle</button></div>
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
          <button className="menu-backdrop" aria-label="Close actions" onClick={() => setActionMenu(null)} />
          <div className="action-menu" role="menu" style={{ top: actionMenu.top, left: actionMenu.left }}>
            <button role="menuitem" onClick={() => openView(actionMenu.vehicle)}><Icon name="eye" size={15} /> View</button>
            <button role="menuitem" onClick={() => openQr(actionMenu.vehicle)}><Icon name="qr" size={15} /> QR code</button>
            <button role="menuitem" onClick={() => openEdit(actionMenu.vehicle)}><Icon name="edit" size={15} /> Edit</button>
            <button role="menuitem" className="danger" onClick={() => openDelete(actionMenu.vehicle)}><Icon name="trash" size={15} /> Delete</button>
          </div>
        </>
      )}

      {toast && <div className="toast" role="status"><span><Icon name="check" size={16} /></span>{toast}</div>}
    </div>
  )
}

function QRCodeDialog({ vehicle, value, onClose }) {
  const [image, setImage] = useState('')
  const [error, setError] = useState('')

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

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="modal-card qr-modal" role="dialog" aria-modal="true" aria-label={`QR code for ${vehicle.makeBody || 'vehicle record'}`}>
        {image && <img className="qr-image" src={image} alt={`QR code for ${vehicle.makeBody || 'vehicle record'}`} />}
        {error && <span className="sr-only" role="alert">{error}</span>}
      </section>
    </div>
  )
}

export default App
