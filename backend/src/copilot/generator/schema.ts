import { z } from 'zod';

/**
 * Full Lumen Deploy Config schema validator.
 * Mirrors the spec in Section 4.1 of the v2 MVP spec.
 */

const VALID_RUNTIMES = ['node', 'python', 'go', 'rust', 'ruby', 'docker'] as const;
const VALID_REGIONS = ['oregon', 'ohio', 'singapore', 'frankfurt'] as const;
const VALID_PLANS = ['free', 'starter', 'standard'] as const;

export const LumenConfigSchema = z.object({
    deploy: z.object({
        name: z.string().min(1, 'Service name is required'),
        provider: z.literal('render', { errorMap: () => ({ message: "Only 'render' supported in MVP" }) }),
        region: z.enum(VALID_REGIONS).optional().default('oregon'),
        plan: z.enum(VALID_PLANS).optional().default('free'),

        build: z.object({
            runtime: z.enum(VALID_RUNTIMES, {
                errorMap: () => ({ message: `Runtime must be one of: ${VALID_RUNTIMES.join(', ')}` })
            }),
            version: z.string().optional(),
            command: z.string().min(1, 'Build command is required'),
            root: z.string().optional(), // monorepo support
        }),

        start: z.object({
            command: z.string().min(1, 'Start command is required'),
            port: z.number().int().positive().optional().default(3000),
            health: z.string().optional(), // e.g. "/health"
        }),

        env: z.record(z.string()).optional(),

        scale: z.object({
            instances: z.number().int().positive().optional().default(1),
            autoscale: z.boolean().optional().default(false),
        }).optional(),
    })
});

export type LumenConfig = z.infer<typeof LumenConfigSchema>;

export interface ValidationResult {
    valid: boolean;
    errors: string[];
    config?: LumenConfig;
}

/**
 * Parses and validates a .lumen config JSON object.
 * Lumen config is stored as a JSON object internally; the text representation
 * is generated from it for display.
 */
export function validateLumenConfig(config: unknown): ValidationResult {
    const result = LumenConfigSchema.safeParse(config);
    if (result.success) {
        return { valid: true, errors: [], config: result.data };
    }
    return {
        valid: false,
        errors: result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`)
    };
}

/**
 * Converts a structured config object to a human-readable .lumen text format.
 */
export function configToText(config: LumenConfig): string {
    const d = config.deploy;
    const envLines = d.env
        ? Object.entries(d.env).map(([k, v]) => `    ${k}: ${v}`).join('\n')
        : '';

    return `deploy {
  name:     "${d.name}"
  provider: ${d.provider}
  region:   ${d.region || 'oregon'}
  plan:     ${d.plan || 'free'}

  build {
    runtime: ${d.build.runtime}${d.build.version ? `\n    version: "${d.build.version}"` : ''}
    command: "${d.build.command}"${d.build.root ? `\n    root:    "${d.build.root}"` : ''}
  }

  start {
    command: "${d.start.command}"
    port:    ${d.start.port || 3000}${d.start.health ? `\n    health:  "${d.start.health}"` : ''}
  }
${envLines ? `\n  env {\n${envLines}\n  }\n` : ''}${d.scale ? `  scale {
    instances: ${d.scale.instances || 1}
    autoscale: ${d.scale.autoscale || false}
  }` : ''}}`;
}
