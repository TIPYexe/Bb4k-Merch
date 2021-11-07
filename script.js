const express = require('express');

app = express();

console.log(__dirname)

app.set("view engine", "ejs");

app.use("/media", express.static(__dirname+"/media"));
app.use("/resources", express.static(__dirname+"/resources"));

app.get("/", function(req, res){
    console.log(req.url);
    console.log(req.ip);
    res.render("pages/index.ejs");
})

app.get("/index", function(req, res){
    console.log(req.url);
    res.render("pages/index.ejs");
})

app.get("/*.ejs", function(req, res){
    console.log(req.url);
    res.status(403).render("pages/403");
})

app.get("/*", function(req, res){
    console.log(req.url);
    res.render("pages"+req.url, function (err, renderResult){
        console.log(err);
        if (err){
            res.status(404).render("pages/404");
        } else {
            console.log(renderResult);
            console.log(req.ip);
            res.send(renderResult);
        }
    })
})

app.listen(8080);

console.log("Serverul a pornit.")