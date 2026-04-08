import React from "react";
import Image from "next/image";

interface FeatureCardProps {
  imageSrc: string;
  title: string;
  desc: string;
}

export default function featureCard({
  imageSrc,
  title,
  desc,
}: FeatureCardProps) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-6 text-[#7f1d1d] relative overflow-hidden">
        <Image
          src={imageSrc}
          alt={`${title} icon`}
          width={25}
          height={25}
          className="object-contain"
        />
      </div>

      <h3 className="font-bold text-lg text-gray-900 mb-3">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
    </div>
  );
}
