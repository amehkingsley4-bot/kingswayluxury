const form = document.getElementById("bookingForm");

if (form) {
  form.addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const location = document.getElementById("location").value;
    const service = document.getElementById("service").value;

    const message = `Hello Kingsway Luxury 👑,%0A
Name: ${name}%0A
Location: ${location}%0A
Service: ${service}`;

    const phone = "2348136905393";

    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  });
}