import { supabase } from './supabaseClient';
import { computeOilStatus } from '../utils/formatters';

export async function fetchRecords(module, filters = {}) {
  let query = supabase.from(module.table).select('*, profiles:created_by(full_name, role)');

  if (filters.startDate) query = query.gte(module.dateField, filters.startDate);
  if (filters.endDate) query = query.lte(module.dateField, filters.endDate);
  if (filters.status) query = query.eq(module.statusField, filters.status);

  const { data, error } = await query.order(module.dateField, { ascending: false }).order('created_at', { ascending: false });
  if (error) throw error;

  const q = String(filters.search || '').toLowerCase().trim();
  if (!q) return data || [];

  return (data || []).filter((record) =>
    module.fields.some((field) => String(record[field.name] || '').toLowerCase().includes(q)),
  );
}

export async function fetchRecord(module, id) {
  const { data, error } = await supabase.from(module.table).select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export function preparePayload(module, values, userId) {
  const payload = {};
  module.fields.forEach((field) => {
    if (field.name === 'verified_by_qa') {
      payload[field.name] = values[field.name]?.trim() || null;
    } else if (field.type === 'number') {
      payload[field.name] = values[field.name] === '' ? null : Number(values[field.name]);
    } else {
      payload[field.name] = values[field.name] === '' ? null : values[field.name];
    }
  });

  if (module.key === 'oil-temperature') {
    payload.status = computeOilStatus(payload.oil_temperature_celsius);
  }

  if (userId) payload.created_by = userId;
  return payload;
}

export async function saveRecord(module, values, userId, id = null) {
  const payload = preparePayload(module, values, id ? null : userId);
  const query = id
    ? supabase.from(module.table).update(payload).eq('id', id).select().single()
    : supabase.from(module.table).insert(payload).select().single();
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function deleteRecord(module, id) {
  const { error } = await supabase.from(module.table).delete().eq('id', id);
  if (error) throw error;
}

export async function logActivity({ userId, action, module, recordId = null, description }) {
  const { error } = await supabase.from('activity_logs').insert({
    user_id: userId,
    action,
    module,
    record_id: recordId,
    description,
  });
  if (error) console.error(error);
}

