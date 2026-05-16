--
-- PostgreSQL database dump
--

\restrict KHqTCJgeHUHox3Qf6Nmqj8U5UqmqgWV5GbzVO9wGlFcTA7ZkmmxfuDwwGpCQlyA

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.2

-- Started on 2026-05-16 15:51:48

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
-- TOC entry 220 (class 1259 OID 16534)
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    img_url character varying(255)
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16533)
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO postgres;

--
-- TOC entry 5165 (class 0 OID 0)
-- Dependencies: 219
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- TOC entry 238 (class 1259 OID 16702)
-- Name: coupons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coupons (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    description text,
    discount_value numeric(15,2),
    min_order_value numeric(15,2),
    valid_from timestamp without time zone,
    valid_until timestamp without time zone,
    usage_limit integer,
    used_count integer DEFAULT 0,
    is_active boolean DEFAULT true
);


ALTER TABLE public.coupons OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 16701)
-- Name: coupons_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.coupons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.coupons_id_seq OWNER TO postgres;

--
-- TOC entry 5166 (class 0 OID 0)
-- Dependencies: 237
-- Name: coupons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.coupons_id_seq OWNED BY public.coupons.id;


--
-- TOC entry 234 (class 1259 OID 16657)
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    variant_id integer NOT NULL,
    quantity integer NOT NULL,
    price numeric(15,2) NOT NULL
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16656)
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_items_id_seq OWNER TO postgres;

--
-- TOC entry 5167 (class 0 OID 0)
-- Dependencies: 233
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- TOC entry 232 (class 1259 OID 16634)
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    user_id integer,
    fullname character varying(255) NOT NULL,
    phone character varying(20) NOT NULL,
    email character varying(255) NOT NULL,
    address text NOT NULL,
    ward character varying(100),
    district character varying(100),
    province character varying(100),
    note text,
    payment_method character varying(50),
    shipping_fee numeric(15,2) DEFAULT 0,
    total_amount numeric(15,2) NOT NULL,
    coupon_code character varying(50),
    status character varying(50) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16633)
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
-- TOC entry 5168 (class 0 OID 0)
-- Dependencies: 231
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- TOC entry 241 (class 1259 OID 16730)
-- Name: point_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.point_history (
    id integer NOT NULL,
    user_id integer NOT NULL,
    points_changed integer NOT NULL,
    reason character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.point_history OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 16729)
-- Name: point_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.point_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.point_history_id_seq OWNER TO postgres;

--
-- TOC entry 5169 (class 0 OID 0)
-- Dependencies: 240
-- Name: point_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.point_history_id_seq OWNED BY public.point_history.id;


--
-- TOC entry 226 (class 1259 OID 16583)
-- Name: product_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_images (
    id integer NOT NULL,
    variant_id integer,
    img_url character varying(255) NOT NULL,
    is_main boolean DEFAULT false
);


ALTER TABLE public.product_images OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16582)
-- Name: product_images_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_images_id_seq OWNER TO postgres;

--
-- TOC entry 5170 (class 0 OID 0)
-- Dependencies: 225
-- Name: product_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_images_id_seq OWNED BY public.product_images.id;


--
-- TOC entry 224 (class 1259 OID 16569)
-- Name: product_variants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_variants (
    id integer NOT NULL,
    product_id integer,
    price numeric(15,2) NOT NULL,
    base_price numeric(15,2),
    size character varying(255)
);


ALTER TABLE public.product_variants OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16568)
-- Name: product_variants_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_variants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_variants_id_seq OWNER TO postgres;

--
-- TOC entry 5171 (class 0 OID 0)
-- Dependencies: 223
-- Name: product_variants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_variants_id_seq OWNED BY public.product_variants.id;


--
-- TOC entry 222 (class 1259 OID 16548)
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    description text,
    category_id integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.products OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16547)
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO postgres;

--
-- TOC entry 5172 (class 0 OID 0)
-- Dependencies: 221
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- TOC entry 230 (class 1259 OID 16613)
-- Name: user_identities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_identities (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    provider character varying(255) NOT NULL,
    provider_user_id character varying(255) NOT NULL,
    email character varying(255),
    access_token text,
    refresh_token text,
    expires_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_identities OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16612)
-- Name: user_identities_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_identities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_identities_id_seq OWNER TO postgres;

--
-- TOC entry 5173 (class 0 OID 0)
-- Dependencies: 229
-- Name: user_identities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_identities_id_seq OWNED BY public.user_identities.id;


--
-- TOC entry 242 (class 1259 OID 16808)
-- Name: user_identities_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_identities_seq
    START WITH 1
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_identities_seq OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 16716)
-- Name: user_points; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_points (
    user_id integer NOT NULL,
    total_points integer DEFAULT 0,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_points OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16598)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255),
    fullname character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16597)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5174 (class 0 OID 0)
-- Dependencies: 227
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 236 (class 1259 OID 16679)
-- Name: wishlist; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wishlist (
    id integer NOT NULL,
    user_id integer NOT NULL,
    product_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.wishlist OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16678)
-- Name: wishlist_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.wishlist_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wishlist_id_seq OWNER TO postgres;

--
-- TOC entry 5175 (class 0 OID 0)
-- Dependencies: 235
-- Name: wishlist_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.wishlist_id_seq OWNED BY public.wishlist.id;


--
-- TOC entry 4911 (class 2604 OID 16537)
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- TOC entry 4930 (class 2604 OID 16705)
-- Name: coupons id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons ALTER COLUMN id SET DEFAULT nextval('public.coupons_id_seq'::regclass);


--
-- TOC entry 4927 (class 2604 OID 16660)
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- TOC entry 4923 (class 2604 OID 16637)
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- TOC entry 4935 (class 2604 OID 16733)
-- Name: point_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.point_history ALTER COLUMN id SET DEFAULT nextval('public.point_history_id_seq'::regclass);


--
-- TOC entry 4916 (class 2604 OID 16586)
-- Name: product_images id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images ALTER COLUMN id SET DEFAULT nextval('public.product_images_id_seq'::regclass);


--
-- TOC entry 4915 (class 2604 OID 16572)
-- Name: product_variants id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants ALTER COLUMN id SET DEFAULT nextval('public.product_variants_id_seq'::regclass);


--
-- TOC entry 4912 (class 2604 OID 16551)
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- TOC entry 4921 (class 2604 OID 16745)
-- Name: user_identities id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_identities ALTER COLUMN id SET DEFAULT nextval('public.user_identities_id_seq'::regclass);


--
-- TOC entry 4918 (class 2604 OID 16772)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4928 (class 2604 OID 16682)
-- Name: wishlist id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist ALTER COLUMN id SET DEFAULT nextval('public.wishlist_id_seq'::regclass);


