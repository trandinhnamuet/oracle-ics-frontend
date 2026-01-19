'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  getLoginHistory,
  getLoginStatistics,
  getSuspiciousAttempts,
  AdminLoginHistoryQuery,
  AdminLoginHistoryRecord,
  AdminLoginStatistics
} from '@/api/admin-login-history.api'
import useAuthStore from '@/hooks/use-auth-store'
import { useToast } from '@/hooks/use-toast'
import { formatDistanceToNow, format } from 'date-fns'
import { vi } from 'date-fns/locale'

export default function AdminLoginHistoryPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const isLoading = useAuthStore((state) => state.isLoading)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const { toast } = useToast()
  
  const [authChecked, setAuthChecked] = useState(false)

  // State for login history
  const [loginHistory, setLoginHistory] = useState<AdminLoginHistoryRecord[]>([])
  const [statistics, setStatistics] = useState<AdminLoginStatistics | null>(null)
  const [suspiciousAttempts, setSuspiciousAttempts] = useState<AdminLoginHistoryRecord[]>([])
  const [loading, setLoading] = useState(false)

  // Pagination
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [total, setTotal] = useState(0)

  // Filters
  const [filters, setFilters] = useState<AdminLoginHistoryQuery>({
    page: 1,
    limit: 20,
    status: undefined,
    startDate: undefined,
    endDate: undefined,
    sortBy: 'loginTime',
    sortOrder: 'DESC'
  })

  // Search
  const [searchInput, setSearchInput] = useState('')

  // Initialize auth store from localStorage on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem('auth-storage')
    if (storedAuth && !isAuthenticated) {
      try {
        const parsed = JSON.parse(storedAuth)
        if (parsed.state?.user) {
          useAuthStore.setState({
            user: parsed.state.user,
            token: parsed.state.token,
            refreshToken: parsed.state.refreshToken,
            isAuthenticated: true,
            isLoading: false
          })
          console.log('✅ Auth restored from localStorage in login-history page')
        }
      } catch (error) {
        console.error('❌ Failed to restore auth:', error)
      }
    }
    setAuthChecked(true)
  }, [isAuthenticated])

  // Check authentication
  useEffect(() => {
    // Wait until auth is checked
    if (!authChecked) return
    
    // Nếu user tồn tại và là admin, cho phép truy cập
    if (user?.role?.toLowerCase() === 'admin') {
      console.log('✅ Admin access granted', { email: user.email, role: user.role })
      return
    }
    
    // Chỉ redirect nếu user không tồn tại hoặc không phải admin
    if (user === null) {
      console.warn('❌ Access denied - No user logged in')
      router.push('/unauthorized')
      return
    }
    
    if (user && user.role && user.role.toLowerCase() !== 'admin') {
      console.warn('❌ Access denied - Not an admin user', { role: user.role })
      router.push('/unauthorized')
      return
    }
  }, [user, authChecked, router])

  // Fetch login history and statistics
  const fetchData = useCallback(async () => {
    if (!user || !user.id) {
      console.warn('⚠️ No user or user.id available')
      return
    }

    try {
      setLoading(true)

      // Fetch login history
      const historyResponse = await getLoginHistory(filters)
      console.log('📊 History response:', historyResponse)
      setLoginHistory(historyResponse.data || [])
      setTotal(historyResponse.total || 0)

      // Fetch statistics
      const statsResponse = await getLoginStatistics(user.id, 30)
      console.log('📈 Stats response:', statsResponse)
      setStatistics(statsResponse)

      // Fetch suspicious attempts
      const suspiciousResponse = await getSuspiciousAttempts(user.id)
      console.log('⚠️ Suspicious response:', suspiciousResponse)
      setSuspiciousAttempts(suspiciousResponse || [])
      
      console.log('✅ All data loaded successfully')
    } catch (error: any) {
      console.error('❌ Error fetching login history:', {
        message: error?.message,
        status: error?.status,
        data: error?.data,
        fullError: error
      })
      toast({
        title: 'Error',
        description: `Failed to load login history: ${error?.message || 'Unknown error'}`,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [user, user?.id, filters, toast])

  // Fetch data on mount and when filters change
  useEffect(() => {
    if (user?.role?.toLowerCase() === 'admin') {
      fetchData()
    }
  }, [user, fetchData])

  // Handle filter changes
  const handleFilterChange = (key: keyof AdminLoginHistoryQuery, value: any) => {
    setPage(1)
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
  }

  // Handle date range filter
  const handleDateRangeChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      handleFilterChange('startDate', value || undefined)
    } else {
      handleFilterChange('endDate', value || undefined)
    }
  }

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    setFilters(prev => ({ ...prev, page: newPage }))
  }

  // Export to CSV
  const handleExportCSV = () => {
    try {
      const headers = ['ID', 'Username', 'Role', 'Login Time', 'Status', 'IP Address', 'Country', 'Browser', 'OS', 'Device Type', 'Session Duration', 'New Device']
      const rows = loginHistory.map(record => [
        record.id,
        record.username,
        record.role,
        format(new Date(record.loginTime), 'PPpp', { locale: vi }),
        record.loginStatus,
        record.ipV4 || record.ipV6 || 'N/A',
        record.country || 'N/A',
        record.browser,
        record.os,
        record.deviceType,
        record.sessionDurationMinutes ? `${record.sessionDurationMinutes}m` : 'N/A',
        record.isNewDevice ? 'Yes' : 'No'
      ])

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `login-history-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: 'Success',
        description: 'Login history exported to CSV'
      })
    } catch (error) {
      console.error('Error exporting CSV:', error)
      toast({
        title: 'Error',
        description: 'Failed to export login history',
        variant: 'destructive'
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Login History</h1>
          <p className="text-gray-600 mt-2">Track and monitor all admin login activities</p>
        </div>

        {/* Statistics Dashboard */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600">Total Logins</div>
              <div className="text-3xl font-bold text-gray-900">{statistics.totalLogins}</div>
              <div className="text-xs text-gray-500 mt-2">Last 30 days</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600">Success Rate</div>
              <div className="text-3xl font-bold text-green-600">{(statistics.successRate * 100).toFixed(1)}%</div>
              <div className="text-xs text-gray-500 mt-2">{statistics.successfulLogins} successful</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600">Failed Attempts</div>
              <div className="text-3xl font-bold text-red-600">{statistics.failedLogins}</div>
              <div className="text-xs text-gray-500 mt-2">Locked: {statistics.lockedAttempts}</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600">Unique Devices</div>
              <div className="text-3xl font-bold text-blue-600">{statistics.uniqueDevices}</div>
              <div className="text-xs text-gray-500 mt-2">{statistics.uniqueCountries} countries</div>
            </div>
          </div>
        )}

        {/* Suspicious Attempts Alert */}
        {suspiciousAttempts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  ⚠️ {suspiciousAttempts.length} suspicious login attempt(s) detected
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc pl-5 space-y-1">
                    {suspiciousAttempts.slice(0, 3).map((attempt, index) => (
                      <li key={index}>
                        Failed login from {attempt.ipV4 || attempt.ipV6} on {format(new Date(attempt.loginTime), 'PPp', { locale: vi })}
                      </li>
                    ))}
                    {suspiciousAttempts.length > 3 && (
                      <li>... and {suspiciousAttempts.length - 3} more</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="locked">Locked</option>
              </select>
            </div>

            {/* Start Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* End Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy || 'loginTime'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="loginTime">Login Time</option>
                <option value="username">Username</option>
                <option value="status">Status</option>
              </select>
            </div>

            {/* Refresh Button */}
            <div className="flex items-end">
              <button
                onClick={fetchData}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600">
            Showing {loginHistory.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, total)} of {total} entries
          </div>
          <button
            onClick={handleExportCSV}
            disabled={loginHistory.length === 0}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50"
          >
            Export to CSV
          </button>
        </div>

        {/* Login History Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Login Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Browser
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    OS
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Device
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    New Device
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : loginHistory.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                      No login records found
                    </td>
                  </tr>
                ) : (
                  loginHistory.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="text-gray-900">{format(new Date(record.loginTime), 'PPp', { locale: vi })}</div>
                        <div className="text-gray-500 text-xs">{formatDistanceToNow(new Date(record.loginTime), { locale: vi, addSuffix: true })}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.loginStatus === 'success'
                            ? 'bg-green-100 text-green-800'
                            : record.loginStatus === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {record.loginStatus.charAt(0).toUpperCase() + record.loginStatus.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.ipV4 || record.ipV6 || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.country && record.city ? `${record.city}, ${record.country}` : record.country || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.browser}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.os}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                          {record.deviceType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.sessionDurationMinutes ? `${record.sessionDurationMinutes}m` : 'Active'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {record.isNewDevice ? (
                          <span className="text-orange-600 font-semibold">⚠️ New</span>
                        ) : (
                          <span className="text-gray-500">Known</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex justify-between items-center">
          <div>
            <label htmlFor="limit" className="text-sm text-gray-700 mr-2">
              Records per page:
            </label>
            <select
              id="limit"
              value={limit}
              onChange={(e) => {
                setLimit(parseInt(e.target.value))
                setPage(1)
                setFilters(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
            >
              Previous
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">
                Page {page} of {Math.ceil(total / limit) || 1}
              </span>
            </div>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= Math.ceil(total / limit)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
