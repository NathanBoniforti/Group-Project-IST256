// ============================================================
// Sports Weekly - Publication Options / Finalization Page
// React manages state + validation + service calls.
// jQuery reads existing data (products.json) and sends the AJAX request.
// (Written with React.createElement so no Babel/build step is needed.)
// ============================================================

var h = React.createElement;
var useState = React.useState;
var useEffect = React.useEffect;

// RESTful API that receives the JSON document.
// Swap this for your group's own endpoint if you have one.
var API_URL = "https://jsonplaceholder.typicode.com/posts";

var CHANNELS = ["Website", "Print Edition", "Email Newsletter", "Social Media"];
var STATUSES = ["Draft", "In Review", "Approved"];
var SPORTS = ["Basketball", "Football"];

var emptyForm = {
    articleTitle: "",
    author: "",
    email: "",
    sport: "",
    issue: "",
    publishDate: "",
    channels: [],
    reviewStatus: "",
    notes: ""
};

function todayString() {
    var d = new Date();
    var month = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + month + "-" + day;
}

// ---------- Client-side validation (plain JavaScript) ----------
function validate(f) {
    var errors = {};
    var emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

    if (f.articleTitle.trim() === "") {
        errors.articleTitle = "Please enter the article title.";
    } else if (f.articleTitle.trim().length < 5) {
        errors.articleTitle = "Title must be at least 5 characters.";
    }

    if (f.author.trim() === "") {
        errors.author = "Please enter the author's full name.";
    } else if (!f.author.trim().includes(" ")) {
        errors.author = "Please enter a first and last name.";
    }

    if (f.email.trim() === "") {
        errors.email = "Please enter an email address.";
    } else if (!emailPattern.test(f.email.trim())) {
        errors.email = "Enter a valid email, like someone@somedomain.com.";
    }

    if (f.sport === "") {
        errors.sport = "Please choose a sport.";
    }

    if (f.issue === "") {
        errors.issue = "Please choose an issue.";
    }

    if (f.publishDate === "") {
        errors.publishDate = "Please choose a publication date.";
    } else if (f.publishDate < todayString()) {
        errors.publishDate = "Publication date cannot be in the past.";
    }

    if (f.channels.length === 0) {
        errors.channels = "Choose at least one distribution channel.";
    }

    if (f.reviewStatus === "") {
        errors.reviewStatus = "Please choose a review status.";
    } else if (f.reviewStatus === "Draft" && f.channels.length > 0 && f.channels.indexOf("Print Edition") !== -1) {
        errors.reviewStatus = "A Draft cannot go to the Print Edition. Move it to In Review or Approved.";
    }

    if (f.notes.length > 300) {
        errors.notes = "Notes must be 300 characters or fewer.";
    }

    return errors;
}

// ---------- Small helper for a labelled field ----------
function Field(props) {
    return h("div", { className: "mb-3" },
        h("label", { htmlFor: props.id, className: "form-label" }, props.label),
        props.children,
        props.error ? h("div", { className: "invalid-feedback d-block" }, props.error) : null
    );
}

