// Feature1.js

import { BiStar, BiTime, BiVideo } from "react-icons/bi";

import FeatureCard from "./FeatureCard";

function Feature1() {
  return (
    <div className="featureDiv1 flex justify-around items-center py-4 border-b border-gray-300">
      <FeatureCard
        icon={<BiVideo className="w-10 h-10" />}
        heading="130,000 online courses"
        para="Enjoy a variety of fresh topics"
      />
      <FeatureCard
        icon={<BiStar className="w-10 h-10" />}
        heading="Expert instruction"
        para="Find the right instructor for you"
      />
      <FeatureCard
        icon={<BiTime className="w-10 h-10" />}
        heading="Lifetime access"
        para="Learn on your schedule"
      />
    </div>
  );
}

export default Feature1;
