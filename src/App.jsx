import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gifshot from 'gifshot';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { TemplateProvider, useTemplate } from './context/TemplateContext';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import TemplatePicker from './components/TemplatePicker';
import CameraView from './components/CameraView';
import BackgroundSwitcher from './components/BackgroundSwitcher';
import CountdownCapture from './components/CountdownCapture';
import PhotoStrip from './components/PhotoStrip';
import PrintButton from './components/PrintButton';
import Footer from './components/Footer';

function PhotoboothApp() {
  const { activeBg } = useTheme();
  const { selectedTemplate, setSelectedTemplate } = useTemplate();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mainRef = useRef(null);

  const [activeFilter, setActiveFilter] = useState({ id: 'normal', label: 'NORMAL', className: 'filter-normal' });
  const [photos, setPhotos] = useState([]);
  const [isCounting, setIsCounting] = useState(false);
  const [isSequenceRunning, setIsSequenceRunning] = useState(false);
  const [captureCount, setCaptureCount] = useState(0);
  const [view, setView] = useState('template'); // 'template' -> 'camera' -> 'result'
  const [scaleInfo, setScaleInfo] = useState({ scale: 1, height: 'auto' });

  // Dynamically scale the app content down to fit within the viewport height, 
  // primarily used for the camera view to keep the snap button visible.
  useEffect(() => {
    const updateScale = () => {
      if (!mainRef.current || view !== 'camera') {
        setScaleInfo({ scale: 1, height: 'auto' });
        return;
      }
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
        // Crop the video stream to the selected template's aspect ratio
        const videoAspect = video.videoWidth / video.videoHeight;
        const targetAspect = selectedTemplate ? selectedTemplate.aspectRatio : 3 / 4;

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

        // Reset filter to avoid iOS Safari bugs with context.filter
        context.filter = 'none';

        // Draw and crop
        context.drawImage(video, offsetX, offsetY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

        // Apply manual pixel filters for iOS Safari compatibility
        if (activeFilter.id !== 'normal') {
          const imageData = context.getImageData(0, 0, cropWidth, cropHeight);
          const data = imageData.data;

          for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];

            if (activeFilter.id === 'bw') {
              // grayscale(100%)
              let luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;

              // contrast(120%)
              luma = (luma - 128) * 1.2 + 128;

              data[i] = data[i + 1] = data[i + 2] = luma;
            } else if (activeFilter.id === 'soft') {
              // brightness(110%)
              r *= 1.1; g *= 1.1; b *= 1.1;

              // contrast(85%)
              r = (r - 128) * 0.85 + 128;
              g = (g - 128) * 0.85 + 128;
              b = (b - 128) * 0.85 + 128;

              // sepia(20%)
              let tr = 0.393 * r + 0.769 * g + 0.189 * b;
              let tg = 0.349 * r + 0.686 * g + 0.168 * b;
              let tb = 0.272 * r + 0.534 * g + 0.131 * b;

              data[i] = r * 0.8 + tr * 0.2;
              data[i + 1] = g * 0.8 + tg * 0.2;
              data[i + 2] = b * 0.8 + tb * 0.2;
            }
          }
          context.putImageData(imageData, 0, 0);
        }

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setPhotos(prev => [...prev, dataUrl]);
      }
    }
  };

  const handleCaptureFinished = () => {
    setIsCounting(false);

    const nextCount = captureCount + 1;
    setCaptureCount(nextCount);

    const maxSlots = selectedTemplate ? selectedTemplate.slots : 3;

    if (nextCount < maxSlots) {
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
    <div className="min-h-screen print:min-h-0 bg-[var(--color-bauhaus-white)] overflow-x-hidden flex flex-col">
      <main
        className={`container mx-auto px-4 print:p-0 flex-1 flex justify-center py-8 ${view === 'camera' ? 'print:!h-auto print:!block' : ''}`}
        style={view === 'camera' ? { height: scaleInfo.height } : {}}
      >
        <div
          ref={mainRef}
          className="w-full print:!transform-none"
          style={view === 'camera' ? { transform: `scale(${scaleInfo.scale})`, transformOrigin: 'top center' } : {}}
        >
          <AnimatePresence mode="wait">
            {view === 'template' && (
              <motion.div
                key="template"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="w-full"
              >
                <TemplatePicker onConfirm={() => setView('camera')} />
              </motion.div>
            )}

            {view === 'camera' && (
              <motion.div
                key="camera"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="print:hidden w-full max-w-4xl mx-auto"
              >
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={() => setView('template')}
                    className="text-black font-[var(--font-special)] font-bold uppercase underline hover:no-underline"
                  >
                    &larr; Change Layout
                  </button>
                  {selectedTemplate && (
                    <div className="bg-black text-white px-4 py-1 font-[var(--font-special)] text-sm tracking-wider">
                      {selectedTemplate.name} SELECTED
                    </div>
                  )}
                </div>

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

            {view === 'result' && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full mx-auto flex flex-col lg:flex-row gap-8 lg:gap-16 justify-center items-center lg:items-start my-8 print:m-0"
              >
                {/* Left side: Photo Strip */}
                <div className="flex justify-center w-full lg:w-auto">
                  <PhotoStrip photos={photos} activeFilter={activeFilter} />
                </div>

                {/* Right side: Controls */}
                <div className="flex flex-col gap-6 lg:gap-8 justify-center print:hidden w-full max-w-sm lg:mt-12">
                  <BackgroundSwitcher />

                  <div className="flex flex-col gap-4 lg:gap-6 w-full">
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
                      className="bauhaus-button px-8 py-4 text-3xl bg-white border-4 border-black w-full mb-4"
                    >
                      TAKE ANOTHER
                    </button>

                    <button
                      onClick={() => {
                        setPhotos([]);
                        setView('template');
                      }}
                      className="text-black font-[var(--font-special)] font-bold underline hover:no-underline text-center"
                    >
                      Change Layout
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <CountdownCapture
            isCounting={isCounting}
            onCapture={capturePhoto}
            onFinished={handleCaptureFinished}
          />
        </div>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <TemplateProvider>
        <PhotoboothApp />
      </TemplateProvider>
    </ThemeProvider>
  );
}