function App() {
    var formState = useState(emptyForm);
    var form = formState[0];
    var setForm = formState[1];

    var errorState = useState({});
    var errors = errorState[0];
    var setErrors = errorState[1];

    var issueState = useState([]);
    var issues = issueState[0];
    var setIssues = issueState[1];

    var loadState = useState("");
    var loadError = loadState[0];
    var setLoadError = loadState[1];

    var statusState = useState({ type: "", text: "" });
    var status = statusState[0];
    var setStatus = statusState[1];

    var sendingState = useState(false);
    var sending = sendingState[0];
    var setSending = sendingState[1];

    var responseState = useState(null);
    var apiResponse = responseState[0];
    var setApiResponse = responseState[1];

    // ---------- jQuery: read the existing product data ----------
    useEffect(function () {
        $.getJSON("products.json")
            .done(function (data) {
                var backIssues = data.filter(function (p) {
                    return p.category === "Back Issue";
                });
                setIssues(backIssues);
            })
            .fail(function () {
                setLoadError("Could not load products.json, so only the upcoming issue is available. Make sure you are using Live Server.");
            });
    }, []);

    function update(field, value) {
        var next = Object.assign({}, form);
        next[field] = value;
        setForm(next);
        // Clear that field's error as soon as the user edits it
        if (errors[field]) {
            var nextErrors = Object.assign({}, errors);
            delete nextErrors[field];
            setErrors(nextErrors);
        }
    }

    function toggleChannel(channel) {
        var list = form.channels.slice();
        var index = list.indexOf(channel);
        if (index === -1) {
            list.push(channel);
        } else {
            list.splice(index, 1);
        }
        update("channels", list);
    }

    // ---------- The JSON document built from the form ----------
    function buildJson() {
        return {
            articleTitle: form.articleTitle.trim(),
            author: form.author.trim(),
            email: form.email.trim(),
            sport: form.sport,
            issue: form.issue,
            publishDate: form.publishDate,
            distributionChannels: form.channels,
            reviewStatus: form.reviewStatus,
            editorialNotes: form.notes.trim(),
            submittedAt: new Date().toISOString()
        };
    }

    // ---------- AJAX: send the JSON document to the REST API ----------
    function sendToApi(orderJson) {
        setSending(true);
        setApiResponse(null);

        $.ajax({
            url: API_URL,
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(orderJson),
            dataType: "json"
        })
            .done(function (response, textStatus, xhr) {
                setApiResponse({ code: xhr.status, body: response });
                setStatus({ type: "success", text: "Saved. \"" + orderJson.articleTitle + "\" is set for " + orderJson.publishDate + " (" + orderJson.reviewStatus + ")." });
                setForm(emptyForm);
            })
            .fail(function (xhr) {
                setStatus({ type: "danger", text: "The server could not save your options (error " + xhr.status + "). Check your connection and try again." });
            })
            .always(function () {
                setSending(false);
            });
    }

    function handleSubmit(event) {
        event.preventDefault();
        setStatus({ type: "", text: "" });

        var found = validate(form);
        setErrors(found);

        if (Object.keys(found).length > 0) {
            setStatus({ type: "danger", text: "Please fix the highlighted fields and try again." });
            return;
        }

        sendToApi(buildJson());
    }

    function handleClear() {
        setForm(emptyForm);
        setErrors({});
        setStatus({ type: "", text: "" });
        setApiResponse(null);
    }

    function inputClass(name, base) {
        return base + (errors[name] ? " is-invalid" : "");
    }

    // ---------- Issue options (from products.json via jQuery) ----------
    var issueOptions = [h("option", { key: "blank", value: "" }, "Choose...")];
    issueOptions.push(h("option", { key: "upcoming", value: "Upcoming Issue" }, "Upcoming Issue"));
    issues.forEach(function (p) {
        issueOptions.push(h("option", { key: p.id, value: p.description }, p.description));
    });

    var sportOptions = [h("option", { key: "blank", value: "" }, "Choose...")].concat(
        SPORTS.map(function (s) { return h("option", { key: s, value: s }, s); })
    );

    var statusOptions = [h("option", { key: "blank", value: "" }, "Choose...")].concat(
        STATUSES.map(function (s) { return h("option", { key: s, value: s }, s); })
    );

    var channelBoxes = CHANNELS.map(function (c) {
        var id = "channel-" + c.replace(/\s+/g, "-").toLowerCase();
        return h("div", { className: "form-check", key: c },
            h("input", {
                className: "form-check-input" + (errors.channels ? " is-invalid" : ""),
                type: "checkbox",
                id: id,
                checked: form.channels.indexOf(c) !== -1,
                onChange: function () { toggleChannel(c); }
            }),
            h("label", { className: "form-check-label", htmlFor: id }, c)
        );
    });

    var liveJson = JSON.stringify(buildJson(), null, 2);

    return h("div", { className: "row" },

        // ---------- Form ----------
        h("div", { className: "col-lg-7 mb-4" },
            h("div", { className: "card form-card p-4" },

                h("h3", null, "Article Publication Options"),

                loadError ? h("div", { className: "alert alert-warning small", role: "alert" }, loadError) : null,

                status.text ? h("div", { className: "alert alert-" + status.type, role: "alert" }, status.text) : null,

                h("form", { onSubmit: handleSubmit, noValidate: true },

                    h(Field, { id: "articleTitle", label: "Article Title *", error: errors.articleTitle },
                        h("input", {
                            type: "text", id: "articleTitle", className: inputClass("articleTitle", "form-control"),
                            placeholder: "Top 25 Preview: Who Wins the Big Ten?",
                            value: form.articleTitle, onChange: function (e) { update("articleTitle", e.target.value); }
                        })
                    ),

                    h("div", { className: "row" },
                        h("div", { className: "col-md-6" },
                            h(Field, { id: "author", label: "Author *", error: errors.author },
                                h("input", {
                                    type: "text", id: "author", className: inputClass("author", "form-control"),
                                    placeholder: "Jane Smith",
                                    value: form.author, onChange: function (e) { update("author", e.target.value); }
                                })
                            )
                        ),
                        h("div", { className: "col-md-6" },
                            h(Field, { id: "email", label: "Author Email *", error: errors.email },
                                h("input", {
                                    type: "text", id: "email", className: inputClass("email", "form-control"),
                                    placeholder: "someone@somedomain.com",
                                    value: form.email, onChange: function (e) { update("email", e.target.value); }
                                })
                            )
                        )
                    ),

                    h("div", { className: "row" },
                        h("div", { className: "col-md-6" },
                            h(Field, { id: "sport", label: "Sport *", error: errors.sport },
                                h("select", {
                                    id: "sport", className: inputClass("sport", "form-select"),
                                    value: form.sport, onChange: function (e) { update("sport", e.target.value); }
                                }, sportOptions)
                            )
                        ),
                        h("div", { className: "col-md-6" },
                            h(Field, { id: "issue", label: "Issue *", error: errors.issue },
                                h("select", {
                                    id: "issue", className: inputClass("issue", "form-select"),
                                    value: form.issue, onChange: function (e) { update("issue", e.target.value); }
                                }, issueOptions)
                            )
                        )
                    ),

                    h("div", { className: "row" },
                        h("div", { className: "col-md-6" },
                            h(Field, { id: "publishDate", label: "Publication Date *", error: errors.publishDate },
                                h("input", {
                                    type: "date", id: "publishDate", className: inputClass("publishDate", "form-control"),
                                    min: todayString(),
                                    value: form.publishDate, onChange: function (e) { update("publishDate", e.target.value); }
                                })
                            )
                        ),
                        h("div", { className: "col-md-6" },
                            h(Field, { id: "reviewStatus", label: "Review Status *", error: errors.reviewStatus },
                                h("select", {
                                    id: "reviewStatus", className: inputClass("reviewStatus", "form-select"),
                                    value: form.reviewStatus, onChange: function (e) { update("reviewStatus", e.target.value); }
                                }, statusOptions)
                            )
                        )
                    ),

                    h("div", { className: "mb-3" },
                        h("label", { className: "form-label d-block" }, "Distribution Channels *"),
                        channelBoxes,
                        errors.channels ? h("div", { className: "invalid-feedback d-block" }, errors.channels) : null
                    ),

                    h(Field, { id: "notes", label: "Editorial Notes (optional)", error: errors.notes },
                        h("textarea", {
                            id: "notes", rows: 3, className: inputClass("notes", "form-control"),
                            placeholder: "Anything the review team should know",
                            value: form.notes, onChange: function (e) { update("notes", e.target.value); }
                        }),
                        h("div", { className: "form-text" }, form.notes.length + " / 300")
                    ),

                    h("div", { className: "d-grid gap-2 d-sm-flex" },
                        h("button", { type: "submit", className: "btn btn-primary flex-sm-fill", disabled: sending },
                            sending ? "Saving..." : "Save Publication Options"),
                        h("button", { type: "button", className: "btn btn-outline-secondary flex-sm-fill", onClick: handleClear }, "Clear")
                    ),

                    h("p", { className: "text-muted small mt-3 mb-0" }, "* Required field")
                )
            )
        ),

        // ---------- JSON + API response ----------
        h("div", { className: "col-lg-5" },
            h("h3", null, "Options Data (JSON)"),
            h("p", { className: "text-muted" }, "This is the JSON document sent to the RESTful API. It updates as you fill in the form."),
            h("pre", { id: "jsonOutput", className: "bg-dark text-white p-3 rounded json-box" }, liveJson),

            apiResponse ? h("div", { className: "mt-4" },
                h("h3", null, "API Response"),
                h("p", { className: "text-muted" }, "HTTP " + apiResponse.code + " from POST " + API_URL),
                h("pre", { className: "bg-dark text-white p-3 rounded json-box" }, JSON.stringify(apiResponse.body, null, 2))
            ) : null
        )
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(h(App));
