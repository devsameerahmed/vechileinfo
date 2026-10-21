import { supabase } from './supabase.js'

const LOCAL_KEY = 'heritage-vehicles'

export const blankVehicle = {
  date: '',
  makeBody: '',
  model: '',
  country: '',
  chassisNo: '',
  engineNo: '',
  color: '',
  remarks: '',
}

function createRecordKey() {
  const bytes = new Uint8Array(12)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function fromRow(row) {
  return {
    id: row.id,
    publicKey: row.public_key || '',
    date: row.certificate_date || '',
    makeBody: row.make_body || '',
    model: row.model || '',
    country: row.country || '',
    chassisNo: row.chassis_no || '',
    engineNo: row.engine_no || '',
    color: row.color || '',
    remarks: row.remarks || '',
  }
}

function toRow(vehicle, includeKey) {
  const row = {
    certificate_date: vehicle.date || '',
    make_body: vehicle.makeBody || '',
    model: vehicle.model || '',
    country: vehicle.country || '',
    chassis_no: vehicle.chassisNo || '',
    engine_no: vehicle.engineNo || '',
    color: vehicle.color || '',
    remarks: vehicle.remarks || '',
  }
  if (includeKey) row.public_key = createRecordKey()
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
    .select('id, public_key, certificate_date, make_body, model, country, chassis_no, engine_no, color, remarks, created_at')
    .order('created_at', { ascending: false })

  if (error) throw error

  if (data.length > 0) return data.map(fromRow)

  const localVehicles = readLocalVehicles()
  if (localVehicles.length === 0) return []

  const payload = localVehicles.map((vehicle) => toRow({ ...blankVehicle, ...vehicle }, true))
  const inserted = await supabase.from('vehicle_certificates').insert(payload).select('id, public_key, certificate_date, make_body, model, country, chassis_no, engine_no, color, remarks, created_at')
  if (inserted.error) throw inserted.error
  localStorage.removeItem(LOCAL_KEY)
  return inserted.data.map(fromRow)
}

export async function insertVehicle(vehicle) {
  const { data, error } = await supabase
    .from('vehicle_certificates')
    .insert(toRow(vehicle, true))
    .select('id, public_key, certificate_date, make_body, model, country, chassis_no, engine_no, color, remarks, created_at')
    .single()
  if (error) throw error
  return fromRow(data)
}

export async function updateVehicle(id, vehicle) {
  const { data, error } = await supabase
    .from('vehicle_certificates')
    .update(toRow(vehicle, false))
    .eq('id', id)
    .select('id, public_key, certificate_date, make_body, model, country, chassis_no, engine_no, color, remarks, created_at')
    .single()
  if (error) throw error
  return fromRow(data)
}

export async function removeVehicle(id) {
  const { error } = await supabase.from('vehicle_certificates').delete().eq('id', id)
  if (error) throw error
}

export async function loadPublicVehicle(publicKey) {
  const { data, error } = await supabase.rpc('get_public_vehicle_certificate', {
    lookup_key: publicKey,
  })
  if (error) throw error
  if (!data?.length) return null
  return fromRow(data[0])
}
