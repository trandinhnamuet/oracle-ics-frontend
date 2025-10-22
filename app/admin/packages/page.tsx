'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Star,
  Zap,
  Shield,
  Crown,
  BrainCircuit
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { PricingPlan } from '@/types/pricing-types'
import { starterPlans } from '@/types/plan-starter'
import { professionalPlans } from '@/types/plan-professional'
import { enterprisePlans } from '@/types/plan-enterprise'
import { aiPlans } from '@/types/plan-ai'
import CreateNewPackagePopup from './components/create-new-package-popup'

// Combine all plans
const allPlans = [
  ...starterPlans,
  ...professionalPlans,
  ...enterprisePlans,
  ...aiPlans
]

const categoryInfo = {
  starter: { name: 'Starter', icon: Zap, color: 'bg-blue-500' },
  professional: { name: 'Professional', icon: Shield, color: 'bg-green-500' },
  enterprise: { name: 'Enterprise', icon: Crown, color: 'bg-purple-500' },
  ai: { name: 'AI-GPU', icon: BrainCircuit, color: 'bg-orange-500' },
  custom: { name: 'Custom', icon: Star, color: 'bg-gray-500' }
}

export default function PackagesManagementPage() {
  const { toast } = useToast()
  const [packages, setPackages] = useState<PricingPlan[]>(allPlans)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<PricingPlan | null>(null)

  // Filter packages
  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || pkg.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleCreatePackage = (packageData: any) => {
    const newPackage: PricingPlan = {
      id: Math.max(...packages.map(p => p.id)) + 1,
      name: packageData.name,
      description: packageData.description,
      price: packageData.price,
      period: packageData.period,
      icon: categoryInfo[packageData.category as keyof typeof categoryInfo].icon,
      popular: packageData.popular,
      category: packageData.category,
      features: packageData.features,
      limitations: [],
      subPlanNumber: packages.filter(p => p.category === packageData.category).length + 1
    }

    setPackages([...packages, newPackage])
    toast({
      title: 'Thành công',
      description: 'Tạo gói mới thành công',
      variant: 'default'
    })
  }

  const handleEditPackage = (pkg: PricingPlan) => {
    setEditingPackage(pkg)
    setIsCreateModalOpen(true)
  }

  const handleUpdatePackage = (packageData: any) => {
    if (!editingPackage) return

    const updatedPackage: PricingPlan = {
      ...editingPackage,
      name: packageData.name,
      description: packageData.description,
      price: packageData.price,
      period: packageData.period,
      category: packageData.category,
      features: packageData.features,
      popular: packageData.popular,
      icon: categoryInfo[packageData.category as keyof typeof categoryInfo].icon
    }

    setPackages(packages.map(p => p.id === editingPackage.id ? updatedPackage : p))
    toast({
      title: 'Thành công',
      description: 'Cập nhật gói thành công',
      variant: 'default'
    })
  }

  const handleDeletePackage = (id: number) => {
    setPackages(packages.filter(p => p.id !== id))
    toast({
      title: 'Thành công',
      description: 'Xóa gói thành công',
      variant: 'default'
    })
  }

  const handleCloseModal = () => {
    setIsCreateModalOpen(false)
    setEditingPackage(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý gói dịch vụ</h1>
            <p className="text-gray-600">Tạo, chỉnh sửa và quản lý các gói dịch vụ cloud</p>
          </div>
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#E60000] hover:bg-red-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tạo gói mới
          </Button>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Tìm kiếm gói dịch vụ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white"
                >
                  <option value="all">Tất cả danh mục</option>
                  <option value="starter">Starter</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                  <option value="ai">AI-GPU</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Package Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          {Object.entries(categoryInfo).map(([key, info]) => {
            const count = packages.filter(p => p.category === key).length
            const Icon = info.icon
            return (
              <Card key={key}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-lg ${info.color} mr-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">{info.name}</p>
                      <p className="text-2xl font-bold text-gray-900">{count}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Package Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gói dịch vụ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Danh mục
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giá
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mô tả
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tính năng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPackages.map((pkg) => {
                    const categoryData = categoryInfo[pkg.category as keyof typeof categoryInfo]
                    const Icon = categoryData.icon
                    return (
                      <tr key={pkg.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`p-2 rounded-lg ${categoryData.color} mr-3`}>
                              <Icon className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{pkg.name}</div>
                              <div className="text-xs text-gray-500">ID: {pkg.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline">
                            {categoryData.name}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">${pkg.price}</div>
                          <div className="text-xs text-gray-500">/{pkg.period}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate" title={pkg.description}>
                            {pkg.description}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-gray-600">
                            {pkg.features.slice(0, 2).map((feature, index) => (
                              <div key={index} className="flex items-center mb-1">
                                <div className="w-1 h-1 bg-green-500 rounded-full mr-2"></div>
                                <span className="truncate max-w-[150px]" title={feature}>{feature}</span>
                              </div>
                            ))}
                            {pkg.features.length > 2 && (
                              <div className="text-gray-400">
                                +{pkg.features.length - 2} tính năng khác
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {pkg.popular && (
                            <Badge className="bg-[#E60000] text-white">
                              <Star className="h-3 w-3 mr-1" />
                              Phổ biến
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditPackage(pkg)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePackage(pkg.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              
              {filteredPackages.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">Không tìm thấy gói dịch vụ nào</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Create/Edit Package Popup */}
        <CreateNewPackagePopup
          isOpen={isCreateModalOpen}
          onClose={handleCloseModal}
          onCreatePackage={handleCreatePackage}
          editingPackage={editingPackage}
          onUpdatePackage={handleUpdatePackage}
        />
      </div>
    </div>
  )
}
