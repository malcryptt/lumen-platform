import { DeployStatus, PrismaClient } from '@prisma/client';
import { LUMEN_KNOWLEDGE_DOC } from './knowledge.js';

const prisma = new PrismaClient();

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface SessionContext {
    id: string;
    status: DeployStatus;
    runtime: string | null;
    isMonorepo: boolean;
    lastError: string | null;
    hasDiagnosis: boolean;
    renderPlan: string;
}

/**
 * Builds the Groq system prompt and manages chat history.
 * Implements the 10 -> 5 -> 3 message truncation strategy to fit context windows.
 */
export async function buildChatContext(sessionId: string, history: ChatMessage[]) {
    const session = await prisma.deploySession.findUnique({
        where: { id: sessionId },
        include: { serviceStatuses: true }
    });

    if (!session) throw new Error('Session not found');

    const scanRes = session.scanResult as any;

    const context: SessionContext = {
        id: session.id,
        status: session.status,
        runtime: scanRes?.runtime || null,
        isMonorepo: scanRes?.isMonorepo || false,
        lastError: session.diagnosis ? (JSON.parse(session.diagnosis)?.root_cause || null) : null,
        hasDiagnosis: !!session.diagnosis,
        renderPlan: 'free' // Defaulting to free for MVP
    };

    const systemPrompt = `You are Lumen Copilot, an AI deployment assistant built into the Lumen platform. 
    You help developers deploy backend projects to Render using Lumen deploy configs. 
    You are knowledgeable about Node.js, Python, Go, Rust, Ruby, and Docker deployments. 
    You are direct, clear, and technical. You never make things up. If you do not know something, you say so. 
    You do not write code for the user unless asked. You focus on deployment, config, and infrastructure topics. 
    For any action that triggers a side effect (redeploy, apply a config fix), you always ask for explicit confirmation before proceeding.

    --- LUMEN KNOWLEDGE DOCUMENT ---
    ${LUMEN_KNOWLEDGE_DOC}
    --------------------------------

    Current deployment session state:
    - Session ID: ${context.id}
    - Status: ${context.status}
    - Runtime: ${context.runtime || 'unknown'}
    - Is monorepo: ${context.isMonorepo ? 'yes' : 'no'}
    - Service count: ${session.serviceStatuses.length || 1}
    - Diagnosis available: ${context.hasDiagnosis ? 'yes' : 'no'}
    ${context.lastError ? `- Last error summary: ${context.lastError.slice(0, 300)}` : ''}
    - Render plan: ${context.renderPlan}`;

    // Truncate history strategy (10 -> 5 -> 3)
    let finalHistory = history.slice(-10);

    // Simple mock logic for determining if history is too long
    // In reality, this would count tokens
    const totalChars = finalHistory.reduce((acc, msg) => acc + msg.content.length, 0);

    if (totalChars > 4000) {
        finalHistory = history.slice(-5);
        if (finalHistory.reduce((acc, msg) => acc + msg.content.length, 0) > 4000) {
            finalHistory = history.slice(-3);
        }
    }

    return { systemPrompt, history: finalHistory };
}
