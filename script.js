const express = require('express');
const fs = require('fs');
const sharp = require('sharp');

const ejs = require('ejs');
const sass = require('sass');
const {Client} = require('pg');
const {raw} = require("express");
const path = require("path");

// const sass = require("ejs");
var client = new Client({user: 'postgres', password: 'postgres', database: 'Bb4kMerch', host: 'localhost', port: 5432});
client.connect();

var app = express();

console.log(__dirname)

app.set("view engine", "ejs");

app.use("/media", express.static(__dirname + "/media"));
app.use("/resources", express.static(__dirname + "/resources"));

app.get(["/", "/index", "/home"], function (req, res) {
    console.log(req.url);
    console.log(req.ip);
    res.render("pages/index.ejs", {ip: req.ip});
})

var nrRandom;

// var v_optiuni = [];
// client.query("select * from public.produse", function (errCateg, rezCateg) {
//     if (rezCateg)
//         for (let elem of rezCateg.rows) {
//             console.log(elem.id);
//             v_optiuni.push(elem.unnest);
//         }
//     else
//         console.log(errCateg);
//     // console.log(v_optiuni);
// })

app.get("/produse", function (req, res) {
    convertImages();
    var conditie = "";
    if (req.query.categorie) {
        conditie += ` and categorie=${req.query.categorie}`;
    }
    client.query(`select * from produse where 1=1 ${conditie}`, function (err, rez) {
        if (!err) {
            res.render("pages/produse.ejs", {produse: rez.rows, sorted: sorted, images: objImagini.images, path: objImagini.path});

            // client.query("select * from produse", function (errCateg, rezCateg) {
            //     v_optiuni = [];
            //     if (!errCateg)
            //         for (let elem of rezCateg.rows) {
            //             v_optiuni.push(elem.unnest);
            //         }
            //     else
            //         console.log(errCateg);
            //
            // });
        } else {
        }
    })
})

app.get("/produs/:id", function (req, res) {
    Client.query(`select * from produse where id=${req.params.id}`, function (err, rez) {
        if (!err) {
            res.render("pages/produse.ejs", {prod: rez.rows[0]});
        } else {
        }
    })
})


// console.log(req.url);
convertImages();
nrRandom = Math.floor(Math.random() * 3 + 3) * 2;

// res.render("pages/produse.ejs", {images: objImagini.images, path: objImagini.path, nrImag: nrRandom});

app.get("*/galerie-animata.css", function (req, res) {
    res.setHeader("Content-Type", "text/css");
    let sirScss = fs.readFileSync("./resources/galerie-animata.scss").toString("utf-8");
    let rezScss = ejs.render(sirScss, {procent: 100 / nrRandom, nrPoze: nrRandom});

    fs.writeFileSync(`${__dirname}/temp/galerie-animata.scss`, rezScss);
    let css_path = path.join(__dirname, "temp", "galerie-animata.css");
    let sass_path = path.join(__dirname, "temp", "galerie-animata.scss");

    sass.render({file: sass_path, sourceMap: true}, function (err, rezComp) {
        console.log(rezComp);
        if (err) {
            console.log(`eroare: ${err.message}`);
            res.end();
            return;
        }
        fs.writeFileSync(css_path, rezComp.css, function (err) {
            if (err) {
                console.log(err);
            }
        });
        res.sendFile(css_path);
    })
})

app.get("*/galerie-animata.css.map", function (req, res) {
    res.sendFile(path.join(__dirname, "temp", "galerie-animata.css.map"));
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