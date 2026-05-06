You are an expert full-stack developer. Your task is to generate a complete Ride-Hailing System (Mini Uber) project using React for the frontend and Express.js for the backend.

Project Requirements:

* The system must follow the Requirements Analysis Document outline provided.
* The full outline and structure is already written in a file called @docs.md. You MUST read and follow it strictly when designing the system.

Tech Stack:

* Frontend: React (with functional components and hooks)
* Backend: Node.js with Express
* Database: MongoDB (use Mongoose)
* API: RESTful APIs

Your Tasks:

1. Project Setup

* Create a full project folder structure:

    * /client (React app)
    * /server (Express backend)
* Initialize both projects properly

2. Backend (Express)

* Create models based on the object model:

    * User (base)
    * Rider
    * Driver
    * Ride
    * Vehicle
    * Payment
    * Location

* Implement REST APIs:

    * Auth (register/login)
    * Ride management (request, accept, cancel, complete)
    * Driver availability
    * Payment processing (mock)

* Implement basic business logic:

    * Match rider with nearest available driver (mock logic is fine)
    * Ride lifecycle states: requested, accepted, in_progress, completed, cancelled

3. Frontend (React)

* Create pages:

    * Login/Register
    * Rider Dashboard
    * Driver Dashboard
    * Ride Request Screen
    * Ride Tracking Screen
    * Payment Screen

* Implement:

    * API integration with backend
    * State management using React hooks
    * Simple UI (no need for advanced styling)

4. System Behavior

* Reflect dynamic models:

    * Ride lifecycle state transitions
    * Request → Accept → Start → Complete → Payment

5. File Generation

* Generate ALL necessary files:

    * server.js / app.js
    * routes, controllers, models
    * React components and pages
* Include comments explaining key parts

6. Constraints

* Keep the system simple but functional
* Use mock data where needed (e.g., GPS, payments)
* Do not overcomplicate UI

7. Output Format

* Clearly show:

    * Folder structure
    * Key files with code
    * Instructions to run both frontend and backend

Goal:
Produce a working prototype that reflects the system described in @docs.md and demonstrates:

* Functional requirements
* Object model
* Dynamic behavior

Do not skip steps. Do not summarize. Generate actual code and structure.