--
-- TOC entry 5137 (class 0 OID 16534)
-- Dependencies: 220
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, slug, img_url) FROM stdin;
1	Phụ kiện	phu-kien	\N
2	Thời trang	thoi-trang	\N
3	Trang trí	trang-tri	\N
4	Túi xách	tui-xach	\N
5	Búp bê	bup-be	\N
6	Hoa handmade	hoa-handmade	\N
7	Móc chìa khóa	moc-chia-khoa	\N
8	Sản phẩm từ len	san-pham-tu-len	\N
9	Sản phẩm từ thổ cẩm	san-pham-tu-tho-cam	\N
10	Thú bông	thu-bong	\N
11	Tranh cuộn	tranh-cuon	\N
12	Túi balo	tui-balo	\N
13	Đồ dùng	do-dung	\N
\.


--
-- TOC entry 5155 (class 0 OID 16702)
-- Dependencies: 238
-- Data for Name: coupons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coupons (id, code, description, discount_value, min_order_value, valid_from, valid_until, usage_limit, used_count, is_active) FROM stdin;
\.


--
-- TOC entry 5151 (class 0 OID 16657)
-- Dependencies: 234
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, order_id, variant_id, quantity, price) FROM stdin;
\.


--
-- TOC entry 5149 (class 0 OID 16634)
-- Dependencies: 232
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, user_id, fullname, phone, email, address, ward, district, province, note, payment_method, shipping_fee, total_amount, coupon_code, status, created_at) FROM stdin;
\.


--
-- TOC entry 5158 (class 0 OID 16730)
-- Dependencies: 241
-- Data for Name: point_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.point_history (id, user_id, points_changed, reason, created_at) FROM stdin;
\.


--
-- TOC entry 5143 (class 0 OID 16583)
-- Dependencies: 226
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_images (id, variant_id, img_url, is_main) FROM stdin;
1	1	https://bizweb.dktcdn.net/thumb/1024x1024/100/053/286/products/20190401173317-img-2959.jpg?v=1557219127160	t
2	1	https://bizweb.dktcdn.net/thumb/1024x1024/100/053/286/products/20190401172541-img-2949.jpg?v=1557219127160	f
3	1	https://bizweb.dktcdn.net/thumb/1024x1024/100/053/286/products/20190401172649-img-2951.jpg?v=1557219127160	f
4	10	https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400	t
5	10	https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400	f
6	19	https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400	t
7	19	https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400	f
8	25	https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400	t
9	25	https://images.unsplash.com/photo-1603398938373-e54da0bb5e48?w=400	f
10	31	https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400	t
11	31	https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=400	f
12	35	https://images.unsplash.com/photo-1579783902614-a53fb8287b1a?w=400	t
13	35	https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400	f
14	44	https://images.unsplash.com/photo-1627123424574-724758594e93?w=400	t
15	44	https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400	f
16	53	https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400	t
17	53	https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400	f
18	65	https://images.unsplash.com/photo-1584100936595-c0655ba6af63?w=400	t
19	65	https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400	f
20	74	https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400	t
21	74	https://images.unsplash.com/photo-1603398938373-e54da0bb5e48?w=400	f
22	83	https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400	t
23	83	https://images.unsplash.com/photo-1627123424574-724758594e93?w=400	f
24	92	https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400	t
25	92	https://images.unsplash.com/photo-1584100936595-c0655ba6af63?w=400	f
26	101	https://images.unsplash.com/photo-1603398938373-e54da0bb5e48?w=400	t
27	101	https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400	f
28	110	https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400	t
29	110	https://images.unsplash.com/photo-1579783902614-a53fb8287b1a?w=400	f
30	119	https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400	t
31	119	https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400	f
32	128	https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400	t
33	128	https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400	f
34	140	https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400	t
35	140	https://images.unsplash.com/photo-1584100936595-c0655ba6af63?w=400	f
36	152	https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400	t
37	152	https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=400	f
38	161	https://images.unsplash.com/photo-1579783902614-a53fb8287b1a?w=400	t
39	161	https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400	f
40	170	https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=400	t
41	170	https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400	f
42	179	https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400	t
43	179	https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400	f
44	191	https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400	t
45	191	https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400	f
46	203	https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400	t
47	203	https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400	f
48	215	https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400	t
49	215	https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400	f
50	227	https://images.unsplash.com/photo-1584100936595-c0655ba6af63?w=400	t
51	227	https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400	f
52	239	https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400	t
53	239	https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=400	f
54	251	https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=400	t
55	251	https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400	f
56	263	https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400	t
57	263	https://images.unsplash.com/photo-1579783902614-a53fb8287b1a?w=400	f
58	272	https://images.unsplash.com/photo-1579783902614-a53fb8287b1a?w=400	t
59	272	https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400	f
60	281	https://images.unsplash.com/photo-1627123424574-724758594e93?w=400	t
61	281	https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400	f
62	290	https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400	t
63	290	https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400	f
64	306	https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400	t
65	306	https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400	f
66	314	https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400	t
67	314	https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400	f
68	320	https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400	t
69	320	https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400	f
70	328	https://images.unsplash.com/photo-1584100936595-c0655ba6af63?w=400	t
71	328	https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400	f
72	337	https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400	t
73	337	https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=400	f
74	346	https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400	t
75	346	https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400	f
76	358	https://images.unsplash.com/photo-1579783902614-a53fb8287b1a?w=400	t
77	358	https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400	f
\.


