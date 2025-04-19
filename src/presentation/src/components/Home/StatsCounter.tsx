import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Flex,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';
import { 
  FaGraduationCap, 
  FaLaptopCode, 
  FaUserGraduate, 
  FaGlobe, 
  FaAward, 
  FaUsers 
} from 'react-icons/fa';

interface CountUpProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}

const CountUp = ({ end, duration = 2000, suffix = "", prefix = "" }: CountUpProps) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    const step = Math.ceil(end / (duration / 50)); // Update roughly every 50ms
    
    timerRef.current = setInterval(() => {
      if (countRef.current + step >= end) {
        setCount(end);
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        countRef.current += step;
        setCount(countRef.current);
      }
    }, 50);
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [end, duration]);
  
  return (
    <StatNumber fontSize={{ base: "3xl", md: "4xl" }} fontWeight="bold">
      {prefix}{count.toLocaleString()}{suffix}
    </StatNumber>
  );
};

interface StatData {
  id: string;
  label: string;
  value: number;
  icon: React.ElementType;
  suffix?: string;
  prefix?: string;
  helpText: string;
  duration?: number;
  color: string;
}

const StatsCounter = () => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const bgColor = useColorModeValue("white", "gray.800");
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => {
      observer.disconnect();
    };
  }, []);
  
  const stats: StatData[] = [
    {
      id: "1",
      label: "Total Students",
      value: 250000,
      icon: FaUserGraduate,
      helpText: "From over 190 countries worldwide",
      duration: 2500,
      suffix: "+",
      color: "blue.500"
    },
    {
      id: "2",
      label: "Courses Available",
      value: 1250,
      icon: FaLaptopCode,
      helpText: "Across 15 different categories",
      duration: 2000,
      suffix: "+",
      color: "purple.500"
    },
    {
      id: "3",
      label: "Certified Instructors",
      value: 500,
      icon: FaGraduationCap,
      helpText: "Industry experts and academics",
      duration: 1800,
      suffix: "+",
      color: "green.500"
    },
    {
      id: "4",
      label: "Completion Rate",
      value: 87,
      icon: FaAward,
      helpText: "Higher than industry average",
      duration: 1500,
      suffix: "%",
      color: "orange.500"
    },
    {
      id: "5",
      label: "Global Reach",
      value: 190,
      icon: FaGlobe,
      helpText: "Countries with active students",
      duration: 1700,
      suffix: "+",
      color: "cyan.500"
    },
    {
      id: "6",
      label: "Learning Communities",
      value: 325,
      icon: FaUsers,
      helpText: "Active study groups",
      duration: 1900,
      suffix: "",
      color: "red.500"
    }
  ];

  return (
    <Box py={14} bg="gray.100" ref={containerRef}>
      <Container maxW="container.xl">
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={10}>
          {stats.map((stat) => (
            <Box
              key={stat.id}
              bg={bgColor}
              p={6}
              borderRadius="lg"
              boxShadow="md"
              transition="all 0.3s"
              _hover={{
                transform: "translateY(-5px)",
                boxShadow: "lg"
              }}
            >
              <Flex align="center" mb={3}>
                <Flex
                  w="50px"
                  h="50px"
                  borderRadius="full"
                  bg={stat.color}
                  justify="center"
                  align="center"
                  mr={4}
                >
                  <Icon as={stat.icon} color="white" fontSize="xl" />
                </Flex>
                <StatLabel fontSize="lg" fontWeight="medium">
                  {stat.label}
                </StatLabel>
              </Flex>
              
              <Stat>
                {isVisible ? (
                  <CountUp
                    end={stat.value}
                    duration={stat.duration}
                    suffix={stat.suffix}
                    prefix={stat.prefix}
                  />
                ) : (
                  <StatNumber fontSize={{ base: "3xl", md: "4xl" }} fontWeight="bold">
                    0{stat.suffix || ""}
                  </StatNumber>
                )}
                <StatHelpText fontSize="sm" color="gray.500">
                  {stat.helpText}
                </StatHelpText>
              </Stat>
            </Box>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default StatsCounter; 