export function getUserDisplayName(user) {
  if (!user) {
    const stored = localStorage.getItem('user_name');
    return stored || '';
  }
  if (typeof user.display_name === 'string' && user.display_name.trim()) {
    return user.display_name.trim();
  }
  if (typeof user.name === 'string' && user.name.trim()) {
    return user.name.trim();
  }
  if (typeof user.user_name === 'string' && user.user_name.trim()) {
    return user.user_name.trim();
  }
  const stored = localStorage.getItem('user_name');
  return stored || '';
}

export function getUserInitials(name) {
  if (!name || !name.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatRoleLabel(role) {
  if (!role) return 'Administrator';
  const normalized = String(role).toLowerCase();
  if (normalized === 'admin') return 'Administrator';
  if (normalized === 'officer') return 'Sales Officer';
  return String(role).charAt(0).toUpperCase() + String(role).slice(1);
}
