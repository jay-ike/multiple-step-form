let stepHandler;
function indicatorUpdate(parent, currentIndex, nextIndex) {
    const stepIndicators = parent.querySelectorAll(".s-indicator") ?? [];
    stepIndicators[currentIndex]?.classList.remove("step-active");
    stepIndicators[nextIndex]?.classList.add("step-active");
}
stepHandler = new SteppedForm({
    indicatorUpdateFn: indicatorUpdate,
    parentClass: "form",
    outClassIndicator: "step-out"
});

stepHandler.addIndexListener(function (nextIndex) {
    const prevBtn = stepHandler.parent?.elements?.previous;
    const nextBtn = stepHandler.parent?.elements?.next;
    if (prevBtn !== undefined && nextIndex > 0) {
        prevBtn?.classList?.remove("hidden");
    }
    if (nextIndex === 0) {
        prevBtn?.classList?.add("hidden");
    }
    if (nextIndex === 3) {
        nextBtn?.classList?.replace("btn-primary", "btn-confirm");
        nextBtn?.classList?.remove("next-btn");
    }
    if (nextIndex < 3) {
        nextBtn?.classList?.replace("btn-confirm", "btn-primary");
        nextBtn?.classList.add("next-btn");
    }

});

function validateInputs(parent, onInvalid) {
    const inputs = parent?.querySelectorAll("input") ?? [];
    let validated = true;
    inputs.forEach(function (input) {
        let result = true;
        if (!input.checkValidity()) {
            onInvalid(input);
            result = false;
        }
        validated = validated && result;
    });
    return validated;
}

stepHandler.parent?.addEventListener("click", function ({target}) {
    let validated;
    if (target.classList.contains("prev-btn")) {
        stepHandler.previousStep();
    }

    if (target.classList.contains("next-btn")) {
        validated = validateInputs(this, function (input) {
            input.classList.add("input-error");
        });

        if (validated) {
            stepHandler.nextStep();
        }
    }

    //fallback for fireFox not supporting :has selector
    if (target.classList.contains("addon-plan")) {
        target.parentElement.classList.toggle("addon-active");
    }

});

stepHandler.parent?.addEventListener("input", function ({target}) {

    target.classList.remove("input-error");

    if (this.elements.billingType.value === "year") {
        this.style.setProperty("--plan", "var(--yearly-plan)");
    } else {
        this.style.setProperty("--plan", "var(--monthly-plan)");
    }
});
