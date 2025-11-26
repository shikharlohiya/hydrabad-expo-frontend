//  import React, { useState } from "react";
// import { User, Phone, MapPin, Home, Ruler } from "lucide-react";

// export default function PoultryForm() {
//   const [isNewToPoultry, setIsNewToPoultry] = useState(null);
//   const [shedType, setShedType] = useState(null);
//   const [convertFarm, setConvertFarm] = useState(null);

//   const showConvertQuestion =
//     isNewToPoultry === false || (isNewToPoultry === true && shedType === "ec");

//   const showSubmitButton = convertFarm !== null;
//   const showEstimationButton = convertFarm === true;

//   const showShedSizeInput =
//     (isNewToPoultry === true && shedType !== null) ||
//     (isNewToPoultry === false && convertFarm === true);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-6">
//       <div className="w-full max-w-2xl bg-white p-8 rounded-3xl shadow-2xl border border-orange-100 relative">
//         <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 rounded-t-3xl" />

//         <h2 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">
//           Poultry Farm Details
//         </h2>

//         <form className="space-y-6">

//           {/* Name */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Name
//             </label>
//             <div className="relative">
//               <User className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 w-5 h-5" />
//               <input
//                 type="text"
//                 className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//                 placeholder="Enter your full name"
//               />
//             </div>
//           </div>

//           {/* Mobile */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Mobile
//             </label>
//             <div className="relative">
//               <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 w-5 h-5" />
//               <input
//                 type="text"
//                 maxLength={10}
//                 className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//                 placeholder="10-digit mobile number"
//               />
//             </div>
//           </div>

//           {/* Location */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Location
//             </label>
//             <div className="relative">
//               <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 w-5 h-5" />
//               <input
//                 type="text"
//                 className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//                 placeholder="Enter village/city"
//               />
//             </div>
//           </div>

//           {/* Pincode */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Pincode
//             </label>
//             <div className="relative">
//               <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 w-5 h-5" />
//               <input
//                 type="text"
//                 maxLength={6}
//                 className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//                 placeholder="Pincode"
//               />
//             </div>
//           </div>

//           {/* New to Poultry */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Are you new to poultry?
//             </label>
//             <div className="flex gap-4">
//               <button
//                 type="button"
//                 className={`px-4 py-2 rounded-xl border ${
//                   isNewToPoultry === true ? "bg-orange-500 text-white" : "border-orange-400"
//                 }`}
//                 onClick={() => {
//                   setIsNewToPoultry(true);
//                   setShedType(null);
//                   setConvertFarm(null);
//                 }}
//               >
//                 Yes
//               </button>

//               <button
//                 type="button"
//                 className={`px-4 py-2 rounded-xl border ${
//                   isNewToPoultry === false ? "bg-orange-500 text-white" : "border-orange-400"
//                 }`}
//                 onClick={() => {
//                   setIsNewToPoultry(false);
//                   setShedType(null);
//                   setConvertFarm(null);
//                 }}
//               >
//                 No
//               </button>
//             </div>
//           </div>

//           {/* Shed Type only if YES new */}
//           {isNewToPoultry === true && (
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Which shed type do you have?
//               </label>

//               <div className="flex gap-4">
//                 <button
//                   type="button"
//                   className={`px-4 py-2 rounded-xl border ${
//                     shedType === "open" ? "bg-orange-500 text-white" : "border-orange-400"
//                   }`}
//                   onClick={() => {
//                     setShedType("open");
//                     setConvertFarm(null);
//                   }}
//                 >
//                   Open
//                 </button>

//                 <button
//                   type="button"
//                   className={`px-4 py-2 rounded-xl border ${
//                     shedType === "ec" ? "bg-orange-500 text-white" : "border-orange-400"
//                   }`}
//                   onClick={() => setShedType("ec")}
//                 >
//                   EC
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Convert Existing Farm */}
//           {showConvertQuestion && (
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Do you want to convert your existing farm?
//               </label>

