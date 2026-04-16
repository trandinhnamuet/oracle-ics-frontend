'use client'

import { useState, useEffect } from 'react'
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
import { Input } from '@/components/ui/input'
import { AlertTriangle, Key, Mail, Monitor, Shield } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { sendActionOtp } from '@/api/vm-subscription.api'
import { useToast } from '@/hooks/use-toast'

interface ConfirmSshKeyRequestDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (otpCode: string) => void
  email: string
  vmName?: string
  isLoading?: boolean
  subscriptionId: string
  otpError?: string
  onClearOtpError?: () => void
}

export function ConfirmSshKeyRequestDialog({
  isOpen,
  onClose,
  onConfirm,
  email,
  vmName,
  isLoading = false,
  subscriptionId,
  otpError,
  onClearOtpError,
}: ConfirmSshKeyRequestDialogProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [step, setStep] = useState<'confirm' | 'otp'>('confirm')
  const [otpCode, setOtpCode] = useState('')
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [sendOtpError, setSendOtpError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  // Reset state whenever dialog opens
  useEffect(() => {
    if (isOpen) {
      setStep('confirm')
      setOtpCode('')
      setIsSendingOtp(false)
      setSendOtpError('')
      setResendCooldown(0)
    }
  }, [isOpen])

  const handleSendOtp = async () => {
    setSendOtpError('')
    setIsSendingOtp(true)
    try {
      await sendActionOtp(subscriptionId, 'request-key')
      setStep('otp')
      setResendCooldown(30)
    } catch (error: any) {
      const msg: string = error?.response?.data?.message || ''
      const cooldownMatch = msg.match(/please wait (\d+) second/i)
      const hourlyMatch = msg.match(/please wait (\d+) minute/i)
      if (cooldownMatch) {
        const secs = parseInt(cooldownMatch[1], 10)
        setResendCooldown(secs)
        setSendOtpError(t('packageDetail.actionOtp.sendCooldown', { seconds: cooldownMatch[1] }))
      } else if (hourlyMatch || /hourly otp limit/i.test(msg)) {
        setSendOtpError(t('packageDetail.actionOtp.hourlyLimitReached', { minutes: hourlyMatch?.[1] ?? '60' }))
      } else {
        toast({
          title: t('common.error'),
          description: msg || t('packageDetail.actionOtp.sendError'),
          variant: 'destructive',
        })
      }
    } finally {
      setIsSendingOtp(false)
    }
  }

  const handleConfirm = () => {
    if (!otpCode.trim()) {
      toast({
        title: t('common.error'),
        description: t('packageDetail.actionOtp.emptyError'),
        variant: 'destructive',
      })
      return
    }
    onClearOtpError?.()
    onConfirm(otpCode.trim())
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-xl">
            <Key className="h-5 w-5 text-orange-600" />
            {t('packageDetail.sshKeyRequest.title')}
          </AlertDialogTitle>

          {step === 'confirm' ? (
            <AlertDialogDescription className="space-y-4 text-left pt-4">
              {false && (
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
              )}

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

              {false && (
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
              )}

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
          ) : (
            <AlertDialogDescription className="space-y-4 text-left pt-4">
              {/* OTP sent notice */}
              <div className="bg-green-50 border border-green-200 p-4 rounded">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-900 text-sm">
                      {t('packageDetail.actionOtp.otpSent', { email })}
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      {t('packageDetail.actionOtp.otpExpiry')}
                    </p>
                  </div>
                </div>
              </div>

              {/* OTP input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {t('packageDetail.actionOtp.otpLabel')}
                </label>
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder={t('packageDetail.actionOtp.otpPlaceholder')}
                  value={otpCode}
                  onChange={(e) => {
                    setOtpCode(e.target.value.replace(/\D/g, ''))
                    onClearOtpError?.()
                  }}
                  className={`text-center text-xl tracking-widest font-mono${otpError ? ' border-red-500 focus-visible:ring-red-500' : ''}`}
                  autoFocus
                />
                {otpError && (
                  <p className="text-sm text-red-600 font-medium text-center">{otpError}</p>
                )}
              </div>

              {/* Resend link */}
              <p className="text-xs text-muted-foreground text-center">
                {sendOtpError && (
                  <span className="block text-red-600 font-medium mb-1">{sendOtpError}</span>
                )}
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp || resendCooldown > 0}
                  className="underline hover:no-underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSendingOtp
                    ? t('packageDetail.actionOtp.resending')
                    : resendCooldown > 0
                      ? t('packageDetail.actionOtp.resendCooldown', { count: resendCooldown })
                      : t('packageDetail.actionOtp.resend')}
                </button>
              </p>
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>

        {step === 'confirm' && sendOtpError && (
          <p className="text-sm text-red-600 font-medium text-center px-2 pb-1">{sendOtpError}</p>
        )}

        <AlertDialogFooter>
          {step === 'confirm' ? (
            <>
              <AlertDialogCancel disabled={isSendingOtp}>
                {t('packageDetail.sshKeyRequest.cancel')}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault()
                  handleSendOtp()
                }}
                disabled={isSendingOtp}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isSendingOtp ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    {t('packageDetail.actionOtp.sendingOtp')}
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    {t('packageDetail.actionOtp.sendOtp')}
                  </>
                )}
              </AlertDialogAction>
            </>
          ) : (
            <>
              <AlertDialogCancel
                onClick={() => setStep('confirm')}
                disabled={isLoading}
              >
                {t('packageDetail.actionOtp.backToForm')}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault()
                  handleConfirm()
                }}
                disabled={isLoading || otpCode.length !== 6}
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
                    {t('packageDetail.actionOtp.verify')}
                  </>
                )}
              </AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
