import { speak } from "./speech";

interface DiceRoll {
    dieType: string;
    dieValue: number;
}

interface DiceSet {
    count: number;
    dieType: string;
    dice: DiceRoll[];
    operation: number;
    operand?: number;
}

interface RollResult {
    constant: number;
    values: number[];
    total: number;
    text: string;
}

interface Roll {
    diceNotation: {
        set: DiceSet[];
        constant: number;
    };
    rollType: string;
    rollKind: string;
    result: RollResult;
}

interface RollMessage {
    id?: string;
    data: {
        action: string;
        rolls: Roll[];
        context: {
            name: string;
            userId: string;
            messageScope: string;
        };
    };
    eventType: string;
    userId: string;
    dateTime?: string | number;
    isMe?: boolean;
}

export interface LogEntry {
    isMe: boolean;
    name: string;
    text: string;
    raw: RollMessage;
    timestamp: number;
}

export class Logger {
    private isSubscribed = false;
    private broker: any = null;
    public logs: LogEntry[] = [];
    private seenIds = new Set<string>();

    private currentIndex: number = 0;
    private shortcutHandler: ((e: KeyboardEvent) => void) | null = null;
    private messageHandler: ((e: Event) => void) | null = null;
    private newestTimestamp = Date.now() - 60000; // 1 minute buffer

    subscribe(): void {
        if (this.isSubscribed) return;

        this.messageHandler = (e: any) => {
            this.logRoll(e.detail);
        };
        window.addEventListener("EnhanceAbilityDiceRoll", this.messageHandler);

        this.injectInterceptor();

        console.log("Logger: Subscribed to dice roll messages");
        this.registerShortcuts();
        this.isSubscribed = true;
    }

    private injectInterceptor() {
        if (document.getElementById("enhance-ability-interceptor")) return;

        const scriptContent = `
        (function() {
            if (window._enhanceInterceptorActive) return;
            
            const findBroker = () => {
                const sym = Symbol.for("@dndbeyond/message-broker-lib");
                return window[sym];
            };

            const attemptConnection = () => {
                const broker = findBroker();
                if (!broker) return false;

                window._enhanceInterceptorActive = true;
                
                broker.subscribe((msg) => {
                    if (msg.eventType === 'dice/roll/fulfilled') {
                        const isMe = (broker.userId === msg.userId);
                        const detail = Object.assign({}, msg);
                        detail.isMe = isMe;

                        window.dispatchEvent(new CustomEvent('EnhanceAbilityDiceRoll', { 
                            detail: detail
                        }));
                    }
                });
                return true;
            };

            if (!attemptConnection()) {
                const interval = setInterval(() => {
                    if (attemptConnection()) clearInterval(interval);
                }, 1000);
            }
        })();
        `;

        const script = document.createElement("script");
        script.id = "enhance-ability-interceptor";
        script.textContent = scriptContent;
        (document.head || document.documentElement).appendChild(script);
    }

    private registerShortcuts() {
        this.shortcutHandler = (e: KeyboardEvent) => {
            if (!e.altKey) return;

            if (e.code === "BracketLeft") {
                e.preventDefault();
                if (this.logs.length === 0) {
                    speak("No logs.");
                    return;
                }

                if (e.shiftKey) {
                    this.currentIndex = 0;
                } else {
                    if (this.currentIndex === -1) {
                        this.currentIndex = this.logs.length - 1;
                    } else if (this.currentIndex === 0) {
                        return;
                    } else {
                        this.currentIndex = Math.max(0, this.currentIndex - 1);
                    }
                }
                this.announceLog(this.currentIndex);
            }

            if (e.code === "KeyP") {
                e.preventDefault();
                if (this.currentIndex === -1) {
                    this.currentIndex = Math.max(0, this.logs.length - 1);
                    speak("Live mode Disabled");
                } else {
                    this.currentIndex = -1;
                    speak("Live Mode Enabled.");
                }
                return;
            }

            if (e.code === "BracketRight") {
                e.preventDefault();
                if (this.logs.length === 0) {
                    speak("No logs.");
                    return;
                }

                if (e.shiftKey) {
                    this.currentIndex = this.logs.length - 1;
                    this.announceLog(this.currentIndex);
                } else {
                    if (this.currentIndex === -1) {
                        speak("Live.");
                        return;
                    }

                    if (this.currentIndex >= this.logs.length - 1) {
                        return;
                    } else {
                        this.currentIndex++;
                        this.announceLog(this.currentIndex);
                    }
                }
            }
        };
        window.addEventListener("keydown", this.shortcutHandler);
    }

    public dispose() {
        if (this.shortcutHandler) {
            window.removeEventListener("keydown", this.shortcutHandler);
            this.shortcutHandler = null;
        }
        if (this.messageHandler) {
            window.removeEventListener(
                "EnhanceAbilityDiceRoll",
                this.messageHandler as any,
            );
            this.messageHandler = null;
        }
    }