--
-- TOC entry 5141 (class 0 OID 16569)
-- Dependencies: 224
-- Data for Name: product_variants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_variants (id, product_id, price, base_price, size) FROM stdin;
1	1	150000.00	150000.00	Đỏ / Size S
2	1	150000.00	150000.00	Đỏ / Size M
3	1	150000.00	150000.00	Đỏ / Size L
4	1	150000.00	150000.00	Đen / Size S
5	1	150000.00	150000.00	Đen / Size M
6	1	150000.00	150000.00	Đen / Size L
7	1	150000.00	150000.00	Trắng / Size S
8	1	150000.00	150000.00	Trắng / Size M
9	1	150000.00	150000.00	Trắng / Size L
10	2	250000.00	250000.00	Be / Nhỏ
11	2	250000.00	250000.00	Be / Vừa
12	2	250000.00	250000.00	Be / Lớn
13	2	250000.00	250000.00	Nâu / Nhỏ
14	2	250000.00	250000.00	Nâu / Vừa
15	2	250000.00	250000.00	Nâu / Lớn
16	2	250000.00	250000.00	Đen / Nhỏ
17	2	250000.00	250000.00	Đen / Vừa
18	2	250000.00	250000.00	Đen / Lớn
19	3	320000.00	320000.00	Hồng / Khăn ngắn
20	3	320000.00	320000.00	Hồng / Khăn dài
21	3	320000.00	320000.00	Xám / Khăn ngắn
22	3	320000.00	320000.00	Xám / Khăn dài
23	3	320000.00	320000.00	Xanh dương / Khăn ngắn
24	3	320000.00	320000.00	Xanh dương / Khăn dài
25	4	180000.00	180000.00	Trắng / Hộp đơn
26	4	180000.00	180000.00	Trắng / Hộp đôi
27	4	180000.00	180000.00	Vàng nhạt / Hộp đơn
28	4	180000.00	180000.00	Vàng nhạt / Hộp đôi
29	4	180000.00	180000.00	Xanh lá / Hộp đơn
30	4	180000.00	180000.00	Xanh lá / Hộp đôi
31	5	450000.00	450000.00	Nâu gỗ / 40x50
32	5	450000.00	450000.00	Nâu gỗ / 60x80
33	5	450000.00	450000.00	Đen viền / 40x50
34	5	450000.00	450000.00	Đen viền / 60x80
35	6	280000.00	280000.00	Trắng / Bộ 4 ly
36	6	280000.00	280000.00	Trắng / Bộ 6 ly
37	6	280000.00	280000.00	Trắng / Bộ 8 ly
38	6	280000.00	280000.00	Xanh dương / Bộ 4 ly
39	6	280000.00	280000.00	Xanh dương / Bộ 6 ly
40	6	280000.00	280000.00	Xanh dương / Bộ 8 ly
41	6	280000.00	280000.00	Hồng nhạt / Bộ 4 ly
42	6	280000.00	280000.00	Hồng nhạt / Bộ 6 ly
43	6	280000.00	280000.00	Hồng nhạt / Bộ 8 ly
44	7	380000.00	380000.00	Nâu / Ví dài
45	7	380000.00	380000.00	Nâu / Ví ngắn
46	7	380000.00	380000.00	Nâu / Ví đa năng
47	7	380000.00	380000.00	Đen / Ví dài
48	7	380000.00	380000.00	Đen / Ví ngắn
49	7	380000.00	380000.00	Đen / Ví đa năng
50	7	380000.00	380000.00	Nâu đậm / Ví dài
51	7	380000.00	380000.00	Nâu đậm / Ví ngắn
52	7	380000.00	380000.00	Nâu đậm / Ví đa năng
53	8	85000.00	85000.00	Đỏ / Hình động vật
54	8	85000.00	85000.00	Đỏ / Hình hoa quả
55	8	85000.00	85000.00	Đỏ / Hình trái tim
56	8	85000.00	85000.00	Vàng / Hình động vật
57	8	85000.00	85000.00	Vàng / Hình hoa quả
58	8	85000.00	85000.00	Vàng / Hình trái tim
59	8	85000.00	85000.00	Xanh lá / Hình động vật
60	8	85000.00	85000.00	Xanh lá / Hình hoa quả
61	8	85000.00	85000.00	Xanh lá / Hình trái tim
62	8	85000.00	85000.00	Hồng / Hình động vật
63	8	85000.00	85000.00	Hồng / Hình hoa quả
64	8	85000.00	85000.00	Hồng / Hình trái tim
65	9	220000.00	220000.00	Trắng / 40x40cm
66	9	220000.00	220000.00	Trắng / 50x50cm
67	9	220000.00	220000.00	Trắng / 60x60cm
68	9	220000.00	220000.00	Be / 40x40cm
69	9	220000.00	220000.00	Be / 50x50cm
70	9	220000.00	220000.00	Be / 60x60cm
71	9	220000.00	220000.00	Hồng nhạt / 40x40cm
72	9	220000.00	220000.00	Hồng nhạt / 50x50cm
73	9	220000.00	220000.00	Hồng nhạt / 60x60cm
74	10	350000.00	350000.00	Nâu gỗ / Nhỏ (15cm)
75	10	350000.00	350000.00	Nâu gỗ / Vừa (20cm)
76	10	350000.00	350000.00	Nâu gỗ / Lớn (25cm)
77	10	350000.00	350000.00	Trắng / Nhỏ (15cm)
78	10	350000.00	350000.00	Trắng / Vừa (20cm)
79	10	350000.00	350000.00	Trắng / Lớn (25cm)
80	10	350000.00	350000.00	Xanh nhạt / Nhỏ (15cm)
81	10	350000.00	350000.00	Xanh nhạt / Vừa (20cm)
82	10	350000.00	350000.00	Xanh nhạt / Lớn (25cm)
83	11	420000.00	420000.00	Nâu / Nhỏ
84	11	420000.00	420000.00	Nâu / Vừa
85	11	420000.00	420000.00	Nâu / Lớn
86	11	420000.00	420000.00	Đen / Nhỏ
87	11	420000.00	420000.00	Đen / Vừa
88	11	420000.00	420000.00	Đen / Lớn
89	11	420000.00	420000.00	Nâu đậm / Nhỏ
90	11	420000.00	420000.00	Nâu đậm / Vừa
91	11	420000.00	420000.00	Nâu đậm / Lớn
92	12	380000.00	380000.00	Trắng / 120x120cm
93	12	380000.00	380000.00	Trắng / 150x150cm
94	12	380000.00	380000.00	Trắng / 180x180cm
95	12	380000.00	380000.00	Be / 120x120cm
96	12	380000.00	380000.00	Be / 150x150cm
97	12	380000.00	380000.00	Be / 180x180cm
98	12	380000.00	380000.00	Kem / 120x120cm
99	12	380000.00	380000.00	Kem / 150x150cm
100	12	380000.00	380000.00	Kem / 180x180cm
101	13	280000.00	280000.00	Trắng / Nhỏ (15W)
102	13	280000.00	280000.00	Trắng / Vừa (25W)
103	13	280000.00	280000.00	Trắng / Lớn (40W)
104	13	280000.00	280000.00	Xanh dương / Nhỏ (15W)
105	13	280000.00	280000.00	Xanh dương / Vừa (25W)
106	13	280000.00	280000.00	Xanh dương / Lớn (40W)
107	13	280000.00	280000.00	Hồng nhạt / Nhỏ (15W)
108	13	280000.00	280000.00	Hồng nhạt / Vừa (25W)
109	13	280000.00	280000.00	Hồng nhạt / Lớn (40W)
110	14	320000.00	320000.00	Trắng / Bộ 4 người
111	14	320000.00	320000.00	Trắng / Bộ 6 người
112	14	320000.00	320000.00	Trắng / Bộ 8 người
113	14	320000.00	320000.00	Xanh nhạt / Bộ 4 người
114	14	320000.00	320000.00	Xanh nhạt / Bộ 6 người
115	14	320000.00	320000.00	Xanh nhạt / Bộ 8 người
116	14	320000.00	320000.00	Be / Bộ 4 người
117	14	320000.00	320000.00	Be / Bộ 6 người
118	14	320000.00	320000.00	Be / Bộ 8 người
119	15	290000.00	290000.00	Nâu / Nhỏ
120	15	290000.00	290000.00	Nâu / Vừa
121	15	290000.00	290000.00	Nâu / Lớn
122	15	290000.00	290000.00	Be / Nhỏ
123	15	290000.00	290000.00	Be / Vừa
124	15	290000.00	290000.00	Be / Lớn
125	15	290000.00	290000.00	Kem / Nhỏ
126	15	290000.00	290000.00	Kem / Vừa
127	15	290000.00	290000.00	Kem / Lớn
128	16	200000.00	200000.00	Xanh lá / Ngắn (40cm)
129	16	200000.00	200000.00	Xanh lá / Vừa (45cm)
130	16	200000.00	200000.00	Xanh lá / Dài (50cm)
131	16	200000.00	200000.00	Đỏ / Ngắn (40cm)
132	16	200000.00	200000.00	Đỏ / Vừa (45cm)
133	16	200000.00	200000.00	Đỏ / Dài (50cm)
134	16	200000.00	200000.00	Tím / Ngắn (40cm)
135	16	200000.00	200000.00	Tím / Vừa (45cm)
136	16	200000.00	200000.00	Tím / Dài (50cm)
137	16	200000.00	200000.00	Xanh dương / Ngắn (40cm)
138	16	200000.00	200000.00	Xanh dương / Vừa (45cm)
139	16	200000.00	200000.00	Xanh dương / Dài (50cm)
140	17	350000.00	350000.00	Trắng / Bộ 2 khăn
141	17	350000.00	350000.00	Trắng / Bộ 4 khăn
142	17	350000.00	350000.00	Trắng / Bộ 6 khăn
143	17	350000.00	350000.00	Xanh dương / Bộ 2 khăn
144	17	350000.00	350000.00	Xanh dương / Bộ 4 khăn
145	17	350000.00	350000.00	Xanh dương / Bộ 6 khăn
146	17	350000.00	350000.00	Hồng / Bộ 2 khăn
147	17	350000.00	350000.00	Hồng / Bộ 4 khăn
148	17	350000.00	350000.00	Hồng / Bộ 6 khăn
149	17	350000.00	350000.00	Xám / Bộ 2 khăn
150	17	350000.00	350000.00	Xám / Bộ 4 khăn
151	17	350000.00	350000.00	Xám / Bộ 6 khăn
152	18	180000.00	180000.00	Nâu gỗ / Nhỏ (15x10x8cm)
153	18	180000.00	180000.00	Nâu gỗ / Vừa (20x15x10cm)
154	18	180000.00	180000.00	Nâu gỗ / Lớn (25x20x12cm)
155	18	180000.00	180000.00	Nâu đậm / Nhỏ (15x10x8cm)
156	18	180000.00	180000.00	Nâu đậm / Vừa (20x15x10cm)
157	18	180000.00	180000.00	Nâu đậm / Lớn (25x20x12cm)
158	18	180000.00	180000.00	Đen / Nhỏ (15x10x8cm)
159	18	180000.00	180000.00	Đen / Vừa (20x15x10cm)
160	18	180000.00	180000.00	Đen / Lớn (25x20x12cm)
161	19	240000.00	240000.00	Trắng / Bộ 4 chén
162	19	240000.00	240000.00	Trắng / Bộ 6 chén
163	19	240000.00	240000.00	Trắng / Bộ 8 chén
164	19	240000.00	240000.00	Xanh nhạt / Bộ 4 chén
165	19	240000.00	240000.00	Xanh nhạt / Bộ 6 chén
166	19	240000.00	240000.00	Xanh nhạt / Bộ 8 chén
167	19	240000.00	240000.00	Hồng nhạt / Bộ 4 chén
168	19	240000.00	240000.00	Hồng nhạt / Bộ 6 chén
169	19	240000.00	240000.00	Hồng nhạt / Bộ 8 chén
170	20	550000.00	550000.00	Nâu gỗ / 30x40cm
171	20	550000.00	550000.00	Nâu gỗ / 40x50cm
172	20	550000.00	550000.00	Nâu gỗ / 50x70cm
173	20	550000.00	550000.00	Đen viền / 30x40cm
174	20	550000.00	550000.00	Đen viền / 40x50cm
175	20	550000.00	550000.00	Đen viền / 50x70cm
176	20	550000.00	550000.00	Trắng / 30x40cm
177	20	550000.00	550000.00	Trắng / 40x50cm
178	20	550000.00	550000.00	Trắng / 50x70cm
179	21	180000.00	180000.00	Hồng / Nhỏ (20cm)
180	21	180000.00	180000.00	Hồng / Vừa (30cm)
181	21	180000.00	180000.00	Hồng / Lớn (40cm)
182	21	180000.00	180000.00	Xanh dương / Nhỏ (20cm)
183	21	180000.00	180000.00	Xanh dương / Vừa (30cm)
184	21	180000.00	180000.00	Xanh dương / Lớn (40cm)
185	21	180000.00	180000.00	Vàng / Nhỏ (20cm)
186	21	180000.00	180000.00	Vàng / Vừa (30cm)
187	21	180000.00	180000.00	Vàng / Lớn (40cm)
188	21	180000.00	180000.00	Trắng / Nhỏ (20cm)
189	21	180000.00	180000.00	Trắng / Vừa (30cm)
190	21	180000.00	180000.00	Trắng / Lớn (40cm)
191	22	220000.00	220000.00	Nâu / Nhỏ (25cm)
192	22	220000.00	220000.00	Nâu / Vừa (35cm)
193	22	220000.00	220000.00	Nâu / Lớn (45cm)
194	22	220000.00	220000.00	Trắng / Nhỏ (25cm)
195	22	220000.00	220000.00	Trắng / Vừa (35cm)
196	22	220000.00	220000.00	Trắng / Lớn (45cm)
197	22	220000.00	220000.00	Hồng / Nhỏ (25cm)
198	22	220000.00	220000.00	Hồng / Vừa (35cm)
199	22	220000.00	220000.00	Hồng / Lớn (45cm)
200	22	220000.00	220000.00	Xám / Nhỏ (25cm)
201	22	220000.00	220000.00	Xám / Vừa (35cm)
202	22	220000.00	220000.00	Xám / Lớn (45cm)
203	23	250000.00	250000.00	Hồng / Nhỏ (25cm)
204	23	250000.00	250000.00	Hồng / Vừa (35cm)
205	23	250000.00	250000.00	Hồng / Lớn (45cm)
206	23	250000.00	250000.00	Tím / Nhỏ (25cm)
207	23	250000.00	250000.00	Tím / Vừa (35cm)
208	23	250000.00	250000.00	Tím / Lớn (45cm)
209	23	250000.00	250000.00	Vàng / Nhỏ (25cm)
210	23	250000.00	250000.00	Vàng / Vừa (35cm)
211	23	250000.00	250000.00	Vàng / Lớn (45cm)
212	23	250000.00	250000.00	Xanh dương / Nhỏ (25cm)
213	23	250000.00	250000.00	Xanh dương / Vừa (35cm)
214	23	250000.00	250000.00	Xanh dương / Lớn (45cm)
215	24	200000.00	200000.00	Nâu / Hình mèo
216	24	200000.00	200000.00	Nâu / Hình chó
217	24	200000.00	200000.00	Nâu / Hình thỏ
218	24	200000.00	200000.00	Trắng / Hình mèo
219	24	200000.00	200000.00	Trắng / Hình chó
220	24	200000.00	200000.00	Trắng / Hình thỏ
221	24	200000.00	200000.00	Cam / Hình mèo
222	24	200000.00	200000.00	Cam / Hình chó
223	24	200000.00	200000.00	Cam / Hình thỏ
224	24	200000.00	200000.00	Xám / Hình mèo
225	24	200000.00	200000.00	Xám / Hình chó
226	24	200000.00	200000.00	Xám / Hình thỏ
227	25	280000.00	280000.00	Đỏ / Áo dài đỏ
228	25	280000.00	280000.00	Đỏ / Áo dài vàng
229	25	280000.00	280000.00	Đỏ / Áo tứ thân
230	25	280000.00	280000.00	Vàng / Áo dài đỏ
231	25	280000.00	280000.00	Vàng / Áo dài vàng
232	25	280000.00	280000.00	Vàng / Áo tứ thân
233	25	280000.00	280000.00	Xanh dương / Áo dài đỏ
234	25	280000.00	280000.00	Xanh dương / Áo dài vàng
235	25	280000.00	280000.00	Xanh dương / Áo tứ thân
236	25	280000.00	280000.00	Hồng / Áo dài đỏ
237	25	280000.00	280000.00	Hồng / Áo dài vàng
238	25	280000.00	280000.00	Hồng / Áo tứ thân
239	26	120000.00	120000.00	Đỏ / Bông đơn
240	26	120000.00	120000.00	Đỏ / Bó 3 bông
241	26	120000.00	120000.00	Đỏ / Bó 5 bông
242	26	120000.00	120000.00	Hồng / Bông đơn
243	26	120000.00	120000.00	Hồng / Bó 3 bông
244	26	120000.00	120000.00	Hồng / Bó 5 bông
245	26	120000.00	120000.00	Trắng / Bông đơn
246	26	120000.00	120000.00	Trắng / Bó 3 bông
247	26	120000.00	120000.00	Trắng / Bó 5 bông
248	26	120000.00	120000.00	Vàng / Bông đơn
249	26	120000.00	120000.00	Vàng / Bó 3 bông
250	26	120000.00	120000.00	Vàng / Bó 5 bông
251	27	100000.00	100000.00	Vàng / Bông đơn
252	27	100000.00	100000.00	Vàng / Bó 3 bông
253	27	100000.00	100000.00	Vàng / Bó 5 bông
254	27	100000.00	100000.00	Trắng / Bông đơn
255	27	100000.00	100000.00	Trắng / Bó 3 bông
256	27	100000.00	100000.00	Trắng / Bó 5 bông
257	27	100000.00	100000.00	Hồng / Bông đơn
258	27	100000.00	100000.00	Hồng / Bó 3 bông
259	27	100000.00	100000.00	Hồng / Bó 5 bông
260	27	100000.00	100000.00	Tím / Bông đơn
261	27	100000.00	100000.00	Tím / Bó 3 bông
262	27	100000.00	100000.00	Tím / Bó 5 bông
263	28	150000.00	150000.00	Hồng / Bông đơn
264	28	150000.00	150000.00	Hồng / Bó 3 bông
265	28	150000.00	150000.00	Hồng / Bó 5 bông
266	28	150000.00	150000.00	Trắng / Bông đơn
267	28	150000.00	150000.00	Trắng / Bó 3 bông
268	28	150000.00	150000.00	Trắng / Bó 5 bông
269	28	150000.00	150000.00	Hồng nhạt / Bông đơn
270	28	150000.00	150000.00	Hồng nhạt / Bó 3 bông
271	28	150000.00	150000.00	Hồng nhạt / Bó 5 bông
272	29	180000.00	180000.00	Vàng / Bó nhỏ (3 bông)
273	29	180000.00	180000.00	Vàng / Bó vừa (5 bông)
274	29	180000.00	180000.00	Vàng / Bó lớn (7 bông)
275	29	180000.00	180000.00	Cam / Bó nhỏ (3 bông)
276	29	180000.00	180000.00	Cam / Bó vừa (5 bông)
277	29	180000.00	180000.00	Cam / Bó lớn (7 bông)
278	29	180000.00	180000.00	Vàng nhạt / Bó nhỏ (3 bông)
279	29	180000.00	180000.00	Vàng nhạt / Bó vừa (5 bông)
280	29	180000.00	180000.00	Vàng nhạt / Bó lớn (7 bông)
281	30	140000.00	140000.00	Hồng / Cành nhỏ
282	30	140000.00	140000.00	Hồng / Cành vừa
283	30	140000.00	140000.00	Hồng / Cành lớn
284	30	140000.00	140000.00	Hồng nhạt / Cành nhỏ
285	30	140000.00	140000.00	Hồng nhạt / Cành vừa
286	30	140000.00	140000.00	Hồng nhạt / Cành lớn
287	30	140000.00	140000.00	Trắng hồng / Cành nhỏ
288	30	140000.00	140000.00	Trắng hồng / Cành vừa
289	30	140000.00	140000.00	Trắng hồng / Cành lớn
290	35	380000.00	380000.00	Xám / Size S
291	35	380000.00	380000.00	Xám / Size M
292	35	380000.00	380000.00	Xám / Size L
293	35	380000.00	380000.00	Xám / Size XL
294	35	380000.00	380000.00	Đen / Size S
295	35	380000.00	380000.00	Đen / Size M
296	35	380000.00	380000.00	Đen / Size L
297	35	380000.00	380000.00	Đen / Size XL
298	35	380000.00	380000.00	Trắng / Size S
299	35	380000.00	380000.00	Trắng / Size M
300	35	380000.00	380000.00	Trắng / Size L
301	35	380000.00	380000.00	Trắng / Size XL
302	35	380000.00	380000.00	Hồng / Size S
303	35	380000.00	380000.00	Hồng / Size M
304	35	380000.00	380000.00	Hồng / Size L
305	35	380000.00	380000.00	Hồng / Size XL
306	36	150000.00	150000.00	Đỏ / Size M
307	36	150000.00	150000.00	Đỏ / Size L
308	36	150000.00	150000.00	Xanh dương / Size M
309	36	150000.00	150000.00	Xanh dương / Size L
310	36	150000.00	150000.00	Đen / Size M
311	36	150000.00	150000.00	Đen / Size L
312	36	150000.00	150000.00	Trắng / Size M
313	36	150000.00	150000.00	Trắng / Size L
314	39	75000.00	75000.00	Nâu / Nhỏ
315	39	75000.00	75000.00	Nâu / Vừa
316	39	75000.00	75000.00	Trắng / Nhỏ
317	39	75000.00	75000.00	Trắng / Vừa
318	39	75000.00	75000.00	Hồng / Nhỏ
319	39	75000.00	75000.00	Hồng / Vừa
320	40	80000.00	80000.00	Vàng / Nhỏ
321	40	80000.00	80000.00	Vàng / Vừa
322	40	80000.00	80000.00	Trắng / Nhỏ
323	40	80000.00	80000.00	Trắng / Vừa
324	40	80000.00	80000.00	Xám / Nhỏ
325	40	80000.00	80000.00	Xám / Vừa
326	40	80000.00	80000.00	Cam / Nhỏ
327	40	80000.00	80000.00	Cam / Vừa
328	43	260000.00	260000.00	Nâu / Nhỏ (20cm)
329	43	260000.00	260000.00	Nâu / Vừa (30cm)
330	43	260000.00	260000.00	Nâu / Lớn (40cm)
331	43	260000.00	260000.00	Trắng / Nhỏ (20cm)
332	43	260000.00	260000.00	Trắng / Vừa (30cm)
333	43	260000.00	260000.00	Trắng / Lớn (40cm)
334	43	260000.00	260000.00	Hồng / Nhỏ (20cm)
335	43	260000.00	260000.00	Hồng / Vừa (30cm)
336	43	260000.00	260000.00	Hồng / Lớn (40cm)
337	44	240000.00	240000.00	Trắng / Nhỏ (20cm)
338	44	240000.00	240000.00	Trắng / Vừa (30cm)
339	44	240000.00	240000.00	Trắng / Lớn (40cm)
340	44	240000.00	240000.00	Hồng / Nhỏ (20cm)
341	44	240000.00	240000.00	Hồng / Vừa (30cm)
342	44	240000.00	240000.00	Hồng / Lớn (40cm)
343	44	240000.00	240000.00	Xám / Nhỏ (20cm)
344	44	240000.00	240000.00	Xám / Vừa (30cm)
345	44	240000.00	240000.00	Xám / Lớn (40cm)
346	47	320000.00	320000.00	Đen / Nhỏ (15L)
347	47	320000.00	320000.00	Đen / Vừa (20L)
348	47	320000.00	320000.00	Đen / Lớn (30L)
349	47	320000.00	320000.00	Be / Nhỏ (15L)
350	47	320000.00	320000.00	Be / Vừa (20L)
351	47	320000.00	320000.00	Be / Lớn (30L)
352	47	320000.00	320000.00	Xanh / Nhỏ (15L)
353	47	320000.00	320000.00	Xanh / Vừa (20L)
354	47	320000.00	320000.00	Xanh / Lớn (30L)
355	47	320000.00	320000.00	Nâu / Nhỏ (15L)
356	47	320000.00	320000.00	Nâu / Vừa (20L)
357	47	320000.00	320000.00	Nâu / Lớn (30L)
358	51	220000.00	220000.00	Đỏ / Nhỏ
359	51	220000.00	220000.00	Đỏ / Vừa
360	51	220000.00	220000.00	Đỏ / Lớn
361	51	220000.00	220000.00	Xanh / Nhỏ
362	51	220000.00	220000.00	Xanh / Vừa
363	51	220000.00	220000.00	Xanh / Lớn
364	51	220000.00	220000.00	Vàng / Nhỏ
365	51	220000.00	220000.00	Vàng / Vừa
366	51	220000.00	220000.00	Vàng / Lớn
367	51	220000.00	220000.00	Đen / Nhỏ
368	51	220000.00	220000.00	Đen / Vừa
369	51	220000.00	220000.00	Đen / Lớn
\.


