
var h = React.createElement;
var useState = React.useState;

function SubmissionPage() {




    var titleState = useState("");
    var title = titleState[0];
    var setTitle = titleState[1];



    var authorState = useState("");
    var author = authorState[0];
    var setAuthor = authorState[1];



    var categoryState = useState("");
    var category = categoryState[0];
    var setCategory = categoryState[1];



    var contentState = useState("");
    var content = contentState[0];
    var setContent = contentState[1];



    var messageState = useState("");
    var message = messageState[0];
    var setMessage = messageState[1];




    function submitArticle(event) {
        event.preventDefault();

        if (title.trim() === "" || author.trim() === "" ||
            category === "" || content.trim() === "") {
            setMessage("Please complete all fields.");
            return;
        }
        var article = {
            title: title,
            author: author,
            category: category,
            content: content
        };


        fetch("/api/submissions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(article)
        })

            .then(function (response) {
                if (!response.ok) {
                    throw new Error();
                }
                return response.json();
            })
            .then(function () {
                setMessage("Article submitted successfully!");
                setTitle("");
                setAuthor("");
                setCategory("");
                setContent("");
            })


            .catch(function () {
                setMessage("Could not submit article.");
            });
    }

    return h("form", { onSubmit: submitArticle },

        h("div", { className: "mb-3" },
            h("label", { className: "form-label" }, "Article Title"),
            h("input", {
                type: "text",
                className: "form-control",
                value: title,
                onChange: function (event) {
                    setTitle(event.target.value);
                }
            })
        ),




        h("div", { className: "mb-3" },
            h("label", { className: "form-label" }, "Author"),
            h("input", {
                type: "text",
                className: "form-control",
                value: author,
                onChange: function (event) {
                    setAuthor(event.target.value);
                }
            })
        ),




        h("div", { className: "mb-3" },
            h("label", { className: "form-label" }, "Category"),
            h("select", {
                className: "form-select",
                value: category,
                onChange: function (event) {
                    setCategory(event.target.value);
                }
            },
                h("option", { value: "" }, "Select Category"),
                h("option", { value: "Basketball" }, "Basketball"),
                h("option", { value: "Football" }, "Football")
            )
        ),



        h("div", { className: "mb-3" },
            h("label", { className: "form-label" }, "Article Content"),
            h("textarea", {
                className: "form-control",
                rows: 5,
                value: content,
                onChange: function (event) {
                    setContent(event.target.value);
                }
            })
        ),

        

        h("button", {
            type: "submit",
            className: "btn btn-primary"
        }, "Submit Article"),

        h("p", { className: "mt-3" }, message)
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(h(SubmissionPage));
