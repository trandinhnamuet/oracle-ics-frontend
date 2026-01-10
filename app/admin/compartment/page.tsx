'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { getCompartments, deleteCompartment, Compartment } from '@/api/oci.api'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function CompartmentManagementPage() {
  const [compartments, setCompartments] = useState<Compartment[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCompartment, setSelectedCompartment] = useState<Compartment | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()

  const loadCompartments = async () => {
    try {
      setLoading(true)
      const data = await getCompartments()
      setCompartments(data)
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: `Không thể tải danh sách compartments: ${error.message}`,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCompartments()
  }, [])

  const handleDeleteClick = (compartment: Compartment) => {
    setSelectedCompartment(compartment)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedCompartment) return

    try {
      setDeleting(true)
      await deleteCompartment(selectedCompartment.name)
      
      toast({
        title: 'Thành công',
        description: `Đã xóa compartment "${selectedCompartment.name}" và tất cả tài nguyên bên trong`,
      })

      // Reload danh sách sau khi xóa
      await loadCompartments()
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: `Không thể xóa compartment: ${error.response?.data?.message || error.message}`,
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
      setSelectedCompartment(null)
    }
  }

  const getStateColor = (state: string) => {
    switch (state) {
      case 'ACTIVE':
        return 'bg-green-500'
      case 'CREATING':
        return 'bg-blue-500'
      case 'DELETING':
        return 'bg-orange-500'
      case 'DELETED':
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Compartments</h1>
          <p className="text-muted-foreground mt-2">
            Danh sách compartments trong OCI tenancy
          </p>
        </div>
        <Button onClick={loadCompartments} disabled={loading} variant="outline">
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Đang tải compartments...</span>
        </div>
      ) : compartments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Không có compartment nào
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {compartments.map((compartment) => (
            <Card key={compartment.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{compartment.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {compartment.description || 'Không có mô tả'}
                    </p>
                  </div>
                  <Badge className={getStateColor(compartment.lifecycleState)}>
                    {compartment.lifecycleState}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Compartment ID</p>
                    <p className="text-sm font-mono break-all">{compartment.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ngày tạo</p>
                    <p className="text-sm">
                      {new Date(compartment.timeCreated).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteClick(compartment)}
                    disabled={compartment.lifecycleState !== 'ACTIVE'}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa Compartment
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Xác nhận xóa Compartment
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Bạn có chắc chắn muốn xóa compartment{' '}
                <strong className="text-foreground">
                  {selectedCompartment?.name}
                </strong>
                ?
              </p>
              <p className="text-destructive font-medium">
                ⚠️ Hành động này sẽ XÓA TẤT CẢ tài nguyên bên trong compartment bao gồm:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Tất cả VM instances</li>
                <li>Tất cả VCNs (Virtual Cloud Networks)</li>
                <li>Tất cả Subnets</li>
                <li>Tất cả Internet Gateways</li>
                <li>Tất cả Route Tables</li>
              </ul>
              <p className="font-medium">
                Hành động này KHÔNG THỂ hoàn tác!
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xác nhận xóa
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