--
-- TOC entry 5139 (class 0 OID 16548)
-- Dependencies: 222
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, slug, description, category_id, is_active, created_at) FROM stdin;
1	Vòng tay handmade từ hạt gỗ tự nhiên	vong-tay-handmade-tu-hat-go-tu-nhien-1	Vòng tay handmade độc đáo được làm từ hạt gỗ tự nhiên, kết hợp với dây da mềm mại.	1	t	2026-05-08 17:57:01.24154
2	Túi vải handmade thân thiện môi trường	tui-vai-handmade-than-thien-moi-truong-2	Túi vải canvas handmade với thiết kế đơn giản nhưng tinh tế.	4	t	2026-05-08 17:57:01.24154
3	Khăn choàng len handmade	khan-choang-len-handmade-3	Khăn choàng len ấm áp được đan tay với chất liệu len mềm mại.	8	t	2026-05-08 17:57:01.24154
4	Nến thơm handmade từ sáp ong	nen-thom-handmade-tu-sap-ong-4	Nến thơm được làm từ sáp ong tự nhiên, có mùi hương dịu nhẹ.	3	t	2026-05-08 17:57:01.24154
5	Tranh thêu tay hoa sen	tranh-theu-tay-hoa-sen-5	Tranh thêu tay với hình ảnh hoa sen thanh tao.	11	t	2026-05-08 17:57:01.24154
6	Bộ ly sứ vẽ tay	bo-ly-su-ve-tay-6	Bộ 4 ly sứ được vẽ tay với hoa văn độc đáo.	13	t	2026-05-08 17:57:01.24154
7	Ví da handmade	vi-da-handmade-7	Ví da bò thật được làm thủ công, có nhiều ngăn tiện lợi.	1	t	2026-05-08 17:57:01.24154
8	Móc khóa đất sét nung	moc-khoa-dat-set-nung-8	Móc khóa được nặn từ đất sét và nung thủ công.	7	t	2026-05-08 17:57:01.24154
9	Gối tựa lưng thêu hoa	goi-tua-lung-theu-hoa-9	Gối tựa lưng được thêu tay với hoa văn tinh tế.	3	t	2026-05-08 17:57:01.24154
10	Bình hoa gốm sứ handmade	binh-hoa-gom-su-handmade-10	Bình hoa gốm sứ được nung thủ công với hoa văn độc đáo.	3	t	2026-05-08 17:57:01.24154
11	Túi đeo chéo da thật handmade	tui-deo-cheo-da-that-handmade-11	Túi đeo chéo được làm từ da bò thật, thiết kế tối giản và thanh lịch.	12	t	2026-05-08 17:57:01.24154
12	Bộ khăn trải bàn thêu tay	bo-khan-trai-ban-theu-tay-12	Bộ khăn trải bàn được thêu tay với hoa văn truyền thống.	3	t	2026-05-08 17:57:01.24154
13	Đèn ngủ gốm sứ handmade	den-ngu-gom-su-handmade-13	Đèn ngủ được làm từ gốm sứ, ánh sáng dịu nhẹ.	3	t	2026-05-08 17:57:01.24154
14	Bộ bát đĩa gốm handmade	bo-bat-dia-gom-handmade-14	Bộ 6 bát đĩa gốm được nung thủ công, hoa văn độc đáo.	13	t	2026-05-08 17:57:01.24154
15	Túi xách cói đan tay	tui-xach-coi-dan-tay-15	Túi xách được đan từ cói tự nhiên, thiết kế bền chắc.	12	t	2026-05-08 17:57:01.24154
16	Vòng cổ đá tự nhiên handmade	vong-co-da-tu-nhien-handmade-16	Vòng cổ được làm từ đá tự nhiên, mỗi chiếc đều độc đáo.	1	t	2026-05-08 17:57:01.24154
17	Bộ khăn tắm cotton handmade	bo-khan-tam-cotton-handmade-17	Bộ 2 khăn tắm cotton cao cấp, thấm hút tốt và mềm mại.	2	t	2026-05-08 17:57:01.24154
18	Hộp đựng đồ gỗ handmade	hop-dung-do-go-handmade-18	Hộp đựng đồ được làm từ gỗ tự nhiên, thiết kế tối giản.	3	t	2026-05-08 17:57:01.24154
19	Bộ chén trà gốm sứ vẽ tay	bo-chen-tra-gom-su-ve-tay-19	Bộ 6 chén trà được vẽ tay với hoa văn tinh tế.	13	t	2026-05-08 17:57:01.24154
20	Tranh vẽ tay trên vải canvas	tranh-ve-tay-tren-vai-canvas-20	Tranh được vẽ tay trên vải canvas, mỗi bức tranh đều độc đáo.	11	f	2026-05-08 17:57:01.24154
21	Búp bê vải handmade dễ thương	bup-be-vai-handmade-de-thuong-21	Búp bê vải handmade đáng yêu với thiết kế độc đáo.	5	t	2026-05-08 17:57:01.24154
22	Búp bê gấu bông handmade	bup-be-gau-bong-handmade-22	Búp bê gấu bông được làm thủ công từ vải nỉ mềm mại.	5	t	2026-05-08 17:57:01.24154
23	Búp bê công chúa handmade	bup-be-cong-chua-handmade-23	Búp bê công chúa xinh xắn được may thủ công.	5	t	2026-05-08 17:57:01.24154
24	Búp bê thú cưng handmade	bup-be-thu-cung-handmade-24	Búp bê hình thú cưng đáng yêu được làm thủ công.	5	t	2026-05-08 17:57:01.24154
25	Búp bê truyền thống handmade	bup-be-truyen-thong-handmade-25	Búp bê truyền thống với trang phục dân tộc được may thủ công tinh tế.	5	t	2026-05-08 17:57:01.24154
26	Hoa hồng giấy handmade	hoa-hong-giay-handmade-26	Hoa hồng được làm từ giấy nhún cao cấp, bền đẹp.	6	t	2026-05-08 17:57:01.24154
27	Hoa cúc vải handmade	hoa-cuc-vai-handmade-27	Hoa cúc được làm từ vải lụa mềm mại.	6	t	2026-05-08 17:57:01.24154
28	Hoa sen vải handmade	hoa-sen-vai-handmade-28	Hoa sen được làm thủ công từ vải satin cao cấp.	6	t	2026-05-08 17:57:01.24154
29	Bó hoa hướng dương handmade	bo-hoa-huong-duong-handmade-29	Bó hoa hướng dương được làm từ vải và giấy nhún.	6	t	2026-05-08 17:57:01.24154
30	Hoa đào giấy handmade	hoa-dao-giay-handmade-30	Hoa đào được làm từ giấy nhún với màu hồng phấn đẹp mắt.	6	t	2026-05-08 17:57:01.24154
35	Áo len đan tay	ao-len-dan-tay-35	Áo len được đan tay từ len mềm mại, ấm áp.	8	t	2026-05-08 17:57:01.24154
36	Mũ len đan tay	mu-len-dan-tay-36	Mũ len được đan tay với hoa văn độc đáo.	8	t	2026-05-08 17:57:01.24154
39	Móc chìa khóa hình gấu	moc-chia-khoa-hinh-gau-39	Móc chìa khóa hình gấu đáng yêu được làm thủ công.	7	t	2026-05-08 17:57:01.24154
40	Móc chìa khóa hình mèo	moc-chia-khoa-hinh-meo-40	Móc chìa khóa hình mèo dễ thương được làm thủ công.	7	t	2026-05-08 17:57:01.24154
43	Gấu bông handmade	gau-bong-handmade-43	Gấu bông được làm thủ công từ vải nỉ mềm mại.	10	t	2026-05-08 17:57:01.24154
44	Thỏ bông handmade	tho-bong-handmade-44	Thỏ bông được làm thủ công từ vải nỉ cao cấp.	10	t	2026-05-08 17:57:01.24154
47	Túi balo vải canvas handmade	tui-balo-vai-canvas-handmade-47	Túi balo được may thủ công từ vải canvas bền chắc.	12	t	2026-05-08 17:57:01.24154
51	Ví thổ cẩm handmade	vi-tho-cam-handmade-51	Ví được may từ vải thổ cẩm với hoa văn truyền thống.	9	t	2026-05-08 17:57:01.24154
\.


