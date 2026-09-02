'use client'
import { useState } from 'react'
import { Send, CheckCheck, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '@/components/admin/PageHeader'
import EmptyState from '@/components/admin/EmptyState'
import { AdminError, AdminTableSkeleton } from '@/components/admin/AdminStates'
import { useCachedJson } from '@/lib/useCachedJson'
import {
    brandCardClass,
    brandInputClass,
    brandPrimaryCtaClass,
    BRAND_GREEN,
} from '@/lib/brand-ui'

export default function VendorMessages() {
    const { data: messages, loading, error, reload } = useCachedJson('/api/vendor/messages', 'list')
    const [selectedMsg, setSelectedMsg] = useState(null)
    const [replyText, setReplyText] = useState('')

    const load = () => reload({ silent: true })

    const unreadCount = messages.filter(m => !m.read).length

    const handleReply = async () => {
        if (!replyText.trim() || !selectedMsg) return
        const res = await fetch('/api/vendor/messages', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: selectedMsg.id, reply: replyText, read: true }),
        })
        if (!res.ok) return toast.error('Could not send reply')
        toast.success('Reply sent')
        setReplyText('')
        setSelectedMsg(null)
        load()
    }

    const openMessage = async (msg) => {
        setSelectedMsg(msg)
        if (!msg.read) {
            await fetch('/api/vendor/messages', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: msg.id, read: true }),
            })
            load()
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Vendor"
                title="Messages"
                description={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            />

            {loading && messages.length === 0 ? (
                <AdminTableSkeleton />
            ) : error && messages.length === 0 ? (
                <AdminError message={error} onRetry={reload} />
            ) : messages.length === 0 ? (
                <EmptyState icon={MessageSquare} title="No customer messages yet" description="When customers write to your store, they appear here" />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-2">
                        {messages.map(msg => (
                            <button
                                key={msg.id}
                                type="button"
                                onClick={() => openMessage(msg)}
                                className={`w-full text-left p-4 rounded-xl border transition-all ${
                                    selectedMsg?.id === msg.id
                                        ? 'bg-[#eef4ef] border-[#e4eee6]'
                                        : msg.read
                                            ? 'bg-white border-slate-100 hover:bg-slate-50'
                                            : 'bg-white border-[#2f7d4a]/30 shadow-sm'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 bg-[#eef4ef] rounded-full flex items-center justify-center shrink-0">
                                        <span className="text-xs font-bold text-[#2f7d4a]">{(msg.customer || '?').charAt(0)}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-semibold text-slate-700 truncate">{msg.customer || 'Customer'}</p>
                                            {!msg.read && <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: BRAND_GREEN }} />}
                                        </div>
                                        <p className="text-xs text-slate-500 truncate mt-0.5">{msg.message}</p>
                                        <p className="text-[10px] text-slate-400 mt-1">{msg.date ? new Date(msg.date).toLocaleDateString() : ''}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="lg:col-span-2">
                        {selectedMsg ? (
                            <div className={`${brandCardClass} p-6`}>
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                                    <div className="w-10 h-10 bg-[#eef4ef] rounded-full flex items-center justify-center">
                                        <span className="text-sm font-bold text-[#2f7d4a]">{(selectedMsg.customer || '?').charAt(0)}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-700">{selectedMsg.customer || 'Customer'}</p>
                                        <p className="text-xs text-slate-400">{selectedMsg.date ? new Date(selectedMsg.date).toLocaleString() : ''}</p>
                                    </div>
                                </div>

                                <div className="bg-[#f4f8f5] rounded-xl p-4 mb-4">
                                    <p className="text-sm text-slate-700">{selectedMsg.message}</p>
                                </div>

                                {selectedMsg.reply && (
                                    <div className="bg-[#eef4ef] rounded-xl p-4 mb-4 ml-8">
                                        <div className="flex items-center gap-1.5 mb-1.5">
                                            <CheckCheck size={12} className="text-[#2f7d4a]" />
                                            <span className="text-[10px] font-semibold text-[#2f7d4a]">Your Reply</span>
                                        </div>
                                        <p className="text-sm text-slate-700">{selectedMsg.reply}</p>
                                    </div>
                                )}

                                {!selectedMsg.reply && (
                                    <div className="mt-4">
                                        <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="Type your reply..."
                                            rows={3}
                                            className={`${brandInputClass} resize-none`}
                                        />
                                        <div className="flex justify-end mt-3">
                                            <button
                                                type="button"
                                                onClick={handleReply}
                                                disabled={!replyText.trim()}
                                                className={`${brandPrimaryCtaClass} disabled:bg-slate-200 disabled:text-slate-400`}
                                                style={replyText.trim() ? { backgroundColor: BRAND_GREEN } : undefined}
                                            >
                                                <Send size={14} /> Send Reply
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <EmptyState icon={MessageSquare} title="Select a message" description="Choose a conversation to view details" />
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
