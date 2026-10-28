/* =========================================
   KINGSWAY LUXURY
   ADMIN BOOKING DASHBOARD
========================================= */

const API_BASE_URL = "https://kingswayluxury.onrender.com";

/* Normalize booking type values from either the API or older records.
   The API uses lowercase values: laundry, haircut, cleaning. */
function normalizeBookingType(type) {
    const value = String(type || "").trim().toLowerCase();

    if (["laundry", "laundrybooking", "laundrybookings"].includes(value)) {
        return "laundry";
    }

    if (["haircut", "haircutbooking", "haircutbookings", "homehaircut", "home-haircut"].includes(value)) {
        return "haircut";
    }

    if (["cleaning", "house cleaning", "house-cleaning", "housecleaning", "housecleaningbooking", "housecleaningbookings", "cleaningbooking", "cleaningbookings"].includes(value)) {
        return "cleaning";
    }

    return "";
}

function bookingTypeLabel(type) {
    const normalized = normalizeBookingType(type);
    if (normalized === "laundry") return "Laundry";
    if (normalized === "haircut") return "Haircut";
    if (normalized === "cleaning") return "House Cleaning";
    return type || "Unknown Service";
}

let adminToken =
    localStorage.getItem("kingswayAdminToken");

let allBookings = [];


/* =========================================
   ELEMENTS
========================================= */

const loginSection =
    document.getElementById("loginSection");

const dashboardSection =
    document.getElementById("dashboardSection");

const loginForm =
    document.getElementById("loginForm");

const adminPassword =
    document.getElementById("adminPassword");

const loginMessage =
    document.getElementById("loginMessage");

const logoutButton =
    document.getElementById("logoutButton");

const bookingsContainer =
    document.getElementById("bookingsContainer");

const dashboardMessage =
    document.getElementById("dashboardMessage");

const searchInput =
    document.getElementById("searchInput");

const serviceFilter =
    document.getElementById("serviceFilter");

const statusFilter =
    document.getElementById("statusFilter");

const paymentFilter =
    document.getElementById("paymentFilter");

const refreshButton =
    document.getElementById("refreshButton");


