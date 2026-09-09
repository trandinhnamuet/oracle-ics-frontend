import { Metadata } from 'next'
import { cookies } from 'next/headers'
import { LegalPageShell, LegalSection } from '@/components/legal/legal-page-shell'

export const metadata: Metadata = {
  title: 'Cam kết chất lượng dịch vụ (SLA) | OracleCloud Vietnam',
  description:
    'Thỏa thuận mức độ dịch vụ (SLA) của OracleCloud Vietnam - cam kết uptime, thời gian phản hồi hỗ trợ và cơ chế bù trừ dịch vụ.',
}

interface UptimeRow {
  service: string
  target: string
  scope: string
}

const VI_UPTIME: UptimeRow[] = [
  { service: 'Compute (VM Instance)', target: '99,95%', scope: 'Mỗi instance chạy trong một Availability Domain' },
  { service: 'Block Volume / Boot Volume', target: '99,99%', scope: 'Khả năng đọc/ghi tới volume đã attach' },
  { service: 'Object Storage', target: '99,90%', scope: 'Truy xuất object qua API trong region' },
  { service: 'Autonomous Database / DB System', target: '99,95%', scope: 'Cấu hình triển khai chuẩn theo khuyến nghị của Oracle' },
  { service: 'Networking (VCN, Load Balancer)', target: '99,95%', scope: 'Đường dẫn dữ liệu trong region' },
  { service: 'Control Plane (Manageability)', target: '99,90%', scope: 'API/Console để tạo, sửa, xóa tài nguyên' },
  { service: 'Cổng quản trị oraclecloud.vn', target: '99,50%', scope: 'Portal đặt hàng, thanh toán và quản lý dịch vụ của ICS' },
]

const EN_UPTIME: UptimeRow[] = [
  { service: 'Compute (VM Instance)', target: '99.95%', scope: 'Per instance running in a single Availability Domain' },
  { service: 'Block Volume / Boot Volume', target: '99.99%', scope: 'Read/write access to an attached volume' },
  { service: 'Object Storage', target: '99.90%', scope: 'Object retrieval via the in-region API' },
  { service: 'Autonomous Database / DB System', target: '99.95%', scope: 'Standard deployment per Oracle recommended topology' },
  { service: 'Networking (VCN, Load Balancer)', target: '99.95%', scope: 'In-region data path' },
  { service: 'Control Plane (Manageability)', target: '99.90%', scope: 'API/Console to create, modify and delete resources' },
  { service: 'oraclecloud.vn console', target: '99.50%', scope: 'ICS ordering, billing and service management portal' },
]

interface CreditRow {
  achieved: string
  credit: string
}

const VI_CREDIT: CreditRow[] = [
  { achieved: 'Từ 99,00% đến dưới mức cam kết', credit: '10% phí dịch vụ của tháng bị ảnh hưởng' },
  { achieved: 'Từ 95,00% đến dưới 99,00%', credit: '25% phí dịch vụ của tháng bị ảnh hưởng' },
  { achieved: 'Dưới 95,00%', credit: '100% phí dịch vụ của tháng bị ảnh hưởng' },
]

const EN_CREDIT: CreditRow[] = [
  { achieved: 'From 99.00% up to below the committed target', credit: '10% of the affected month service fee' },
  { achieved: 'From 95.00% up to below 99.00%', credit: '25% of the affected month service fee' },
  { achieved: 'Below 95.00%', credit: '100% of the affected month service fee' },
]

interface SupportRow {
  level: string
  definition: string
  response: string
  resolution: string
}

