'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import useAuthStore from '@/hooks/use-auth-store'
import axios from 'axios'

const formSchema = z.object({
  userName: z.string().min(2, 'Tên người dùng phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phoneNumber: z.string().min(10, 'Số điện thoại phải có ít nhất 10 số').max(20, 'Số điện thoại không được quá 20 số'),
  company: z.string().optional(),
    cpu: z.string().min(1, 'Vui lòng nhập thông tin CPU'),
    ram: z.string().min(1, 'Vui lòng nhập thông tin RAM'),
    storage: z.string().optional(),
    bandwidth: z.string().optional(),
  additionalNotes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface CustomRegistrationFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CustomRegistrationForm({ open, onOpenChange }: CustomRegistrationFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { user, isAuthenticated } = useAuthStore()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userName: '',
      email: '',
      phoneNumber: '',
      company: '',
      cpu: '',
      ram: '',
      storage: '',
      bandwidth: '',
      additionalNotes: '',
    },
  })

  // Autofill form khi có thông tin user và form được mở
  useEffect(() => {
    if (open && isAuthenticated && user) {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim()
      form.reset({
        userName: fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        company: user.company || '',
        cpu: '',
        ram: '',
        storage: '',
        bandwidth: '',
        additionalNotes: '',
      })
    }
  }, [open, isAuthenticated, user, form])

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)
    try {

      // Gộp thông tin detail thành JSON
      const detail = {
        cpu: values.cpu,
        ram: values.ram,
        storage: values.storage || '',
        bandwidth: values.bandwidth || '',
        additionalNotes: values.additionalNotes || ''
      }

      const payload = {
        userId: user?.id ? parseInt(user.id) : undefined,
        phoneNumber: values.phoneNumber,
        email: values.email,
        company: values.company || '',
  detail: JSON.stringify(detail),
        createdBy: values.userName,
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'
      await axios.post(`${API_URL}/custom-package-registrations`, payload)

      toast({
        title: 'Đăng ký thành công!',
        description: 'Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.',
        variant: 'success',
      })

      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error('Registration error:', error)
      toast({
        title: 'Có lỗi xảy ra',
        description: 'Vui lòng thử lại sau hoặc liên hệ hỗ trợ.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Đăng ký gói tùy chỉnh</DialogTitle>
          <DialogDescription>
            Vui lòng điền thông tin chi tiết để chúng tôi tư vấn gói dịch vụ phù hợp nhất cho bạn.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="userName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên người dùng *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên của bạn" {...field} className="placeholder:text-gray-400" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="example@company.com" {...field} className="placeholder:text-gray-400" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại *</FormLabel>
                    <FormControl>
                      <Input placeholder="0987654321" {...field} className="placeholder:text-gray-400" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên công ty</FormLabel>
                    <FormControl>
                      <Input placeholder="Công ty ABC" {...field} className="placeholder:text-gray-400" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Yêu cầu cấu hình</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cpu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPU *</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: 4 cores, Intel Xeon" {...field} className="placeholder:text-gray-400" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RAM *</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: 16GB, 32GB" {...field} className="placeholder:text-gray-400" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="storage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bộ nhớ *</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: 500GB SSD, 1TB HDD" {...field} className="placeholder:text-gray-400" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bandwidth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Đường truyền *</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: 100Mbps, 1Gbps" {...field} className="placeholder:text-gray-400" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="additionalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ghi chú thêm</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Mô tả thêm về yêu cầu đặc biệt, thời gian triển khai, ngân sách dự kiến..."
                        className="min-h-[100px] placeholder:text-gray-400"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Đăng ký
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