--
-- TOC entry 5147 (class 0 OID 16613)
-- Dependencies: 230
-- Data for Name: user_identities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_identities (id, user_id, provider, provider_user_id, email, access_token, refresh_token, expires_at, created_at) FROM stdin;
1	4	google	102933226537929338898	pvlinh25.2@gmail.com	\N	\N	\N	2026-05-07 17:26:57.045216
2	3	google	116649837649597619435	22130143@st.hcmuaf.edu.vn	\N	\N	\N	2026-05-08 17:17:08.329028
52	2	google	109732546586174919554	flack25.2@gmail.com	\N	\N	\N	2026-05-15 15:06:23.296622
\.


--
-- TOC entry 5156 (class 0 OID 16716)
-- Dependencies: 239
-- Data for Name: user_points; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_points (user_id, total_points, updated_at) FROM stdin;
\.


--
-- TOC entry 5145 (class 0 OID 16598)
-- Dependencies: 228
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password_hash, fullname, created_at, updated_at) FROM stdin;
1	test@gmail.com	$2a$10$x1AwPmYVqvyLlNtLCAXRl.HoJsp7Xu5QIYUACuV5h44zD1oIRmKIq	Test User	2026-05-06 21:14:10.096025	2026-05-06 21:14:10.096025
2	flack25.2@gmail.com	$2a$10$613jyfmSHAmogQLA3mkWm..mVJCqfsU48SJ0do0atvUV6UqjJP/Pu	Phạm Văn Linh	2026-05-07 16:28:42.564381	2026-05-07 16:28:42.564381
3	22130143@st.hcmuaf.edu.vn	$2a$10$HQHIE3fFrMJFj78swTlbq.uYmry2LbeX05O0c26sIzTXTvv7u.iVe	ThomasPham	2026-05-07 16:30:16.938664	2026-05-07 16:30:16.938664
4	pvlinh25.2@gmail.com	\N	Linh Phạm Văn	2026-05-07 17:26:56.998739	2026-05-07 17:26:56.998739
\.


