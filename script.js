const express = require("express");
const fs = require('fs');
const sharp = require('sharp');
const ejs = require('ejs');
const {Client} = require("pg");
const path = require('path');
const sass = require('sass');
const formidable = require('formidable');
// const crypto= require('crypto');
const nodemailer = require('nodemailer');
const session = require('express-session');
const xmljs = require('xml-js');
const request = require('request');
const html_to_pdf = require('html-pdf-node');
var QRCode = require('qrcode');
const helmet = require('helmet');
const crypto = require("crypto");

var app = express();

app.use(session({
    secret: 'Bb4k',         //folosit de express session pentru criptarea id-ului de sesiune
    resave: true,
    saveUninitialized: false
}));

var client; //folosit pentru conexiunea la baza de date

if (process.env.SITE_ONLINE) {
    protocol = "https://";
    numeDomeniu = "protected-gorge-12949.herokuapp.com"
    client = new Client({
        user: 'wyldhvchrlnsee',
        password: '84e032b7c371aa35c96e9f90b83ed1102dad04149554119e8b3ddfcff6e1ee24',
        database: 'd2k1lapgniubct',
        host: 'ec2-18-234-17-166.compute-1.amazonaws.com',
        port: 5432,
        ssl: {
            rejectUnauthorized: false
        }
    });
} else {
    client = new Client({user: 'postgres', password: 'postgres', database: 'Bb4kMerch', host: 'localhost', port: 5432});
    protocol = "http://";
    numeDomeniu = "localhost:8080";
}

client.connect();

app.set("view engine", "ejs");

app.use("/media", express.static(__dirname + "/media"));
app.use("/resources", express.static(__dirname + "/resources"));

app.use(["/produse_cos", "/cumpara"], express.json({limit: '2mb'}));//obligatoriu de setat pt request body de tip json

// Cerinta: 22
app.use(helmet.frameguard());//pentru a nu se deschide paginile site-ului in frame-uri

var ipuri_active = {};

function getIp(req) {//pentru Heroku
    var ip = req.headers["x-forwarded-for"];
    if (ip) {
        let vect = ip.split(",");
        return vect[vect.length - 1];
    } else if (req.ip) {
        return req.ip;
    } else {
        return req.connection.remoteAddress;
    }
}

// Cerinta: 21
app.use(function (req, res, next) {
    let ipReq = getIp(req);
    let ip_gasit = ipuri_active[ipReq + "|" + req.url];
    timp_curent = new Date();
    if (ip_gasit) {
        if ((timp_curent - ip_gasit.data) < 5 * 1000) {//diferenta e in milisecunde; verific daca ultima accesare a fost pana in 10 secunde
            if (ip_gasit.nr > 10) {//mai mult de 10 cereri
                res.send("<h1>Prea multe cereri intr-un interval scurt. Ia te rog sa fii cuminte, da?!</h1>");
                ip_gasit.data = timp_curent
                return;
            } else {
                ip_gasit.data = timp_curent;
                ip_gasit.nr++;
            }
        } else {
            ip_gasit.data = timp_curent;
            ip_gasit.nr = 1;//a trecut suficient timp de la ultima cerere; resetez
        }
    } else {
        ipuri_active[ipReq + "|" + req.url] = {nr: 1, data: timp_curent};
    }
    let comanda_param = `insert into accesari(ip, user_id, pagina) values ($1::text, $2,  $3::text)`;
    if (ipReq) {
        var id_utiliz = req.session.utilizator ? req.session.utilizator.id : null;
        client.query(comanda_param, [ipReq, id_utiliz, req.url], function (err, rez) {
            if (err) console.log(err);
        });
    }
    next();
});


// var optiuni_categ = [];
// client.query("select * from unnest(enum_range(null::produse))", function (errCateg, rezCateg) {
//     if (rezCateg)
//         for (let elem of rezCateg.rows) {
//             optiuni_categ.push(elem.unnest);
//         }
//     else
//         console.log(errCateg);
// })

app.use("/*", function (req, res, next) {
    res.locals.utilizator = req.session.utilizator;
    // res.locals.optiuni_categ = optiuni_categ;
    next();
});

