import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { getErrorMessage } from '../utils/errorHandler';

// 1. We update the Interface to include the missing pieces
interface Props {
  email: string;
  onVerify: (code: string) => void;
  onResend: () => void;
  error?: string;
  // Added these so the component knows what they are
  signupData: any; 
  completeActualRegistration: (data: any) => void;
}

const VerificationModal: React.FC<Props> = ({ 
  email, 
  onVerify, 
  onResend, 
  error, 
  signupData, // Added here
  completeActualRegistration // Added here
}) => {
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(120);
  
  // 2. Added this state to fix the "setVerificationError" error
  const [verificationError, setVerificationError] = useState<string | null>(null);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleVerifyCode = async (inputCode: string) => {
    try {
        setVerificationError(null); // Clear old errors
        const response = await api.post('/confirm-code', { 
            email: signupData.email, 
            code: inputCode 
        });
        
        if (response.data === true) {
            // This now works because it's in the Props
            completeActualRegistration(signupData);
        }
    } catch (err) {
        setVerificationError(getErrorMessage(err));
    }
  };

  return (
    <div style={{
      padding: '40px', backgroundColor: 'var(--surface)', 
      border: '1px solid var(--border)', borderRadius: '16px', textAlign: 'center'
    }}>
      <h3>Verify Your Email</h3>
      <p style={{ color: 'var(--text-secondary)' }}>Code sent to {email}</p>
      
      <input 
        type="text" 
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="000000"
        style={{
          fontSize: '32px', textAlign: 'center', letterSpacing: '8px',
          width: '200px', margin: '20px 0', padding: '10px',
          backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px',
          color: 'var(--text-primary)'
        }}
      />

      <p style={{ color: timeLeft === 0 ? 'red' : 'var(--accent-primary)' }}>
        {timeLeft > 0 ? `Expires in: ${formatTime(timeLeft)}` : "Code expired"}
      </p>

      {/* Show the specific verification error or the prop error */}
      {(verificationError || error) && (
        <p style={{ color: 'red', fontSize: '14px' }}>{verificationError || error}</p>
      )}

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button 
          disabled={timeLeft === 0 || code.length !== 6}
          // We call our internal handler instead of just onVerify
          onClick={() => handleVerifyCode(code)}
          style={{ 
            padding: '12px 24px', 
            backgroundColor: 'var(--accent-primary)', 
            color: 'white', 
            borderRadius: '8px',
            cursor: (timeLeft === 0 || code.length !== 6) ? 'not-allowed' : 'pointer'
          }}
        >
          Verify
        </button>
        <button 
          onClick={() => { setTimeLeft(120); onResend(); setVerificationError(null); }}
          style={{ 
            padding: '12px 24px', 
            background: 'none', 
            border: '1px solid var(--border)', 
            color: 'var(--text-primary)', 
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Resend Code
        </button>
      </div>
    </div>
  );
};

export default VerificationModal;