//               <div className="flex gap-4">
//                 <button
//                   type="button"
//                   className={`px-4 py-2 rounded-xl border ${
//                     convertFarm === true ? "bg-orange-500 text-white" : "border-orange-400"
//                   }`}
//                   onClick={() => setConvertFarm(true)}
//                 >
//                   Yes
//                 </button>

//                 <button
//                   type="button"
//                   className={`px-4 py-2 rounded-xl border ${
//                     convertFarm === false ? "bg-orange-500 text-white" : "border-orange-400"
//                   }`}
//                   onClick={() => setConvertFarm(false)}
//                 >
//                   No
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Shed Size for both cases */}
//           {showShedSizeInput && (
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Specify Shed Size (L * B)
//               </label>
//               <div className="relative">
//                 <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 w-5 h-5" />
//                 <input
//                   type="text"
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//                   placeholder="e.g. 200 * 40 Ft"
//                 />
//               </div>
//             </div>
//           )}

//           {/* Submit Button */}
//           {showSubmitButton && (
//             <button
//               type="button"
//               className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all"
//             >
//               {showEstimationButton ? "Submit & Get Estimation" : "Submit"}
//             </button>
//           )}
//         </form>
//       </div>
//     </div>
//   );
// }



// import React, { useState } from "react";
// import axios from "axios";
// import { User, Phone, MapPin, Home, Ruler } from "lucide-react";

// export default function PoultryForm() {
//   const [name, setName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [location, setLocation] = useState("");
//   const [pincode, setPincode] = useState("");
//   const [shedSize, setShedSize] = useState("");

//   const [isNewToPoultry, setIsNewToPoultry] = useState(null);
//   const [shedType, setShedType] = useState(null);
//   const [convertFarm, setConvertFarm] = useState(null);

//   const showConvertQuestion =
//     isNewToPoultry === false || (isNewToPoultry === true && shedType === "ec");

//   const showShedSizeInput =
//     (isNewToPoultry === true && shedType !== null) ||
//     (isNewToPoultry === false && convertFarm === true);

//   const showSubmitButton = convertFarm !== null;
//   const showEstimationButton = convertFarm === true;

//   const handleSubmit = async () => {
//     if (!name || !phone || !location || !pincode) {
//       alert("Please fill required fields!");
//       return;
//     }

//     const payload = {
//       name,
//       phone,
//       location,
//       pincode,
//       isNewToPoultry,
//       shedType,
//       shedSize,
//       convertFarm,
//     };

//     try {
//       const response = await axios.post(
//         "http://localhost:3005/api/create-hydrabad-estimation",
//         payload
//       );

//       alert("Estimation Submitted Successfully!");
//       console.log("✔ Response:", response.data);

//       // Reset form after success
//       setName("");
//       setPhone("");
//       setLocation("");
//       setPincode("");
//       setShedType(null);
//       setIsNewToPoultry(null);
//       setConvertFarm(null);
//       setShedSize("");

//     } catch (error) {
//       console.error("Error:", error);
//       alert("Something went wrong while submitting!");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-6">
//       <div className="w-full max-w-2xl bg-white p-8 rounded-3xl shadow-2xl border border-orange-100 relative">
//         <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 rounded-t-3xl" />

//         <h2 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">
//           Poultry Farm Details
//         </h2>

//         <form className="space-y-6">

//           {/* Name */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Name
//             </label>
//             <div className="relative">
//               <User className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 w-5 h-5" />
//               <input
//                 type="text"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//                 placeholder="Enter your full name"
//               />
//             </div>
//           </div>

//           {/* Mobile */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Mobile
//             </label>
//             <div className="relative">
//               <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 w-5 h-5" />
//               <input
//                 type="text"
//                 maxLength={10}
//                 value={phone}
//                 onChange={(e) => setPhone(e.target.value)}
//                 className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//                 placeholder="10-digit mobile number"
//               />
//             </div>
//           </div>

