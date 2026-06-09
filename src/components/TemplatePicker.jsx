import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { TEMPLATES } from '../config/templates';
import { useTemplate } from '../context/TemplateContext';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 }
};

export default function TemplatePicker({ onConfirm }) {
  const { activeBg } = useTheme();
  const { setSelectedTemplate } = useTemplate();
  const [activeId, setActiveId] = useState(null);

  const handleConfirm = () => {
    const selected = TEMPLATES.find(t => t.id === activeId);
    if (selected) {
      setSelectedTemplate(selected);
      onConfirm();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
      className="min-h-[calc(100vh-4rem)] flex flex-col items-center py-12 px-4"
    >
      <div className="text-center mb-12">
        <h1 className="font-[var(--font-bebas)] text-6xl md:text-8xl tracking-widest text-black drop-shadow-[4px_4px_0_rgba(255,255,255,1)] mb-4">
          CHOOSE YOUR LAYOUT
        </h1>
        <p className="font-[var(--font-special)] text-xl md:text-2xl font-bold bg-white inline-block px-4 py-2 border-2 border-black">
          Select a photo strip template to begin
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto w-full mb-32"
      >
        {TEMPLATES.map((template) => {
          const isSelected = activeId === template.id;
          
          return (
            <motion.div
              key={template.id}
              variants={itemVariants}
              whileHover={{ 
                y: -4,
                boxShadow: "8px 8px 0px 0px rgba(0,0,0,1)" 
              }}
              onClick={() => setActiveId(template.id)}
              className={`
                relative cursor-pointer bg-white border-4 p-4 flex flex-col gap-4
                transition-all duration-200
                ${isSelected ? 'border-black shadow-[4px_4px_0_rgba(0,0,0,1)]' : 'border-transparent shadow-[4px_4px_0_rgba(0,0,0,0.2)]'}
              `}
              style={!isSelected ? { borderColor: 'rgba(0,0,0,0.1)' } : {}}
            >
              {/* Checkmark Badge */}
              {isSelected && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-4 -right-4 w-10 h-10 bg-[var(--color-bauhaus-yellow)] rounded-full border-4 border-black flex items-center justify-center z-10"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4" strokeLinecap="square">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </motion.div>
              )}

              {/* Preview Box */}
              <div className="bg-[#f0f0f0] border-2 border-black aspect-square flex items-center justify-center p-4">
                <div className="w-full h-full max-h-[250px] flex justify-center items-center">
                  {template.preview()}
                </div>
              </div>

              {/* Details */}
              <div className="flex flex-col items-center">
                <h3 className="font-[var(--font-bebas)] text-2xl tracking-wider">
                  {template.name}
                </h3>
                <p className="font-[var(--font-special)] text-sm font-bold text-gray-600">
                  {template.size}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Fixed bottom confirm button */}
      <AnimatePresence>
        {activeId && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 w-full p-8 flex justify-center pointer-events-none z-50"
          >
            <button
              onClick={handleConfirm}
              className="bauhaus-button px-12 py-4 text-3xl bg-[var(--color-bauhaus-blue)] text-white pointer-events-auto shadow-[8px_8px_0_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[4px_4px_0_rgba(0,0,0,1)] transition-all"
            >
              USE THIS LAYOUT &rarr;
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
