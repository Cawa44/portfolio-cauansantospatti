import React from 'react';
import { useSkar } from '../context/BlobContext';
import { motion, AnimatePresence } from 'motion/react';

export const BlobDisplay: React.FC = () => {
  const { path, color } = useSkar();

  return (
    <div className="flex-1 flex items-center justify-center relative min-h-[400px] bg-white/10 backdrop-blur-sm rounded-[2.5rem] border border-white/20 shadow-inner overflow-hidden mb-12">
      {/* Decorative Glass Ring */}
      <div className="absolute w-80 h-80 border border-white/30 rounded-full blur-[2px] opacity-40 animate-pulse" />
      
      <div className="relative w-full max-w-[400px] aspect-square">
        <AnimatePresence mode="wait">
          <motion.svg
            key={path}
            viewBox="0 0 400 400"
            className="w-full h-full drop-shadow-2xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 20,
              duration: 0.5 
            }}
          >
            <motion.path
              d={path}
              fill={color}
              initial={{ d: path }}
              animate={{ d: path }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </motion.svg>
        </AnimatePresence>
      </div>
    </div>
  );
};
