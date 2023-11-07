/*jslint browser this*/
import {Stepper} from "./stepped-form.js";
let components = {};
let observer;
const messages = {
    attributions: "Challenge from <a href='https://www.frontendmentor.io?ref=" +
    "challenge' target='_blank'>Frontend Mentor</a>. Coded by " +
    "<a class='attribution-lnk' href='" +
    "https://github.com/jay-ike' target='_blank'> Ndimah Tchougoua</a>",
    thanks: "Thanks for confirming your subscription! We hope" +
    "you have fun using our platform. If you ever need support, please" +
    " feel free to email us at support@loremgaming.com."
};
function billCalculator() {
    let discounts = {
        mo: 11,
        yr: 2
    };
    return Object.freeze({
        calculatePlan(planCost, billingType) {
            return planCost * (12 - discounts[billingType]);
        }
    });
}
function sealerFactory() {
    const weakmap = new WeakMap();
    return Object.freeze({
        seal(object) {
            const box = Object.freeze(Object.create(null));
            weakmap.set(box, object);
            return box;
        },
        unseal(box) {
            return weakmap.get(box);
        }
    });
}
function defaultFormater(cost, billingType) {
    return "+$" + cost + "/" + billingType;
}

function createAttribution() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = messages.attributions;
    wrapper.classList.add("attribution");
    return wrapper;
}
function createThanks() {
    let wrapper = document.createElement("div");
    const img = document.createElement("img");
    const heading = document.createElement("h2");
    const paragraph = document.createElement("p");
    heading.textContent = "Thank you!";
    heading.classList.add("step__title");
    img.setAttribute("src", "./assets/images/icon-thank-you.svg");
    img.setAttribute(
        "alt",
        "an illustration presenting that everything is checked"
    );
    paragraph.textContent = messages.thanks;
    wrapper.classList.add("column", "thanks");
    wrapper.appendChild(img);
    wrapper.appendChild(heading);
    wrapper.appendChild(paragraph);
    wrapper.appendChild(createAttribution());
    return wrapper;
}

function createCell(val) {
    let cell = document.createElement("td");
    cell.textContent = val;
    return cell;
}

function createRow(name, cost) {
    let row = document.createElement("tr");
    let optionCost;
    let costFormater = defaultFormater;
    row.appendChild(createCell(name));
    row.appendChild(createCell(cost));
    row.updateCost = function (cost, billingType) {
        optionCost = Number.parseInt(cost.toString(), 10);
        this.lastElementChild.firstChild.nodeValue = costFormater(
            cost,
            billingType
        );
    };
    row.updateDescription = function (desc) {
        this.firstElementChild.firstChild.nodeValue = desc;
    };
    row.getCost = function () {
        return optionCost;
    };
    row.setFormater = function (fn) {
        costFormater = fn;
    };

    return row;
}
function tableBuilder(initialPlan, billingType, addons) {
    const sealer = sealerFactory();
    const table = document.createElement("table");
    const header = document.createElement("thead");
    const body = document.createElement("tbody");
    const headerRow = createRow(
        initialPlan.dataset.name + " (" + billingType.dataset.desc + ")",
        "$" + initialPlan.dataset.cost + "/" + billingType.dataset.short
    );
    const calculator = billCalculator();
    const button = document.createElement("button");
    let options = Array.from(addons).reduce(function (acc, addon) {
        let cost = Number.parseInt(addon.dataset.cost, 10);
        let row = createRow(
            addon.dataset.name,
            "+$" + calculator.calculatePlan(
                cost,
                billingType.dataset.short
            ) + "/" + billingType.dataset.short
        );
        row.updateCost(cost, billingType.dataset.short);
        acc[addon.name] = sealer.seal(row);
        return acc;
    }, Object.create(null));
    let total = Number.parseInt(initialPlan.dataset.cost, 10);
    let plan = {
        cost: Number.parseInt(initialPlan.dataset.cost, 10),
        name: initialPlan.dataset.name
    };
    let currentBilling = {
        content: billingType.dataset.content,
        desc: billingType.dataset.desc,
        short: billingType.dataset.short
    };
    headerRow.updateCost(initialPlan.dataset.cost, billingType.dataset.short);
    headerRow.setFormater((cost, type) => "$" + cost + "/" + type);
    button.setAttribute("type", "button");
    button.classList.add("p-swap");
    button.textContent = "change";
    headerRow.firstElementChild.appendChild(button);
    header.appendChild(headerRow);
    table.appendChild(header);
    table.appendChild(body);
    table.classList.add("t-checkout");
    table.addOption = function (name) {
        let row = sealer.unseal(options[name]);
        total += row.getCost();
        body.appendChild(row);
    };
    table.removeOption = function (name) {
        let row = sealer.unseal(options[name]);
        total -= row.getCost();
        row.remove();
    };
    table.updateBilling = function (billing) {
        total = calculator.calculatePlan(
            plan.cost,
            billing.short
        );
        currentBilling = billing;
        headerRow.updateCost(total, currentBilling.short);
        headerRow.updateDescription(plan.name + " (" + billing.desc + ")");
        Array.from(addons).forEach(function (addon) {
            let addonCost = addon.parentElement.parentElement.lastElementChild;
            let row = sealer.unseal(options[addon.name]);
            let cost = calculator.calculatePlan(
                Number.parseInt(addon.dataset.cost, 10),
                billing.short
            );
            row.updateCost(cost, billing.short);
            if (addon.checked) {
                total += cost;
            }
            addonCost.textContent = cost + "/" + billing.short;
        });
    };
    table.updatePlan = function (name, cost) {
        let computedCost = calculator.calculatePlan(cost, currentBilling.short);
        let description = name + " (" + currentBilling.desc + ")";
        plan = {cost, name};
        total += computedCost - headerRow.getCost();
        headerRow.updateCost(computedCost, currentBilling.short);
        headerRow.updateDescription(description);
    };
    table.getTotal = function () {
        return total;
    };
    table.getBilling = function () {
        return currentBilling;
    };
    return table;
}


