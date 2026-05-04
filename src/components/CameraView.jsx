import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function CameraView({ videoRef, canvasRef, activeFilter, setActiveFilter }) {
  const [cameraError, setCameraError] = useState(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setCameraError("Unable to access camera. Please check permissions.");
      }
    }
    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [videoRef]);

  const filters = [
    { id: 'normal', label: 'NORMAL', className: 'filter-normal' },
    { id: 'bw', label: 'B&W', className: 'filter-bw' },
    { id: 'soft', label: 'SOFT LIGHT', className: 'filter-soft' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center w-full max-w-sm md:max-w-md lg:max-w-lg mx-auto my-4 lg:my-8 px-4"
    >
      <div className="w-full bg-white p-4 bauhaus-border bauhaus-shadow relative">
        <div className="absolute -top-3 -left-3 w-6 h-6 lg:w-8 lg:h-8 bg-black rounded-full z-10 border-2 border-white"></div>
        <div className="absolute -top-3 -right-3 w-6 h-6 lg:w-8 lg:h-8 bg-black rounded-full z-10 border-2 border-white"></div>
        
        {cameraError ? (
          <div className="w-full aspect-[3/4] bg-[#0a0a0a] text-white flex items-center justify-center font-[var(--font-special)] p-4 text-center">
            {cameraError}
          </div>
        ) : (
          <div className="w-full aspect-[3/4] bg-black overflow-hidden relative border-4 border-black">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className={`w-full h-full object-cover transition-all duration-300 ${activeFilter.className}`}
            />
          </div>
        )}
        
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex flex-wrap justify-center gap-4 mt-8">
        {filters.map((filter, index) => (
          <motion.button
            key={filter.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            onClick={() => setActiveFilter(filter)}
            className={`px-6 py-2 text-xl font-[var(--font-bebas)] uppercase border-3 border-black transition-transform active:translate-y-1 ${
              activeFilter.id === filter.id 
                ? 'bg-black text-white shadow-[2px_2px_0px_0px_var(--color-bauhaus-black)] translate-y-[2px]' 
                : 'bg-white text-black shadow-[4px_4px_0px_0px_var(--color-bauhaus-black)] hover:bg-[#f5f0e8]'
            }`}
          >
            {filter.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
