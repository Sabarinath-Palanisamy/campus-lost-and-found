# 🎓 Campus Lost & Found Platform

A secure, full-stack web application designed for university campuses to streamline reporting, searching, and safely recovering lost or found belongings. Built with enterprise-grade state management, secure session cookies, real-time peer messaging, and location-sharing workflows.

---

## 🛠️️ Tech Stack

* **Frontend**: React, Tailwind CSS, Lucide Icons, Context API (`AppStateProvider`)
* **Backend**: Spring Boot, Spring Data JPA, Hibernate
* **Database**: PostgreSQL
* **Security**: BCrypt Password Hashing, Opaque UUID Session Tokens (`HttpOnly` Cookies)

---

## ✨ Key Features

* **Secure Authentication**: Multi-mode authentication supporting password login, OTP verification, and two-step sign-up validation. Sessions are secured via non-extractable `HttpOnly` UUID cookies.
* **Item Management & Rich Media**: Users can report lost or found items categorized by type. Images are converted to permanent Base64 strings and supporting a multi-image carousel view.
* **Ownership & Access Control**: Strict backend and frontend guard clauses ensure users can only edit or delete their own listings.
* **Real-time Peer Messaging & Chat Inbox**: Dedicated messaging inbox allowing users to communicate securely regarding specific listings with persistent chat history.
* **Two-Way Return Handshake**: Built-in workflow allowing users to initiate a product return ("Pending Return" status `PR`) and the other party to acknowledge it, resolving the listing status to Resolved (`RE`).
* **Location Sharing**: Integrated geolocation helper allowing users to share coordinates directly in the chat to coordinate item handoffs safely.

---

## 🏛️ Database Architecture

The system utilizes robust relational database models backed by standard legacy audit columns (`isactive`, `created_on`, `created_by`, `updated_on`, `updated_by`) and human-readable `searchkey` identifiers for efficient testing and data retrieval.

| Table Name | Description |
| :--- | :--- |
| `users` | Stores user profiles, hashed credentials, contact info, and secure session tokens. |
| `categories` | Categorization lookup table for campus items (Electronics, Keys, Wallets, etc.). |
| `items` | Core listings table tracking item type (`L`/`F`), status (`OP`/`PR`/`RE`), and location details. |
| `item_images` | Stores permanent Base64 image representations tied to item listings. |
| `chat_messages` | Manages peer conversations, message types (`TEXT`, `LOCATION`, `SYSTEM`), and audit metadata. |

---

## 🚀 Getting Started & Installation

### Prerequisites
* Java 17+ / Maven
* Node.js & npm
* PostgreSQL Server

### 1. Database Setup
Create a PostgreSQL database and ensure your application properties match your local credentials. Run the initial schema migration scripts or let Hibernate auto-update the schema.

### 2. Backend Setup (Spring Boot)
```bash
cd backend
# Run using Maven wrapper
./mvnw spring-boot:run
