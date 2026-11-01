const API_URL = "http://localhost:3000/api/orders";

const TAX_RATE = 0.06;          
const PROMO_CODE = "SW10";      
const MAX_QTY = 10;             

let products = [];   
let cart = [];       



$(document).ready(function () {

    loadCart();


    let savedProducts = null;
    try {
        savedProducts = localStorage.getItem("sportsWeeklyProducts");
    } catch (error) {
        savedProducts = null;
    }

    if (savedProducts !== null) {
        products = JSON.parse(savedProducts);
        showResults(products);
        return;
    }

    $.ajax({
        url: "products.json",
        method: "GET",
        dataType: "json"
    })
        .done(function (data) {
            products = data;
            showResults(products);
        })
        .fail(function () {
            $("#loadError")
                .text("Could not load products.json. Open this page with Live Server so the file can be read.")
                .removeClass("d-none");
        });
});



function showFieldError(fieldId, message) {
    $("#" + fieldId).addClass("is-invalid");
    $("#" + fieldId + "Error").text(message);
}

function clearFieldError(fieldId) {
    $("#" + fieldId).removeClass("is-invalid");
    $("#" + fieldId + "Error").text("");
}


function checkSearchFields() {

    let text = $("#searchText").val().trim();
    let maxPrice = $("#maxPrice").val().trim();
    let isValid = true;

    clearFieldError("searchText");
    clearFieldError("maxPrice");


    let textPattern = /^[A-Za-z0-9 +\-]*$/;

    if (!textPattern.test(text)) {
        showFieldError("searchText", "Use only letters, numbers, spaces, and dashes.");
        isValid = false;
    } else if (text.length > 40) {
        showFieldError("searchText", "Search must be 40 characters or less.");
        isValid = false;
    }

    if (maxPrice !== "") {
        if (isNaN(maxPrice)) {
            showFieldError("maxPrice", "Enter a number, like 20.");
            isValid = false;
        } else if (Number(maxPrice) <= 0) {
            showFieldError("maxPrice", "Must be more than $0.");
            isValid = false;
        }
    }

    return isValid;
}

function searchProducts() {

    if (checkSearchFields() === false) {
        return;
    }

    let text = $("#searchText").val().trim().toLowerCase();
    let category = $("#searchCategory").val();
    let maxPrice = $("#maxPrice").val().trim();

    let matches = $.grep(products, function (p) {

        let searchableText = (p.id + " " + p.description + " " + p.category + " " +
            p.color + " " + p.additionalInfo).toLowerCase();

        let matchesText = searchableText.includes(text);
        let matchesCategory = (category === "All" || p.category === category);
        let matchesPrice = (maxPrice === "" || p.price <= Number(maxPrice));

        return matchesText && matchesCategory && matchesPrice;
    });

    showResults(matches);
}

$("#searchForm").on("submit", function (event) {
    event.preventDefault();
    searchProducts();
});

$("#searchText, #maxPrice").on("input", searchProducts);
$("#searchCategory").on("change", searchProducts);

$("#showAllBtn").on("click", function () {
    $("#searchForm")[0].reset();
    clearFieldError("searchText");
    clearFieldError("maxPrice");
    showResults(products);
});
function showResults(list) {

    let results = $("#productResults");
    results.empty();

    if (list.length === 0) {
        $("#resultCount").text("No products match your search.");
        return;
    }

    $("#resultCount").text("Showing " + list.length + " of " + products.length + " products");

    $.each(list, function (index, p) {
        let extras = "";
        if (p.color) {
            extras += "Color: " + p.color;
        }
        if (p.weight) {
            extras += (extras ? " &middot; " : "") + "Weight: " + p.weight;
        }

        let card = $(
            "<div class='col-md-6'>" +
                "<div class='card product-card p-3'>" +
                    "<div class='d-flex justify-content-between align-items-start mb-1'>" +
                        "<span class='badge category-badge'></span>" +
                        "<span class='text-muted small product-id'></span>" +
                    "</div>" +
                    "<h5 class='product-name mb-1'></h5>" +
                    "<p class='small text-muted mb-1 product-info'></p>" +
                    "<p class='small text-muted mb-2'>" + extras + "</p>" +
                    "<p class='product-price mt-auto mb-2'></p>" +
                    "<div class='input-group input-group-sm'>" +
                        "<span class='input-group-text'>Qty</span>" +
                        "<input type='text' class='form-control qty-input' value='1'>" +
                        "<button class='btn btn-primary add-btn'>Add to Cart</button>" +
                        "<div class='invalid-feedback qty-error'></div>" +
                    "</div>" +
                "</div>" +
            "</div>"
        );

        card.find(".category-badge").text(p.category);
        card.find(".product-id").text(p.id);
        card.find(".product-name").text(p.description);
        card.find(".product-info").text(p.additionalInfo);
        card.find(".product-price").html("$" + p.price.toFixed(2) + " <span>" + p.unit.toLowerCase() + "</span>");
        card.find(".add-btn").attr("data-id", p.id);

        results.append(card);
    });
}

