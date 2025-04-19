import React, { useState } from 'react';

const Modern3DStatsCounter = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  
  const stats = [
    {
      id: "1",
      label: "Total Students",
      value: "175,000+",
      icon: "👨‍🎓",
      description: "From across India and 45+ countries",
      gradient: "linear-gradient(135deg, #4299E1 0%, #3182CE 100%)"
    },
    {
      id: "2",
      label: "Courses Available",
      value: "850+",
      icon: "💻",
      description: "Across 12 different disciplines",
      gradient: "linear-gradient(135deg, #9F7AEA 0%, #805AD5 100%)"
    },
    {
      id: "3",
      label: "Expert Faculty",
      value: "300+",
      icon: "🎓",
      description: "IIT, IIM & industry professionals",
      gradient: "linear-gradient(135deg, #68D391 0%, #38A169 100%)"
    },
    {
      id: "4",
      label: "Placement Rate",
      value: "92%",
      icon: "🏆",
      description: "Among top tech institutes in India",
      gradient: "linear-gradient(135deg, #F6AD55 0%, #DD6B20 100%)"
    },
    {
      id: "5",
      label: "Corporate Partners",
      value: "125+",
      icon: "🤝",
      description: "Including Fortune 500 companies",
      gradient: "linear-gradient(135deg, #76E4F7 0%, #00B5D8 100%)"
    },
    {
      id: "6",
      label: "Research Centers",
      value: "18",
      icon: "🔬",
      description: "Cutting-edge innovation hubs",
      gradient: "linear-gradient(135deg, #FC8181 0%, #E53E3E 100%)"
    }
  ];

  return (
    <div style={{ 
      padding: '80px 0', 
      background: 'linear-gradient(135deg, #F7FAFC 0%, #EDF2F7 100%)',
      position: 'relative',
      overflow: 'hidden',
      perspective: '1000px'
    }}>
      {/* Decorative background elements */}
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(66, 153, 225, 0.08) 0%, rgba(66, 153, 225, 0.03) 50%, transparent 70%)',
        top: '-200px',
        right: '-200px',
        zIndex: 0
      }}></div>
      
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(128, 90, 213, 0.08) 0%, rgba(128, 90, 213, 0.03) 50%, transparent 70%)',
        bottom: '-100px',
        left: '-100px',
        zIndex: 0
      }}></div>
      
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 20px',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            marginBottom: '16px',
            background: 'linear-gradient(90deg, #3182CE, #805AD5)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block'
          }}>
            Our Impact in Numbers
          </h2>
          <div style={{
            height: '6px',
            width: '80px',
            background: 'linear-gradient(90deg, #3182CE, #805AD5)',
            margin: '0 auto',
            borderRadius: '3px'
          }}></div>
          <p style={{ 
            fontSize: '1.2rem', 
            color: '#4A5568', 
            maxWidth: '700px', 
            margin: '20px auto 0',
            lineHeight: 1.6
          }}>
            Discover the growing influence of BITS Elevate in India's educational landscape
          </p>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: '35px',
          perspective: '1000px'
        }}>
          {stats.map((stat) => (
            <div 
              key={stat.id}
              style={{
                position: 'relative',
                perspective: '1000px'
              }}
              onMouseEnter={() => setHoveredId(stat.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '16px',
                boxShadow: hoveredId === stat.id
                  ? '0 20px 40px rgba(0,0,0,0.12), 0 0 40px rgba(66, 153, 225, 0.1)'
                  : '0 10px 25px rgba(0,0,0,0.08)',
                transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
                transformStyle: 'preserve-3d',
                transform: hoveredId === stat.id
                  ? 'rotateX(5deg) rotateY(5deg) translateZ(10px)'
                  : 'rotateX(0) rotateY(0) translateZ(0)',
                overflow: 'hidden',
                cursor: 'pointer',
                border: '1px solid rgba(226, 232, 240, 0.8)'
              }}>
                {/* Subtle gradient accent on hover */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '5px',
                  background: stat.gradient,
                  transform: hoveredId === stat.id ? 'scaleX(1)' : 'scaleX(0.5)',
                  opacity: hoveredId === stat.id ? 1 : 0.7,
                  transition: 'transform 0.6s ease, opacity 0.6s ease',
                  transformOrigin: 'left'
                }}></div>
                
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '20px',
                  transform: hoveredId === stat.id ? 'translateZ(30px)' : 'translateZ(0)',
                  transition: 'transform 0.5s ease'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '12px',
                    background: hoveredId === stat.id 
                      ? stat.gradient 
                      : 'white',
                    border: `2px solid ${hoveredId === stat.id ? 'rgba(255, 255, 255, 0.2)' : 'rgba(226, 232, 240, 0.8)'}`,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: '20px',
                    fontSize: '26px',
                    boxShadow: hoveredId === stat.id 
                      ? '0 10px 15px rgba(0,0,0,0.1), 0 0 10px rgba(66, 153, 225, 0.2)' 
                      : '0 4px 10px rgba(0,0,0,0.05)',
                    transition: 'all 0.5s ease'
                  }}>
                    {stat.icon}
                  </div>
                  <h3 style={{ 
                    fontSize: '1.3rem', 
                    fontWeight: 'bold',
                    color: '#2D3748',
                    transition: 'color 0.3s ease'
                  }}>
                    {stat.label}
                  </h3>
                </div>
                
                <div style={{
                  transform: hoveredId === stat.id ? 'translateZ(20px)' : 'translateZ(0)',
                  transition: 'transform 0.5s ease'
                }}>
                  <p style={{ 
                    fontSize: '2.5rem', 
                    fontWeight: '800', 
                    marginBottom: '15px',
                    background: hoveredId === stat.id
                      ? stat.gradient
                      : 'transparent',
                    backgroundClip: hoveredId === stat.id ? 'text' : 'border-box',
                    WebkitBackgroundClip: hoveredId === stat.id ? 'text' : 'border-box',
                    WebkitTextFillColor: hoveredId === stat.id ? 'transparent' : stat.gradient.split(' ')[2],
                    transition: 'all 0.3s ease'
                  }}>
                    {stat.value}
                  </p>
                  <p style={{ 
                    fontSize: '1rem', 
                    color: '#718096',
                    lineHeight: '1.5'
                  }}>
                    {stat.description}
                  </p>
                </div>
                
                {/* Animated shape in the background on hover */}
                <div style={{
                  position: 'absolute',
                  bottom: '-40px',
                  right: '-40px',
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: stat.gradient,
                  opacity: hoveredId === stat.id ? 0.1 : 0,
                  transform: hoveredId === stat.id ? 'scale(1)' : 'scale(0.5)',
                  transition: 'all 0.5s ease',
                  zIndex: -1
                }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Modern3DStatsCounter; 