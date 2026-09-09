import React from 'react'

export interface LegalArticle {
  number: string
  heading: string
  paragraphs: string[]
}

export interface LegalSection {
  title: string
  articles: LegalArticle[]
}

interface LegalPageShellProps {
  title: string
  subtitle?: string
  notice?: React.ReactNode
  sections: LegalSection[]
  articleLabel: string
  effectiveNote: string
  children?: React.ReactNode
}

/**
 * Khung trình bày dùng chung cho các trang pháp lý (điều khoản, chính sách bảo mật, SLA).
 * Giữ đúng bố cục/màu sắc của trang /terms để các trang nhìn thống nhất.
 */
export function LegalPageShell({
  title,
  subtitle,
  notice,
  sections,
  articleLabel,
  effectiveNote,
  children,
}: LegalPageShellProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <div className="bg-[#E60000] text-white py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{title}</h1>
          <p className="text-lg opacity-90 font-medium">ORACLECLOUD VIETNAM</p>
          {subtitle ? <p className="text-sm opacity-75 mt-1">{subtitle}</p> : null}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {notice ? (
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-8 text-sm text-amber-800">
            {notice}
          </div>
        ) : null}

        {sections.map((section) => (
          <div key={section.title} className="mb-10">
            <div className="bg-gray-800 dark:bg-muted text-white rounded-lg px-5 py-3 mb-6">
              <h2 className="text-base font-semibold tracking-wide">{section.title}</h2>
            </div>

            <div className="space-y-6">
              {section.articles.map((article) => (
                <div
                  key={`${section.title}-${article.number}`}
                  className="bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-border shadow-sm p-6"
                >
                  <h3 className="text-base font-bold text-gray-900 dark:text-foreground mb-3">
                    {articleLabel} {article.number}. {article.heading}
                  </h3>
                  <div className="space-y-2">
                    {article.paragraphs.map((paragraph, idx) => (
                      <p
                        key={idx}
                        className="text-sm text-gray-700 dark:text-muted-foreground leading-relaxed"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {children}

        <div className="bg-gray-100 dark:bg-muted rounded-lg p-6 text-center text-sm text-gray-500 dark:text-muted-foreground mt-8">
          <p className="font-medium text-gray-700 dark:text-foreground mb-1">OracleCloud Vietnam</p>
          <p>
            Website:{' '}
            <a href="https://oraclecloud.vn" className="text-[#E60000] hover:underline">
              https://oraclecloud.vn
            </a>
          </p>
          <p className="mt-2">{effectiveNote}</p>
        </div>
      </div>
    </div>
  )
}
