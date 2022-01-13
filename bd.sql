--
-- PostgreSQL database dump
--

-- Dumped from database version 14.0
-- Dumped by pg_dump version 14.0

-- Started on 2022-01-14 00:15:27

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 210 (class 1259 OID 24581)
-- Name: produse; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.produse (
    id integer NOT NULL,
    nume character varying NOT NULL,
    pret double precision NOT NULL,
    descriere character varying,
    image character varying,
    categorie integer,
    culoare integer,
    marime integer,
    lansare_produs date,
    material character varying,
    medii_utilizare character varying,
    in_stoc boolean
);


ALTER TABLE public.produse OWNER TO postgres;

--
-- TOC entry 209 (class 1259 OID 24580)
-- Name: produse_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.produse ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.produse_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 3306 (class 0 OID 24581)
-- Dependencies: 210
-- Data for Name: produse; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.produse (id, nume, pret, descriere, image, categorie, culoare, marime, lansare_produs, material, medii_utilizare, in_stoc) OVERRIDING SYSTEM VALUE VALUES (2, 'Caciula Neagra', 59.99, 'Caciula din bumbac 100%, pentru a putea sta la gratar afara si cand e frig.', 'caciula.png', 0, 0, 0, '2021-12-21', 'Bumbac matasos', 'afara, gratar', true);
INSERT INTO public.produse (id, nume, pret, descriere, image, categorie, culoare, marime, lansare_produs, material, medii_utilizare, in_stoc) OVERRIDING SYSTEM VALUE VALUES (4, 'Caciula Maro', 59.99, 'Caciula din bumbac 100%, pentru a putea sta la gratar afara si cand e frig.', 'caciula_maro.png', 0, 2, 0, '2021-12-20', 'Bumbac matasos', 'afara, gratar', true);
INSERT INTO public.produse (id, nume, pret, descriere, image, categorie, culoare, marime, lansare_produs, material, medii_utilizare, in_stoc) OVERRIDING SYSTEM VALUE VALUES (5, 'Geaca Neagra', 209.99, 'Ai nevoie sa te aperi de vant.', 'geaca_vant.png', 1, 0, 1, '2021-12-20', 'Panza tare', 'afara, gratar, munte', true);
INSERT INTO public.produse (id, nume, pret, descriere, image, categorie, culoare, marime, lansare_produs, material, medii_utilizare, in_stoc) OVERRIDING SYSTEM VALUE VALUES (6, 'Geaca Verde', 209.99, 'Ai nevoie sa te aperi de vant.', 'geaca_vant_verde.png', 1, 1, 2, '2021-12-21', 'Panza tare', 'afara, gratar, munte', true);
INSERT INTO public.produse (id, nume, pret, descriere, image, categorie, culoare, marime, lansare_produs, material, medii_utilizare, in_stoc) OVERRIDING SYSTEM VALUE VALUES (7, 'Geaca Maro', 209.99, 'Ai nevoie sa te aperi de vant.', 'geaca_vant_maro.png', 1, 2, 1, '2021-12-18', 'Panza tare', 'afara, gratar, munte', false);
INSERT INTO public.produse (id, nume, pret, descriere, image, categorie, culoare, marime, lansare_produs, material, medii_utilizare, in_stoc) OVERRIDING SYSTEM VALUE VALUES (8, 'Hanorac Neagru', 69.99, 'Ca sa iti tina de cald si afara fara sa stai sa iei geaca pe tine.', 'hanorac.png', 2, 0, 1, '2021-12-18', 'Bumbac moale, matase', 'afara, inauntru', false);
INSERT INTO public.produse (id, nume, pret, descriere, image, categorie, culoare, marime, lansare_produs, material, medii_utilizare, in_stoc) OVERRIDING SYSTEM VALUE VALUES (9, 'Hanorac Verde', 69.99, 'Ca sa iti tina de cald si afara fara sa stai sa iei geaca pe tine.', 'hanorac_verde.png', 2, 1, 1, '2021-12-18', 'Bumbac moale, matase', 'afara, inauntru', true);
INSERT INTO public.produse (id, nume, pret, descriere, image, categorie, culoare, marime, lansare_produs, material, medii_utilizare, in_stoc) OVERRIDING SYSTEM VALUE VALUES (10, 'Hanorac Maro', 69.99, 'Ca sa iti tina de cald si afara fara sa stai sa iei geaca pe tine.', 'hanorac_maro.png', 2, 2, 2, '2021-12-21', 'Bumbac moale, matase', 'afara, inauntru', true);
INSERT INTO public.produse (id, nume, pret, descriere, image, categorie, culoare, marime, lansare_produs, material, medii_utilizare, in_stoc) OVERRIDING SYSTEM VALUE VALUES (11, 'Masca Neagra', 39.99, 'Fii responsabil si cool in acelasi timp.', 'masca.png', 3, 0, 0, '2021-12-21', 'FP2', 'afara', true);
INSERT INTO public.produse (id, nume, pret, descriere, image, categorie, culoare, marime, lansare_produs, material, medii_utilizare, in_stoc) OVERRIDING SYSTEM VALUE VALUES (12, 'Masca Verde', 39.99, 'Fii responsabil si cool in acelasi timp.', 'masca_verde.png', 3, 1, 0, '2021-12-18', 'FP2', 'afara', true);
INSERT INTO public.produse (id, nume, pret, descriere, image, categorie, culoare, marime, lansare_produs, material, medii_utilizare, in_stoc) OVERRIDING SYSTEM VALUE VALUES (13, 'Masca Maro', 39.99, 'Fii responsabil si cool in acelasi timp.', 'masca_maro.png', 3, 2, 0, '2021-12-19', 'FP2', 'afara', false);
INSERT INTO public.produse (id, nume, pret, descriere, image, categorie, culoare, marime, lansare_produs, material, medii_utilizare, in_stoc) OVERRIDING SYSTEM VALUE VALUES (14, 'Pantaloni Cargo Neagri', 119.99, 'Singurii pantaloni in care poti tine un PET de bere in buzunar.', 'pantaloni_cargo.png', 4, 0, 2, '2021-12-19', 'Bumbac tare', 'afara, gratar, munte', true);
INSERT INTO public.produse (id, nume, pret, descriere, image, categorie, culoare, marime, lansare_produs, material, medii_utilizare, in_stoc) OVERRIDING SYSTEM VALUE VALUES (15, 'Pantaloni Cargo Verzi', 119.99, 'Singurii pantaloni in care poti tine un PET de bere in buzunar.', 'pantaloni_cargo_verde.png', 4, 1, 2, '2021-12-21', 'Bumbac tare', 'afara, gratar, munte', false);
INSERT INTO public.produse (id, nume, pret, descriere, image, categorie, culoare, marime, lansare_produs, material, medii_utilizare, in_stoc) OVERRIDING SYSTEM VALUE VALUES (16, 'Pantaloni Cargo Maro', 119.99, 'Singurii pantaloni in care poti tine un PET de bere in buzunar.', 'pantaloni_cargo_maro.png', 4, 2, 1, '2021-12-19', 'Bumbac tare', 'afara, gratar, munte', false);
INSERT INTO public.produse (id, nume, pret, descriere, image, categorie, culoare, marime, lansare_produs, material, medii_utilizare, in_stoc) OVERRIDING SYSTEM VALUE VALUES (17, 'Papuci Neagri', 99.99, 'Crocs, pentru a avea modul sport si confort fara sa schimbi incaltarile.', 'papuci.png', 5, 0, 42, '2021-12-21', 'Plastic', 'inauntru', true);
INSERT INTO public.produse (id, nume, pret, descriere, image, categorie, culoare, marime, lansare_produs, material, medii_utilizare, in_stoc) OVERRIDING SYSTEM VALUE VALUES (18, 'Papuci Verzi', 99.99, 'Crocs, pentru a avea modul sport si confort fara sa schimbi incaltarile.', 'papuci_verzi.png', 5, 1, 42, '2021-12-21', 'Plastic', 'inauntru', true);
INSERT INTO public.produse (id, nume, pret, descriere, image, categorie, culoare, marime, lansare_produs, material, medii_utilizare, in_stoc) OVERRIDING SYSTEM VALUE VALUES (19, 'Papuci Maro', 99.99, 'Crocs, pentru a avea modul sport si confort fara sa schimbi incaltarile.', 'papuci_maro.png', 5, 2, 41, '2021-12-19', 'Plastic', 'inauntru', NULL);
INSERT INTO public.produse (id, nume, pret, descriere, image, categorie, culoare, marime, lansare_produs, material, medii_utilizare, in_stoc) OVERRIDING SYSTEM VALUE VALUES (3, 'Caciula Verde', 79.99, 'Caciula din bumbac 100%, pentru a putea sta la gratar afara si cand e frig.', 'caciula_verde.png', 0, 1, 0, '2021-12-20', 'Bumbac matasos', 'afara, gratar', false);


--
-- TOC entry 3312 (class 0 OID 0)
-- Dependencies: 209
-- Name: produse_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.produse_id_seq', 19, true);


--
-- TOC entry 3165 (class 2606 OID 24587)
-- Name: produse produse_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.produse
    ADD CONSTRAINT produse_pkey PRIMARY KEY (id);


-- Completed on 2022-01-14 00:15:28

--
-- PostgreSQL database dump complete
--

