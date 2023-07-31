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
    if (prevBtn !== undefined && nextIndex > 0) {
        prevBtn?.classList?.remove("hidden");
    }
    if (nextIndex === 0) {
        prevBtn?.classList?.add("hidden");
    }
});

stepHandler.parent?.addEventListener("click", function ({target}) {
    if (target.classList.contains("prev-btn")) {
        stepHandler.previousStep();
    }

    if (target.classList.contains("next-btn")) {
        stepHandler.nextStep();
    }

});
