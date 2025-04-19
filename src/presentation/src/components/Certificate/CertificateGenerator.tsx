import { Box, Button, Text, useToast } from '@chakra-ui/react';
import React, { useRef, useState } from 'react';
import { formatCertificateDate, generateCertificatePDF } from '../../utils/certificateUtils';

import CertificateTemplate from './CertificateTemplate';

interface CertificateGeneratorProps {
  studentName: string;
  courseName: string;
  completionDate: string | Date;
  certificateId: string;
}

const CertificateGenerator: React.FC<CertificateGeneratorProps> = ({
  studentName,
  courseName,
  completionDate,
  certificateId
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  
  const formattedDate = formatCertificateDate(completionDate);
  
  const handleDownloadCertificate = async () => {
    try {
      setIsGenerating(true);
      
      // Generate a clean filename based on course name and student name
      const cleanCourseName = courseName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      const cleanStudentName = studentName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      const fileName = `bitselevate-certificate-${cleanCourseName}-${cleanStudentName}.pdf`;
      
      await generateCertificatePDF('certificate-container', fileName);
      
      toast({
        title: 'Certificate Downloaded',
        description: 'Your certificate has been generated and downloaded successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast({
        title: 'Download Failed',
        description: 'There was an error generating your certificate. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Box>
      <Box mb={6}>
        <Text fontSize="lg" fontWeight="bold" mb={3}>
          Congratulations on completing the course!
        </Text>
        <Text>
          You have earned a certificate of completion. Click the button below to download your certificate.
        </Text>
      </Box>
      
      <Button
        colorScheme="blue"
        size="lg"
        onClick={handleDownloadCertificate}
        isLoading={isGenerating}
        loadingText="Generating Certificate"
        leftIcon={<span role="img" aria-label="certificate">🎓</span>}
        mb={6}
      >
        Download Certificate
      </Button>
      
      <Box display="none">
        <div ref={certificateRef}>
          <CertificateTemplate
            studentName={studentName}
            courseName={courseName}
            completionDate={formattedDate}
            certificateId={certificateId}
          />
        </div>
      </Box>
    </Box>
  );
};

export default CertificateGenerator; 