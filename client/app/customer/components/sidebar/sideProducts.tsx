"use client";

import Image from "next/image";
import { Product } from "./customerSidebar";
import { useCart } from "../../context/contextCart";

export default function sideProducts({ item }: { item: Product }) {
  const { addToCart } = useCart();

<<<<<<< HEAD
  return (
    <div className="flex items-center gap-4 group cursor-pointer animate-in fade-in slide-in-from-top-2 duration-300 py-2 px-2 rounded-[5px] transition-colors hover:bg-zinc-50 border border-transparent hover:border-zinc-100">
      
      {/* image para sa prodyuct (Kept exactly as you wrote it with Next/Image) */}
=======
  const StarIcon = () => (
    <div className="w-4 h-4 text-yellow-400 flex items-center justify-center">
      {/* icon for ratings */}
      <Image src="/icons/star.png" alt="Star Rating" width={20} height={20} />
    </div>
  );

  const CartIcon = () => (
    <div className="font-bold w-5 h-5 text-white flex items-center justify-center">
      <Image
        src="/icons/add-to-cart.png"
        alt="Add to Cart"
        width={15}
        height={15}
        className="object-contain w-4 h-4 rounded-full"
      />
    </div>
  );

  return (
    <div className="flex items-center gap-4 group cursor-pointer animate-in fade-in slide-in-from-top-2 duration-300 py-2 px-2 rounded-[5px] transition-colors hover:bg-zinc-50 border border-transparent hover:border-zinc-100">
      {/* image para sa prodyuct */}
>>>>>>> main
      <div className="w-14 h-14 rounded-[5px] overflow-hidden bg-gray-100 flex-shrink-0 relative">
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

      {/* product details */}
      <div className="flex items-center justify-between gap-4 flex-grow">
        <div className="flex-grow flex flex-col">
          <h3 className="text-sm font-bold text-gray-900 leading-tight mb-1 group-hover:text-[#800000] transition-colors">
            {item.name}
          </h3>
          <div className="flex items-center justify-between gap-2 mt-1">
            <span className="text-xs font-bold text-[#800000]">
              {item.price}
            </span>

            <div className="flex items-center gap-1.5 flex-shrink-0">
<<<<<<< HEAD
                
                {/* Star Icon (Moved inline to fix React re-rendering bug) */}
                <div className="w-4 h-4 text-yellow-400 flex items-center justify-center">
                  <Image 
                    src="/icons/star.png" 
                    alt="Star Rating" 
                    width={20} 
                    height={20} 
                  />
                </div>
                        
=======
              <StarIcon />

>>>>>>> main
              <span className="text-xs font-bold text-gray-600">
                {item.rating}
              </span>
            </div>
          </div>
        </div>

        {/* button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
<<<<<<< HEAD
            addToCart(item as any);
          }} 
          className="cursor-pointer flex items-center justify-center p-2 rounded-full bg-black opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm transform hover:scale-105"
        >    
          
          {/* add to cart icon  */}
          <div className="font-bold w-5 h-5 text-white flex items-center justify-center">
            <Image 
              src="/icons/add-to-cart.png" 
              alt="Add to Cart" 
              width={15} 
              height={15} 
              className="object-contain w-4 h-4 rounded-full invert"
            />
          </div>

=======
            addToCart(item);
          }}
          className="cursor-pointer flex items-center justify-center p-2 rounded-full bg-black opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm transform hover:scale-105"
        >
          <CartIcon />
>>>>>>> main
        </button>
      </div>
    </div>
  );
}
