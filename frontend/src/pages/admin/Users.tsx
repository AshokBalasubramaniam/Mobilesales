import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import api from '../../api/api';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import Textarea from '../../components/common/Textarea';
import Pagination from '../../components/common/Pagination';
import Spinner from '../../components/common/Spinner';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDate } from '../../utils/format';
import type { Role, User, VerificationStatus } from '../../types/models';
import type { ApiResponse, PaginationMeta } from '../../types/api';

interface UserFilters {
  role: Role | '';
  isBlocked: '' | 'true' | 'false';
  q: string;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>(undefined);
  const [filters, setFilters] = useState<UserFilters>({ role: '', isBlocked: '', q: '' });
  const debouncedQ = useDebounce(filters.q, 400);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [blockTarget, setBlockTarget] = useState<User | null>(null);
  const [blockReason, setBlockReason] = useState('');

  const load = () => {
    setLoading(true);
    api
      .get<ApiResponse<User[]>>('/users', { params: { page, role: filters.role || undefined, isBlocked: filters.isBlocked || undefined, q: debouncedQ || undefined } })
      .then(({ data }) => {
        setUsers(data.data);
        setMeta(data.meta);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [page, filters.role, filters.isBlocked, debouncedQ]);

  const handleBlock = async () => {
    if (!blockTarget) return;
    try {
      await api.patch(`/users/${blockTarget._id}/block`, { reason: blockReason });
      toast.success('User blocked');
      setBlockTarget(null);
      setBlockReason('');
      load();
    } catch (err) {
      toast.error((isAxiosError<{ message?: string }>(err) && err.response?.data?.message) || 'Could not block user');
    }
  };

  const handleUnblock = async (id: string) => {
    await api.patch(`/users/${id}/unblock`);
    toast.success('User unblocked');
    load();
  };

  const handleVerification = async (id: string, status: Extract<VerificationStatus, 'approved' | 'rejected'>) => {
    try {
      await api.patch(`/users/${id}/seller-verification`, {
        status,
        rejectionReason: status === 'rejected' ? 'Documents did not meet requirements' : undefined,
      });
      toast.success(`Seller ${status}`);
      load();
    } catch (err) {
      toast.error((isAxiosError<{ message?: string }>(err) && err.response?.data?.message) || 'Could not update verification');
    }
  };

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">User Management</h2>

      <div className="mb-4 flex flex-wrap gap-2">
        <Input
          placeholder="Search name, email, phone..."
          value={filters.q}
          onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          className="max-w-xs"
        />
        <Select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value as Role | '' })} className="w-36">
          <option value="">All roles</option>
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
          <option value="admin">Admin</option>
        </Select>
        <Select
          value={filters.isBlocked}
          onChange={(e) => setFilters({ ...filters, isBlocked: e.target.value as UserFilters['isBlocked'] })}
          className="w-36"
        >
          <option value="">All statuses</option>
          <option value="false">Active</option>
          <option value="true">Blocked</option>
        </Select>
      </div>

      {loading ? (
        <Spinner full />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase dark:bg-gray-900">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Role</th>
                <th className="p-3">Verification</th>
                <th className="p-3">Joined</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="flex items-center gap-2 p-3">
                    <Avatar src={u.avatar} name={u.name} size="sm" />
                    <div>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </td>
                  <td className="p-3 capitalize">{u.role}</td>
                  <td className="p-3">
                    {u.role === 'seller' && (
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            u.sellerProfile?.verificationStatus === 'approved'
                              ? 'green'
                              : u.sellerProfile?.verificationStatus === 'pending'
                                ? 'amber'
                                : 'gray'
                          }
                        >
                          {u.sellerProfile?.verificationStatus}
                        </Badge>
                        {u.sellerProfile?.verificationStatus === 'pending' && (
                          <div className="flex gap-1">
                            <button onClick={() => handleVerification(u._id, 'approved')} className="text-xs text-green-600 hover:underline">
                              Approve
                            </button>
                            <button onClick={() => handleVerification(u._id, 'rejected')} className="text-xs text-red-600 hover:underline">
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-gray-500">{formatDate(u.createdAt)}</td>
                  <td className="p-3">
                    <Badge variant={u.isBlocked ? 'red' : 'green'}>{u.isBlocked ? 'Blocked' : 'Active'}</Badge>
                  </td>
                  <td className="p-3">
                    {u.isBlocked ? (
                      <Button size="sm" variant="secondary" onClick={() => handleUnblock(u._id)}>
                        Unblock
                      </Button>
                    ) : (
                      <Button size="sm" variant="danger" onClick={() => setBlockTarget(u)}>
                        Block
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination meta={meta} onPageChange={setPage} />

      <Modal open={!!blockTarget} onClose={() => setBlockTarget(null)} title={`Block ${blockTarget?.name}?`}>
        <Textarea label="Reason" required value={blockReason} onChange={(e) => setBlockReason(e.target.value)} />
        <Button variant="danger" className="mt-4 w-full" onClick={handleBlock} disabled={!blockReason}>
          Block User
        </Button>
      </Modal>
    </div>
  );
};

export default Users;
