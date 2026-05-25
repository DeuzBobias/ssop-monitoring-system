export const ROLES = ['Admin', 'QA Personnel', 'Inspector', 'Viewer'];

export function isAdmin(profile) {
  return profile?.role === 'Admin';
}

export function isQa(profile) {
  return profile?.role === 'QA Personnel';
}

export function isInspector(profile) {
  return profile?.role === 'Inspector';
}

export function canCreate(profile) {
  return isAdmin(profile) || isInspector(profile);
}

export function canEdit(profile, record) {
  if (!profile || !record) return false;
  if (isAdmin(profile) || isQa(profile)) return true;
  return isInspector(profile) && record.created_by === profile.id;
}

export function canDelete(profile) {
  return isAdmin(profile);
}

export function canManageUsers(profile) {
  return isAdmin(profile);
}

export function roleLabel(profile) {
  return profile?.role || 'Viewer';
}

