# server/src/ml/models/arima_model.py

import pandas as pd
import numpy as np
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.stattools import adfuller
from sklearn.metrics import mean_absolute_percentage_error

class ARIMAModel:
    def __init__(self, order=(1, 1, 1)):
        self.order = order
        self.model = None
        self.history = None
    
    def is_stationary(self, data):
        """Check if data is stationary using ADF test"""
        result = adfuller(data)
        return result[1] <= 0.05  # p-value <= 0.05 means stationary
    
    def preprocess(self, data):
        """Preprocess data for ARIMA model"""
        # Convert to pandas Series with datetime index
        series = pd.Series(data['revenue'].values, index=pd.DatetimeIndex(data['date']))
        series = series.asfreq('MS')  # Monthly start frequency
        
        # Check stationarity
        if not self.is_stationary(series):
            series = series.diff().dropna()
        
        return series
    
    def train(self, data):
        """Train ARIMA model"""
        series = self.preprocess(data)
        self.history = series
        
        # Fit ARIMA model
        self.model = ARIMA(series, order=self.order)
        self.model_fit = self.model.fit()
        
        return self.model_fit
    
    def predict(self, steps=12):
        """Generate forecast for specified number of steps"""
        if self.model_fit is None:
            raise ValueError("Model has not been trained")
        
        # Generate forecast
        forecast = self.model_fit.forecast(steps=steps)
        
        # Create prediction results
        result = {
            'predicted_values': forecast.values.tolist(),
            'forecast_dates': forecast.index.strftime('%Y-%m-%d').tolist(),
            'confidence_intervals': None  # Can be added for more detailed output
        }
        
        return result
    
    def evaluate(self, test_data):
        """Evaluate model on test data"""
        if self.model_fit is None:
            raise ValueError("Model has not been trained")
        
        # Preprocess test data
        test_series = self.preprocess(test_data)
        
        # Generate predictions for test period
        predictions = self.model_fit.predict(start=test_series.index[0], end=test_series.index[-1])
        
        # Calculate metrics
        mape = mean_absolute_percentage_error(test_series, predictions) * 100
        
        return {
            'mape': mape,
            'actual_values': test_series.values.tolist(),
            'predicted_values': predictions.values.tolist(),
            'dates': test_series.index.strftime('%Y-%m-%d').tolist()
        }