var app = angular.module("billingApp", []);
app.controller("BillingController", function ($scope, $http) {
    $scope.cart = [];
    $scope.subtotal = 0;
    $scope.tax = 0;
    $scope.total = 0;
    $scope.message = "";



    $scope.billing = {
        fullName: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        shippingMethod: "",
        cardNumber: "",
        expiration: "",
        securityCode: ""
    };



    try {
        var savedCart = localStorage.getItem("sportsWeeklyCart");
        if (savedCart) {
            $scope.cart = JSON.parse(savedCart);
        }
    } catch (error) {
        $scope.cart = [];
    }
    for (var i = 0; i < $scope.cart.length; i++) {
        $scope.subtotal += $scope.cart[i].price * $scope.cart[i].quantity;
    }



    
    $scope.subtotal = Math.round($scope.subtotal * 100) / 100;
    $scope.tax = Math.round($scope.subtotal * 0.06 * 100) / 100;
    $scope.total = Math.round(($scope.subtotal + $scope.tax) * 100) / 100;

    $scope.submitBilling = function () {
        var data = $scope.billing;

        if ($scope.billingForm.$invalid ||
            !data.fullName.trim() || !data.address.trim() ||
            !data.city.trim() || !data.state.trim() ||
            !data.shippingMethod) {
            $scope.message = "Please complete all required fields correctly.";
            return;
        }

        if ($scope.cart.length === 0) {
            $scope.message = "Your cart is empty.";
            return;
        }

        if (!/^[0-9]{13,19}$/.test(data.cardNumber) ||
            !/^[0-9]{3,4}$/.test(data.securityCode)) {
            $scope.message = "Please enter valid test payment information.";
            return;
        }

        var parts = data.expiration.split("/");
        var month = Number(parts[0]);
        var year = 2000 + Number(parts[1]);
        var today = new Date();

        if (month < 1 || month > 12 ||
            year < today.getFullYear() ||
            (year === today.getFullYear() && month < today.getMonth() + 1)) {
            $scope.message = "Please enter a valid future expiration date.";
            return;
        }

        var billingData = {
            fullName: data.fullName.trim(),
            address: data.address.trim(),
            city: data.city.trim(),
            state: data.state.trim(),
            zip: data.zip,
            shippingMethod: data.shippingMethod,
            paymentMethod: "Test Card",
            lastFour: data.cardNumber.slice(-4),
            items: $scope.cart,
            subtotal: $scope.subtotal,
            tax: $scope.tax,
            total: $scope.total
        };

        $http.post("/api/billing", billingData)
            .then(function () {
                $scope.message = "Billing details submitted successfully!";
                $scope.billing.cardNumber = "";
                $scope.billing.expiration = "";
                $scope.billing.securityCode = "";
            })
            .catch(function () {
                $scope.message = "Could not submit billing details.";
            });
    };
});
