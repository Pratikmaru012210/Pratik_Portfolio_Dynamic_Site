import { useEffect, useState, useRef } from "react";
import { Loader2, Trash2, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/api";
import CardModal from "@/components/CardModal";

export interface SystemUser {
  _id: string;
  clerkUserId: string;
  email: string;
  status: "pending" | "admin";
  createdAt: string;
  isSuperAdmin?: boolean;
}

interface UsersTabProps {
  showToast: (message: string, type?: "success" | "error") => void;
  getToken: () => Promise<string | null>;
}

export default function UsersTab({ showToast, getToken }: UsersTabProps) {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [actionUserId, setActionUserId] = useState<string | null>(null);
  const approveModalRef = useRef<HTMLDivElement | null>(null);
  const deleteModalRef = useRef<HTMLDivElement | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/admin/users");
      setUsers(data.data || []);
    } catch (err: any) {
      console.error("Failed to load users:", err);
      showToast(err.message || "Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async () => {
    if (!actionUserId) return;
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetch(`/api/admin/users/${actionUserId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to approve user");
      showToast("User approved to admin", "success");
      setIsApproveModalOpen(false);
      setActionUserId(null);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || "Approval failed", "error");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!actionUserId) return;
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetch(`/api/admin/users/${actionUserId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete user");
      }
      showToast("User deleted", "success");
      setIsDeleteModalOpen(false);
      setActionUserId(null);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || "Delete failed", "error");
      setLoading(false);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">User Management</h2>
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="text-sm px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Refresh"}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-4 px-4 font-semibold text-foreground/70">Email</th>
                <th className="py-4 px-4 font-semibold text-foreground/70">Status</th>
                <th className="py-4 px-4 font-semibold text-foreground/70 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4 text-sm font-medium">{user.email}</td>
                  <td className="py-4 px-4">
                    {user.isSuperAdmin ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Super Admin
                      </span>
                    ) : user.status === "admin" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <Clock className="w-3.5 h-3.5" />
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 flex justify-end gap-2">
                    {user.status === "pending" && (
                      <button
                        onClick={() => {
                          setActionUserId(user._id);
                          setIsApproveModalOpen(true);
                        }}
                        className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                        title="Approve to Admin"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    {!user.isSuperAdmin && (
                      <button
                        onClick={() => {
                          setActionUserId(user._id);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && !loading && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-foreground/50 text-sm">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isApproveModalOpen && (
        <CardModal
          openModal={isApproveModalOpen}
          setOpenModal={setIsApproveModalOpen}
          modalRef={approveModalRef}
          title="Approve User to Admin"
        >
          <div className="space-y-6">
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3 text-red-500">
              <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-lg mb-1">WARNING</h4>
                <p className="text-sm opacity-90 leading-relaxed">
                  Approving this user will grant them <strong>full administrative access</strong>. They will be able to add, edit, or permanently delete your portfolio content, including projects, services, and profile details. Only approve individuals you completely trust.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsApproveModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={loading}
                className="px-6 py-2 rounded-lg text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Yes, Approve User
              </button>
            </div>
          </div>
        </CardModal>
      )}

      {isDeleteModalOpen && (
        <CardModal
          openModal={isDeleteModalOpen}
          setOpenModal={setIsDeleteModalOpen}
          modalRef={deleteModalRef}
          title="Delete User"
        >
          <div className="space-y-4">
            <p>
              Are you sure you want to permanently delete this user? They will lose all dashboard access. If they need access again, they will have to log in and request approval.
            </p>
            
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-6 py-2 rounded-lg text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete User
              </button>
            </div>
          </div>
        </CardModal>
      )}
    </div>
  );
}
