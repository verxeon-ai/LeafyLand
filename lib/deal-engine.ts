import prisma from '@/lib/prisma'

export async function broadcastDeal(entityId: string, entityType: 'RFQ' | 'TENDER', category: string, metroCityId?: string) {
    // Create a new DealRadar entry
    const deal = await prisma.dealRadar.create({
        data: {
            entityId,
            entityType,
            category,
            metroCityId,
            status: 'OPEN'
        }
    });

    // In a real application, you would use WebSockets or SSE here to push the deal to connected vendors.
    // e.g. pusher.trigger(`radar-${category}-${metroCityId}`, 'new-deal', deal);
    
    return deal;
}

export async function acceptDeal(dealRadarId: string, vendorId: string) {
    // Transactional locking using Prisma's update with `where: { status: 'OPEN' }`
    try {
        const result = await prisma.$transaction(async (tx) => {
            const deal = await tx.dealRadar.findUnique({
                where: { id: dealRadarId }
            });

            if (!deal || deal.status !== 'OPEN') {
                throw new Error("Deal is no longer available.");
            }

            // Lock the deal by changing status to LOCKED
            // The where clause ensures it only updates if it's still OPEN
            const updatedDeal = await tx.dealRadar.update({
                where: { id: dealRadarId, status: 'OPEN' },
                data: { status: 'LOCKED' }
            });

            // Record the acceptance
            const acceptance = await tx.dealAcceptance.create({
                data: {
                    dealRadarId,
                    vendorId,
                    status: 'ACCEPTED'
                }
            });

            return { success: true, deal: updatedDeal, acceptance };
        });

        return result;
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
