import type { Request, Response } from "express";
import { emitEvent } from "../events";
import { firebot, logger } from "../main";

// These need to stay as 'require' to allow the embedded static files to be used
// when the script is run in Firebot.
const defaultCss = require("../../static/credits.css");
const defaultConfig = require("../../static/credits-config.js");
const defaultHtml = require("../../static/credits.html");
const defaultScript = require("../../static/credits.js");

type Generation = {
    timestamp: number;
    configContent: string;
    cssContent: string;
    htmlContent: string;
    scriptContent: string;
    jsonData: string;
}

export class Server {
    private generations = new Map<string, Generation>();
    private cleanupInterval: NodeJS.Timeout | null = null;
    private isRegistered = false;

    public start() {
        if (this.isRegistered) {
            logger.warn("Server routes are already registered.");
            return;
        }

        const { httpServer } = firebot.modules;

        // Legacy endpoint for backward compatibility
        httpServer.registerCustomRoute('mage-credits-generator', "/credits.html", "GET", async (req: Request, res: Response) => {
            this.handleLegacyCreditsRequest(req, res);
        });

        // Component routes with generation ID parameter
        httpServer.registerCustomRoute('mage-credits-generator', "/:generationId/config.js", "GET", (req: Request, res: Response) => {
            this.handleConfigRequest(req, res);
        });

        httpServer.registerCustomRoute('mage-credits-generator', "/:generationId/style.css", "GET", (req: Request, res: Response) => {
            this.handleStyleRequest(req, res);
        });

        httpServer.registerCustomRoute('mage-credits-generator', "/:generationId/credits.html", "GET", (req: Request, res: Response) => {
            this.handleHtmlRequest(req, res);
        });

        httpServer.registerCustomRoute('mage-credits-generator', "/:generationId/script.js", "GET", (req: Request, res: Response) => {
            this.handleScriptRequest(req, res);
        });

        httpServer.registerCustomRoute('mage-credits-generator', "/:generationId/data.json", "GET", (req: Request, res: Response) => {
            this.handleDataRequest(req, res);
        });

        httpServer.registerCustomRoute('mage-credits-generator', "/:generationId/complete", "GET", (req: Request, res: Response) => {
            this.handleGenerationCompleteRequest(req, res);
        });

        this.cleanupInterval = setInterval(() => {
            this.cleanupGenerations();
        }, 60000); // Cleanup every minute

        this.isRegistered = true;
        logger.info("Server registered.");
    }

    public stop() {
        if (!this.isRegistered) {
            logger.warn("Server routes are not registered.");
            return;
        }

        const { httpServer } = firebot.modules;
        httpServer.unregisterCustomRoute('mage-credits-generator', "/credits.html", "GET");
        httpServer.unregisterCustomRoute('mage-credits-generator', "/:generationId/config.js", "GET");
        httpServer.unregisterCustomRoute('mage-credits-generator', "/:generationId/style.css", "GET");
        httpServer.unregisterCustomRoute('mage-credits-generator', "/:generationId/credits.html", "GET");
        httpServer.unregisterCustomRoute('mage-credits-generator', "/:generationId/script.js", "GET");
        httpServer.unregisterCustomRoute('mage-credits-generator', "/:generationId/data.json", "GET");
        httpServer.unregisterCustomRoute('mage-credits-generator', "/:generationId/complete", "GET");

        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }

