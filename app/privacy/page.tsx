import { Metadata } from 'next'
import { cookies } from 'next/headers'
import { LegalPageShell, LegalSection } from '@/components/legal/legal-page-shell'

export const metadata: Metadata = {
  title: 'Chính sách bảo mật | OracleCloud Vietnam',
  description:
    'Chính sách bảo mật và bảo vệ dữ liệu cá nhân của OracleCloud Vietnam - Managed Oracle Cloud & VPS',
}

const VI_SECTIONS: LegalSection[] = [
  {
    title: 'PHẦN I. PHẠM VI VÀ NGUYÊN TẮC',
    articles: [
      {
        number: '1',
        heading: 'Phạm vi áp dụng',
        paragraphs: [
          'Chính sách này áp dụng cho toàn bộ dữ liệu mà OracleCloud Vietnam (do Công ty Cổ phần An ninh mạng Quốc tế - ICS vận hành) thu thập và xử lý khi Khách hàng truy cập website oraclecloud.vn, đăng ký tài khoản, mua và sử dụng các dịch vụ Managed Oracle Cloud, VPS, tư vấn và hỗ trợ kỹ thuật.',
          'Chính sách này được xây dựng phù hợp với Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân, Luật An toàn thông tin mạng và Luật An ninh mạng của Việt Nam, đồng thời kế thừa các cam kết bảo mật và quyền riêng tư mà Oracle áp dụng cho hạ tầng Oracle Cloud Infrastructure (OCI).',
          'Khi sử dụng dịch vụ, Khách hàng xác nhận đã đọc và đồng ý với nội dung Chính sách này. Nếu không đồng ý, Khách hàng vui lòng ngừng sử dụng dịch vụ và liên hệ với chúng tôi để được hỗ trợ.',
        ],
      },
      {
        number: '2',
        heading: 'Nguyên tắc xử lý dữ liệu',
        paragraphs: [
          'Hợp pháp và minh bạch: dữ liệu chỉ được thu thập khi có cơ sở pháp lý rõ ràng (sự đồng ý của Khách hàng, thực hiện hợp đồng dịch vụ, hoặc nghĩa vụ pháp luật) và Khách hàng luôn được thông báo về mục đích xử lý.',
          'Tối thiểu hóa: chúng tôi chỉ thu thập lượng dữ liệu tối thiểu cần thiết để cung cấp và duy trì dịch vụ.',
          'Giới hạn mục đích: dữ liệu không được sử dụng cho mục đích khác với mục đích đã thông báo mà không có sự đồng ý bổ sung của Khách hàng.',
          'Chính xác và cập nhật: Khách hàng có thể chỉnh sửa thông tin của mình bất kỳ lúc nào trong trang Thông tin cá nhân.',
          'Bảo mật mặc định: mọi dữ liệu được bảo vệ bằng các biện pháp kỹ thuật và tổ chức tương ứng với mức độ rủi ro.',
        ],
      },
    ],
  },
  {
    title: 'PHẦN II. DỮ LIỆU THU THẬP VÀ MỤC ĐÍCH SỬ DỤNG',
    articles: [
      {
        number: '3',
        heading: 'Các loại dữ liệu được thu thập',
        paragraphs: [
          'Dữ liệu định danh và liên hệ: họ tên, địa chỉ email, số điện thoại, tên tổ chức, mã số thuế, địa chỉ xuất hóa đơn - dùng để tạo tài khoản, xác thực danh tính và phát hành chứng từ.',
          'Dữ liệu tài khoản và xác thực: tên đăng nhập, mật khẩu ở dạng băm (hash) một chiều, mã OTP, lịch sử đăng nhập kèm địa chỉ IP, thiết bị và thời điểm truy cập - dùng để bảo vệ tài khoản và phát hiện truy cập bất thường.',
          'Dữ liệu giao dịch và thanh toán: gói dịch vụ đã mua, chu kỳ thanh toán, lịch sử nạp tiền, hóa đơn. Chúng tôi KHÔNG lưu trữ số thẻ đầy đủ hay mã CVV; các giao dịch thẻ và chuyển khoản được xử lý qua cổng thanh toán và ngân hàng đối tác.',
          'Dữ liệu vận hành hạ tầng: cấu hình máy chủ, region, tài nguyên đã cấp phát, log truy cập và log hệ thống - dùng để cấp phát, giám sát và khắc phục sự cố.',
          'Dữ liệu hỗ trợ: nội dung yêu cầu hỗ trợ, tệp đính kèm và lịch sử trao đổi với đội kỹ thuật.',
          'Dữ liệu sử dụng website: cookie, trang đã xem, nguồn truy cập và các số liệu phân tích ẩn danh nhằm cải thiện trải nghiệm.',
        ],
      },
      {
        number: '4',
        heading: 'Mục đích sử dụng',
        paragraphs: [
          'Cung cấp, cấp phát, cấu hình và duy trì dịch vụ theo đúng đơn hàng của Khách hàng.',
          'Xác thực người dùng, quản lý phiên đăng nhập và bảo vệ tài khoản khỏi truy cập trái phép.',
          'Xử lý thanh toán, đối soát công nợ, phát hành hóa đơn và thực hiện nghĩa vụ thuế.',
          'Tiếp nhận và xử lý yêu cầu hỗ trợ kỹ thuật, sự cố, yêu cầu nâng hoặc hạ cấp tài nguyên.',
          'Gửi thông báo vận hành bắt buộc: cảnh báo bảo mật, thông báo bảo trì, thông báo hết hạn dịch vụ.',
          'Gửi thông tin khuyến mại và bản tin - chỉ khi Khách hàng đã đồng ý, và có thể hủy nhận bất kỳ lúc nào.',
          'Phân tích, thống kê nội bộ và cải thiện chất lượng dịch vụ trên dữ liệu đã tổng hợp hoặc ẩn danh.',
        ],
      },
    ],
  },
  {
    title: 'PHẦN III. BẢO MẬT, CHIA SẺ VÀ LƯU TRỮ',
    articles: [
      {
        number: '5',
        heading: 'Biện pháp bảo mật',
        paragraphs: [
          'Mã hóa đường truyền: toàn bộ kết nối tới website và cổng quản trị được bảo vệ bằng TLS. Dữ liệu lưu trữ trên hạ tầng OCI được mã hóa khi lưu trữ (encryption at rest) theo mặc định của Oracle Cloud Infrastructure.',
          'Kiểm soát truy cập: áp dụng nguyên tắc đặc quyền tối thiểu (least privilege) và phân tách vai trò. Chỉ nhân sự được phân quyền mới truy cập được dữ liệu Khách hàng, và mọi truy cập đều được ghi log.',
          'Xác thực nhiều lớp: hỗ trợ xác thực OTP cho các thao tác quan trọng; mật khẩu được lưu ở dạng băm cùng salt, không thể phục hồi về dạng gốc.',
          'Cách ly hạ tầng: môi trường của mỗi Khách hàng được cách ly logic trong tenancy hoặc compartment riêng, hạn chế rủi ro ảnh hưởng chéo.',
          'Giám sát và sao lưu: hệ thống được giám sát liên tục; dữ liệu cấu hình và cơ sở dữ liệu dịch vụ được sao lưu định kỳ và kiểm tra khả năng phục hồi.',
          'Kiểm thử an toàn: định kỳ thực hiện đánh giá mã nguồn và kiểm thử xâm nhập (pentest) đối với các thành phần đối diện Internet.',
        ],
      },
      {
        number: '6',
        heading: 'Chia sẻ dữ liệu với bên thứ ba',
        paragraphs: [
          'Chúng tôi KHÔNG bán, KHÔNG cho thuê và KHÔNG trao đổi dữ liệu cá nhân của Khách hàng cho mục đích thương mại.',
          'Dữ liệu chỉ được chia sẻ trong các trường hợp cần thiết sau: (i) với Oracle Corporation và các đơn vị vận hành hạ tầng Oracle Cloud Infrastructure ở mức tối thiểu để cấp phát và duy trì tài nguyên; (ii) với cổng thanh toán và ngân hàng để xử lý giao dịch; (iii) với đơn vị cung cấp dịch vụ kế toán, hóa đơn điện tử để thực hiện nghĩa vụ chứng từ; (iv) với cơ quan nhà nước có thẩm quyền khi có yêu cầu hợp pháp bằng văn bản.',
          'Mọi bên thứ ba nhận dữ liệu đều bị ràng buộc bởi nghĩa vụ bảo mật và chỉ được xử lý dữ liệu trong phạm vi mục đích đã xác định.',
        ],
      },
      {
        number: '7',
        heading: 'Vị trí lưu trữ và thời hạn lưu trữ',
        paragraphs: [
          'Dữ liệu vận hành của dịch vụ được lưu trữ trên hạ tầng Oracle Cloud Infrastructure tại region mà Khách hàng lựa chọn khi khởi tạo dịch vụ. Khách hàng chủ động quyết định region để đáp ứng yêu cầu về chủ quyền dữ liệu của mình.',
          'Dữ liệu tài khoản và hồ sơ Khách hàng được lưu trong suốt thời gian Khách hàng sử dụng dịch vụ.',
          'Sau khi chấm dứt dịch vụ, dữ liệu tài khoản được lưu tối đa 12 tháng để phục vụ đối soát, giải quyết tranh chấp và tái kích hoạt nếu Khách hàng có yêu cầu, sau đó sẽ được xóa hoặc ẩn danh hóa.',
          'Chứng từ tài chính - kế toán được lưu trữ theo thời hạn bắt buộc của pháp luật kế toán và thuế Việt Nam.',
          'Log bảo mật và log truy cập được lưu tối thiểu 12 tháng theo yêu cầu của pháp luật về an toàn thông tin.',
        ],
      },
    ],
  },
  {
    title: 'PHẦN IV. QUYỀN CỦA KHÁCH HÀNG',
    articles: [
      {
        number: '8',
        heading: 'Các quyền đối với dữ liệu cá nhân',
        paragraphs: [
          'Quyền được biết: Khách hàng được thông báo về việc dữ liệu của mình được xử lý như thế nào và vì mục đích gì.',
          'Quyền truy cập và chỉnh sửa: Khách hàng có thể xem và cập nhật thông tin cá nhân trong trang Thông tin cá nhân, hoặc yêu cầu chúng tôi hỗ trợ chỉnh sửa.',
          'Quyền rút lại sự đồng ý: Khách hàng có thể rút lại sự đồng ý đối với các hoạt động xử lý dựa trên sự đồng ý (ví dụ nhận email marketing) mà không ảnh hưởng tới tính hợp pháp của việc xử lý trước đó.',
          'Quyền xóa dữ liệu: Khách hàng có thể yêu cầu xóa dữ liệu cá nhân, trừ phần dữ liệu mà chúng tôi có nghĩa vụ pháp luật phải lưu giữ (chứng từ kế toán, log bảo mật).',
          'Quyền phản đối và hạn chế xử lý: Khách hàng có thể yêu cầu hạn chế việc xử lý dữ liệu trong các trường hợp pháp luật cho phép.',
          'Quyền khiếu nại: Khách hàng có thể khiếu nại tới chúng tôi hoặc tới cơ quan nhà nước có thẩm quyền nếu cho rằng dữ liệu của mình bị xử lý không đúng quy định.',
        ],
      },
      {
        number: '9',
        heading: 'Cách thực hiện quyền và thời gian phản hồi',
        paragraphs: [
          'Khách hàng gửi yêu cầu qua email contact@ics.vn, hotline 0707.806.860, hoặc tạo yêu cầu hỗ trợ trong trang quản trị.',
          'Chúng tôi xác minh danh tính người yêu cầu trước khi thực hiện, nhằm tránh việc dữ liệu bị truy cập hoặc xóa bởi người không có thẩm quyền.',
          'Thời gian phản hồi: tối đa 72 giờ làm việc kể từ khi xác minh thành công đối với yêu cầu truy cập hoặc chỉnh sửa, và tối đa 30 ngày đối với yêu cầu xóa dữ liệu do cần rà soát nghĩa vụ lưu trữ.',
        ],
      },
      {
        number: '10',
        heading: 'Cookie và công cụ phân tích',
        paragraphs: [
          'Website sử dụng cookie kỹ thuật để duy trì phiên đăng nhập, ghi nhớ ngôn ngữ và giao diện. Đây là cookie thiết yếu, nếu bị vô hiệu hóa một số chức năng sẽ không hoạt động đúng.',
          'Website sử dụng cookie phân tích để đo lường lưu lượng và hành vi sử dụng ở dạng tổng hợp, phục vụ việc cải thiện sản phẩm.',
          'Khách hàng có thể chặn hoặc xóa cookie trong cài đặt trình duyệt bất kỳ lúc nào.',
        ],
      },
    ],
  },
  {
    title: 'PHẦN V. SỰ CỐ, THAY ĐỔI VÀ LIÊN HỆ',
    articles: [
      {
        number: '11',
        heading: 'Xử lý sự cố dữ liệu',
        paragraphs: [
          'Trường hợp phát hiện sự cố làm lộ, mất hoặc thay đổi trái phép dữ liệu cá nhân, chúng tôi sẽ lập tức khoanh vùng, xử lý và điều tra nguyên nhân.',
          'Chúng tôi thông báo cho Khách hàng bị ảnh hưởng và cơ quan có thẩm quyền trong thời hạn 72 giờ kể từ khi xác định được sự cố, kèm theo mô tả phạm vi ảnh hưởng và biện pháp khắc phục.',
          'Sau sự cố, chúng tôi thực hiện đánh giá lại quy trình và bổ sung biện pháp kiểm soát để ngăn tái diễn.',
        ],
      },
      {
        number: '12',
        heading: 'Thay đổi chính sách',
        paragraphs: [
          'Chính sách này có thể được cập nhật để phù hợp với thay đổi của pháp luật, hạ tầng Oracle Cloud hoặc phạm vi dịch vụ.',
          'Bản cập nhật được công bố tại trang này. Với các thay đổi có ảnh hưởng đáng kể tới quyền của Khách hàng, chúng tôi sẽ thông báo trước tối thiểu 15 ngày qua email hoặc thông báo trong trang quản trị.',
        ],
      },
      {
        number: '13',
        heading: 'Thông tin liên hệ',
        paragraphs: [
          'Đơn vị kiểm soát và xử lý dữ liệu: CÔNG TY CỔ PHẦN AN NINH MẠNG QUỐC TẾ - ICS.',
          'Địa chỉ: TT3-5 Khu đô thị Đại Kim mới, Định Công, Hà Nội.',
          'Email: contact@ics.vn | Điện thoại: 0931.487.231 | Hotline: 0707.806.860.',
          'Mọi thắc mắc liên quan tới quyền riêng tư và dữ liệu cá nhân, vui lòng ghi rõ tiêu đề "Yêu cầu về dữ liệu cá nhân" để được ưu tiên xử lý.',
        ],
      },
    ],
  },
]

