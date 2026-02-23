# ChurnGuard: E-Commerce Machine Learning Dashboard

ChurnGuard is a full-stack, end-to-end Machine Learning web application designed to predict customer churn for an e-commerce platform. It features a robust Python/FastAPI backend that trains and serves `scikit-learn` models, and a modern, premium Next.js MLOps dashboard for real-time inference and data visualization.

![Dashboard Preview](frontend/public/dashboard-preview.png) *(Preview placeholder)*

## Features

- **End-to-End ML Pipeline**: Automated preprocessing (OneHotEncoding, StandardScaler) and training of Logistic Regression, Decision Tree, and Random Forest models.
- **RESTful API Backend**: FastAPI implementation for lightning-fast inference (`/api/predict`), pre-calculated model metrics (`/api/metrics`), and Exploratory Data Analysis (`/api/data-insights`).
- **Premium MLOps Dashboard**: Built with Next.js, Tailwind CSS, and Recharts. Features a dark-themed, "matrix" technical design.
- **Advanced Visualizations**: Displays Confusion Matrices, ROC Curves, Prediction Confidence Distributions, and Feature Importances.
- **Real-Time Prediction**: Interactive 23-feature form that communicates with the Random Forest model for instant churn probability scoring.

## Project Structure

```text
machine_learning/
├── backend/                  # FastAPI & scikit-learn ML pipeline
│   ├── main.py               # REST API endpoints
│   ├── ml_model.py           # Data preprocessing and model training script
│   ├── best_model.joblib     # Saved Random Forest model
│   └── metrics.json          # Pre-calculated ML evaluation metrics
├── frontend/                 # Next.js MLOps Web Dashboard
│   ├── app/                  # Next.js App Router pages
│   ├── components/           # Reusable UI components (Sidebar, DashboardClient)
│   └── public/               # Static assets
└── data/                     # Source datasets
    └── DVA_Capstone-G3_Section_C.xlsx
```

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm or yarn

### 1. Backend Setup (FastAPI + scikit-learn)

Navigate to the backend directory and install the required Python packages:

```bash
cd backend
pip install fastapi uvicorn scikit-learn pandas numpy openpyxl joblib
```

**(Optional) Train the models explicitly:**
The backend will automatically try to train the models if they don't exist, but you can run it manually:
```bash
python ml_model.py
```

**Start the FastAPI Server:**
```bash
python -m uvicorn main:app --reload
```
The API will be available at `http://localhost:8000`. You can view the Swagger documentation at `http://localhost:8000/docs`.

### 2. Frontend Setup (Next.js)

Open a new terminal, navigate to the frontend directory, and install dependencies:

```bash
cd frontend
npm install
```

**Start the Development Server:**
```bash
npm run dev
```
The MLOps dashboard will be available at `http://localhost:3000`.

## Model Evaluation

The primary model used for inference is the **Random Forest Classifier**, selected for its superior performance on handling the slightly imbalanced dataset.

- **Accuracy**: 89.3%
- **F1 Score**: 79.4%
- **ROC AUC**: 0.8997

**Top Predictive Features:**
1. Lifetime Value
2. Customer Service Calls
3. Cart Abandonment Rate
4. Days Since Last Purchase
5. Discount Usage Rate

For a full breakdown of the evaluation, please see `report/ML_Project_Report.md`.

## Built With
- **Backend**: Python, FastAPI, scikit-learn, pandas, joblib
- **Frontend**: Next.js (App Router), React, Tailwind CSS, Recharts, Lucide React
- **Design**: Premium MLOps Matrix UI
