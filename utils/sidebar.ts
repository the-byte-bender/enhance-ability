export const patchSidebar = () => {
    const sidebar = document.querySelector(".ct-sidebar");
    if (!sidebar) return;

    if (sidebar.getAttribute("role") !== "complementary") {
        sidebar.setAttribute("role", "complementary");
    }

    const controls = sidebar.querySelector('[class*="styles_controls__"]');
    if (controls) {
        if (controls.getAttribute("role") !== "toolbar") {
            controls.setAttribute("role", "toolbar");
            controls.setAttribute("aria-label", "Sidebar settings");
        }

        if (!controls.hasAttribute("data-ea-listening")) {
            controls.addEventListener("click", () => {
                setTimeout(patchSidebar, 0);
            });
            controls.setAttribute("data-ea-listening", "true");
        }

        controls.querySelectorAll("button").forEach((btn) => {
            const isActive = Array.from(btn.classList).some((cls) =>
                cls.includes("styles_active__"),
            );
            const pressed = isActive ? "true" : "false";
            if (btn.getAttribute("aria-pressed") !== pressed) {
                btn.setAttribute("aria-pressed", pressed);
            }
        });
    }
};
