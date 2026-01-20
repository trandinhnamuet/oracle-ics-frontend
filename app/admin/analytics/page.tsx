'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { AnalyticsApi } from '@/api/analytics.api'
import { useTranslation } from 'react-i18next'
import { ArrowUp, Eye, Users, TrendingDown, Zap } from 'lucide-react'
import { format, subDays } from 'date-fns'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function AnalyticsDashboard() {
  const { t } = useTranslation()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<'7days' | '30days' | '90days'>('30days')
  
  // Fallback translation function
  const tFallback = (key: string, defaultValue?: any) => {
    if (!t || typeof t !== 'function') {
      return defaultValue || key
    }
    return t(key)
  }

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const getDateRange = () => {
    const endDate = new Date()
    let startDate = new Date()

    switch (dateRange) {
      case '7days':
        startDate = subDays(endDate, 7)
        break
      case '30days':
        startDate = subDays(endDate, 30)
        break
      case '90days':
        startDate = subDays(endDate, 90)
        break
    }

    return { startDate, endDate }
  }

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      const { startDate, endDate } = getDateRange()
      const data = await AnalyticsApi.getDashboardStats(startDate, endDate)
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
      console.error('Error fetching analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-red-600">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
              <Button onClick={fetchAnalytics} className="mt-4">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Website traffic and visitor statistics
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex gap-2">
          <Button
            variant={dateRange === '7days' ? 'default' : 'outline'}
            onClick={() => setDateRange('7days')}
            size="sm"
          >
            Last 7 Days
          </Button>
          <Button
            variant={dateRange === '30days' ? 'default' : 'outline'}
            onClick={() => setDateRange('30days')}
            size="sm"
          >
            Last 30 Days
          </Button>
          <Button
            variant={dateRange === '90days' ? 'default' : 'outline'}
            onClick={() => setDateRange('90days')}
            size="sm"
          >
            Last 90 Days
          </Button>
          <Button onClick={fetchAnalytics} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {stats && stats.summary && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
                <Eye className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(stats.summary?.total_page_views || 0).toLocaleString()}</div>
                <p className="text-xs text-gray-500 mt-1">
                  Page views over selected period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
                <Users className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(stats.summary?.unique_users || 0).toLocaleString()}</div>
                <p className="text-xs text-gray-500 mt-1">
                  Unique visitors to the site
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
                <TrendingDown className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(stats.summary?.bounce_rate || 0).toFixed(2)}%</div>
                <p className="text-xs text-gray-500 mt-1">
                  Visitors who left without interaction
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Load Time</CardTitle>
                <Zap className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.summary?.avg_load_time || 0}ms</div>
                <p className="text-xs text-gray-500 mt-1">
                  Average page load time
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Page Views Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Page Views Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.daily_views && stats.daily_views.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats.daily_views}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="view_count"
                        stroke="#3b82f6"
                        name="Views"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Pages */}
            <Card>
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.pages && stats.pages.length > 0 ? (
                  <div className="space-y-4">
                    {stats.pages.slice(0, 5).map((page: any, index: number) => {
                      const maxCount = (stats.pages && stats.pages.length > 0) ? stats.pages[0]?.view_count || 1 : 1;
                      return (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{page?.page_title || page?.page_path || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">{page?.page_path || 'N/A'}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{(page?.view_count || 0).toLocaleString()}</p>
                            <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                              <div
                                className="h-2 bg-blue-500 rounded-full"
                                style={{
                                  width: `${Math.max(0, ((page?.view_count || 0) / maxCount) * 100)}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-8">No page data available</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Event Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>User Events</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.events && stats.events.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.events.slice(0, 5)}
                        dataKey="event_count"
                        nameKey="event_type"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {(stats.events || []).slice(0, 5).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    No event data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* All Events List */}
            <Card>
              <CardHeader>
                <CardTitle>All Events</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.events && stats.events.length > 0 ? (
                  <div className="space-y-3">
                    {stats.events.map((event: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <p className="font-medium text-sm">{event?.event_type || 'Unknown'}</p>
                        </div>
                        <p className="font-semibold">{(event?.event_count || 0).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-8">No event data available</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Google Analytics Integration Notice */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">Google Analytics Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-800">
                This dashboard displays analytics data from your website. To enable Google Analytics tracking:
              </p>
              <ol className="list-decimal list-inside mt-3 text-sm text-blue-800 space-y-1">
                <li>Set your Google Analytics Measurement ID in the .env.local file as NEXT_PUBLIC_GA_MEASUREMENT_ID</li>
                <li>Deploy the changes to make Google Analytics tracking active</li>
                <li>View detailed analytics in your Google Analytics console</li>
              </ol>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
