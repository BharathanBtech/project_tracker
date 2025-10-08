import { useEffect, useState } from 'react';
import { FiCheck, FiX, FiCalendar, FiUser, FiClock, FiFilter } from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface LeaveRequest {
  id: number;
  user_id: number;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
    department: string;
  };
}

const LeaveApprovals = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [leaveRequests, statusFilter]);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/leaves');
      setLeaveRequests(response.data.leaves);
    } catch (error) {
      toast.error('Failed to fetch leave requests');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = leaveRequests;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    setFilteredRequests(filtered);
  };

  const handleApproval = async (requestId: number, status: 'approved' | 'rejected') => {
    try {
      await api.patch(`/leaves/${requestId}/status`, { status });
      toast.success(`Leave request ${status} successfully`);
      setShowApprovalModal(false);
      setSelectedRequest(null);
      fetchLeaveRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.error || `Failed to ${status} leave request`);
    }
  };

  const openApprovalModal = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setShowApprovalModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave Approvals</h1>
          <p className="text-gray-600 mt-1">Review and approve leave requests from your team</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filter by status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Leave Requests List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <FiCalendar className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">No leave requests found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredRequests.map((request) => (
              <div key={request.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <FiUser className="text-primary-600" size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {request.user.first_name} {request.user.last_name}
                        </h3>
                        <p className="text-sm text-gray-500">{request.user.email}</p>
                        <p className="text-xs text-gray-400">{request.user.department}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <FiCalendar className="text-gray-400" size={16} />
                        <span className="text-sm text-gray-600">
                          {formatDate(request.start_date)} - {formatDate(request.end_date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiClock className="text-gray-400" size={16} />
                        <span className="text-sm text-gray-600">
                          {calculateDays(request.start_date, request.end_date)} days
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Reason:</span> {request.reason}
                      </p>
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => openApprovalModal(request)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <FiCheck size={16} />
                        Review
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Leave Request</h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">Employee Details</h3>
                <p className="text-gray-600">
                  {selectedRequest.user.first_name} {selectedRequest.user.last_name}
                </p>
                <p className="text-sm text-gray-500">{selectedRequest.user.email}</p>
                <p className="text-sm text-gray-500">{selectedRequest.user.department}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">Leave Details</h3>
                <p className="text-gray-600">
                  {formatDate(selectedRequest.start_date)} - {formatDate(selectedRequest.end_date)}
                </p>
                <p className="text-sm text-gray-500">
                  {calculateDays(selectedRequest.start_date, selectedRequest.end_date)} days
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">Reason</h3>
                <p className="text-gray-600">{selectedRequest.reason}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApproval(selectedRequest.id, 'rejected')}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <FiX className="inline mr-2" size={16} />
                Reject
              </button>
              <button
                onClick={() => handleApproval(selectedRequest.id, 'approved')}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FiCheck className="inline mr-2" size={16} />
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveApprovals;