//           {/* Location */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Location
//             </label>
//             <div className="relative">
//               <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 w-5 h-5" />
//               <input
//                 type="text"
//                 value={location}
//                 onChange={(e) => setLocation(e.target.value)}
//                 className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//                 placeholder="Village/City"
//               />
//             </div>
//           </div>

//           {/* Pincode */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Pincode
//             </label>
//             <div className="relative">
//               <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 w-5 h-5" />
//               <input
//                 type="text"
//                 maxLength={6}
//                 value={pincode}
//                 onChange={(e) => setPincode(e.target.value)}
//                 className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//                 placeholder="Pincode"
//               />
//             </div>
//           </div>

//           {/* Are you new to Poultry */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Are you new to poultry?
//             </label>
//             <div className="flex gap-4">
//               <button
//                 type="button"
//                 className={`px-4 py-2 rounded-xl border ${
//                   isNewToPoultry === true
//                     ? "bg-orange-500 text-white"
//                     : "border-orange-400"
//                 }`}
//                 onClick={() => {
//                   setIsNewToPoultry(true);
//                   setConvertFarm(null);
//                   setShedType(null);
//                 }}
//               >
//                 Yes
//               </button>

//               <button
//                 type="button"
//                 className={`px-4 py-2 rounded-xl border ${
//                   isNewToPoultry === false
//                     ? "bg-orange-500 text-white"
//                     : "border-orange-400"
//                 }`}
//                 onClick={() => {
//                   setIsNewToPoultry(false);
//                   setConvertFarm(null);
//                   setShedType(null);
//                 }}
//               >
//                 No
//               </button>
//             </div>
//           </div>

//           {/* Shed Type only if YES new */}
//           {isNewToPoultry === true && (
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Which shed type do you have?
//               </label>

//               <div className="flex gap-4">
//                 <button
//                   type="button"
//                   className={`px-4 py-2 rounded-xl border ${
//                     shedType === "open"
//                       ? "bg-orange-500 text-white"
//                       : "border-orange-400"
//                   }`}
//                   onClick={() => {
//                     setShedType("open");
//                     setConvertFarm(null);
//                   }}
//                 >
//                   Open
//                 </button>

//                 <button
//                   type="button"
//                   className={`px-4 py-2 rounded-xl border ${
//                     shedType === "ec"
//                       ? "bg-orange-500 text-white"
//                       : "border-orange-400"
//                   }`}
//                   onClick={() => setShedType("ec")}
//                 >
//                   EC
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Convert Existing Farm */}
//           {showConvertQuestion && (
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Do you want to convert your existing farm?
//               </label>

//               <div className="flex gap-4">
//                 <button
//                   type="button"
//                   className={`px-4 py-2 rounded-xl border ${
//                     convertFarm === true
//                       ? "bg-orange-500 text-white"
//                       : "border-orange-400"
//                   }`}
//                   onClick={() => setConvertFarm(true)}
//                 >
//                   Yes
//                 </button>

//                 <button
//                   type="button"
//                   className={`px-4 py-2 rounded-xl border ${
//                     convertFarm === false
//                       ? "bg-orange-500 text-white"
//                       : "border-orange-400"
//                   }`}
//                   onClick={() => setConvertFarm(false)}
//                 >
//                   No
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Shed Size */}
//           {showShedSizeInput && (
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Specify Shed Size (L * B)
//               </label>
//               <div className="relative">
//                 <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 w-5 h-5" />
//                 <input
//                   type="text"
//                   value={shedSize}
//                   onChange={(e) => setShedSize(e.target.value)}
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//                   placeholder="e.g. 200 * 40 Ft"
//                 />
//               </div>
//             </div>
//           )}

