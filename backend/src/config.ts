import process from 'node:process';
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
    GEMINI_API_KEY: z.string().optional(),
    GROQ_API_KEY: z.string().optional(),
    RENDER_API_KEY: z.string().optional(),
    PORT: z.string().default('3001'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error("❌ Invalid environment variables:", _env.error.format());
    // Fail gently during development if keys are missing
}

export const config = _env.success ? _env.data : {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    GROQ_API_KEY: process.env.GROQ_API_KEY || '',
    RENDER_API_KEY: process.env.RENDER_API_KEY || '',
    PORT: process.env.PORT || '3001',
};
