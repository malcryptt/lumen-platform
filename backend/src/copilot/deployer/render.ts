import axios, { AxiosInstance } from 'axios';

/**
 * Render API client for Lumen Copilot module
 * Responsible for interacting with Render Services API.
 */
export class RenderClient {
    private client: AxiosInstance;

    constructor(apiKey: string) {
        this.client = axios.create({
            baseURL: 'https://api.render.com/v1',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * Creates a new web service on Render.
     * @param config Service configuration
     */
    async createWebService(config: {
        name: string,
        repoUrl: string,
        runtime: string,
        buildCommand: string,
        startCommand: string,
        envVars: Record<string, string>
    }) {
        const payload = {
            type: "web_service",
            name: config.name,
            repo: config.repoUrl,
            env: config.runtime === "node" ? "node" : "docker", // Simplified mapping
            serviceDetails: {
                buildCommand: config.buildCommand,
                startCommand: config.startCommand,
                envVars: Object.entries(config.envVars).map(([key, value]) => ({
                    key,
                    value
                }))
            }
        };

        try {
            const response = await this.client.post('/services', payload);
            return response.data;
        } catch (error: any) {
            console.error("[RenderClient] Create failed:", error.response?.data || error.message);
            throw new Error(`Render deployment failed: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Poll status of a web service.
     * @param serviceId Render Service ID
     */
    async getServiceStatus(serviceId: string) {
        const response = await this.client.get(`/services/${serviceId}`);
        return response.data;
    }

    /**
     * Get deployment logs.
     * @param serviceId Render Service ID
     */
    async getDeploymentLogs(serviceId: string) {
        const response = await this.client.get(`/services/${serviceId}/deploys`);
        const latestDeploy = response.data[0];
        if (!latestDeploy) return [];

        // Render doesn't have a simple "get all logs as text" API via REST easily,
        // but we can poll the status. Real log streaming usually happens via Webhook or specialized endpoints.
        return latestDeploy;
    }
}
