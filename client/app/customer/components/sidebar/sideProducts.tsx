'use client';

export interface Product {
  id: number;
  name: string;
  price: string;
  rating: string;
  image: string;
}

export default function sideProducts({ item }: { item: Product }) {

    const StarIcon = () => (
        <div className="w-4 h-4 text-yellow-400 flex items-center justify-center">
          {/* icon for ratings */}
        </div>
    );    

    const CartIcon = () => (
        <div className="w-5 h-5 text-white flex items-center justify-center">
        {/* icon for cart */}
        </div>
    );

  return (
    <div className="flex items-center gap-4 group cursor-pointer animate-in fade-in slide-in-from-top-2 duration-300 py-2 px-2 rounded-xl transition-colors hover:bg-zinc-50 border border-transparent hover:border-zinc-100">
      
      {/* image para sa prodyuct */}
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
        {/* dito lalagay ang image */}
      </div>

      {/*  */}
      <div className="flex items-center justify-between gap-4 flex-grow">
        {/* A. Text and Rating Block */}
        <div className="flex-grow flex flex-col">
          <h3 className="text-sm font-bold text-gray-900 leading-tight mb-1 group-hover:text-[#800000] transition-colors">
            {item.name}
          </h3>
          <div className="flex items-center justify-between gap-2 mt-1">
            <span className="text-xs font-bold text-[#800000]">
                {item.price}
            </span>
                    
            <div className="flex items-center gap-1.5 flex-shrink-0">
                        
                <StarIcon />
                        
              <span className="text-xs font-bold text-gray-600">
                {item.rating}
              </span> 
            </div>
          </div>
        </div>

        {/* button */}
        <button 
          className="flex items-center justify-center p-1 rounded-[5px] bg-[#FFB703] opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm transform hover:scale-105 transition-transform"
          onClick={(e) => {
            e.stopPropagation(); // para ma prevent ang click event from pag trigger sa parent element
            alert(`Added ${item.name} to cart!`);
        }}>
                
          <CartIcon />

        </button>
      </div>
    </div>
  );
}