
let products = [];

let editingId = null;

let defaultProducts = [
    { id: "SW-STD-M", title: "Standard Subscription - Monthly", category: "Standard", unit: "Per Month", price: 4.99, additionalInfo: "Digital access to all basketball and football articles" },
    { id: "SW-STD-Y", title: "Standard Subscription - Yearly", category: "Standard", unit: "Per Year", price: 49.99, additionalInfo: "Digital access, 2 months free" },
    { id: "SW-PRE-M", title: "Premium Subscription - Monthly", category: "Premium", unit: "Per Month", price: 9.99, additionalInfo: "Print + digital, ad-free, exclusive player interviews" },
    { id: "SW-PRE-Y", title: "Premium Subscription - Yearly", category: "Premium", unit: "Per Year", price: 99.99, additionalInfo: "Print + digital, ad-free, exclusive interviews, 2 months free" }
];

$(document).ready(function () {

    let savedData = null;
    try {
        savedData = localStorage.getItem("sportsWeeklyPlans");
    } catch (error) {
        savedData = null;
    }

    if (savedData !== null) {
       
        products = JSON.parse(savedData);
        showProducts();
        return;
    }

    loadFromJsonFile();
});



function loadFromJsonFile() {

    $.getJSON("products.json")
        .done(function (data) {
            products = data;
            showProducts();
        })
        .fail(function () {
            console.log("Could not load products.json, so the backup copy is being used.");
            products = defaultProducts.slice();
            showProducts();
        });
}


function saveProducts() {
    try {
        localStorage.setItem("sportsWeeklyPlans", JSON.stringify(products));
    } catch (error) {
        console.log("Could not save to the browser.");
    }
}

$("#resetBtn").on("click", function () {

    if (confirm("Reset all plans back to the original products.json?") === false) {
        return;
    }

    try {
        localStorage.removeItem("sportsWeeklyPlans");
    } catch (error) {
    }

    resetForm();
    showSuccess("Plans reset to the original products.json.");
    loadFromJsonFile();
});


function showError(fieldId, message) {
    $("#" + fieldId).addClass("is-invalid");
    $("#" + fieldId + "Error").text(message);
}

function clearError(fieldId) {
    $("#" + fieldId).removeClass("is-invalid");
    $("#" + fieldId + "Error").text("");
}

function clearAllErrors() {
    clearError("productId");
    clearError("title");
    clearError("category");
    clearError("unit");
    clearError("price");
}


$("#productForm").on("submit", function (event) {


    event.preventDefault();

    $("#successMessage").addClass("d-none");

    let productId = $("#productId").val().trim().toUpperCase();
    let title = $("#title").val().trim();
    let category = $("#category").val();
    let unit = $("#unit").val();
    let price = $("#price").val().trim();
    let additionalInfo = $("#additionalInfo").val().trim();

    let isValid = true;

    clearAllErrors();

    let idPattern = /^[A-Z0-9-]+$/;

    if (productId === "") {
        showError("productId", "Please enter a plan ID.");
        isValid = false;
    } else if (!idPattern.test(productId)) {
        showError("productId", "ID can only have letters, numbers, and dashes, like SW-PRE-M.");
        isValid = false;
    } else if (editingId === null && findProduct(productId) !== null) {
        showError("productId", "A plan with this ID already exists.");
        isValid = false;
    }


    if (title === "") {
        showError("title", "Please enter a plan name.");
        isValid = false;
    } else if (title.length < 3) {
        showError("title", "Plan name must be at least 3 characters.");
        isValid = false;
    }

    if (category === "") {
        showError("category", "Please choose a category.");
        isValid = false;
    }

    if (unit === "") {
        showError("unit", "Please choose a billing period.");
        isValid = false;
    }

    if (price === "") {
        showError("price", "Please enter a price.");
        isValid = false;
    } else if (isNaN(price)) {
        showError("price", "Price must be a number, like 9.99.");
        isValid = false;
    } else if (Number(price) <= 0) {
        showError("price", "Price must be more than $0.");
        isValid = false;
    }

    if (isValid === false) {
        return;
    }

    let plan = {
        id: productId,
        title: title,
        category: category,
        unit: unit,
        price: Number(Number(price).toFixed(2)),
        additionalInfo: additionalInfo
    };


    if (editingId === null) {

        products.push(plan);
        showSuccess("Added " + title + ".");
    } else {

        for (let i = 0; i < products.length; i++) {
            if (products[i].id === editingId) {
                products[i] = plan;
            }
        }
        showSuccess("Updated " + title + ".");
    }

    resetForm();
    showProducts();
});