/* =========================================
   LOGIN
========================================= */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (e) {

            e.preventDefault();

            const password =
                adminPassword.value;

            loginMessage.textContent =
                "Logging in...";

            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/api/admin/login`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    password
                                })
                        }
                    );

                const result =
                    await response.json();

                if (!response.ok) {

                    loginMessage.textContent =
                        result.message ||
                        "Login failed.";

                    return;
                }

                adminToken =
                    result.token;

                localStorage.setItem(
                    "kingswayAdminToken",
                    adminToken
                );

                showDashboard();

            } catch (error) {

                console.error(error);

                loginMessage.textContent =
                    "Unable to connect to server.";

            }

        }
    );

}


/* =========================================
   SHOW DASHBOARD
========================================= */

function showDashboard() {

    loginSection.classList.add("hidden");

    dashboardSection.classList.remove(
        "hidden"
    );

    loadBookings();
}


/* =========================================
   LOGOUT
========================================= */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function () {

            try {

                await fetch(
                    `${API_BASE_URL}/api/admin/logout`,
                    {
                        method: "POST",

                        headers: {
                            Authorization:
                                `Bearer ${adminToken}`
                        }
                    }
                );

            } catch (error) {

                console.error(error);

            }

            localStorage.removeItem(
                "kingswayAdminToken"
            );

            adminToken = null;

            dashboardSection.classList.add(
                "hidden"
            );

            loginSection.classList.remove(
                "hidden"
            );

        }
    );

}


/* =========================================
   LOAD BOOKINGS
========================================= */

async function loadBookings() {

    dashboardMessage.textContent =
        "Loading bookings...";

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/admin/bookings`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${adminToken}`
                    }
                }
            );

        if (response.status === 401) {

            localStorage.removeItem(
                "kingswayAdminToken"
            );

            location.reload();

            return;
        }

        const result =
            await response.json();

        if (!response.ok) {

            dashboardMessage.textContent =
                result.message ||
                "Unable to load bookings.";

            return;
        }

        /*
         * The backend currently returns the
         * bookings array directly.
         *
         * This also keeps compatibility if
         * the backend later wraps it in
         * { bookings: [...] }.
         */

        allBookings =
            Array.isArray(result)
                ? result
                : (result.bookings || []);

        updateStatistics();

        renderBookings();

        dashboardMessage.textContent = "";

    } catch (error) {

        console.error(
            "Load bookings error:",
            error
        );

        dashboardMessage.textContent =
            "Unable to connect to server.";

    }
}


/* =========================================
   STATISTICS
========================================= */

function updateStatistics() {

    const total =
        allBookings.length;

    const pending =
        allBookings.filter(
            booking =>
                (booking.status || "Pending") ===
                "Pending"
        ).length;

    const proofs =
        allBookings.filter(
            booking =>
                booking.paymentStatus ===
                "Proof Submitted"
        ).length;

    const confirmed =
        allBookings.filter(
            booking =>
                booking.status ===
                "Confirmed"
        ).length;

    const completed =
        allBookings.filter(
            booking =>
                booking.status ===
                "Completed"
        ).length;

    const cancelled =
        allBookings.filter(
            booking =>
                booking.status ===
                "Cancelled"
        ).length;

    const totalElement =
        document.getElementById(
            "totalBookings"
        );

    const pendingElement =
        document.getElementById(
            "pendingBookings"
        );

    const proofElement =
        document.getElementById(
            "proofBookings"
        );

    const confirmedElement =
        document.getElementById(
            "confirmedBookings"
        );

    const completedElement =
        document.getElementById(
            "completedBookings"
        );

    const cancelledElement =
        document.getElementById(
            "cancelledBookings"
        );

    if (totalElement)
        totalElement.textContent = total;

    if (pendingElement)
        pendingElement.textContent = pending;

    if (proofElement)
        proofElement.textContent = proofs;

    if (confirmedElement)
        confirmedElement.textContent = confirmed;

    if (completedElement)
        completedElement.textContent = completed;

    if (cancelledElement)
        cancelledElement.textContent = cancelled;
}


/* =========================================
   FILTER BOOKINGS
========================================= */

function getFilteredBookings() {

    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";

    const service =
        serviceFilter
            ? serviceFilter.value
            : "all";

    const status =
        statusFilter
            ? statusFilter.value
            : "all";

    const paymentStatus =
        paymentFilter
            ? paymentFilter.value
            : "all";

    return allBookings.filter(
        booking => {

            const searchableText = [

                booking.name,

                booking.phone,

                booking.email,

                booking.location,

                booking.serviceAddress,

                booking.pickupAddress,

                booking.deliveryAddress,

                booking.bookingType,

                booking.haircutService,

                booking.package

            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                !search ||
                searchableText.includes(search);

            const matchesService =
                service === "all" ||
                normalizeBookingType(booking.bookingType) === normalizeBookingType(service);

            const matchesStatus =
                status === "all" ||
                (booking.status || "Pending") ===
                    status;

            const matchesPayment =
                paymentStatus === "all" ||
                (booking.paymentStatus || "Pending") ===
                    paymentStatus;

            return (
                matchesSearch &&
                matchesService &&
                matchesStatus &&
                matchesPayment
            );
        }
    );
}


/* =========================================
   RENDER BOOKINGS
========================================= */

function renderBookings() {

    const bookings =
        getFilteredBookings();

    bookingsContainer.innerHTML = "";

    if (bookings.length === 0) {

        bookingsContainer.innerHTML = `

            <div class="empty-state">

                <h3>No bookings found</h3>

                <p>
                    There are currently no bookings
                    matching your search.
                </p>

            </div>

        `;

        return;
    }

    bookings.forEach(
        booking => {

            const card =
                createBookingCard(
                    booking
                );

            bookingsContainer.appendChild(
                card
            );

        }
    );
}


/* =========================================
   CREATE BOOKING CARD
========================================= */

function createBookingCard(
    booking
) {

    const card =
        document.createElement("div");

    card.className =
        "booking-card";

    const status =
        booking.status ||
        "Pending";

    const paymentStatus =
        booking.paymentStatus ||
        "Pending";

    const statusClass =
        status
            .toLowerCase()
            .replace(/\s+/g, "-");

    const paymentClass =
        paymentStatus
            .toLowerCase()
            .replace(/\s+/g, "-");

    const date =
        booking.createdAt
            ? new Date(
                booking.createdAt
            ).toLocaleString(
                "en-NG"
            )
            : "Unknown";


    let serviceDetails = "";


    /* =====================================
       HAIRCUT
    ====================================== */

    if (
        normalizeBookingType(booking.bookingType) === "haircut"
    ) {

        serviceDetails = `

            <div class="detail">

                <strong>Haircut Service</strong>

                ${escapeHTML(
                    booking.haircutService ||
                    "N/A"
                )}

            </div>

            <div class="detail">

                <strong>Price</strong>

                ${formatMoney(
                    booking.price
                )}

            </div>

            <div class="detail">

                <strong>Requested Appointment</strong>

                ${escapeHTML(
                    booking.requestedAppointmentDate ||
                    "N/A"
                )}

                at

                ${escapeHTML(
                    booking.requestedAppointmentTime ||
                    "N/A"
                )}

            </div>

            <div class="detail">

                <strong>Service Address</strong>

                ${escapeHTML(
                    booking.serviceAddress ||
                    "N/A"
                )}

            </div>

        `;

    }


    /* =====================================
       CLEANING
    ====================================== */

    else if (
        normalizeBookingType(booking.bookingType) === "cleaning"
    ) {

        serviceDetails = `

            <div class="detail">

                <strong>Bedrooms</strong>

                ${escapeHTML(
                    String(
                        booking.bedrooms ||
                        "N/A"
                    )
                )}

            </div>

            <div class="detail">

                <strong>Package</strong>

                ${escapeHTML(
                    booking.package ||
                    "N/A"
                )}

            </div>

            <div class="detail">

                <strong>Price</strong>

                ${formatMoney(
                    booking.price
                )}

            </div>

            <div class="detail">

                <strong>Requested Service Date</strong>

                ${escapeHTML(
                    booking.requestedServiceDate ||
                    "N/A"
                )}

            </div>

            <div class="detail full-width">

                <strong>Service Address</strong>

                ${escapeHTML(
                    booking.serviceAddress ||
                    "N/A"
                )}

            </div>

        `;

    }


    /* =====================================
       LAUNDRY
    ====================================== */

    else if (
        normalizeBookingType(booking.bookingType) === "laundry"
    ) {

        serviceDetails = `

            <div class="detail">

                <strong>Laundry Items</strong>

                ${formatLaundryItems(
                    booking.items
                )}

            </div>

            <div class="detail">

                <strong>Total</strong>

                ${formatMoney(
                    booking.overallTotal
                )}

            </div>

            <div class="detail">

                <strong>Requested Pickup Date</strong>

                ${escapeHTML(
                    booking.pickupDate ||
                    "N/A"
                )}

            </div>

            <div class="detail">

                <strong>Pickup Address</strong>

                ${escapeHTML(
                    booking.pickupAddress ||
                    "N/A"
                )}

            </div>

            <div class="detail full-width">

                <strong>Delivery Address</strong>

                ${escapeHTML(
                    booking.deliveryAddress ||
                    "N/A"
                )}

            </div>

        `;

    }


    /* =====================================
       PAYMENT SECTION
    ====================================== */

    let paymentSection = "";

    if (
        paymentStatus ===
        "Proof Submitted"
    ) {

        paymentSection = `

            <div class="payment-box payment-proof">

                <div>

                    <strong>
                        Payment Proof Submitted
                    </strong>

                    <span>
                        Customer has uploaded
                        payment proof.
                    </span>

                </div>

                <button
                    class="receipt-button">

                    View Receipt

                </button>

            </div>

        `;

    } else if (
        paymentStatus ===
        "Verified"
    ) {

        paymentSection = `

            <div class="payment-box payment-verified">

                <div>

                    <strong>
                        Payment Verified
                    </strong>

                    <span>
                        Payment has been verified.
                    </span>

                </div>

                <button
                    class="receipt-button">

                    View Receipt

                </button>

            </div>

        `;

    } else if (
        paymentStatus ===
        "Rejected"
    ) {

        paymentSection = `

            <div class="payment-box payment-rejected">

                <strong>
                    Payment Rejected
                </strong>

                <span>
                    Customer must submit valid
                    payment proof.
                </span>

            </div>

        `;

    } else {

        paymentSection = `

            <div class="payment-box payment-pending">

                <strong>
                    Payment Pending
                </strong>

                <span>
                    Waiting for payment proof.
                </span>

            </div>

        `;
    }


    /* =====================================
       CONFIRMATION SECTION
    ====================================== */

    let confirmationSection = "";

    if (
        paymentStatus ===
        "Verified" &&
        status !== "Completed" &&
        status !== "Cancelled"
    ) {

        /* =================================
           LAUNDRY SCHEDULING
        ================================= */

        if (
            normalizeBookingType(booking.bookingType) === "laundry"
        ) {

            confirmationSection = `

                <div class="confirmation-box">

                    <h4>
                        Confirm Laundry Schedule
                    </h4>

                    <p>
                        Set the customer's confirmed
                        pickup and delivery schedule.
                    </p>

                    <div class="schedule-fields">

                        <div>

                            <label>
                                Pickup Date
                            </label>

                            <input
                                type="date"
                                class="confirmed-pickup-date"
                                value="${getExistingDate(
                                    booking,
                                    "pickup"
                                )}">

                        </div>


                        <div>

                            <label>
                                Pickup Time
                            </label>

                            <input
                                type="time"
                                class="confirmed-pickup-time"
                                value="${getExistingTime(
                                    booking,
                                    "pickup"
                                )}">

                        </div>


                        <div>

                            <label>
                                Delivery Date
                            </label>

                            <input
                                type="date"
                                class="confirmed-delivery-date"
                                value="${getExistingDate(
                                    booking,
                                    "delivery"
                                )}">

                        </div>


                        <div>

                            <label>
                                Delivery Time
                            </label>

                            <input
                                type="time"
                                class="confirmed-delivery-time"
                                value="${getExistingTime(
                                    booking,
                                    "delivery"
                                )}">

                        </div>

                    </div>


                    <button
                        class="confirm-booking-button">

                        Confirm Booking & Send Email

                    </button>

                </div>

            `;

        }


        /* =================================
           HOUSE CLEANING
        ================================= */

        else if (
            normalizeBookingType(booking.bookingType) === "cleaning"
        ) {

            confirmationSection = `

                <div class="confirmation-box">

                    <h4>
                        Confirm Cleaning Schedule
                    </h4>

                    <p>
                        Set the exact date and time
                        for the cleaning service.
                    </p>

                    <div class="schedule-fields">

                        <div>

                            <label>
                                Service Date
                            </label>

                            <input
                                type="date"
                                class="confirmed-date"
                                value="${getExistingDate(
                                    booking
                                )}">

                        </div>


                        <div>

                            <label>
                                Service Time
                            </label>

                            <input
                                type="time"
                                class="confirmed-time"
                                value="${getExistingTime(
                                    booking
                                )}">

                        </div>

                    </div>


                    <button
                        class="confirm-booking-button">

                        Confirm Booking & Send Email

                    </button>

                </div>

            `;

        }


        /* =================================
           HOME HAIRCUT
        ================================= */

        else if (
            normalizeBookingType(booking.bookingType) === "haircut"
        ) {

            confirmationSection = `

                <div class="confirmation-box">

                    <h4>
                        Confirm Haircut Appointment
                    </h4>

                    <p>
                        Set the exact appointment
                        date and time.
                    </p>

                    <div class="schedule-fields">

                        <div>

                            <label>
                                Appointment Date
                            </label>

                            <input
                                type="date"
                                class="confirmed-date"
                                value="${getExistingDate(
                                    booking
                                )}">

                        </div>


                        <div>

                            <label>
                                Appointment Time
                            </label>

                            <input
                                type="time"
                                class="confirmed-time"
                                value="${getExistingTime(
                                    booking
                                )}">

                        </div>

                    </div>


                    <button
                        class="confirm-booking-button">

                        Confirm Booking & Send Email

                    </button>

                </div>

            `;

        }

    }


    card.innerHTML = `

        <div class="booking-top">

            <div>

                <h3>
                    ${escapeHTML(
                        booking.name ||
                        "Unknown Customer"
                    )}
                </h3>

                <span class="service-badge">

                    ${escapeHTML(
                        booking.bookingType
                    )}

                </span>

            </div>


            <div class="status-group">

                <span
                    class="booking-status status-${statusClass}">

                    ${escapeHTML(status)}

                </span>


                <span
                    class="payment-status payment-${paymentClass}">

                    Payment:
                    ${escapeHTML(
                        paymentStatus
                    )}

                </span>

            </div>

        </div>


        <div class="booking-details">

            <div class="detail">

                <strong>Phone</strong>

                ${escapeHTML(
                    booking.phone ||
                    "N/A"
                )}

            </div>


            <div class="detail">

                <strong>Email</strong>

                ${escapeHTML(
                    booking.email ||
                    "N/A"
                )}

            </div>


            <div class="detail">

                <strong>Location</strong>

                ${escapeHTML(
                    booking.location ||
                    "N/A"
                )}

            </div>


            <div class="detail">

                <strong>Date Submitted</strong>

                ${escapeHTML(date)}

            </div>


            ${serviceDetails}

        </div>


        ${paymentSection}


        ${confirmationSection}


        <div class="booking-actions">

            <select
                class="status-select">

                <option
                    value="Pending"
                    ${status === "Pending"
                        ? "selected"
                        : ""}>

                    Pending

                </option>

                <option
                    value="Confirmed"
                    ${status === "Confirmed"
                        ? "selected"
                        : ""}>

                    Confirmed

                </option>

                <option
                    value="Completed"
                    ${status === "Completed"
                        ? "selected"
                        : ""}>

                    Completed

                </option>

                <option
                    value="Cancelled"
                    ${status === "Cancelled"
                        ? "selected"
                        : ""}>

                    Cancelled

                </option>

            </select>


            <button
                class="update-button">

                Update Status

            </button>


            <button
                class="delete-button">

                Delete Booking

            </button>

        </div>

    `;


    /* =====================================
       RECEIPT BUTTON
    ====================================== */

    const receiptButton =
        card.querySelector(
            ".receipt-button"
        );

    if (receiptButton) {

        receiptButton.addEventListener(
            "click",
            function () {

                viewPaymentProof(
                    booking
                );

            }
        );

    }


    /* =====================================
       VERIFY PAYMENT
    ====================================== */

    if (
        paymentStatus ===
        "Proof Submitted"
    ) {

        const paymentBox =
            card.querySelector(
                ".payment-box"
            );

        const verifyButton =
            document.createElement("button");

        verifyButton.className =
            "verify-payment-button";

        verifyButton.textContent =
            "Verify Payment";

        const rejectButton =
            document.createElement("button");

        rejectButton.className =
            "reject-payment-button";

        rejectButton.textContent =
            "Reject Payment";

        paymentBox.appendChild(
            verifyButton
        );

        paymentBox.appendChild(
            rejectButton
        );


        verifyButton.addEventListener(
            "click",
            async function () {

                await updatePaymentStatus(
                    booking,
                    "Verified"
                );

            }
        );


        rejectButton.addEventListener(
            "click",
            async function () {

                const confirmed =
                    confirm(
                        "Are you sure you want to reject this payment proof?"
                    );

                if (!confirmed) {
                    return;
                }

                await updatePaymentStatus(
                    booking,
                    "Rejected"
                );

            }
        );

    }


    /* =====================================
       CONFIRM BOOKING
    ====================================== */

    const confirmButton =
        card.querySelector(
            ".confirm-booking-button"
        );

    if (confirmButton) {

        confirmButton.addEventListener(
            "click",
            async function () {

                /*
                 * LAUNDRY
                 */

                if (
                    normalizeBookingType(booking.bookingType) === "laundry"
                ) {

                    const pickupDate =
                        card.querySelector(
                            ".confirmed-pickup-date"
                        ).value;

                    const pickupTime =
                        card.querySelector(
                            ".confirmed-pickup-time"
                        ).value;

                    const deliveryDate =
                        card.querySelector(
                            ".confirmed-delivery-date"
                        ).value;

                    const deliveryTime =
                        card.querySelector(
                            ".confirmed-delivery-time"
                        ).value;

                    await confirmLaundryBooking(
                        booking,
                        pickupDate,
                        pickupTime,
                        deliveryDate,
                        deliveryTime
                    );

                    return;
                }


                /*
                 * CLEANING / HAIRCUT
                 */

                const dateInput =
                    card.querySelector(
                        ".confirmed-date"
                    );

                const timeInput =
                    card.querySelector(
                        ".confirmed-time"
                    );

                await confirmBooking(
                    booking,
                    dateInput.value,
                    timeInput.value
                );

            }
        );

    }


    /* =====================================
       UPDATE STATUS
    ===================================== */

    const statusSelect =
        card.querySelector(
            ".status-select"
        );

    const updateButton =
        card.querySelector(
            ".update-button"
        );

    updateButton.addEventListener(
        "click",
        async function () {

            await updateBookingStatus(
                booking,
                statusSelect.value
            );

        }
    );


    /* =====================================
       DELETE
    ===================================== */

    const deleteButton =
        card.querySelector(
            ".delete-button"
        );

    deleteButton.addEventListener(
        "click",
        async function () {

            const confirmed =
                confirm(
                    "Are you sure you want to delete this booking?"
                );

            if (!confirmed) return;

            await deleteBooking(
                booking
            );

        }
    );


    return card;
}


/* =========================================
   VIEW PAYMENT PROOF
========================================= */

function viewPaymentProof(
    booking
) {

    const type = normalizeBookingType(booking.bookingType);

    if (!type) {

        alert(
            "Unknown booking type."
        );

        return;
    }

    const url =
        `${API_BASE_URL}/api/admin/payment-proof/${type}/${booking._id}`;

    fetch(
        url,
        {
            headers: {
                Authorization:
                    `Bearer ${adminToken}`
            }
        }
    )
        .then(async response => {

            if (!response.ok) {

                const result =
                    await response.json()
                        .catch(() => ({}));

                throw new Error(
                    result.message ||
                    "Unable to open receipt."
                );
            }

            return response.blob();

        })
        .then(blob => {

            const blobUrl =
                URL.createObjectURL(blob);

            window.open(
                blobUrl,
                "_blank"
            );

        })
        .catch(error => {

            console.error(error);

            alert(
                error.message ||
                "Unable to open payment receipt."
            );

        });
}


/* =========================================
   UPDATE PAYMENT STATUS
========================================= */

async function updatePaymentStatus(
    booking,
    paymentStatus
) {

    const type = normalizeBookingType(booking.bookingType);

    if (!type) {

        alert(
            "Unknown booking type."
        );

        return;
    }

    try {

        const response =
            await fetch(

                `${API_BASE_URL}/api/admin/bookings/${type}/${booking._id}/payment-status`,

                {

                    method: "PATCH",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${adminToken}`

                    },

                    body:
                        JSON.stringify({
                            paymentStatus
                        })

                }

            );

        const result =
            await response.json();

        if (!response.ok) {

            alert(
                result.message ||
                "Unable to update payment status."
            );

            return;
        }

        await loadBookings();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to connect to server."
        );

    }
}


