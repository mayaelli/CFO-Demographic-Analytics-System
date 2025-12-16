# 📊 CFO Analytics Dashboard

> A comprehensive data visualization and forecasting system designed to analyze demographic profiles and predict civil status trends using Machine Learning.

![Project Status](https://img.shields.io/badge/Status-Completed-success)
![Tech Stack](https://img.shields.io/badge/Stack-React_|_Tailwind_|_Recharts_|_Firebase_|_TensorFlow.js-blue)

## 📖 Overview

This project is an analytics dashboard built to visualize complex demographic data and forecast future trends. The system was designed to make historical data instantly understandable through intuitive visualizations, minimizing the need for complex explanations during presentations.

It features interactive charts for demographic profiling, utilizes **Firebase** for real-time data management, and integrates a **Multi-Layer Perceptron (MLP)** neural network to predict future Civil Status distribution.

## ✨ Key Features

### 1. Demographic Profile Shape (Radar Chart)

- **Visualizes Population Distribution:** Maps the density of population across various age groups.
- **Custom Styling:** Uses an Amber/Gold thematic design to clearly highlight demographic bulges and outliers.
- **Interactive Elements:** Dynamic tooltips provide precise data values on hover.

### 2. MLP Predictive Analytics (Civil Status)

- **Neural Network Integration:** Utilizes a Multi-Layer Perceptron (MLP) model to analyze historical records.
- **Targeted Forecasting:** Specifically trained to predict trends in **Civil Status** (Single, Married, Widowed, etc.) over upcoming years.
- **Trend Visualization:** Displays predicted growth or decline in specific civil status categories to aid in future planning.

### 3. User Experience & Design

- **Responsive Interface:** Built with **Tailwind CSS**, ensuring a seamless experience across desktop and tablet screens.
- **Scannable Layouts:** Data is organized into clear hierarchies, allowing users to grasp insights at a glance without "chart fatigue."

## 🛠️ Tech Stack

- **Frontend Framework:** [React.js](https://reactjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Visualization:** [Recharts](https://recharts.org/)
- **Backend / Database:** [Firebase](https://firebase.google.com/) (Auth, Firestore, Hosting)
- **Machine Learning:** [TensorFlow.js](https://www.tensorflow.org/js)
- **Icons:** [Lucide React]

## 🚀 Getting Started

Follow these steps to run the project locally.

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1.  **Clone the repository**

    ```bash
    git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
    cd your-repo-name
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Start the development server**

    ```bash
    npm run dev
    ```

4.  Open your browser and navigate to `http://localhost:5173`.

## 📂 Project Structure

```text
src/
├── api/             # API services (Firebase configuration & fetchers)
├── components/      # Reusable UI elements
│   ├── charts/      # Recharts visualizations (Radar, Line, etc.)
│   └── forecast/    # Prediction specific components
├── context/         # React Context (Auth & Global state)
├── hooks/           # Custom React Hooks
├── routes/          # Application routing configuration
└── utils/           # Helper functions and formatters

🤝 Contributing
This project was developed for ITD112 (Data Visualization Techniques) Course. If you have suggestions for optimization, feel free to open an issue.

```
