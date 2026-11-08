/* var express = require("express");
var fs = require("fs");
var path = require("path");

var app = express();
var file = path.join(__dirname, "submissions.json");


app.use(express.json());
app.use(express.static(__dirname));

function getArticles() {
    return JSON.parse(fs.readFileSync(file, "utf8"));
}

function saveArticles(articles) {
    fs.writeFileSync(file, JSON.stringify(articles, null, 2));
}

app.get("/api/submissions", function (req, res) {
    res.json(getArticles());
});

app.post("/api/submissions", function (req, res) {
    var articles = getArticles();
    var data = req.body;
    var fields = ["title", "author", "category", "content"];

    for (var i = 0; i < fields.length; i++) {
        if (typeof data[fields[i]] !== "string" || !data[fields[i]].trim()) {
            return res.status(400).json({ error: "All fields are required." });
        }
    }
    var id = 1;

    articles.forEach(function (article) {
        if (article.id >= id) {
            id = article.id + 1;
        }
    });

    var newArticle = {
        id: id,
        title: data.title.trim(),
        author: data.author.trim(),
        category: data.category.trim(),
        content: data.content.trim(),
        status: "Pending"
    };

    articles.push(newArticle);
    saveArticles(articles);
    res.status(201).json(newArticle);
});

app.patch("/api/submissions/:id", function (req, res) {
    var articles = getArticles();
    var status = req.body.status;
  

    if (!["Approved", "Rejected", "Revision Requested"].includes(status)) {
        return res.status(400).json({ error: "Invalid status." });
    }

    var article = articles.find(function (item) {
        return item.id === Number(req.params.id);
    });

    if (!article) {
        return res.status(404).json({ error: "Article not found." });
    }

  
    article.status = status;
    saveArticles(articles);
    res.json(article);
});



app.listen(3000, function () {
    console.log("Sports Weekly server running on port 3000");
});

*/
var express = require("express");
var fs = require("fs");
var path = require("path");

var app = express();
var file = path.join(__dirname, "submissions.json");
var returnsFile = path.join(__dirname, "returns.json");
var billingFile = path.join(__dirname, "billing.json");

app.use(express.json());

// Keep billing records from being accessed publicly
app.get("/billing.json", function (req, res) {
    res.status(403).send("Billing records are not public.");
});

app.use(express.static(__dirname));

function getArticles() {
    return JSON.parse(fs.readFileSync(file, "utf8"));
}

function saveArticles(articles) {
    fs.writeFileSync(file, JSON.stringify(articles, null, 2));
}

app.get("/api/submissions", function (req, res) {
    res.json(getArticles());
});

app.post("/api/submissions", function (req, res) {
    var articles = getArticles();
    var data = req.body;
    var fields = ["title", "author", "category", "content"];

    for (var i = 0; i < fields.length; i++) {
        if (typeof data[fields[i]] !== "string" || !data[fields[i]].trim()) {
            return res.status(400).json({ error: "All fields are required." });
        }
    }

    var id = 1;

    articles.forEach(function (article) {
        if (article.id >= id) {
            id = article.id + 1;
        }
    });

    var newArticle = {
        id: id,
        title: data.title.trim(),
        author: data.author.trim(),
        category: data.category.trim(),
        content: data.content.trim(),
        status: "Pending"
    };

    articles.push(newArticle);
    saveArticles(articles);
    res.status(201).json(newArticle);
});

app.patch("/api/submissions/:id", function (req, res) {
    var articles = getArticles();
    var status = req.body.status;

    if (!["Approved", "Rejected", "Revision Requested"].includes(status)) {
        return res.status(400).json({ error: "Invalid status." });
    }

    var article = articles.find(function (item) {
        return item.id === Number(req.params.id);
    });

    if (!article) {
        return res.status(404).json({ error: "Article not found." });
    }

    article.status = status;
    saveArticles(articles);
    res.json(article);
});


// Returns

function getReturns() {
    return JSON.parse(fs.readFileSync(returnsFile, "utf8"));
}

function saveReturns(returns) {
    fs.writeFileSync(returnsFile, JSON.stringify(returns, null, 2));
}

app.get("/api/returns", function (req, res) {
    res.json(getReturns());
});

app.post("/api/returns", function (req, res) {
    var returns = getReturns();
    var data = req.body;
    var fields = ["productId", "productName", "reason", "condition"];

    for (var i = 0; i < fields.length; i++) {
        if (typeof data[fields[i]] !== "string" || !data[fields[i]].trim()) {
            return res.status(400).json({ error: "All required fields must be completed." });
        }
    }

    if (typeof data.price !== "number" || !isFinite(data.price) || data.price <= 0) {
        return res.status(400).json({ error: "Invalid product price." });
    }

    var id = 1;

    returns.forEach(function (item) {
        if (item.id >= id) {
            id = item.id + 1;
        }
    });

    var newReturn = {
        id: id,
        productId: data.productId.trim(),
        productName: data.productName.trim(),
        price: data.price,
        reason: data.reason.trim(),
        condition: data.condition.trim(),
        details: typeof data.details === "string" ? data.details.trim() : "",
        status: "Pending"
    };

    returns.push(newReturn);
    saveReturns(returns);
    res.status(201).json(newReturn);
});


// Billing

function getBilling() {
    return JSON.parse(fs.readFileSync(billingFile, "utf8"));
}

function saveBilling(records) {
    fs.writeFileSync(billingFile, JSON.stringify(records, null, 2));
}

app.post("/api/billing", function (req, res) {
    var records = getBilling();
    var data = req.body;
    var fields = ["fullName", "address", "city", "state", "zip", "shippingMethod", "paymentMethod", "lastFour"];

    for (var i = 0; i < fields.length; i++) {
        if (typeof data[fields[i]] !== "string" || !data[fields[i]].trim()) {
            return res.status(400).json({ error: "All billing fields are required." });
        }
    }

    if (!/^[0-9]{5}$/.test(data.zip) || !/^[0-9]{4}$/.test(data.lastFour) ||
        !Array.isArray(data.items) || data.items.length === 0 ||
        typeof data.subtotal !== "number" || !isFinite(data.subtotal) || data.subtotal < 0 ||
        typeof data.tax !== "number" || !isFinite(data.tax) || data.tax < 0 ||
        typeof data.total !== "number" || !isFinite(data.total) || data.total < 0) {
        return res.status(400).json({ error: "Invalid billing information." });
    }

    var id = 1;

    records.forEach(function (record) {
        if (record.id >= id) {
            id = record.id + 1;
        }
    });

    var newBilling = {
        id: id,
        fullName: data.fullName.trim(),
        address: data.address.trim(),
        city: data.city.trim(),
        state: data.state.trim(),
        zip: data.zip,
        shippingMethod: data.shippingMethod,
        paymentMethod: data.paymentMethod,
        lastFour: data.lastFour,
        items: data.items,
        subtotal: data.subtotal,
        tax: data.tax,
        total: data.total
    };

    records.push(newBilling);
    saveBilling(records);
    res.status(201).json({ id: id, message: "Billing details saved." });
});

app.listen(3000, function () {
    console.log("Sports Weekly server running on port 3000");
});