app.get(["/", "/index", "/home"], function (req, res) {
    var rezultat;
    client.query(" select username, nume, prenume from utilizatori where id in (select distinct user_id from (select * from accesari where now() - data_accesare < interval '5 minutes' order by data_accesare desc) a ) ").then(function (rezultat) {
        console.log("rezultat", rezultat.rows);
        var evenimente = [];
        var locatie = "";

        var requestLink = ``;
        if (numeDomeniu.indexOf('localhost') !== -1) {
            requestLink = 'https://secure.geobytes.com/GetCityDetails?key=7c756203dbb38590a66e01a5a3e1ad96&fqcn=109.99.96.15';
        } else {
            requestLink = `https://secure.geobytes.com/GetCityDetails?key=7c756203dbb38590a66e01a5a3e1ad96&fqcn=${getIp(req)}`;
        }
        request(requestLink, function (error, response, body) {
            if (error) {
                console.error('error:', error)
            } else {
                var obiectLocatie = JSON.parse(body);
                //console.log(obiectLocatie);
                locatie = obiectLocatie.geobytescountry + " " + obiectLocatie.geobytesregion
            }

            //generare evenimente random pentru calendar

            var texteEvenimente = ["Revelion la Mircea", "Bauta la Tedy", "Aniversare 4 ani", "Primul produs gratis", "Reduceri finale"];

            evenimente.push({data: new Date(2022, 11, 32, 0, 0, 0, 0), text: texteEvenimente[0]});
            evenimente.push({data: new Date(2022, 0, 26, 0, 0, 0, 0), text: texteEvenimente[1]});
            evenimente.push({data: new Date(2022, 1, 23, 0, 0, 0, 0), text: texteEvenimente[2]});

            var today = new Date();
            var realToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            var lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            lastDayOfMonth.setTime(lastDayOfMonth.getTime() + 2 * 60 * 60 * 1000);
            realToday.setTime(realToday.getTime() + 2 * 60 * 60 * 1000);
            // today.setTime(today.getTime() + 2*60*60*1000);
            // console.log(lastDayOfMonth, '|=|', realToday);

            var aux = new Date();
            for (var d = realToday; d <= lastDayOfMonth; d.setDate(d.getDate() + 1)) {
                aux.setTime(d.getTime() + 7 * 24 * 60 * 60 * 1000);
                if ((d.getDay() === 6 || d.getDay() === 0) && aux.getMonth() !== d.getMonth()) {
                    console.log('push');
                    console.log(aux, "|", d);
                    evenimente.push({data: d.getDate(), text: texteEvenimente[4]});
                } else {
                    if (d.getDay() === 1 && d.getDate() === 1) {
                        evenimente.push({data: d.getDate(), text: texteEvenimente[3]});
                    }
                }
            }

            console.log(evenimente);

            res.render("pages/index", {
                evenimente: evenimente,
                locatie: locatie,
                utiliz_online: rezultat.rows,
                ip: getIp(req),
            });
            req.session.mesajLogin = null;

        });

        //res.render("pages/index", {evenimente: evenimente, locatie:locatie,utiliz_online: rezultat.rows, ip:req.ip,imagini:obImagini.imagini, cale:obImagini.cale_galerie, mesajLogin:req.session.mesajLogin});

    }, function (err) {
        console.log("eroare", err)
    });

    // res.render("pages/index",{ip:req.ip, imagini:obImagini.imagini, cale:obImagini.cale_galerie});//calea relativa la folderul views
});

parolaCriptare = "curs_tehnici_web";

// sirAlphaNum="";
// v_intervale=[[48,57],[65,90],[97,122]];
// for (let interval of v_intervale){
//     for (let i=interval[0];i<=interval[1];i++)
//         sirAlphaNum+=String.fromCharCode(i);
// }

