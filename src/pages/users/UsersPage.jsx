import { useEffect, useState } from 'react';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabaseClient';
import { canManageUsers, ROLES } from '../../utils/permissions';

export default function UsersPage() {
  const { profile } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').order('full_name');
    if (error) setMessage(error.message);
    setProfiles(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateRole = async (id, role) => {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('User role updated.');
      load();
    }
  };

  if (!canManageUsers(profile)) return <Alert type="error">Only administrators can manage users.</Alert>;
  if (loading) return <Loading label="Loading users..." />;

  return (
    <div className="space-y-4">
      {message && <Alert>{message}</Alert>}
      <section className="panel p-4 sm:p-5">
        <h2 className="text-lg font-black text-ink">Users & Roles</h2>
        <p className="mt-1 text-sm text-muted">Create accounts in Supabase Auth, then assign roles here after the profile is created.</p>
      </section>

      <section className="panel mobile-table">
        <table className="min-w-[760px] w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase text-slate-500">
            <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Update Role</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {profiles.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-semibold">{item.full_name || 'Unnamed user'}</td>
                <td className="px-4 py-3 text-muted">{item.email}</td>
                <td className="px-4 py-3"><Badge value={item.role} /></td>
                <td className="px-4 py-3">
                  <select className="field max-w-52" value={item.role} onChange={(event) => updateRole(item.id, event.target.value)}>
                    {ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

