'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from 'react-i18next'
import { PricingPlan } from '@/types/pricing-types'

interface CreateNewPackagePopupProps {
  isOpen: boolean
  onClose: () => void
  onCreatePackage: (packageData: any) => void
  editingPackage?: PricingPlan | null
  onUpdatePackage?: (packageData: any) => void
}

export default function CreateNewPackagePopup({
  isOpen,
  onClose,
  onCreatePackage,
  editingPackage = null,
  onUpdatePackage
}: CreateNewPackagePopupProps) {
  const { toast } = useToast()
  const { t } = useTranslation()
  
  const [formData, setFormData] = useState({
    name: editingPackage?.name || '',
    description: editingPackage?.description || '',
    price: editingPackage?.price || '',
    period: editingPackage?.period || t('admin.packages.createPackage.form.periodOptions.month'),
    category: editingPackage?.category || 'starter' as PricingPlan['category'],
    features: editingPackage?.features || [''],
    popular: editingPackage?.popular || false
  })

  const handleSubmit = () => {
    if (!formData.name || !formData.price) {
      toast({
        title: t('admin.packages.createPackage.validation.error'),
        description: t('admin.packages.createPackage.validation.fillAllFields'),
        variant: 'destructive'
      })
      return
    }

    const packageData = {
      ...formData,
      features: formData.features.filter(f => f.trim() !== '')
    }

    if (editingPackage && onUpdatePackage) {
      onUpdatePackage(packageData)
    } else {
      onCreatePackage(packageData)
    }

    handleClose()
  }

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      period: t('admin.packages.createPackage.form.periodOptions.month'),
      category: 'starter',
      features: [''],
      popular: false
    })
    onClose()
  }

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] })
  }

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features]
    newFeatures[index] = value
    setFormData({ ...formData, features: newFeatures })
  }

  const removeFeature = (index: number) => {
    setFormData({ ...formData, features: formData.features.filter((_, i) => i !== index) })
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingPackage ? t('admin.packages.createPackage.title.edit') : t('admin.packages.createPackage.title.create')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">{t('admin.packages.createPackage.form.packageName')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('admin.packages.createPackage.form.packageNamePlaceholder')}
              />
            </div>
            <div>
              <Label htmlFor="category">{t('admin.packages.createPackage.form.category')}</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="starter">{t('admin.packages.createPackage.form.categoryOptions.starter')}</option>
                <option value="professional">{t('admin.packages.createPackage.form.categoryOptions.professional')}</option>
                <option value="enterprise">{t('admin.packages.createPackage.form.categoryOptions.enterprise')}</option>
                <option value="ai">{t('admin.packages.createPackage.form.categoryOptions.ai')}</option>
                <option value="custom">{t('admin.packages.createPackage.form.categoryOptions.custom')}</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">{t('admin.packages.createPackage.form.description')}</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('admin.packages.createPackage.form.descriptionPlaceholder')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">{t('admin.packages.createPackage.form.price')}</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="period">{t('admin.packages.createPackage.form.period')}</Label>
              <select
                id="period"
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value={t('admin.packages.createPackage.form.periodOptions.month')}>{t('admin.packages.createPackage.form.periodOptions.month')}</option>
                <option value={t('admin.packages.createPackage.form.periodOptions.year')}>{t('admin.packages.createPackage.form.periodOptions.year')}</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="popular"
                checked={formData.popular}
                onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
              />
              <Label htmlFor="popular">{t('admin.packages.createPackage.form.popularPackage')}</Label>
            </div>
          </div>

          <div>
            <Label>{t('admin.packages.createPackage.form.features')}</Label>
            {formData.features.map((feature, index) => (
              <div key={index} className="flex gap-2 mt-2">
                <Input
                  value={feature}
                  onChange={(e) => updateFeature(index, e.target.value)}
                  placeholder={t('admin.packages.createPackage.form.featurePlaceholder')}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeFeature(index)}
                  disabled={formData.features.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addFeature}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-1" />
              {t('admin.packages.createPackage.form.addFeature')}
            </Button>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={handleClose}>
            {t('admin.packages.createPackage.buttons.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-[#E60000] hover:bg-red-700"
          >
            {editingPackage ? t('admin.packages.createPackage.buttons.update') : t('admin.packages.createPackage.buttons.create')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
