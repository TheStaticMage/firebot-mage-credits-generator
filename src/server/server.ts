import type { Request, Response } from "express";
import { firebot, logger } from "../main";
import { emitEvent } from "../events";

// These need to stay as 'require' to allow the embedded static files to be used
// when the script is run in Firebot.
const defaultCss = require("../../static/credits.css");
const defaultConfig = require("../../static/credits-config.js");
const defaultHtml = require("../../static/credits.html");
const defaultScript = require("../../static/credits.js");

type Generation = {
    content: string;
    timestamp: number;
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
        httpServer.registerCustomRoute('mage-credits-generator', "/credits.html", "GET", async (req: Request, res: Response) => {
            this.handleCreditsRequest(req, res);
        });
        httpServer.registerCustomRoute('mage-credits-generator', "/complete", "GET", (req: Request, res: Response) => {
            this.handleCompleteRequest(req, res);
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

        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }

        this.isRegistered = false;
        logger.info("Server unregistered.");
    }

    public generateCredits(jsonData: string, configPath: string, cssPath: string, htmlPath: string, scriptPath: string) {
        const generationId = this.generateUniqueId();
        this.generations.set(generationId, {
            content: this.renderCredits(jsonData, configPath, cssPath, htmlPath, scriptPath),
            timestamp: Date.now()
        });
        return `integrations/mage-credits-generator/credits.html?generationId=${generationId}`;
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

    private handleCompleteRequest(req: Request, res: Response) {
        const generationId = req.query.generationId as string;
        emitEvent('mage-credits-generator', 'credits-ended', { generationId }, false);
        res.status(204).send();
    }

    private handleCreditsRequest(req: Request, res: Response) {
        const generationId = req.query.generationId as string;
        if (!generationId || !this.generations.has(generationId)) {
            res.status(404).send("Generation not found.");
            return;
        }

        const generation = this.generations.get(generationId);
        if (!generation) {
            res.status(404).send("Generation not found.");
            return;
        }

        res.setHeader('Content-Type', 'text/html');
        res.send(generation.content);
    }

    private renderCredits(jsonData: string, configPath: string, cssPath: string, htmlPath: string, scriptPath: string): string {
        const configContent = this.staticContent(configPath, defaultConfig);
        const cssContent = this.staticContent(cssPath, defaultCss);
        const htmlContent = this.staticContent(htmlPath, defaultHtml);
        const scriptContent = this.staticContent(scriptPath, defaultScript);
        const encodedData = Buffer.from(jsonData).toString('base64');
        const result = htmlContent
            .replace("// Configuration placeholder", `${configContent}\n`)
            .replace("/* Style placeholder */", `${cssContent}\n`)
            .replace("// Credits code placeholder", `${scriptContent}\n`)
            .replace("// Definition placeholder", `const data = "${encodedData}";\n`);
        return result;
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
