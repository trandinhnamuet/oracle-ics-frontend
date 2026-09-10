import { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import {
  Home,
  Cloud,
  CreditCard,
  LifeBuoy,
  UserCircle,
  ScrollText,
  ExternalLink,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sơ đồ website | OracleCloud Vietnam',
  description:
    'Sơ đồ website OracleCloud Vietnam - danh mục đầy đủ các trang dịch vụ, thanh toán, hỗ trợ và pháp lý.',
}

interface SiteLink {
  href: string
  label: string
  note?: string
  external?: boolean
}

interface SiteGroup {
  icon: React.ComponentType<{ className?: string }>
  title: string
  links: SiteLink[]
}

const VI_GROUPS: SiteGroup[] = [
  {
    icon: Home,
    title: 'Trang chủ',
    links: [
      { href: '/', label: 'Trang chủ', note: 'Giới thiệu tổng quan về Oracle Cloud Vietnam' },
      { href: '/?scroll=services', label: 'Dịch vụ', note: 'Danh mục dịch vụ Oracle Cloud và VPS' },
      { href: '/cloud/pricing', label: 'Bảng giá', note: 'Các gói dịch vụ và mức giá tham khảo' },
      { href: '/?scroll=support', label: 'Hỗ trợ', note: 'Kênh hỗ trợ và cam kết vận hành' },
      { href: '/contact-info', label: 'Liên hệ', note: 'Thông tin liên hệ và yêu cầu tư vấn' },
    ],
  },
  {
    icon: Cloud,
    title: 'Dịch vụ Cloud',
    links: [
      { href: '/cloud/pricing', label: 'Bảng giá dịch vụ Cloud', note: 'So sánh và lựa chọn gói phù hợp' },
      { href: '/package-management', label: 'Cloud của tôi', note: 'Quản lý các gói dịch vụ đang sử dụng' },
    ],
  },
  {
    icon: CreditCard,
    title: 'Thanh toán và đơn hàng',
    links: [
      { href: '/checkout', label: 'Thanh toán đơn hàng', note: 'Hoàn tất đặt mua dịch vụ' },
      { href: '/checkout/subscription', label: 'Đăng ký gói dịch vụ', note: 'Khởi tạo gói thuê bao mới' },
      { href: '/checkout/history', label: 'Lịch sử giao dịch', note: 'Tra cứu đơn hàng và hóa đơn đã phát hành' },
      { href: '/add-funds', label: 'Nạp tiền vào tài khoản', note: 'Nạp số dư để gia hạn và mua thêm tài nguyên' },
    ],
  },
  {
    icon: UserCircle,
    title: 'Tài khoản',
    links: [
      { href: '/login', label: 'Đăng nhập' },
      { href: '/register', label: 'Đăng ký tài khoản' },
      { href: '/verify-otp', label: 'Xác thực OTP', note: 'Xác thực mã gửi tới email hoặc số điện thoại' },
      { href: '/login/forgot-password', label: 'Quên mật khẩu', note: 'Khôi phục quyền truy cập tài khoản' },
      { href: '/profile', label: 'Thông tin cá nhân', note: 'Cập nhật hồ sơ, mật khẩu và thông tin hóa đơn' },
    ],
  },
  {
    icon: LifeBuoy,
    title: 'Hỗ trợ',
    links: [
      { href: '/support', label: 'Yêu cầu hỗ trợ', note: 'Tạo và theo dõi ticket kỹ thuật' },
      { href: '/contact-info', label: 'Thông tin liên hệ', note: 'Hotline 0707.806.860 - contact@ics.vn' },
    ],
  },
  {
    icon: ScrollText,
    title: 'Pháp lý và cam kết',
    links: [
      { href: '/terms', label: 'Điều khoản sử dụng', note: 'Quyền và nghĩa vụ khi sử dụng dịch vụ' },
      { href: '/privacy', label: 'Chính sách bảo mật', note: 'Cách chúng tôi thu thập và bảo vệ dữ liệu' },
      { href: '/sla', label: 'Cam kết chất lượng dịch vụ (SLA)', note: 'Mức uptime, thời gian phản hồi và bù trừ' },
      { href: '/sitemap', label: 'Sơ đồ website', note: 'Trang bạn đang xem' },
    ],
  },
]

const EN_GROUPS: SiteGroup[] = [
  {
    icon: Home,
    title: 'Home',
    links: [
      { href: '/', label: 'Home', note: 'Overview of Oracle Cloud Vietnam' },
      { href: '/?scroll=services', label: 'Services', note: 'Oracle Cloud and VPS service catalogue' },
      { href: '/cloud/pricing', label: 'Pricing', note: 'Plans and indicative pricing' },
      { href: '/?scroll=support', label: 'Support', note: 'Support channels and operational commitments' },
      { href: '/contact-info', label: 'Contact', note: 'Contact details and consultation requests' },
    ],
  },
  {
    icon: Cloud,
    title: 'Cloud services',
    links: [
      { href: '/cloud/pricing', label: 'Cloud pricing', note: 'Compare and choose a plan' },
      { href: '/package-management', label: 'My Cloud', note: 'Manage your active subscriptions' },
    ],
  },
  {
    icon: CreditCard,
    title: 'Billing and orders',
    links: [
      { href: '/checkout', label: 'Checkout', note: 'Complete a service purchase' },
      { href: '/checkout/subscription', label: 'Subscribe to a plan', note: 'Start a new subscription' },
      { href: '/checkout/history', label: 'Transaction history', note: 'Look up orders and issued invoices' },
      { href: '/add-funds', label: 'Add funds', note: 'Top up your balance for renewals and add-ons' },
    ],
  },
  {
    icon: UserCircle,
    title: 'Account',
    links: [
      { href: '/login', label: 'Sign in' },
      { href: '/register', label: 'Create an account' },
      { href: '/verify-otp', label: 'OTP verification', note: 'Verify the code sent to your email or phone' },
      { href: '/login/forgot-password', label: 'Forgot password', note: 'Recover access to your account' },
      { href: '/profile', label: 'Profile', note: 'Update your details, password and billing information' },
    ],
  },
  {
    icon: LifeBuoy,
    title: 'Support',
    links: [
      { href: '/support', label: 'Support requests', note: 'Create and track technical tickets' },
      { href: '/contact-info', label: 'Contact information', note: 'Hotline 0707.806.860 - contact@ics.vn' },
    ],
  },
  {
    icon: ScrollText,
    title: 'Legal and commitments',
    links: [
      { href: '/terms', label: 'Terms of Service', note: 'Rights and obligations when using the services' },
      { href: '/privacy', label: 'Privacy Policy', note: 'How we collect and protect your data' },
      { href: '/sla', label: 'Service Level Agreement (SLA)', note: 'Uptime, response times and service credits' },
      { href: '/sitemap', label: 'Sitemap', note: 'The page you are viewing' },
    ],
  },
]

export default function SitemapPage() {
  const lang = cookies().get('language')?.value || 'vi'
  const isVietnamese = lang === 'vi'
  const groups = isVietnamese ? VI_GROUPS : EN_GROUPS

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <div className="bg-[#E60000] text-white py-12">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            {isVietnamese ? 'SƠ ĐỒ WEBSITE' : 'SITEMAP'}
          </h1>
          <p className="text-lg opacity-90 font-medium">ORACLECLOUD VIETNAM</p>
          <p className="text-sm opacity-75 mt-1">
            {isVietnamese
              ? 'Toàn bộ các trang của cổng dịch vụ, sắp xếp theo nhóm chức năng'
              : 'Every page of the service portal, organised by function'}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-2 gap-6">
          {groups.map((group) => {
            const Icon = group.icon
            return (
              <div
                key={group.title}
                className="bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-border shadow-sm p-6"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-[#E60000] p-2 rounded-lg">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-foreground">{group.title}</h2>
                </div>

                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={`${group.title}-${link.href}-${link.label}`}>
                      <Link
                        href={link.href}
                        className="text-sm font-medium text-gray-900 dark:text-foreground hover:text-[#E60000] transition-colors inline-flex items-center gap-1"
                      >
                        {link.label}
                        {link.external ? <ExternalLink className="h-3 w-3" /> : null}
                      </Link>
                      {link.note ? (
                        <p className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5 leading-relaxed">
                          {link.note}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

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
              ? 'Một số trang yêu cầu đăng nhập để truy cập. Nếu không tìm thấy nội dung cần thiết, vui lòng liên hệ hotline 0707.806.860.'
              : 'Some pages require sign-in. If you cannot find what you need, please call the hotline 0707.806.860.'}
          </p>
        </div>
      </div>
    </div>
  )
}
