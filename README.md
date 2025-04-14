# Renewable Energy Data Visualization with User Authentication

This project is a web-based application designed to visualize renewable energy data while incorporating user authentication for secure access. The application allows users to explore various datasets related to renewable energy sources, analyze trends, and gain insights into energy consumption and production.

## Features

- **User Authentication**: Secure login and registration system with JWT-based authentication
- **Data Visualization**: Interactive charts and graphs using Chart.js for renewable energy data visualization
- **Responsive Design**: Modern UI with Tailwind CSS, optimized for all devices
- **Dark/Light Mode**: Theme support for better user experience
- **Real-time Updates**: Dynamic data updates without page refresh
- **Data Export**: Download visualized data in various formats
- **Docker Support**: Easy deployment with Docker containers

## Technologies Used

### Frontend
- **Framework**: Next.js 15.2.4
- **UI Library**: React 19.0.0
- **Styling**: Tailwind CSS
- **Visualization**: Chart.js 4.4.8 with react-chartjs-2
- **Theme Support**: next-themes
- **Icons**: react-icons
- **TypeScript**: For type safety

### Backend
- **Framework**: FastAPI 0.115.12
- **Database**: SQLAlchemy 1.4.47
- **Authentication**: 
  - JWT (python-jose)
  - Bcrypt for password hashing
  - Passlib for password management
- **API Server**: Uvicorn 0.22.0

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/NirmitAgrawal02/Renewable-Energy-Data-Visualization-with-User-Authentication.git
    ```
2. Navigate to the project directory:
    ```bash
    cd Renewable-Energy-Data-Visualization-with-User-Authentication
    ```

### Using Docker (Recommended)

1. Make sure Docker and Docker Compose are installed on your system
2. Run the following command:
    ```bash
    docker-compose up --build
    ```
    This will start both frontend and backend services.

### Manual Setup

#### Backend Setup

1. Navigate to the `backend/app` directory:
    ```bash
    cd backend/app
    ```
2. Create a virtual environment and activate it:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3. Install the required Python packages:
    ```bash
    pip install -r requirements.txt
    ```
4. Run the backend server:
    ```bash
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
    ```
    The backend will be available at `http://localhost:8000`.

#### Frontend Setup

1. Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2. Install the required Node.js packages:
    ```bash
    npm install
    ```
3. Start the development server:
    ```bash
    npm run dev
    ```
    The frontend will be available at `http://localhost:3000`.

## Environment Variables

### Backend
Create a `.env` file in the `backend/app` directory with:
```
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend
Create a `.env.local` file in the `frontend` directory with:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Usage

1. Register for an account or log in with existing credentials
2. Browse available renewable energy datasets
3. Use the interactive charts to visualize data
4. Toggle between dark and light themes
5. Export visualizations as needed

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch:
    ```bash
    git checkout -b feature-name
    ```
3. Make your changes and commit them:
    ```bash
    git commit -m "Add feature-name"
    ```
4. Push to the branch:
    ```bash
    git push origin feature-name
    ```
5. Open a pull request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Open-source libraries and frameworks used in the project.
- Inspiration from renewable energy initiatives worldwide.
- Support from the developer community.

## Contact

For questions or feedback, please contact [nirmit@myjobemails.com].