function genereazaToken(length) {
    var characters = 'BCDFGHJKLMNPQRSTVWXYZ';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

function pad2(n) {
    return n < 10 ? '0' + n : n
}

function genereazaToken1() {
    var date = new Date();
    return date.getFullYear().toString() + pad2(date.getMonth() + 1) + pad2(date.getDate()) + pad2(date.getHours()) + pad2(date.getMinutes()) + pad2(date.getSeconds());
}

async function trimiteMail(username, email, token1, token) {
    var options = {year: 'numeric', month: 'numeric', day: 'numeric'};
    var today = new Date();

    var transp = nodemailer.createTransport({
        service: "gmail",
        secure: false,
        auth: {//date login
            user: "test.tweb.node@gmail.com", // Stiu ca are toata lumea acces la aceasta adresa dar
            pass: "tehniciweb"                   // nu ma deranjeaza
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    //genereaza html
    await transp.sendMail({
        from: "test.tweb.node@gmail.com",
        to: email,
        subject: "Mesaj înregistrare",
        text: "Username-ul tau este " + username,
        html: `<h1>Salut!</h1><p style='color:blue'>Pe ${numeDomeniu} ai username-ul ${username} incepand de azi, <span style="text-decoration: underline;color: purple;font-weight: bold">${today.toLocaleDateString("ro-RO", options)}</span>.</p> <p><a href='http://${numeDomeniu}/confirmare_mail/${token1}/${username}/${token}'>Click aici pentru confirmare</a></p>`,
    })
    console.log("trimis mail");
}

async function trimiteMailStergerePoza(nume, prenume, email) {
    var transp = nodemailer.createTransport({
        service: "gmail",
        secure: false,
        auth: {//date login
            user: "test.tweb.node@gmail.com", // Stiu ca are toata lumea acces la aceasta adresa dar
            pass: "tehniciweb"                   // nu ma deranjeaza
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    //genereaza html
    await transp.sendMail({
        from: "test.tweb.node@gmail.com",
        to: email,
        subject: "Sorry!",
        text: "Nu ne mai placea cum arati, " + prenume + " " + nume + ", așa că ți-am șters poza. Sorry!"
    })
    console.log("trimis mail");
}

app.get("/logout", function (req, res) {
    req.session.destroy();
    res.locals.utilizator = null;
    res.render("pages/logout");
});

app.post("/login", function (req, res) {
    var formular = new formidable.IncomingForm();

    formular.parse(req, function (err, campuriText, campuriFile) {
        console.log(campuriText);

        var querylogin = `select * from utilizatori where username= '${campuriText.username.replace('>', '&gt;').replace('<', '&lt')}' `;
        client.query(querylogin, function (err, rez) {
            if (err) {
                res.render("pages/eroare", {mesaj: "Eroare baza date. Incercati mai tarziu."});
                return;
            }
            if (rez.rows.length !== 1) { //ar trebui sa fie 1
                res.render("pages/eroare", {mesaj: "Username-ul nu exista."});
                return;
            }
            var criptareParola = crypto.scryptSync(campuriText.parola.replace('>', '&gt;').replace('<', '&lt'), parolaCriptare, 32).toString('hex');
            if (criptareParola === rez.rows[0].parola && rez.rows[0].confirmat_mail) {
                req.session.mesajLogin = null;//resetez in caz ca s-a logat gresit ultima oara
                if (req.session) {
                    req.session.utilizator = {
                        id: rez.rows[0].id,
                        username: rez.rows[0].username,
                        nume: rez.rows[0].nume,
                        prenume: rez.rows[0].prenume,
                        culoare_chat: rez.rows[0].culoare_chat,
                        email: rez.rows[0].email,
                        rol: rez.rows[0].rol,
                        problema_vedere: rez.rows[0].problema_vedere,
                        poza: rez.rows[0].poza,
                    }
                }
                // res.render("pages"+req.url);
                res.redirect("/index");
            } else {
                req.session.mesajLogin = "Login esuat";
                res.redirect("/index");
                //res.render("pages/index",{ip:req.ip, imagini:obImagini.imagini, cale:obImagini.cale_galerie,mesajLogin:"Login esuat"});
            }
        });
    });
});

app.post("/inreg", function (req, res) {
    var formular = new formidable.IncomingForm();
    var username;
    formular.parse(req, function (err, campuriText, campuriFile) {//4
        console.log('Campuri: ', campuriText);
        //verificari - TO DO
        var eroare = "";
        if (!campuriText.username)
            eroare += "Username-ul nu poate fi necompletat. ";
        if (!/[A-Za-z0-9]+/.test(campuriText.username))
            eroare += "Username-ul trebuie sa contina doar litere mici/mari si cifre. ";

        if (!campuriText.nume)
            eroare += "Numele nu poate fi necompletat. ";

        if (!campuriText.prenume)
            eroare += "Prenumele nu poate fi necompletat. ";
        if (!/[A-Z][a-z]+([-\.][A-Z][a-z]+)?/.test(campuriText.prenume))
            eroare += "Prenumele poate contine doar litere, spatii si caracterul " - ". ";

        // VERIFIC DACA PAROLA ARE MINIM 8 CARACTERE
        if (!campuriText.parola)
            eroare += "Parola nu poate fi necompletata. ";
        if (!/^(?=.*[A-Z])(?=.*[a-z])(?=.*[\.]).{8,}$/.test(campuriText.parola))
            eroare += "Nu ati respectat regula. ";

        if (!campuriText.rparola)
            eroare += "Reintroduceti parola.";
        if (campuriText.rparola !== campuriText.parola)
            eroare += "Parolele nu coincid. ";

        // FAC VALIDAREA SI A FORMATULUI ADRESEI DE EMAIL
        if (!campuriText.email)
            eroare += "Introduceti adresa de mail.";
        if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(campuriText.email))
            eroare += "Parolele nu coincid. ";


        //TO DO - de completat pentru restul de campuri functia match
        console.log(eroare);
        if (eroare !== "") {
            res.render("pages/inregistrare", {err: eroare});
            return;
        }

        queryVerifUtiliz = ` select * from utilizatori where username= '${campuriText.username}' `;
        console.log(queryVerifUtiliz)

        client.query(queryVerifUtiliz, function (err, rez) {
            if (err) {
                console.log(err);
                res.render("pages/inregistrare", {err: "Eroare baza date"});
            } else {
                if (rez.rows.length === 0) {
                    var criptareParola = crypto.scryptSync(campuriText.parola.replace('>', '&gt;').replace('<', '&lt'), parolaCriptare, 32).toString('hex');
                    var token = genereazaToken(80);
                    var token1 = genereazaToken1();

                    var cale_imagine = '';
                    if (campuriFile.poza.originalFilename && campuriFile.poza) {
                        cale_imagine = campuriFile.poza.filepath;
                    }
                    var problema_vedere = false;
                    if (campuriText.problema_vedere) {
                        problema_vedere = true;
                    }

                    var queryUtiliz = `insert into utilizatori (username, nume, prenume, parola, email, culoare_chat, problema_vedere, cale_imagine, cod) values ('${campuriText.username.replace('>', '&gt;').replace('<', '&lt')}','${campuriText.nume.replace('>', '&gt;').replace('<', '&lt')}','${campuriText.prenume.replace('>', '&gt;').replace('<', '&lt')}', $1 ,'${campuriText.email.replace('>', '&gt;').replace('<', '&lt')}','${campuriText.culoareText.replace('>', '&gt;').replace('<', '&lt')}', '${problema_vedere}', '${cale_imagine}', '${token1}${campuriText.username}${token}')`;

                    console.log(queryUtiliz, criptareParola);
                    client.query(queryUtiliz, [criptareParola], function (err, rez) { //TO DO parametrizati restul de query
                        if (err) {
                            console.log(err);
                            res.render("pages/inregistrare", {err: "Eroare baza date"});
                        } else {
                            trimiteMail(campuriText.username, campuriText.email, token1, token);
                            res.render("pages/inregistrare", {err: "", raspuns: "Date introduse"});
                        }
                    });
                } else {
                    eroare += "Username-ul mai exista. ";
                    res.render("pages/inregistrare", {err: eroare});
                }
            }
        });
    });
    formular.on("field", function (nume, val) {  // 1 pentru campuri cu continut de tip text (pentru inputuri de tip text, number, range,... si taguri select, textarea)
        console.log("----> ", nume, val);
        if (nume === "username")
            username = val;
    })
    formular.on("fileBegin", function (nume, fisier) { //2
        if (!fisier.originalFilename)
            return;
        folderUtilizator = path.join(__dirname, 'media', 'poze_utilizatori', username, '/');
        if (!fs.existsSync(folderUtilizator)) {
            fs.mkdirSync(folderUtilizator);
            v = fisier.originalFilename.split(".");
            fisier.filepath = folderUtilizator + "poza." + v[v.length - 1];//setez calea de upload
            //fisier.filepath=folderUtilizator+fisier.originalFilename;
        }
    })
    formular.on("file", function (nume, fisier) {//3
        //s-a terminat de uploadat
        console.log("fisier uploadat");
    });
});

app.get('/useri', function (req, res) {

    if (req.session && req.session.utilizator && req.session.utilizator.rol === "admin") {
        client.query(`select * from utilizatori where rol != 'admin' `, function (err, rezultat) {
            if (err) throw err;
            //console.log(rezultat);
            res.render('pages/useri', {useri: rezultat.rows});//afisez index-ul in acest caz
        });
    } else {
        res.status(403).render('pages/eroare', {mesaj: "Nu aveti acces"});
    }

});

app.post("/sterge_poza", function (req, res) {
    if (req.session && req.session.utilizator && req.session.utilizator.rol === "admin") {
        var formular = new formidable.IncomingForm()

        formular.parse(req, function (err, campuriText, campuriFisier) {
            //var comanda=`delete from utilizatori where id=${campuriText.id_utiliz} and rol!='admin'`;
            var comanda = `update utilizatori set cale_imagine = null where id=$1::integer and rol !='admin' `;
            client.query(comanda, [campuriText.id_utiliz], function (err, rez) {
                // TO DO mesaj cu stergerea
                if (err)
                    console.log(err);
                else {
                    if (rez.rowCount > 0) {

                        comanda = `select nume, prenume, email from utilizatori where id=${campuriText.id_utiliz}`;
                        client.query(comanda, function (err2, rez2) {
                            if (err)
                                console.log(err2);
                            else {
                                if (rez.rowCount > 0) {
                                    trimiteMailStergerePoza(rez2.rows[0].nume, rez2.rows[0].prenume, rez2.rows[0].email);
                                    console.log("sters cu succes");
                                }
                            }
                        });
                    } else {
                        console.log("stergere esuata");
                    }
                }
            });
        });
    }
    res.redirect("/useri");
});

app.post("/profil", function (req, res) {
    console.log("profil");
    if (!req.session.utilizator) {
        res.render("pages/eroare", {mesaj: "Nu sunteti logat."});
        return;
    }
    var formular = new formidable.IncomingForm();

    formular.parse(req, function (err, campuriText, campuriFile) {
        console.log(err);
        console.log(campuriText);
        var username;
        var criptareParola = crypto.scryptSync(campuriText.parola.replace('>', '&gt;').replace('<', '&lt'), parolaCriptare, 32).toString('hex');

        var problema_vedere = false;
        if (campuriText.problema_vedere) {
            problema_vedere = true;
        }

        var cale_imagine = '';
        if (campuriFile.poza.originalFilename && campuriFile.poza) {
            cale_imagine = campuriFile.poza.filepath;
        }

        //toti parametrii sunt cu ::text in query-ul parametrizat fiindca sunt stringuri (character varying) in tabel
        var queryUpdate = `update utilizatori set nume=$1::text, prenume=$2::text, email=$3::text, culoare_chat=$4::text, problema_vedere=$5::boolean, cale_imagine=$6::text where username=$7::text and parola=$8::text `;

        client.query(queryUpdate, [campuriText.nume.replace('>', '&gt;').replace('<', '&lt'), campuriText.prenume.replace('>', '&gt;').replace('<', '&lt'), campuriText.email, campuriText.culoareText, problema_vedere, cale_imagine, req.session.utilizator.username, criptareParola], function (err, rez) {
            if (err) {
                console.log(err);
                res.render("pages/eroare", {mesaj: "Eroare baza date. Incercati mai tarziu."});
                return;
            }
            console.log(rez.rowCount);
            if (rez.rowCount === 0) {
                res.render("pages/profil", {mesaj: "Update-ul nu s-a realizat. Verificati parola introdusa."});
                return;
            }

            req.session.utilizator.nume = campuriText.nume;
            req.session.utilizator.prenume = campuriText.prenume;

            req.session.utilizator.culoare_chat = campuriText.culoareText;
            req.session.utilizator.email = campuriText.email;

            req.session.utilizator.problema_vedere = problema_vedere;
            req.session.utilizator.poza = campuriText.poza;

            res.render("pages/profil", {mesaj: "Update-ul s-a realizat cu succes."});

        });
    });

    formular.on("field", function (nume, val) {  // 1 pentru campuri cu continut de tip text (pentru inputuri de tip text, number, range,... si taguri select, textarea)
        console.log("----> ", nume, val);
        if (nume === "username")
            username = val;
    })
    formular.on("fileBegin", function (nume, fisier) { //2
        if (!fisier.originalFilename)
            return;
        folderUtilizator = path.join(__dirname, 'media', 'poze_utilizatori', username, '/');
        if (!fs.existsSync(folderUtilizator)) {
            fs.mkdirSync(folderUtilizator);
        }
        v = fisier.originalFilename.split(".");
        fisier.filepath = folderUtilizator + "poza." + v[v.length - 1];
    })
    formular.on("file", function (nume, fisier) {//3
        //s-a terminat de uploadat
        console.log("fisier uploadat");
    });

});

app.get("/confirmare_mail/:token1/:user/:token", function (req, res) {
    console.log(`1: ${req.params.token1} user:${req.params.user} 2:${req.params.token}`);
    var queryUpdate = `update utilizatori set confirmat_mail=true where username = '${req.params.user}' and cod= '${req.params.token1}${req.params.user}${req.params.token}' `;
    client.query(queryUpdate, function (err, rez) {
        if (err) {
            console.log(err);
            res.render("pages/eroare", {err: "Eroare baza date"});
            return;
        }
        if (rez.rowCount > 0) {
            res.render("pages/confirmare");
        } else {
            res.render("pages/eroare", {err: "Eroare link"});
        }
    });

});

app.get("/produse", function (req, res) {
    convertImages();
    var conditie = "";
    if (req.query.categorie) {
        conditie += ` and categorie=${req.query.categorie}`;
    }
    client.query(`select * from produse where 1=1 ${conditie}`, function (err, rez) {
        if (!err) {
            res.render("pages/produse.ejs", {produse: rez.rows, images: objImagini.images, path: objImagini.path});
        } else {
        }
    })
})

app.get("/terms", function (req, res) {
    res.render("pages/terms.ejs");
})

app.get("/gdpr", function (req, res) {
    res.render("pages/gdpr.ejs");
})

// caleXMLMesaje = "resources/contact.xml";
headerXML = `<?xml version="1.0" encoding="utf-8"?>`;

function creeazaXMlContactDacaNuExista(caleXMLMesaje) {
    if (!fs.existsSync(caleXMLMesaje)) {
        let initXML = {
            "declaration": {
                "attributes": {
                    "version": "1.0",
                    "encoding": "utf-8"
                }
            },
            "elements": [
                {
                    "type": "element",
                    "name": "contact",
                    "elements": [
                        {
                            "type": "element",
                            "name": "mesaje",
                            "elements": []
                        }
                    ]
                }
            ]
        }
        let sirXml = xmljs.js2xml(initXML, {compact: false, spaces: 4});
        fs.writeFileSync(caleXMLMesaje, sirXml);
        return false; //l-a creat
    }
    return true; //nu l-a creat acum
}

function parseazaMesaje(caleXMLMesaje) {
    let existaInainte = creeazaXMlContactDacaNuExista(caleXMLMesaje);
    let mesajeXml = [];
    let obJson;
    if (existaInainte) {
        let sirXML = fs.readFileSync(caleXMLMesaje, 'utf8');
        obJson = xmljs.xml2js(sirXML, {compact: false, spaces: 4});


        let elementMesaje = obJson.elements[0].elements.find(function (el) {
            return el.name === "mesaje"
        });
        let vectElementeMesaj = elementMesaje.elements ? elementMesaje.elements : [];
        // console.log("Mesaje: ",obJson.elements[0].elements.find(function(el){
        //     return el.name === "mesaje"
        // }))
        let mesajeXml = vectElementeMesaj.filter(function (el) {
            return el.name === "mesaj"
        });
        return [obJson, elementMesaje, mesajeXml];
    }
    return [obJson, [], []];
}


app.get("/contact", function (req, res) {
    let obJson, elementMesaje, mesajeXml;
    [obJson, elementMesaje, mesajeXml] = parseazaMesaje('resources/contact.xml');

    res.render("pages/contact", {utilizator: req.session.utilizator, mesaje: mesajeXml})
});

app.post("/contact", function (req, res) {
    var formular = new formidable.IncomingForm();

    formular.parse(req, function (err, campuriText, campuriFile) {
        let obJson, elementMesaje, mesajeXml;
        [obJson, elementMesaje, mesajeXml] = parseazaMesaje('resources/contact.xml');

        let u = req.session.utilizator ? req.session.utilizator.username : "anonim";
        let mesajNou = {
            type: "element",
            name: "mesaj",
            attributes: {
                username: u,
                data: new Date()
            },
            elements: [{type: "text", "text": campuriText.mesaj}]
        };
        if (elementMesaje.elements)
            elementMesaje.elements.push(mesajNou);
        else
            elementMesaje.elements = [mesajNou];
        // console.log(elementMesaje.elements);
        let sirXml = xmljs.js2xml(obJson, {compact: false, spaces: 4});
        // console.log("XML: ",sirXml);
        fs.writeFileSync("resources/contact.xml", sirXml);

        res.render("pages/contact", {utilizator: req.session.utilizator, mesaje: elementMesaje.elements})
    });
});


app.post("/produs_review/:id", function (req, res) {
    var formular = new formidable.IncomingForm();

    formular.parse(req, function (err, campuriText, campuriFile) {
        let obJson, elementMesaje, mesajeXml;
        [obJson, elementMesaje, mesajeXml] = parseazaMesaje(`resources/produs_review/${req.params.id}.xml`);

        let u = req.session.utilizator ? req.session.utilizator.username : "anonim";
        let mesajNou = {
            type: "element",
            name: "mesaj",
            attributes: {
                username: u,
                data: new Date()
            },
            elements: [{type: "text", "text": campuriText.mesaj}]
        };
        if (elementMesaje.elements)
            elementMesaje.elements.push(mesajNou);
        else
            elementMesaje.elements = [mesajNou];
        // console.log(elementMesaje.elements);
        let sirXml = xmljs.js2xml(obJson, {compact: false, spaces: 4});
        // console.log("XML: ",sirXml);
        fs.writeFileSync(`resources/produs_review/${req.params.id}.xml`, sirXml);

        res.render(`./produs/${req.params.id}`, {utilizator: req.session.utilizator, mesaje: elementMesaje.elements})
    });
})

app.get("/produs/:id", function (req, res) {
    let obJson, elementMesaje, mesajeXml;
    [obJson, elementMesaje, mesajeXml] = parseazaMesaje(`resources/produs_review/${req.params.id}.xml`);

    client.query(`select * from produse where id=${req.params.id}`, function (err, rez) {
        if (!err) {
            res.render("pages/produs", {prod: rez.rows[0], mesaje: mesajeXml});
        } else {
        }
    })
})



convertImages();
var nrRandom;
nrRandom = Math.floor(Math.random() * 3 + 3) * 2;

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

function stergeAccesariVechi() {
    let comanda = `delete from accesari where now() - data_accesare > interval '10 minutes'`;
    //console.log(comanda);
    client.query(comanda, function (err, rez) {
        if (err) console.log(err);
    });
    let timp_curent = new Date();
    for (let ipa in ipuri_active) {
        if (timp_curent - ipuri_active[ipa].data > 2 * 60 * 1000) { // daca sunt mai vechi de 2 minute le deblochez
            console.log("Am deblocat ", ipa);
            delete ipuri_active[ipa];
        }
    }
}

setInterval(stergeAccesariVechi, 10 * 60 * 1000);

app.listen(8080);

// var s_port = process.env.PORT || 5000;
// app.listen(s_port);

console.log("Serverul a pornit.")