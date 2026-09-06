# Steam Clone Backend

A backend for a Steam-like game distribution platform built with **Node.js, Express, MongoDB, and Mongoose**.

The project focuses on practical backend concepts including **authentication, transactions, product querying, orders, reviews, social features, external API integration, email workflows, and Docker**.

---

## Features

*  JWT authentication with bcrypt
*  Email verification and password reset
*  User profiles, avatars, cart, wishlist, and library
*  Games, DLCs, bundles, and products
*  Product search, filtering, sorting, and pagination
*  Orders and activation-code generation
*  Promo codes and discounts
*  Reviews and rating aggregation
*  Friends and gifts
*  IGDB integration
*  Image uploads with Multer
*  Email delivery with Resend
*  Request logging and centralized error handling
*  Docker support

---

## Tech Stack

| Category             | Technologies      |
| -------------------- | ----------------- |
| **Backend**          | Node.js, Express  |
| **Database**         | MongoDB, Mongoose |
| **Authentication**   | JWT, bcrypt       |
| **Validation**       | express-validator |
| **Images**           | Multer, Sharp     |
| **Email**            | Resend            |
| **External API**     | IGDB              |
| **Logging**          | Winston, Morgan   |
| **Containerization** | Docker            |

---

## Running Locally

Install the dependencies:

```bash
npm install
```
Start the application:

```bash
npm start
```
Configure the required environment variables before starting the application.

---

## 🐳 Docker

Docker image:

```bash
docker pull ahmedessam05/steam-clone:1.0
```

Run the container:

```bash
docker run -p 3000:3000 --env-file .env -v <VolumeName>:/app/uploads ahmedessam05/steam-clone:1.0
```

> The application still requires its external services, such as MongoDB, Resend, and IGDB.

---

## API

| Route     | Purpose                                               |
| :-------- | :---------------------------------------------------- |
| `/auth`   | Authentication and account verification               |
| `/user`   | Profiles, cart, wishlist, library, friends, and gifts |
| `/store`  | Product browsing and details                          |
| `/order`  | Orders                                                |
| `/review` | Reviews and ratings                                   |
| `/promo`  | Promo codes                                           |
| `/admin`  | Game, product, and order management                   |

---

## Upcoming Features

* **Friends Chat System** — real-time messaging between friends
* **Notifications** — notifications for friend requests, gifts, messages, and other events
* **User Reviews & Activity Feed** — richer social interactions around games

---