    private announceLog(index: number) {
        const entry = this.logs[index];
        if (!entry) return;

        const timeAgo = this.getTimeAgo(entry.timestamp);
        const message = `${entry.text}. ${timeAgo}.`;
        speak(message);
    }

    private getTimeAgo(timestamp: number): string {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);

        if (seconds < 2) return "Just now";
        if (seconds < 60) return `${seconds} seconds ago`;

        const minutes = Math.floor(seconds / 60);
        if (minutes < 60)
            return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;

        return "Over a day ago";
    }

    private logRoll(message: RollMessage): void {
        if (message.id && this.seenIds.has(message.id)) return;
        if (message.id) this.seenIds.add(message.id);

        const data = message.data;
        const roll = data.rolls[0];

        const isMe = !!message.isMe;
        const source = isMe ? "You" : data.context.name;

        const nat20 = this.checkForNat(roll, 20);
        const nat1 = this.checkForNat(roll, 1);
        let alert = "";
        if (nat20) alert = "Natural 20! ";
        else if (nat1) alert = "Natural 1! ";

        let context = "";
        if (roll.rollKind === "advantage") context = " with advantage";
        if (roll.rollKind === "disadvantage") context = " with disadvantage";

        const line1 = `${source}: ${alert}${data.action}${context}: ${roll.result.total}`;
        const line2 = this.buildDiceBreakdown(roll);
        const line3 = this.buildExtraInfo(roll, message);

        const text = [line1, line2, line3].filter(Boolean).join("\n");

        let timestamp = Date.now();
        if (message.dateTime) {
            timestamp =
                typeof message.dateTime === "string"
                    ? parseInt(message.dateTime, 10)
                    : message.dateTime;
        }

        if (timestamp < this.newestTimestamp) return;
        this.newestTimestamp = timestamp;

        this.logs.push({
            isMe,
            name: data.context.name,
            text,
            raw: message,
            timestamp,
        });

        const isLive = this.currentIndex === -1;
        if (isMe || isLive) {
            let rollText = "";

            if (isMe) {
                rollText = `${alert}${data.action}${context}: ${roll.result.total}`;
            } else {
                rollText = `${source}: ${alert}${data.action}${context}: ${roll.result.total}`;
            }

            const spokenText = [rollText, line2, line3]
                .filter(Boolean)
                .join(". ");
            speak(spokenText);
        }
    }

    private buildDiceBreakdown(roll: Roll): string {
        const parts: string[] = [];

        for (const diceSet of roll.diceNotation.set) {
            const values = diceSet.dice.map((d) => d.dieValue);

            if (diceSet.operation === 2 || diceSet.operation === 1) {
                const used =
                    diceSet.operation === 2
                        ? Math.max(...values)
                        : Math.min(...values);

                values.forEach((v) => {
                    const status = v === used ? "" : " (ignored)";
                    parts.push(`${v}${status} from ${diceSet.dieType}`);
                });
            } else {
                for (const value of values) {
                    parts.push(`${value} from ${diceSet.dieType}`);
                }
            }
        }

        const diceStr = parts.join(", ");
        const modifier = roll.diceNotation.constant;
        const modStr =
            modifier !== 0
                ? `, ${modifier >= 0 ? "plus" : "minus"} ${Math.abs(modifier)}`
                : "";

        return `${diceStr}${modStr}`;
    }

    private buildExtraInfo(roll: Roll, message: RollMessage): string {
        const info: string[] = [];

        if (roll.rollKind === "critical hit") info.push("critical hit");

        if (message.data.context.messageScope === "userId") {
            info.push("whispered");
        }

        return info.join(", ");
    }

    private checkForNat(roll: Roll, target: number): boolean {
        for (const diceSet of roll.diceNotation.set) {
            if (diceSet.dieType === "d20") {
                return diceSet.dice.some((d) => d.dieValue === target);
            }
        }
        return false;
    }
}

export const patchLogInterface = () => {
    const logContainer = document.querySelector("#noty_layout__bottomRight");
    if (!logContainer) return;

    if (logContainer.getAttribute("role") === "alert") {
        logContainer.removeAttribute("role");
        logContainer.removeAttribute("aria-live");

        logContainer.setAttribute("role", "dialog");
        logContainer.setAttribute("aria-label", "Visual Log");
    }

    const clearButton = document.querySelector(
        ".dice_notification_controls__clear",
    );
    if (
        clearButton &&
        clearButton.parentElement &&
        clearButton.getAttribute("role") !== "button"
    ) {
        clearButton.setAttribute("role", "button");
        clearButton.setAttribute("tabindex", "0");
        clearButton.setAttribute("aria-label", "Clear visual log");

        clearButton.addEventListener("keydown", (e: any) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                (clearButton as HTMLElement).click();
            }
        });
    }
};
