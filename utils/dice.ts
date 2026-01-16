export const patchDice = () => {
    const trigger = document.querySelector(".dice-toolbar__dropdown-die");
    if (trigger && trigger.getAttribute("role") !== "button") {
        trigger.setAttribute("role", "button");
        trigger.setAttribute("aria-label", "Roll arbitrary dice");
        trigger.setAttribute("aria-haspopup", "true");

        trigger.addEventListener("click", () => {
            setTimeout(() => {
                const firstOption = document.querySelector<HTMLElement>(
                    ".dice-toolbar__dropdown-top .dice-die-button"
                );
                firstOption?.focus();
            }, 50);
        });
    }

    document.querySelectorAll(".dice-die-button").forEach((btn) => {
        if (btn.getAttribute("role") === "button") return;

        btn.setAttribute("role", "button");
        btn.setAttribute("tabindex", "-1");

        const dieType =
            btn.getAttribute("data-dice") || btn.textContent?.trim() || "die";
        btn.setAttribute("aria-label", `+${dieType}`);
    });
};
