var h = React.createElement;
var useState = React.useState;
var useEffect = React.useEffect;

function ApprovalPage() {
    var articleState = useState([]);
    var articles = articleState[0];
    var setArticles = articleState[1];
    var messageState = useState("Loading articles...");
    var message = messageState[0];
    var setMessage = messageState[1];

   
    useEffect(function () {
        loadArticles();
    }, []);

    function loadArticles() {
        fetch("/api/submissions")
            .then(function (response) {
                if (!response.ok) {
                    throw new Error();
                }
                return response.json();
            })
            .then(function (data) {
                setArticles(data);
                setMessage("");
            })
            .catch(function () {
                setMessage("Could not load articles.");
            });
    }

    function updateStatus(id, status) {
        fetch("/api/submissions/" + id, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ status: status })
        })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error();
                }
                setMessage("Article updated successfully.");
                loadArticles();
            })
            .catch(function () {
                setMessage("Could not update article.");
            });
    }

    return h("div", null,
        h("p", { className: "text-center" }, message),

        articles.map(function (article) {
            return h("div", {
                className: "card form-card p-4 mb-3",
                key: article.id
            },
                h("h4", null, article.title),
                h("p", null, "Author: " + article.author),
                h("p", null, "Category: " + article.category),
                h("p", null, article.content),
                h("p", null, "Status: " + article.status),

                article.status === "Pending" ?
                    h("div", null,
                        h("button", {
                            className: "btn btn-success me-2",
                            onClick: function () {
                                updateStatus(article.id, "Approved");
                            }
                        }, "Approve"),

                        h("button", {
                            className: "btn btn-danger me-2",
                            onClick: function () {
                                updateStatus(article.id, "Rejected");
                            }
                        }, "Reject"),

                        h("button", {
                            className: "btn btn-warning",
                            onClick: function () {
                                updateStatus(article.id, "Revision Requested");
                            }
                        }, "Request Revisions")
                    ) : null
            );
        })
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(h(ApprovalPage));