function showSuccess(message) {
    $("#successMessage").text(message).removeClass("d-none");
}


function findProduct(id) {
    for (let i = 0; i < products.length; i++) {
        if (products[i].id === id) {
            return products[i];
        }
    }
    return null;
}


function showProducts() {

    let tableBody = $("#productTableBody");

    // Empty the table first so nothing shows up twice
    tableBody.empty();

    for (let i = 0; i < products.length; i++) {
        let p = products[i];

        let row = $("<tr>");
        row.append($("<td>").text(p.id));
        row.append($("<td>").text(p.title));
        row.append($("<td>").text(p.category));
        row.append($("<td>").text(p.unit));
        row.append($("<td>").text("$" + p.price.toFixed(2)));
        row.append($("<td>").text(p.additionalInfo));

        let buttons = $("<td class='text-nowrap'>");
        buttons.append($("<button class='btn btn-sm btn-warning me-1 edit-btn'>Edit</button>").attr("data-id", p.id));
        buttons.append($("<button class='btn btn-sm btn-danger delete-btn'>Delete</button>").attr("data-id", p.id));
        row.append(buttons);

        tableBody.append(row);
    }

    $("#jsonOutput").text(JSON.stringify(products, null, 2));

    saveProducts();

    filterTable();
}

$("#productTableBody").on("click", ".edit-btn", function () {

    let id = $(this).attr("data-id");
    let p = findProduct(id);

    $("#productId").val(p.id).prop("disabled", true); 
    $("#title").val(p.title);
    $("#category").val(p.category);
    $("#unit").val(p.unit);
    $("#price").val(p.price);
    $("#additionalInfo").val(p.additionalInfo);

    editingId = id;

    clearAllErrors();
    $("#successMessage").addClass("d-none");
    $("#formTitle").text("Update Plan");
    $("#saveBtn").text("Update Plan").removeClass("btn-primary").addClass("btn-warning");
    $("#cancelBtn").text("Cancel");

    $("html, body").animate({ scrollTop: $(".form-card").offset().top - 20 }, 300);
});


$("#productTableBody").on("click", ".delete-btn", function () {

    let id = $(this).attr("data-id");

    if (confirm("Delete plan " + id + "?") === false) {
        return;
    }

    products = products.filter(function (p) {
        return p.id !== id;
    });

    if (editingId === id) {
        resetForm();
    }

    showSuccess("Deleted plan " + id + ".");
    showProducts();
});

$("#cancelBtn").on("click", function () {
    resetForm();
    $("#successMessage").addClass("d-none");
});

function resetForm() {
    $("#productForm")[0].reset();
    $("#productId").prop("disabled", false);
    clearAllErrors();

    editingId = null;
    $("#formTitle").text("Add a Plan");
    $("#saveBtn").text("Add Plan").removeClass("btn-warning").addClass("btn-primary");
    $("#cancelBtn").text("Clear");
}

$("#searchBox").on("input", filterTable);
$("#categoryFilter").on("change", filterTable);

function filterTable() {

    let searchText = $("#searchBox").val().toLowerCase();
    let chosenCategory = $("#categoryFilter").val();
    let visibleRows = 0;

    $("#productTableBody tr").each(function () {

        let rowText = $(this).text().toLowerCase();
        let rowCategory = $(this).find("td").eq(2).text();

        let matchesSearch = rowText.includes(searchText);
        let matchesCategory = (chosenCategory === "All" || rowCategory === chosenCategory);

        if (matchesSearch && matchesCategory) {
            $(this).show();
            visibleRows++;
        } else {
            $(this).hide();
        }
    });

    if (visibleRows === 0) {
        $("#noResults").text("No plans match your search.").removeClass("d-none");
    } else {
        $("#noResults").addClass("d-none");
    }
}

$("#downloadBtn").on("click", function () {

    let jsonText = JSON.stringify(products, null, 2);
    let file = new Blob([jsonText], { type: "application/json" });

    let link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = "products.json";
    link.click();
});