//           {/* Submit Button */}
//           {showSubmitButton && (
//             <button
//               type="button"
//               onClick={handleSubmit}
//               className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 text-white py-4 rounded-xl font-bold shadow-lg hover:-translate-y-1 transition-all"
//             >
//               {showEstimationButton ? "Submit & Get Estimation" : "Submit"}
//             </button>
//           )}
//         </form>
//       </div>
//     </div>
//   );
// }





// import React, { useState } from "react";
// import axios from "axios";
// import { User, Phone, MapPin, Home, Ruler } from "lucide-react";

// export default function PoultryForm() {
//   const [name, setName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [location, setLocation] = useState("");
//   const [pincode, setPincode] = useState("");
//   const [shedSize, setShedSize] = useState("");

//   const [isNewToPoultry, setIsNewToPoultry] = useState(null);
//   const [shedType, setShedType] = useState(null);
//   const [convertFarm, setConvertFarm] = useState(null);

//   const showConvertQuestion =
//     isNewToPoultry === false || (isNewToPoultry === true && shedType === "ec");

//   const showShedSizeInput =
//     (isNewToPoultry === true && shedType !== null) ||
//     (isNewToPoultry === false && convertFarm === true);

//   const showSubmitButton = convertFarm !== null;
//   const showEstimationButton = convertFarm === true;

//   // 🧠 Extract numbers from shed size input
//   const extractDimensions = () => {
//     if (!shedSize) return { length: null, width: null };

//     const cleaned = shedSize.replace(/[^0-9 *xX]/g, "");
//     const parts = cleaned.split(/[*xX]/).map((p) => parseInt(p.trim()));

//     return { length: parts[0] || null, width: parts[1] || null };
//   };

//   const handleSubmit = async () => {
//     if (!name || !phone || !location || !pincode) {
//       alert("⚠️ Please fill required fields!");
//       return;
//     }

//     const payload = {
//       name,
//       phone,
//       location,
//       pincode,
//       isNewToPoultry,
//       shedType,
//       shedSize,
//       convertFarm,
//     };

//     try {
//       // 1️⃣ Save Form Data
//       await axios.post("http://localhost:3005/api/create-hydrabad-estimation", payload);
//       console.log("✔ Data saved to DB");

//       // 2️⃣ If Get Estimation required
//       if (showEstimationButton) {
//         const { length, width } = extractDimensions();
//         if (!length || !width) {
//           alert("❌ Please enter valid Shed Size like 200 * 40");
//           return;
//         }

//         const estimationURL =
//           `http://localhost:3005/api/equipment-estimation/generate-quotation` +
//           `?length=${length}&width=${width}` +
//           `&customer_name=${encodeURIComponent(name)}` +
//           `&customer_number=${phone}`;

//         const res = await axios.get(estimationURL);
//         console.log("📄 Estimation:", res.data);

//         alert("🎉 Estimation Generated Successfully!");

//       } else {
//         alert("✔ Submitted Successfully!");
//       }

//       // Form reset
//       setName("");
//       setPhone("");
//       setLocation("");
//       setPincode("");
//       setIsNewToPoultry(null);
//       setShedType(null);
//       setConvertFarm(null);
//       setShedSize("");

//     } catch (err) {
//       console.error("❌ API Error:", err);
//       alert("Something went wrong while submitting!");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-6">
//       <div className="w-full max-w-2xl bg-white p-8 rounded-3xl shadow-2xl border border-orange-100 relative">
//         <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 rounded-t-3xl" />

//         <h2 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">
//           Poultry Farm Details
//         </h2>

//         <form className="space-y-6">

//           {/* Name */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
//             <div className="relative">
//               <User className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 w-5 h-5" />
//               <input
//                 type="text"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
//                 placeholder="Enter your full name"
//               />
//             </div>
//           </div>

//           {/* Phone */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile</label>
//             <div className="relative">
//               <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 w-5 h-5" />
//               <input
//                 type="text"
//                 maxLength={10}
//                 value={phone}
//                 onChange={(e) => setPhone(e.target.value)}
//                 className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
//                 placeholder="10-digit mobile number"
//               />
//             </div>
//           </div>

