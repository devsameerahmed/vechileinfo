import { blankVehicle } from './certificate.jsx'
import { supabase } from './supabase.js'

const LOCAL_KEY = 'heritage-vehicle-certificates'

export function createPublicKey() {
  const bytes = new Uint8Array(12)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function certificateLink(publicKey) {
  return `${window.location.origin}/c/${publicKey}`
}

export function fromRow(row) {
  return {
    id: row.id,
    publicKey: row.public_key,
    certificateNumber: row.certificate_number || '',
    date: row.certificate_date || '',
    makeBody: row.make_body || '',
    importerName: row.importer_name || '',
    declarationNumber: row.declaration_number || '',
    model: row.model || '',
    country: row.country || '',
    chassisNo: row.chassis_no || '',
    engineNo: row.engine_no || '',
    color: row.color || '',
    remarks: row.remarks || '',
    userId: row.user_id || '',
    status: row.status || 'VALID',
  }
}

function toRow(vehicle, includeKey) {
  const row = {
    certificate_number: vehicle.certificateNumber || '',
    certificate_date: vehicle.date || '',
    make_body: vehicle.makeBody || '',
    importer_name: vehicle.importerName || '',
    declaration_number: vehicle.declarationNumber || '',
    model: vehicle.model || '',
    country: vehicle.country || '',
    chassis_no: vehicle.chassisNo || '',
    engine_no: vehicle.engineNo || '',
    color: vehicle.color || '',
    remarks: vehicle.remarks || '',
    user_id: vehicle.userId || '',
    status: vehicle.status || 'VALID',
  }
  if (includeKey) row.public_key = vehicle.publicKey
  return row
}

function readLocalVehicles() {
  try {
    const saved = localStorage.getItem(LOCAL_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

let loadPromise

export function loadVehicles() {
  if (!loadPromise) loadPromise = fetchVehicles()
  return loadPromise
}

async function fetchVehicles() {
  const { data, error } = await supabase
    .from('vehicle_certificates')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error

  if (data.length > 0) return data.map(fromRow)

  const localVehicles = readLocalVehicles()
  if (localVehicles.length === 0) return []

  const payload = localVehicles.map((vehicle) =>
    toRow({ ...blankVehicle, ...vehicle, publicKey: vehicle.publicKey || createPublicKey() }, true),
  )
  const inserted = await supabase.from('vehicle_certificates').insert(payload).select()
  if (inserted.error) throw inserted.error
  localStorage.removeItem(LOCAL_KEY)
  return inserted.data.map(fromRow)
}

export async function insertVehicle(vehicle) {
  const publicKey = createPublicKey()
  const { data, error } = await supabase
    .from('vehicle_certificates')
    .insert(toRow({ ...vehicle, publicKey }, true))
    .select()
    .single()
  if (error) throw error
  return fromRow(data)
}

export async function updateVehicle(id, vehicle) {
  const { data, error } = await supabase
    .from('vehicle_certificates')
    .update(toRow(vehicle, false))
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return fromRow(data)
}

export async function removeVehicle(id) {
  const { error } = await supabase.from('vehicle_certificates').delete().eq('id', id)
  if (error) throw error
}

export async function fetchVehicleByKey(publicKey) {
  const { data, error } = await supabase
    .from('vehicle_certificates')
    .select('*')
    .eq('public_key', publicKey)
    .maybeSingle()
  if (error) throw error
  return data ? fromRow(data) : null
}
