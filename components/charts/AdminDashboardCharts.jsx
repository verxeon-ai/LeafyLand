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
    Cell,
} from 'recharts'
import { LineChart, Minus, TrendingDown, TrendingUp } from 'lucide-react'
import DetailSlideOver from '@/components/admin/DetailSlideOver'
import { brandCardClass, brandLabelClass, brandSecondaryCtaClass, BRAND_GREEN, BRAND_MUTED, BRAND_TEXT } from '@/lib/brand-ui'

const AXIS_TICK = { fontSize: 11, fill: '#6b7280' }
const CHART_MARGIN = { top: 20, right: 16, left: 4, bottom: 12 }

function formatINR(value) {
    const n = Math.round(Number(value) || 0)
    if (n >= 10000000) {
        const cr = n / 10000000
        return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(1)}Cr`
    }
    if (n >= 100000) {
        const lakh = n / 100000
        return `₹${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(1)}L`
    }
    return `₹${n.toLocaleString('en-IN')}`
}

function axisINR(value) {
    const n = Number(value) || 0
    if (n >= 10000000) return `₹${Math.round(n / 10000000)}Cr`
    if (n >= 100000) return `₹${Math.round(n / 100000)}L`
    if (n >= 1000) return `₹${n % 1000 === 0 ? n / 1000 : (n / 1000).toFixed(1)}k`
    return `₹${Math.round(n)}`
}

function niceDomain(max, fallback = 4) {
    const n = Number(max) || 0
    if (n <= 0) return fallback
    const padded = n * 1.2
    const pow = Math.pow(10, Math.floor(Math.log10(padded)))
    const normalized = padded / pow
    const nice =
        normalized <= 1 ? 1
        : normalized <= 1.5 ? 1.5
        : normalized <= 2 ? 2
        : normalized <= 3 ? 3
        : normalized <= 4 ? 4
        : normalized <= 5 ? 5
        : normalized <= 6 ? 6
        : normalized <= 8 ? 8
        : 10
    return nice * pow
}

function formatAvg(value) {
    const n = Number(value) || 0
    if (n === 0) return '0'
    if (n < 10) return n.toFixed(1).replace(/\.0$/, '')
    return String(Math.round(n))
}

function TrendChip({ current, previous, emptyLabel }) {
    if (previous == null) return null
    const cur = Number(current) || 0
    const prev = Number(previous) || 0

    if (cur === 0 && prev === 0) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#eef4ef] px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                <Minus size={12} />
                {emptyLabel}
            </span>
        )
    }

    if (cur === 0 && prev > 0) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#eef4ef] px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                <Minus size={12} />
                Quiet vs last period
            </span>
        )
    }

    if (prev === 0 && cur > 0) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#eef4ef] px-2.5 py-1 text-[11px] font-semibold" style={{ color: BRAND_GREEN }}>
                <TrendingUp size={12} />
                New activity
            </span>
        )
    }

    const pct = Math.round(((cur - prev) / prev) * 100)
    if (pct === 0) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#eef4ef] px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                <Minus size={12} />
                Same as last period
            </span>
        )
    }
    const up = pct > 0
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                up ? 'bg-[#eef4ef] text-[#2f7d4a]' : 'bg-red-50 text-red-600'
            }`}
        >
            {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {up ? '+' : ''}{pct}% vs last
        </span>
    )
}