//           {/* Location */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
//             <div className="relative">
//               <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 w-5 h-5" />
//               <input
//                 type="text"
//                 value={location}
//                 onChange={(e) => setLocation(e.target.value)}
//                 className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
//                 placeholder="Village/City"
//               />
//             </div>
//           </div>

//           {/* Pincode */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">Pincode</label>
//             <div className="relative">
//               <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 w-5 h-5" />
//               <input
//                 type="text"
//                 maxLength={6}
//                 value={pincode}
//                 onChange={(e) => setPincode(e.target.value)}
//                 className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
//                 placeholder="Pincode"
//               />
//             </div>
//           </div>

//           {/* New to Poultry */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Are you new to poultry?
//             </label>

//             <div className="flex gap-4">
//               <button
//                 type="button"
//                 className={`px-4 py-2 rounded-xl border ${
//                   isNewToPoultry === true ? "bg-orange-500 text-white" : "border-orange-400"
//                 }`}
//                 onClick={() => {
//                   setIsNewToPoultry(true);
//                   setConvertFarm(null);
//                   setShedType(null);
//                 }}
//               >Yes</button>

//               <button
//                 type="button"
//                 className={`px-4 py-2 rounded-xl border ${
//                   isNewToPoultry === false ? "bg-orange-500 text-white" : "border-orange-400"
//                 }`}
//                 onClick={() => {
//                   setIsNewToPoultry(false);
//                   setConvertFarm(null);
//                   setShedType(null);
//                 }}
//               >No</button>
//             </div>
//           </div>

//           {/* Shed Type */}
//           {isNewToPoultry === true && (
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Which shed type do you have?
//               </label>
//               <div className="flex gap-4">
//                 <button
//                   type="button"
//                   className={`px-4 py-2 rounded-xl border ${
//                     shedType === "open" ? "bg-orange-500 text-white" : "border-orange-400"
//                   }`}
//                   onClick={() => {
//                     setShedType("open");
//                     setConvertFarm(null);
//                   }}
//                 >Open</button>

//                 <button
//                   type="button"
//                   className={`px-4 py-2 rounded-xl border ${
//                     shedType === "ec" ? "bg-orange-500 text-white" : "border-orange-400"
//                   }`}
//                   onClick={() => setShedType("ec")}
//                 >EC</button>
//               </div>
//             </div>
//           )}

//           {/* Convert Farm */}
//           {showConvertQuestion && (
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Do you want to convert your existing farm?
//               </label>
//               <div className="flex gap-4">
//                 <button
//                   type="button"
//                   className={`px-4 py-2 rounded-xl border ${
//                     convertFarm === true ? "bg-orange-500 text-white" : "border-orange-400"
//                   }`}
//                   onClick={() => setConvertFarm(true)}
//                 >Yes</button>

//                 <button
//                   type="button"
//                   className={`px-4 py-2 rounded-xl border ${
//                     convertFarm === false ? "bg-orange-500 text-white" : "border-orange-400"
//                   }`}
//                   onClick={() => setConvertFarm(false)}
//                 >No</button>
//               </div>
//             </div>
//           )}

//           {/* Shed Size */}
//           {showShedSizeInput && (
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Specify Shed Size (L * B)
//               </label>
//               <div className="relative">
//                 <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 w-5 h-5" />
//                 <input
//                   type="text"
//                   value={shedSize}
//                   onChange={(e) => setShedSize(e.target.value)}
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
//                   placeholder="e.g. 200 * 40 Ft"
//                 />
//               </div>
//             </div>
//           )}

//           {/* Submit */}
//           {showSubmitButton && (
//             <button
//               type="button"
//               onClick={handleSubmit}
//               className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 text-white py-4 rounded-xl font-bold shadow-lg hover:-translate-y-1 transition-all"
//             >
//               {showEstimationButton ? "Submit & Get Estimation" : "Submit"}
//             </button>
//           )}

