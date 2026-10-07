# Business Management System

## Project Description

Business Management System is a web-based application developed to manage business operations such as customer management, product management, sales, billing, invoices, and returns.

The application follows a team-based architecture where different modules are developed and integrated through REST APIs.

## Technologies Used

Frontend:
- React.js
- Vite
- JavaScript
- HTML5
- CSS3
- Axios

Backend:
- Node.js
- Express.js
- REST APIs
- JWT Authentication
- Middleware

Database:
- MongoDB
- Mongoose

Development Tools:
- Git
- GitHub
- Postman
- Visual Studio Code
- npm

## How to Run the Project

### Backend

Open a terminal and navigate to the server folder:

cd server

Install dependencies:

npm install

Create a `.env` file inside the server folder:

PORT=5003
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173

Start the backend:

npm run dev

Backend URL:

http://localhost:5003

### Frontend

Open another terminal and navigate to the client folder:

cd client

Install dependencies:

npm install

Start the frontend:

npm run dev

Frontend URL:

http://localhost:5173

Open the frontend URL in the browser.

## Application Workflow

User Login
↓
Team 1 Authentication
↓
JWT Token
↓
Customer Data
↓
Customer ID
↓
Product Data
↓
Product ID + Available Stock
↓
Create Sale
↓
Sale ID
↓
Invoice / Billing
↓
Return
↓
Return Validation
↓
Stock Update
↓
Return Record

## Authentication Workflow

The application uses JWT-based authentication.

1. User logs into the application.
2. Authentication API verifies the user credentials.
3. JWT token is generated.
4. Frontend stores the JWT token.
5. Token is sent with authenticated API requests.
6. Backend middleware verifies the JWT token.
7. If the token is valid, the request is processed.
8. If the token is invalid or expired, the request is rejected.

Authentication Flow:

User Login
↓
Authentication API
↓
JWT Token
↓
Frontend
↓
Authenticated API Request
↓
JWT Verification
↓
Backend Controller

## Customer Workflow

Customer information is obtained through the Customer API.

The user selects a customer while creating a sale.

Customer Data
↓
Customer ID
↓
Sales API

The Customer ID is stored with the sale information.

## Product Workflow

Product information is obtained through the Product API.

The Sales module uses:

- Product ID
- Product Name
- Selling Price
- Available Stock

Product Data
↓
Product ID
↓
Available Stock
↓
Sales API

## Sales Workflow

The Sales module is responsible for creating sales transactions.

The user selects:

- Customer
- Product
- Quantity
- Price
- Discount
- Tax
- Payment Method
- Payment Status

The frontend sends the sale information to the Sales API.

Customer ID
+
Product ID
+
Quantity
+
Price
+
Discount
+
Tax
+
Payment Details
↓
Sales API
↓
Sale Created
↓
Sale ID

The generated Sale ID is used for further invoice and return operations.

## Stock and Quantity Workflow

Product stock represents the currently available quantity of a product.

Example:

Available Stock = 20
Sold Quantity = 3
Remaining Stock = 17

The sale stores the quantity purchased in that particular transaction.

Product ID = P001
Sale Quantity = 3

The available product stock is updated separately.

For the next customer, the available stock will be 17 and the new sale quantity will be entered separately.

If the available stock is zero, the product is treated as Out of Stock.

The system also validates that the requested sale quantity does not exceed the available stock.

## Invoice / Billing Workflow

After a successful sale, a Sale ID is generated.

The Sale ID is used for invoice and billing operations.

Sale
↓
Sale ID
↓
Invoice
↓
Billing Information

The invoice is associated with the corresponding sale.

## Return Workflow

The Returns module uses the Sale ID and Product ID to process a return.

The return request contains:

- Sale ID
- Product ID
- Returned Quantity
- Return Reason

The backend validates the return before creating the return record.

Return validation includes:

1. Validate the Sale ID.
2. Check whether the sale exists.
3. Check whether the selected product belongs to the sale.
4. Check the originally purchased quantity.
5. Check the previously returned quantity.
6. Calculate the remaining returnable quantity.
7. Prevent returning more quantity than the remaining quantity.
8. Update the product stock after a valid return.
9. Create the return record.

Example:

Purchased Quantity = 5
Already Returned = 2
Remaining Quantity = 3

If the user tries to return more than 3 units, the return is rejected.

Valid Return
↓
Stock Increased
↓
Return Record Created

## Team Integration Workflow

Team 1
Authentication
↓
JWT Token
↓
Team 3
Customer Data
↓
Customer ID
↓
Team 2
Product Data + Stock
↓
Product ID
↓
Team 4
Sales
↓
Sale ID
↓
Invoice / Billing
↓
Returns
↓
Return Validation
↓
Stock Update

## ID Relationship

Customer ID → Sale

Product ID → Sale Item

Sale ID → Invoice

Sale ID + Product ID → Return

Customer ID identifies the customer associated with a sale.

Product ID identifies the product included in a sale.

Sale ID identifies the particular sales transaction.

Sale ID and Product ID are used together for return validation.

## API Communication

Axios is used in the frontend to communicate with the backend REST APIs.

API communication is maintained through service files.

client/src/services/

sales.js
invoice.js
return.js

This keeps API communication separate from the UI components.

## Team 4 API Endpoints

Sales API:

http://localhost:5003/api/sales

Invoice API:

http://localhost:5003/api/invoices

Return API:

http://localhost:5003/api/returns

## Database

MongoDB is used as the database.

Mongoose is used for database interaction and schema management.

The application uses MongoDB ObjectIds to identify and connect related records.

Main business data includes:

- Users
- Customers
- Products
- Sales
- Invoices
- Returns

## Testing

The APIs can be tested using Postman.

The following functionalities should be tested:

- User Login
- JWT Authentication
- Customer Data
- Product Data
- Sales Creation
- Invoice Operations
- Return Validation
- Stock Updates
- Invalid Quantity Validation
- Authentication Validation

## Complete End-to-End Workflow

Login
↓
JWT Authentication
↓
Customer Data
↓
Customer ID
↓
Product Data
↓
Product ID + Available Stock
↓
Select Customer
↓
Select Product
↓
Check Available Stock
↓
Enter Sale Quantity
↓
Create Sale
↓
Generate Sale ID
↓
Create/View Invoice
↓
Process Return
↓
Validate Sale ID + Product ID
↓
Validate Return Quantity
↓
Update Stock
↓
Create Return Record

## Team 4 Responsibilities

Team 4 is responsible for:

- Sales Management
- Sales API
- Billing
- Invoice Management
- Invoice API
- Return Management
- Return API
- Sales Validation
- Return Validation
- Stock-related Sales Workflow
- Stock-related Return Workflow
- Integration with Customer Data
- Integration with Product Data

## Project Execution

Backend:

cd server
npm install
npm run dev

Backend URL:

http://localhost:5003

Frontend:

cd client
npm install
npm run dev

Frontend URL:

http://localhost:5173

Make sure MongoDB is running and the backend `.env` configuration is correctly configured.

## Final Application Flow

User
↓
Login
↓
JWT Authentication
↓
Customer Selection
↓
Product Selection
↓
Stock Verification
↓
Create Sale
↓
Sale ID
↓
Invoice / Billing
↓
Return Request
↓
Sale ID + Product ID Validation
↓
Return Quantity Validation
↓
Stock Update
↓
Return Record

The Business Management System provides an integrated workflow for managing customers, products, sales, billing, invoices, and returns through REST APIs.