function findProduct(id) {
    let found = $.grep(products, function (p) {
        return p.id === id;
    });
    return found.length > 0 ? found[0] : null;
}

function findCartItem(id) {
    for (let i = 0; i < cart.length; i++) {
        if (cart[i].id === id) {
            return cart[i];
        }
    }
    return null;
}
function checkQuantity(qtyText) {
    if (qtyText === "") {
        return "Enter a quantity.";
    }
    if (!/^\d+$/.test(qtyText)) {
        return "Quantity must be a whole number.";
    }
    let qty = Number(qtyText);
    if (qty < 1 || qty > MAX_QTY) {
        return "Quantity must be 1 to " + MAX_QTY + ".";
    }
    return "";
}

$("#productResults").on("click", ".add-btn", function () {

    let id = $(this).attr("data-id");
    let product = findProduct(id);
    let qtyBox = $(this).siblings(".qty-input");
    let errorBox = $(this).siblings(".qty-error");
    let qtyText = qtyBox.val().trim();

    qtyBox.removeClass("is-invalid");


    let error = checkQuantity(qtyText);
    let qty = Number(qtyText);
    let existing = findCartItem(id);

    if (error === "" && product.category === "Subscription") {
       
        let otherPlan = $.grep(cart, function (item) {
            return item.category === "Subscription";
        });
        if (otherPlan.length > 0) {
            error = "You already have a subscription in your cart.";
        } else if (qty !== 1) {
            error = "Subscriptions are limited to 1.";
        }
    }

    if (error === "" && existing !== null && existing.quantity + qty > MAX_QTY) {
        error = "You can have at most " + MAX_QTY + " of this item.";
    }

    if (error !== "") {
        qtyBox.addClass("is-invalid");
        errorBox.text(error);
        return;
    }
    if (existing !== null) {
        existing.quantity += qty;
    } else {
        cart.push({
            id: product.id,
            description: product.description,
            category: product.category,
            unit: product.unit,
            price: product.price,
            quantity: qty
        });
    }

    qtyBox.val("1");
    showCartMessage("success", "Added " + qty + " x " + product.description + " to your cart.");
    showCart();


    $("#cartTableBody tr[data-id='" + id + "']").addClass("row-flash");
});

function money(amount) {
    return "$" + amount.toFixed(2);
}

function round2(amount) {
    return Math.round(amount * 100) / 100;
}

function getTotals() {
    let subtotal = 0;
    $.each(cart, function (index, item) {
        subtotal += item.price * item.quantity;
    });

    let promo = $("#promoCode").val().trim().toUpperCase();
    let discount = (promo === PROMO_CODE) ? subtotal * 0.10 : 0;
    let tax = (subtotal - discount) * TAX_RATE;

    return {
        subtotal: round2(subtotal),
        discount: round2(discount),
        tax: round2(tax),
        total: round2(subtotal - discount + tax)
    };
}

function showCart() {

    let body = $("#cartTableBody");
    body.empty();

    $.each(cart, function (index, item) {

        let row = $("<tr>").attr("data-id", item.id);

        let nameCell = $("<td>");
        nameCell.append($("<div class='fw-semibold'>").text(item.description));
        nameCell.append($("<div class='small text-muted'>").text(money(item.price) + " " + item.unit.toLowerCase()));
        row.append(nameCell);

        let qtyInput = $("<input type='text' class='form-control form-control-sm cart-qty'>")
            .val(item.quantity)
            .attr("data-id", item.id);
        row.append($("<td>").append(qtyInput));

        row.append($("<td class='text-end'>").text(money(item.price * item.quantity)));

        let removeBtn = $("<button class='btn btn-sm btn-outline-danger remove-btn' title='Remove'>&times;</button>")
            .attr("data-id", item.id);
        row.append($("<td class='text-end'>").append(removeBtn));

        body.append(row);
    });
    if (cart.length === 0) {
        $("#emptyCart").removeClass("d-none");
        $("#cartTable").addClass("d-none");
    } else {
        $("#emptyCart").addClass("d-none");
        $("#cartTable").removeClass("d-none");
    }
    let totals = getTotals();
    $("#subtotal").text(money(totals.subtotal));
    $("#discount").text("-" + money(totals.discount));
    $("#tax").text(money(totals.tax));
    $("#total").text(money(totals.total));
    $("#discountRow").toggleClass("d-none", totals.discount === 0);
    let count = 0;
    $.each(cart, function (index, item) {
        count += item.quantity;
    });
    $("#cartCount").text(count);

    $("#orderJson").text(JSON.stringify(buildOrder(), null, 2));
    saveCart();
}

$("#cartTableBody").on("change", ".cart-qty", function () {

    let id = $(this).attr("data-id");
    let item = findCartItem(id);
    let qtyText = $(this).val().trim();
    let error = checkQuantity(qtyText);

    if (error === "" && item.category === "Subscription" && Number(qtyText) !== 1) {
        error = "Subscriptions are limited to 1.";
    }

    if (error !== "") {
        $(this).addClass("is-invalid").val(item.quantity);
        showCartMessage("danger", item.description + ": " + error);
        return;
    }

    item.quantity = Number(qtyText);
    showCartMessage("success", "Updated " + item.description + " to " + item.quantity + ".");
    showCart();
});

