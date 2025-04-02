// server/src/controllers/economic.controller.js

const axios = require('axios');
const Economic = require('../models/economic.model');
const logger = require('../utils/logger');

// Get live economic data
exports.getLiveEconomicData = async (req, res) => {
  try {
    // In a production environment, you would connect to real APIs
    // For development, we'll use simulated data
    const liveData = {
      usdLkrRate: 318.45,
      lastUpdatedExchangeRate: new Date(),
      
      inflationRate: 4.8,
      previousInflationRate: 5.2,
      lastUpdatedInflation: new Date(),
      
      cottonPrice: 0.85,
      cottonPriceChange: 0.02,
      cottonPriceChangePercent: 2.4,
      lastUpdatedCottonPrice: new Date(),
      
      // Currencies relevant to garment export competitiveness
      currencies: {
        EUR: 0.93,
        GBP: 0.79,
        JPY: 151.20,
        CNY: 7.23,
        BDT: 110.25, // Bangladesh Taka
        INR: 83.45   // Indian Rupee
      },
      
      // Major stock indices
      stockIndices: [
        {
          symbol: 'S&P 500',
          close: 5247.48,
          change: 15.29,
          change_percent: 0.29,
          date: new Date()
        },
        {
          symbol: 'FTSE 100',
          close: 8078.86,
          change: -12.35,
          change_percent: -0.15,
          date: new Date()
        },
        {
          symbol: 'NIKKEI 225',
          close: 38807.39,
          change: 92.14,
          change_percent: 0.24,
          date: new Date()
        }
      ],
      
      // Sri Lanka garment export statistics
      exportStats: {
        monthlyValue: 452.8, // USD millions
        yoyChange: 3.2, // percentage
        topDestination: 'United States',
        secondDestination: 'European Union',
        thirdDestination: 'United Kingdom',
        lastUpdated: new Date()
      },
      
      // Economic analysis for garment industry
      exchangeRateTrend: 'The LKR has depreciated by 2.3% against the USD over the past month, potentially improving export competitiveness but increasing input costs for imported materials.',
      
      inflationImpact: 'Inflation rate has decreased by 0.4 percentage points, which may reduce pressure on labor costs in the short term. Manufacturing costs should stabilize if this trend continues.',
      
      materialCostForecast: 'Cotton prices have increased slightly (2.4%), but remain lower than the previous quarter. Overall material costs are expected to remain stable in the near term.',
      
      marketOutlook: 'Major consumer markets show stable retail demand. US and EU apparel retail sales increased by 1.8% and 1.2% respectively in the last quarter, indicating steady demand for Sri Lankan exports.'
    };
    
    // Store this data in the database for historical tracking
    const newSnapshot = new Economic({
      date: new Date(),
      exchangeRate: liveData.usdLkrRate,
      inflation: liveData.inflationRate,
      cottonPrice: liveData.cottonPrice,
      source: 'live-api'
    });
    
    await newSnapshot.save();
    
    return res.status(200).json({ 
      success: true, 
      data: liveData
    });
  } catch (error) {
    logger.error(`Error in getLiveEconomicData: ${error.message}`);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get historical economic data
exports.getHistoricalEconomicData = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Validate dates
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Start date and end date are required'
      });
    }
    
    // Define query with date range
    const query = {
      date: { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      }
    };
    
    // Check if we have historical data
    let historicalData = await Economic.find(query).sort({ date: 1 });
    
    // If no data exists for the specified period, generate some sample data
    if (historicalData.length === 0) {
      // Create sample data points
      const sampleData = [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      const daysBetween = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      
      // Generate at most 30 data points, evenly spaced
      const interval = Math.max(1, Math.floor(daysBetween / 30));
      
      // Generate historical data points
      for (let i = 0; i < daysBetween; i += interval) {
        const currentDate = new Date(start);
        currentDate.setDate(currentDate.getDate() + i);
        
        // Start with base values and add some random variation
        const exchangeRate = 315 + (Math.random() * 10 - 5);
        const inflation = 5 + (Math.random() * 1 - 0.5);
        const cottonPrice = 0.83 + (Math.random() * 0.1 - 0.05);
        
        sampleData.push({
          date: currentDate,
          exchangeRate: exchangeRate,
          inflation: inflation,
          cottonPrice: cottonPrice,
          source: 'sample-data'
        });
      }
      
      // Save sample data to database
      await Economic.insertMany(sampleData);
      
      // Return the sample data
      historicalData = sampleData;
    }
    
    return res.status(200).json({ 
      success: true, 
      data: historicalData 
    });
  } catch (error) {
    logger.error(`Error in getHistoricalEconomicData: ${error.message}`);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get exchange rates
exports.getExchangeRates = async (req, res) => {
  try {
    // In a production environment, you would fetch real exchange rates
    // For demonstration, we're providing simulated data
    const exchangeRates = {
      base: 'USD',
      date: new Date(),
      rates: {
        LKR: 318.45,
        EUR: 0.93,
        GBP: 0.79,
        JPY: 151.20,
        CNY: 7.23,
        INR: 83.45,
        BDT: 110.25,
        VND: 24850.50
      }
    };
    
    return res.status(200).json({
      success: true,
      data: exchangeRates
    });
  } catch (error) {
    logger.error(`Error in getExchangeRates: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get economic indicators
exports.getEconomicIndicators = async (req, res) => {
  try {
    // Simulated economic indicators relevant to garment industry
    const indicators = {
      laborCostIndex: 112.4, // Index (base 100 in 2020)
      energyCosts: 0.14, // USD per kWh
      freightRates: {
        asiaToUS: 3450,  // USD per container
        asiaToEurope: 3280 // USD per container
      },
      marketDemand: {
        us: 102.3, // Index (base 100 in 2020)
        eu: 98.7,
        uk: 99.2,
        japan: 97.8
      },
      competitorActivity: {
        bangladesh: {
          exportGrowth: 4.2, // percentage
          priceIndex: 92.5   // Index (base 100 = Sri Lanka)
        },
        vietnam: {
          exportGrowth: 5.7,
          priceIndex: 107.3
        },
        india: {
          exportGrowth: 3.1,
          priceIndex: 97.4
        }
      },
      lastUpdated: new Date()
    };
    
    return res.status(200).json({
      success: true,
      data: indicators
    });
  } catch (error) {
    logger.error(`Error in getEconomicIndicators: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get industry market data
exports.getIndustryData = async (req, res) => {
  try {
    // Simulated industry data
    const industryData = {
      marketSize: 5.2, // Billion USD
      growth: 3.8, // Percentage
      segments: [
        { name: 'Casual Wear', share: 42, growth: 4.2 },
        { name: 'Formal Wear', share: 28, growth: 2.1 },
        { name: 'Sportswear', share: 18, growth: 6.7 },
        { name: 'Others', share: 12, growth: 1.9 }
      ],
      majorMarkets: [
        { country: 'USA', share: 35, growth: 3.2 },
        { country: 'EU', share: 28, growth: 2.7 },
        { country: 'UK', share: 15, growth: 2.1 },
        { country: 'Japan', share: 8, growth: 1.5 },
        { country: 'Australia', share: 6, growth: 4.2 },
        { country: 'Others', share: 8, growth: 3.8 }
      ],
      competitorAnalysis: {
        sriLanka: { marketShare: 2.4, costIndex: 100, qualityIndex: 100 },
        bangladesh: { marketShare: 6.8, costIndex: 82, qualityIndex: 85 },
        vietnam: { marketShare: 5.2, costIndex: 95, qualityIndex: 93 },
        india: { marketShare: 4.9, costIndex: 88, qualityIndex: 90 },
        china: { marketShare: 32.3, costIndex: 110, qualityIndex: 95 }
      },
      lastUpdated: new Date()
    };
    
    return res.status(200).json({
      success: true,
      data: industryData
    });
  } catch (error) {
    logger.error(`Error in getIndustryData: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get supply chain status
exports.getSupplyChainStatus = async (req, res) => {
  try {
    // Simulated supply chain data
    const supplyChainData = {
      rawMaterialAvailability: {
        cotton: { status: 'Normal', trend: 'Stable', priceImpact: 'Neutral' },
        polyester: { status: 'Limited', trend: 'Improving', priceImpact: 'Moderate' },
        wool: { status: 'Normal', trend: 'Stable', priceImpact: 'Neutral' }
      },
      shippingStatus: {
        asiaToUS: { status: 'Delayed', delay: '2-3 days', costImpact: 'Moderate' },
        asiaToEU: { status: 'Normal', delay: '0-1 days', costImpact: 'Low' },
        domestic: { status: 'Normal', delay: '0 days', costImpact: 'None' }
      },
      portCongestion: {
        colombo: { status: 'Moderate', trend: 'Improving' },
        singapore: { status: 'Low', trend: 'Stable' },
        losAngeles: { status: 'High', trend: 'Worsening' }
      },
      laborMarket: {
        availability: 'Good',
        wageInflation: 'Moderate',
        skillShortages: ['Advanced Machinery Operators', 'Quality Control Specialists']
      },
      riskAssessment: {
        overall: 'Moderate',
        biggestRisks: ['Shipping Delays', 'Raw Material Cost Fluctuations', 'Labor Cost Increases']
      },
      lastUpdated: new Date()
    };
    
    return res.status(200).json({
      success: true,
      data: supplyChainData
    });
  } catch (error) {
    logger.error(`Error in getSupplyChainStatus: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get trade policy updates
exports.getTradePolicyUpdates = async (req, res) => {
  try {
    // Simulated trade policy data
    const tradePolicyData = {
      recentUpdates: [
        {
          title: 'US GSP Program Renewal',
          description: 'The US has renewed its Generalized System of Preferences (GSP) program, which provides duty-free treatment for certain goods from designated beneficiary countries including Sri Lanka.',
          effectiveDate: '2025-01-01',
          impact: 'Positive',
          affectedCategories: ['Apparel', 'Textiles', 'Accessories']
        },
        {
          title: 'EU-Sri Lanka Trade Agreement Amendment',
          description: 'The EU and Sri Lanka have amended their trade agreement to include reduced tariffs on garment exports from Sri Lanka to EU countries.',
          effectiveDate: '2025-04-01',
          impact: 'Positive',
          affectedCategories: ['All Garment Categories']
        },
        {
          title: 'New Carbon Border Adjustment Mechanism',
          description: 'The EU is implementing a new Carbon Border Adjustment Mechanism that will affect imports from countries with less stringent climate policies.',
          effectiveDate: '2025-07-01',
          impact: 'Negative',
          affectedCategories: ['High-Carbon Production Methods']
        }
      ],
      upcomingChanges: [
        {
          title: 'UK Post-Brexit Trade Regulations',
          description: 'New regulations affecting imports from Commonwealth countr