'use client'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { BRAND_GREEN } from '@/lib/brand-ui'

export default function VendorRevenueChart({ data }) {
    return (
        <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 8" stroke="#e4eee6" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e4eee6', boxShadow: '0 12px 28px rgba(31,41,55,0.1)' }}
                    formatter={(value) => [`₹${Number(value || 0).toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke={BRAND_GREEN} fill={BRAND_GREEN} fillOpacity={0.16} strokeWidth={2} />
            </AreaChart>
        </ResponsiveContainer>
    )
}