const VI_SUPPORT: SupportRow[] = [
  {
    level: 'P1 - Nghiêm trọng',
    definition: 'Dịch vụ production ngừng hoạt động hoàn toàn, mất dữ liệu, hoặc lỗi bảo mật đang bị khai thác',
    response: '15 phút (24/7)',
    resolution: 'Xử lý liên tục cho tới khi khôi phục, cập nhật mỗi 60 phút',
  },
  {
    level: 'P2 - Cao',
    definition: 'Một chức năng chính bị suy giảm nặng, hiệu năng giảm rõ rệt nhưng dịch vụ vẫn chạy',
    response: '1 giờ (24/7)',
    resolution: 'Mục tiêu khắc phục trong 8 giờ làm việc',
  },
  {
    level: 'P3 - Trung bình',
    definition: 'Lỗi ảnh hưởng một phần chức năng, đã có phương án tạm thời',
    response: '4 giờ làm việc',
    resolution: 'Mục tiêu khắc phục trong 3 ngày làm việc',
  },
  {
    level: 'P4 - Thấp',
    definition: 'Yêu cầu tư vấn, hướng dẫn cấu hình, thay đổi theo kế hoạch',
    response: '1 ngày làm việc',
    resolution: 'Theo lịch thống nhất với Khách hàng',
  },
]

const EN_SUPPORT: SupportRow[] = [
  {
    level: 'P1 - Critical',
    definition: 'Production service is fully down, data loss, or a security flaw being actively exploited',
    response: '15 minutes (24/7)',
    resolution: 'Continuous work until restored, status update every 60 minutes',
  },
  {
    level: 'P2 - High',
    definition: 'A major function is severely degraded or performance drops noticeably, but the service still runs',
    response: '1 hour (24/7)',
    resolution: 'Target resolution within 8 business hours',
  },
  {
    level: 'P3 - Medium',
    definition: 'A defect affects part of the functionality and a workaround exists',
    response: '4 business hours',
    resolution: 'Target resolution within 3 business days',
  },
  {
    level: 'P4 - Low',
    definition: 'Advisory requests, configuration guidance, planned changes',
    response: '1 business day',
    resolution: 'Per schedule agreed with the Customer',
  },
]

