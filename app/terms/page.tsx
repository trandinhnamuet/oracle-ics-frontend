import { Metadata } from 'next'
import { cookies } from 'next/headers'
import { getPublicTermsSections, PublicTermsSection } from '@/api/terms.api'

export const metadata: Metadata = {
  title: 'Điều khoản sử dụng dịch vụ | OracleCloud Vietnam',
  description: 'Điều khoản sử dụng dịch vụ OracleCloud Vietnam - Managed Oracle Cloud & VPS',
}

export default async function TermsPage() {
  let sections: PublicTermsSection[] = []
  let loadError = ''
  const lang = cookies().get('language')?.value || 'vi'
  const isVietnamese = lang === 'vi'

  try {
    sections = await getPublicTermsSections(lang)
  } catch (error: any) {
    loadError = error?.message || 'Không thể tải nội dung điều khoản.'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <div className="bg-[#E60000] text-white py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            {isVietnamese ? 'ĐIỀU KHOẢN SỬ DỤNG DỊCH VỤ' : 'TERMS OF SERVICE'}
          </h1>
          <p className="text-lg opacity-90 font-medium">ORACLECLOUD VIETNAM</p>
          <p className="text-sm opacity-75 mt-1">(Terms of Service - Managed Oracle Cloud & VPS)</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-8 text-sm text-amber-800">
          <strong>{isVietnamese ? 'Lưu ý quan trọng:' : 'Important notice:'}</strong>{' '}
          {isVietnamese
            ? 'Bằng việc đăng ký, thanh toán hoặc sử dụng bất kỳ dịch vụ nào của OracleCloud Vietnam, bạn xác nhận đã đọc, hiểu và đồng ý bị ràng buộc bởi toàn bộ nội dung Điều khoản này.'
            : 'By registering, paying, or using any OracleCloud Vietnam service, you confirm that you have read, understood, and agreed to be bound by these Terms.'}
        </div>

        {loadError ? (
          <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg p-4 text-sm mb-6">
            {loadError}
          </div>
        ) : null}

        {sections.map((section) => (
          <div key={section.id} className="mb-10">
            <div className="bg-gray-800 dark:bg-muted text-white rounded-lg px-5 py-3 mb-6">
              <h2 className="text-base font-semibold tracking-wide">{section.title}</h2>
            </div>

            <div className="space-y-6">
              {section.articles?.map((article) => (
                <div key={`${section.id}-${article.number}`} className="bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-border shadow-sm p-6">
                  <h3 className="text-base font-bold text-gray-900 dark:text-foreground mb-3">
                    {isVietnamese ? 'Điều' : 'Article'} {article.number}. {article.heading}
                  </h3>
                  <div className="space-y-2">
                    {article.paragraphs?.map((paragraph: string, idx: number) => (
                      <p key={idx} className="text-sm text-gray-700 dark:text-muted-foreground leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {!loadError && sections.length === 0 ? (
          <div className="bg-white dark:bg-card rounded-lg border p-6 text-sm text-muted-foreground">
            {isVietnamese
              ? 'Chưa có nội dung điều khoản nào được cấu hình.'
              : 'No terms content has been configured yet.'}
          </div>
        ) : null}

        <div className="bg-gray-100 dark:bg-muted rounded-lg p-6 text-center text-sm text-gray-500 dark:text-muted-foreground mt-8">
          <p className="font-medium text-gray-700 dark:text-foreground mb-1">OracleCloud Vietnam</p>
          <p>
            Website:{' '}
            <a href="https://oraclecloud.vn" className="text-[#E60000] hover:underline">
              https://oraclecloud.vn
            </a>
          </p>
          <p className="mt-2">
            {isVietnamese
              ? 'Tài liệu này có hiệu lực kể từ ngày được công bố và có thể được cập nhật theo thời gian.'
              : 'This document is effective from its publication date and may be updated over time.'}
          </p>
        </div>
      </div>
    </div>
  )
}
