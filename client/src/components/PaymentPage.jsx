import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { processPayment } from '../api';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { rideId, fare } = location.state || {};
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      await processPayment({ rideId, amount: fare });
      alert("Payment Successful! Thank you for using Mini Uber.");
      navigate('/'); 
    } catch (err) {
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!rideId) return (
    <div className="card" style={{ textAlign: 'center', marginTop: '50px' }}>
      <p>No active payment found.</p>
      <button onClick={() => navigate('/')} className="btn btn-primary">Back to Home</button>
    </div>
  );

  return (
    <div className="payment-container" style={{ textAlign: 'center', padding: '40px 0' }}>
      <h2>Finalize Payment</h2>
      <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <p><strong>Ride Reference:</strong> {rideId}</p>
        <div style={{ fontSize: '32px', margin: '20px 0', color: '#28a745' }}>
          <strong>${fare}</strong>
        </div>
        <hr />
        <div style={{ margin: '20px 0' }}>
          <p>Choose Payment Method:</p>
          <select className="auth-form input" style={{ marginBottom: '10px' }}>
            <option>Digital Wallet (Mock)</option>
            <option>Credit Card (Mock)</option>
            <option>Cash (Mock)</option>
          </select>
        </div>
        <button 
          onClick={handlePayment} 
          disabled={loading}
          className="btn btn-success"
          style={{ width: '100%', fontSize: '1.2rem' }}
        >
          {loading ? "Processing..." : "Confirm & Pay"}
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;