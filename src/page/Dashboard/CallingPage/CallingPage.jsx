// import React, { useState } from "react";

// const IframeComponent = ({
//   src,
//   width = "100%",
//   height = "600px",
//   title = "Embedded content",
//   allowFullScreen = false,
//   sandbox = "",
//   loading = "lazy",
//   className = "",
//   style = {},
//   onLoad = () => {},
//   onError = () => {},
//   showLoadingSpinner = true,
//   errorMessage = "Failed to load content",
// }) => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [hasError, setHasError] = useState(false);

//   const handleLoad = () => {
//     setIsLoading(false);
//     setHasError(false);
//     onLoad();
//   };

//   const handleError = () => {
//     setIsLoading(false);
//     setHasError(true);
//     onError();
//   };

//   const iframeStyles = {
//     border: "none",
//     width,
//     height,
//     ...style,
//   };

//   return (
//     <div
//       className={`iframe-container ${className}`}
//       style={{ position: "relative" }}
//     >
//       {isLoading && showLoadingSpinner && (
//         <div
//           style={{
//             position: "absolute",
//             top: "50%",
//             left: "50%",
//             transform: "translate(-50%, -50%)",
//             zIndex: 1,
//             display: "flex",
//             alignItems: "center",
//             gap: "8px",
//             color: "#666",
//           }}
//         >
//           <div
//             style={{
//               width: "20px",
//               height: "20px",
//               border: "2px solid #f3f3f3",
//               borderTop: "2px solid #3498db",
//               borderRadius: "50%",
//               animation: "spin 1s linear infinite",
//             }}
//           ></div>
//           Loading...
//         </div>
//       )}

//       {hasError && (
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             height,
//             backgroundColor: "#f8f9fa",
//             color: "#666",
//             border: "1px solid #dee2e6",
//             borderRadius: "4px",
//           }}
//         >
//           <div style={{ textAlign: "center" }}>
//             <div style={{ fontSize: "24px", marginBottom: "8px" }}>⚠️</div>
//             <div>{errorMessage}</div>
//           </div>
//         </div>
//       )}

//       <iframe
//         src={src}
//         title={title}
//         style={{
//           ...iframeStyles,
//           display: hasError ? "none" : "block",
//         }}
//         allowFullScreen={allowFullScreen}
//         sandbox={sandbox}
//         loading={loading}
//         onLoad={handleLoad}
//         onError={handleError}
//       />

//       <style>{`
//   @keyframes spin {
//     0% {
//       transform: rotate(0deg);
//     }
//     100% {
//       transform: rotate(360deg);
//     }
//   }
// `}</style>
//     </div>
//   );
// };

// const CallingPage = () => {
//   const handleIframeLoad = () => {
//     console.log("Iframe loaded successfully");
//   };

//   const handleIframeError = () => {
//     console.log("Iframe failed to load");
//   };

//   const baseUrl = import.meta.env.VITE_API_URL;

//   return (
//     <div style={{ padding: "20px" }}>
//       <h2>Acefone Interaction Component</h2>

//       <div style={{ marginBottom: "20px" }}>
//         <IframeComponent
//           src={`${baseUrl}/iframe-content`}
//           width="100%"
//           height="300px"
//           title="Acefone Interaction Hub"
//           sandbox="allow-forms allow-same-origin allow-scripts"
//           onLoad={handleIframeLoad}
//           onError={handleIframeError}
//         />
//       </div>
//     </div>
//   );
// };

// export default CallingPage;

import React from "react";

const IframeComponent = ({
  src,
  width = "100%",
  height = "600px",
  title = "Embedded content",
  allowFullScreen = false,
  sandbox = "",
  loading = "lazy",
  className = "",
  style = {},
}) => {
  return (
    <div
      className={`iframe-container ${className}`}
      style={{ position: "relative" }}
    >
      <iframe
        src={src}
        title={title}
        style={{ border: "none", width, height, ...style }}
        allowFullScreen={allowFullScreen}
        sandbox={sandbox}
        loading={loading}
      />
    </div>
  );
};

const CallingPage = () => {
  const iframeUrl = "https://interactions.acefone.in";

  return (
    <div style={{ padding: "20px" }}>
      <h2>Acefone Interaction Component</h2>
      <IframeComponent
        src={iframeUrl}
        width="100%"
        height="600px"
        title="Acefone Interaction Hub"
        sandbox="allow-forms allow-same-origin allow-scripts"
      />
    </div>
  );
};

export default CallingPage;