const VI_SECTIONS: LegalSection[] = [
  {
    title: 'PHẦN I. PHẠM VI VÀ ĐỊNH NGHĨA',
    articles: [
      {
        number: '1',
        heading: 'Phạm vi áp dụng',
        paragraphs: [
          'Thỏa thuận mức độ dịch vụ (Service Level Agreement - SLA) này áp dụng cho các dịch vụ Managed Oracle Cloud, VPS và dịch vụ vận hành do OracleCloud Vietnam (Công ty Cổ phần An ninh mạng Quốc tế - ICS) cung cấp cho Khách hàng đang có gói dịch vụ hiệu lực và không có công nợ quá hạn.',
          'SLA này được xây dựng trên nền tảng Oracle Cloud Infrastructure Service Level Agreement do Oracle công bố, bao gồm ba nhóm cam kết: Tính khả dụng (Availability), Khả năng quản trị (Manageability) và Hiệu năng (Performance).',
          'Đối với phần hạ tầng do Oracle vận hành, ICS chuyển tiếp nguyên trạng cam kết của Oracle. Đối với phần dịch vụ quản trị do ICS thực hiện (giám sát, sao lưu, xử lý sự cố, hỗ trợ kỹ thuật), ICS cam kết bổ sung các mức phản hồi nêu tại Phần III.',
        ],
      },
      {
        number: '2',
        heading: 'Định nghĩa',
        paragraphs: [
          '"Tháng dịch vụ" là khoảng thời gian một tháng dương lịch mà Khách hàng được cấp phát và phải trả phí cho dịch vụ.',
          '"Thời gian gián đoạn" là khoảng thời gian liên tục, tính theo phút, trong đó dịch vụ không khả dụng đối với Khách hàng, được xác định căn cứ trên log giám sát của hệ thống.',
          '"Tỷ lệ khả dụng" được tính bằng: (Tổng số phút trong tháng dịch vụ - Thời gian gián đoạn) / Tổng số phút trong tháng dịch vụ x 100%.',
          '"Bù trừ dịch vụ" (Service Credit) là khoản giảm trừ trên phí dịch vụ của kỳ thanh toán tiếp theo, được áp dụng khi tỷ lệ khả dụng thực tế thấp hơn mức cam kết.',
          '"Bảo trì theo kế hoạch" là khoảng thời gian bảo trì đã được thông báo trước, không tính vào thời gian gián đoạn.',
        ],
      },
    ],
  },
  {
    title: 'PHẦN II. CAM KẾT KHẢ DỤNG VÀ BÙ TRỪ',
    articles: [
      {
        number: '3',
        heading: 'Cam kết tính khả dụng',
        paragraphs: [
          'Mức cam kết khả dụng theo từng nhóm dịch vụ được nêu chi tiết trong bảng "Cam kết tính khả dụng theo dịch vụ" bên dưới.',
          'Cam kết khả dụng được tính riêng cho từng dịch vụ và từng tháng dịch vụ, không bù trừ chéo giữa các dịch vụ.',
          'Với các cấu hình triển khai dự phòng (nhiều Fault Domain, nhiều Availability Domain, hoặc cụm có cân bằng tải), mức khả dụng thực tế đạt được thường cao hơn mức cam kết tối thiểu. ICS sẵn sàng tư vấn kiến trúc để Khách hàng đạt mức khả dụng cao hơn.',
        ],
      },
      {
        number: '4',
        heading: 'Cam kết khả năng quản trị và hiệu năng',
        paragraphs: [
          'Khả năng quản trị (Manageability): Khách hàng có thể thực hiện các thao tác tạo, thay đổi và xóa tài nguyên thông qua API hoặc Console với tỷ lệ khả dụng tối thiểu 99,90% mỗi tháng dịch vụ.',
          'Hiệu năng (Performance): tài nguyên được cấp phát đúng thông số cam kết trong đơn hàng về số OCPU, dung lượng RAM, IOPS của Block Volume và băng thông mạng. Trường hợp hiệu năng thực tế thấp hơn thông số cam kết một cách liên tục, Khách hàng được quyền yêu cầu bù trừ theo cùng cơ chế tại Điều 5.',
          'Cam kết hiệu năng không áp dụng cho các suy giảm phát sinh từ ứng dụng, hệ điều hành hoặc cấu hình do Khách hàng tự quản lý.',
        ],
      },
      {
        number: '5',
        heading: 'Cơ chế bù trừ dịch vụ',
        paragraphs: [
          'Mức bù trừ tương ứng với tỷ lệ khả dụng thực tế được nêu trong bảng "Mức bù trừ dịch vụ" bên dưới.',
          'Bù trừ được thực hiện dưới dạng giảm trừ phí trên kỳ thanh toán tiếp theo hoặc cộng thêm thời gian sử dụng tương ứng, theo lựa chọn của Khách hàng. Bù trừ không được quy đổi thành tiền mặt.',
          'Tổng mức bù trừ trong một tháng dịch vụ không vượt quá 100% phí dịch vụ của tháng đó đối với dịch vụ bị ảnh hưởng.',
          'Bù trừ dịch vụ là biện pháp khắc phục duy nhất và toàn bộ đối với việc không đạt cam kết khả dụng.',
        ],
      },
      {
        number: '6',
        heading: 'Thủ tục yêu cầu bù trừ',
        paragraphs: [
          'Khách hàng gửi yêu cầu bù trừ trong vòng 30 ngày kể từ ngày cuối của tháng dịch vụ xảy ra gián đoạn, qua email contact@ics.vn hoặc tạo yêu cầu hỗ trợ trong cổng quản trị.',
          'Yêu cầu cần nêu: tên dịch vụ và mã tài nguyên bị ảnh hưởng, thời điểm bắt đầu và kết thúc gián đoạn, mô tả biểu hiện và bằng chứng kèm theo (log, ảnh chụp, kết quả kiểm tra).',
          'ICS xác minh và phản hồi kết quả trong vòng 15 ngày làm việc. Nếu yêu cầu được chấp thuận, bù trừ sẽ được áp dụng vào kỳ hóa đơn kế tiếp.',
        ],
      },
    ],
  },
  {
    title: 'PHẦN III. HỖ TRỢ, GIÁM SÁT VÀ SAO LƯU',
    articles: [
      {
        number: '7',
        heading: 'Mức độ ưu tiên và thời gian phản hồi',
        paragraphs: [
          'Yêu cầu hỗ trợ được phân loại theo bốn mức độ ưu tiên từ P1 đến P4. Chi tiết định nghĩa, thời gian phản hồi và mục tiêu khắc phục được nêu trong bảng "Thời gian phản hồi hỗ trợ" bên dưới.',
          'Thời gian phản hồi được tính từ khi yêu cầu được ghi nhận trong hệ thống ticket hoặc từ khi cuộc gọi hotline được tiếp nhận.',
          'Kênh tiếp nhận: cổng quản trị oraclecloud.vn, email contact@ics.vn và hotline 0707.806.860. Riêng sự cố P1 và P2 được tiếp nhận 24/7 kể cả ngày lễ.',
          '"Giờ làm việc" được hiểu là 08h30 - 17h30 các ngày từ Thứ Hai đến Thứ Sáu, theo giờ Việt Nam (UTC+7), không bao gồm ngày lễ theo quy định.',
        ],
      },
      {
        number: '8',
        heading: 'Giám sát và thông báo sự cố',
        paragraphs: [
          'Hạ tầng của Khách hàng được giám sát liên tục 24/7 về trạng thái instance, tài nguyên CPU, bộ nhớ, dung lượng lưu trữ và khả năng truy cập dịch vụ.',
          'Khi phát hiện sự cố ảnh hưởng tới dịch vụ, ICS chủ động thông báo cho Khách hàng qua email và điện thoại, kèm theo đánh giá phạm vi ảnh hưởng.',
          'Với sự cố mức P1, ICS cung cấp bản báo cáo phân tích nguyên nhân gốc (Root Cause Analysis) trong vòng 5 ngày làm việc sau khi dịch vụ được khôi phục.',
        ],
      },
      {
        number: '9',
        heading: 'Sao lưu và khôi phục',
        paragraphs: [
          'Sao lưu tự động Boot Volume và Block Volume theo chính sách mặc định của gói dịch vụ, thông thường là hàng ngày với thời gian lưu giữ 7 ngày. Khách hàng có thể yêu cầu chính sách sao lưu mở rộng theo nhu cầu.',
          'Mục tiêu thời điểm phục hồi (RPO) tối đa 24 giờ và mục tiêu thời gian phục hồi (RTO) tối đa 4 giờ đối với yêu cầu khôi phục từ bản sao lưu gần nhất.',
          'Khách hàng chịu trách nhiệm về việc sao lưu dữ liệu ứng dụng nằm ngoài phạm vi volume được quản lý, trừ khi có thỏa thuận riêng bằng văn bản.',
        ],
      },
      {
        number: '10',
        heading: 'Bảo trì theo kế hoạch',
        paragraphs: [
          'ICS thông báo trước tối thiểu 72 giờ đối với bảo trì có khả năng gây gián đoạn dịch vụ, và tối thiểu 24 giờ đối với bảo trì không gây gián đoạn.',
          'Cửa sổ bảo trì định kỳ ưu tiên khung giờ thấp điểm 00h00 - 05h00 giờ Việt Nam, với tổng thời lượng không vượt quá 8 giờ mỗi tháng dịch vụ.',
          'Bảo trì khẩn cấp nhằm xử lý lỗ hổng bảo mật nghiêm trọng có thể được thực hiện ngay, ICS thông báo cho Khách hàng trong thời gian sớm nhất có thể.',
          'Thời gian bảo trì đã thông báo hợp lệ không được tính vào thời gian gián đoạn khi tính tỷ lệ khả dụng.',
        ],
      },
    ],
  },
  {
    title: 'PHẦN IV. LOẠI TRỪ VÀ TRÁCH NHIỆM',
    articles: [
      {
        number: '11',
        heading: 'Các trường hợp loại trừ',
        paragraphs: [
          'Bảo trì theo kế hoạch đã được thông báo hợp lệ và bảo trì khẩn cấp về bảo mật.',
          'Sự cố do lỗi ứng dụng, hệ điều hành, mã nguồn hoặc cấu hình do Khách hàng tự thực hiện hoặc tự thay đổi.',
          'Sự cố do Khách hàng sử dụng vượt quá hạn mức tài nguyên đã đăng ký, hoặc do sử dụng dịch vụ sai mục đích, vi phạm Điều khoản sử dụng.',
          'Sự cố do hạ tầng, thiết bị, đường truyền Internet phía Khách hàng hoặc do nhà cung cấp bên thứ ba mà ICS không kiểm soát.',
          'Sự cố do tấn công mạng vượt quá năng lực phòng chống đã thống nhất, ví dụ tấn công DDoS quy mô lớn, trong trường hợp Khách hàng không sử dụng dịch vụ bảo vệ tương ứng.',
          'Sự kiện bất khả kháng: thiên tai, dịch bệnh, chiến tranh, thay đổi pháp luật, quyết định của cơ quan nhà nước có thẩm quyền, sự cố tuyến cáp quang biển quốc tế.',
          'Thời gian dịch vụ bị tạm ngưng do Khách hàng chậm thanh toán quá thời hạn quy định trong Điều khoản sử dụng.',
        ],
      },
      {
        number: '12',
        heading: 'Trách nhiệm của Khách hàng',
        paragraphs: [
          'Cung cấp và duy trì thông tin liên hệ chính xác để nhận cảnh báo vận hành và thông báo bảo trì.',
          'Bảo mật thông tin đăng nhập, khóa SSH và mã OTP; thông báo ngay cho ICS khi phát hiện dấu hiệu bị truy cập trái phép.',
          'Phối hợp cung cấp thông tin, log và quyền truy cập cần thiết khi ICS yêu cầu để phục vụ chẩn đoán sự cố. Thời gian chờ Khách hàng phản hồi không tính vào thời gian khắc phục.',
          'Không tự ý thay đổi cấu hình hạ tầng do ICS quản lý mà không thông báo trước, nhằm tránh xung đột và gián đoạn ngoài dự kiến.',
        ],
      },
      {
        number: '13',
        heading: 'Sửa đổi và giải quyết tranh chấp',
        paragraphs: [
          'SLA này có thể được cập nhật khi Oracle thay đổi cam kết đối với hạ tầng Oracle Cloud Infrastructure, hoặc khi ICS mở rộng phạm vi dịch vụ. Bản cập nhật được công bố tại trang này và thông báo trước tối thiểu 30 ngày nếu làm giảm quyền lợi của Khách hàng.',
          'Trường hợp có sự khác biệt giữa SLA này và hợp đồng dịch vụ đã ký kết giữa hai bên, nội dung hợp đồng sẽ được ưu tiên áp dụng.',
          'Tranh chấp phát sinh được hai bên ưu tiên giải quyết thông qua thương lượng. Nếu không đạt được thỏa thuận, tranh chấp được đưa ra giải quyết tại cơ quan có thẩm quyền theo pháp luật Việt Nam.',
        ],
      },
    ],
  },
]