--
-- TOC entry 5153 (class 0 OID 16679)
-- Dependencies: 236
-- Data for Name: wishlist; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wishlist (id, user_id, product_id, created_at) FROM stdin;
\.


--
-- TOC entry 5176 (class 0 OID 0)
-- Dependencies: 219
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 13, true);


--
-- TOC entry 5177 (class 0 OID 0)
-- Dependencies: 237
-- Name: coupons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.coupons_id_seq', 1, false);


--
-- TOC entry 5178 (class 0 OID 0)
-- Dependencies: 233
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_items_id_seq', 1, false);


--
-- TOC entry 5179 (class 0 OID 0)
-- Dependencies: 231
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 1, false);


--
-- TOC entry 5180 (class 0 OID 0)
-- Dependencies: 240
-- Name: point_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.point_history_id_seq', 1, false);


--
-- TOC entry 5181 (class 0 OID 0)
-- Dependencies: 225
-- Name: product_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_images_id_seq', 77, true);


--
-- TOC entry 5182 (class 0 OID 0)
-- Dependencies: 223
-- Name: product_variants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_variants_id_seq', 369, true);


--
-- TOC entry 5183 (class 0 OID 0)
-- Dependencies: 221
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 51, true);


--
-- TOC entry 5184 (class 0 OID 0)
-- Dependencies: 229
-- Name: user_identities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_identities_id_seq', 1, false);


