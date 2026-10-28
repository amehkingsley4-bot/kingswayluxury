document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       CONFIGURATION
    ===================================================== */

    /*
     * LOCAL DEVELOPMENT
     *
     * Your Node/Express backend currently runs on:
     * https://kingswayluxury.onrender.com
     * this is the public backend url
     */

    const API_BASE_URL = "https://kingswayluxury.onrender.com";


    /* =====================================================
       GENERAL HELPERS
    ===================================================== */

    function formatMoney(amount) {

        return "₦" +
            Number(amount || 0).toLocaleString("en-NG");

    }


    function showMessage(element, text, color) {

        if (!element) {
            return;
        }

        element.textContent = text;
        element.style.color = color;

    }


    function getTodayForDateInput() {

        const now = new Date();

        const year =
            now.getFullYear();

        const month =
            String(now.getMonth() + 1).padStart(2, "0");

        const day =
            String(now.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;

    }


    function setMinimumDates() {

        const today =
            getTodayForDateInput();


        document
            .querySelectorAll(
                ".pickup-date, .cleaning-service-date, .haircut-appointment-date"
            )
            .forEach(input => {

                input.min = today;

            });

    }


    /* =====================================================
       PAYMENT SECTION
    ===================================================== */

    function createPaymentSection(
        section,
        type,
        bookingId
    ) {

        if (
            !section ||
            !bookingId
        ) {

            return;

        }


        section.hidden = false;


        section.innerHTML = `

            <div class="payment-instructions">

                <h4>
                    Payment Instructions
                </h4>


                <p>
                    Your booking has been submitted successfully.
                    Please make payment using the account details below.
                </p>


                <p>
                    <strong>Payment Method:</strong>
         s           OPay
                </p>


                <p>
                    <strong>Account Name:</strong>
                    Kingsley Ameh
                </p>


                <p>
                    <strong>Account Number:</strong>
                    8136905393
                </p>


                <p>
                    After making payment, upload your payment
                    receipt/proof below.
                </p>


                <p>
                    Your booking will remain pending until
                    Kingsway Luxury verifies your payment and
                    confirms your service date.
                </p>


                <p>
                    Once your payment is verified and your booking
                    is confirmed, your confirmed booking details,
                    including your service date and time, will be
                    sent to your email address.
                </p>


                <form class="payment-proof-form">

                    <input
                        type="file"
                        class="payment-proof-input"
                        accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                        required
                    >


                    <button
                        type="submit"
                        class="payment-proof-btn"
                    >
                        Upload Payment Proof
                    </button>


                    <p class="payment-proof-message"></p>

                </form>

            </div>

        `;


        const paymentForm =
            section.querySelector(
                ".payment-proof-form"
            );


        const fileInput =
            section.querySelector(
                ".payment-proof-input"
            );


        const paymentMessage =
            section.querySelector(
                ".payment-proof-message"
            );


        if (!paymentForm) {
            return;
        }


        paymentForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const file =
                    fileInput?.files?.[0];


                if (!file) {

                    showMessage(
                        paymentMessage,
                        "Please select your payment receipt.",
                        "red"
                    );

                    return;

                }


                const fileName =
                    file.name.toLowerCase();


                const validExtension =
                    fileName.endsWith(".jpg") ||
                    fileName.endsWith(".jpeg") ||
                    fileName.endsWith(".png") ||
                    fileName.endsWith(".pdf");


                if (!validExtension) {

                    showMessage(
                        paymentMessage,
                        "Please upload a JPG, PNG or PDF payment receipt.",
                        "red"
                    );

                    return;

                }


                if (
                    file.size >
                    5 * 1024 * 1024
                ) {

                    showMessage(
                        paymentMessage,
                        "Payment receipt must not exceed 5MB.",
                        "red"
                    );

                    return;

                }


                const formData =
                    new FormData();


                formData.append(
                    "paymentProof",
                    file
                );


                showMessage(
                    paymentMessage,
                    "Uploading your payment proof...",
                    "gold"
                );


                const uploadButton =
                    section.querySelector(
                        ".payment-proof-btn"
                    );


                if (uploadButton) {

                    uploadButton.disabled =
                        true;

                }


                try {

                    const response =
                        await fetch(
                            `${API_BASE_URL}/api/payment/${type}/${bookingId}`,
                            {
                                method: "POST",
                                body: formData
                            }
                        );


                    const result =
                        await response.json();


                    if (response.ok) {

                        showMessage(
                            paymentMessage,
                            "Payment proof submitted successfully. Your payment is now awaiting verification. Once your payment is verified and your booking is confirmed, your confirmed service date and time will be sent to your email address.",
                            "gold"
                        );


                        fileInput.value = "";


                        if (uploadButton) {

                            uploadButton.textContent =
                                "Payment Proof Submitted";

                        }

                    } else {

                        showMessage(
                            paymentMessage,
                            result.message ||
                            "Unable to submit payment proof.",
                            "red"
                        );


                        if (uploadButton) {

                            uploadButton.disabled =
                                false;

                        }

                    }

                } catch (error) {

                    console.error(
                        "Payment proof upload error:",
                        error
                    );


                    showMessage(
                        paymentMessage,
                        "Unable to connect to the server. Please try again.",
                        "red"
                    );


                    if (uploadButton) {

                        uploadButton.disabled =
                            false;

                    }

                }

            }
        );

    }



    /* =====================================================
       LAUNDRY
    ===================================================== */

    const laundryForm =
        document.querySelector(
            ".laundry-booking-form"
        );


    const laundryPrices = {

        Native: {

            "Washing": 600,

            "Ironing": 600,

            "Washing & Ironing": 1200,

            "Starching & Ironing": 1000

        },


        Shirt: {

            "Washing": 300,

            "Ironing": 300,

            "Washing & Ironing": 600

        },


        Trouser: {

            "Washing": 300,

            "Ironing": 300,

            "Washing & Ironing": 600

        },


        Skirt: {

            "Washing": 300,

            "Ironing": 300,

            "Washing & Ironing": 600

        },


        Gown: {

            "Washing": 700,

            "Ironing": 700,

            "Washing & Ironing": 1400,

            "Starching & Ironing": 1000

        },


        Agbada: {

            "Washing": 1000,

            "Ironing": 1000,

            "Washing & Ironing": 2000,

            "Starching & Ironing": 1500

        },


        Bedsheet: {

            "Washing": 1000

        },


        Duvet: {

            "Small": 1500,

            "Medium": 2000,

            "Large": 3000

        },


        Curtain: {

            "Small - Washing": 500,

            "Small - Washing & Ironing": 1000,

            "Medium - Washing": 700,

            "Medium - Washing & Ironing": 1400,

            "Large - Washing": 1000,

            "Large - Washing & Ironing": 2000

        }

    };


    function updateLaundryPriceOptions(row) {

        const itemSelect =
            row.querySelector(
                ".item-select"
            );


        const priceSelect =
            row.querySelector(
                ".item-price"
            );


        if (
            !itemSelect ||
            !priceSelect
        ) {

            return;

        }


        const selectedItem =
            itemSelect.value;


        priceSelect.innerHTML =
            '<option value="">Select Service</option>';


        if (
            !selectedItem ||
            !laundryPrices[selectedItem]
        ) {

            return;

        }


        Object.entries(
            laundryPrices[selectedItem]
        ).forEach(
            ([service, price]) => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    price;


                option.textContent =
                    `${service} - ${formatMoney(price)}`;


                option.dataset.service =
                    service;


                priceSelect.appendChild(
                    option
                );

            }
        );

    }


    function calculateLaundryRow(row) {

        const quantity =
            Number(
                row.querySelector(
                    ".item-quantity"
                )?.value
            ) || 0;


        const price =
            Number(
                row.querySelector(
                    ".item-price"
                )?.value
            ) || 0;


        const totalDisplay =
            row.querySelector(
                ".item-total"
            );


        if (totalDisplay) {

            totalDisplay.textContent =
                formatMoney(
                    quantity * price
                );

        }


        calculateLaundryGrandTotal();

    }


    function calculateLaundryGrandTotal() {

        let grandTotal = 0;


        document
            .querySelectorAll(
                ".laundry-booking-form .booking-row"
            )
            .forEach(
                row => {

                    const quantity =
                        Number(
                            row.querySelector(
                                ".item-quantity"
                            )?.value
                        ) || 0;


                    const price =
                        Number(
                            row.querySelector(
                                ".item-price"
                            )?.value
                        ) || 0;


                    grandTotal +=
                        quantity * price;

                }
            );


        const grandTotalDisplay =
            laundryForm?.querySelector(
                ".grand-total"
            );


        if (grandTotalDisplay) {

            grandTotalDisplay.textContent =
                formatMoney(
                    grandTotal
                );

        }

    }


    document.addEventListener(
        "change",
        function (event) {

            if (
                event.target.classList.contains(
                    "item-select"
                )
            ) {

                const row =
                    event.target.closest(
                        ".booking-row"
                    );


                if (row) {

                    updateLaundryPriceOptions(
                        row
                    );

                    calculateLaundryRow(
                        row
                    );

                }

            }


            if (
                event.target.classList.contains(
                    "item-price"
                )
            ) {

                const row =
                    event.target.closest(
                        ".booking-row"
                    );


                if (row) {

                    calculateLaundryRow(
                        row
                    );

                }

            }

        }
    );


    document.addEventListener(
        "input",
        function (event) {

            if (
                event.target.classList.contains(
                    "item-quantity"
                )
            ) {

                const row =
                    event.target.closest(
                        ".booking-row"
                    );


                if (row) {

                    calculateLaundryRow(
                        row
                    );

                }

            }

        }
    );


    const addItemButton =
        document.querySelector(
            ".add-item-btn"
        );


    if (addItemButton) {

        addItemButton.addEventListener(
            "click",
            function () {

                const container =
                    document.querySelector(
                        ".booking-items"
                    );


                if (!container) {
                    return;
                }


                const firstRow =
                    container.querySelector(
                        ".booking-row"
                    );


                if (!firstRow) {
                    return;
                }


                const newRow =
                    firstRow.cloneNode(
                        true
                    );


                const itemSelect =
                    newRow.querySelector(
                        ".item-select"
                    );


                const priceSelect =
                    newRow.querySelector(
                        ".item-price"
                    );


                const quantityInput =
                    newRow.querySelector(
                        ".item-quantity"
                    );


                const totalDisplay =
                    newRow.querySelector(
                        ".item-total"
                    );


                if (itemSelect) {

                    itemSelect.value =
                        "";

                }


                if (priceSelect) {

                    priceSelect.innerHTML =
                        '<option value="">Select Service</option>';

                }


                if (quantityInput) {

                    quantityInput.value =
                        "";

                }


                if (totalDisplay) {

                    totalDisplay.textContent =
                        "₦0";

                }


                const oldRemoveButton =
                    newRow.querySelector(
                        ".remove-item-btn"
                    );


                if (oldRemoveButton) {

                    oldRemoveButton.remove();

                }


                const removeButton =
                    document.createElement(
                        "button"
                    );


                removeButton.type =
                    "button";


                removeButton.className =
                    "remove-item-btn";


                removeButton.textContent =
                    "Remove";


                newRow.appendChild(
                    removeButton
                );


                container.appendChild(
                    newRow
                );


                calculateLaundryGrandTotal();

            }
        );

    }


    document.addEventListener(
        "click",
        function (event) {

            if (
                event.target.classList.contains(
                    "remove-item-btn"
                )
            ) {

                const rows =
                    document.querySelectorAll(
                        ".laundry-booking-form .booking-row"
                    );


                if (
                    rows.length <= 1
                ) {

                    return;

                }


                const row =
                    event.target.closest(
                        ".booking-row"
                    );


                if (row) {

                    row.remove();

                    calculateLaundryGrandTotal();

                }

            }

        }
    );


    document
        .querySelectorAll(
            ".toggle-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        const content =
                            this.nextElementSibling;


                        if (!content) {
                            return;
                        }


                        content.classList.toggle(
                            "active"
                        );


                        this.textContent =
                            content.classList.contains(
                                "active"
                            )
                                ? "Hide Prices"
                                : "View Prices";

                    }
                );

            }
    );


    const laundryStartButton =
        document.querySelector(
            ".service-booking-card:not(.cleaning-card) .start-booking-btn"
        );


    const laundryContent =
        document.querySelector(
            ".service-booking-card:not(.cleaning-card) .booking-content"
        );


    if (
        laundryStartButton &&
        laundryContent
    ) {

        laundryStartButton.addEventListener(
            "click",
            function () {

                laundryContent.classList.toggle(
                    "active"
                );


                this.textContent =
                    laundryContent.classList.contains(
                        "active"
                    )
                        ? "Close Booking"
                        : "Start Booking";

            }
        );

    }


    /* =====================================================
       LAUNDRY SUBMISSION
    ===================================================== */

    if (laundryForm) {

        laundryForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const name =
                    laundryForm
                        .querySelector(
                            ".customer-name"
                        )
                        ?.value.trim() || "";


                const phone =
                    laundryForm
                        .querySelector(
                            ".customer-phone"
                        )
                        ?.value.trim() || "";


                const email =
                    laundryForm
                        .querySelector(
                            ".customer-email"
                        )
                        ?.value.trim() || "";


                const pickupDate =
                    laundryForm
                        .querySelector(
                            ".pickup-date"
                        )
                        ?.value || "";


                const pickupAddress =
                    laundryForm
                        .querySelector(
                            ".pickup-address"
                        )
                        ?.value.trim() || "";


                const deliveryAddress =
                    laundryForm
                        .querySelector(
                            ".delivery-address"
                        )
                        ?.value.trim() || "";


                const message =
                    laundryForm
                        .querySelector(
                            ".booking-message"
                        );


                if (
                    !name ||
                    !phone ||
                    !email ||
                    !pickupDate ||
                    !pickupAddress ||
                    !deliveryAddress
                ) {

                    showMessage(
                        message,
                        "Please fill in all your customer, date and address details.",
                        "red"
                    );

                    return;

                }


                const rows =
                    laundryForm.querySelectorAll(
                        ".booking-row"
                    );


                const items = [];


                rows.forEach(
                    row => {

                        const item =
                            row.querySelector(
                                ".item-select"
                            )?.value || "";


                        const quantity =
                            Number(
                                row.querySelector(
                                    ".item-quantity"
                                )?.value
                            ) || 0;


                        const priceSelect =
                            row.querySelector(
                                ".item-price"
                            );


                        const price =
                            Number(
                                priceSelect?.value
                            ) || 0;


                        const selectedOption =
                            priceSelect?.options[
                                priceSelect.selectedIndex
                            ];


                        const service =
                            selectedOption
                                ?.dataset
                                ?.service || "";


                        const total =
                            quantity * price;


                        if (
                            item &&
                            quantity > 0 &&
                            service &&
                            price > 0
                        ) {

                            items.push({

                                item:
                                    item,

                                quantity:
                                    quantity,

                                service:
                                    service,

                                price:
                                    price,

                                total:
                                    total

                            });

                        }

                    }
                );


                if (
                    items.length === 0
                ) {

                    showMessage(
                        message,
                        "Please select at least one laundry item.",
                        "red"
                    );

                    return;

                }


                const overallTotal =
                    items.reduce(
                        (sum, item) =>
                            sum + item.total,
                        0
                    );


                const bookingData = {

                    name:
                        name,

                    phone:
                        phone,

                    email:
                        email,

                    pickupDate:
                        pickupDate,

                    pickupAddress:
                        pickupAddress,

                    deliveryAddress:
                        deliveryAddress,

                    items:
                        items,

                    overallTotal:
                        overallTotal

                };


                showMessage(
                    message,
                    "Submitting your laundry booking...",
                    "gold"
                );


                const submitButton =
                    laundryForm.querySelector(
                        ".submit-booking-btn"
                    );


                if (submitButton) {

                    submitButton.disabled =
                        true;

                }


                try {

                    const response =
                        await fetch(
                            `${API_BASE_URL}/api/bookings/laundry`,
                            {

                                method:
                                    "POST",

                                headers: {

                                    "Content-Type":
                                        "application/json"

                                },

                                body:
                                    JSON.stringify(
                                        bookingData
                                    )

                            }
                        );


                    const result =
                        await response.json();


                    if (!response.ok) {

                        showMessage(
                            message,
                            result.message ||
                            "Unable to submit booking.",
                            "red"
                        );

                        return;

                    }


                    const bookingId =
                        result.booking?._id ||
                        result.booking?.id;


                    if (!bookingId) {

                        showMessage(
                            message,
                            "Booking was saved, but the booking reference could not be returned. Please contact Kingsway Luxury.",
                            "red"
                        );

                        return;

                    }


                    showMessage(
                        message,
                        "Laundry booking submitted successfully. Please make payment and upload your payment proof below.",
                        "gold"
                    );


                    const paymentSection =
                        laundryForm
                            .closest(
                                ".booking-content"
                            )
                            ?.querySelector(
                                ".laundry-payment-section"
                            );


                    createPaymentSection(
                        paymentSection,
                        "laundry",
                        bookingId
                    );


                    laundryForm.reset();


                    laundryForm
                        .querySelectorAll(
                            ".item-price"
                        )
                        .forEach(
                            select => {

                                select.innerHTML =
                                    '<option value="">Select Service</option>';

                            }
                        );


                    laundryForm
                        .querySelectorAll(
                            ".item-total"
                        )
                        .forEach(
                            total => {

                                total.textContent =
                                    "₦0";

                            }
                        );


                    const grandTotal =
                        laundryForm.querySelector(
                            ".grand-total"
                        );


                    if (grandTotal) {

                        grandTotal.textContent =
                            "₦0";

                    }


                } catch (error) {

                    console.error(
                        "Laundry booking error:",
                        error
                    );


                    showMessage(
                        message,
                        "Unable to connect to the server. Please try again.",
                        "red"
                    );

                } finally {

                    if (submitButton) {

                        submitButton.disabled =
                            false;

                    }

                }

            }
        );

    }



    /* =====================================================
       HOME HAIRCUT
    ===================================================== */

    const haircutButton =
        document.querySelector(
            ".start-haircut-booking-btn"
        );


    const haircutContent =
        document.querySelector(
            ".haircut-booking-content"
        );


    const haircutForm =
        document.querySelector(
            ".haircut-booking-form"
        );


    const haircutSelect =
        document.querySelector(
            ".haircut-service-select"
        );


    const haircutPrice =
        document.querySelector(
            ".haircut-price"
        );


    if (
        haircutButton &&
        haircutContent
    ) {

        haircutButton.addEventListener(
            "click",
            function () {

                haircutContent.classList.toggle(
                    "active"
                );


                this.textContent =
                    haircutContent.classList.contains(
                        "active"
                    )
                        ? "Close Booking"
                        : "Start Booking";

            }
        );

    }


    if (
        haircutSelect &&
        haircutPrice
    ) {

        haircutSelect.addEventListener(
            "change",
            function () {

                const selectedOption =
                    this.options[
                        this.selectedIndex
                    ];


                const price =
                    Number(
                        selectedOption
                            ?.dataset
                            ?.price || 0
                    );


                haircutPrice.textContent =
                    formatMoney(
                        price
                    );

            }
        );

    }


    /* =====================================================
       HAIRCUT SUBMISSION
    ===================================================== */

    if (haircutForm) {

        haircutForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const name =
                    haircutForm
                        .querySelector(
                            ".haircut-customer-name"
                        )
                        ?.value.trim() || "";


                const phone =
                    haircutForm
                        .querySelector(
                            ".haircut-customer-phone"
                        )
                        ?.value.trim() || "";


                const email =
                    haircutForm
                        .querySelector(
                            ".haircut-customer-email"
                        )
                        ?.value.trim() || "";


                const appointmentDate =
                    haircutForm
                        .querySelector(
                            ".haircut-appointment-date"
                        )
                        ?.value || "";


                const appointmentTime =
                    haircutForm
                        .querySelector(
                            ".haircut-appointment-time"
                        )
                        ?.value || "";


                const serviceAddress =
                    haircutForm
                        .querySelector(
                            ".haircut-service-address"
                        )
                        ?.value.trim() || "";


                const serviceSelect =
                    haircutForm.querySelector(
                        ".haircut-service-select"
                    );


                const message =
                    haircutForm.querySelector(
                        ".haircut-booking-message"
                    );


                const service =
                    serviceSelect?.value || "";


                const selectedOption =
                    serviceSelect?.options[
                        serviceSelect.selectedIndex
                    ];


                const price =
                    Number(
                        selectedOption
                            ?.dataset
                            ?.price || 0
                    );


                if (
                    !name ||
                    !phone ||
                    !email ||
                    !appointmentDate ||
                    !appointmentTime ||
                    !serviceAddress
                ) {

                    showMessage(
                        message,
                        "Please fill in all your customer, appointment and address details.",
                        "red"
                    );

                    return;

                }


                if (!service) {

                    showMessage(
                        message,
                        "Please select a haircut service.",
                        "red"
                    );

                    return;

                }


                const bookingData = {

                    name:
                        name,

                    phone:
                        phone,

                    email:
                        email,

                    serviceAddress:
                        serviceAddress,

                    service:
                        "Home Haircut",

                    haircutService:
                        service,

                    price:
                        price,

                    requestedAppointmentDate:
                        appointmentDate,

                    requestedAppointmentTime:
                        appointmentTime

                };


                showMessage(
                    message,
                    "Submitting your booking...",
                    "gold"
                );


                const submitButton =
                    haircutForm.querySelector(
                        ".submit-haircut-booking-btn"
                    );


                if (submitButton) {

                    submitButton.disabled =
                        true;

                }


                try {

                    const response =
                        await fetch(
                            `${API_BASE_URL}/api/bookings/haircut`,
                            {

                                method:
                                    "POST",

                                headers: {

                                    "Content-Type":
                                        "application/json"

                                },

                                body:
                                    JSON.stringify(
                                        bookingData
                                    )

                            }
                        );


                    const result =
                        await response.json();


                    if (!response.ok) {

                        showMessage(
                            message,
                            result.message ||
                            "Unable to submit booking.",
                            "red"
                        );

                        return;

                    }


                    const bookingId =
                        result.booking?._id ||
                        result.booking?.id;


                    if (!bookingId) {

                        showMessage(
                            message,
                            "Booking was saved, but the booking reference could not be returned. Please contact Kingsway Luxury.",
                            "red"
                        );

                        return;

                    }


                    showMessage(
                        message,
                        "Home haircut booking submitted successfully. Please make payment and upload your payment proof below.",
                        "gold"
                    );


                    const paymentSection =
                        haircutForm
                            .closest(
                                ".haircut-booking-content"
                            )
                            ?.querySelector(
                                ".haircut-payment-section"
                            );


                    createPaymentSection(
                        paymentSection,
                        "haircut",
                        bookingId
                    );


                    haircutForm.reset();


                    if (haircutPrice) {

                        haircutPrice.textContent =
                            "₦0";

                    }


                } catch (error) {

                    console.error(
                        "Haircut booking error:",
                        error
                    );


                    showMessage(
                        message,
                        "Unable to connect to the server. Please try again.",
                        "red"
                    );

                } finally {

                    if (submitButton) {

                        submitButton.disabled =
                            false;

                    }

                }

            }
        );

    }



    /* =====================================================
       HOUSE CLEANING
    ===================================================== */

    const cleaningCard =
        document.querySelector(
            ".cleaning-card"
        );


    if (cleaningCard) {

        const bookingToggle =
            cleaningCard.querySelector(
                ".cleaning-booking-toggle"
            );


        const bookingContent =
            cleaningCard.querySelector(
                ".cleaning-booking-content"
            );


        const closeButton =
            cleaningCard.querySelector(
                ".close-cleaning-booking-btn"
            );


        const cleaningForm =
            cleaningCard.querySelector(
                ".cleaning-booking-form"
            );


        const packageSelect =
            cleaningCard.querySelector(
                ".cleaning-package"
            );


        const bedroomSelect =
            cleaningCard.querySelector(
                ".cleaning-bedroom"
            );


        const priceDisplay =
            cleaningCard.querySelector(
                ".cleaning-price"
            );


        const message =
            cleaningCard.querySelector(
                ".cleaning-booking-message"
            );


        const cleaningPrices = {

            deep: {

                1: 80000,
                2: 100000,
                3: 150000,
                4: 200000,
                5: 250000,
                6: 300000

            },


            upholstery: {

                1: 150000,
                2: 170000,
                3: 200000,
                4: 250000,
                5: 300000,
                6: 350000

            },


            fumigation: {

                1: 150000,
                2: 170000,
                3: 250000,
                4: 280000,
                5: 350000,
                6: 400000

            },


            "upholstery-fumigation": {

                1: 200000,
                2: 220000,
                3: 300000,
                4: 350000,
                5: 430000,
                6: 450000

            }

        };


        if (
            bookingToggle &&
            bookingContent
        ) {

            bookingToggle.addEventListener(
                "click",
                function () {

                    bookingContent.classList.toggle(
                        "active"
                    );


                    this.textContent =
                        bookingContent.classList.contains(
                            "active"
                        )
                            ? "Close Booking"
                            : "Start Booking";

                }
            );

        }


        if (
            closeButton &&
            bookingContent
        ) {

            closeButton.addEventListener(
                "click",
                function () {

                    bookingContent.classList.remove(
                        "active"
                    );


                    if (bookingToggle) {

                        bookingToggle.textContent =
                            "Start Booking";

                    }

                }
            );

        }


        function calculateCleaningPrice() {

            const packageType =
                packageSelect?.value || "";


            const bedrooms =
                bedroomSelect?.value || "";


            if (
                !packageType ||
                !bedrooms
            ) {

                if (priceDisplay) {

                    priceDisplay.textContent =
                        "₦0";

                }

                return;

            }


            const price =
                cleaningPrices[
                    packageType
                ]?.[
                    bedrooms
                ] || 0;


            if (priceDisplay) {

                priceDisplay.textContent =
                    formatMoney(
                        price
                    );

            }

        }


        if (packageSelect) {

            packageSelect.addEventListener(
                "change",
                calculateCleaningPrice
            );

        }


        if (bedroomSelect) {

            bedroomSelect.addEventListener(
                "change",
                calculateCleaningPrice
            );

        }


        /* =================================================
           CLEANING SUBMISSION
        ================================================= */

        if (cleaningForm) {

            cleaningForm.addEventListener(
                "submit",
                async function (event) {

                    event.preventDefault();


                    const name =
                        cleaningForm
                            .querySelector(
                                ".cleaning-customer-name"
                            )
                            ?.value.trim() || "";


                    const phone =
                        cleaningForm
                            .querySelector(
                                ".cleaning-customer-phone"
                            )
                            ?.value.trim() || "";


                    const email =
                        cleaningForm
                            .querySelector(
                                ".cleaning-customer-email"
                            )
                            ?.value.trim() || "";


                    const serviceDate =
                        cleaningForm
                            .querySelector(
                                ".cleaning-service-date"
                            )
                            ?.value || "";


                    const serviceAddress =
                        cleaningForm
                            .querySelector(
                                ".cleaning-service-address"
                            )
                            ?.value.trim() || "";


                    const packageType =
                        packageSelect?.value || "";


                    const bedrooms =
                        bedroomSelect?.value || "";


                    if (!name) {

                        showMessage(
                            message,
                            "Please enter your name.",
                            "red"
                        );

                        return;

                    }


                    if (!phone) {

                        showMessage(
                            message,
                            "Please enter your phone number.",
                            "red"
                        );

                        return;

                    }


                    if (!email) {

                        showMessage(
                            message,
                            "Please enter your email address.",
                            "red"
                        );

                        return;

                    }


                    if (!serviceDate) {

                        showMessage(
                            message,
                            "Please select your preferred service date.",
                            "red"
                        );

                        return;

                    }


                    if (!serviceAddress) {

                        showMessage(
                            message,
                            "Please enter the exact service address.",
                            "red"
                        );

                        return;

                    }


                    if (!packageType) {

                        showMessage(
                            message,
                            "Please select a cleaning package.",
                            "red"
                        );

                        return;

                    }


                    if (!bedrooms) {

                        showMessage(
                            message,
                            "Please select the number of bedrooms.",
                            "red"
                        );

                        return;

                    }


                    const price =
                        cleaningPrices[
                            packageType
                        ]?.[
                            bedrooms
                        ] || 0;


                    if (!price) {

                        showMessage(
                            message,
                            "Unable to calculate the cleaning price.",
                            "red"
                        );

                        return;

                    }


                    const bookingData = {

                        name:
                            name,

                        phone:
                            phone,

                        email:
                            email,

                        serviceAddress:
                            serviceAddress,

                        requestedServiceDate:
                            serviceDate,

                        bedrooms:
                            Number(
                                bedrooms
                            ),

                        package:
                            packageType,

                        price:
                            price

                    };


                    showMessage(
                        message,
                        "Submitting your booking...",
                        "gold"
                    );


                    const submitButton =
                        cleaningForm.querySelector(
                            ".submit-cleaning-booking-btn"
                        );


                    if (submitButton) {

                        submitButton.disabled =
                            true;

                    }


                    try {

                        const response =
                            await fetch(
                                `${API_BASE_URL}/api/bookings/cleaning`,
                                {

                                    method:
                                        "POST",

                                    headers: {

                                        "Content-Type":
                                            "application/json"

                                    },

                                    body:
                                        JSON.stringify(
                                            bookingData
                                        )

                                }
                            );


                        const result =
                            await response.json();


                        if (!response.ok) {

                            showMessage(
                                message,
                                result.message ||
                                "Unable to submit booking.",
                                "red"
                            );

                            return;

                        }


                        const bookingId =
                            result.booking?._id ||
                            result.booking?.id;


                        if (!bookingId) {

                            showMessage(
                                message,
                                "Booking was saved, but the booking reference could not be returned. Please contact Kingsway Luxury.",
                                "red"
                            );

                            return;

                        }


                        showMessage(
                            message,
                            "House cleaning booking submitted successfully. Please make payment and upload your payment proof below.",
                            "gold"
                        );


                        const paymentSection =
                            cleaningCard.querySelector(
                                ".cleaning-payment-section"
                            );


                        createPaymentSection(
                            paymentSection,
                            "cleaning",
                            bookingId
                        );


                        cleaningForm.reset();


                        if (priceDisplay) {

                            priceDisplay.textContent =
                                "₦0";

                        }


                    } catch (error) {

                        console.error(
                            "House cleaning booking error:",
                            error
                        );


                        showMessage(
                            message,
                            "Unable to connect to the server. Please try again.",
                            "red"
                        );

                    } finally {

                        if (submitButton) {

                            submitButton.disabled =
                                false;

                        }

                    }

                }
            );

        }

    }



    /* =====================================================
       INTERIOR DECOR
    ===================================================== */

    const exploreInteriorButton =
        document.querySelector(
            ".explore-interior-btn"
        );


    const interiorExplorePanel =
        document.getElementById(
            "interiorExplorePanel"
        );


    const closeInteriorButton =
        document.querySelector(
            ".close-interior-btn"
        );


    if (
        exploreInteriorButton &&
        interiorExplorePanel
    ) {

        exploreInteriorButton.addEventListener(
            "click",
            function () {

                interiorExplorePanel.classList.add(
                    "active"
                );


                document.body.style.overflow =
                    "hidden";

            }
        );

    }


    if (
        closeInteriorButton &&
        interiorExplorePanel
    ) {

        closeInteriorButton.addEventListener(
            "click",
            function () {

                interiorExplorePanel.classList.remove(
                    "active"
                );


                document.body.style.overflow =
                    "";

            }
        );

    }


    if (interiorExplorePanel) {

        interiorExplorePanel.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    interiorExplorePanel
                ) {

                    interiorExplorePanel.classList.remove(
                        "active"
                    );


                    document.body.style.overflow =
                        "";

                }

            }
        );

    }



    /* =====================================================
       INITIAL SETUP
    ===================================================== */

    setMinimumDates();

    calculateLaundryGrandTotal();

});