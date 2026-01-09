# 🎯 TitikTemu — Backend System

TitikTemu adalah sistem backend manajemen event Kampus X yang dibangun menggunakan arsitektur  **microservices** .

Sistem ini memungkinkan mahasiswa melihat dan mendaftar event kampus, sementara panitia dapat membuat event dengan memilih venue dan logistik yang disediakan oleh sistem eksternal.

Fokus utama proyek ini adalah  **pengembangan backend** , dengan frontend dan deployment bersifat  **opsional (bonus)** .

---

## 📌 Fitur Utama

### 👤 Mahasiswa

* Registrasi dan login akun
* Melihat daftar event mendatang
* Mendaftar sebagai peserta event
* Melakukan absensi pada hari acara

### 👨‍💼 Panitia (Admin)

* Login sebagai admin
* Membuat event baru
* Menentukan jadwal event
* Memilih venue dan logistik dari sistem eksternal
* Melihat daftar peserta dan kehadiran

---

## 🧱 Arsitektur Sistem

Sistem TitikTemu dibangun dengan pendekatan **microservices** dan **API Gateway** sebagai satu-satunya pintu masuk sistem.

<pre class="overflow-visible! px-0!" data-start="1222" data-end="1487"><div class="contain-inline-size rounded-2xl corner-superellipse/1.1 relative bg-token-sidebar-surface-primary"><div class="sticky top-[calc(--spacing(9)+var(--header-height))] @w-xl/main:top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre!"><span><span>Client (Postman / Frontend)
        ↓
API Gateway (Express)
        ↓
GraphQL Gateway
        ↓
Microservices (REST)
 ├── Auth Service
 ├── Event Service
 ├── Attendance Service
 └── Venue Consumer Service
        ↓
PostgreSQL (Supabase, schema per service)
</span></span></code></div></div></pre>

---

## 🛠️ Teknologi yang Digunakan

### Backend

* Node.js
* Express.js
* REST API (internal communication)
* GraphQL (integration & API layer)

### Database

* PostgreSQL (Supabase)
* Prisma ORM
* One schema per service

### Security

* JSON Web Token (JWT)
* Role-based access control

### Deployment (Opsional)

* Backend: Railway
* Frontend: Vercel

---

## 🔧 Daftar Microservices

### 1️⃣ Auth Service

Mengelola autentikasi dan otorisasi pengguna.

**Fungsi:**

* Register user
* Login user
* Generate dan validasi JWT

**Endpoint utama:**

<pre class="overflow-visible! px-0!" data-start="2032" data-end="2096"><div class="contain-inline-size rounded-2xl corner-superellipse/1.1 relative bg-token-sidebar-surface-primary"><div class="sticky top-[calc(--spacing(9)+var(--header-height))] @w-xl/main:top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre!"><span><span>POST /auth/register
POST /auth/login
POST /auth/validate
</span></span></code></div></div></pre>

---

### 2️⃣ Event Service

Service inti yang mengelola data event.

**Fungsi:**

* Membuat event (admin)
* Menampilkan daftar event
* Mendaftarkan peserta ke event
* Menyimpan referensi venue eksternal

**Endpoint utama:**

<pre class="overflow-visible! px-0!" data-start="2320" data-end="2379"><div class="contain-inline-size rounded-2xl corner-superellipse/1.1 relative bg-token-sidebar-surface-primary"><div class="sticky top-[calc(--spacing(9)+var(--header-height))] @w-xl/main:top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre!"><span><span>POST /events
GET /events
POST /events/{</span><span>id</span><span>}/register
</span></span></code></div></div></pre>

---

### 3️⃣ Attendance Service

Mengelola data kehadiran peserta event.

**Fungsi:**

* Check-in peserta
* Validasi peserta terdaftar
* Rekap kehadiran event

**Endpoint utama:**

<pre class="overflow-visible! px-0!" data-start="2559" data-end="2619"><div class="contain-inline-size rounded-2xl corner-superellipse/1.1 relative bg-token-sidebar-surface-primary"><div class="sticky top-[calc(--spacing(9)+var(--header-height))] @w-xl/main:top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre!"><span><span>POST /attendance/check-in
GET /attendance/event/{</span><span>id</span><span>}
</span></span></code></div></div></pre>

---

### 4️⃣ Venue Consumer Service

Service integrasi dengan sistem eksternal (LOGe).

**Fungsi:**

* Mengambil data venue dan logistik
* Mengecek ketersediaan
* Mengirim pilihan venue ke Event Service

**Catatan:**

* Tidak menyimpan master data venue
* Berkomunikasi melalui **GraphQL**

---

## 🔗 API Gateway

API Gateway berfungsi sebagai **single entry point** sistem.

**Tanggung jawab:**

* Routing request ke microservice terkait
* Verifikasi JWT
* Middleware keamanan
* Logging dan error handling

**Base path:**

<pre class="overflow-visible! px-0!" data-start="3141" data-end="3155"><div class="contain-inline-size rounded-2xl corner-superellipse/1.1 relative bg-token-sidebar-surface-primary"><div class="sticky top-[calc(--spacing(9)+var(--header-height))] @w-xl/main:top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre!"><span><span>/api/*
</span></span></code></div></div></pre>

Contoh:

<pre class="overflow-visible! px-0!" data-start="3165" data-end="3216"><div class="contain-inline-size rounded-2xl corner-superellipse/1.1 relative bg-token-sidebar-surface-primary"><div class="sticky top-[calc(--spacing(9)+var(--header-height))] @w-xl/main:top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre!"><span><span>/api/auth/*
/api/events/*
/api/attendance/*
</span></span></code></div></div></pre>

---

## 🔷 GraphQL Layer

GraphQL digunakan sebagai:

* API layer utama
* Kontrak data antar service
* Media integrasi antar kelompok

### Peran GraphQL

* Mengonsumsi GraphQL API dari LOGe
* Menyediakan data event untuk sistem lain
* Mengabstraksi REST internal

---

## 🗄️ Strategi Database

* PostgreSQL via Supabase
* Satu schema per service
* Tidak ada shared table antar service
* Komunikasi data melalui API

Contoh schema:

* `auth_schema`
* `event_schema`
* `attendance_schema`

---

## 🚀 Tahapan Pengembangan

1. Setup API Gateway
2. Implementasi Auth Service
3. Implementasi Event Service
4. Implementasi Attendance Service
5. Integrasi Venue Consumer (GraphQL)
6. Dokumentasi dan pengujian

---

## 📦 Deliverables Tugas Besar

### Wajib

* Backend microservices
* API Gateway
* GraphQL integration
* ERD
* Diagram arsitektur
* Dokumentasi sistem

### Bonus

* Frontend
* Deployment cloud
* Demo publik

---

## ✅ Kesimpulan

TitikTemu dirancang sebagai sistem backend modular yang:

* Mudah dikembangkan
* Mudah diintegrasikan
* Sesuai dengan standar arsitektur enterprise
* Memenuhi seluruh kebutuhan tugas besar

---