$("#cartTableBody").on("click", ".remove-btn", function () {

    let id = $(this).attr("data-id");
    let item = findCartItem(id);

    $(this).closest("tr").fadeOut(250, function () {
        cart = $.grep(cart, function (c) {
            return c.id !== id;
        });
        showCartMessage("secondary", "Removed " + item.description + " from your cart.");
        showCart();
    });
});

// Remove everything
$("#clearCartBtn").on("click", function () {
    if (cart.length === 0) {
        return;
    }
    cart = [];
    showCartMessage("secondary", "Your cart is now empty.");
    showCart();
});

function showCartMessage(type, message) {
    $("#cartMessage")
        .removeClass("d-none alert-success alert-danger alert-secondary")
        .addClass("alert-" + type)
        .text(message);
}
function saveCart() {
    try {
        localStorage.setItem("sportsWeeklyCart", JSON.stringify(cart));
    } catch (error) {
        console.log("Could not save the cart.");
    }
}

function loadCart() {
    try {
        let saved = localStorage.getItem("sportsWeeklyCart");
        if (saved !== null) {
            cart = JSON.parse(saved);
        }
    } catch (error) {
        cart = [];
    }
    showCart();
}

$("#promoCode").on("input", showCart); 

function checkCheckoutForm() {

    let name = $("#custName").val().trim();
    let email = $("#custEmail").val().trim();
    let promo = $("#promoCode").val().trim().toUpperCase();
    let isValid = true;

    clearFieldError("custName");
    clearFieldError("custEmail");
    clearFieldError("promoCode");

    if (name === "") {
        showFieldError("custName", "Please enter your full name.");
        isValid = false;
    } else if (!name.includes(" ")) {
        showFieldError("custName", "Please enter your first and last name.");
        isValid = false;
    } else if (!/^[A-Za-z .'\-]+$/.test(name)) {
        showFieldError("custName", "Name can only have letters, spaces, apostrophes, and dashes.");
        isValid = false;
    }

    let emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    if (email === "") {
        showFieldError("custEmail", "Please enter your email address.");
        isValid = false;
    } else if (!emailPattern.test(email)) {
        showFieldError("custEmail", "Enter a valid email, like someone@somedomain.com.");
        isValid = false;
    }

    if (promo !== "" && promo !== PROMO_CODE) {
        showFieldError("promoCode", "That promo code is not valid.");
        isValid = false;
    }

    return isValid;
}

function buildOrder() {

    let totals = getTotals();

    let items = $.map(cart, function (item) {
        return {
            id: item.id,
            description: item.description,
            category: item.category,
            unit: item.unit,
            price: item.price,
            quantity: item.quantity,
            lineTotal: round2(item.price * item.quantity)
        };
    });

    return {
        customer: {
            fullName: $("#custName").val().trim(),
            email: $("#custEmail").val().trim()
        },
        items: items,
        promoCode: $("#promoCode").val().trim().toUpperCase(),
        subtotal: totals.subtotal,
        discount: totals.discount,
        tax: totals.tax,
        total: totals.total
    };
}

$("#custName, #custEmail").on("input", function () {
    $("#orderJson").text(JSON.stringify(buildOrder(), null, 2));
});


$("#checkoutForm").on("submit", function (event) {

    event.preventDefault();
    $("#checkoutMessage").addClass("d-none");

    let formOk = checkCheckoutForm();

    if (cart.length === 0) {
        showCheckoutMessage("danger", "Your cart is empty. Add at least one product first.");
        return;
    }

    if (formOk === false) {
        showCheckoutMessage("danger", "Please fix the highlighted fields.");
        return;
    }

    let order = buildOrder();
    order.orderDate = new Date().toISOString();

    $("#placeOrderBtn").prop("disabled", true).text("Sending...");

    $.ajax({
        url: API_URL,
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(order),
        dataType: "json",
        timeout: 5000
    })
        .done(function (response) {
            showCheckoutMessage("success",
                "Thanks, " + order.customer.fullName + "! Your order of " + money(order.total) + " was placed.");
            cart = [];
            $("#checkoutForm")[0].reset();
            showCart();
        })
        .fail(function (xhr) {
    
            let status = xhr.status === 0 ? "no response" : "status " + xhr.status;
            showCheckoutMessage("warning",
                "Order checked and sent as JSON to " + API_URL + " (" + status + "). " +
                "The RESTful API will be added in a later assignment, so your cart was kept.");
        })
        .always(function () {
            $("#placeOrderBtn").prop("disabled", false).text("Place Order");
            $("#orderJson").text(JSON.stringify(order, null, 2));
        });
});

function showCheckoutMessage(type, message) {
    $("#checkoutMessage")
        .removeClass("d-none alert-success alert-danger alert-warning")
        .addClass("alert-" + type)
        .text(message);
}