--
-- TOC entry 5185 (class 0 OID 0)
-- Dependencies: 242
-- Name: user_identities_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_identities_seq', 101, true);


--
-- TOC entry 5186 (class 0 OID 0)
-- Dependencies: 227
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- TOC entry 5187 (class 0 OID 0)
-- Dependencies: 235
-- Name: wishlist_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.wishlist_id_seq', 1, false);


--
-- TOC entry 4938 (class 2606 OID 16544)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 4940 (class 2606 OID 16546)
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- TOC entry 4971 (class 2606 OID 16715)
-- Name: coupons coupons_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key UNIQUE (code);


--
-- TOC entry 4973 (class 2606 OID 16713)
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- TOC entry 4965 (class 2606 OID 16667)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4963 (class 2606 OID 16650)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 4977 (class 2606 OID 16739)
-- Name: point_history point_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.point_history
    ADD CONSTRAINT point_history_pkey PRIMARY KEY (id);


--
-- TOC entry 4953 (class 2606 OID 16591)
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- TOC entry 4949 (class 2606 OID 16576)
-- Name: product_variants product_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_pkey PRIMARY KEY (id);


--
-- TOC entry 4944 (class 2606 OID 16560)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 4946 (class 2606 OID 16562)
-- Name: products products_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key UNIQUE (slug);


