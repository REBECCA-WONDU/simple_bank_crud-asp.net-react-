# Abay Bank - Simple CRUD Banking System

A modern, full-stack banking application built with **ASP.NET Core** and **React**. Rebranded as **Abay Bank**, the application features a premium user interface and advanced banking functionalities.

## 🚀 Features

### **Customer Portal**
- **Secure Login**: Access your account via registered phone number.
- **Real-time Balance**: View your current balance in ETB (Ethiopian Birr).
- **Deposit & Withdraw**: Manage your funds with instant balance updates.
- **Refined P2P Transfers**: 
    - Send money using a receiver's **Phone Number**.
    - **Real-time Name Lookup**: Preview the receiver's name for verification before sending.
- **Transaction History**: Track all activities with a chronological history (latest transactions at the top).

### **Banker Portal**
- **Customer Management**: Create, update, and delete customer accounts.
- **Global View**: Monitor balances and statistics across all customers.
- **Branding**: Fully integrated Abay Bank identity with official logo and "SOURCE OF GREATNESS" tagline.

## 🛠️ Technology Stack

- **Backend**: ASP.NET Core 8.0, Entity Framework Core, SQL Server (LocalDB).
- **Frontend**: React 18, TypeScript, Vite, Ant Design (UI Library), Tailwind CSS.
- **Architecture**: Layered design (API -> Application -> Domain -> Infrastructure).

## 📥 Getting Started

### **Prerequisites**
- .NET 8.0 SDK
- Node.js & npm

### **Running the Backend**
1. Navigate to the root directory.
2. Run the API:
   ```bash
   dotnet run --project Bank.API
   ```

### **Running the Frontend**
1. Navigate to the `client` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## 📐 Project Structure
- `Bank.API`: Controller layer handling HTTP requests.
- `Bank.Application`: Service layer containing business logic (Deposit, Transfer, etc.).
- `Bank.Domain`: Contains core entities (Customer, Account, Transaction).
- `Bank.Infrastructure`: Handles database context and repository implementations.
- `client`: The React frontend application.

---
**Abay Bank - Source of Greatness**