//         </form>
//       </div>
//     </div>
//   );
// }





import React, { useState } from "react";
import axios from "axios";
import { User, Phone, MapPin, Home, Ruler } from "lucide-react";

export default function PoultryForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [pincode, setPincode] = useState("");
  const [shedSize, setShedSize] = useState("");

  const [phoneError, setPhoneError] = useState("");
  const [shedSizeError, setShedSizeError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [isNewToPoultry, setIsNewToPoultry] = useState(null);
  const [shedType, setShedType] = useState(null);
  const [convertFarm, setConvertFarm] = useState(null);

  const showConvertQuestion =
    isNewToPoultry === false ||
    (isNewToPoultry === true && shedType === "ec");

  const showShedSizeInput =
    (isNewToPoultry === true && shedType !== null) ||
    (isNewToPoultry === false && convertFarm === true);

  // Check if all required fields are filled
  const isFormValid = () => {
    if (!name || !phone || !location || !pincode) return false;
    if (phone.length !== 10) return false;
    if (phoneError) return false;
    if (showShedSizeInput && shedSizeError) return false;
    if (convertFarm === null) return false;
    return true;
  };

  // Validate mobile number - only digits allowed
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    const digitsOnly = value.replace(/\D/g, ""); // Remove non-digits

    if (value !== digitsOnly) {
      setPhoneError("Only numbers are allowed");
    } else if (digitsOnly.length > 0 && digitsOnly.length < 10) {
      setPhoneError("Mobile number must be 10 digits");
    } else {
      setPhoneError("");
    }

    setPhone(digitsOnly);
  };

  // Validate shed size - only *, X, x, numbers and spaces allowed
  const handleShedSizeChange = (e) => {
    const value = e.target.value;
    const validPattern = /^[0-9*xX\s]*$/; // Only numbers, *, X, x, and spaces

    if (!validPattern.test(value)) {
      setShedSizeError("Only numbers, * and X are allowed");
      return;
    }

    setShedSizeError("");
    setShedSize(value);
  };

  // Extract L * B from input
  const extractDimensions = () => {
    if (!shedSize) return { length: null, width: null };

    const cleaned = shedSize.replace(/[^0-9 *xX]/g, "");
    const parts = cleaned.split(/[*xX]/).map((p) => parseInt(p.trim()));

    return { length: parts[0] || null, width: parts[1] || null };
  };

  const handleSubmit = async () => {
    if (!name || !phone || !location || !pincode) {
      alert("⚠️ Please fill required fields!");
      return;
    }

    // Check for validation errors
    if (phoneError) {
      alert("⚠️ Please fix mobile number error!");
      return;
    }

    if (phone.length !== 10) {
      alert("⚠️ Mobile number must be exactly 10 digits!");
      return;
    }

    if (showShedSizeInput && shedSizeError) {
      alert("⚠️ Please fix shed size error!");
      return;
    }

    setIsLoading(true);

    const payload = {
      name,
      phone,
      location,
      pincode,
      isNewToPoultry,
      shedType,
      shedSize,
      convertFarm,
    };

    try {
      // 1️⃣ Save form data to DB
      await axios.post("https://hyderabadexpo-api.abisibg.com/api/create-hydrabad-estimation", payload);
      console.log("✔ Data saved to DB!");

      // 2️⃣ Generate estimation PDF if shed size is provided
      if (shedSize && shedSize.trim() !== "") {
        const { length, width } = extractDimensions();

        if (length && width) {
          const estimationURL =
            ` https://hyderabadexpo-api.abisibg.com/api/equipment-estimation/generate-quotation` +
            `?length=${length}&width=${width}` +
            `&customer_name=${encodeURIComponent(name)}` +
            `&customer_number=${phone}`;

          const res = await axios.get(estimationURL, {
            responseType: "blob",
          });

          const blob = new Blob([res.data], { type: "application/pdf" });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `Quotation_${length}x${width}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();

          alert("🎉 Estimation downloaded successfully!");
        } else {
          alert("✔ Submitted successfully!");
        }
      } else {
        alert("✔ Submitted successfully!");
      }

      // Reset form
      setName("");
      setPhone("");
      setLocation("");
      setPincode("");
      setShedSize("");
      setIsNewToPoultry(null);
      setShedType(null);
      setConvertFarm(null);

    } catch (error) {
      console.error(error);
      alert("❌ Something went wrong while submitting!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white p-8 rounded-3xl shadow-2xl border border-green-100 relative">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-t-3xl" />

        <h2 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">
          HYDRABAD EXPO 2025
        </h2>

        <form className="space-y-6">

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 w-5 h-5" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 w-5 h-5" />
              <input
                type="text"
                maxLength={10}
                value={phone}
                onChange={handlePhoneChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 ${
                  phoneError ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="10-digit mobile number"
              />
            </div>
            {phoneError && (
              <p className="text-red-500 text-sm mt-1">{phoneError}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 w-5 h-5" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                placeholder="Village/City"
              />
            </div>
          </div>

          {/* Pincode */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Pincode</label>
            <div className="relative">
              <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 w-5 h-5" />
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                placeholder="Pincode"
              />
            </div>
          </div>

          {/* Are you new to Poultry? */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Are you new to poultry?</label>
            <div className="flex gap-4">
              <button
                type="button"
                className={`px-4 py-2 rounded-xl border ${isNewToPoultry === true ? "bg-green-500 text-white" : "border-green-400"}`}
                onClick={() => {
                  setIsNewToPoultry(true);
                  setConvertFarm(null);
                  setShedType(null);
                }}
              >
                Yes
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-xl border ${isNewToPoultry === false ? "bg-green-500 text-white" : "border-green-400"}`}
                onClick={() => {
                  setIsNewToPoultry(false);
                  setConvertFarm(null);
                  setShedType(null);
                }}
              >
                No
              </button>
            </div>
          </div>

          {/* Shed Type */}
          {isNewToPoultry === true && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Which shed type do you have?</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  className={`px-4 py-2 rounded-xl border ${shedType === "open" ? "bg-green-500 text-white" : "border-green-400"}`}
                  onClick={() => {
                    setShedType("open");
                    setConvertFarm(null);
                  }}
                >
                  Open
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded-xl border ${shedType === "ec" ? "bg-green-500 text-white" : "border-green-400"}`}
                  onClick={() => setShedType("ec")}
                >
                  EC
                </button>
              </div>
            </div>
          )}

          {/* Convert Farm */}
          {showConvertQuestion && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Do you want to convert your existing farm?</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  className={`px-4 py-2 rounded-xl border ${convertFarm === true ? "bg-green-500 text-white" : "border-green-400"}`}
                  onClick={() => setConvertFarm(true)}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded-xl border ${convertFarm === false ? "bg-green-500 text-white" : "border-green-400"}`}
                  onClick={() => setConvertFarm(false)}
                >
                  No
                </button>
              </div>
            </div>
          )}

          {/* Shed Size */}
          {showShedSizeInput && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Specify Shed Size (L × B)</label>
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 w-5 h-5" />
                <input
                  type="text"
                  value={shedSize}
                  onChange={handleShedSizeChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 ${
                    shedSizeError ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g. 200 * 40 Ft"
                />
              </div>
              {shedSizeError && (
                <p className="text-red-500 text-sm mt-1">{shedSizeError}</p>
              )}
            </div>
          )}

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid() || isLoading}
            className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all ${
              !isFormValid() || isLoading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white hover:-translate-y-1"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {shedSize ? "Generating Estimation..." : "Submitting..."}
              </span>
            ) : (
              shedSize && showShedSizeInput ? "Submit & Get Estimation" : "Submit"
            )}
          </button>

        </form>
      </div>
    </div>
  );
}
