document.addEventListener("DOMContentLoaded", function () {

    /* =========================================
       LAUNDRY PRICE LIST
    ========================================= */

    const laundryPrices = {

        "Native": {
            "Washing": 600,
            "Ironing": 600,
            "Washing & Ironing": 1200,
            "Starching & Ironing": 1000
        },

        "Shirt": {
            "Washing": 300,
            "Ironing": 300,
            "Washing & Ironing": 600
        },

        "Trouser": {
            "Washing": 300,
            "Ironing": 300,
            "Washing & Ironing": 600
        },

        "Skirt": {
            "Washing": 300,
            "Ironing": 300,
            "Washing & Ironing": 600
        },

        "Gown": {
            "Washing": 700,
            "Ironing": 700,
            "Washing & Ironing": 1400,
            "Starching & Ironing": 1000
        },

        "Agbada": {
            "Washing": 1000,
            "Ironing": 1000,
            "Washing & Ironing": 2000,
            "Starching & Ironing": 1500
        },
"Bedsheet": {
    "Washing": 1000
},

"Duvet": {
    "Small": 1500,
    "Medium": 2000,
    "Large": 3000
}

    };


    /* =========================================
       FORMAT MONEY
    ========================================= */

    function formatMoney(amount) {
        return "₦" + Number(amount).toLocaleString("en-NG");
    }


    /* =========================================
       UPDATE PRICE OPTIONS
    ========================================= */

    function updatePriceOptions(row) {

        const itemSelect = row.querySelector(".item-select");
        const priceSelect = row.querySelector(".item-price");

        const selectedItem = itemSelect.value;

        // Clear old options
        priceSelect.innerHTML =
            '<option value="">Select Service</option>';

        if (!selectedItem || !laundryPrices[selectedItem]) {
            return;
        }

        const services = laundryPrices[selectedItem];

        Object.entries(services).forEach(([service, price]) => {

            const option = document.createElement("option");

            option.value = price;

            option.textContent =
                `${service} - ${formatMoney(price)}`;

            option.dataset.service = service;

            priceSelect.appendChild(option);
        });
    }


    /* =========================================
       CALCULATE ONE ROW
    ========================================= */

    function calculateRow(row) {

        const quantityInput =
            row.querySelector(".item-quantity");

        const priceSelect =
            row.querySelector(".item-price");

        const totalDisplay =
            row.querySelector(".item-total");

        const quantity =
            Number(quantityInput.value) || 0;

        const price =
            Number(priceSelect.value) || 0;

        const total = quantity * price;

        totalDisplay.textContent =
            formatMoney(total);

        calculateGrandTotal();
    }


    /* =========================================
       CALCULATE OVERALL TOTAL
    ========================================= */

    function calculateGrandTotal() {

        let grandTotal = 0;

        document.querySelectorAll(".booking-row")
            .forEach(row => {

                const quantity =
                    Number(
                        row.querySelector(".item-quantity").value
                    ) || 0;

                const price =
                    Number(
                        row.querySelector(".item-price").value
                    ) || 0;

                grandTotal += quantity * price;
            });

        const grandTotalDisplay =
            document.querySelector(".grand-total");

        if (grandTotalDisplay) {
            grandTotalDisplay.textContent =
                formatMoney(grandTotal);
        }
    }


    /* =========================================
       ITEM SELECTION
    ========================================= */

    document.addEventListener("change", function (e) {

        if (e.target.classList.contains("item-select")) {

            const row =
                e.target.closest(".booking-row");

            updatePriceOptions(row);
            calculateRow(row);
        }


        if (e.target.classList.contains("item-price")) {

            const row =
                e.target.closest(".booking-row");

            calculateRow(row);
        }
    });


    /* =========================================
       QUANTITY CHANGE
    ========================================= */

    document.addEventListener("input", function (e) {

        if (e.target.classList.contains("item-quantity")) {

            const row =
                e.target.closest(".booking-row");

            calculateRow(row);
        }
    });


    /* =========================================
       ADD ANOTHER ITEM
    ========================================= */

    const addItemButton =
        document.querySelector(".add-item-btn");

    if (addItemButton) {

        addItemButton.addEventListener("click", function () {

            const container =
                document.querySelector(".booking-items");

            const firstRow =
                container.querySelector(".booking-row");

            const newRow =
                firstRow.cloneNode(true);

            // Reset values
            newRow.querySelector(".item-select").value = "";

            newRow.querySelector(".item-price").innerHTML =
                '<option value="">Select Service</option>';

            newRow.querySelector(".item-quantity").value = "";

            newRow.querySelector(".item-total").textContent =
                "₦0";

            // Add remove button
            const removeButton =
                document.createElement("button");

            removeButton.type = "button";
            removeButton.className = "remove-item-btn";
            removeButton.textContent = "Remove";

            newRow.appendChild(removeButton);

            container.appendChild(newRow);

            calculateGrandTotal();
        });
    }


    /* =========================================
       REMOVE ITEM
    ========================================= */

    document.addEventListener("click", function (e) {

        if (e.target.classList.contains("remove-item-btn")) {

            const rows =
                document.querySelectorAll(".booking-row");

            // Don't remove the last remaining row
            if (rows.length > 1) {

                e.target.closest(".booking-row").remove();

                calculateGrandTotal();
            }
        }
    });


    /* =========================================
       VIEW PRICES TOGGLE
    ========================================= */

    document.querySelectorAll(".toggle-btn")
        .forEach(button => {

            button.addEventListener("click", function () {

                const content =
                    this.nextElementSibling;

                if (content) {
                    content.classList.toggle("active");
                }

            });

        });


    /* =========================================
       START BOOKING BUTTON
    ========================================= */

    document.querySelectorAll(".start-booking-btn")
        .forEach(button => {

            button.addEventListener("click", function () {

                const bookingContent =
                    this.closest(".service-booking-card")
                        .querySelector(".booking-content");

                if (bookingContent) {

                    bookingContent.classList.toggle("active");

                }

            });

        });

});