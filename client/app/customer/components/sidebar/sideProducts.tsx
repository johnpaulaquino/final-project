"use client";

import Image from "next/image";
import { Product } from "./customerSidebar";
import { useCart } from "../../context/contextCart";

export default function SideProducts({ item }: { item: Product }) {

  return (
    <div className="flex items-center gap-3 xl:gap-4 group cursor-pointer animate-in fade-in slide-in-from-top-2 duration-300 py-1.5 xl:py-2 px-2 rounded-[5px] transition-colors hover:bg-zinc-50 border border-transparent hover:border-zinc-100">
      
      <div className="w-12 h-12 xl:w-14 xl:h-14 rounded-[5px] overflow-hidden bg-gray-100 flex-shrink-0 relative" aria-hidden="true">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 56px) 100vw, 56px"
          />
        ) : (
          <span className="text-[10px] text-gray-400 text-center leading-tight flex items-center justify-center h-full">
            No
            <br />
            Image
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 xl:gap-4 flex-grow min-w-0">
        <div className="flex-grow flex flex-col min-w-0">
          
          <h3 className="text-xs xl:text-sm font-bold text-gray-900 leading-tight mb-1 group-hover:text-[#800000] transition-colors line-clamp-1">
            {item.name}
          </h3>
          
          <div className="flex items-center justify-between gap-1 xl:gap-2 mt-1">
            <span className="text-[10px] xl:text-xs font-bold text-[#800000]">
              {item.price}
            </span>

            <div className="flex items-center gap-1 xl:gap-1.5 flex-shrink-0" aria-label={`Rating: ${item.rating} stars`}>
              <div className="w-3 h-3 xl:w-4 xl:h-4 text-yellow-400 flex items-center justify-center relative">
                <Image src="/icons/star.png" alt="" fill className="object-contain" aria-hidden="true" />
              </div>
              <span className="text-[10px] xl:text-xs font-bold text-gray-600">
                {item.rating}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}