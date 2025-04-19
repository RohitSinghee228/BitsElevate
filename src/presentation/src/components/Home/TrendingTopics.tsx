import { Box, Flex, Grid, Heading, Icon, Text } from "@chakra-ui/react";
import { FaChartLine, FaCode, FaLaptopCode, FaChartBar, FaPalette, FaLanguage, 
  FaRobot, FaMoneyBillWave, FaBrain, FaMobileAlt, FaDatabase, FaHeadset } from "react-icons/fa";
import { Link } from "react-router-dom";

interface TopicCardProps {
  icon: React.ElementType;
  title: string;
  count: number;
  color: string;
}

const TopicCard = ({ icon, title, count, color }: TopicCardProps) => {
  return (
    <Link to={`/topics/${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <Box 
        p={4} 
        borderRadius="lg" 
        boxShadow="md" 
        bg="white" 
        transition="all 0.3s"
        _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
        h="100%"
      >
        <Flex direction="column" align="center" textAlign="center">
          <Icon as={icon} fontSize="3xl" mb={3} color={color} />
          <Text fontWeight="bold" fontSize="lg" mb={1}>{title}</Text>
          <Text fontSize="sm" color="gray.500">{count}+ courses</Text>
        </Flex>
      </Box>
    </Link>
  );
};

const TrendingTopics = () => {
  const topics = [
    { icon: FaCode, title: "Web Development", count: 850, color: "#4299E1" },
    { icon: FaRobot, title: "AI & Machine Learning", count: 720, color: "#805AD5" },
    { icon: FaDatabase, title: "Data Science", count: 640, color: "#38B2AC" },
    { icon: FaLaptopCode, title: "Software Engineering", count: 590, color: "#3182CE" },
    { icon: FaMobileAlt, title: "Mobile Development", count: 480, color: "#DD6B20" },
    { icon: FaChartBar, title: "Business Analytics", count: 420, color: "#F6AD55" },
    { icon: FaPalette, title: "Design & UI/UX", count: 380, color: "#F56565" },
    { icon: FaLanguage, title: "Language Learning", count: 340, color: "#48BB78" },
    { icon: FaChartLine, title: "Marketing", count: 320, color: "#9F7AEA" },
    { icon: FaMoneyBillWave, title: "Finance", count: 290, color: "#4FD1C5" },
    { icon: FaBrain, title: "Personal Development", count: 270, color: "#B794F4" },
    { icon: FaHeadset, title: "IT Certification", count: 240, color: "#68D391" }
  ];

  return (
    <Box py={10} px={4} bg="gray.50">
      <Box maxW="1200px" mx="auto">
        <Heading 
          as="h2" 
          fontSize={["2xl", "3xl"]} 
          fontWeight="bold" 
          mb={8} 
          textAlign="center"
          position="relative"
          _after={{
            content: '""',
            display: 'block',
            width: '80px',
            height: '4px',
            bg: 'blue.500',
            margin: '12px auto 0'
          }}
        >
          Trending Topics to Explore
        </Heading>
        <Text fontSize="lg" textAlign="center" mb={10} maxW="800px" mx="auto" color="gray.600">
          Discover the most in-demand skills and subjects that thousands of students are learning right now
        </Text>
        
        <Grid 
          templateColumns={{ 
            base: "repeat(1, 1fr)", 
            sm: "repeat(2, 1fr)", 
            md: "repeat(3, 1fr)", 
            lg: "repeat(4, 1fr)" 
          }} 
          gap={6}
        >
          {topics.map((topic, index) => (
            <TopicCard 
              key={index} 
              icon={topic.icon} 
              title={topic.title} 
              count={topic.count}
              color={topic.color}
            />
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default TrendingTopics; 