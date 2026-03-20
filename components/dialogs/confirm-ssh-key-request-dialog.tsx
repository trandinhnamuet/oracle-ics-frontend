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
import { AlertTriangle, Key, Monitor, Shield } from 'lucide-react'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-xl">
            <Key className="h-5 w-5 text-orange-600" />
            {t('packageDetail.sshKeyRequest.title')}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4 text-left pt-4">
            {/* Warning Box */}
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="font-semibold text-orange-900">
                    {t('packageDetail.sshKeyRequest.warningTitle')}
                  </p>
                  <ul className="text-sm text-orange-800 space-y-1 list-disc list-inside">
                    <li>{t('packageDetail.sshKeyRequest.warningItem1')}</li>
                    <li>{t('packageDetail.sshKeyRequest.warningItem2')}</li>
                    <li>{t('packageDetail.sshKeyRequest.warningItem3')}</li>
                    <li>{t('packageDetail.sshKeyRequest.warningItem4')}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* VM Info */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">{t('packageDetail.sshKeyRequest.vmInfoTitle')}</span>
                </div>
                {vmName && (
                  <p className="text-blue-800 ml-6">
                    <strong>VM:</strong> {vmName}
                  </p>
                )}
                <div className="flex items-center gap-2 ml-6">
                  <Monitor className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-800">
                    {t('packageDetail.sshKeyRequest.privateKeyOnScreen')}
                  </span>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-gray-50 border border-gray-200 p-4 rounded">
              <p className="text-sm font-semibold text-gray-900 mb-2">
                {t('packageDetail.sshKeyRequest.processTitle')}
              </p>
              <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                <li>{t('packageDetail.sshKeyRequest.processStep1')}</li>
                <li>{t('packageDetail.sshKeyRequest.processStep2')}</li>
                <li>{t('packageDetail.sshKeyRequest.processStep3')}</li>
                <li>{t('packageDetail.sshKeyRequest.processStep4')}</li>
              </ol>
            </div>

            {/* Final Warning */}
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
              <p className="text-sm text-yellow-900">
                ⚠️ <strong>{t('packageDetail.sshKeyRequest.importantLabel')}</strong>{' '}
                {t('packageDetail.sshKeyRequest.importantNote1')}{' '}
                <strong className="underline">{t('packageDetail.sshKeyRequest.importantOnce')}</strong>.{' '}
                {t('packageDetail.sshKeyRequest.importantNote2')}
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {t('packageDetail.sshKeyRequest.cancel')}
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
                {t('packageDetail.sshKeyRequest.creating')}
              </>
            ) : (
              <>
                <Key className="h-4 w-4 mr-2" />
                {t('packageDetail.sshKeyRequest.confirm')}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
