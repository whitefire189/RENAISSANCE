
document.addEventListener("DOMContentLoaded", () => {
    const clockButton = document.querySelector(".clock-object");
    const globeButton = document.querySelector(".globe-object");

    const clockWindow = document.getElementById("clock-window");
    const globeWindow = document.getElementById("globe-window");

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

    // Close windows using their close buttons
    document.querySelectorAll("[data-close]").forEach((button) => {
        button.addEventListener("click", () => {
            const targetId = button.dataset.close;
            const targetWindow = document.getElementById(targetId);

            if (targetWindow) {
                targetWindow.hidden = true;
            }
        });
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

});
