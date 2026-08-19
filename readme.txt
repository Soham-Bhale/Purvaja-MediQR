Purvaja MediQR

Purvaja MediQR is a local LAN-based emergency medical QR code system. Users can sign up, log in, and get a unique QR code containing their medical details. When scanned, it opens a public profile with emergency info.

Features:

* User Signup & Login
* Dashboard displaying user info and QR code
* Public profile accessible via QR scan
* Works locally on LAN
* Modular & clean Node.js + MySQL backend
* Static frontend (HTML/CSS/JS)

Project Structure:

* server.js
* package.json
* start\_project.bat
* public/

  * signup.html
  * login.html
  * index.html
  * css/

Prerequisites:

* Node.js & npm installed
* MySQL installed
* PC and mobile on same Wi-Fi for LAN access

Database Setup:

1. Open MySQL:
   mysql -u root -p
2. Create database:
   CREATE DATABASE purvaja\_mediqr;
   USE purvaja\_mediqr;
3. Create users table:
   CREATE TABLE users (
   id INT AUTO\_INCREMENT PRIMARY KEY,
   name VARCHAR(255) NOT NULL,
   email VARCHAR(255) NOT NULL UNIQUE,
   password\_hash VARCHAR(255) NOT NULL,
   blood\_group VARCHAR(10),
   allergies VARCHAR(255),
   emergency\_contact VARCHAR(50),
   public\_token VARCHAR(50)
   );

How to Run:

1. Open the project folder.
2. Double-click start\_project.bat

   * Installs dependencies if missing
   * Starts server on port 3000
3. Open browser:
   [http://localhost:3000/signup.html](http://localhost:3000/signup.html)
4. Create account → redirected to dashboard → QR code visible.

Access from Phone (LAN):

1. Phone on same Wi-Fi as PC.
2. Note local IP from terminal (example: 192.168.1.42).
3. Open browser on phone: [http://192.168.1.42:3000/signup.html](http://192.168.1.42:3000/signup.html)
4. Scan dashboard QR → opens public profile.

Notes:

* To stop server: Ctrl + C in terminal
* To reset users: delete entries from users table in MySQL
* QR automatically encodes user’s public profile URL

Tips:

* Use unique email for signup
* Use npx nodemon server.js for auto-reload during development
* Firewall must allow port 3000 for LAN access
