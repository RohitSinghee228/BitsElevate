import { FaSearch } from "react-icons/fa";
import cover from "/titlepic.jpg";

function Banner() {
  return (
    <div className="adImageDiv relative">
      <div className="offerDiv ml-8 absolute bg-white w-[500px] h-[350px] top-20 left-1/6 rounded-md shadow-lg p-8 text-left">
        <h2 className="text-5xl font-bold mb-4">Learn on your schedule</h2>
        <p className="text-2xl mb-6">
          Study any topic, anytime. Explore thousands of courses starting at ₹1000 each.
        </p>
        <div className="searchBarDiv mt-6 relative">
          <input
            className="searchBar w-full h-14 px-6 text-lg border border-gray-300 rounded-md"
            placeholder="What do you want to learn?"
          ></input>
          <div className="searchIconDiv absolute h-full w-16 flex justify-center items-center top-0 right-4 cursor-pointer">
           {/* react ions search icon */}
            <FaSearch className="text-xl" />
          </div>
        </div>
      </div>
      <img src={cover} alt="cover" className="w-full h-[550px] object-cover" />
     
    </div>
  );
}

export default Banner;
