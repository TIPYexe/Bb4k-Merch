const express = require('express');
const fs = require('fs');
const sharp = require('sharp')

const {raw} = require("express");

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

app.get("/produse", function(req, res){
    console.log(req.url);

    var rawData = fs.readFileSync(__dirname + "/resources/JSON/produse_all.json").toString('utf-8');
    objImagini = JSON.parse(rawData);

    for(let imag of objImagini.images){
        let file_name = imag.file_name.split('.')[0];

    }

    res.render("pages/produse.ejs", {images:objImagini.images, path: objImagini.path});
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
            res.send(renderResult);
        }
    })
})

app.listen(8080);

console.log("Serverul a pornit.")