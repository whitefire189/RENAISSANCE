
document.addEventListener("DOMContentLoaded", () => {
    // Window controls
    const clockButton = document.querySelector(".clock-object");
    const globeButton = document.querySelector(".globe-object");
    const clockWindow = document.getElementById("clock-window");
    const globeWindow = document.getElementById("globe-window");

    // Large local clock
    const localTimeDisplay = document.getElementById("local-time-display");
    const localTimeStatus = document.getElementById("local-time-status");
    let locationRequested = false;

    function updateLocalTime() {
        if (!localTimeDisplay) return;

        localTimeDisplay.textContent = new Intl.DateTimeFormat("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        }).format(new Date());
    }

    function requestClockLocation() {
        updateLocalTime();

        if (locationRequested) return;
        locationRequested = true;

        if (!navigator.geolocation) {
            if (localTimeStatus) {
                localTimeStatus.textContent =
                    "Location isn't supported. Showing device local time.";
            }
            return;
        }

        if (localTimeStatus) {
            localTimeStatus.textContent =
                "Please allow location access in your browser.";
        }

        navigator.geolocation.getCurrentPosition(
            () => {
                const zone =
                    Intl.DateTimeFormat().resolvedOptions().timeZone;

                if (localTimeStatus) {
                    localTimeStatus.textContent =
                        `Location permission granted · ${zone}`;
                }
            },
            (error) => {
                locationRequested = false;

                if (localTimeStatus) {
                    localTimeStatus.textContent =
                        error.code === error.PERMISSION_DENIED
                            ? "Location denied. Showing device local time."
                            : "Location unavailable. Showing device local time.";
                }
            },
            {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 300000
            }
        );
    }

    clockButton?.addEventListener("click", () => {
        if (clockWindow) clockWindow.hidden = false;
        if (globeWindow) globeWindow.hidden = true;

        requestClockLocation();
    });

    globeButton?.addEventListener("click", () => {
        if (globeWindow) globeWindow.hidden = false;
        if (clockWindow) clockWindow.hidden = true;
    });

    document.querySelectorAll("[data-close]").forEach((button) => {
        button.addEventListener("click", () => {
            const target = document.getElementById(button.dataset.close);
            if (target) target.hidden = true;
        });
    });

    // Clock tabs
    const clockTabs = document.querySelectorAll("[data-clock-tab]");
    const clockPanels = document.querySelectorAll(
        ".clock-window .clock-panel"
    );

    clockTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const selectedTab = tab.dataset.clockTab;

            clockPanels.forEach((panel) => {
                panel.hidden = panel.id !== `clock-${selectedTab}-panel`;
            });
        });
    });

    // Archive search
    const searchForm = document.getElementById("google-search-form");
    const searchInput = document.getElementById("google-search-input");
    const searchStatus = document.getElementById("google-search-status");
    const searchResults = document.getElementById("google-search-results");

    let activeSearchController = null;

    searchForm?.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!searchInput || !searchStatus || !searchResults) {
            console.error("Search HTML elements are missing.");
            return;
        }

        const query = searchInput.value.trim();

        if (!query) {
            searchStatus.textContent = "Enter a search term first.";
            searchResults.replaceChildren();
            return;
        }

        activeSearchController?.abort();

        const controller = new AbortController();
        activeSearchController = controller;

        searchStatus.textContent = "Searching the archives...";
        searchResults.replaceChildren();

        try {
            const response = await fetch(
                `https://puri.li/api/search?q=${encodeURIComponent(query)}&page=1`,
                { signal: controller.signal }
            );

            if (!response.ok) {
                throw new Error(`Search failed: ${response.status}`);
            }

            const data = await response.json();
            const results = Array.isArray(data.results) ? data.results : [];
            const fragment = document.createDocumentFragment();
            let count = 0;

            results.forEach((result) => {
                if (!result.title || !result.url) return;

                let resultURL;

                try {
                    resultURL = new URL(result.url);
                } catch {
                    return;
                }

                if (!["https:", "http:"].includes(resultURL.protocol)) {
                    return;
                }

                const article = document.createElement("article");
                article.className = "globe-result";

                const link = document.createElement("a");
                link.href = resultURL.href;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                link.textContent = result.title;

                const source = document.createElement("small");
                source.textContent = resultURL.hostname;

                const description = document.createElement("p");
                description.textContent =
                    result.description || "No description available.";

                article.append(link, source, description);
                fragment.append(article);
                count++;
            });

            if (controller.signal.aborted) return;

            searchResults.replaceChildren(fragment);

            searchStatus.textContent = count
                ? `Found ${count} results for "${query}". Check the source and select a title to open it in a new tab.`
                : "No usable results found. Try another search.";
        } catch (error) {
            if (error.name === "AbortError") return;

            searchStatus.textContent =
                "Search failed. Check your internet connection and try again.";

            console.error("Archive search error:", error);
        } finally {
            if (activeSearchController === controller) {
                activeSearchController = null;
            }
        }
    });

    // Draggable application windows
    document.querySelectorAll(".app-window").forEach((appWindow) => {
        const titleBar = appWindow.querySelector(".window-titlebar");
        if (!titleBar) return;

        titleBar.addEventListener("pointerdown", (event) => {
            if (event.target.closest("button")) return;
            if (event.button !== 0) return;

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

    const storageKey = "renaissance-world-clocks";
    let selectedWorldClocks = [];

    try {
        const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");

        if (Array.isArray(stored)) {
            selectedWorldClocks = [...new Set(stored)].filter((zone) =>
                worldCities.some((city) => city.zone === zone)
            );
        }
    } catch {
        selectedWorldClocks = [];
    }

    function saveWorldClocks() {
        try {
            localStorage.setItem(
                storageKey,
                JSON.stringify(selectedWorldClocks)
            );
        } catch {
            if (worldStatus) {
                worldStatus.textContent =
                    "Clocks are working, but your changes couldn't be saved.";
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
            worldResults.textContent = "No matching city in the current list.";
            return;
        }

        matches.slice(0, 10).forEach((place) => {
            const alreadyAdded = selectedWorldClocks.includes(place.zone);
            const button = document.createElement("button");

            button.type = "button";
            button.className = "world-clock-add";
            button.disabled = alreadyAdded;
            button.textContent = alreadyAdded
                ? `${place.city}, ${place.country} · Added`
                : `+ ${place.city}, ${place.country}`;

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

    function updateWorldClockTimes() {
        document.querySelectorAll(".world-clock-time").forEach((output) => {
            try {
                output.textContent = new Intl.DateTimeFormat("en-GB", {
                    timeZone: output.dataset.zone,
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false
                }).format(new Date());
            } catch {
                output.textContent = "Time unavailable";
            }
        });

        document.querySelectorAll(".world-clock-date").forEach((output) => {
            try {
                output.textContent = new Intl.DateTimeFormat("en-GB", {
                    timeZone: output.dataset.zone,
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                }).format(new Date());
            } catch {
                output.textContent = "";
            }
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

                if (worldStatus) {
                    worldStatus.textContent =
                        `${place.city} removed from your clocks.`;
                }
            });

            card.append(heading, time, date, remove);
            worldList.append(card);
        });

        updateWorldClockTimes();
    }

    worldSearch?.addEventListener("input", () => {
        showWorldSearchResults(worldSearch.value.trim());
    });

    updateLocalTime();
    setInterval(updateLocalTime, 1000);

    renderWorldClocks();
    showWorldSearchResults("");

    setInterval(updateWorldClockTimes, 1000);
});


