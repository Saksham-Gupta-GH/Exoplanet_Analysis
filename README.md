# Exoplanet Habitability Analysis & Discovery Dashboard

[![Vercel Deployment](https://img.shields.io/badge/Deployment-Vercel-black?style=flat-square&logo=vercel)](https://exoplanet-analysis.vercel.app/)
[![NASA Exoplanet Archive](https://img.shields.io/badge/Data-NASA_Exoplanet_Archive-blue?style=flat-square)](https://exoplanetarchive.ipac.caltech.edu/)
[![Python 3.9+](https://img.shields.io/badge/Python-3.9+-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/Frontend-React_/_Vite-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)

A comprehensive data mining project and interactive dashboard designed to identify and analyze potentially habitable exoplanets using data from the NASA Exoplanet Archive.

**Live Demo:** [exoplanet-analysis.vercel.app](https://exoplanet-analysis.vercel.app/)

---

## 🔬 Data Mining & Research
This project is primarily a scientific exploration into exoplanet habitability using machine learning and statistical analysis.

### Core Analysis Features
- **Data Preprocessing**: Comprehensive cleaning of the NASA Exoplanet Archive dataset, including **KNN Imputation** for missing stellar and planetary parameters.
- **Clustering Analysis**: 
  - **K-Means Clustering**: Identifying distinct groups of exoplanets based on physical characteristics.
  - **Agglomerative Hierarchical Clustering**: Using **PCA (Principal Component Analysis)** for dimensionality reduction and Ward linkage to find balanced planetary clusters.
- **Outlier Detection**: Implementation of Z-score based filtering to isolate extreme cases and ensure robust clustering of Earth-like candidates.
- **Habitability Scoring**: A custom probabilistic scoring model that evaluates candidates based on Earth-like baselines for radius, equilibrium temperature, insolation, and density.
- **Statistical Visualization**: Extensive plotting of feature correlations, distributions, and PCA-based cluster "islands" to visualize the planetary landscape.

### Key Data Mining Scripts
- `dm.py`: The primary analysis engine containing the clustering logic, PCA transformations, and visualization generation.
- `dm2.py`: Supplementary classification and advanced data mining routines.

---

## 🌐 Interactive Dashboard
While the research forms the foundation, the web application provides an intuitive interface for real-time planetary discovery.

### Web Features
- **Similarity Finder**: Search the entire processed catalogue of exoplanets using a flexible, 17-feature Z-score normalized distance algorithm. Find planets most similar to any hypothetical or known configuration.
- **Habitability Predictor**: A real-time scoring engine that applies physical gates and scoring components (Radius, Temp, Insolation, etc.) to assess the habitability of a custom planetary profile.
- **Earth Baseline Reference**: Direct comparison with Earth's physical parameters to provide scientific context for assessments.
- **Modern UI**: A premium, "Google-inspired" aesthetic built with React, Vite, Tailwind CSS, and Shadcn UI components.

---

## 🛠️ Technology Stack
- **Data Science**: Python, Pandas, NumPy, Scikit-Learn, SciPy, Matplotlib, Seaborn.
- **Frontend**: React, Vite, Lucide React, Tailwind CSS.
- **Deployment**: Vercel.

---

## 🚀 Getting Started

### Data Analysis (Python)
1. Ensure you have the NASA dataset `PS_2026.01.16_08.12.38.csv` in the root.
2. Install dependencies:
   ```bash
   pip install pandas numpy scikit-learn matplotlib seaborn scipy
   ```
3. Run the analysis:
   ```bash
   python dm.py
   ```

### Web Dashboard (React)
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

---

## 📊 Results Summary
The analysis successfully identifies and ranks high-interest candidates such as **LHS 1140 b**, **Kepler-452 b**, and **TOI-715 b** within the "Earth-like" clusters, validating the model against known habitable-zone candidates.

Developed by [Saksham Gupta](https://github.com/Saksham-Gupta-GH)
