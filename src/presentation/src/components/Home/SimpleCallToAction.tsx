import React, { useState } from 'react';

const Modern3DCallToAction = () => {
  const [buttonHovered, setButtonHovered] = useState<string | null>(null);
  
  const stats = [
    { id: "1", value: '250K+', label: 'Enrolled Students', icon: '👨‍🎓' },
    { id: "2", value: '500+', label: 'Expert Instructors', icon: '👩‍🏫' },
    { id: "3", value: '1200+', label: 'Courses Available', icon: '📚' }
  ];

  return (
    <div style={{ 
      padding: '100px 0', 
      position: 'relative',
      overflow: 'hidden',
      perspective: '1000px'
    }}>
      {/* Background gradient with animated effect */}
      <div style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, #2B6CB0, #7856D5)',
        zIndex: -1,
        backgroundSize: '400% 400%',
        animation: 'gradientAnimation 15s ease infinite'
      }}></div>
      
      {/* Decorative geometric shapes */}
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 70%)',
        top: '-150px',
        right: '-100px',
        zIndex: 0
      }}></div>
      
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 50%, transparent 70%)',
        bottom: '-100px',
        left: '-50px',
        zIndex: 0
      }}></div>
      
      {/* 3D floating elements */}
      {[...Array(15)].map((_, i) => (
        <div 
          key={i}
          style={{
            position: 'absolute',
            width: `${Math.random() * 20 + 10}px`,
            height: `${Math.random() * 20 + 10}px`,
            background: `rgba(255, 255, 255, ${Math.random() * 0.2 + 0.05})`,
            borderRadius: '50%',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            zIndex: 0,
            animation: `floatBubble ${Math.random() * 15 + 20}s linear infinite`,
            transform: 'translateZ(0)'
          }}
        />
      ))}
      
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 20px',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{ 
          maxWidth: '800px',
          color: 'white',
          textAlign: 'center',
          margin: '0 auto',
          marginBottom: '60px',
          transformStyle: 'preserve-3d',
          transform: 'translateZ(30px)'
        }}>
          <h2 style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold', 
            marginBottom: '25px',
            lineHeight: 1.2,
            textShadow: '0 5px 20px rgba(0,0,0,0.2)',
            letterSpacing: '-0.5px'
          }}>
            Transform Your Future with BITS Elevate
          </h2>
          
          <p style={{ 
            fontSize: '1.3rem', 
            marginBottom: '40px',
            opacity: 0.95,
            lineHeight: '1.7',
            maxWidth: '700px',
            margin: '0 auto 40px',
            fontWeight: '300'
          }}>
            Join thousands of learners worldwide who are advancing their careers, 
            acquiring new skills, and achieving their educational goals with BITS Elevate's 
            cutting-edge learning platform.
          </p>
          
          <div style={{ 
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '40px',
            marginBottom: '50px',
            perspective: '1000px'
          }}>
            {stats.map((stat) => (
              <div 
                key={stat.id} 
                style={{ 
                  textAlign: 'center', 
                  minWidth: '160px',
                  transform: 'translateZ(50px)',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateZ(70px) scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateZ(50px) scale(1)';
                }}
              >
                <div style={{
                  fontSize: '34px',
                  marginBottom: '5px',
                  filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.3))'
                }}>
                  {stat.icon}
                </div>
                <p style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #F6E05E 0%, #FBD38D 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'inline-block',
                  marginBottom: '5px',
                  letterSpacing: '-1px'
                }}>
                  {stat.value}
                </p>
                <p style={{ 
                  fontSize: '1rem',
                  opacity: 0.9,
                  fontWeight: '400'
                }}>
                  {stat.label}
                </p>
                
                {/* Animated border */}
                <div style={{
                  position: 'absolute',
                  bottom: '-15px',
                  left: '25%',
                  width: '50%',
                  height: '4px',
                  background: 'linear-gradient(90deg, transparent, rgba(246, 224, 94, 0.7), transparent)',
                  borderRadius: '2px'
                }}></div>
              </div>
            ))}
          </div>
          
          <div style={{ 
            display: 'flex',
            justifyContent: 'center',
            gap: '25px',
            flexWrap: 'wrap',
            transform: 'translateZ(40px)',
            perspective: '1000px'
          }}>
            <button style={{
              background: buttonHovered === 'primary' 
                ? 'linear-gradient(135deg, #FFFFFF 0%, #F7FAFC 100%)' 
                : 'white',
              color: '#2B6CB0',
              padding: '16px 32px',
              borderRadius: '12px',
              border: 'none',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
              transform: buttonHovered === 'primary' ? 'translateY(-5px)' : 'translateY(0)',
              boxShadow: buttonHovered === 'primary' 
                ? '0 20px 30px rgba(0,0,0,0.15), 0 0 40px rgba(66, 153, 225, 0.3)' 
                : '0 10px 20px rgba(0,0,0,0.1)',
              position: 'relative',
              overflow: 'hidden',
              transformStyle: 'preserve-3d'
            }}
            onMouseEnter={() => setButtonHovered('primary')}
            onMouseLeave={() => setButtonHovered(null)}
            >
              <span style={{ 
                position: 'relative', 
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ marginRight: '10px' }}>🚀</span>
                Get Started
              </span>
              
              {/* Button shine effect */}
              <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 60%)',
                transform: buttonHovered === 'primary' ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.6s ease',
                opacity: 0.5,
                zIndex: 1
              }}></div>
            </button>
            
            <button style={{
              background: buttonHovered === 'secondary' 
                ? 'rgba(255, 255, 255, 0.15)' 
                : 'transparent',
              color: 'white',
              padding: '16px 32px',
              borderRadius: '12px',
              border: '2px solid rgba(255, 255, 255, 0.8)',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
              transform: buttonHovered === 'secondary' ? 'translateY(-5px)' : 'translateY(0)',
              boxShadow: buttonHovered === 'secondary' 
                ? '0 20px 30px rgba(0,0,0,0.15), 0 0 20px rgba(255, 255, 255, 0.2)' 
                : 'none',
              position: 'relative',
              overflow: 'hidden',
              transformStyle: 'preserve-3d'
            }}
            onMouseEnter={() => setButtonHovered('secondary')}
            onMouseLeave={() => setButtonHovered(null)}
            >
              <span style={{ 
                position: 'relative', 
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ marginRight: '10px' }}>📚</span>
                Browse Courses
              </span>
              
              {/* Button glow effect */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
                opacity: buttonHovered === 'secondary' ? 1 : 0,
                transition: 'opacity 0.3s ease',
                zIndex: 1
              }}></div>
            </button>
          </div>
        </div>
      </div>
      
      <style>
        {`
          @keyframes gradientAnimation {
            0% { background-position: 0% 50% }
            50% { background-position: 100% 50% }
            100% { background-position: 0% 50% }
          }
          
          @keyframes floatBubble {
            0% { transform: translateY(0) translateX(0) scale(1); opacity: 0.7; }
            33% { transform: translateY(-50px) translateX(20px) scale(1.1); opacity: 0.5; }
            66% { transform: translateY(-100px) translateX(-20px) scale(0.9); opacity: 0.3; }
            100% { transform: translateY(-150px) translateX(0) scale(1); opacity: 0; }
          }
        `}
      </style>
    </div>
  );
};

export default Modern3DCallToAction; 