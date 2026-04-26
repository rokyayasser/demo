import React from "react";
import Button from "./Button";

const CarouselCard = ({
  item,
  Meta1Icon,
  Meta2Icon,
  ButtonIcon,
  buttonText,
  className = "",
  onClick,
  to
}) => {
  return (
    <div  className={`absolute group w-[280px] md:w-[380px] transition-all duration-500 ease-in-out cursor-pointer select-none ${className}`}>
      <div
        className="relative bg-black 
        rounded-[32px] overflow-hidden
        h-[450px] md:h-[540px]  flex flex-col
        shadow-xl shadow-black/20
        transition-all duration-500 ease-out
        group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-black/40"
      >
        {/* Full Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover pointer-events-none transition-transform duration-700 ease-out group-hover:scale-110"
            draggable="false"
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/40 to-transparent transition-opacity duration-500 group-hover:opacity-90"></div>

    <div
          className="absolute top-[5%] right-6
          bg-[#1D014B]
          text-[#E4DFE6]
          px-4 py-1.5 rounded-lg font-bold text-sm
          shadow-lg
          border border-[#4e2d8f]
          z-10"
        >
          {item.price  || item.category}
        </div>

        {/* Content - Positioned at the bottom */}
        <div className="absolute bottom-0 w-full p-6 flex flex-col text-start z-10">
          
          {/* Title */}
          <h4 className="text-3xl font-bold text-white mb-1 drop-shadow-lg transition-transform duration-500 ease-out group-hover:translate-x-1">
            {item.title}
          </h4>

          {/* Description */}
          <p className="text-gray-300 text-sm mb-4 line-clamp-1 drop-shadow-md transition-transform duration-500 ease-out group-hover:translate-x-1 delay-75">
            {item.desc
              ? item.desc.match(/([^.!?؟]+[.!?؟]+){1,2}/)?.[0]?.trim() ||
                item.desc
              : ""}
          </p>

          {/* Meta Data Row */}
          <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-200 transition-transform duration-500 ease-out group-hover:translate-x-1 delay-100">
          

             

            

            {item.meta1 && (
              <div className="flex items-center gap-1.5">
                {Meta1Icon && <Meta1Icon className="text-base opacity-80" />}
                <span>{item.meta1}</span>
              </div>
            )}

            {item.meta2 && (
              <div className="flex items-center gap-1.5">
                {Meta2Icon && (
                  <Meta2Icon
                    className={`text-base opacity-80 ${
                      item.meta2?.toString()?.includes(".")
                        ? "fill-yellow-400 text-yellow-400"
                        : ""
                    }`}
                  />
                )}
                <span>{item.meta2}</span>
              </div>
            )}
          </div>

          {/* Button */}
          <Button 
            to={to} 
            onClick={onClick}
            className="w-full bg-white hover:bg-gray-100 hover:scale-[1.02] text-black border-none rounded-full py-3.5 font-semibold transition-all duration-300 shadow-md group-hover:shadow-lg"
          >
            <div className="flex justify-center items-center gap-2">
              {ButtonIcon && <ButtonIcon className="text-lg text-white " />}
              {buttonText}
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CarouselCard;






// ----------- THE OLD CARD BEFORE UPDATE -------------

// import React from "react";
// import Button from "./Button";

// const CarouselCard = ({
//   item,
//   Meta1Icon,
//   Meta2Icon,
//   ButtonIcon,
//   buttonText,
//   className = "",
//   onClick,
//   to
// }) => {
//   return (
//     <div
//       onClick={onClick}
//       className={`absolute w-[280px] md:w-[320px] transition-all duration-500 ease-in-out cursor-pointer select-none ${className}`}
//     >
//       <div
//         className="bg-white backdrop-blur-lg 
//         rounded-2xl overflow-hidden
//         h-[480px] flex flex-col
//         border border-[#4e2d8f]
//         shadow-xl shadow-black/30"
//       >
//         <div className="h-[45%] w-full relative">
//           <img
//             src={item.image}
//             alt={item.title}
//             className="w-full h-full object-cover pointer-events-none"
//             draggable="false"
//           />
//         </div>

//         <div
//           className="absolute top-[41%] left-6
//           bg-[#1D014B]
//           text-[#E4DFE6]
//           px-4 py-1.5 rounded-lg font-bold text-sm
//           shadow-lg
//           border border-[#4e2d8f]
//           z-10"
//         >
//           {item.price || item.category }
//         </div>

//         <div className="p-5 flex flex-col flex-grow text-right mt-3">
//           <h4 className="text-xl font-bold gradient-text line-clamp-1 mb-3">
//             {item.title}
//           </h4>

//           <p className="text-gray-700 text-sm leading-relaxed mb-4 flex-grow line-clamp-2">
//             {item.desc
//               ? item.desc.match(/([^.!?؟]+[.!?؟]+){1,2}/)?.[0]?.trim() ||
//                 item.desc
//               : ""}
//           </p>

//           <div
//             className="flex justify-between items-center mb-5
            
//             rounded-lg p-2.5
//             gradient-secondary
//           "
//           >
//             <div className="flex items-center gap-2 text-sm text-[#E4DFE6]">
//               {Meta1Icon && <Meta1Icon className="text-lg" />}
//               <span>{item.meta1}</span>
//             </div>

//             <div className="w-[1px] h-5 bg-[#4e2d8f]"></div>

//             <div className="flex items-center gap-2 text-sm text-[#E4DFE6]">
//               {Meta2Icon && (
//                 <Meta2Icon
//                   className={`text-lg ${
//                     item.meta2?.toString()?.includes(".")
//                       ? "fill-yellow-400 text-yellow-400"
//                       : ""
//                   }`}
//                 />
//               )}
//               <span>{item.meta2}</span>
//             </div>
//           </div>

//           <Button className="w-full " to={to} >
//             <div className="flex justify-center items-center gap-2">
//               {ButtonIcon && <ButtonIcon className="text-lg" />}
//               {buttonText}
//             </div>
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CarouselCard;