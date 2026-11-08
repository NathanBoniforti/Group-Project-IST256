
var app = angular.module("returnsApp", []);


app.controller("ReturnsController", function ($scope, $http) {
    var products = [];

    $scope.returns = [];
    $scope.message = "";
    $scope.returnData = {
        productId: "",
        productName: "",
        price: null,
        reason: "",
        condition: "",
        details: ""
    };



    function loadReturns() {
        $http.get("/api/returns")
            .then(function (response) {
                $scope.returns = response.data;
            })
            .catch(function () {
                $scope.message = "Could not load return requests.";
            });
    }
    loadReturns();





    $.getJSON("products.json")
        .done(function (data) {
            products = data;
        })
        .fail(function () {
            $("#searchResults").text("Could not load products.");
        });



    $("#searchButton").on("click", function () {
        var search = $("#searchProduct").val().trim().toLowerCase();
        var results = $("#searchResults");
        var found = false;
        results.empty();

        if (search === "") {
            results.text("Enter a product name or ID.");
            return;
        }
        $.each(products, function (index, product) {
            if (product.id.toLowerCase().includes(search) ||
                product.description.toLowerCase().includes(search)) {

                found = true;
                var item = $("<div class='border p-3 mb-2'></div>");

                if (product.image) {
                    item.append($("<img class='img-fluid mb-2' alt='Product image'>")
                        .attr("src", product.image));
                }

                item.append($("<p></p>").text(product.description + " - $" + product.price.toFixed(2)));
                var button = $("<button type='button' class='btn btn-primary btn-sm'>Select Product</button>");
                button.attr("data-id", product.id);
                item.append(button);
                results.append(item);
            }
        });



        if (!found) {
            results.text("No products found.");
        }
    });




    $("#searchResults").on("click", "button", function () {
        var id = $(this).attr("data-id");

        $.each(products, function (index, product) {
            if (product.id === id) {
                $scope.$apply(function () {
                    $scope.returnData.productId = product.id;
                    $scope.returnData.productName = product.description;
                    $scope.returnData.price = product.price;
                });
                return false;
            }
        });
    });





    $scope.submitReturn = function () {
        var data = $scope.returnData;
        if ($scope.returnForm.$invalid ||
            !data.productId.trim() ||
            !data.productName.trim() ||
            !data.reason.trim() ||
            !data.condition ||
            !data.price || data.price <= 0) {
            $scope.message = "Please complete all required fields correctly.";
            return;
        }

        var newReturn = {
            productId: data.productId.trim(),
            productName: data.productName.trim(),
            price: data.price,
            reason: data.reason.trim(),
            condition: data.condition,
            details: data.details || ""
        };




        $http.post("/api/returns", newReturn)
            .then(function () {
                $scope.message = "Return submitted successfully!";
                $scope.returnData = {
                    productId: "",
                    productName: "",
                    price: null,
                    reason: "",
                    condition: "",
                    details: ""
                };
                $scope.returnForm.$setPristine();
                loadReturns();
            })




            .catch(function () {
                $scope.message = "Could not submit return.";
            });
    };
});
