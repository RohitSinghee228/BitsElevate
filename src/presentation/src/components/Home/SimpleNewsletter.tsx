import React, { useState } from 'react';

const Modern3DNewsletter = () => {
  const [email, setEmail] = useState('');
  const [hovered, setHovered] = useState(false);
  const [buttonHovered, setButtonHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Thank you for subscribing with: ${email}`);
    setEmail('');
  };
  
  const benefits = [
    "Weekly curated learning resources",
    "New course announcements",
    "Exclusive discounts and offers",
    "Learning tips and productivity guides"
  ];

  // Define animation keyframes in style object
  const floatAnimationStyle = {
    animation: `floatParticle 15s linear infinite`
  };

  return (
    <div style={{ 
      padding: '80px 0', 
      background: 'linear-gradient(135deg, #2B6CB0 0%, #1A365D 100%)', 
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      perspective: '1000px'
    }}>
      {/* Decorative elements */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 50%, transparent 70%)',
        top: '-200px',
        right: '10%',
        zIndex: 0
      }}></div>
      
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(66, 153, 225, 0.15) 0%, rgba(66, 153, 225, 0.05) 50%, transparent 70%)',
        bottom: '-100px',
        left: '5%',
        zIndex: 0
      }}></div>
      
      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <div 
          key={i}
          style={{
            position: 'absolute',
            width: `${Math.random() * 10 + 5}px`,
            height: `${Math.random() * 10 + 5}px`,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            zIndex: 0,
            animation: `floatParticle ${Math.random() * 10 + 10}s linear infinite`,
            opacity: Math.random() * 0.5 + 0.3
          }}
        />
      ))}
      
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 20px',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '60px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ 
          maxWidth: '600px',
          flex: '1 1 500px',
          transform: 'translateZ(20px)',
          perspective: '1000px'
        }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            marginBottom: '20px',
            background: 'linear-gradient(90deg, #FFF, #BEE3F8)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block'
          }}>
            Stay Updated with BITS Elevate
          </h2>
          
          <p style={{ 
            fontSize: '1.2rem', 
            marginBottom: '30px',
            opacity: 0.9,
            lineHeight: '1.6',
            textShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}>
            Subscribe to our newsletter for the latest courses, educational trends, and exclusive offers tailored to your learning journey.
          </p>
          
          <div style={{ marginTop: '25px' }}>
            <h3 style={{ 
              fontSize: '1.3rem', 
              marginBottom: '20px',
              fontWeight: '600',
              color: '#90CDF4'
            }}>
              You'll receive:
            </h3>
            
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {benefits.map((benefit, index) => (
                <li 
                  key={index} 
                  style={{ 
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    transform: 'translateZ(30px)',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateZ(40px) translateX(10px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateZ(30px)';
                  }}
                >
                  <span style={{ 
                    marginRight: '15px',
                    width: '26px',
                    height: '26px',
                    background: 'linear-gradient(135deg, #4299E1 0%, #3182CE 100%)',
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2), 0 0 0 2px rgba(66, 153, 225, 0.3)'
                  }}>
                    ✓
                  </span>
                  <span style={{ fontSize: '1.05rem' }}>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div style={{ 
          position: 'relative',
          perspective: '1000px',
          flex: '1 1 350px',
          maxWidth: '450px'
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}>
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '16px',
            boxShadow: hovered
              ? '0 30px 60px rgba(0,0,0,0.2), 0 0 40px rgba(66, 153, 225, 0.2)'
              : '0 15px 35px rgba(0,0,0,0.15)',
            transformStyle: 'preserve-3d',
            transform: hovered
              ? 'rotateX(5deg) rotateY(-5deg) translateZ(10px)'
              : 'rotateX(0) rotateY(0) translateZ(0)',
            transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h3 style={{ 
              color: '#2D3748', 
              fontSize: '1.8rem', 
              fontWeight: 'bold',
              marginBottom: '15px',
              transform: 'translateZ(30px)',
              transition: 'transform 0.3s ease'
            }}>
              Join Our Community
            </h3>
            
            <p style={{ 
              color: '#718096', 
              marginBottom: '25px',
              fontSize: '1.05rem',
              transform: 'translateZ(20px)',
              transition: 'transform 0.3s ease'
            }}>
              Over <span style={{ fontWeight: 'bold', color: '#3182CE' }}>25,000</span> educators and learners have already subscribed!
            </p>
            
            <form onSubmit={handleSubmit} style={{ transform: 'translateZ(40px)' }}>
              <div style={{ marginBottom: '25px', position: 'relative' }}>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    fontSize: '1.05rem',
                    border: focused 
                      ? '2px solid #3182CE' 
                      : '2px solid #E2E8F0',
                    borderRadius: '10px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxShadow: focused 
                      ? '0 0 0 4px rgba(49, 130, 206, 0.2)' 
                      : 'none'
                  }}
                />
                <p style={{ 
                  fontSize: '0.85rem', 
                  color: '#718096', 
                  marginTop: '10px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{ 
                    fontSize: '16px', 
                    marginRight: '6px',
                    color: '#4299E1' 
                  }}>🔒</span>
                  We respect your privacy. No spam, ever.
                </p>
              </div>
              
              <button 
                type="submit"
                style={{
                  width: '100%',
                  background: buttonHovered
                    ? 'linear-gradient(135deg, #3182CE 0%, #2C5282 100%)'
                    : 'linear-gradient(135deg, #4299E1 0%, #3182CE 100%)',
                  color: 'white',
                  padding: '16px 20px',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: buttonHovered
                    ? '0 10px 20px rgba(49, 130, 206, 0.4), 0 0 0 2px rgba(66, 153, 225, 0.2)'
                    : '0 5px 15px rgba(49, 130, 206, 0.3)',
                  transform: buttonHovered ? 'translateY(-2px)' : 'translateY(0)'
                }}
                onMouseEnter={() => setButtonHovered(true)}
                onMouseLeave={() => setButtonHovered(false)}
              >
                Subscribe Now
              </button>
            </form>
            
            {/* Animated accent element */}
            <div style={{
              position: 'absolute',
              top: '-15px',
              right: '-15px',
              width: '140px',
              height: '140px',
              background: 'linear-gradient(135deg, #4299E1 0%, #3182CE 100%)',
              borderRadius: '50%',
              opacity: 0.1,
              transform: hovered ? 'scale(1)' : 'scale(0.8)',
              transition: 'transform 0.5s ease, opacity 0.5s ease',
              zIndex: -1
            }}></div>
          </div>
        </div>
      </div>
      
      <style>
        {`
          @keyframes floatParticle {
            0% {
              transform: translateY(0) translateX(0);
            }
            25% {
              transform: translateY(-20px) translateX(10px);
            }
            50% {
              transform: translateY(-10px) translateX(20px);
            }
            75% {
              transform: translateY(-30px) translateX(-10px);
            }
            100% {
              transform: translateY(0) translateX(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Modern3DNewsletter; 