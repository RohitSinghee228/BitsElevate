import React, { useState } from 'react';

const Modern3DTestimonials = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  
  const testimonials = [
    {
      id: "1",
      name: "Priya Sharma",
      role: "Software Developer",
      avatar: "https://randomuser.me/api/portraits/women/63.jpg",
      content: "BITS Elevate completely transformed my career path. The web development bootcamp was comprehensive and practical. I landed a job as a junior developer within a month of completing the course!",
      rating: 5,
      course: "Web Development Bootcamp",
      color: "linear-gradient(135deg, #6B46C1 0%, #805AD5 100%)"
    },
    {
      id: "2",
      name: "Rahul Patel",
      role: "Data Analyst",
      avatar: "https://randomuser.me/api/portraits/men/11.jpg",
      content: "The Data Science course exceeded all my expectations. The instructors were knowledgeable and always available to help. The projects were challenging but extremely rewarding.",
      rating: 5,
      course: "Data Science Fundamentals",
      color: "linear-gradient(135deg, #3182CE 0%, #4299E1 100%)"
    },
    {
      id: "3",
      name: "Ananya Desai",
      role: "UX Designer",
      avatar: "https://randomuser.me/api/portraits/women/33.jpg",
      content: "As someone transitioning into tech from a different field, the UI/UX Design Masterclass gave me all the tools and confidence I needed. The portfolio projects helped me secure my first design role.",
      rating: 4,
      course: "UI/UX Design Masterclass",
      color: "linear-gradient(135deg, #DD6B20 0%, #ED8936 100%)"
    }
  ];

  const renderStars = (rating: number) => {
    return (
      <div style={{ 
        display: 'flex', 
        marginTop: '8px',
        transition: 'transform 0.3s ease',
        transform: 'translateZ(20px)'
      }}>
        {[...Array(5)].map((_, i) => (
          <span 
            key={i} 
            style={{ 
              color: i < rating ? '#F6AD55' : '#CBD5E0', 
              marginRight: '4px',
              fontSize: '1.1rem',
              filter: i < rating ? 'drop-shadow(0 0 2px rgba(246, 173, 85, 0.5))' : 'none'
            }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div style={{ 
      padding: '100px 0', 
      background: 'linear-gradient(135deg, #EBF8FF 0%, #E6FFFA 100%)',
      position: 'relative',
      overflow: 'hidden',
      perspective: '1000px'
    }}>
      {/* Decorative background elements */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(66, 153, 225, 0.1) 0%, rgba(66, 153, 225, 0.05) 50%, transparent 70%)',
        top: '-200px',
        left: '-100px',
        zIndex: 0
      }}></div>
      
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(237, 137, 54, 0.1) 0%, rgba(237, 137, 54, 0.05) 50%, transparent 70%)',
        bottom: '-100px',
        right: '-50px',
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
            What Our Students Say
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
            Hear from our students about how BITS Elevate helped them achieve their learning goals and advance their careers.
          </p>
        </div>
        
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          justifyContent: 'center', 
          gap: '40px',
          perspective: '1000px'
        }}>
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id} 
              style={{ 
                width: '350px',
                perspective: '1000px',
                marginBottom: '20px'
              }}
              onMouseEnter={() => setHoveredId(testimonial.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '20px',
                padding: '35px',
                boxShadow: hoveredId === testimonial.id 
                  ? '0 20px 40px rgba(0,0,0,0.15), 0 15px 20px rgba(0,0,0,0.1), 0 0 40px rgba(66, 153, 225, 0.1)' 
                  : '0 10px 30px rgba(0,0,0,0.1)',
                position: 'relative',
                transformStyle: 'preserve-3d',
                transform: hoveredId === testimonial.id 
                  ? 'rotateX(5deg) rotateY(5deg) translateZ(10px)' 
                  : 'rotateX(0) rotateY(0) translateZ(0)',
                transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
                border: hoveredId === testimonial.id 
                  ? '1px solid rgba(226, 232, 240, 0.8)' 
                  : '1px solid rgba(226, 232, 240, 0.3)',
                overflow: 'hidden'
              }}>
                {/* Decorative quote mark */}
                <div style={{ 
                  fontSize: '6rem', 
                  fontFamily: 'Georgia, serif',
                  color: 'rgba(226, 232, 240, 0.8)', 
                  position: 'absolute', 
                  top: '10px', 
                  left: '20px',
                  lineHeight: 1,
                  transform: hoveredId === testimonial.id ? 'translateZ(15px)' : 'translateZ(0)',
                  transition: 'transform 0.5s ease',
                  pointerEvents: 'none'
                }}>
                  "
                </div>
                
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '5px',
                  background: testimonial.color,
                  transform: hoveredId === testimonial.id ? 'scaleX(1)' : 'scaleX(0.5)',
                  opacity: hoveredId === testimonial.id ? 1 : 0.7,
                  transition: 'transform 0.6s ease, opacity 0.6s ease',
                  transformOrigin: 'left'
                }}></div>
                
                <p style={{ 
                  fontSize: '1.05rem', 
                  color: '#4A5568', 
                  marginBottom: '25px',
                  marginTop: '20px',
                  position: 'relative',
                  zIndex: 1,
                  lineHeight: '1.6',
                  transform: hoveredId === testimonial.id ? 'translateZ(20px)' : 'translateZ(0)',
                  transition: 'transform 0.5s ease'
                }}>
                  "{testimonial.content}"
                </p>
                
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  transform: hoveredId === testimonial.id ? 'translateZ(25px)' : 'translateZ(0)',
                  transition: 'transform 0.5s ease'
                }}>
                  <div style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    padding: '3px',
                    background: testimonial.color,
                    marginRight: '18px',
                    transition: 'transform 0.5s ease, box-shadow 0.5s ease',
                    transform: hoveredId === testimonial.id ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: hoveredId === testimonial.id 
                      ? '0 10px 15px rgba(0,0,0,0.1), 0 0 10px rgba(66, 153, 225, 0.2)' 
                      : 'none'
                  }}>
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name} 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        borderRadius: '50%',
                        border: '2px solid white',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                  
                  <div>
                    <p style={{ 
                      fontWeight: 'bold', 
                      marginBottom: '4px', 
                      fontSize: '1.1rem',
                      color: '#2D3748',
                      transition: 'color 0.3s ease',
                      background: hoveredId === testimonial.id ? testimonial.color : 'transparent',
                      backgroundClip: hoveredId === testimonial.id ? 'text' : 'border-box',
                      WebkitBackgroundClip: hoveredId === testimonial.id ? 'text' : 'border-box',
                      WebkitTextFillColor: hoveredId === testimonial.id ? 'transparent' : 'inherit'
                    }}>
                      {testimonial.name}
                    </p>
                    <p style={{ 
                      fontSize: '0.9rem', 
                      color: '#718096', 
                      marginBottom: '4px'
                    }}>
                      {testimonial.role}
                    </p>
                    <p style={{ 
                      fontSize: '0.85rem', 
                      background: testimonial.color,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: '600'
                    }}>
                      {testimonial.course}
                    </p>
                    {renderStars(testimonial.rating)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ 
          textAlign: 'center', 
          marginTop: '60px',
          transform: 'translateZ(20px)',
          perspective: '1000px'
        }}>
          <button style={{
            background: 'linear-gradient(135deg, #3182CE 0%, #805AD5 100%)',
            color: 'white',
            padding: '14px 30px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            boxShadow: '0 10px 20px rgba(66, 153, 225, 0.3), 0 0 0 3px rgba(66, 153, 225, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 15px 25px rgba(66, 153, 225, 0.4), 0 0 0 4px rgba(66, 153, 225, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 20px rgba(66, 153, 225, 0.3), 0 0 0 3px rgba(66, 153, 225, 0.1)';
          }}>
            Read More Success Stories
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modern3DTestimonials; 