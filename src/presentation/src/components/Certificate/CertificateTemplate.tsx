import './CertificateStyles.css';

import React from 'react';

interface CertificateTemplateProps {
  studentName: string;
  courseName: string;
  completionDate: string;
  certificateId: string;
}

const CertificateTemplate: React.FC<CertificateTemplateProps> = ({
  studentName,
  courseName,
  completionDate,
  certificateId
}) => {
  return (
    <div id="certificate-container" className="certificate-container">
      <div className="certificate">
        <div className="certificate-header">
          <div className="logo">
            <h1>BitsElevate</h1>
          </div>
          <h2 className="certificate-title">Certificate of Completion</h2>
        </div>
        
        <div className="certificate-body">
          <p className="certificate-statement">This is to certify that</p>
          <h2 className="student-name">{studentName}</h2>
          <p className="certificate-statement">has successfully completed the course</p>
          <h3 className="course-name">"{courseName}"</h3>
          <p className="completion-date">on {completionDate}</p>
          
          <div className="certificate-footer">
            <div className="signature">
              <div className="signature-line"></div>
              <p>Course Instructor</p>
            </div>
            
            <div className="signature">
              <div className="signature-line"></div>
              <p>BitsElevate Director</p>
            </div>
          </div>
          
          <div className="certificate-id">
            <p>Certificate ID: {certificateId}</p>
          </div>
        </div>
        
        <div className="certificate-border"></div>
      </div>
    </div>
  );
};

export default CertificateTemplate; 