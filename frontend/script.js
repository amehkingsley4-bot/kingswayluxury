document.addEventListener("DOMContentLoaded", function () {

    // ==============================
    // BOOKING FORM
    // ==============================
    const form = document.getElementById("bookingForm");

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();

            const name = document.getElementById("name").value;
            const location = document.getElementById("location").value;
            const service = document.getElementById("service").value;

            const message =
                `Hello Kingsway Luxury 👑,%0A` +
                `Name: ${encodeURIComponent(name)}%0A` +
                `Location: ${encodeURIComponent(location)}%0A` +
                `Service: ${encodeURIComponent(service)}`;

            const phone = "2348136905393";

            window.open(
                `https://wa.me/${phone}?text=${message}`,
                "_blank"
            );
        });
    }


    // ==============================
    // PRICE LIST DROPDOWN
    // ==============================
    const toggleButtons = document.querySelectorAll(".toggle-btn");

    toggleButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const priceContent = this.nextElementSibling;

            if (!priceContent) {
                return;
            }

            priceContent.classList.toggle("active");

            // Change button text
            if (priceContent.classList.contains("active")) {
                this.textContent = "Hide Prices";
            } else {
                this.textContent = "View Prices";
            }

        });

    });

});