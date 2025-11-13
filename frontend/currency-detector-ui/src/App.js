import React, { useState } from 'react';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPredictionResult(null);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      alert('Please select a file first!');
      return;
    }

    setIsLoading(true);
    
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await fetch('http://localhost:5000/api/check-currency', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setPredictionResult(result);
      } else {
        throw new Error('Failed to get prediction');
      }
    } catch (error) {
      console.error('Error:', error);
      setPredictionResult({ error: 'Failed to analyze the currency note. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Clean up preview URL when component unmounts or file changes
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Indian Currency Authenticity Detector</h1>
        <p>Upload an image of an Indian currency note to check its authenticity</p>
        
        <form onSubmit={handleSubmit} className="upload-form">
          <div className="file-input-container">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              id="file-upload"
              className="file-input"
            />
            <label htmlFor="file-upload" className="file-label">
              {selectedFile ? selectedFile.name : 'Choose File'}
            </label>
          </div>
          
          {/* Image Preview */}
          {previewUrl && (
            <div className="image-preview-container">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="image-preview"
              />
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={!selectedFile || isLoading}
            className="submit-button"
          >
            {isLoading ? 'Analyzing...' : 'Check Authenticity'}
          </button>
        </form>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Analyzing currency note...</p>
          </div>
        )}

        {predictionResult && !isLoading && (
          <div className="result-container">
            {predictionResult.error ? (
              <div className="error-message">
                <h3>Error</h3>
                <p>{predictionResult.error}</p>
              </div>
            ) : (
              <div className="result-message">
                <h3>Prediction Result</h3>
                <p className={`result ${predictionResult.is_real ? 'real' : 'fake'}`}>
                  {predictionResult.is_real ? 'Real Currency' : 'Fake Currency'}
                </p>
                <p>Confidence: {predictionResult.confidence.toFixed(2)}%</p>
              </div>
            )}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;