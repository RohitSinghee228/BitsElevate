import React, { useState } from 'react';

const Modern3DPopularCourses = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  
  const courses = [
    {
      id: "1",
      title: "Full Stack Development with MERN Stack",
      instructor: "Prof. Amit Sharma, IIT Delhi",
      image: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      rating: 4.9,
      students: 18240,
      price: 12499,
      discountPrice: 8499,
      category: "Web Development"
    },
    {
      id: "2",
      title: "Data Science & ML for Business Analytics",
      instructor: "Dr. Priya Patel, IIM Bangalore",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      rating: 4.8,
      students: 14580,
      price: 14999,
      discountPrice: 9999,
      category: "Data Science"
    },
    {
      id: "3",
      title: "Blockchain & Web3 Applications Development",
      instructor: "Siddharth Gupta, Polygon",
      image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      rating: 4.7,
      students: 9850,
      price: 11999,
      discountPrice: 7999,
      category: "Blockchain"
    }
  ];

  return (
    <div style={{ 
      padding: '80px 0', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #eef1f5 100%)',
      perspective: '1000px'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 20px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '60px',
          position: 'relative'
        }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            marginBottom: '16px',
            background: 'linear-gradient(90deg, #2B6CB0, #805AD5)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block'
          }}>
            Industry-Ready Courses
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
            Gain industry-relevant skills with BITS Elevate's most sought-after certification programs.
          </p>
        </div>
        
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          justifyContent: 'center', 
          gap: '40px',
          perspective: '1000px'
        }}>
          {courses.map((course) => (
            <div 
              key={course.id} 
              style={{ 
                width: '350px',
                perspective: '1000px',
                marginBottom: '20px'
              }}
              onMouseEnter={() => setHoveredId(course.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div style={{ 
                transformStyle: 'preserve-3d',
                transform: hoveredId === course.id ? 'rotateY(5deg) rotateX(5deg) translateZ(10px)' : 'rotateY(0) rotateX(0) translateZ(0)',
                transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: hoveredId === course.id 
                  ? '0 20px 40px rgba(0,0,0,0.2), 0 15px 20px rgba(0,0,0,0.15), 0 0 60px rgba(103, 58, 183, 0.1)' 
                  : '0 10px 30px rgba(0,0,0,0.1)',
                background: 'white',
              }}>
                <div style={{ 
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: '100%', 
                    height: '220px', 
                    overflow: 'hidden',
                    position: 'relative',
                  }}>
                    <img 
                      src={course.image} 
                      alt={course.title} 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        transform: hoveredId === course.id ? 'scale(1.1)' : 'scale(1)',
                        transition: 'transform 0.8s ease',
                        filter: hoveredId === course.id ? 'brightness(1.05)' : 'brightness(1)'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(rgba(0,0,0,0.05), rgba(0,0,0,0.2))',
                      opacity: hoveredId === course.id ? 0 : 1,
                      transition: 'opacity 0.5s ease'
                    }}></div>
                  </div>
                  
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '20px',
                    pointerEvents: 'none'
                  }}>
                    <span style={{ 
                      background: 'linear-gradient(135deg, #ff0844 0%, #ff4563 100%)',
                      color: 'white',
                      padding: '8px 12px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 10px rgba(255, 69, 99, 0.3)',
                      display: course.discountPrice ? 'block' : 'none',
                      transform: hoveredId === course.id && course.discountPrice ? 'translateY(5px) scale(1.1)' : 'translateY(0) scale(1)',
                      transition: 'all 0.4s ease'
                    }}>
                      {course.discountPrice && Math.round(((course.price - course.discountPrice) / course.price) * 100)}% OFF
                    </span>
                    
                    <span style={{ 
                      background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                      color: 'white',
                      padding: '8px 12px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 10px rgba(52, 152, 219, 0.3)',
                      transform: hoveredId === course.id ? 'translateY(5px) scale(1.1)' : 'translateY(0) scale(1)',
                      transition: 'all 0.4s ease'
                    }}>
                      {course.category}
                    </span>
                  </div>
                </div>
                
                <div style={{ padding: '25px' }}>
                  <h3 style={{ 
                    fontSize: '1.4rem', 
                    fontWeight: 'bold', 
                    marginBottom: '10px',
                    color: '#2D3748',
                    transform: hoveredId === course.id ? 'translateZ(10px)' : 'translateZ(0)',
                    transition: 'transform 0.3s ease',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    lineHeight: 1.4,
                    height: '2.8rem'
                  }}>
                    {course.title}
                  </h3>
                  
                  <p style={{ 
                    color: '#718096', 
                    fontSize: '0.95rem',
                    marginBottom: '15px',
                    transform: hoveredId === course.id ? 'translateZ(5px)' : 'translateZ(0)',
                    transition: 'transform 0.3s ease'
                  }}>
                    by <span style={{ color: '#4A5568', fontWeight: '600' }}>{course.instructor}</span>
                  </p>
                  
                  <div style={{ 
                    display: 'flex', 
                    marginBottom: '20px',
                    transform: hoveredId === course.id ? 'translateZ(8px)' : 'translateZ(0)',
                    transition: 'transform 0.3s ease'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      marginRight: '15px',
                      background: 'linear-gradient(135deg, #FEFEFE 0%, #F9F9F9 100%)',
                      padding: '6px 10px',
                      borderRadius: '8px'
                    }}>
                      <div style={{ 
                        color: '#F6AD55', 
                        marginRight: '5px',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        {'★'.repeat(Math.floor(course.rating))}
                        {course.rating % 1 !== 0 && '☆'}
                      </div>
                      <span style={{ fontWeight: 'bold', color: '#2D3748' }}>{course.rating.toFixed(1)}</span>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      background: 'linear-gradient(135deg, #FEFEFE 0%, #F9F9F9 100%)',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      color: '#718096'
                    }}>
                      <span style={{ fontSize: '0.9rem' }}>👨‍🎓</span>
                      <span style={{ marginLeft: '5px', fontWeight: '600' }}>{course.students.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transform: hoveredId === course.id ? 'translateZ(12px)' : 'translateZ(0)',
                    transition: 'transform 0.3s ease'
                  }}>
                    <div>
                      {course.discountPrice ? (
                        <div>
                          <span style={{ 
                            fontWeight: 'bold', 
                            fontSize: '1.4rem', 
                            background: 'linear-gradient(90deg, #3182CE, #5B21B6)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            display: 'inline-block'
                          }}>
                            ₹{course.discountPrice}
                          </span>
                          <span style={{ 
                            textDecoration: 'line-through', 
                            color: '#A0AEC0',
                            fontSize: '1rem',
                            marginLeft: '8px'
                          }}>
                            ₹{course.price}
                          </span>
                        </div>
                      ) : (
                        <span style={{ 
                          fontWeight: 'bold', 
                          fontSize: '1.4rem', 
                          background: 'linear-gradient(90deg, #3182CE, #5B21B6)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          display: 'inline-block'
                        }}>
                          ₹{course.price}
                        </span>
                      )}
                    </div>
                    
                    <button style={{
                      background: hoveredId === course.id 
                        ? 'linear-gradient(135deg, #4299E1 0%, #3182CE 100%)' 
                        : 'linear-gradient(135deg, #3182CE 0%, #2B6CB0 100%)',
                      color: 'white',
                      padding: '10px 18px',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: hoveredId === course.id 
                        ? '0 10px 20px rgba(66, 153, 225, 0.3), 0 3px 6px rgba(0,0,0,0.1)' 
                        : '0 4px 10px rgba(49, 130, 206, 0.2)',
                      transition: 'all 0.3s ease',
                      transform: hoveredId === course.id ? 'scale(1.05)' : 'scale(1)'
                    }}>
                      Enroll Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ 
          textAlign: 'center', 
          marginTop: '50px',
          transform: 'translateZ(20px)',
          perspective: '1000px'
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
            View All Programs
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modern3DPopularCourses; 