const express = require('express');
const fs = require('fs');
const sharp = require('sharp');

const ejs = require('ejs');
const sass = require('sass');

const {raw} = require("express");
const path = require("path");

// const sass = require("ejs");

var app = express();

console.log(__dirname)

app.set("view engine", "ejs");

app.use("/media", express.static(__dirname + "/media"));
app.use("/resources", express.static(__dirname + "/resources"));

app.get("/", function (req, res) {
    console.log(req.url);
    console.log(req.ip);
    res.render("pages/index.ejs");
})

app.get("/index", function (req, res) {
    console.log(req.url);
    res.render("pages/index.ejs");
})

app.get("/produse", function (req, res) {
    console.log(req.url);
    convertImages();
    //
    // for(let imag of objImagini.images){
    //
    //
    // }

    res.render("pages/produse.ejs", {images: objImagini.images, path: objImagini.path});
})

app.get("*/galerie-animata.css", function (req, res) {
    res.setHeader("Content-Type", "text/css");
    let sirScss = fs.readFileSync("./resources/galerie-animata.scss").toString("utf-8");
    let nrRandom = Math.floor(Math.random() * 3 + 3) * 2;
    let rezScss = ejs.render(sirScss, {procent: 100 / nrRandom, nrPoze: nrRandom});

    fs.writeFileSync(`${__dirname}/resources/temp/galerie-animata.scss`, rezScss);
    let css_path = path.join(__dirname, "resources", "temp", "galerie-animata.css");
    let scss_path = path.join(__dirname, "resources", "temp", "galerie-animata.scss");
    // const resCss = sass.compile(scss_path, function (err, rezComp) {
    //     console.log(rezComp);
    //     if (err) {
    //         console.log(`eroare: ${err.message}`);
    //         res.end();
    //         return;
    //     }
    //     fs.writeFileSync(css_path, rezComp.css, function (err) {
    //         if (err) {
    //             console.log(err);
    //         }
    //     });
    //     res.sendFile(css_path);
    // });

    sass.render({file: scss_path, sourceMap: true}, function (err, rezComp){
        console.log(rezComp);
        if(err){
            console.log(`eroare: ${err.message}`);
            res.end();
            return;
        }
        fs.writeFileSync(css_path, rezComp.css, function (err){
            if(err){
                console.log(err);
            }
        });
        res.sendFile(css_path);
    })
})

app.get("*/galerie-animata.css.map", function (req, res) {
    res.sendFile(path.join(__dirname, "resources", "temp", "galerie-animata.css.map"));
})

app.get("/*.ejs", function (req, res) {
    console.log(req.url);
    res.status(403).render("pages/403");
})

app.get("/*", function (req, res) {
    console.log(req.url);
    res.render("pages" + req.url, function (err, renderResult) {
        console.log(err);
        if (err) {
            res.status(404).render("pages/404");
        } else {
            console.log(renderResult);
            res.send(renderResult);
        }
    })
})

function convertImages() {
    var rawData = fs.readFileSync(__dirname + "/resources/JSON/produse_all.json").toString('utf-8');
    objImagini = JSON.parse(rawData);
    let galeryPath = objImagini.path;

    for (let imag of objImagini.images) {
        // convertim imaginea din png sau jpg in webp sa fie mai mica
        var oldImg = `${galeryPath}/${imag.file_name}`;
        let [file_name, file_extension] = imag.file_name.split('.');
        let dim_smalli = 250;
        let newImg = `${galeryPath}/smalli/${file_name}-${dim_smalli}.webp`;

        if (!fs.existsSync(newImg)) {
            sharp(__dirname + "/" + oldImg)
                .resize(dim_smalli)
                .toFile(__dirname + "/" + newImg, function (err) {
                    if (err) {
                        console.log("Conversion error ", oldImg, " -> ", newImg, err);
                    }
                });
        }
    }
}

app.listen(8080);

console.log("Serverul a pornit.")