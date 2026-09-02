'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { brandCardClass, brandLabelClass, BRAND_GREEN, BRAND_TEXT } from '@/lib/brand-ui'

const COLORS = [BRAND_GREEN, '#5b946c', '#c4a35a', '#6b7280', '#256b3f', '#8fbc9a']

export default function VendorAnalyticsCharts({ monthlyRevenueData, categoryData }) {
    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className={`${brandCardClass} p-5`}>
                <p className={brandLabelClass} style={{ color: BRAND_GREEN }}>Revenue</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-800">Monthly revenue</h2>
                <div className="mt-4 w-full" style={{ minWidth: 0 }}>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={monthlyRevenueData}>
                            <CartesianGrid strokeDasharray="4 8" stroke="#e4eee6" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={40} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: '1px solid #e4eee6', boxShadow: '0 12px 28px rgba(31,41,55,0.1)' }}
                                formatter={(value) => [`₹${Number(value || 0).toLocaleString('en-IN')}`, 'Revenue']}
                            />
                            <Bar dataKey="revenue" fill={BRAND_GREEN} radius={[8, 8, 0, 0]} maxBarSize={32} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className={`${brandCardClass} p-5`}>
                <p className={brandLabelClass} style={{ color: BRAND_GREEN }}>Mix</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-800">Sales by category</h2>
                {categoryData.length === 0 ? (
                    <p className="mt-6 text-sm text-slate-500">No sales data yet.</p>
                ) : (
                    <div className="mt-4 flex items-center gap-6">
                        <div className="w-1/2" style={{ minWidth: 0 }}>
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} innerRadius={40} dataKey="value">
                                        {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex-1 space-y-2">
                            {categoryData.slice(0, 6).map((cat, i) => (
                                <div key={cat.name} className="flex items-center gap-2">
                                    <div className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                    <span className="truncate text-xs text-slate-600">{cat.name}</span>
                                    <span className="ml-auto text-xs font-semibold" style={{ color: BRAND_TEXT }}>{cat.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
