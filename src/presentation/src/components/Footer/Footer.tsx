import { Box, Flex, Image, Text } from "@chakra-ui/react";

const Footer = () => {
  return (
    <div className="bg-[#c5ddff]">
      <Flex
        p={5}
        paddingBottom={{
          sm: "20px",
          md: "20px",
          lg: "20px",
        }}
        fontFamily="Source Sans 3"
        pt="20px"
        direction="column"
      >
        <Flex
          mt={5}
          gap={7}
          borderTop="1px solid #c9c9c9"
          direction={{
            sm: "column",
            md: "row",
            lg: "row",
          }}
          justifyContent={{
            lg: "space-between",
          }}
          alignItems="center"
          padding={{
            sm: "10px",
            md: "35px",
            lg: "16px",
          }}
        >
          <Box>
            {" "}
            <Text fontSize="13.5px">
              © 2025 BitsElevate Inc. All rights reserved.
            </Text>
          </Box>
          <Flex overflow='hidden'>
            <Image
              src="https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://s3.amazonaws.com/coursera_assets/footer/facebook.png?auto=format%2Ccompress&dpr=1&w=28&h=28&q=40"
              alt=""
              mr={4}
            />
            <Image
              src="https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://s3.amazonaws.com/coursera_assets/footer/linkedin.png?auto=format%2Ccompress&dpr=1&w=28&h=28&q=40"
              alt=""
              mr={4}
            />
            <Image
              src="https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://s3.amazonaws.com/coursera_assets/footer/twitter.png?auto=format%2Ccompress&dpr=1&w=28&h=28&q=40"
              alt=""
              mr={4}
            />
            <Image
              src="https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://s3.amazonaws.com/coursera_assets/footer/youtube.png?auto=format%2Ccompress&dpr=1&w=28&h=28&q=40"
              alt=""
              mr={4}
            />
            <Image
              display={{
                base: "none",
                sm: "block"
              }}
              src="https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://s3.amazonaws.com/coursera_assets/footer/instagram.png?auto=format%2Ccompress&dpr=1&w=28&h=28&q=40"
              alt=""
              mr={4}
            />
            <Image
              display={{
                base: "none",
                sm: "block"
              }}
              src="https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera_assets.s3.amazonaws.com/images/9b7e964107839c77644d7e7d15035b73.png?auto=format%2Ccompress&dpr=1&w=28&h=28&q=40"
              alt=""
              mr={4}
            />
          </Flex>
        </Flex>
      </Flex>
    </div>
  );
};

export default Footer;
