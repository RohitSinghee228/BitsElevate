// FeatureCard.js

interface FeatureCardProps {
  icon: React.ReactNode;
  heading: string;
  para: string;
}

function FeatureCard({ icon, heading, para }: FeatureCardProps) {
  return (
    <div className="featureCard flex items-center">
      <div className="iconDiv flex items-center justify-center mr-4">
        {icon}
      </div>
      <div className="aboutDiv">
        <h4 className="text-lg font-semibold mb-1">{heading}</h4>
        <p className="text-sm">{para}</p>
      </div>
    </div>
  );
}

export default FeatureCard;
