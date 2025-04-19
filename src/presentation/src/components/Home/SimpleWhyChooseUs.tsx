import React, { useState } from 'react';
import { FaLaptopCode, FaUserTie, FaUsers, FaRoad, FaHandshake, FaCertificate } from 'react-icons/fa';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  color: string;
}

const Modern3DWhyChooseUs = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  
  const features: Feature[] = [
    {
      id: '1',
      title: 'Cutting-Edge Curriculum',
      description: 'Access industry-aligned courses that are regularly updated to reflect the latest developments and market demands.',
      icon: <FaLaptopCode size={28} />,
      color: '#3182CE'
    },
    {
      id: '2',
      title: 'Expert Instructors',
      description: 'Learn from industry professionals and academics with years of real-world experience and teaching excellence.',
      icon: <FaUserTie size={28} />,
      color: '#805AD5'
    },
    {
      id: '3',
      title: 'Vibrant Community',
      description: 'Join a global network of learners, collaborate on projects, and grow together through peer learning.',
      icon: <FaUsers size={28} />,
      color: '#DD6B20'
    },
    {
      id: '4',
      title: 'Flexible Learning Paths',
      description: 'Customize your education journey with personalized learning paths that adapt to your goals and pace.',
      icon: <FaRoad size={28} />,
      color: '#38A169'
    },
    {
      id: '5',
      title: 'Industry Partnerships',
      description: 'Benefit from our collaborations with leading companies that provide real-world projects and employment opportunities.',
      icon: <FaHandshake size={28} />,
      color: '#D69E2E'
    },
    {
      id: '6',
      title: 'Recognized Certification',
      description: 'Earn credentials that are respected by employers globally and validate your skills in the job market.',
      icon: <FaCertificate size={28} />,
      color: '#E53E3E'
    },
  ];

  return (
    <div style={{ 
      padding: '80px 0', 
      background: 'linear-gradient(135deg, #f7f9fc 0%, #edf2f7 100%)',
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
        top: '-300px',
        right: '-200px',
        zIndex: 0
      }}></div>
      
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(128, 90, 213, 0.08) 0%, rgba(128, 90, 213, 0.03) 50%, transparent 70%)',
        bottom: '-200px',
        left: '-100px',
        zIndex: 0
      }}></div>
      
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 20px',
        position: 'relative',
        zIndex: 1
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
            Why Choose BITS Elevate?
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
            At BITS Elevate, we're committed to transforming education through technology, 
            accessibility, and excellence to prepare you for tomorrow's challenges.
          </p>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: '30px',
          perspective: '1000px'
        }}>
          {features.map((feature) => (
            <div 
              key={feature.id} 
              style={{ 
                perspective: '1000px',
                transformStyle: 'preserve-3d',
                transition: 'all 0.5s ease'
              }}
              onMouseEnter={() => setHoveredId(feature.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div style={{ 
                padding: '35px', 
                backgroundColor: 'white', 
                borderRadius: '16px',
                boxShadow: hoveredId === feature.id 
                  ? '0 20px 40px rgba(0,0,0,0.1), 0 0 40px rgba(66, 153, 225, 0.1)' 
                  : '0 10px 25px rgba(0,0,0,0.05)',
                transform: hoveredId === feature.id 
                  ? 'rotateX(5deg) rotateY(5deg) translateZ(10px)' 
                  : 'rotateX(0) rotateY(0) translateZ(0)',
                transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                position: 'relative',
                overflow: 'hidden',
                height: '100%',
                transformStyle: 'preserve-3d'
              }}>
                {/* Top color accent bar */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '5px',
                  background: `linear-gradient(90deg, ${feature.color}, ${feature.color}CC)`,
                  transform: hoveredId === feature.id ? 'scaleX(1)' : 'scaleX(0.3)',
                  transformOrigin: 'left',
                  transition: 'transform 0.6s ease',
                }}></div>
                
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '20px',
                  transform: hoveredId === feature.id ? 'translateZ(25px)' : 'translateZ(0)',
                  transition: 'transform 0.4s ease'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '12px',
                    background: hoveredId === feature.id 
                      ? `linear-gradient(135deg, ${feature.color} 0%, ${feature.color}CC 100%)` 
                      : 'white',
                    color: hoveredId === feature.id ? 'white' : feature.color,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: '20px',
                    boxShadow: hoveredId === feature.id 
                      ? `0 10px 20px rgba(0,0,0,0.1), 0 0 15px ${feature.color}33` 
                      : `0 5px 15px ${feature.color}22`,
                    border: hoveredId === feature.id 
                      ? 'none' 
                      : `2px solid ${feature.color}22`,
                    transition: 'all 0.3s ease'
                  }}>
                    {feature.icon}
                  </div>
                  <h3 style={{ 
                    fontSize: '1.4rem', 
                    fontWeight: 'bold', 
                    marginBottom: '5px',
                    color: hoveredId === feature.id ? feature.color : '#2D3748',
                    transition: 'color 0.3s ease'
                  }}>
                    {feature.title}
                  </h3>
                </div>
                
                <p style={{ 
                  color: '#4A5568',
                  lineHeight: '1.7',
                  fontSize: '1.05rem',
                  transform: hoveredId === feature.id ? 'translateZ(20px)' : 'translateZ(0)',
                  transition: 'transform 0.4s ease',
                  position: 'relative',
                  zIndex: 2
                }}>
                  {feature.description}
                </p>
                
                {/* Background decorative shape */}
                <div style={{
                  position: 'absolute',
                  bottom: '-30px',
                  right: '-30px',
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${feature.color}33 0%, ${feature.color}11 60%, transparent 70%)`,
                  opacity: hoveredId === feature.id ? 1 : 0.3,
                  transform: hoveredId === feature.id ? 'scale(1.2)' : 'scale(1)',
                  transition: 'all 0.5s ease',
                  zIndex: 1
                }}></div>
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ 
          textAlign: 'center', 
          marginTop: '50px',
          transform: 'translateZ(20px)',
          perspective: '1000px',
          position: 'relative',
          zIndex: 2
        }}>
          <button style={{
            background: 'linear-gradient(135deg, #3182CE 0%, #5A67D8 100%)',
            color: 'white',
            padding: '15px 32px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            boxShadow: '0 10px 30px rgba(66, 153, 225, 0.3), 0 0 0 3px rgba(66, 153, 225, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 15px 30px rgba(66, 153, 225, 0.4), 0 0 0 4px rgba(66, 153, 225, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(66, 153, 225, 0.3), 0 0 0 3px rgba(66, 153, 225, 0.1)';
          }}>
            Discover More Benefits
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modern3DWhyChooseUs; 