/* =========================================
   CONFIRM LAUNDRY BOOKING
========================================= */

async function confirmLaundryBooking(
    booking,
    pickupDate,
    pickupTime,
    deliveryDate,
    deliveryTime
) {

    if (!pickupDate) {

        alert(
            "Please select the confirmed pickup date."
        );

        return;
    }

    if (!pickupTime) {

        alert(
            "Please select the confirmed pickup time."
        );

        return;
    }

    if (!deliveryDate) {

        alert(
            "Please select the confirmed delivery date."
        );

        return;
    }

    if (!deliveryTime) {

        alert(
            "Please select the confirmed delivery time."
        );

        return;
    }


    const confirmed =
        confirm(
            "Confirm this laundry booking and send the confirmation email to the customer?"
        );

    if (!confirmed) {
        return;
    }


    const type =
        "laundry";


    try {

        const response =
            await fetch(

                `${API_BASE_URL}/api/admin/bookings/${type}/${booking._id}/confirm`,

                {

                    method: "PATCH",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${adminToken}`

                    },

                    body:
                        JSON.stringify({

                            confirmedPickupDate:
                                pickupDate,

                            confirmedPickupTime:
                                pickupTime,

                            confirmedDeliveryDate:
                                deliveryDate,

                            confirmedDeliveryTime:
                                deliveryTime

                        })

                }

            );


        const result =
            await response.json();


        if (!response.ok) {

            alert(
                result.message ||
                "Unable to confirm laundry booking."
            );

            return;
        }


        alert(
            result.message ||
            "Laundry booking confirmed successfully."
        );


        await loadBookings();


    } catch (error) {

        console.error(error);

        alert(
            "Unable to connect to server."
        );

    }
}


/* =========================================
   CONFIRM CLEANING / HAIRCUT BOOKING
========================================= */

async function confirmBooking(
    booking,
    confirmedDate,
    confirmedTime
) {

    if (!confirmedDate) {

        alert(
            "Please select the confirmed date."
        );

        return;
    }

    if (!confirmedTime) {

        alert(
            "Please select the confirmed time."
        );

        return;
    }


    const confirmed =
        confirm(
            "Confirm this booking and send the confirmation email to the customer?"
        );

    if (!confirmed) {
        return;
    }


    const type = normalizeBookingType(booking.bookingType);

    if (!type) {

        alert(
            "Unknown booking type."
        );

        return;
    }


    try {

        const response =
            await fetch(

                `${API_BASE_URL}/api/admin/bookings/${type}/${booking._id}/confirm`,

                {

                    method: "PATCH",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${adminToken}`

                    },

                    body:
                        JSON.stringify({

                            confirmedDate,

                            confirmedTime

                        })

                }

            );


        const result =
            await response.json();


        if (!response.ok) {

            alert(
                result.message ||
                "Unable to confirm booking."
            );

            return;
        }


        alert(
            result.message ||
            "Booking confirmed successfully."
        );


        await loadBookings();


    } catch (error) {

        console.error(error);

        alert(
            "Unable to connect to server."
        );

    }
}


