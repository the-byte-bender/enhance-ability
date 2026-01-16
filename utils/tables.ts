const isPatched = (el: Element, role: string) =>
    el.getAttribute("role") === role;

export const patchSpells = () => {
    document.querySelectorAll(".ct-spells-level").forEach((level) => {
        if (!isPatched(level, "table")) {
            level.setAttribute("role", "table");
            level.setAttribute("aria-label", "Spells Table");
        }

        const header = level.querySelector(
            ".ct-spells-level__spells-row-header"
        );
        if (header && !isPatched(header, "row")) {
            header.setAttribute("role", "row");
            Array.from(header.children).forEach((col) =>
                col.setAttribute("role", "columnheader")
            );
        }

        const content = level.querySelector(".ct-spells-level__spells-content");
        if (content) {
            if (!isPatched(content, "rowgroup"))
                content.setAttribute("role", "rowgroup");

            Array.from(content.children).forEach((row) => {
                if (isPatched(row, "row")) return;
                row.setAttribute("role", "row");
                if (!row.hasAttribute("tabindex"))
                    row.setAttribute("tabindex", "-1");
                Array.from(row.children).forEach((cell) =>
                    cell.setAttribute("role", "cell")
                );
            });
        }
    });
};

export const patchActions = () => {
    document
        .querySelectorAll('[class*="styles_attackTable"]')
        .forEach((table) => {
            if (!isPatched(table, "table")) {
                table.setAttribute("role", "table");
                table.setAttribute("aria-label", "Actions Table");
            }

            const header = table.querySelector('[class*="styles_tableHeader"]');
            if (header && !isPatched(header, "row")) {
                header.setAttribute("role", "row");
                Array.from(header.children).forEach((col) =>
                    col.setAttribute("role", "columnheader")
                );
            }

            const rowContainer = table.querySelector(
                '[data-testid="attack-table-content"]'
            );
            if (rowContainer) {
                if (!isPatched(rowContainer, "rowgroup"))
                    rowContainer.setAttribute("role", "rowgroup");

                Array.from(rowContainer.children).forEach((row) => {
                    if (isPatched(row, "row")) return;
                    row.setAttribute("role", "row");
                    if (!row.hasAttribute("tabindex"))
                        row.setAttribute("tabindex", "-1");
                    Array.from(row.children).forEach((cell) =>
                        cell.setAttribute("role", "cell")
                    );
                });
            }
        });
};

export const patchExtras = () => {
    document.querySelectorAll(".ct-extra-list").forEach((list) => {
        if (!isPatched(list, "table")) {
            list.setAttribute("role", "table");
            list.setAttribute("aria-label", "Extras Table");
        }

        const header = list.querySelector(".ct-extra-list__row-header");
        if (header && !isPatched(header, "row")) {
            header.setAttribute("role", "row");
            Array.from(header.children).forEach((col) =>
                col.setAttribute("role", "columnheader")
            );
        }

        const itemsContainer = list.querySelector(".ct-extra-list__items");
        if (itemsContainer) {
            if (!isPatched(itemsContainer, "rowgroup"))
                itemsContainer.setAttribute("role", "rowgroup");

            Array.from(itemsContainer.children).forEach((row) => {
                if (
                    !row.classList.contains("ct-extra-row") ||
                    isPatched(row, "row")
                )
                    return;
                row.setAttribute("role", "row");
                if (!row.hasAttribute("tabindex"))
                    row.setAttribute("tabindex", "-1");
                Array.from(row.children).forEach((cell) =>
                    cell.setAttribute("role", "cell")
                );
            });
        }
    });
};

export const patchInventory = () => {
    document
        .querySelectorAll(".ct-inventory")
        .forEach((inventory, tableIndex) => {
            if (!isPatched(inventory, "table")) {
                inventory.setAttribute("role", "table");
                inventory.setAttribute("aria-label", "Inventory List");
            }

            if (!inventory.querySelector(".sr-only")) {
                const ghostRow = document.createElement("div");
                ghostRow.setAttribute("role", "row");
                ghostRow.className = "sr-only";
                ["Active", "Name", "Weight", "Qty", "Cost", "Notes"].forEach(
                    (name, colIndex) => {
                        const th = document.createElement("div");
                        th.setAttribute("role", "columnheader");
                        th.id = `ghost-inv-${tableIndex}-${colIndex}`;
                        th.innerText = name;
                        ghostRow.appendChild(th);
                    }
                );
                inventory.prepend(ghostRow);
            }

            const itemsContainer = inventory.querySelector(
                ".ct-inventory__items"
            );
            if (itemsContainer) {
                if (!isPatched(itemsContainer, "rowgroup"))
                    itemsContainer.setAttribute("role", "rowgroup");

                Array.from(itemsContainer.children).forEach((row, rowIndex) => {
                    if (
                        !row.classList.contains("ct-inventory-item") ||
                        isPatched(row, "row")
                    )
                        return;

                    row.removeAttribute("role"); // Remove DDB button role
                    row.setAttribute("role", "row");
                    row.setAttribute(
                        "aria-rowindex",
                        (rowIndex + 2).toString()
                    );
                    if (!row.hasAttribute("tabindex"))
                        row.setAttribute("tabindex", "-1");

                    Array.from(row.children).forEach((cell, colIndex) => {
                        cell.setAttribute("role", "cell");
                        cell.setAttribute(
                            "aria-labelledby",
                            `ghost-inv-${tableIndex}-${colIndex}`
                        );
                    });
                });
            }
            inventory.querySelector("h2")?.setAttribute("aria-hidden", "true");
            inventory
                .querySelector(".ct-inventory__row-header")
                ?.setAttribute("aria-hidden", "true");
        });
};
