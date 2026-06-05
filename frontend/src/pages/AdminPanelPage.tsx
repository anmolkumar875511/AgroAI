import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, X, Shield, Users, AlertTriangle, ShieldCheck, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { adminAPI } from '@/api/client';
import type { UserOut } from '@/api/client';
import { useRegion } from '@/contexts/RegionContext';

export default function AdminPanelPage() {
  const { regions } = useRegion();
  const [users, setUsers] = useState<UserOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserOut | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'agent',
    territory_id: '',
    employee_id: '',
    phone: '',
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getUsers();
      setUsers(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to retrieve system users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'agent',
      territory_id: regions[1]?.territoryId || '',
      employee_id: '',
      phone: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (user: UserOut) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      confirmPassword: '',
      role: user.role || 'agent',
      territory_id: user.territory_id || '',
      employee_id: user.employee_id || '',
      phone: user.phone || '',
    });
    setIsEditModalOpen(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please complete all mandatory fields.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        territory_id: formData.role === 'admin' ? 'ind' : formData.territory_id,
        employee_id: formData.employee_id || undefined,
        phone: formData.phone || undefined,
      };

      await adminAPI.createUser(payload);
      toast.success(`User account for ${formData.name} created successfully.`);
      setIsAddModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.detail || err.message || 'Failed to create user account.');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!formData.name || !formData.email) {
      toast.error('Please complete all mandatory fields.');
      return;
    }
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      const payload: Record<string, any> = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        territory_id: formData.role === 'admin' ? 'ind' : formData.territory_id,
        employee_id: formData.employee_id || null,
        phone: formData.phone || null,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      await adminAPI.updateUser(selectedUser.id, payload);
      toast.success('User account configurations updated successfully.');
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.detail || err.message || 'Failed to update user account.');
    }
  };

  const handleDeleteUser = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete the user account for "${name}"?`)) {
      return;
    }
    try {
      await adminAPI.deleteUser(id);
      toast.success(`User "${name}" has been removed.`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.detail || err.message || 'Failed to delete user.');
    }
  };

  const handleToggleStatus = async (user: UserOut) => {
    try {
      const nextStatus = !user.is_active;
      await adminAPI.updateUser(user.id, { is_active: nextStatus });
      toast.success(`Account for ${user.name} is now ${nextStatus ? 'Activated' : 'Deactivated'}.`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.detail || err.message || 'Failed to update account status.');
    }
  };

  // Filtered lists
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.employee_id && user.employee_id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === 'All' || user.role === roleFilter.toLowerCase();
    
    let matchesStatus = true;
    if (statusFilter === 'Active') matchesStatus = user.is_active === true;
    if (statusFilter === 'Deactivated') matchesStatus = user.is_active === false;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: users.length,
    agents: users.filter(u => u.role === 'agent' && u.is_active).length,
    managers: users.filter(u => u.role === 'manager' && u.is_active).length,
    deactivated: users.filter(u => !u.is_active).length,
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'manager': return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      default: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-transparent">
        <div className="w-8 h-8 border-2 border-lime-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text-primary dark:text-white tracking-tight flex items-center gap-2">
            <Shield className="w-8 h-8 text-lime-green" />
            System Administration
          </h1>
          <p className="text-text-secondary dark:text-white/60 text-sm mt-1">
            Manage platform users, roles, territories, and credentials.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="gradient-primary hover:brightness-110 text-white text-xs font-semibold px-4 py-2.5 rounded-button flex items-center gap-2 self-start transition-all shadow-md focus:ring-2 focus:ring-lime-green outline-none"
        >
          <Plus className="w-4 h-4" />
          <span>Add New User</span>
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.total, icon: Users, color: 'text-lime-green' },
          { label: 'Active Agents', value: stats.agents, icon: ShieldCheck, color: 'text-emerald-400' },
          { label: 'Active Managers', value: stats.managers, icon: ShieldCheck, color: 'text-sky-400' },
          { label: 'Deactivated Accounts', value: stats.deactivated, icon: UserX, color: 'text-rose-400' },
        ].map((card, i) => (
          <div key={i} className="backdrop-blur-md bg-white/70 dark:bg-[#122315]/30 border border-white/20 dark:border-white/10 rounded-card p-5 shadow-card flex items-center justify-between">
            <div>
              <p className="text-xs text-text-muted">{card.label}</p>
              <h3 className="text-2xl font-bold text-text-primary dark:text-white mt-1">{card.value}</h3>
            </div>
            <card.icon className={`w-8 h-8 ${card.color} opacity-85`} />
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between backdrop-blur-md bg-white/70 dark:bg-[#122315]/30 border border-white/20 dark:border-white/10 rounded-card p-4 shadow-card">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search by name, email, employee ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-button bg-white dark:bg-white/5 border border-light-gray dark:border-white/10 text-text-primary dark:text-white outline-none focus:ring-1 focus:ring-lime-green/30"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-button bg-white dark:bg-white/5 border border-light-gray dark:border-white/10 text-text-primary dark:text-white outline-none"
            >
              <option value="All" className="bg-[#142818]">All Roles</option>
              <option value="Admin" className="bg-[#142818]">Admin</option>
              <option value="Manager" className="bg-[#142818]">Manager</option>
              <option value="Agent" className="bg-[#142818]">Agent</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-button bg-white dark:bg-white/5 border border-light-gray dark:border-white/10 text-text-primary dark:text-white outline-none"
            >
              <option value="All" className="bg-[#142818]">All Status</option>
              <option value="Active" className="bg-[#142818]">Active Only</option>
              <option value="Deactivated" className="bg-[#142818]">Deactivated Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="backdrop-blur-md bg-white/70 dark:bg-[#122315]/30 border border-white/20 dark:border-white/10 rounded-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-light-gray dark:border-white/10 text-text-muted font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-5">User</th>
                <th className="py-3.5 px-3">Role</th>
                <th className="py-3.5 px-3">Employee ID</th>
                <th className="py-3.5 px-3">Phone</th>
                <th className="py-3.5 px-3">Assigned Territory</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray dark:divide-white/5 text-text-primary dark:text-white/80">
              {filteredUsers.map(user => {
                const initials = user.name
                  ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                  : 'US';

                return (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white font-semibold text-xs shadow">
                          {initials}
                        </div>
                        <div>
                          <p className="font-semibold text-text-primary dark:text-white text-sm">{user.name}</p>
                          <p className="text-text-secondary dark:text-white/50 text-[11px]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-3 font-mono text-text-muted">{user.employee_id || 'N/A'}</td>
                    <td className="py-4 px-3 text-text-muted">{user.phone || 'N/A'}</td>
                    <td className="py-4 px-3">
                      <span className="font-medium text-text-primary dark:text-white/95">
                        {user.territory || (user.role === 'admin' ? 'All India' : 'Not Assigned')}
                      </span>
                      {user.territory_id && user.role !== 'admin' && (
                        <p className="text-[10px] text-text-muted font-mono">{user.territory_id}</p>
                      )}
                    </td>
                    <td className="py-4 px-3 text-center">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        disabled={user.email === 'admin@agroai.com'}
                        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none focus:ring-1 focus:ring-lime-green ${
                          user.is_active ? 'bg-lime-green' : 'bg-white/20'
                        } ${user.email === 'admin@agroai.com' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            user.is_active ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(user)}
                          className="p-1 px-2 rounded bg-white/5 hover:bg-lime-green/20 text-lime-green transition-colors flex items-center gap-1 text-[10px] font-semibold"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          disabled={user.email === 'admin@agroai.com'}
                          className={`p-1 px-2 rounded bg-white/5 hover:bg-rose-500/20 text-rose-400 transition-colors flex items-center gap-1 text-[10px] font-semibold ${
                            user.email === 'admin@agroai.com' ? 'opacity-40 cursor-not-allowed hover:bg-transparent text-gray-500' : ''
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-text-muted">
                    No users matching selected filter configurations.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-[#142818] border border-white/20 dark:border-white/10 rounded-card p-6 shadow-dropdown z-50 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-light-gray dark:border-white/10">
              <h3 className="text-lg font-bold text-text-primary dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-lime-green" />
                Register New User Account
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-text-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-text-secondary dark:text-white/60">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-xs rounded-button bg-light-gray/20 dark:bg-white/5 border border-light-gray dark:border-white/10 text-text-primary dark:text-white outline-none focus:border-lime-green"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-text-secondary dark:text-white/60">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-xs rounded-button bg-light-gray/20 dark:bg-white/5 border border-light-gray dark:border-white/10 text-text-primary dark:text-white outline-none focus:border-lime-green"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-text-secondary dark:text-white/60">Password *</label>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-xs rounded-button bg-light-gray/20 dark:bg-white/5 border border-light-gray dark:border-white/10 text-text-primary dark:text-white outline-none focus:border-lime-green"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-text-secondary dark:text-white/60">Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-xs rounded-button bg-light-gray/20 dark:bg-white/5 border border-light-gray dark:border-white/10 text-text-primary dark:text-white outline-none focus:border-lime-green"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-text-secondary dark:text-white/60">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-xs rounded-button bg-light-gray/20 dark:bg-white/5 border border-light-gray dark:border-white/10 text-text-primary dark:text-white outline-none focus:border-lime-green"
                  >
                    <option value="agent" className="bg-[#142818]">Agent (Kisan Rep)</option>
                    <option value="manager" className="bg-[#142818]">Territory Manager</option>
                    <option value="admin" className="bg-[#142818]">System Administrator</option>
                  </select>
                </div>
                {formData.role !== 'admin' ? (
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-text-secondary dark:text-white/60">Assign Territory</label>
                    <select
                      name="territory_id"
                      value={formData.territory_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs rounded-button bg-light-gray/20 dark:bg-white/5 border border-light-gray dark:border-white/10 text-text-primary dark:text-white outline-none focus:border-lime-green"
                    >
                      {regions.filter(r => r.id !== 'ind').map(r => (
                        <option key={r.id} value={r.territoryId} className="bg-[#142818]">
                          {r.name} ({r.territoryId})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-text-secondary dark:text-white/60">Assign Territory</label>
                    <input
                      type="text"
                      disabled
                      value="All India (Admin Default)"
                      className="w-full px-3 py-2 text-xs rounded-button bg-light-gray/10 dark:bg-white/5 border border-light-gray dark:border-white/15 text-text-muted outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-text-secondary dark:text-white/60">Employee ID</label>
                  <input
                    type="text"
                    name="employee_id"
                    placeholder="e.g. EMP123"
                    value={formData.employee_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-xs rounded-button bg-light-gray/20 dark:bg-white/5 border border-light-gray dark:border-white/10 text-text-primary dark:text-white outline-none focus:border-lime-green"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-text-secondary dark:text-white/60">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-xs rounded-button bg-light-gray/20 dark:bg-white/5 border border-light-gray dark:border-white/10 text-text-primary dark:text-white outline-none focus:border-lime-green"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-light-gray dark:border-white/10 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded bg-light-gray dark:bg-white/5 text-text-primary dark:text-white hover:bg-light-gray/80 dark:hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded bg-deep-green text-white hover:brightness-110"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-[#142818] border border-white/20 dark:border-white/10 rounded-card p-6 shadow-dropdown z-50 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-light-gray dark:border-white/10">
              <h3 className="text-lg font-bold text-text-primary dark:text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-lime-green" />
                Edit Account configurations: {selectedUser.name}
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-text-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-text-secondary dark:text-white/60">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-xs rounded-button bg-light-gray/20 dark:bg-white/5 border border-light-gray dark:border-white/10 text-text-primary dark:text-white outline-none focus:border-lime-green"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-text-secondary dark:text-white/60">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-xs rounded-button bg-light-gray/20 dark:bg-white/5 border border-light-gray dark:border-white/10 text-text-primary dark:text-white outline-none focus:border-lime-green"
                  />
                </div>
              </div>

              <div className="bg-light-gray/10 dark:bg-white/5 border border-light-gray dark:border-white/5 p-3 rounded-lg space-y-3">
                <p className="text-[10px] text-text-muted flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-accent-yellow flex-shrink-0" />
                  Leave password fields blank if you do not wish to modify the user's password.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-text-secondary dark:text-white/60">New Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs rounded-button bg-light-gray/20 dark:bg-white/5 border border-light-gray dark:border-white/10 text-text-primary dark:text-white outline-none focus:border-lime-green"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-text-secondary dark:text-white/60">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs rounded-button bg-light-gray/20 dark:bg-white/5 border border-light-gray dark:border-white/10 text-text-primary dark:text-white outline-none focus:border-lime-green"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-text-secondary dark:text-white/60">Role</label>
                  <select
                    name="role"
                    disabled={selectedUser.email === 'admin@agroai.com'}
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-xs rounded-button bg-light-gray/20 dark:bg-white/5 border border-light-gray dark:border-white/10 text-text-primary dark:text-white outline-none focus:border-lime-green"
                  >
                    <option value="agent" className="bg-[#142818]">Agent (Kisan Rep)</option>
                    <option value="manager" className="bg-[#142818]">Territory Manager</option>
                    <option value="admin" className="bg-[#142818]">System Administrator</option>
                  </select>
                </div>
                {formData.role !== 'admin' ? (
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-text-secondary dark:text-white/60">Assign Territory</label>
                    <select
                      name="territory_id"
                      value={formData.territory_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs rounded-button bg-light-gray/20 dark:bg-white/5 border border-light-gray dark:border-white/10 text-text-primary dark:text-white outline-none focus:border-lime-green"
                    >
                      <option value="" className="bg-[#142818]">No territory assigned</option>
                      {regions.filter(r => r.id !== 'ind').map(r => (
                        <option key={r.id} value={r.territoryId} className="bg-[#142818]">
                          {r.name} ({r.territoryId})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-text-secondary dark:text-white/60">Assign Territory</label>
                    <input
                      type="text"
                      disabled
                      value="All India (Admin Default)"
                      className="w-full px-3 py-2 text-xs rounded-button bg-light-gray/10 dark:bg-white/5 border border-light-gray dark:border-white/15 text-text-muted outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-text-secondary dark:text-white/60">Employee ID</label>
                  <input
                    type="text"
                    name="employee_id"
                    placeholder="e.g. EMP123"
                    value={formData.employee_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-xs rounded-button bg-light-gray/20 dark:bg-white/5 border border-light-gray dark:border-white/10 text-text-primary dark:text-white outline-none focus:border-lime-green"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-text-secondary dark:text-white/60">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-xs rounded-button bg-light-gray/20 dark:bg-white/5 border border-light-gray dark:border-white/10 text-text-primary dark:text-white outline-none focus:border-lime-green"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-light-gray dark:border-white/10 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded bg-light-gray dark:bg-white/5 text-text-primary dark:text-white hover:bg-light-gray/80 dark:hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded bg-deep-green text-white hover:brightness-110"
                >
                  Save Configurations
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
