import { Box, Flex, Select, Text } from '@chakra-ui/react';

import React from 'react';

interface SortSideBarProps {
  handleSort: (value: string, type: 'price' | 'time') => void;
}

const SortSideBar: React.FC<SortSideBarProps> = ({ handleSort }) => {
  return (
    <Box width="20%" p="20px">
      <Flex direction="column" mb="20px">
        <Text fontWeight="bold" mb="5px">Sort By Price:</Text>
        <Select onChange={(e) => handleSort(e.target.value, 'price')}>
          <option value="asc">Low to High</option>
          <option value="desc">High to Low</option>
        </Select>
      </Flex>
      <Flex direction="column">
        <Text fontWeight="bold" mb="5px">Sort By Time:</Text>
        <Select onChange={(e) => handleSort(e.target.value, 'time')}>
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
        </Select>
      </Flex>
    </Box>
  );
}

export default SortSideBar;
