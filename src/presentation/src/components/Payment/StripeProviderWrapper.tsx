import { Elements } from "@stripe/react-stripe-js";
import { PropsWithChildren } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("your-publishable-key-here");

const StripeProviderWrapper = ({ children }: PropsWithChildren) => {
  return <Elements stripe={stripePromise}>{children}</Elements>;
};

export default StripeProviderWrapper;
