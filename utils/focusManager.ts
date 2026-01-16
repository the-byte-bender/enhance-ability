import { ContentScriptContext } from "wxt/utils/content-script-context";

let lastAnchor: HTMLElement | null = null;

export const initNavEngine = (ctx: ContentScriptContext) => {
    const setAnchor = (el: HTMLElement | null) => {
        // Ignore sidebar interactions
        if (!el || el.closest(".ct-sidebar")) return;

        const anchor =
            (el.closest(
                'button, [role="row"], .ct-spells-spell, .ddbc-combat-attack--item, .ct-inventory-item, .ct-feature-snippet, .ct-actions-list__row'
            ) as HTMLElement) || el;

        if (anchor) {
            if (!anchor.hasAttribute("tabindex"))
                anchor.setAttribute("tabindex", "-1");
            anchor.setAttribute("data-a11y-anchor", "true");
            lastAnchor = anchor;
        }
    };

    ctx.addEventListener(
        window,
        "mousedown",
        (e) => setAnchor(e.target as HTMLElement),
        true
    );
    ctx.addEventListener(
        window,
        "focusin",
        (e) => setAnchor(e.target as HTMLElement),
        true
    );

    ctx.addEventListener(window, "keydown", (e: KeyboardEvent) => {
        if (e.altKey && e.key === "r") {
            e.preventDefault();
            const diceTrigger = document.querySelector<HTMLElement>(
                ".dice-toolbar__dropdown-die"
            );
            diceTrigger?.click();
        }

        if (e.altKey && e.key === "s") {
            e.preventDefault();
            const sidebar = document.querySelector(".ct-sidebar");
            const first = sidebar?.querySelector<HTMLElement>(
                'button, [tabindex="0"], a'
            );
            first?.focus();
        }

        if (e.key === "Escape" || (e.altKey && e.key === "c")) {
            const isInsideSidebar =
                document.activeElement?.closest(".ct-sidebar");
            if (isInsideSidebar || e.altKey) {
                if (lastAnchor && document.contains(lastAnchor)) {
                    lastAnchor.focus();
                }
            }
        }
    });
};