function ChartTooltip({ active, payload, label, valueFormatter, unit }) {
    if (!active || !payload?.length) return null
    const row = payload[0]
    if (row?.value == null) return null
    const date = row.payload?.date

    return (
        <div className="min-w-[140px] rounded-xl border border-[#e4eee6] bg-white px-3.5 py-2.5 shadow-[0_12px_28px_rgba(31,41,55,0.1)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                {label}{date ? ` · ${date}` : ''}
            </p>
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

function AxisTick({ x, y, payload, highlight }) {
    const hot = payload.value === highlight
    return (
        <text
            x={x}
            y={y + 12}
            textAnchor="middle"
            fontSize={11}
            fontWeight={hot ? 600 : 400}
            fill={hot ? BRAND_GREEN : '#6b7280'}
        >
            {payload.value}
        </text>
    )
}

function ChartCard({ eyebrow, title, value, hint, trend, children, stats, emptyLabel }) {
    const [showChart, setShowChart] = useState(false)

    return (
        <div className={brandCardClass}>
            <div className="flex items-start justify-between gap-3 px-5 pt-5">
                <div className="min-w-0">
                    <p className={brandLabelClass} style={{ color: BRAND_GREEN }}>{eyebrow}</p>
                    <p className="mt-1.5 text-[28px] font-bold leading-none tracking-tight" style={{ color: BRAND_TEXT }}>
                        {value}
                    </p>
                    <p className="mt-1.5 text-sm font-medium text-slate-500">{title}</p>
                    {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
                    {emptyLabel && <p className="mt-2 text-sm text-slate-500">{emptyLabel}</p>}
                </div>
                {trend}
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
                    subtitle={typeof value === 'string' || typeof value === 'number' ? String(value) : undefined}
                    compact
                >
                    <div className="h-52 w-full">
                        {children}
                    </div>
                </DetailSlideOver>
            ) : null}
        </div>
    )
}

export default function AdminDashboardCharts({
    ordersChartData = [],
    revenueChartData = [],
    ordersPreviousTotal,
}) {
    const uid = useId().replace(/:/g, '')
    const ordersFill = `ordersFill-${uid}`

    const orders = ordersChartData.map((row) => ({
        ...row,
        orders: Number(row.orders) || 0,
    }))
    const revenue = revenueChartData.map((row, i, arr) => ({
        ...row,
        name: String(row.name || '').replace(/^Sept$/i, 'Sep'),
        revenue: Number(row.revenue) || 0,
        isCurrent: row.isCurrent ?? i === arr.length - 1,
    }))

    const ordersTotal = orders.reduce((sum, row) => sum + row.orders, 0)
    const ordersPeak = orders.reduce((best, row) => (row.orders > best.orders ? row : best), orders[0] || { name: '—', orders: 0 })
    const ordersAvg = orders.length ? ordersTotal / orders.length : 0
    const orderMax = Math.max(0, ...orders.map((row) => row.orders))
    const orderDomain = niceDomain(orderMax, 4)
    const todayName = orders[orders.length - 1]?.name
    const ordersEmpty = ordersTotal === 0

    const revenueTotal = revenue.reduce((sum, row) => sum + row.revenue, 0)
    const revenuePeak = revenue.reduce((best, row) => (row.revenue > best.revenue ? row : best), revenue[0] || { name: '—', revenue: 0 })
    const revenueAvg = revenue.length ? revenueTotal / revenue.length : 0
    const lastMonth = revenue[revenue.length - 1]?.revenue || 0
    const lastComplete = revenue[revenue.length - 2]?.revenue || 0
    const prevComplete = revenue[revenue.length - 3]?.revenue || 0
    const revenueDomain = niceDomain(Math.max(0, ...revenue.map((row) => row.revenue)), 1000)
    const highlightMonth = revenuePeak.revenue ? revenuePeak.name : revenue[revenue.length - 1]?.name

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard
                eyebrow="Last 7 days"
                title="Orders overview"
                value={ordersTotal.toLocaleString('en-IN')}
                hint="Orders placed on the platform"
                trend={
                    <TrendChip
                        current={ordersTotal}
                        previous={ordersPreviousTotal}
                        emptyLabel="No change"
                    />
                }
                stats={[
                    { label: 'Peak', value: ordersPeak.orders ? `${ordersPeak.name} · ${ordersPeak.orders}` : '—' },
                    { label: 'Daily avg', value: formatAvg(ordersAvg) },
                    {
                        label: 'Prev. week',
                        value: ordersPreviousTotal == null ? '—' : String(ordersPreviousTotal),
                    },
                ]}
                emptyLabel={ordersEmpty ? 'No orders in the last 7 days' : undefined}
            >
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={orders} margin={CHART_MARGIN}>
                        <defs>
                            <linearGradient id={ordersFill} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={BRAND_GREEN} stopOpacity={ordersEmpty ? 0.06 : 0.22} />
                                <stop offset="100%" stopColor={BRAND_GREEN} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 8" stroke="#e4eee6" vertical={false} />
                        <XAxis
                            dataKey="name"
                            tick={(props) => <AxisTick {...props} highlight={todayName} />}
                            axisLine={false}
                            tickLine={false}
                            interval={0}
                            tickMargin={8}
                        />
                        <YAxis
                            tick={AXIS_TICK}
                            axisLine={false}
                            tickLine={false}
                            width={36}
                            allowDecimals={false}
                            domain={[0, orderDomain]}
                        />
                        <Tooltip
                            cursor={{ stroke: BRAND_GREEN, strokeWidth: 1, strokeDasharray: '4 4', strokeOpacity: 0.35 }}
                            content={
                                <ChartTooltip
                                    valueFormatter={(v) => Number(v).toLocaleString('en-IN')}
                                    unit="orders"
                                />
                            }
                        />
                        <Area
                            type="monotone"
                            dataKey="orders"
                            stroke={BRAND_GREEN}
                            fill={`url(#${ordersFill})`}
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            dot={ordersEmpty ? false : { r: 3, fill: '#fff', stroke: BRAND_GREEN, strokeWidth: 2 }}
                            activeDot={{ r: 5, fill: BRAND_GREEN, stroke: '#fff', strokeWidth: 2 }}
                            animationDuration={600}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard
                eyebrow="Last 6 months"
                title="Revenue"
                value={formatINR(revenueTotal)}
                hint="Gross order value"
                trend={
                    <TrendChip
                        current={lastComplete}
                        previous={prevComplete}
                        emptyLabel="No change"
                    />
                }
                stats={[
                    { label: 'Best month', value: revenuePeak.revenue ? `${revenuePeak.name} · ${formatINR(revenuePeak.revenue)}` : '—' },
                    { label: 'Monthly avg', value: formatINR(revenueAvg) },
                    { label: 'This month', value: formatINR(lastMonth) },
                ]}
                emptyLabel={revenueTotal === 0 ? 'No revenue in the last 6 months' : undefined}
            >
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenue} margin={CHART_MARGIN} barCategoryGap="28%">
                        <CartesianGrid strokeDasharray="4 8" stroke="#e4eee6" vertical={false} />
                        <XAxis
                            dataKey="name"
                            tick={(props) => <AxisTick {...props} highlight={highlightMonth} />}
                            axisLine={false}
                            tickLine={false}
                            interval={0}
                            tickMargin={8}
                        />
                        <YAxis
                            tick={AXIS_TICK}
                            axisLine={false}
                            tickLine={false}
                            width={48}
                            tickFormatter={axisINR}
                            domain={[0, revenueDomain]}
                        />
                        <Tooltip
                            cursor={{ fill: '#eef4ef' }}
                            content={<ChartTooltip valueFormatter={formatINR} unit="revenue" />}
                        />
                        <Bar
                            dataKey="revenue"
                            fill={BRAND_GREEN}
                            radius={[8, 8, 0, 0]}
                            maxBarSize={32}
                            animationDuration={600}
                        >
                            {revenue.map((entry) => (
                                <Cell
                                    key={entry.name}
                                    fill={entry.name === highlightMonth ? BRAND_GREEN : '#5b946c'}
                                    fillOpacity={entry.revenue ? 1 : 0}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>
        </div>
    )
}