/* =========================================
   EXISTING CONFIRMED DATE
========================================= */

function getExistingDate(
    booking,
    scheduleType = ""
) {

    if (
        normalizeBookingType(booking.bookingType) === "haircut"
    ) {

        return (
            booking.confirmedAppointmentDate ||
            ""
        );

    }


    if (
        normalizeBookingType(booking.bookingType) === "cleaning"
    ) {

        return (
            booking.confirmedServiceDate ||
            ""
        );

    }


    if (
        normalizeBookingType(booking.bookingType) === "laundry"
    ) {

        if (
            scheduleType ===
            "delivery"
        ) {

            return (
                booking.confirmedDeliveryDate ||
                booking.confirmedPickupDate ||
                ""
            );

        }

        return (
            booking.confirmedPickupDate ||
            ""
        );

    }


    return "";
}


/* =========================================
   EXISTING CONFIRMED TIME
========================================= */

function getExistingTime(
    booking,
    scheduleType = ""
) {

    if (
        normalizeBookingType(booking.bookingType) === "haircut"
    ) {

        return (
            booking.confirmedAppointmentTime ||
            ""
        );

    }


    if (
        normalizeBookingType(booking.bookingType) === "cleaning"
    ) {

        return (
            booking.confirmedServiceTime ||
            ""
        );

    }


    if (
        normalizeBookingType(booking.bookingType) === "laundry"
    ) {

        if (
            scheduleType ===
            "delivery"
        ) {

            return (
                booking.confirmedDeliveryTime ||
                booking.confirmedPickupTime ||
                ""
            );

        }

        return (
            booking.confirmedPickupTime ||
            ""
        );

    }


    return "";
}


