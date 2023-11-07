/*jslint-disable*/
class Stepper extends HTMLElement {
    #current;
    #outClassIndicator;
    constructor() {
        super();
    }

    static define() {
       if (typeof window.customElements === "object") {
           window.customElements.define("step-by-step", Stepper);
       } else {
           console.warn("custom elements are not supported in this browser");
       }
    }

    static get observedAttributes() {
        return ["style"];
    }

    connectedCallback() {
        let index;
        let outIndicator;
        if (!this.isConnected) {
            return;
        }
        index = Number.parseInt(this.getAttribute("initial-index"), 10);
        if (!Number.isFinite(index)) {
            index = 0;
        }
        outIndicator = this.getAttribute("out-indicator");
        this.#outClassIndicator = outIndicator;
        this.#updateCurrent(index);
        Array.from(this.children).forEach(function (elt, i) {
            elt.style.setProperty("--o", index);
            if (i === index) {
                elt.classList.remove(outIndicator);
            } else {
                elt.classList.add(outIndicator);
            }
        });
    }

    attributeChangedCallback(name, ignore, newValue) {
        const current = "--current: " + this.#current + ";";
        if (newValue.match(current) === null && name === "style") {
            this.style.setProperty("--current", this.#current);
        }
    }

    #updateCurrent(index) {
        this.#current = index;
        this.style.setProperty("--current", index);
    }

    #updateStep(indexUpdater) {
        var next;
        var old;
        var event;
        old = this.#current;
        next = indexUpdater(old);
        if (this.children.item(next) !== null) {
            event = new CustomEvent("indexupdated", {
                detail: {
                    current: next,
                    previous: old
                }
            });
            this.children.item(old).classList.add(this.#outClassIndicator);
            this.children.item(next).classList.remove(this.#outClassIndicator);
            this.#updateCurrent(next);
            this.dispatchEvent(event);
        }
    }
    nextStep() {
        this.#updateStep((index) => index + 1);
    }
    previousStep() {
        this.#updateStep((index) => index - 1);
    }
    gotoStep(index) {
        if (Number.isFinite(index)) {
            this.#updateStep(() => index);
        }
    }
}
export {Stepper};
/*jslint-enable*/
