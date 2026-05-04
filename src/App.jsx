import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gifshot from 'gifshot';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import CameraView from './components/CameraView';
import BackgroundSwitcher from './components/BackgroundSwitcher';
import CountdownCapture from './components/CountdownCapture';
import PhotoStrip from './components/PhotoStrip';
import PrintButton from './components/PrintButton';
import Footer from './components/Footer';

function PhotoboothApp() {
  const { activeBg } = useTheme();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mainRef = useRef(null);

  const [activeFilter, setActiveFilter] = useState({ id: 'normal', label: 'NORMAL', className: 'filter-normal' });
  const [photos, setPhotos] = useState([]);
  const [isCounting, setIsCounting] = useState(false);
  const [isSequenceRunning, setIsSequenceRunning] = useState(false);
  const [captureCount, setCaptureCount] = useState(0);
  const [view, setView] = useState('camera'); // 'camera' or 'result'
  const [scaleInfo, setScaleInfo] = useState({ scale: 1, height: 'auto' });

  // Dynamically scale the entire app content down to fit within the viewport height
  useEffect(() => {
    const updateScale = () => {
      if (!mainRef.current) return;
      // offsetHeight ignores CSS transform: scale, giving us the true original height
      const originalHeight = mainRef.current.offsetHeight;
      if (originalHeight === 0) return;

      const availableHeight = window.innerHeight - 40; // leave 40px safe margin
      if (originalHeight > availableHeight) {
        const scale = availableHeight / originalHeight;
        setScaleInfo({ scale, height: originalHeight * scale });
      } else {
        setScaleInfo({ scale: 1, height: 'auto' });
      }
    };

    // Timeout allows DOM to render before calculating height
    const timeoutId = setTimeout(updateScale, 50);
    window.addEventListener('resize', updateScale);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateScale);
    };
  }, [view, photos, activeFilter]);

  const startCaptureSequence = () => {
    setPhotos([]);
    setCaptureCount(0);
    setIsSequenceRunning(true);
    setIsCounting(true);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.videoWidth && video.videoHeight) {
        // Crop the video stream to a 3:4 aspect ratio
        const videoAspect = video.videoWidth / video.videoHeight;
        const targetAspect = 3 / 4;

        let cropWidth = video.videoWidth;
        let cropHeight = video.videoHeight;
        let offsetX = 0;
        let offsetY = 0;

        if (videoAspect > targetAspect) {
          // Video is wider than target. Crop sides.
          cropWidth = video.videoHeight * targetAspect;
          offsetX = (video.videoWidth - cropWidth) / 2;
        } else {
          // Video is taller. Crop top/bottom.
          cropHeight = video.videoWidth / targetAspect;
          offsetY = (video.videoHeight - cropHeight) / 2;
        }

        canvas.width = cropWidth;
        canvas.height = cropHeight;

        const context = canvas.getContext('2d');

        // Apply the active CSS filter
        if (activeFilter.id === 'bw') {
          context.filter = 'grayscale(100%) contrast(120%)';
        } else if (activeFilter.id === 'soft') {
          context.filter = 'brightness(110%) contrast(85%) sepia(20%)';
        } else {
          context.filter = 'none';
        }

        // Draw and crop
        context.drawImage(video, offsetX, offsetY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setPhotos(prev => [...prev, dataUrl]);
      }
    }
  };

  const handleCaptureFinished = () => {
    setIsCounting(false);

    const nextCount = captureCount + 1;
    setCaptureCount(nextCount);

    if (nextCount < 3) {
      setTimeout(() => {
        setIsCounting(true);
      }, 1000);
    } else {
      setIsSequenceRunning(false);
      setView('result');
    }
  };

  const resetToCamera = () => {
    setPhotos([]);
    setCaptureCount(0);
    setIsSequenceRunning(false);
    setView('camera');
  };

  const downloadGIF = () => {
    if (photos.length === 0) return;

    gifshot.createGIF({
      images: photos,
      gifWidth: 400,
      gifHeight: 300,
      interval: 0.5, // seconds
      numFrames: photos.length,
    }, function (obj) {
      if (!obj.error) {
        const link = document.createElement('a');
        link.href = obj.image;
        link.download = 'photobooth-anim.gif';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  };

  return (
    <div className="min-h-screen bg-[var(--color-bauhaus-white)] overflow-x-hidden flex flex-col">
      <p>Hello baby patry ng photobooth ko pls thank you i love you</p>

      <main
        className="container mx-auto px-4 print:p-0 flex-1 flex justify-center print:!h-auto print:!block"
        style={{ height: scaleInfo.height }}
      >
        <div
          ref={mainRef}
          className="w-full print:!transform-none"
          style={{ transform: `scale(${scaleInfo.scale})`, transformOrigin: 'top center' }}
        >
          {/* <HeroSection /> */}

          {view === 'camera' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="print:hidden"
            >
              <CameraView
                videoRef={videoRef}
                canvasRef={canvasRef}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
              />

              <div className="flex justify-center my-8">
                <button
                  onClick={startCaptureSequence}
                  disabled={isSequenceRunning}
                  className="bauhaus-button px-12 py-4 text-4xl disabled:opacity-50"
                >
                  SNAP PHOTO
                </button>
              </div>
            </motion.div>
          )}

          <CountdownCapture
            isCounting={isCounting}
            onCapture={capturePhoto}
            onFinished={handleCaptureFinished}
          />

          {view === 'result' && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full mx-auto flex flex-col md:flex-row gap-8 md:gap-16 justify-center items-center my-8"
            >
              {/* Left side: Photo Strip */}
              <div className="flex justify-center">
                <PhotoStrip photos={photos} activeFilter={activeFilter} />
              </div>

              {/* Right side: Controls */}
              <div className="flex flex-col gap-8 justify-center print:hidden w-full max-w-sm">
                <BackgroundSwitcher />

                <div className="flex flex-col gap-6 w-full">
                  <button
                    onClick={downloadGIF}
                    className="bauhaus-button px-6 py-4 flex items-center justify-center gap-4 text-3xl bg-white w-full border-4 border-black"
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    DOWNLOAD AS GIF
                  </button>

                  <PrintButton disabled={photos.length === 0} />

                  <button
                    onClick={resetToCamera}
                    className="bauhaus-button px-8 py-4 text-3xl bg-white border-4 border-black w-full"
                  >
                    TAKE ANOTHER
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <PhotoboothApp />
    </ThemeProvider>
  );
}