const EN_SECTIONS: LegalSection[] = [
  {
    title: 'PART I. SCOPE AND DEFINITIONS',
    articles: [
      {
        number: '1',
        heading: 'Scope',
        paragraphs: [
          'This Service Level Agreement (SLA) applies to the Managed Oracle Cloud, VPS and operations services provided by OracleCloud Vietnam (International Cyber Security JSC - ICS) to Customers holding an active plan with no overdue balance.',
          'This SLA is built on the Oracle Cloud Infrastructure Service Level Agreement published by Oracle, covering three commitment categories: Availability, Manageability and Performance.',
          'For infrastructure operated by Oracle, ICS passes through the Oracle commitments as-is. For the managed services ICS performs (monitoring, backup, incident handling, technical support), ICS adds the response commitments set out in Part III.',
        ],
      },
      {
        number: '2',
        heading: 'Definitions',
        paragraphs: [
          '"Service month" means one calendar month during which the Customer is provisioned and billed for the service.',
          '"Downtime" means the continuous period, measured in minutes, during which the service is unavailable to the Customer, as determined from system monitoring logs.',
          '"Availability rate" is calculated as: (total minutes in the service month - downtime) / total minutes in the service month x 100%.',
          '"Service Credit" means a reduction applied to the service fee of the following billing period when the actual availability falls below the committed target.',
          '"Scheduled maintenance" means a maintenance window notified in advance, which is excluded from downtime.',
        ],
      },
    ],
  },
  {
    title: 'PART II. AVAILABILITY COMMITMENTS AND CREDITS',
    articles: [
      {
        number: '3',
        heading: 'Availability commitments',
        paragraphs: [
          'The committed availability for each service group is set out in the "Availability commitment by service" table below.',
          'Availability is calculated per service and per service month; credits are not cross-applied between services.',
          'With redundant deployments (multiple Fault Domains, multiple Availability Domains, or load-balanced clusters) the achieved availability is typically higher than the minimum commitment. ICS is available to advise on architecture for higher availability targets.',
        ],
      },
      {
        number: '4',
        heading: 'Manageability and performance commitments',
        paragraphs: [
          'Manageability: the Customer can create, modify and delete resources through the API or Console with at least 99.90% availability per service month.',
          'Performance: resources are provisioned to the specifications committed in the order for OCPU count, RAM, Block Volume IOPS and network bandwidth. Where actual performance falls persistently below the committed specification, the Customer may claim a credit under the same mechanism as Article 5.',
          'The performance commitment does not cover degradation arising from applications, operating systems or configuration under Customer control.',
        ],
      },
      {
        number: '5',
        heading: 'Service credit mechanism',
        paragraphs: [
          'Credit levels corresponding to the actual availability rate are set out in the "Service credit levels" table below.',
          'Credits are applied as a fee reduction on the next billing period or as an equivalent extension of the service term, at the Customer election. Credits are not convertible to cash.',
          'Total credits in one service month do not exceed 100% of that month service fee for the affected service.',
          'Service credits are the sole and exclusive remedy for a failure to meet the availability commitment.',
        ],
      },
      {
        number: '6',
        heading: 'Claim procedure',
        paragraphs: [
          'Submit the claim within 30 days of the last day of the service month in which the downtime occurred, by email to contact@ics.vn or via a support request in the console.',
          'The claim must state the affected service name and resource identifier, the start and end of the downtime, a description of the symptoms and supporting evidence (logs, screenshots, test results).',
          'ICS verifies and responds within 15 business days. If approved, the credit is applied to the next invoice.',
        ],
      },
    ],
  },
  {
    title: 'PART III. SUPPORT, MONITORING AND BACKUP',
    articles: [
      {
        number: '7',
        heading: 'Priority levels and response times',
        paragraphs: [
          'Support requests are classified into four priority levels, P1 to P4. Definitions, response times and resolution targets are set out in the "Support response times" table below.',
          'Response time is measured from when the request is recorded in the ticket system or when the hotline call is answered.',
          'Intake channels: the oraclecloud.vn console, email contact@ics.vn and the hotline 0707.806.860. P1 and P2 incidents are accepted 24/7 including public holidays.',
          '"Business hours" means 08:30 - 17:30, Monday to Friday, Vietnam time (UTC+7), excluding statutory public holidays.',
        ],
      },
      {
        number: '8',
        heading: 'Monitoring and incident notification',
        paragraphs: [
          'Customer infrastructure is monitored 24/7 for instance state, CPU, memory, storage capacity and service reachability.',
          'When an incident affecting the service is detected, ICS proactively notifies the Customer by email and phone, together with an impact assessment.',
          'For P1 incidents, ICS provides a Root Cause Analysis report within 5 business days after the service is restored.',
        ],
      },
      {
        number: '9',
        heading: 'Backup and restore',
        paragraphs: [
          'Boot and Block Volumes are backed up automatically under the plan default policy, typically daily with 7-day retention. Extended backup policies are available on request.',
          'Recovery Point Objective (RPO) is up to 24 hours and Recovery Time Objective (RTO) is up to 4 hours for a restore from the most recent backup.',
          'The Customer remains responsible for backing up application data outside the managed volumes, unless separately agreed in writing.',
        ],
      },
      {
        number: '10',
        heading: 'Scheduled maintenance',
        paragraphs: [
          'ICS gives at least 72 hours notice for maintenance that may interrupt service, and at least 24 hours notice for non-disruptive maintenance.',
          'Routine maintenance windows prefer the off-peak period 00:00 - 05:00 Vietnam time, with a total duration not exceeding 8 hours per service month.',
          'Emergency maintenance to remediate a critical security vulnerability may be performed immediately, with notification to the Customer as soon as practicable.',
          'Validly notified maintenance time is excluded from downtime when calculating the availability rate.',
        ],
      },
    ],
  },
  {
    title: 'PART IV. EXCLUSIONS AND RESPONSIBILITIES',
    articles: [
      {
        number: '11',
        heading: 'Exclusions',
        paragraphs: [
          'Validly notified scheduled maintenance and emergency security maintenance.',
          'Incidents caused by applications, operating systems, source code or configuration performed or changed by the Customer.',
          'Incidents caused by the Customer exceeding subscribed resource limits, or by misuse of the service in breach of the Terms of Service.',
          'Incidents caused by Customer-side infrastructure, equipment or Internet connectivity, or by third-party providers outside ICS control.',
          'Incidents caused by cyber attacks beyond the agreed protection capacity, such as large-scale DDoS, where the Customer has not subscribed to the corresponding protection service.',
          'Force majeure: natural disaster, epidemic, war, changes in law, decisions of competent authorities, and international submarine cable failures.',
          'Periods during which service is suspended for late payment beyond the deadline set in the Terms of Service.',
        ],
      },
      {
        number: '12',
        heading: 'Customer responsibilities',
        paragraphs: [
          'Provide and maintain accurate contact details to receive operational alerts and maintenance notices.',
          'Protect credentials, SSH keys and OTP codes; notify ICS immediately upon any sign of unauthorised access.',
          'Cooperate in providing the information, logs and access ICS requires for diagnosis. Time spent waiting for a Customer response is excluded from resolution time.',
          'Do not change ICS-managed infrastructure configuration without prior notice, to avoid conflicts and unplanned interruption.',
        ],
      },
      {
        number: '13',
        heading: 'Amendments and dispute resolution',
        paragraphs: [
          'This SLA may be updated when Oracle changes its Oracle Cloud Infrastructure commitments or when ICS extends its service scope. Updates are published on this page, with at least 30 days prior notice where Customer entitlements are reduced.',
          'Where this SLA differs from a service contract signed between the parties, the contract prevails.',
          'Disputes are to be resolved primarily by negotiation. Failing agreement, they are referred to the competent authority under Vietnamese law.',
        ],
      },
    ],
  },
]

