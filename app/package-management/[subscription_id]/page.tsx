'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Play, Pause, RotateCcw, Trash2, Download, RefreshCw } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'

// Demo data for charts
const cpuData = [
  { time: '17:10', usage: 0 },
  { time: '17:20', usage: 5 },
  { time: '17:30', usage: 15 },
  { time: '17:40', usage: 25 },
  { time: '17:50', usage: 55 },
  { time: '18:00', usage: 100 },
]

const memoryData = [
  { time: '17:10', usage: 0 },
  { time: '17:20', usage: 10 },
  { time: '17:30', usage: 20 },
  { time: '17:40', usage: 30 },
  { time: '17:50', usage: 85 },
  { time: '18:00', usage: 75 },
]

interface CloudPackageDetail {
  id: number
  vmName: string
  packageName: string
  status: 'active' | 'paused' | 'stopped'
  cpu: string
  memory: string
  storage: string
  bandwidth: string
  ipAddress: string
  createdAt: string
  nextBilling: string
  monthlyPrice: number
}

export default function PackageDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { t } = useTranslation()
  const subscriptionId = params.subscription_id as string

  const [packageDetail, setPackageDetail] = useState<CloudPackageDetail>({
    id: 1,
    vmName: '1365442-01',
    packageName: 'CloudForce Premium',
    status: 'active',
    cpu: '4 vCPU',
    memory: '8 GB RAM',
    storage: '200 GB SSD',
    bandwidth: '1000 Mbps',
    ipAddress: '192.168.1.100',
    createdAt: '2024-09-15',
    nextBilling: '2024-10-15',
    monthlyPrice: 99.99
  })

  const [selectedVM, setSelectedVM] = useState('1365442-01')
  const [selectedTime, setSelectedTime] = useState('1 hour ago')
  const [selectedTheme, setSelectedTheme] = useState('Light')
  const [isLoading, setIsLoading] = useState(false)

  const handleAction = async (action: string) => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      console.log(`Executing action: ${action}`)
      setIsLoading(false)
    }, 2000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'stopped': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Display device load status
              </h1>
              <p className="text-gray-600 mt-1">
                Monitor and manage your cloud package performance
              </p>
            </div>
          </div>
          <div className="text-right">
            <Badge className={getStatusColor(packageDetail.status)}>
              {packageDetail.status.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Control Panel */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  VM Name:
                </label>
                <Select value={selectedVM} onValueChange={setSelectedVM}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1365442-01">1365442-01</SelectItem>
                    <SelectItem value="1365442-02">1365442-02</SelectItem>
                    <SelectItem value="1365442-03">1365442-03</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time:
                </label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 hour ago">1 hour ago</SelectItem>
                    <SelectItem value="6 hours ago">6 hours ago</SelectItem>
                    <SelectItem value="24 hours ago">24 hours ago</SelectItem>
                    <SelectItem value="7 days ago">7 days ago</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme:
                </label>
                <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Light">Light</SelectItem>
                    <SelectItem value="Dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end">
                <Button 
                  className="bg-red-500 hover:bg-red-600 text-white px-8"
                  onClick={() => handleAction('show-performance')}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Show Performance Usage
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CPU Usage Chart */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">CPU Usage (%)</CardTitle>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cpuData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="time" 
                      axisLine={false}
                      tickLine={false}
                      className="text-sm"
                    />
                    <YAxis 
                      domain={[0, 125]}
                      axisLine={false}
                      tickLine={false}
                      className="text-sm"
                    />
                    <Area 
                      type="stepAfter" 
                      dataKey="usage" 
                      stroke="#ef4444" 
                      fill="#fecaca" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Memory Usage Chart */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Memory Usage (%)</CardTitle>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={memoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="time" 
                      axisLine={false}
                      tickLine={false}
                      className="text-sm"
                    />
                    <YAxis 
                      domain={[0, 100]}
                      axisLine={false}
                      tickLine={false}
                      className="text-sm"
                    />
                    <Area 
                      type="stepAfter" 
                      dataKey="usage" 
                      stroke="#8b5cf6" 
                      fill="#ddd6fe" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Package Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Package Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Package Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Package Name</p>
                  <p className="font-semibold">{packageDetail.packageName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">VM Name</p>
                  <p className="font-semibold">{packageDetail.vmName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">CPU</p>
                  <p className="font-semibold">{packageDetail.cpu}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Memory</p>
                  <p className="font-semibold">{packageDetail.memory}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Storage</p>
                  <p className="font-semibold">{packageDetail.storage}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bandwidth</p>
                  <p className="font-semibold">{packageDetail.bandwidth}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">IP Address</p>
                  <p className="font-semibold">{packageDetail.ipAddress}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Monthly Price</p>
                  <p className="font-semibold">${packageDetail.monthlyPrice}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Manage Package</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start"
                variant="outline"
                onClick={() => handleAction('start')}
                disabled={isLoading || packageDetail.status === 'active'}
              >
                <Play className="h-4 w-4 mr-2" />
                Start VM
              </Button>
              
              <Button 
                className="w-full justify-start"
                variant="outline"
                onClick={() => handleAction('pause')}
                disabled={isLoading || packageDetail.status === 'paused'}
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause VM
              </Button>
              
              <Button 
                className="w-full justify-start"
                variant="outline"
                onClick={() => handleAction('restart')}
                disabled={isLoading}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Restart VM
              </Button>
              
              <Button 
                className="w-full justify-start"
                variant="outline"
                onClick={() => handleAction('backup')}
                disabled={isLoading}
              >
                <Download className="h-4 w-4 mr-2" />
                Create Backup
              </Button>
              
              <div className="pt-2 border-t">
                <Button 
                  className="w-full justify-start"
                  variant="destructive"
                  onClick={() => handleAction('delete')}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Package
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Billing Information */}
        <Card>
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Created Date</p>
                <p className="text-xl font-bold text-blue-600">{packageDetail.createdAt}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Next Billing</p>
                <p className="text-xl font-bold text-green-600">{packageDetail.nextBilling}</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Monthly Cost</p>
                <p className="text-xl font-bold text-purple-600">${packageDetail.monthlyPrice}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}