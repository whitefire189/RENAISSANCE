
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
});
