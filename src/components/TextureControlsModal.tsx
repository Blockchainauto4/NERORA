import React from 'react';
import { X, Sparkles, Layers, Sliders, Eye, SunMedium } from 'lucide-react';

export interface TextureSettings {
  enableCosmicBackdrop: boolean;
  cosmicOpacity: number;
  enableFilmGrain: boolean;
  enableScanlines: boolean;
  enableBrushedMetal: boolean;
  glowIntensity: 'subtle' | 'vivid' | 'hyper';
}

interface TextureControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TextureSettings;
  onUpdateSettings: (newSettings: Partial<TextureSettings>) => void;
  cosmicImagePath: string;
}

export const TextureControlsModal: React.FC<TextureControlsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  cosmicImagePath,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#070e1c] border border-cyan-500/40 rounded-xl shadow-2xl overflow-hidden flex flex-col font-mono text-xs">
        {/* Header */}
        <div className="px-5 py-4 border-b border-cyan-500/20 flex items-center justify-between bg-[#040813]">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white tracking-wide">
              ATMOSPHERE & TEXTURE ENGINE
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[80vh]">
          {/* 1. Cosmic Atmosphere Preview Card */}
          <div className="relative rounded-lg overflow-hidden border border-cyan-500/30 h-28 flex flex-col justify-end p-3">
            <img
              src={cosmicImagePath}
              alt="Cosmic Longevity Atmosphere"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070e1c] via-[#070e1c]/40 to-transparent" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <span className="text-white font-bold text-xs tracking-wider">
                  COSMIC SYNAPTIC HORIZON
                </span>
                <p className="text-[10px] text-cyan-300/90 font-sans">
                  Deep space nebula, crystalline towers, and celestial planetary rings.
                </p>
              </div>
              <button
                onClick={() =>
                  onUpdateSettings({ enableCosmicBackdrop: !settings.enableCosmicBackdrop })
                }
                className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                  settings.enableCosmicBackdrop
                    ? 'bg-cyan-500 text-black'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {settings.enableCosmicBackdrop ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          </div>

          {/* 2. Cosmic Backdrop Opacity Slider */}
          {settings.enableCosmicBackdrop && (
            <div className="p-3 bg-[#081224] rounded-lg border border-cyan-500/15 space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>ATMOSPHERE INTENSITY</span>
                <span className="text-cyan-300 font-bold">{Math.round(settings.cosmicOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.55"
                step="0.05"
                value={settings.cosmicOpacity}
                onChange={(e) => onUpdateSettings({ cosmicOpacity: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400"
              />
            </div>
          )}

          {/* 3. Tactile Film Grain Noise */}
          <div className="p-3 bg-[#081224] rounded-lg border border-cyan-500/15 flex items-center justify-between">
            <div>
              <span className="text-white font-bold">TACTILE FILM GRAIN</span>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                Micro-fractal noise filter adding organic cinematic surface texture.
              </p>
            </div>
            <button
              onClick={() => onUpdateSettings({ enableFilmGrain: !settings.enableFilmGrain })}
              className={`px-3 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                settings.enableFilmGrain
                  ? 'bg-cyan-500 text-black'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {settings.enableFilmGrain ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* 4. Brushed Carbon Texture */}
          <div className="p-3 bg-[#081224] rounded-lg border border-cyan-500/15 flex items-center justify-between">
            <div>
              <span className="text-white font-bold">BRUSHED METALLIC MESH</span>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                Micro-lattice tactile grid on panels and instrument borders.
              </p>
            </div>
            <button
              onClick={() => onUpdateSettings({ enableBrushedMetal: !settings.enableBrushedMetal })}
              className={`px-3 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                settings.enableBrushedMetal
                  ? 'bg-cyan-500 text-black'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {settings.enableBrushedMetal ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* 5. Hologram CRT Scanlines */}
          <div className="p-3 bg-[#081224] rounded-lg border border-cyan-500/15 flex items-center justify-between">
            <div>
              <span className="text-white font-bold">HOLOGRAM SCANLINE RASTER</span>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                Subtle horizontal CRT scan lines for quantum terminal aesthetics.
              </p>
            </div>
            <button
              onClick={() => onUpdateSettings({ enableScanlines: !settings.enableScanlines })}
              className={`px-3 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                settings.enableScanlines
                  ? 'bg-cyan-500 text-black'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {settings.enableScanlines ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* 6. Glow Luminance Presets */}
          <div className="p-3 bg-[#081224] rounded-lg border border-cyan-500/15 space-y-2">
            <span className="text-white font-bold">PHOTONIC GLOW PRESET</span>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {(['subtle', 'vivid', 'hyper'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => onUpdateSettings({ glowIntensity: mode })}
                  className={`py-1.5 rounded uppercase font-bold text-[10px] transition-colors cursor-pointer ${
                    settings.glowIntensity === mode
                      ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
