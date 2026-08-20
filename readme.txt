# Purvaja MediQR 🏥📱

Purvaja MediQR is a local LAN-based emergency medical QR code system. Users can sign up, log in, and generate a unique QR code containing their vital medical details. When scanned, the QR code instantly opens a public profile displaying the user's emergency information.

## ✨ Features

- **User Authentication:** Secure signup and login functionality.
- **Personalized Dashboard:** Displays user information and their unique, generated QR code.
- **Emergency Public Profile:** A read-only profile accessible immediately via QR scan.
- **Local Network Access:** Fully functional over a local Wi-Fi network for mobile scanning.
- **Modern UI:** Clean, minimalist black and cream aesthetic for a professional user experience.

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MySQL (using `mysql2` and `express-session`)
- **Security:** `bcrypt` for password hashing, `dotenv` for environment variables
- **Utilities:** `qrcode` for dynamic QR generation

## 📋 Prerequisites

Before running this project, ensure you have the following installed:

- [Node.js & npm](https://nodejs.org/)
- [MySQL Server](https://dev.mysql.com/downloads/)
- A PC and a mobile device connected to the **same Wi-Fi network**.

## 🚀 Database Setup

1. Open your MySQL terminal:

   ```bash
   mysql -u root -p
   ```

2. Create and select the database:

   ```sql
   CREATE DATABASE mediqr;
   USE mediqr;
   ```

3. Create the `users` table:

   ```sql
   CREATE TABLE users (
       id INT AUTO_INCREMENT PRIMARY KEY,
       name VARCHAR(255) NOT NULL,
       email VARCHAR(255) NOT NULL UNIQUE,
       password_hash VARCHAR(255) NOT NULL,
       blood_group VARCHAR(10),
       allergies VARCHAR(255),
       emergency_contact VARCHAR(50),
       public_token VARCHAR(50)
   );
   ```

## 💻 Installation & Usage

1. Clone the repository and navigate into the project folder.

2. Install the required dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your MySQL password:

   ```env
   DB_PASSWORD=your_mysql_password
   ```

4. Start the server:

   ```bash
   npm start
   ```

   > **Tip:** On Windows, you can also use `start_project.bat` to automatically install dependencies and launch the server.

5. Open your browser and navigate to:

   ```text
   http://localhost:3000/signup.html
   ```

## 📱 Accessing from a Mobile Device (LAN)

1. Ensure your phone and PC are connected to the **same Wi-Fi network**.
2. Find your PC's local IP address from the terminal output (for example, `192.168.1.42`).
3. Open your phone's browser and visit:

   ```text
   http://YOUR_LOCAL_IP:3000/login.html
   ```

4. Log in or scan the QR code from the dashboard to instantly view the user's public emergency profile.

## 💡 Development Notes

- Stop the server by pressing **Ctrl + C** in the terminal.
- To reset users, delete the records from the `users` table in MySQL.
- Allow traffic through **port 3000** in your computer's firewall for LAN access.
- The project is optimized for **local network deployment**, making emergency medical information instantly accessible through QR code scanning.
