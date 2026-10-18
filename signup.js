// This list holds all the subscribers (filled from subscribers.json)
let subscribers = [];
let form = document.getElementById("signupForm");

// Load the saved subscribers from subscribers.json when the page opens
fetch("subscribers.json")
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        subscribers = data;
        showSubscribers();
    })
    .catch(function () {
        console.log("Could not load subscribers.json. Make sure it is in the same folder and you are using Live Server.");
    });

function showError(fieldId, message) {
    document.getElementById(fieldId).classList.add("is-invalid");
    document.getElementById(fieldId + "Error").textContent = message;
}

function clearError(fieldId) {
    document.getElementById(fieldId).classList.remove("is-invalid");
    document.getElementById(fieldId + "Error").textContent = "";
}
 
form.addEventListener("submit", function (event) {
 
    event.preventDefault();
    let fullName = document.getElementById("fullName").value.trim();
    let email = document.getElementById("email").value.trim();
    let phone = document.getElementById("phone").value.trim();
    let age = document.getElementById("age").value.trim();
    let address = document.getElementById("address").value.trim();
 
    let isValid = true;
 
    clearError("fullName");
 
    if (fullName === "") {
        showError("fullName", "Please enter your full name.");
        isValid = false;
    } else if (!fullName.includes(" ")) {
        showError("fullName", "Please enter your first and last name.");
        isValid = false;
    }
 
    clearError("email");
 
    let emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
 
    if (email === "") {
        showError("email", "Please enter your email address.");
        isValid = false;
    } else if (!emailPattern.test(email)) {
        showError("email", "Enter a valid email, like someone@somedomain.com.");
        isValid = false;
    }

    clearError("phone");
 
    if (phone !== "") {
        let phoneNumbers = phone.replaceAll("-", "").replaceAll(" ", "");
 
        if (isNaN(phoneNumbers) || phoneNumbers.length !== 10) {
            showError("phone", "Phone number must be 10 digits, like 555-123-4567.");
            isValid = false;
        }
    }
    clearError("age");
 
    if (age === "") {
        showError("age", "Please enter your age.");
        isValid = false;
    } else if (isNaN(age)) {
        showError("age", "Age must be a number.");
        isValid = false;
    } else if (Number(age) < 13 || Number(age) > 120) {
        showError("age", "Age must be between 13 and 120.");
        isValid = false;
    }
    clearError("address");
 
    if (address === "") {
        showError("address", "Please enter your address.");
        isValid = false;
    }
 
    if (isValid === false) {
        return;
    }
 
    let subscriber = {
        id: subscribers.length + 1,
        fullName: fullName,
        email: email,
        phone: phone,
        age: Number(age),
        address: address
    };

    subscribers.push(subscriber);
 
    
    let successMessage = document.getElementById("successMessage");
    successMessage.textContent = "Thanks, " + fullName + "! You are now subscribed.";
    successMessage.classList.remove("d-none");
 
    showSubscribers();
 
    form.reset();
});
 
form.addEventListener("reset", function () {
    clearError("fullName");
    clearError("email");
    clearError("phone");
    clearError("age");
    clearError("address");
});
 
function showSubscribers() {
 
    let tableBody = document.getElementById("subscriberTableBody");
 
    tableBody.innerHTML = "";
 
    for (let i = 0; i < subscribers.length; i++) {
        let s = subscribers[i];
 
        tableBody.innerHTML +=
            "<tr>" +
                "<td>" + s.id + "</td>" +
                "<td>" + s.fullName + "</td>" +
                "<td>" + s.email + "</td>" +
                "<td>" + s.phone + "</td>" +
                "<td>" + s.age + "</td>" +
                "<td>" + s.address + "</td>" +
            "</tr>";
    }
 
    document.getElementById("jsonOutput").textContent = JSON.stringify(subscribers, null, 2);
    document.getElementById("subscriberSection").classList.remove("d-none");
}
document.getElementById("downloadBtn").addEventListener("click", function () {
 
    let jsonText = JSON.stringify(subscribers, null, 2);
    let file = new Blob([jsonText], { type: "application/json" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = "subscribers.json";
    link.click();
});