/* =========================================
   UPDATE BOOKING STATUS
========================================= */

async function updateBookingStatus(
    booking,
    status
) {

    const type = normalizeBookingType(booking.bookingType);

    if (!type) {

        alert(
            "Unknown booking type."
        );

        return;
    }


    try {

        const response =
            await fetch(

                `${API_BASE_URL}/api/admin/bookings/${type}/${booking._id}/status`,

                {

                    method: "PATCH",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${adminToken}`

                    },

                    body:
                        JSON.stringify({
                            status
                        })

                }

            );


        const result =
            await response.json();


        if (!response.ok) {

            alert(
                result.message ||
                "Unable to update status."
            );

            return;
        }


        await loadBookings();


    } catch (error) {

        console.error(error);

        alert(
            "Unable to connect to server."
        );

    }
}


/* =========================================
   DELETE BOOKING
========================================= */

async function deleteBooking(
    booking
) {

    const type = normalizeBookingType(booking.bookingType);


    if (!type) {

        alert(
            "Unknown booking type."
        );

        return;
    }


    try {

        const response =
            await fetch(

                `${API_BASE_URL}/api/admin/bookings/${type}/${booking._id}`,

                {

                    method: "DELETE",

                    headers: {

                        Authorization:
                            `Bearer ${adminToken}`

                    }

                }

            );


        const result =
            await response.json();


        if (!response.ok) {

            alert(
                result.message ||
                "Unable to delete booking."
            );

            return;
        }


        await loadBookings();


    } catch (error) {

        console.error(error);

        alert(
            "Unable to connect to server."
        );

    }
}


/* =========================================
   LAUNDRY ITEMS
========================================= */

function formatLaundryItems(
    items
) {

    if (
        !Array.isArray(items) ||
        items.length === 0
    ) {

        return "N/A";
    }


    return items.map(
        item => `

            ${escapeHTML(
                item.item ||
                "Item"
            )}

            —

            ${escapeHTML(
                item.service ||
                ""
            )}

            ×

            ${escapeHTML(
                String(
                    item.quantity ||
                    0
                )
            )}

            =

            ${formatMoney(
                item.total
            )}

        `
    ).join("<br>");
}


/* =========================================
   MONEY
========================================= */

function formatMoney(
    amount
) {

    return "₦" +
        Number(
            amount || 0
        ).toLocaleString(
            "en-NG"
        );
}


/* =========================================
   HTML SECURITY
========================================= */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================
   SEARCH / FILTER EVENTS
========================================= */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        renderBookings
    );
}


if (serviceFilter) {

    serviceFilter.addEventListener(
        "change",
        renderBookings
    );
}


if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        renderBookings
    );
}


if (paymentFilter) {

    paymentFilter.addEventListener(
        "change",
        renderBookings
    );
}


if (refreshButton) {

    refreshButton.addEventListener(
        "click",
        loadBookings
    );
}


/* =========================================
   AUTO LOGIN
========================================= */

if (adminToken) {

    showDashboard();
}