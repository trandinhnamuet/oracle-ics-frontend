"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { Bell, X, Check, CheckCheck, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Notification,
  NotificationType,
  NotificationPage,
  getMyNotifications,
  getUnreadCount,
  markAllRead,
  markOneRead,
  clearReadNotifications,
} from "@/api/notification.api"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

// ---------- helpers ----------

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return "vừa xong"
  if (minutes < 60) return `${minutes} phút trước`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} giờ trước`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} ngày trước`
  return new Date(dateStr).toLocaleDateString("vi-VN")
}

const TYPE_ICON: Record<NotificationType, string> = {
  wallet_credit: "💰",
  wallet_debit: "💸",
  support_ticket_created: "🎫",
  support_ticket_updated: "🔔",
  subscription_created: "🚀",
  subscription_expiring: "⚠️",
  subscription_renewed: "✅",
  subscription_expired: "❌",
  vm_provisioned: "🖥️",
  vm_started: "▶️",
  vm_stopped: "⏹️",
  vm_restarted: "🔄",
  vm_terminated: "🗑️",
  password_changed: "🔐",
  password_reset: "🔑",
  account_login: "🔓",
  general: "📣",
}

const TYPE_COLOR: Record<NotificationType, string> = {
  wallet_credit: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
  wallet_debit: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
  support_ticket_created: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  support_ticket_updated: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
  subscription_created: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
  subscription_expiring: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
  subscription_renewed: "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300",
  subscription_expired: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
  vm_provisioned: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300",
  vm_started: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
  vm_stopped: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300",
  vm_restarted: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  vm_terminated: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
  password_changed: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300",
  password_reset: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
  account_login: "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300",
  general: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
}

// ---------- component ----------

export function NotificationBell() {
  const { isAuthenticated } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)
  const [data, setData] = useState<NotificationPage | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [readingId, setReadingId] = useState<number | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // ---------- fetch helpers ----------

  const fetchUnread = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const count = await getUnreadCount()
      setUnreadCount(count)
    } catch { /* silent */ }
  }, [isAuthenticated])

  const fetchPage = useCallback(async (page = 1, append = false) => {
    try {
      const result = await getMyNotifications(page, 15)
      setData(prev =>
        append && prev
          ? { ...result, items: [...prev.items, ...result.items] }
          : result
      )
    } catch { /* silent */ }
  }, [])

  // Poll unread count every 30 s
  useEffect(() => {
    if (!isAuthenticated) return
    fetchUnread()
    const interval = setInterval(fetchUnread, 30_000)
    return () => clearInterval(interval)
  }, [isAuthenticated, fetchUnread])

  // Load notifications when panel opens
  useEffect(() => {
    if (!open || !isAuthenticated) return
    setLoading(true)
    fetchPage(1).finally(() => setLoading(false))
  }, [open, isAuthenticated, fetchPage])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  // ---------- actions ----------

  const handleMarkOne = async (n: Notification) => {
    if (n.is_read) return
    setReadingId(n.id)
    try {
      await markOneRead(n.id)
      setData(prev =>
        prev
          ? { ...prev, items: prev.items.map(item => item.id === n.id ? { ...item, is_read: true } : item) }
          : prev
      )
      setUnreadCount(c => Math.max(0, c - 1))
    } catch { /* silent */ } finally {
      setReadingId(null)
    }
  }

  const handleMarkAll = async () => {
    setMarkingAll(true)
    try {
      await markAllRead()
      setData(prev =>
        prev ? { ...prev, items: prev.items.map(n => ({ ...n, is_read: true })) } : prev
      )
      setUnreadCount(0)
    } catch { /* silent */ } finally {
      setMarkingAll(false)
    }
  }

  const handleClearRead = async () => {
    try {
      await clearReadNotifications()
      setData(prev =>
        prev ? { ...prev, items: prev.items.filter(n => !n.is_read), total: prev.items.filter(n => !n.is_read).length } : prev
      )
    } catch { /* silent */ }
  }

  const handleLoadMore = async () => {
    if (!data || data.page >= data.totalPages) return
    setLoadingMore(true)
    await fetchPage(data.page + 1, true)
    setLoadingMore(false)
  }

  // ---------- render ----------

  if (!isAuthenticated) return null

  const notifications = data?.items ?? []
  const hasMore = data ? data.page < data.totalPages : false
  const hasUnread = unreadCount > 0
  const hasReadItems = notifications.some(n => n.is_read)

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        ref={buttonRef}
        onClick={() => setOpen(v => !v)}
        className={cn(
          "relative flex items-center justify-center w-9 h-9 rounded-full transition-colors",
          "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          open && "bg-muted"
        )}
        aria-label={`Thông báo${hasUnread ? ` (${unreadCount} chưa đọc)` : ""}`}
      >
        <Bell className="h-5 w-5 text-foreground" />
        {hasUnread && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1 leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          className={cn(
            "absolute right-0 top-11 z-[200] w-[380px] max-w-[calc(100vw-1rem)]",
            "rounded-2xl border border-border bg-background shadow-2xl",
            "flex flex-col overflow-hidden",
            "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-foreground text-base">Thông báo</h3>
              {hasUnread && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white px-1.5">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {hasUnread && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10"
                  onClick={handleMarkAll}
                  disabled={markingAll}
                >
                  {markingAll ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCheck className="h-3.5 w-3.5 mr-1" />}
                  Đọc tất cả
                </Button>
              )}
              {hasReadItems && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={handleClearRead}
                  title="Xoá thông báo đã đọc"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Body */}
          <ScrollArea className="flex-1 max-h-[480px]">
            {loading ? (
              <div className="p-3 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-3 p-2">
                    <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Bell className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">Không có thông báo</p>
                <p className="text-xs text-muted-foreground mt-1">Các thông báo về tài khoản sẽ hiện ở đây</p>
              </div>
            ) : (
              <div className="py-1">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleMarkOne(n)}
                    className={cn(
                      "w-full text-left px-4 py-3 flex gap-3 items-start transition-colors group",
                      "hover:bg-muted/70 focus:outline-none",
                      !n.is_read && "bg-primary/5 hover:bg-primary/10"
                    )}
                  >
                    {/* Icon */}
                    <div className={cn(
                      "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg",
                      TYPE_COLOR[n.type as NotificationType] ?? "bg-muted text-muted-foreground"
                    )}>
                      {TYPE_ICON[n.type as NotificationType] ?? "📣"}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm leading-snug line-clamp-1",
                        n.is_read ? "font-normal text-foreground" : "font-semibold text-foreground"
                      )}>
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground leading-snug mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          "text-[11px] font-medium",
                          n.is_read ? "text-muted-foreground" : "text-primary"
                        )}>
                          {timeAgo(n.created_at)}
                        </span>
                        {!n.is_read && (
                          <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </div>
                    </div>

                    {/* Mark-read spinner */}
                    {readingId === n.id && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground flex-shrink-0 mt-1" />
                    )}
                    {readingId !== n.id && n.is_read && (
                      <Check className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                ))}

                {/* Load more */}
                {hasMore && (
                  <div className="px-4 py-2 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-primary hover:text-primary hover:bg-primary/10"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                    >
                      {loadingMore ? (
                        <><Loader2 className="h-3 w-3 animate-spin mr-1" /> Đang tải...</>
                      ) : (
                        "Xem thêm thông báo"
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-border bg-muted/30 text-center">
              <p className="text-xs text-muted-foreground">
                Hiển thị {notifications.length} / {data?.total ?? notifications.length} thông báo
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
