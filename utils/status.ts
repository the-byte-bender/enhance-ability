import { ContentScriptContext } from "wxt/utils/content-script-context";
import { speak } from "./speech";

export const registerStatusKeys = (ctx: ContentScriptContext) => {
    ctx.addEventListener(window, "keydown", (e: KeyboardEvent) => {
        if (e.altKey && e.key.toLowerCase() === "h") {
            e.preventDefault();
            if (e.shiftKey) {
                const input = document.querySelector<HTMLElement>(
                    '[data-testid="hp-adjust-input"]'
                );
                if (input) {
                    input.focus();
                    if (input instanceof HTMLInputElement) input.select();
                } else {
                    speak("HP adjust input not found");
                }
            } else {
                const maxHpEl = document.querySelector(
                    '[data-testid="max-hp"]'
                );

                const currentLabel = Array.from(
                    document.querySelectorAll("label")
                ).find((l) =>
                    l
                        .getAttribute("aria-label")
                        ?.startsWith("Current hit points")
                );
                const currentHpEl = currentLabel?.nextElementSibling;

                const tempLabel = Array.from(
                    document.querySelectorAll("label")
                ).find((l) =>
                    l
                        .getAttribute("aria-label")
                        ?.startsWith("Temporary hit points")
                );
                const tempHpEl = tempLabel?.nextElementSibling;

                if (!maxHpEl || !currentHpEl) {
                    speak("HP not found");
                    return;
                }

                const max = maxHpEl.textContent?.trim() || "?";
                const current = currentHpEl.textContent?.trim() || "?";

                let message = `${current}/${max} hp`;

                if (tempHpEl) {
                    const tempText = tempHpEl.textContent?.trim();
                    if (tempText && tempText !== "--" && tempText !== "0") {
                        message += `, + ${tempText} temp hp`;
                    }
                }

                speak(message);
            }
        }
    });
};
