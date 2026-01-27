'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AlertTriangle, Key, Mail, Shield } from 'lucide-react'

interface ConfirmSshKeyRequestDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  email: string
  vmName?: string
  isLoading?: boolean
}

export function ConfirmSshKeyRequestDialog({
  isOpen,
  onClose,
  onConfirm,
  email,
  vmName,
  isLoading = false,
}: ConfirmSshKeyRequestDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-xl">
            <Key className="h-5 w-5 text-orange-600" />
            Xác nhận tạo SSH Key mới
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4 text-left pt-4">
            {/* Warning Box */}
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="font-semibold text-orange-900">
                    Lưu ý quan trọng về bảo mật
                  </p>
                  <ul className="text-sm text-orange-800 space-y-1 list-disc list-inside">
                    <li>SSH key mới sẽ được tạo và thêm vào VM của bạn</li>
                    <li>
                      <strong>Key cũ vẫn hoạt động bình thường</strong> - bạn có thể tiếp tục sử dụng
                    </li>
                    <li>Tối đa 2 user SSH keys + 1 admin key (3 keys total)</li>
                    <li>Nếu đã có 2 user keys, key user cũ nhất sẽ tự động bị xóa</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* VM Info */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Thông tin VM:</span>
                </div>
                {vmName && (
                  <p className="text-blue-800 ml-6">
                    <strong>VM:</strong> {vmName}
                  </p>
                )}
                <div className="flex items-center gap-2 ml-6">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-800">
                    Private key sẽ được gửi đến: <strong>{email}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-gray-50 border border-gray-200 p-4 rounded">
              <p className="text-sm font-semibold text-gray-900 mb-2">
                🔐 Quy trình tạo key:
              </p>
              <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                <li>Hệ thống tạo cặp SSH key RSA 4096-bit mới</li>
                <li>Public key được thêm vào VM metadata</li>
                <li>Private key được gửi qua email (chỉ lần này duy nhất)</li>
                <li>Key cũ vẫn hoạt động, tự động xóa khi vượt giới hạn</li>
              </ol>
            </div>

            {/* Final Warning */}
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
              <p className="text-sm text-yellow-900">
                ⚠️ <strong>Quan trọng:</strong> Bạn sẽ nhận được private key qua email{' '}
                <strong className="underline">CHỈ MỘT LẦN DUY NHẤT</strong>. 
                Hãy lưu trữ an toàn ngay sau khi nhận được.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Hủy bỏ
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Đang tạo key...
              </>
            ) : (
              <>
                <Key className="h-4 w-4 mr-2" />
                Xác nhận tạo SSH Key mới
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
