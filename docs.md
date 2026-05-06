# Requirements Analysis Document

## Mini Uber

---

# **1. Introduction**

The Ride-Hailing System is a software platform designed to connect riders and drivers efficiently. It enables users to request rides, track drivers in real time, and complete payments digitally.

The purpose of this system is to improve transportation accessibility, reduce waiting time, and provide a secure and transparent ride experience.

---

# **2. Current System**

Currently, transportation is handled through:

* Street hailing taxis
* Phone-based booking
* Informal driver arrangements

### Problems:

* No real-time tracking
* Unpredictable pricing
* Safety concerns
* Inefficient driver allocation
* Lack of digital payment integration

---

# **3. Proposed System**

The proposed system is a mobile/web-based ride-hailing platform that automates ride booking, driver matching, and payment.

---

## **3.1 Overview**

The system allows:

* Riders to request rides
* Drivers to accept/reject requests
* Real-time tracking of trips
* Automated fare calculation and payment

---

## **3.2 Functional Requirements**

### Rider:

* Register and login
* Request a ride
* View fare estimate
* Track driver location
* Cancel ride
* Make payment
* Rate driver

### Driver:

* Register and login
* Accept/reject ride requests
* Update availability status
* View ride details
* Complete ride

### Admin:

* Manage users (drivers & riders)
* Monitor rides
* Handle complaints

---

## **3.3 Nonfunctional Requirements**

* **Performance:** System should match riders with drivers within 5 seconds
* **Reliability:** System should be available 24/7
* **Security:** User data must be encrypted
* **Usability:** Interface must be user-friendly
* **Scalability:** System should handle increasing users

---

## **3.4 Constraints (“Pseudo Requirements”)**

* Requires stable internet connection
* Depends on GPS accuracy
* Payment system integration required
* Limited by mobile device performance

---

# **3.5 System Models**

---

## **3.5.1 Scenarios**

### As-Is Scenario

A rider searches for transport manually, negotiates price, and has no tracking or safety guarantee.

### Visionary Scenario

A rider opens the app, requests a ride, gets matched instantly, tracks the trip, and pays digitally.

---

## **3.5.2 Use Case Model**

### Actors:

* Rider
* Driver
* Admin
* Payment System

### Use Cases:

* Register/Login
* Request Ride
* Accept Ride
* Cancel Ride
* Track Ride
* Make Payment
* Rate Driver
* Manage Users

---

## **3.5.3 Object Model**

### Main Classes:

* User
* Rider
* Driver
* Ride
* Vehicle
* Payment
* Location

---

### **3.5.3.1 Data Dictionary**

| Class    | Attribute   | Description        |
| -------- | ----------- | ------------------ |
| Rider    | riderID     | Unique identifier  |
| Rider    | name        | Rider name         |
| Driver   | driverID    | Unique identifier  |
| Driver   | status      | Availability       |
| Ride     | rideID      | Unique ride ID     |
| Ride     | status      | Current ride state |
| Payment  | paymentID   | Payment identifier |
| Location | coordinates | GPS position       |

---

### **3.5.3.2 Class Diagrams (Description)**

* Rider → requests → Ride (1 to many)
* Driver → accepts → Ride (1 to many)
* Ride → has → Payment (1 to 1)
* Driver → uses → Vehicle

Classes include attributes and operations such as:

* requestRide()
* acceptRide()
* cancelRide()
* processPayment()

---

## **3.5.4 Dynamic Models**

### State Diagram (Ride)

States:

* Requested
* Accepted
* In Progress
* Completed
* Cancelled

---

### Sequence Diagram (Ride Request)

1. Rider sends request
2. System processes request
3. Driver receives request
4. Driver accepts
5. System confirms ride

---

### Activity Diagram

* Enter pickup location
* Enter destination
* Match driver
* Start ride
* End ride
* Process payment

---

## **3.5.5 User Interface**

### Screens:

* Login/Register
* Home screen (map + request ride)
* Driver dashboard
* Ride tracking screen
* Payment screen

### Navigation:

Login → Home → Request Ride → Track Ride → Payment → Rating

---

# **4. Glossary**

| Term    | Meaning                         |
| ------- | ------------------------------- |
| Rider   | User requesting a ride          |
| Driver  | Person providing ride service   |
| Ride    | Trip from pickup to destination |
| Payment | Transaction for the ride        |
| GPS     | Location tracking system        |