        this.isRegistered = false;
        logger.info("Server unregistered.");
    }

    public generateCredits(jsonData: string, configPath: string, cssPath: string, htmlPath: string, scriptPath: string) {
        const generationId = this.generateUniqueId();
        const configContent = this.staticContent(configPath, defaultConfig);
        const cssContent = this.staticContent(cssPath, defaultCss);
        const htmlContent = this.staticContent(htmlPath, defaultHtml);
        const scriptContent = this.staticContent(scriptPath, defaultScript);

        this.generations.set(generationId, {
            timestamp: Date.now(),
            configContent,
            cssContent,
            htmlContent,
            scriptContent,
            jsonData
        });

        logger.info(`Credits generation created with ID: ${generationId}`);
        return `integrations/mage-credits-generator/${generationId}/credits.html`;
    }

    private cleanupGenerations() {
        const now = Date.now();
        this.generations.forEach((generation, key) => {
            if (now - generation.timestamp > 60000) { // 1 minute expiration
                this.generations.delete(key);
            }
        });
    }

    private generateUniqueId(): string {
        return crypto.randomUUID();
    }

    private getMostRecentGenerationId(): string | null {
        if (this.generations.size === 0) {
            return null;
        }

        let mostRecentId = '';
        let mostRecentTimestamp = 0;

        this.generations.forEach((generation, generationId) => {
            if (generation.timestamp > mostRecentTimestamp) {
                mostRecentTimestamp = generation.timestamp;
                mostRecentId = generationId;
            }
        });

        return mostRecentId;
    }

    private handleLegacyCreditsRequest(req: Request, res: Response) {
        const generationId = req.query.generationId as string;

        if (generationId) {
            // Redirect to new URL structure with generation ID in path
            logger.warn(`handleLegacyCreditsRequest: Redirect to specified generation ID ${generationId}`);
            res.redirect(`/integrations/mage-credits-generator/${generationId}/credits.html`);
            return;
        }

        // Find the most recent generation ID
        const mostRecentGenerationId = this.getMostRecentGenerationId();
        if (mostRecentGenerationId) {
            logger.warn(`handleLegacyCreditsRequest: Redirect to most recent generation ID ${mostRecentGenerationId}`);
            res.redirect(`/integrations/mage-credits-generator/${mostRecentGenerationId}/credits.html`);
            return;
        }

        // No generations available
        logger.error("handleLegacyCreditsRequest: No credits generations available");
        res.status(404).json({ error: "No credits generations available" });
    }

    private getGenerationIdFromUrl(url: string): string | null {
        const parts = url.split('/');
        if (parts.length >= 2) {
            return parts[parts.length - 2];
        }
        return null;
    }

    private getGenerationFromRequest(req: Request, res: Response, handlerName: string): Generation | null {
        const generationId = this.getGenerationIdFromUrl(req.url);
        if (!generationId) {
            logger.error(`${handlerName}: Invalid generation ID in URL`);
            res.status(400).json({ error: "Invalid generation ID" });
            return null;
        }

        const generation = this.generations.get(generationId);
        if (!generation) {
            logger.error(`${handlerName}: Generation not found for ID: ${generationId}`);
            res.status(404).json({ error: "Generation not found" });
            return null;
        }

        return generation;
    }

    private handleConfigRequest(req: Request, res: Response) {
        const generation = this.getGenerationFromRequest(req, res, 'handleConfigRequest');
        if (!generation) {
            return;
        }

        res.setHeader('Content-Type', 'application/javascript');
        res.send(generation.configContent);
    }

    private handleStyleRequest(req: Request, res: Response) {
        const generation = this.getGenerationFromRequest(req, res, 'handleStyleRequest');
        if (!generation) {
            return;
        }

        res.setHeader('Content-Type', 'text/css');
        res.send(generation.cssContent);
    }

    private handleHtmlRequest(req: Request, res: Response) {
        const generation = this.getGenerationFromRequest(req, res, 'handleHtmlRequest');
        if (!generation) {
            return;
        }

        res.setHeader('Content-Type', 'text/html');
        res.send(generation.htmlContent);
    }

    private handleScriptRequest(req: Request, res: Response) {
        const generation = this.getGenerationFromRequest(req, res, 'handleScriptRequest');
        if (!generation) {
            return;
        }

        res.setHeader('Content-Type', 'application/javascript');
        res.send(generation.scriptContent);
    }

    private handleDataRequest(req: Request, res: Response) {
        const generation = this.getGenerationFromRequest(req, res, 'handleDataRequest');
        if (!generation) {
            return;
        }

        res.setHeader('Content-Type', 'application/json');
        res.send(generation.jsonData);
    }

    private handleGenerationCompleteRequest(req: Request, res: Response) {
        const generationId = this.getGenerationIdFromUrl(req.url);
        if (!generationId) {
            return;
        }

        logger.info(`handleGenerationCompleteRequest: Credits playback completed for ID: ${generationId}`);
        emitEvent('mage-credits-generator', 'credits-ended', { generationId }, false);
        res.status(204).send();
    }

    private staticContent(path: string, defaultContent: string): string {
        if (!path) {
            return defaultContent;
        }

        const { fs } = firebot.modules;
        if (fs.existsSync(path)) {
            return fs.readFileSync(path, 'utf-8');
        }
        return defaultContent;
    }
}
