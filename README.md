# Expense Daily Management System

A full-stack web application for tracking and managing daily expenses with user authentication and data visualization.

## 🚀 Features

- **User Authentication**: Secure login and registration system
- **Expense Tracking**: Add, edit, and delete expenses
- **Categories**: Categorize expenses for better organization
- **Dashboard**: Visual overview of spending patterns
- **Reports**: Generate and export expense reports
- **Responsive Design**: Works on desktop and mobile devices

## 🛠 Tech Stack

### Frontend (Client)

- React.js
- Vite (Build tool)
- Tailwind CSS (Styling)
- Axios (HTTP client)
- React Router (Navigation)
- Chart.js (Data visualization)

### Backend (Server)

- Python
- FastAPI (Web framework)
- SQLAlchemy (ORM)
- MongoDB Atlas
- JWT (Authentication)
- Pydantic (Data validation)

## 📦 Prerequisites

- Node.js (v16 or higher)
- Python (3.9 or higher)
- pip (Python package manager)
- npm or yarn

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/vihao1802/expense-web-app.git
cd expense-daily-managemnet
```

### 2. Backend Setup

1. Navigate to the server directory:

   ```bash
   cd server
   ```

2. Create a virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   Create a `.env` file in the server directory with the following variables:

   ```env
   DATABASE_URL=sqlite:///./expense_tracker.db
   SECRET_KEY=your-secret-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

5. Run database migrations:

   ```bash
   alembic upgrade head
   ```

6. Start the server:
   ```bash
   uvicorn main:app --reload
   ```
   The API will be available at `http://localhost:8000`

### 3. Frontend Setup

1. Navigate to the client directory:

   ```bash
   cd ../client
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The application will be available at `http://localhost:3000`

## 📂 Project Structure

```
.
├── client/                 # Frontend React application
│   ├── public/            # Static files
│   └── src/               # React source code
│       ├── components/    # Reusable UI components
│       ├── pages/         # Page components
│       ├── services/      # API services
│       ├── utils/         # Utility functions
│       └── App.jsx        # Main App component
│
└── server/               # Backend FastAPI application
    ├── configs/          # Configuration files
    ├── middleware/       # Custom middleware
    ├── models/           # Database models
    ├── routers/          # API routes
    ├── uploads/          # File uploads
    ├── utils/            # Utility functions
    └── main.py           # Application entry point
```

## 🌐 API Documentation

Once the server is running, you can access the interactive API documentation at:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🛡️ Security

- All passwords are hashed using bcrypt
- JWT tokens for authentication
- Environment variables for sensitive configuration
- Input validation on both client and server
- CORS enabled for development

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

Vinhao

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