components.form = document.querySelector("form.form");
components.stepper = document.querySelector("step-by-step");
components.indicators = components.form.querySelectorAll(".s-indicator");
components.checks = components.form.querySelectorAll(".i-check");
components.prevBtn = components.form.elements.previous;
components.nextBtn = components.form.elements.next;
components.stepper.addEventListener("indexupdated", function ({detail}) {
    const {current, previous} = detail;

    if (current > 0) {
        components.prevBtn.classList.remove("hidden");
    } else {
        components.prevBtn.classList.add("hidden");
    }

    if (current === components.indicators.length - 1) {
        components.nextBtn.classList.remove("btn-primary", "next-btn");
        components.nextBtn.classList.add("btn-confirm");
        components.nextBtn.innerText = "confirm";
    } else {
        components.nextBtn.classList.remove("btn-confirm");
        components.nextBtn.classList.add("btn-primary", "next-btn");
        components.nextBtn.innerText = "next step";
    }
    components.indicators[previous].classList.remove("step-active");
    components.indicators[current].classList.add("step-active");
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

components.form.addEventListener("click", function ({target}) {
    let validated;
    if (target.classList.contains("btn-confirm")) {
        target.parentElement.previousElementSibling.replaceWith(createThanks());
        target.parentElement.remove();
    }
    if (target.classList.contains("prev-btn")) {
        components.stepper.previousStep();
    }

    if (target.classList.contains("next-btn")) {
        validated = validateInputs(this, function (input) {
            input.classList.add("input-error");
        });

        if (validated) {
            components.stepper.nextStep();
        }
    }
    if (target.classList.contains("p-swap")) {
        components.stepper.gotoStep(1);
    }

    //fallback for fireFox not supporting :has selector
    if (target.classList.contains("addon-plan")) {
        target.parentElement.classList.toggle("addon-active");
    }
    if (target.classList.contains("toggle")) {
        target.parentElement.querySelector(".b-option:not(:checked)").click();
    }
});

components.form.addEventListener("input", function ({target}) {

    target.classList.remove("input-error");

    if (this.elements.billingType.value === "year") {
        this.style.setProperty("--plan", "var(--yearly-plan)");
    } else {
        this.style.setProperty("--plan", "var(--monthly-plan)");
    }
});
document.addEventListener("DOMContentLoaded", function () {
    const recap = components.form.querySelector(".t-recap");
    const initialPlan = components.form.querySelector(".plan-option:checked");
    const initialBilling = components.form.querySelector(".b-option:checked");
    const checkoutTable = tableBuilder(
        initialPlan,
        initialBilling,
        components.checks
    );
    function updateSumary() {
        let billing = checkoutTable.getBilling();
        const content = recap.dataset.desc + " (" + billing.content + ")";
        const total = "$" + checkoutTable.getTotal() + "/" + billing.short;
        recap.firstElementChild.textContent = content;
        recap.lastElementChild.textContent = total;
    }
    function observerCallback(mutationList) {
        Array.from(mutationList).forEach(function (mutation) {
            const {target} = mutation;
            if (target.classList.contains("i-check")) {
                if (target.checked) {
                    checkoutTable.addOption(target.name);
                } else {
                    checkoutTable.removeOption(target.name);
                }
                updateSumary();
            }
            if (target.classList.contains("b-option") && target.checked) {
                checkoutTable.updateBilling({
                    content: target.dataset.content,
                    desc: target.dataset.desc,
                    short: target.dataset.short
                });
                updateSumary();
            }
            if (target?.classList?.contains("plan-option") && target?.checked) {
                checkoutTable.updatePlan(
                    target.dataset.name,
                    Number.parseInt(target.dataset.cost, 10)
                );
                updateSumary();
            }
        });
    }
    updateSumary();
    recap.parentElement.insertBefore(checkoutTable, recap);
    observer = new MutationObserver(observerCallback);
    observer.observe(components.form, {
        attributes: true,
        childList: true,
        subtree: true
    });
});
Stepper.define();
