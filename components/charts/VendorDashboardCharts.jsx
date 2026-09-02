'use client'

import { useId, useState } from 'react'
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'
import { LineChart } from 'lucide-react'
import DetailSlideOver from '@/components/admin/DetailSlideOver'
import { brandCardClass, brandLabelClass, brandSecondaryCtaClass, BRAND_GREEN, BRAND_MUTED, BRAND_TEXT } from '@/lib/brand-ui'

const AXIS_TICK = { fontSize: 11, fill: '#6b7280' }
const CHART_MARGIN = { top: 12, right: 8, left: 0, bottom: 0 }

function formatINR(value) {
    return `₹${(Number(value) || 0).toLocaleString('en-IN')}`
}

function ChartTooltip({ active, payload, label, valueFormatter, unit }) {
    if (!active || !payload?.length) return null
    const row = payload[0]
    if (row?.value == null) return null
    return (
        <div className="min-w-[140px] rounded-xl border border-[#e4eee6] bg-white px-3.5 py-2.5 shadow-[0_12px_28px_rgba(31,41,55,0.1)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
            <p className="mt-1 text-[15px] font-bold" style={{ color: BRAND_TEXT }}>
                {valueFormatter(row.value)}
                <span className="ml-1 text-xs font-medium" style={{ color: BRAND_MUTED }}>{unit}</span>
            </p>
        </div>
    )
}

function FootStat({ label, value }) {
    return (
        <div className="min-w-0 px-2 text-center">
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">{label}</p>
            <p className="mt-0.5 truncate text-sm font-semibold" style={{ color: BRAND_TEXT }}>{value}</p>
        </div>
    )
}

function ChartCard({ eyebrow, title, value, hint, stats, emptyLabel, children }) {
    const [showChart, setShowChart] = useState(false)

    return (
        <div className={brandCardClass}>
            <div className="px-5 pt-5">
                <p className={brandLabelClass} style={{ color: BRAND_GREEN }}>{eyebrow}</p>
                <p className="mt-1.5 text-[28px] font-bold leading-none tracking-tight" style={{ color: BRAND_TEXT }}>
                    {value}
                </p>
                <p className="mt-1.5 text-sm font-medium text-slate-500">{title}</p>
                {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
                {emptyLabel && <p className="mt-2 text-sm text-slate-500">{emptyLabel}</p>}
            </div>
            <div className="flex items-center justify-end px-5 py-3">
                <button
                    type="button"
                    onClick={() => setShowChart(true)}
                    className={brandSecondaryCtaClass}
                    style={{ color: BRAND_GREEN }}
                >
                    <LineChart size={16} />
                    Show chart
                </button>
            </div>
            <div className="grid grid-cols-3 divide-x divide-[#e4eee6] border-t border-[#e4eee6] px-2 py-3.5">
                {stats.map((stat) => (
                    <FootStat key={stat.label} {...stat} />
                ))}
            </div>
            {showChart ? (
                <DetailSlideOver
                    isOpen
                    onClose={() => setShowChart(false)}
                    eyebrow={eyebrow}
                    title={title}
                    subtitle={String(value)}
                    compact
                >
                    <div className="h-52 w-full">{children}</div>
                </DetailSlideOver>
            ) : null}
        </div>
    )
}

export default function VendorDashboardCharts({ data = [] }) {
    const uid = useId().replace(/:/g, '')
    const rows = data.map((row) => ({
        name: row.name,
        revenue: Number(row.revenue) || 0,
        orders: Number(row.orders) || 0,
    }))

    const revenueTotal = rows.reduce((sum, row) => sum + row.revenue, 0)
    const ordersTotal = rows.reduce((sum, row) => sum + row.orders, 0)
    const revenuePeak = rows.reduce((best, row) => (row.revenue > best.revenue ? row : best), rows[0] || { name: '—', revenue: 0 })
    const ordersPeak = rows.reduce((best, row) => (row.orders > best.orders ? row : best), rows[0] || { name: '—', orders: 0 })
    const revenueAvg = rows.length ? revenueTotal / rows.length : 0
    const ordersAvg = rows.length ? ordersTotal / rows.length : 0
    const fillId = `vendorRevenueFill-${uid}`

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard
                eyebrow="Last 7 days"
                title="Store revenue"
                value={formatINR(revenueTotal)}
                hint="Paid order value"
                stats={[
                    { label: 'Best day', value: revenuePeak.revenue ? `${revenuePeak.name} · ${formatINR(revenuePeak.revenue)}` : '—' },
                    { label: 'Daily avg', value: formatINR(revenueAvg) },
                    { label: 'Days', value: String(rows.length || 0) },
                ]}
                emptyLabel={revenueTotal === 0 ? 'No revenue in the last 7 days' : undefined}
            >
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={rows} margin={CHART_MARGIN}>
                        <defs>
                            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={BRAND_GREEN} stopOpacity={0.22} />
                                <stop offset="100%" stopColor={BRAND_GREEN} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 8" stroke="#e4eee6" vertical={false} />
                        <XAxis dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                        <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={44} />
                        <Tooltip content={<ChartTooltip valueFormatter={formatINR} unit="revenue" />} />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke={BRAND_GREEN}
                            fill={`url(#${fillId})`}
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard
                eyebrow="Last 7 days"
                title="Orders"
                value={ordersTotal.toLocaleString('en-IN')}
                hint="Orders placed in your store"
                stats={[
                    { label: 'Peak', value: ordersPeak.orders ? `${ordersPeak.name} · ${ordersPeak.orders}` : '—' },
                    { label: 'Daily avg', value: ordersAvg ? ordersAvg.toFixed(1).replace(/\.0$/, '') : '0' },
                    { label: 'Total', value: String(ordersTotal) },
                ]}
                emptyLabel={ordersTotal === 0 ? 'No orders in the last 7 days' : undefined}
            >
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rows} margin={CHART_MARGIN} barCategoryGap="28%">
                        <CartesianGrid strokeDasharray="4 8" stroke="#e4eee6" vertical={false} />
                        <XAxis dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                        <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={32} allowDecimals={false} />
                        <Tooltip
                            cursor={{ fill: '#eef4ef' }}
                            content={<ChartTooltip valueFormatter={(v) => Number(v).toLocaleString('en-IN')} unit="orders" />}
                        />
                        <Bar dataKey="orders" fill={BRAND_GREEN} radius={[8, 8, 0, 0]} maxBarSize={32} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>
        </div>
    )
}