const EN_SECTIONS: LegalSection[] = [
  {
    title: 'PART I. SCOPE AND PRINCIPLES',
    articles: [
      {
        number: '1',
        heading: 'Scope',
        paragraphs: [
          'This policy covers all data that OracleCloud Vietnam (operated by International Cyber Security JSC - ICS) collects and processes when a Customer visits oraclecloud.vn, registers an account, purchases or uses Managed Oracle Cloud, VPS, consulting and technical support services.',
          'The policy is aligned with Decree 13/2023/ND-CP on personal data protection, the Law on Cyber Information Security and the Law on Cybersecurity of Vietnam, and inherits the security and privacy commitments that Oracle applies to Oracle Cloud Infrastructure (OCI).',
          'By using the services, the Customer confirms having read and agreed to this policy. If you do not agree, please stop using the services and contact us for assistance.',
        ],
      },
      {
        number: '2',
        heading: 'Data processing principles',
        paragraphs: [
          'Lawfulness and transparency: data is collected only on a clear legal basis (Customer consent, performance of the service contract, or a legal obligation) and the Customer is always informed of the purpose.',
          'Data minimisation: we collect only the minimum data required to deliver and maintain the services.',
          'Purpose limitation: data is not used for purposes other than those notified without additional consent.',
          'Accuracy: the Customer may correct their information at any time in the Profile page.',
          'Security by default: all data is protected by technical and organisational measures proportionate to the risk.',
        ],
      },
    ],
  },
  {
    title: 'PART II. DATA COLLECTED AND PURPOSES',
    articles: [
      {
        number: '3',
        heading: 'Categories of data',
        paragraphs: [
          'Identity and contact data: full name, email, phone number, organisation name, tax code, billing address - used to create accounts, verify identity and issue invoices.',
          'Account and authentication data: username, one-way hashed password, OTP codes, login history including IP address, device and timestamp - used to protect the account and detect abnormal access.',
          'Transaction and payment data: purchased plans, billing cycle, top-up history, invoices. We do NOT store full card numbers or CVV codes; card and bank transfers are handled by partner payment gateways and banks.',
          'Infrastructure operation data: server configuration, region, allocated resources, access and system logs - used to provision, monitor and troubleshoot.',
          'Support data: support request content, attachments and correspondence with our engineers.',
          'Website usage data: cookies, pages viewed, referral source and anonymised analytics used to improve the experience.',
        ],
      },
      {
        number: '4',
        heading: 'Purposes of use',
        paragraphs: [
          'Provisioning, configuring and maintaining services according to the Customer order.',
          'Authenticating users, managing sessions and protecting accounts from unauthorised access.',
          'Processing payments, reconciling balances, issuing invoices and meeting tax obligations.',
          'Receiving and handling technical support requests, incidents and resource upgrade or downgrade requests.',
          'Sending mandatory operational notices: security alerts, maintenance windows and service expiry reminders.',
          'Sending promotional information and newsletters - only with the Customer consent, revocable at any time.',
          'Internal analytics and service improvement based on aggregated or anonymised data.',
        ],
      },
    ],
  },
  {
    title: 'PART III. SECURITY, SHARING AND RETENTION',
    articles: [
      {
        number: '5',
        heading: 'Security measures',
        paragraphs: [
          'Encryption in transit: all connections to the website and management console are protected by TLS. Data stored on OCI is encrypted at rest by Oracle Cloud Infrastructure default.',
          'Access control: least-privilege and role separation are enforced. Only authorised personnel can access Customer data, and every access is logged.',
          'Layered authentication: OTP verification is supported for sensitive operations; passwords are stored salted and hashed and cannot be reversed.',
          'Infrastructure isolation: each Customer environment is logically isolated in its own tenancy or compartment to limit cross-impact.',
          'Monitoring and backup: systems are continuously monitored; service configuration and databases are backed up periodically and restore capability is tested.',
          'Security testing: source code reviews and penetration tests are performed periodically on Internet-facing components.',
        ],
      },
      {
        number: '6',
        heading: 'Sharing with third parties',
        paragraphs: [
          'We do NOT sell, rent or trade Customer personal data for commercial purposes.',
          'Data is shared only where necessary: (i) with Oracle Corporation and Oracle Cloud Infrastructure operators, to the minimum extent needed to provision and maintain resources; (ii) with payment gateways and banks to process transactions; (iii) with accounting and e-invoice providers to meet documentation obligations; (iv) with competent state authorities upon a lawful written request.',
          'Every third-party recipient is bound by confidentiality obligations and may process the data only within the defined purpose.',
        ],
      },
      {
        number: '7',
        heading: 'Storage location and retention',
        paragraphs: [
          'Service operational data is stored on Oracle Cloud Infrastructure in the region the Customer selects at provisioning time, so the Customer controls their own data sovereignty requirements.',
          'Account and Customer profile data is retained for the duration of the service relationship.',
          'After termination, account data is retained for up to 12 months for reconciliation, dispute resolution and reactivation on request, then deleted or anonymised.',
          'Financial and accounting records are retained for the periods mandated by Vietnamese accounting and tax law.',
          'Security and access logs are retained for at least 12 months as required by information security regulations.',
        ],
      },
    ],
  },
  {
    title: 'PART IV. CUSTOMER RIGHTS',
    articles: [
      {
        number: '8',
        heading: 'Rights over personal data',
        paragraphs: [
          'Right to be informed about how and why your data is processed.',
          'Right of access and rectification: view and update your data in the Profile page, or ask us to correct it.',
          'Right to withdraw consent for consent-based processing (for example marketing email), without affecting the lawfulness of prior processing.',
          'Right to erasure, except for data we are legally required to retain (accounting records, security logs).',
          'Right to object to and restrict processing where the law permits.',
          'Right to complain to us or to the competent authority if you believe your data has been mishandled.',
        ],
      },
      {
        number: '9',
        heading: 'How to exercise rights and response times',
        paragraphs: [
          'Send your request to contact@ics.vn, call the hotline 0707.806.860, or open a support request in the console.',
          'We verify the requester identity before acting, to prevent data being accessed or deleted by an unauthorised party.',
          'Response times: up to 72 working hours after successful verification for access and rectification requests, and up to 30 days for erasure requests, which require a retention-obligation review.',
        ],
      },
      {
        number: '10',
        heading: 'Cookies and analytics',
        paragraphs: [
          'The website uses technical cookies to keep your session, language and theme preferences. These are essential; disabling them breaks some functionality.',
          'Analytics cookies measure aggregated traffic and usage behaviour to improve the product.',
          'You may block or delete cookies in your browser settings at any time.',
        ],
      },
    ],
  },
  {
    title: 'PART V. INCIDENTS, CHANGES AND CONTACT',
    articles: [
      {
        number: '11',
        heading: 'Data incident handling',
        paragraphs: [
          'If an incident causes personal data to be disclosed, lost or altered without authorisation, we immediately contain it, remediate and investigate the root cause.',
          'We notify affected Customers and the competent authority within 72 hours of confirming the incident, including the scope of impact and remediation measures.',
          'After the incident we reassess our processes and add controls to prevent recurrence.',
        ],
      },
      {
        number: '12',
        heading: 'Policy changes',
        paragraphs: [
          'This policy may be updated to reflect changes in law, in Oracle Cloud infrastructure, or in our service scope.',
          'Updates are published on this page. For changes that materially affect Customer rights we give at least 15 days prior notice by email or in-console notification.',
        ],
      },
      {
        number: '13',
        heading: 'Contact',
        paragraphs: [
          'Data controller and processor: INTERNATIONAL CYBER SECURITY JSC - ICS.',
          'Address: TT3-5 Dai Kim Moi Urban Area, Dinh Cong, Hanoi, Vietnam.',
          'Email: contact@ics.vn | Phone: 0931.487.231 | Hotline: 0707.806.860.',
          'For privacy and personal data enquiries, please use the subject line "Personal data request" for priority handling.',
        ],
      },
    ],
  },
]

