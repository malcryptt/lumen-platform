import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Nightly Maintenance: Purge ephemeral data according to Section 19.1.
 * Runs at Midnight UTC.
 */
export function registerPurgeJobs() {
    // 00:00 UTC
    cron.schedule('0 0 * * *', async () => {
        console.log('[LumenCron] Running nightly database maintenance...');

        try {
            // 1. Purge events older than 24 hours
            const eventPurgeDate = new Date();
            eventPurgeDate.setHours(eventPurgeDate.getHours() - 24);

            const deletedEvents = await prisma.deployEvent.deleteMany({
                where: { createdAt: { lt: eventPurgeDate } }
            });
            console.log(`[LumenCron] Purged ${deletedEvents.count} deployment events.`);

            // 2. Purge chat messages older than 30 days
            const chatPurgeDate = new Date();
            chatPurgeDate.setDate(chatPurgeDate.getDate() - 30);

            const deletedChats = await prisma.chatMessage.deleteMany({
                where: { createdAt: { lt: chatPurgeDate } }
            });
            console.log(`[LumenCron] Purged ${deletedChats.count} chat messages.`);

            // 3. Purge logs older than 90 days
            const logPurgeDate = new Date();
            logPurgeDate.setDate(logPurgeDate.getDate() - 90);

            const deletedLogs = await prisma.deployLog.deleteMany({
                where: { timestamp: { lt: logPurgeDate } }
            });
            console.log(`[LumenCron] Purged ${deletedLogs.count} stale deploy logs.`);

        } catch (err: any) {
            console.error('[LumenCron] Database maintenance failed:', err.message);
        }
    });

    console.log('[LumenCron] Nightly purge jobs registered.');
}
