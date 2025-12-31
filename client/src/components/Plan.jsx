import React from "react";
import { Check } from "lucide-react";

const Plan = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      description: "Perfect for getting started",
      features: [
        "5 AI-generated articles per month",
        "Basic blog title suggestions",
        "Standard generation speed",
        "Email support",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Pro",
      price: "$19",
      period: "/month",
      description: "Best for content creators",
      features: [
        "Unlimited AI-generated articles",
        "Advanced blog title suggestions",
        "Fast generation speed",
        "Priority support",
        "Custom writing styles",
        "Export to multiple formats",
      ],
      cta: "Upgrade Now",
      popular: true,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto z-20 my-30 px-4">
      <div className="text-center mb-12">
        <h2 className="text-slate-700 text-[42px] font-semibold">
          Choose Your Plan
        </h2>
        <p className="text-gray-500 max-w-lg mx-auto mt-4">
          Start for free and scale up as you grow. Find the perfect plan for
          your content creation needs.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-sm:mx-4">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`relative bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition-transform hover:scale-105 ${
              plan.popular ? "border-purple-500" : "border-transparent"
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-purple-500 text-white text-sm font-medium px-3 py-1 rounded-bl-lg">
                Most Popular
              </div>
            )}

            <div className="p-8">
              <h3 className="text-xl font-semibold text-slate-700">
                {plan.name}
              </h3>
              <p className="text-gray-500 mt-2 text-sm">{plan.description}</p>

              <div className="mt-6 flex items-baseline">
                <span className="text-4xl font-bold text-slate-700">
                  {plan.price}
                </span>
                <span className="text-gray-500 ml-1">{plan.period}</span>
              </div>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full mt-8 py-3 rounded-lg font-medium transition ${
                  plan.popular
                    ? "bg-purple-500 text-white hover:bg-purple-600"
                    : "bg-slate-700 text-white hover:bg-slate-800"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Plan;
