'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Beacon cho nhật ký truy cập tự lưu — thay hẳn Google Analytics.
 *
 * - `visitor_id` sinh lần đầu rồi giữ trong localStorage → nhận ra khách quay lại
 * - `session_id` giữ trong sessionStorage → gom các trang trong cùng một phiên
 * - Bắn về chính domain của mình (qua /api → backend) nên ad-blocker không chặn
 *
 * IP không gửi từ đây: backend tự lấy từ request.ip để client không giả được.
 *
 * Thay cho `AnalyticsProvider` cũ (vẫn còn trong repo nhưng không dùng nữa).
 */

const VISITOR_KEY = 'ocv_vid'
const SESSION_KEY = 'ocv_sid'

function newId(): string {
  // randomUUID cần secure context; HTTPS và localhost đều có, nhưng vẫn thủ sẵn
  // đường lui để trang không vỡ nếu chạy qua HTTP thuần.
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

/** Trả về id và cho biết có phải vừa tạo mới không (= khách lần đầu). */
function readOrCreate(store: Storage, key: string): { id: string; created: boolean } {
  const existing = store.getItem(key)
  if (existing) return { id: existing, created: false }
  const id = newId()
  store.setItem(key, id)
  return { id, created: true }
}

export function VisitTracker() {
  const pathname = usePathname()
  // React StrictMode gọi effect hai lần ở dev; ref chặn bắn trùng ngay tại nguồn.
  const lastSent = useRef<string | null>(null)

  useEffect(() => {
    if (!pathname) return
    if (lastSent.current === pathname) return
    lastSent.current = pathname

    let visitor: { id: string; created: boolean }
    let session: { id: string; created: boolean }
    try {
      visitor = readOrCreate(localStorage, VISITOR_KEY)
      session = readOrCreate(sessionStorage, SESSION_KEY)
    } catch {
      // Trình duyệt chặn storage (chế độ riêng tư, chặn cookie bên thứ ba…)
      return
    }

    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')

    // fetch + keepalive thay cho sendBeacon: sendBeacon với Blob JSON không qua
    // được preflight khi frontend và API khác origin (môi trường dev), còn
    // keepalive vẫn gửi được lúc trang đang đóng — đúng thứ ta cần ở đây.
    fetch(`${apiUrl}/visits/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        visitor_id: visitor.id,
        session_id: session.id,
        is_new_visitor: visitor.created,
        path: pathname,
        title: document.title || undefined,
        referrer: document.referrer || undefined,
        screen: `${window.screen.width}x${window.screen.height}`,
        lang: navigator.language,
      }),
    }).catch(() => {
      /* đo đạc hỏng thì thôi, không làm phiền khách */
    })
  }, [pathname])

  return null
}