export default function PrivacyPage() {
  const lang = cookies().get('language')?.value || 'vi'
  const isVietnamese = lang === 'vi'

  return (
    <LegalPageShell
      title={isVietnamese ? 'CHÍNH SÁCH BẢO MẬT' : 'PRIVACY POLICY'}
      subtitle="(Privacy & Personal Data Protection Policy)"
      articleLabel={isVietnamese ? 'Điều' : 'Article'}
      notice={
        <>
          <strong>{isVietnamese ? 'Cam kết của chúng tôi:' : 'Our commitment:'}</strong>{' '}
          {isVietnamese
            ? 'OracleCloud Vietnam không bán, không cho thuê và không trao đổi dữ liệu cá nhân của Khách hàng. Dữ liệu chỉ được sử dụng để cung cấp dịch vụ và thực hiện nghĩa vụ pháp luật.'
            : 'OracleCloud Vietnam never sells, rents or trades Customer personal data. Data is used only to deliver the services and to meet legal obligations.'}
        </>
      }
      sections={isVietnamese ? VI_SECTIONS : EN_SECTIONS}
      effectiveNote={
        isVietnamese
          ? 'Tài liệu này có hiệu lực kể từ ngày được công bố và có thể được cập nhật theo thời gian.'
          : 'This document is effective from its publication date and may be updated over time.'
      }
    />
  )
}
