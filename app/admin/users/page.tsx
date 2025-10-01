'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import * as XLSX from 'xlsx'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Search, Download, Users, Calendar, Building, Edit, Trash2, Crown } from 'lucide-react'
import { toggleUserAdminRole } from '@/api/user.api'

interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  phoneNumber?: string | null
  company?: string | null
  role?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'

  const fetchUsers = async () => {
    try {
      const res = await axios.get<User[]>(`${API_URL}/users`)
      setUsers(res.data)
      setFilteredUsers(res.data)
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsers([])
      setFilteredUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  // Search functionality
  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.company && user.company.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredUsers(filtered)
    }
  }, [searchTerm, users])

  // Toggle user active status
  const toggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      await axios.patch(`${API_URL}/users/${userId}`, { isActive: !currentStatus })
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, isActive: !currentStatus } : user
      ))
    } catch (error) {
      console.error('Error updating user status:', error)
    }
  }

  // Delete user
  const deleteUser = async (userId: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        await axios.delete(`${API_URL}/users/${userId}`)
        setUsers(prev => prev.filter(user => user.id !== userId))
      } catch (error) {
        console.error('Error deleting user:', error)
      }
    }
  }

  // Toggle admin role
  const toggleAdminRole = async (userId: number, currentRole: string = 'customer') => {
    try {
      const updatedUser = await toggleUserAdminRole(userId, currentRole)
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: updatedUser.role } : user
      ))
    } catch (error) {
      console.error('Error toggling admin role:', error)
    }
  }

  // Export to Excel
  const exportToExcel = () => {
    const exportData = filteredUsers.map(user => ({
      'ID': user.id,
      'Email': user.email,
      'Họ tên': `${user.firstName} ${user.lastName}`,
      'Số điện thoại': user.phoneNumber || 'Chưa có',
      'Công ty': user.company || 'Chưa có',
      'Vai trò': user.role === 'admin' ? 'Admin' : 'Customer',
      'Trạng thái': user.isActive ? 'Hoạt động' : 'Khóa',
      'Ngày tạo': new Date(user.createdAt).toLocaleDateString('vi-VN'),
      'Ngày cập nhật': new Date(user.updatedAt).toLocaleDateString('vi-VN')
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách người dùng')

    const colWidths = [
      { wch: 5 },   // ID
      { wch: 25 },  // Email
      { wch: 20 },  // Họ tên
      { wch: 15 },  // Số điện thoại
      { wch: 20 },  // Công ty
      { wch: 12 },  // Vai trò
      { wch: 12 },  // Trạng thái
      { wch: 12 },  // Ngày tạo
      { wch: 12 }   // Ngày cập nhật
    ]
    ws['!cols'] = colWidths

    const fileName = `users-${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  const stats = {
    total: users.length,
    active: users.filter(user => user.isActive).length,
    inactive: users.filter(user => !user.isActive).length
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Đang tải...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header Section */}
      <div className={`flex flex-col space-y-4 transition-all duration-700 transform ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h1>
            <p className="text-muted-foreground">Quản lý tài khoản người dùng trong hệ thống</p>
          </div>
          <Button variant="outline" size="sm" onClick={exportToExcel}>
            <Download className="h-4 w-4 mr-2" />
            Xuất Excel
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm theo email, tên, công ty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div 
        className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-700 transform ${
          isVisible ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
        }`}
        style={{ transitionDelay: '200ms' }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số người dùng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã khóa</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card 
        className={`transition-all duration-700 transform ${
          isVisible ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
        }`}
        style={{ transitionDelay: '400ms' }}
      >
        <CardHeader>
          <CardTitle>Danh sách người dùng ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Công ty</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Ngày cập nhật</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                      {searchTerm ? 'Không tìm thấy người dùng nào' : 'Chưa có người dùng nào'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.id}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.firstName} {user.lastName}</TableCell>
                      <TableCell>
                        {user.phoneNumber ? (
                          <span>{user.phoneNumber}</span>
                        ) : (
                          <span className="text-gray-400 italic">Chưa có</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.company ? (
                          <span>{user.company}</span>
                        ) : (
                          <span className="text-gray-400 italic">Chưa có</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'destructive' : 'outline'}>
                          {user.role === 'admin' ? 'Admin' : 'Customer'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={user.isActive}
                            onCheckedChange={() => toggleUserStatus(user.id, user.isActive)}
                          />
                          <Badge variant={user.isActive ? 'default' : 'secondary'}>
                            {user.isActive ? 'Hoạt động' : 'Khóa'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>
                        {new Date(user.updatedAt).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div title={user.role === 'admin' ? 'Bỏ quyền admin' : 'Cấp quyền admin'}>
                            <Button
                              variant={user.role === 'admin' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => toggleAdminRole(user.id, user.role || 'customer')}
                              className={user.role === 'admin' ? 'text-white bg-yellow-600 hover:bg-yellow-700' : ''}
                            >
                              <Crown className="h-4 w-4" />
                            </Button>
                          </div>
                          <div title="Xóa người dùng">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
