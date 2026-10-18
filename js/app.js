

document.addEventListener("DOMContentLoaded", () => {
    const clockButton = document.querySelector(".clock-object");
    const globeButton = document.querySelector(".globe-object");

    const clockWindow = document.getElementById("clock-window");
    const globeWindow = document.getElementById("globe-window");

    // Clock tab switching
    const clockTabs = document.querySelectorAll("[data-clock-tab]");
    const clockPanels = document.querySelectorAll(
        ".clock-window .clock-panel"
    );

    clockTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const selectedTab = tab.dataset.clockTab;

            clockPanels.forEach((panel) => {
                panel.hidden =
                    panel.id !== `clock-${selectedTab}-panel`;
            });
        });
    });

    // Open the Clock window
    clockButton?.addEventListener("click", () => {
        if (!clockWindow) return;

        clockWindow.hidden = false;

        if (globeWindow) {
            globeWindow.hidden = true;
        }
    });

    // Open the Globe window
    globeButton?.addEventListener("click", () => {
        if (!globeWindow) return;

        globeWindow.hidden = false;

        if (clockWindow) {
            clockWindow.hidden = true;
        }
    });

    // Close windows
    document.querySelectorAll("[data-close]").forEach((button) => {
        button.addEventListener("click", () => {
            const targetWindow = document.getElementById(
                button.dataset.close
            );

            if (targetWindow) {
                targetWindow.hidden = true;
            }
        });
    });

    // Google search inside the Globe window
    const searchForm = document.getElementById("google-search-form");
    const searchInput = document.getElementById("google-search-input");
    const searchFrame = document.getElementById("google-search-frame");

    searchForm?.addEventListener("submit", (event) => {
        event.preventDefault();

        const query = searchInput?.value.trim();
        if (!query || !searchFrame) return;

        searchFrame.src =
            "https://www.google.com/search?q=" +
            encodeURIComponent(query);
    });

    // Make windows draggable by their title bars
    document.querySelectorAll(".app-window").forEach((appWindow) => {
        const titleBar = appWindow.querySelector(".window-titlebar");

        if (!titleBar) return;

        titleBar.addEventListener("pointerdown", (event) => {
            if (event.target.closest("button")) return;

            const startX = event.clientX;
            const startY = event.clientY;
            const startLeft = appWindow.offsetLeft;
            const startTop = appWindow.offsetTop;

            appWindow.style.transform = "none";
            appWindow.style.left = `${startLeft}px`;
            appWindow.style.top = `${startTop}px`;

            titleBar.setPointerCapture(event.pointerId);

            const moveWindow = (moveEvent) => {
                appWindow.style.left =
                    `${startLeft + moveEvent.clientX - startX}px`;
                appWindow.style.top =
                    `${startTop + moveEvent.clientY - startY}px`;
            };

            const stopMoving = () => {
                titleBar.removeEventListener("pointermove", moveWindow);
                titleBar.removeEventListener("pointerup", stopMoving);
                titleBar.removeEventListener("pointercancel", stopMoving);
            };

            titleBar.addEventListener("pointermove", moveWindow);
            titleBar.addEventListener("pointerup", stopMoving);
            titleBar.addEventListener("pointercancel", stopMoving);
        });
    });

    // World clocks
    const worldSearch = document.getElementById("world-clock-search");
    const worldResults = document.getElementById("world-clock-results");
    const worldList = document.getElementById("world-clock-list");
    const worldStatus = document.getElementById("world-clock-status");

    const worldCities = [
        { city: "Delhi", country: "India", zone: "Asia/Kolkata" },
        { city: "Mumbai", country: "India", zone: "Asia/Kolkata" },
        { city: "Tokyo", country: "Japan", zone: "Asia/Tokyo" },
        { city: "London", country: "United Kingdom", zone: "Europe/London" },
        { city: "Paris", country: "France", zone: "Europe/Paris" },
        { city: "New York", country: "United States", zone: "America/New_York" },
        { city: "Los Angeles", country: "United States", zone: "America/Los_Angeles" },
        { city: "Toronto", country: "Canada", zone: "America/Toronto" },
        { city: "Dubai", country: "United Arab Emirates", zone: "Asia/Dubai" },
        { city: "Singapore", country: "Singapore", zone: "Asia/Singapore" },
        { city: "Seoul", country: "South Korea", zone: "Asia/Seoul" },
        { city: "Shanghai", country: "China", zone: "Asia/Shanghai" },
        { city: "Sydney", country: "Australia", zone: "Australia/Sydney" },
        { city: "Auckland", country: "New Zealand", zone: "Pacific/Auckland" },
        { city: "Berlin", country: "Germany", zone: "Europe/Berlin" },
        { city: "Moscow", country: "Russia", zone: "Europe/Moscow" },
        { city: "Cairo", country: "Egypt", zone: "Africa/Cairo" }
    ];

    const worldStorageKey = "renaissance-world-clocks";
    let selectedWorldClocks = [];

    try {
        const stored = JSON.parse(
            localStorage.getItem(worldStorageKey) || "[]"
        );

        if (Array.isArray(stored)) {
            selectedWorldClocks = stored.filter((zone) =>
                worldCities.some((city) => city.zone === zone)
            );
        }
    } catch {
        selectedWorldClocks = [];
    }

    function saveWorldClocks() {
        try {
            localStorage.setItem(
                worldStorageKey,
                JSON.stringify(selectedWorldClocks)
            );
        } catch {
            if (worldStatus) {
                worldStatus.textContent =
                    "Your clocks work, but couldn't be saved.";
            }
        }
    }

    function showWorldSearchResults(query) {
        if (!worldResults) return;

        worldResults.replaceChildren();

        if (!query) return;

        const matches = worldCities.filter((place) =>
            `${place.city} ${place.country} ${place.zone}`
                .toLowerCase()
                .includes(query.toLowerCase())
        );

        if (!matches.length) {
            worldResults.textContent =
                "No matching city in the current list.";
            return;
        }

        matches.slice(0, 10).forEach((place) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "world-clock-add";

            button.textContent = selectedWorldClocks.includes(place.zone)
                ? `${place.city}, ${place.country} · Added`
                : `+ ${place.city}, ${place.country}`;

            button.disabled = selectedWorldClocks.includes(place.zone);

            button.addEventListener("click", () => {
                if (selectedWorldClocks.includes(place.zone)) return;

                selectedWorldClocks.push(place.zone);
                saveWorldClocks();
                renderWorldClocks();
                showWorldSearchResults(worldSearch.value.trim());

                if (worldStatus) {
                    worldStatus.textContent =
                        `${place.city} added to your clocks.`;
                }
            });

            worldResults.append(button);
        });
    }

    function renderWorldClocks() {
        if (!worldList) return;

        worldList.replaceChildren();

        selectedWorldClocks.forEach((zone) => {
            const place = worldCities.find((city) => city.zone === zone);
            if (!place) return;

            const card = document.createElement("article");
            card.className = "world-clock-card";

            const heading = document.createElement("h4");
            heading.textContent = `${place.city}, ${place.country}`;

            const time = document.createElement("output");
            time.className = "world-clock-time";
            time.dataset.zone = zone;

            const date = document.createElement("p");
            date.className = "world-clock-date";
            date.dataset.zone = zone;

            const remove = document.createElement("button");
            remove.type = "button";
            remove.className = "world-clock-remove";
            remove.textContent = "Remove";

            remove.addEventListener("click", () => {
                selectedWorldClocks = selectedWorldClocks.filter(
                    (item) => item !== zone
                );

                saveWorldClocks();
                renderWorldClocks();

                if (worldSearch) {
                    showWorldSearchResults(worldSearch.value.trim());
                }
            });

            card.append(heading, time, date, remove);
            worldList.append(card);
        });

        updateWorldClockTimes();
    }

    function updateWorldClockTimes() {
        document.querySelectorAll(".world-clock-time").forEach((output) => {
            output.textContent = new Intl.DateTimeFormat("en-GB", {
                timeZone: output.dataset.zone,
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false
            }).format(new Date());
        });

        document.querySelectorAll(".world-clock-date").forEach((output) => {
            output.textContent = new Intl.DateTimeFormat("en-GB", {
                timeZone: output.dataset.zone,
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric"
            }).format(new Date());
        });
    }

    worldSearch?.addEventListener("input", () => {
        showWorldSearchResults(worldSearch.value.trim());
    });

    renderWorldClocks();
    showWorldSearchResults("");

    setInterval(updateWorldClockTimes, 1000);
});
