'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CustomSelect } from '@/components/ui/custom-select'
import { 
  ArrowLeft, 
  Server, 
  MapPin, 
  Shield, 
  Monitor,
  ChevronDown,
  Eye,
  EyeOff,
  Check
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// Operating Systems with versions
const OPERATING_SYSTEMS = [
  {
    id: 'ubuntu',
    name: 'Ubuntu',
    icon: '🐧',
    versions: [
      { id: 'ubuntu-22.04', name: 'Ubuntu 22.04 LTS', recommended: true },
      { id: 'ubuntu-20.04', name: 'Ubuntu 20.04 LTS' },
      { id: 'ubuntu-18.04', name: 'Ubuntu 18.04 LTS' }
    ]
  },
  {
    id: 'centos',
    name: 'CentOS',
    icon: '🔴',
    versions: [
      { id: 'centos-8', name: 'CentOS 8' },
      { id: 'centos-7', name: 'CentOS 7', recommended: true }
    ]
  },
  {
    id: 'oracle-linux',
    name: 'Oracle Linux',
    icon: '🔶',
    versions: [
      { id: 'ol-8', name: 'Oracle Linux 8', recommended: true },
      { id: 'ol-7', name: 'Oracle Linux 7' }
    ]
  },
  {
    id: 'windows',
    name: 'Windows Server',
    icon: '🪟',
    versions: [
      { id: 'windows-2022', name: 'Windows Server 2022', recommended: true },
      { id: 'windows-2019', name: 'Windows Server 2019' },
      { id: 'windows-2016', name: 'Windows Server 2016' }
    ]
  }
]

// Oracle Cloud Regions
const ORACLE_REGIONS = [
  {
    id: 'ap-singapore-1',
    name: 'Singapore',
    description: 'Asia Pacific (Singapore)',
    flag: '🇸🇬',
    default: true
  },
  {
    id: 'ap-tokyo-1',
    name: 'Tokyo',
    description: 'Asia Pacific (Tokyo)',
    flag: '🇯🇵'
  },
  {
    id: 'ap-seoul-1',
    name: 'Seoul',
    description: 'Asia Pacific (Seoul)',
    flag: '🇰🇷'
  },
  {
    id: 'ap-mumbai-1',
    name: 'Mumbai',
    description: 'Asia Pacific (Mumbai)',
    flag: '🇮🇳'
  },
  {
    id: 'ap-sydney-1',
    name: 'Sydney',
    description: 'Asia Pacific (Sydney)',
    flag: '🇦🇺'
  },
  {
    id: 'us-phoenix-1',
    name: 'Phoenix',
    description: 'US West (Phoenix)',
    flag: '🇺🇸'
  },
  {
    id: 'us-ashburn-1',
    name: 'Ashburn',
    description: 'US East (Ashburn)',
    flag: '🇺🇸'
  },
  {
    id: 'eu-frankfurt-1',
    name: 'Frankfurt',
    description: 'Europe (Frankfurt)',
    flag: '🇩🇪'
  },
  {
    id: 'eu-london-1',
    name: 'London',
    description: 'Europe (London)',
    flag: '🇬🇧'
  },
  {
    id: 'eu-amsterdam-1',
    name: 'Amsterdam',
    description: 'Europe (Amsterdam)',
    flag: '🇳🇱'
  }
]

export default function CloudConfigurationPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { toast } = useToast()
  
  const [selectedOS, setSelectedOS] = useState('')
  const [selectedVersion, setSelectedVersion] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('ap-singapore-1') // Default to Singapore
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleOSChange = (osId: string) => {
    setSelectedOS(osId)
    setSelectedVersion('') // Reset version when OS changes
  }

  const validatePassword = (pwd: string) => {
    const hasLength = pwd.length >= 8
    const hasUpper = /[A-Z]/.test(pwd)
    const hasLower = /[a-z]/.test(pwd)
    const hasNumber = /\d/.test(pwd)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    
    return {
      hasLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      isValid: hasLength && hasUpper && hasLower && hasNumber && hasSpecial
    }
  }

  const passwordValidation = validatePassword(password)

  const handleSubmit = () => {
    if (!selectedOS) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn hệ điều hành',
        variant: 'destructive'
      })
      return
    }

    if (!selectedVersion) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn phiên bản hệ điều hành',
        variant: 'destructive'
      })
      return
    }

    if (!selectedRegion) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn region',
        variant: 'destructive'
      })
      return
    }

    if (!passwordValidation.isValid) {
      toast({
        title: 'Lỗi',
        description: 'Mật khẩu không đáp ứng yêu cầu bảo mật',
        variant: 'destructive'
      })
      return
    }

    setIsProcessing(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false)
      toast({
        title: 'Thành công',
        description: 'Cấu hình cloud đã được lưu. Đang khởi tạo instance...',
        variant: 'default'
      })
      
      // Navigate to deployment status or back to cloud dashboard
      router.push('/cloud')
    }, 2000)
  }

  const selectedOSData = OPERATING_SYSTEMS.find(os => os.id === selectedOS)
  const selectedRegionData = ORACLE_REGIONS.find(region => region.id === selectedRegion)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
  <div className="container mx-auto px-4 max-w-8xl">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Cấu hình Cloud Instance</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cột 1: Chọn hệ điều hành */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Monitor className="h-5 w-5 mr-2" />
                  Chọn hệ điều hành
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  {OPERATING_SYSTEMS.map((os) => (
                    <div
                      key={os.id}
                      className={`
                        p-4 border rounded-lg cursor-pointer transition-all
                        ${selectedOS === os.id 
                          ? 'border-[#E60000] bg-red-50' 
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                      onClick={() => handleOSChange(os.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{os.icon}</span>
                        <div>
                          <h3 className="font-medium text-gray-900">{os.name}</h3>
                          <p className="text-sm text-gray-600">{os.versions.length} phiên bản</p>
                        </div>
                        {selectedOS === os.id && (
                          <div className="ml-auto">
                            <div className="w-4 h-4 bg-[#E60000] rounded-full flex items-center justify-center">
                              <Check className="w-2 h-2 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Version Selection */}
                {selectedOSData && (
                  <div className="mt-6">
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">
                      Chọn phiên bản {selectedOSData.name}
                    </Label>
                    <div className="space-y-2">
                      {selectedOSData.versions.map((version) => (
                        <div
                          key={version.id}
                          className={`
                            p-3 border rounded-lg cursor-pointer transition-all flex items-center justify-between
                            ${selectedVersion === version.id 
                              ? 'border-[#E60000] bg-red-50' 
                              : 'border-gray-200 hover:border-gray-300'
                            }
                          `}
                          onClick={() => setSelectedVersion(version.id)}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">{selectedOSData.icon}</span>
                            <div>
                              <h4 className="font-medium text-gray-900">{version.name}</h4>
                              {version.recommended && (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mt-1">
                                  Khuyến nghị
                                </Badge>
                              )}
                            </div>
                          </div>
                          {selectedVersion === version.id && (
                            <div className="w-4 h-4 bg-[#E60000] rounded-full flex items-center justify-center">
                              <Check className="w-2 h-2 text-white" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Cột 2: Chọn region + Thiết lập mật khẩu */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Chọn region
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Oracle Cloud Region
                  </Label>
                  <CustomSelect
                    options={ORACLE_REGIONS.map(region => ({
                      value: region.id,
                      title: `${region.name} - ${region.description}`,
                      subtitle: region.flag
                    }))}
                    value={selectedRegion}
                    onChange={setSelectedRegion}
                  />
                  {selectedRegionData?.default && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Mặc định
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Thiết lập mật khẩu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Mật khẩu root/administrator
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mạnh..."
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                {/* Password Requirements */}
                <div className="bg-gray-50 border rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Yêu cầu mật khẩu:</h4>
                  <div className="space-y-2">
                    <div className={`flex items-center space-x-2 text-sm ${passwordValidation.hasLength ? 'text-green-600' : 'text-gray-500'}`}>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidation.hasLength ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {passwordValidation.hasLength && <Check className="w-2 h-2 text-green-600" />}
                      </div>
                      <span>Ít nhất 8 ký tự</span>
                    </div>
                    <div className={`flex items-center space-x-2 text-sm ${passwordValidation.hasUpper ? 'text-green-600' : 'text-gray-500'}`}>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidation.hasUpper ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {passwordValidation.hasUpper && <Check className="w-2 h-2 text-green-600" />}
                      </div>
                      <span>Ít nhất 1 chữ hoa (A-Z)</span>
                    </div>
                    <div className={`flex items-center space-x-2 text-sm ${passwordValidation.hasLower ? 'text-green-600' : 'text-gray-500'}`}>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidation.hasLower ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {passwordValidation.hasLower && <Check className="w-2 h-2 text-green-600" />}
                      </div>
                      <span>Ít nhất 1 chữ thường (a-z)</span>
                    </div>
                    <div className={`flex items-center space-x-2 text-sm ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidation.hasNumber ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {passwordValidation.hasNumber && <Check className="w-2 h-2 text-green-600" />}
                      </div>
                      <span>Ít nhất 1 số (0-9)</span>
                    </div>
                    <div className={`flex items-center space-x-2 text-sm ${passwordValidation.hasSpecial ? 'text-green-600' : 'text-gray-500'}`}>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidation.hasSpecial ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {passwordValidation.hasSpecial && <Check className="w-2 h-2 text-green-600" />}
                      </div>
                      <span>Ít nhất 1 ký tự đặc biệt (!@#$%^&*)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cột 3: Tóm tắt cấu hình + Button khởi tạo Cloud Instance */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="h-5 w-5 mr-2" />
                  Tóm tắt cấu hình
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-gray-600">Hệ điều hành</Label>
                    <p className="font-medium">
                      {selectedOSData ? (
                        <span className="flex items-center space-x-2">
                          <span>{selectedOSData.icon}</span>
                          <span>{selectedOSData.name}</span>
                        </span>
                      ) : (
                        <span className="text-gray-400">Chưa chọn</span>
                      )}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600">Phiên bản</Label>
                    <p className="font-medium">
                      {selectedVersion ? (
                        selectedOSData?.versions.find(v => v.id === selectedVersion)?.name
                      ) : (
                        <span className="text-gray-400">Chưa chọn</span>
                      )}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600">Region</Label>
                    <p className="font-medium">
                      {selectedRegionData ? (
                        <span className="flex items-center space-x-2">
                          <span>{selectedRegionData.flag}</span>
                          <span>{selectedRegionData.name}</span>
                        </span>
                      ) : (
                        <span className="text-gray-400">Chưa chọn</span>
                      )}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600">Mật khẩu</Label>
                    <p className="font-medium">
                      {passwordValidation.isValid ? (
                        <span className="text-green-600">✓ Hợp lệ</span>
                      ) : (
                        <span className="text-gray-400">Chưa thiết lập</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">Thông số kỹ thuật</Label>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">CPU:</span>
                      <span className="text-sm font-medium">4 vCPUs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">RAM:</span>
                      <span className="text-sm font-medium">16 GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Storage:</span>
                      <span className="text-sm font-medium">200 GB SSD</span>
                    </div>
                    {/* <div className="flex justify-between">
                      <span className="text-sm text-gray-600">GPU:</span>
                      <span className="text-sm font-medium">NVIDIA A100 (1x)</span>
                    </div> */}
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <Button
                    onClick={handleSubmit}
                    disabled={!selectedOS || !selectedVersion || !selectedRegion || !passwordValidation.isValid || isProcessing}
                    className="w-full bg-[#E60000] hover:bg-red-700"
                    size="lg"
                  >
                    {isProcessing ? 'Đang khởi tạo...' : 'Khởi tạo Cloud Instance'}
                  </Button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Lưu ý:</strong> Quá trình khởi tạo có thể mất 5-10 phút. Bạn sẽ nhận được thông báo khi hoàn tất.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
