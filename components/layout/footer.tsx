import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Cloud, Mail, Phone, MapPin, Facebook, Linkedin, Youtube } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="bg-primary p-2 rounded-lg">
                <Cloud className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Oracle Cloud Vietnam</h3>
                <p className="text-sm opacity-80">Đối tác chính thức</p>
              </div>
            </div>
            <p className="text-sm opacity-80 leading-relaxed">
              Đối tác chính thức của Oracle tại Việt Nam, cung cấp giải pháp cloud computing hàng đầu cho doanh nghiệp
              với hơn 10 năm kinh nghiệm.
            </p>
            <div className="flex space-x-4">
                    <a href="https://www.facebook.com/ICS.OracleCloud/" target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm" className="bg-white hover:bg-primary border border-primary">
                        <Facebook className="h-4 w-4 text-[#1877F3]" />
                      </Button>
                    </a>
              <Button variant="ghost" size="sm" className="bg-white hover:bg-primary">
                <Linkedin className="h-4 w-4 text-[#0A66C2]" />
              </Button>
                    <a href="https://www.youtube.com/channel/UCpOn4kxyTtzmUldsDZoxLHg" target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm" className="bg-white hover:bg-primary border border-primary">
                        <Youtube className="h-4 w-4 text-[#FF0000]" />
                      </Button>
                    </a>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold">Dịch vụ</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="opacity-80 hover:opacity-100 hover:text-primary transition-colors">
                  Oracle Database Cloud
                </a>
              </li>
              <li>
                <a href="#" className="opacity-80 hover:opacity-100 hover:text-primary transition-colors">
                  Compute Cloud
                </a>
              </li>
              <li>
                <a href="#" className="opacity-80 hover:opacity-100 hover:text-primary transition-colors">
                  Storage Solutions
                </a>
              </li>
              <li>
                <a href="#" className="opacity-80 hover:opacity-100 hover:text-primary transition-colors">
                  Networking
                </a>
              </li>
              <li>
                <a href="#" className="opacity-80 hover:opacity-100 hover:text-primary transition-colors">
                  Security & Identity
                </a>
              </li>
              <li>
                <a href="#" className="opacity-80 hover:opacity-100 hover:text-primary transition-colors">
                  Analytics & AI
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold">Hỗ trợ</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="opacity-80 hover:opacity-100 hover:text-primary transition-colors">
                  Tài liệu kỹ thuật
                </a>
              </li>
              <li>
                <a href="#" className="opacity-80 hover:opacity-100 hover:text-primary transition-colors">
                  Video hướng dẫn
                </a>
              </li>
              <li>
                <a href="#" className="opacity-80 hover:opacity-100 hover:text-primary transition-colors">
                  Diễn đàn cộng đồng
                </a>
              </li>
              <li>
                <a href="#" className="opacity-80 hover:opacity-100 hover:text-primary transition-colors">
                  Ticket hỗ trợ
                </a>
              </li>
              <li>
                <a href="#" className="opacity-80 hover:opacity-100 hover:text-primary transition-colors">
                  Đào tạo & Chứng chỉ
                </a>
              </li>
              <li>
                <a href="#" className="opacity-80 hover:opacity-100 hover:text-primary transition-colors">
                  API Documentation
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold">Liên hệ</h4>
            <div className="space-y-4 text-sm">
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 mt-1 opacity-80" />
                <div>
                  <p className="opacity-80 font-semibold">CÔNG TY CỔ PHẦN AN NINH MẠNG QUỐC TẾ - ICS</p>
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 mt-1 opacity-80" />
                    <p className="opacity-80">Trụ sở: Đường Vũ Văn Cẩn, Phường Bần Yên Nhân, Thị Xã Mỹ Hào, Hưng Yên</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 mt-1 opacity-80" />
                    <p className="opacity-80">Văn phòng: TT3-5 Khu đô thị Đại Kim mới, Định Công, Hà Nội</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 opacity-80" />
                <p className="opacity-80">Điện thoại: 0931.487.231 &nbsp; - &nbsp; Hotline: 0707.806.860</p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 opacity-80" />
                <p className="opacity-80">E-mail: info@icss.com.vn &nbsp; - &nbsp; www.icss.com.vn</p>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="font-medium">Đăng ký nhận tin</h5>
              <div className="flex space-x-2">
                <Input
                  placeholder="Email của bạn"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
                <Button className="bg-primary hover:bg-primary/80 text-white" size="sm">
                  Đăng ký
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-6 text-sm opacity-80">
            <a href="#" className="hover:opacity-100 hover:text-primary transition-colors">
              Chính sách bảo mật
            </a>
            <a href="#" className="hover:opacity-100 hover:text-primary transition-colors">
              Điều khoản sử dụng
            </a>
            <a href="#" className="hover:opacity-100 hover:text-primary transition-colors">
              SLA
            </a>
            <a href="#" className="hover:opacity-100 hover:text-primary transition-colors">
              Sitemap
            </a>
          </div>
          <p className="text-sm opacity-80">© 2024 Oracle Cloud Vietnam. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  )
}
