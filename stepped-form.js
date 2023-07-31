function SteppedForm({
    childrenClasses = ["step"],
    indicatorUpdateFn,
    outClassIndicator = "step_out",
    parentClass = "allstep"
}) {
    var self = Object.create(this);
    var indicator = "--current";
    var oldIndex;
    var listeners = [];
    self.parent = document.querySelector(`.${parentClass}`);
    function initialize(initialIndex = 0) {
        if (self.parent != null) {
            self.parent.style.setProperty(indicator, initialIndex);
            childrenClasses.forEach(
                function (childClass) {
                    self.parent.querySelectorAll(
                        `.${childClass}`
                    ).forEach(
                        function (child, index) {
                            child.style.setProperty("--i", index);
                            child.classList.remove(outClassIndicator);
                            if (index !== initialIndex) {
                                child.classList.add(outClassIndicator);
                            }
                        }
                    );
                }
            );
            if (indicatorUpdateFn !== undefined) {
                indicatorUpdateFn(self.parent,initialIndex, initialIndex);
            }
        }
    }


    function getCurrentIndex () {
        return Number.parseInt(
            self.parent.style.getPropertyValue(indicator),
            10
        );
    }

    function updateStep (indexUpdater) {
        var allChildren = [];
        var nextIndex;
        oldIndex = getCurrentIndex();
         nextIndex= indexUpdater(oldIndex);
        if (self.parent != null) {
            childrenClasses.forEach(function (childClass) {
                allChildren.push(
                    self.parent.querySelectorAll(
                       `.${childClass}`
                    )
                );
            });
            if (allChildren.some(
                value => (value[nextIndex] != null) || value.length === nextIndex)
                ) {
                allChildren.forEach(function (child) {
                    stepHandler(child, nextIndex);
                });
                notifyListeners(nextIndex, oldIndex);
            }
        }
    }
    function stepHandler (child, nextIndex) {
        if (child[nextIndex]) {
            self.parent.style.setProperty(
                indicator,
                nextIndex
            );
            child[oldIndex].classList.add(outClassIndicator);
            child[nextIndex].classList.remove(outClassIndicator);
        }
        if (indicatorUpdateFn !== undefined) {
            updateRangeStep(
                function (current, next) {
                    indicatorUpdateFn(
                        self.parent,
                        current,
                        next
                    );
                },
                oldIndex,
                nextIndex
            );
        }
    }
    function updateRangeStep (fn, begin, end) {
        var current = begin;
        var next;
        while (current !== end) {
            if (current > end) {
                next = current - 1;
            } else {
                next = current + 1;
            }
            fn(current, next);
            current = next;
        }
    }
    function nextStep() {
        updateStep((index) => index + 1);
    }

    function previousStep() {
        updateStep((index) => index - 1);
    }

    function gotoStep(index) {
        if (typeof index === "number") {
            updateStep(() => index);
        }
    }

    function addIndexListener(fn) {
        var index = listeners.length - 1;
        listeners[index + 1] = fn;
    }

    function notifyListeners(currentIndex, oldIndex) {
        var i = 0;
        while (i < listeners.length) {
            listeners[i](currentIndex, oldIndex);
            i += 1;
        }
    }

    self.previousStep = previousStep;
    self.nextStep = nextStep;
    self.initialize = initialize;
    self.gotoStep = gotoStep;
    self.getCurrentIndex = getCurrentIndex;
    self.addIndexListener = addIndexListener;
    return self;
}
