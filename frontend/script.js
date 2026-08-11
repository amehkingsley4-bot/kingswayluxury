document.addEventListener("DOMContentLoaded", function () {

  // ==============================
  // START BOOKING DROPDOWN
  // ==============================

  document.querySelectorAll(".start-booking-btn").forEach(button => {

    button.addEventListener("click", function () {

      const bookingContent = this.closest(".service-booking-card")
        .querySelector(".booking-content");

      bookingContent.classList.toggle("active");

      // Change button text
      if (bookingContent.classList.contains("active")) {
        this.textContent = "Close Booking";
      } else {
        this.textContent = "Start Booking";
      }

    });

  });


  // ==============================
  // PRICE LIST DROPDOWN
  // ==============================

  document.querySelectorAll(".toggle-btn").forEach(button => {

    button.addEventListener("click", function () {

      const content = this.nextElementSibling;

      content.classList.toggle("active");

      if (content.classList.contains("active")) {
        this.textContent = "Hide Prices";
      } else {
        this.textContent = "View Prices";
      }

    });

  });


  // ==============================
  // ADD ANOTHER ITEM
  // ==============================

  document.querySelectorAll(".add-item-btn").forEach(button => {

    button.addEventListener("click", function () {

      const bookingItems = this
        .closest(".laundry-booking-form")
        .querySelector(".booking-items");

      const newRow = document.createElement("div");

      newRow.className = "booking-row";

      newRow.innerHTML = `
        <select class="item-select">
          <option value="">Select Item</option>
          <option value="Native">Native</option>
          <option value="Shirt">Shirt</option>
          <option value="Trouser">Trouser</option>
          <option value="Skirt">Skirt</option>
          <option value="Gown">Gown</option>
          <option value="Agbada">Agbada</option>
          <option value="Bedsheet">Bedsheet</option>
          <option value="Duvet">Duvet</option>
          <option value="Others">Others</option>
        </select>

        <input
          type="number"
          class="item-quantity"
          min="1"
          placeholder="Quantity"
        >

        <select class="item-price">
          <option value="">Price</option>
        </select>

        <span class="item-total">₦0</span>

        <button type="button" class="remove-item-btn">
          Remove
        </button>
      `;

      bookingItems.appendChild(newRow);

    });

  });


  // ==============================
  // REMOVE ITEM
  // ==============================

  document.addEventListener("click", function (e) {

    if (e.target.classList.contains("remove-item-btn")) {

      e.target.closest(".booking-row").remove();

    }

  });


});