--
-- TOC entry 4959 (class 2606 OID 16747)
-- Name: user_identities user_identities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_identities
    ADD CONSTRAINT user_identities_pkey PRIMARY KEY (id);


--
-- TOC entry 4961 (class 2606 OID 16757)
-- Name: user_identities user_identities_provider_provider_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_identities
    ADD CONSTRAINT user_identities_provider_provider_user_id_key UNIQUE (provider, provider_user_id);


--
-- TOC entry 4975 (class 2606 OID 16723)
-- Name: user_points user_points_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_points
    ADD CONSTRAINT user_points_pkey PRIMARY KEY (user_id);


--
-- TOC entry 4955 (class 2606 OID 16611)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4957 (class 2606 OID 16774)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4967 (class 2606 OID 16688)
-- Name: wishlist wishlist_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT wishlist_pkey PRIMARY KEY (id);


--
-- TOC entry 4969 (class 2606 OID 16690)
-- Name: wishlist wishlist_user_id_product_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT wishlist_user_id_product_id_key UNIQUE (user_id, product_id);


--
-- TOC entry 4950 (class 1259 OID 16829)
-- Name: idx_product_images_is_main; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_images_is_main ON public.product_images USING btree (variant_id, is_main);


--
-- TOC entry 4951 (class 1259 OID 16828)
-- Name: idx_product_images_variant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_images_variant_id ON public.product_images USING btree (variant_id);


--
-- TOC entry 4947 (class 1259 OID 16827)
-- Name: idx_product_variants_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_variants_product_id ON public.product_variants USING btree (product_id);


--
-- TOC entry 4941 (class 1259 OID 16826)
-- Name: idx_products_category_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_category_id ON public.products USING btree (category_id);


--
-- TOC entry 4942 (class 1259 OID 16825)
-- Name: idx_products_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_is_active ON public.products USING btree (is_active);


--
-- TOC entry 4983 (class 2606 OID 16668)
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 4984 (class 2606 OID 16673)
-- Name: order_items order_items_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id);


--
-- TOC entry 4982 (class 2606 OID 16776)
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 4988 (class 2606 OID 16791)
-- Name: point_history point_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.point_history
    ADD CONSTRAINT point_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4980 (class 2606 OID 16592)
-- Name: product_images product_images_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE CASCADE;


--
-- TOC entry 4979 (class 2606 OID 16577)
-- Name: product_variants product_variants_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 4978 (class 2606 OID 16563)
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- TOC entry 4981 (class 2606 OID 16796)
-- Name: user_identities user_identities_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_identities
    ADD CONSTRAINT user_identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4987 (class 2606 OID 16786)
-- Name: user_points user_points_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_points
    ADD CONSTRAINT user_points_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4985 (class 2606 OID 16696)
-- Name: wishlist wishlist_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT wishlist_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 4986 (class 2606 OID 16781)
-- Name: wishlist wishlist_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT wishlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2026-05-16 15:51:48

--
-- PostgreSQL database dump complete
--

\unrestrict KHqTCJgeHUHox3Qf6Nmqj8U5UqmqgWV5GbzVO9wGlFcTA7ZkmmxfuDwwGpCQlyA

