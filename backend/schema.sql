--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.9

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
-- Name: order_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_item (
    order_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL
);


ALTER TABLE public.order_item OWNER TO postgres;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    card_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    product_id integer
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: order_summary; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.order_summary AS
 SELECT o.id AS order_id,
    o.card_id,
    o.created_at,
    array_agg(oi.product_id ORDER BY oi.product_id) AS product_ids,
    array_agg(oi.quantity ORDER BY oi.product_id) AS quantities
   FROM (public.orders o
     JOIN public.order_item oi ON ((oi.order_id = o.id)))
  GROUP BY o.id, o.card_id, o.created_at;


ALTER VIEW public.order_summary OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: product; Type: TABLE; Schema: public; Owner: pharmacy_user
--

CREATE TABLE public.product (
    id integer NOT NULL,
    atc_code character varying(7) NOT NULL,
    name text NOT NULL,
    brand text NOT NULL,
    dosage_form text,
    pack_size text,
    is_otc boolean DEFAULT true NOT NULL,
    price_eur numeric(8,2),
    stock_level integer,
    image_url text,
    active_ingredient text,
    cod_cim text,
    dci text,
    forma_farmaceutica text,
    concentratie text,
    firma_tara_producatoare_app text,
    firma_tara_detinatoare_app text,
    actiune_terapeutica text,
    prescription text,
    nr_data_ambalaj_app text,
    ambalaj text,
    volum_ambalaj text,
    valabilitate_ambalaj text,
    bulina text,
    diez text,
    stea text,
    triunghi text,
    dreptunghi text,
    data_actualizare date,
    indications text,
    matched_symptoms text[],
    category text,
    atc_code_real text
);


ALTER TABLE public.product OWNER TO pharmacy_user;

--
-- Name: product_id_seq; Type: SEQUENCE; Schema: public; Owner: pharmacy_user
--

CREATE SEQUENCE public.product_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_id_seq OWNER TO pharmacy_user;

--
-- Name: product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pharmacy_user
--

ALTER SEQUENCE public.product_id_seq OWNED BY public.product.id;


--
-- Name: product_symptom_map; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_symptom_map (
    product_id integer NOT NULL,
    symptom_id integer NOT NULL,
    priority integer DEFAULT 0
);


ALTER TABLE public.product_symptom_map OWNER TO postgres;

--
-- Name: sale_event; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sale_event (
    id integer NOT NULL,
    product_id integer,
    quantity integer NOT NULL,
    sold_at timestamp with time zone DEFAULT now() NOT NULL,
    loyalty_id character varying(50)
);


ALTER TABLE public.sale_event OWNER TO postgres;

--
-- Name: sale_event_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sale_event_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sale_event_id_seq OWNER TO postgres;

--
-- Name: sale_event_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sale_event_id_seq OWNED BY public.sale_event.id;


--
-- Name: staging_medicine_raw; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staging_medicine_raw (
    denumire_comerciala text,
    dci text,
    forma_farmaceutica text,
    cod_atc character varying(7),
    cod_cim text,
    firma text,
    tara text
);


ALTER TABLE public.staging_medicine_raw OWNER TO postgres;

--
-- Name: symptom; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.symptom (
    id integer NOT NULL,
    snomed_code character varying(20) NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.symptom OWNER TO postgres;

--
-- Name: symptom_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.symptom_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.symptom_id_seq OWNER TO postgres;

--
-- Name: symptom_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.symptom_id_seq OWNED BY public.symptom.id;


--
-- Name: symptom_lookup; Type: TABLE; Schema: public; Owner: pharmacy_user
--

CREATE TABLE public.symptom_lookup (
    name text NOT NULL
);


ALTER TABLE public.symptom_lookup OWNER TO pharmacy_user;

--
-- Name: tmp_nomen; Type: TABLE; Schema: public; Owner: pharmacy_user
--

CREATE TABLE public.tmp_nomen (
    cod_cim text NOT NULL,
    matched_symptoms text[]
);


ALTER TABLE public.tmp_nomen OWNER TO pharmacy_user;

--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: product id; Type: DEFAULT; Schema: public; Owner: pharmacy_user
--

ALTER TABLE ONLY public.product ALTER COLUMN id SET DEFAULT nextval('public.product_id_seq'::regclass);


--
-- Name: sale_event id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_event ALTER COLUMN id SET DEFAULT nextval('public.sale_event_id_seq'::regclass);


--
-- Name: symptom id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.symptom ALTER COLUMN id SET DEFAULT nextval('public.symptom_id_seq'::regclass);


--
-- Name: order_item order_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT order_item_pkey PRIMARY KEY (order_id, product_id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: product product_pkey; Type: CONSTRAINT; Schema: public; Owner: pharmacy_user
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_pkey PRIMARY KEY (id);


--
-- Name: product_symptom_map product_symptom_map_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_symptom_map
    ADD CONSTRAINT product_symptom_map_pkey PRIMARY KEY (product_id, symptom_id);


--
-- Name: sale_event sale_event_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_event
    ADD CONSTRAINT sale_event_pkey PRIMARY KEY (id);


--
-- Name: symptom_lookup symptom_lookup_pkey; Type: CONSTRAINT; Schema: public; Owner: pharmacy_user
--

ALTER TABLE ONLY public.symptom_lookup
    ADD CONSTRAINT symptom_lookup_pkey PRIMARY KEY (name);


--
-- Name: symptom symptom_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.symptom
    ADD CONSTRAINT symptom_pkey PRIMARY KEY (id);


--
-- Name: symptom symptom_snomed_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.symptom
    ADD CONSTRAINT symptom_snomed_code_key UNIQUE (snomed_code);


--
-- Name: tmp_nomen tmp_nomen_pkey; Type: CONSTRAINT; Schema: public; Owner: pharmacy_user
--

ALTER TABLE ONLY public.tmp_nomen
    ADD CONSTRAINT tmp_nomen_pkey PRIMARY KEY (cod_cim);


--
-- Name: idx_product_category; Type: INDEX; Schema: public; Owner: pharmacy_user
--

CREATE INDEX idx_product_category ON public.product USING btree (category);


--
-- Name: order_item order_item_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT order_item_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_item order_item_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT order_item_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product(id);


--
-- Name: orders orders_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product(id);


--
-- Name: product_symptom_map product_symptom_map_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_symptom_map
    ADD CONSTRAINT product_symptom_map_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product(id);


--
-- Name: product_symptom_map product_symptom_map_symptom_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_symptom_map
    ADD CONSTRAINT product_symptom_map_symptom_id_fkey FOREIGN KEY (symptom_id) REFERENCES public.symptom(id);


--
-- Name: sale_event sale_event_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_event
    ADD CONSTRAINT sale_event_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product(id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO pharmacy_user;


--
-- Name: TABLE order_item; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT ON TABLE public.order_item TO pharmacy_user;


--
-- Name: TABLE orders; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT ON TABLE public.orders TO pharmacy_user;


--
-- Name: SEQUENCE orders_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.orders_id_seq TO pharmacy_user;


--
-- Name: TABLE product_symptom_map; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.product_symptom_map TO pharmacy_user;


--
-- Name: TABLE sale_event; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.sale_event TO pharmacy_user;


--
-- Name: SEQUENCE sale_event_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.sale_event_id_seq TO pharmacy_user;


--
-- Name: TABLE staging_medicine_raw; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT ON TABLE public.staging_medicine_raw TO pharmacy_user;


--
-- Name: TABLE symptom; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.symptom TO pharmacy_user;


--
-- Name: SEQUENCE symptom_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.symptom_id_seq TO pharmacy_user;


--
-- PostgreSQL database dump complete
--