const TABLE_WRAPPER = 'overflow-x-auto -mx-1 px-1'
const TH = 'text-left text-xs font-semibold uppercase tracking-wide px-4 py-3'
const TD = 'px-4 py-3 text-sm text-gray-700 dark:text-muted-foreground align-top'

export default function SlaPage() {
  const lang = cookies().get('language')?.value || 'vi'
  const isVietnamese = lang === 'vi'

  const uptime = isVietnamese ? VI_UPTIME : EN_UPTIME
  const credit = isVietnamese ? VI_CREDIT : EN_CREDIT
  const support = isVietnamese ? VI_SUPPORT : EN_SUPPORT

  return (
    <LegalPageShell
      title={isVietnamese ? 'CAM KẾT CHẤT LƯỢNG DỊCH VỤ' : 'SERVICE LEVEL AGREEMENT'}
      subtitle="(Service Level Agreement - Managed Oracle Cloud & VPS)"
      articleLabel={isVietnamese ? 'Điều' : 'Article'}
      notice={
        <>
          <strong>{isVietnamese ? 'Cơ sở cam kết:' : 'Basis of commitment:'}</strong>{' '}
          {isVietnamese
            ? 'SLA này kế thừa cam kết của Oracle Cloud Infrastructure về Tính khả dụng, Khả năng quản trị và Hiệu năng, đồng thời bổ sung cam kết vận hành và hỗ trợ kỹ thuật của ICS. SLA chỉ áp dụng cho gói dịch vụ đang hiệu lực và không có công nợ quá hạn.'
            : 'This SLA inherits the Oracle Cloud Infrastructure commitments on Availability, Manageability and Performance, and adds the ICS operations and technical support commitments. It applies only to active plans with no overdue balance.'}
        </>
      }
      sections={isVietnamese ? VI_SECTIONS : EN_SECTIONS}
      effectiveNote={
        isVietnamese
          ? 'Tài liệu này có hiệu lực kể từ ngày được công bố và có thể được cập nhật theo thời gian.'
          : 'This document is effective from its publication date and may be updated over time.'
      }
    >
      {/* Bảng cam kết khả dụng */}
      <div className="mb-10">
        <div className="bg-gray-800 dark:bg-muted text-white rounded-lg px-5 py-3 mb-6">
          <h2 className="text-base font-semibold tracking-wide">
            {isVietnamese ? 'CAM KẾT TÍNH KHẢ DỤNG THEO DỊCH VỤ' : 'AVAILABILITY COMMITMENT BY SERVICE'}
          </h2>
        </div>
        <div className="bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-border shadow-sm p-2">
          <div className={TABLE_WRAPPER}>
            <table className="w-full min-w-[560px] border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-border text-gray-500 dark:text-muted-foreground">
                  <th className={TH}>{isVietnamese ? 'Dịch vụ' : 'Service'}</th>
                  <th className={TH}>{isVietnamese ? 'Cam kết / tháng' : 'Commitment / month'}</th>
                  <th className={TH}>{isVietnamese ? 'Phạm vi tính' : 'Measurement scope'}</th>
                </tr>
              </thead>
              <tbody>
                {uptime.map((row) => (
                  <tr key={row.service} className="border-b border-gray-100 dark:border-border/50 last:border-0">
                    <td className={`${TD} font-medium text-gray-900 dark:text-foreground`}>{row.service}</td>
                    <td className={`${TD} font-bold text-[#E60000] whitespace-nowrap`}>{row.target}</td>
                    <td className={TD}>{row.scope}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bảng bù trừ */}
      <div className="mb-10">
        <div className="bg-gray-800 dark:bg-muted text-white rounded-lg px-5 py-3 mb-6">
          <h2 className="text-base font-semibold tracking-wide">
            {isVietnamese ? 'MỨC BÙ TRỪ DỊCH VỤ' : 'SERVICE CREDIT LEVELS'}
          </h2>
        </div>
        <div className="bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-border shadow-sm p-2">
          <div className={TABLE_WRAPPER}>
            <table className="w-full min-w-[480px] border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-border text-gray-500 dark:text-muted-foreground">
                  <th className={TH}>
                    {isVietnamese ? 'Tỷ lệ khả dụng thực tế trong tháng' : 'Actual availability in the month'}
                  </th>
                  <th className={TH}>{isVietnamese ? 'Mức bù trừ' : 'Credit'}</th>
                </tr>
              </thead>
              <tbody>
                {credit.map((row) => (
                  <tr key={row.achieved} className="border-b border-gray-100 dark:border-border/50 last:border-0">
                    <td className={`${TD} font-medium text-gray-900 dark:text-foreground`}>{row.achieved}</td>
                    <td className={TD}>{row.credit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bảng hỗ trợ */}
      <div className="mb-10">
        <div className="bg-gray-800 dark:bg-muted text-white rounded-lg px-5 py-3 mb-6">
          <h2 className="text-base font-semibold tracking-wide">
            {isVietnamese ? 'THỜI GIAN PHẢN HỒI HỖ TRỢ' : 'SUPPORT RESPONSE TIMES'}
          </h2>
        </div>
        <div className="bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-border shadow-sm p-2">
          <div className={TABLE_WRAPPER}>
            <table className="w-full min-w-[680px] border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-border text-gray-500 dark:text-muted-foreground">
                  <th className={TH}>{isVietnamese ? 'Mức độ' : 'Priority'}</th>
                  <th className={TH}>{isVietnamese ? 'Định nghĩa' : 'Definition'}</th>
                  <th className={TH}>{isVietnamese ? 'Phản hồi đầu tiên' : 'First response'}</th>
                  <th className={TH}>{isVietnamese ? 'Mục tiêu khắc phục' : 'Resolution target'}</th>
                </tr>
              </thead>
              <tbody>
                {support.map((row) => (
                  <tr key={row.level} className="border-b border-gray-100 dark:border-border/50 last:border-0">
                    <td className={`${TD} font-semibold text-gray-900 dark:text-foreground whitespace-nowrap`}>
                      {row.level}
                    </td>
                    <td className={TD}>{row.definition}</td>
                    <td className={`${TD} font-medium text-[#E60000] whitespace-nowrap`}>{row.response}</td>
                    <td className={TD}>{row.resolution}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </LegalPageShell>
  )
}
