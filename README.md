# 🧩 Identity Reconciliation API

A backend service that performs **Identity Reconciliation** by linking customer contacts based on shared email addresses and phone numbers.

This project consolidates multiple records that belong to the same user and maintains a structured relationship between primary and secondary contacts.

---

## 📌 Project Overview

In real-world systems, a single user may register multiple times using:

- Different email addresses
- Different phone numbers
- Or combinations of both

This service intelligently:

- Detects related contacts
- Links them under one primary identity
- Maintains primary–secondary relationships
- Returns a consolidated response with unique emails and phone numbers

The system ensures data consistency and prevents duplicate identities.

---


---

## 🛠 Technology Stack

- **Node.js** – Runtime environment
- **Express.js** – Backend framework
- **TypeScript** – Type safety
- **Prisma ORM** – Database ORM
- **PostgreSQL (Railway)** – Cloud database
- **Render** – Deployment platform

---

## 📂 API Endpoint

### POST `/identify`

### Request Body (JSON)

json
{
  "email": "user@example.com",
  "phoneNumber": "1234567890"
}
## Request Format

---

## 🛠 Technology Stack

- **Node.js** – Runtime environment
- **Express.js** – Backend framework
- **TypeScript** – Type safety
- **Prisma ORM** – Database ORM
- **PostgreSQL (Railway)** – Cloud database
- **Render** – Deployment platform

---

## 📂 API Endpoint

### POST `/identify`

### Request Body (JSON)

json
{
  "email": "user@example.com",
  "phoneNumber": "1234567890"
}

How It Works :

1)Checks if the email or phone number already exists.

2)If no match → creates a new primary contact.

3)If match exists → retrieves all related contacts.

4)Ensures only one oldest contact remains primary.

5)Links other contacts as secondary.

6)Adds new information if provided.

7)Returns consolidated identity data.

**SERVER WILL RUN AT : http://localhost:3000


