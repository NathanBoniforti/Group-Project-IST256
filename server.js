var express = require("express");
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
