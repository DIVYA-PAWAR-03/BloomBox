'use client';

import dynamic from 'next/dynamic';
import { Suspense, useEffect } from 'react';
import { useBouquetStore } from '@/store/useBouquetStore';
import StepWizard from '@/components/create/StepWizard';
import BouquetPreview from '@/components/create/BouquetPreview';

// Lazy load each step
const Step1Style     = dynamic(() => import('@/components/create/steps/Step1Style'),    { ssr: false });
const Step2Flowers   = dynamic(() => import('@/components/create/steps/Step2Flowers'),  { ssr: false });
const Step3Fillers   = dynamic(() => import('@/components/create/steps/Step3Fillers'),  { ssr: false });
const Step4Wrapping  = dynamic(() => import('@/components/create/steps/Step4Wrapping'), { ssr: false });
const Step5Ribbon    = dynamic(() => import('@/components/create/steps/Step5Ribbon'),   { ssr: false });
const Step6Extras    = dynamic(() => import('@/components/create/steps/Step6Extras'),   { ssr: false });
const Step7Letter    = dynamic(() => import('@/components/create/steps/Step7Letter'),   { ssr: false });
const Step8Envelope  = dynamic(() => import('@/components/create/steps/Step8Envelope'), { ssr: false });
const Step9Preview   = dynamic(() => import('@/components/create/steps/Step9Preview'),  { ssr: false });

const StepLoading = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-4xl animate-bounce">🌸</div>
  </div>
);

function CurrentStep({ step }: { step: number }) {
  switch (step) {
    case 1: return <Step1Style />;
    case 2: return <Step2Flowers />;
    case 3: return <Step3Fillers />;
    case 4: return <Step4Wrapping />;
    case 5: return <Step5Ribbon />;
    case 6: return <Step6Extras />;
    case 7: return <Step7Letter />;
    case 8: return <Step8Envelope />;
    case 9: return <Step9Preview />;
    default: return <Step1Style />;
  }
}

export default function CreatePage() {
  const store = useBouquetStore();
  const currentStep = store.currentStep;

  useEffect(() => {
    // Only reset the bouquet if the user is starting fresh on Step 1.
    // This prevents losing progress if the page component remounts during the creation wizard.
    const { currentStep, resetBouquet } = useBouquetStore.getState();
    if (currentStep === 1) {
      resetBouquet();
    }
  }, []);

  const showSplitPreview = currentStep >= 2 && currentStep <= 6;

  return (
    <StepWizard hideNext={currentStep === 9}>
      <Suspense fallback={<StepLoading />}>
        {showSplitPreview ? (
          <div className="w-full max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Live Preview & Arrangement Patterns */}
            <div className="lg:col-span-5 flex flex-col items-center p-6 bg-white rounded-3xl border border-rose-100/50 shadow-sm lg:sticky lg:top-6">
              {/* Presets selection */}
              <div className="w-full text-center mb-6">
                <span className="text-xs font-semibold tracking-wider text-rose-400 uppercase block mb-3">
                  Flower Arrangement
                </span>
                <div className="inline-flex rounded-full bg-rose-50/60 p-1 border border-rose-100">
                  {[
                    { id: 'dome', label: '🌸 Dome' },
                    { id: 'heart', label: '❤️ Heart' },
                    { id: 'cascade', label: '🌿 Cascade' },
                  ].map((item) => {
                    const isActive = store.arrangementPattern === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => store.setArrangementPattern(item.id as any)}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-rose-500 text-white shadow-sm'
                            : 'text-rose-700 hover:bg-rose-100/40'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                  {store.arrangementPattern === 'custom' && (
                    <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-amber-500 text-white shadow-sm">
                      ✨ Custom
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-stone-400 mt-2">
                  {store.arrangementPattern === 'custom'
                    ? 'Drag any flower in the preview to custom-arrange'
                    : 'Switch presets above or drag flowers in the preview to customize'}
                </p>
              </div>

              {/* Live Bouquet Preview wrapper */}
              <div className="relative aspect-3/4 w-full max-w-70 flex justify-center items-center">
                <BouquetPreview
                  style={store.bouquetStyle}
                  flowers={store.flowers}
                  fillers={store.fillers}
                  wrapping={store.wrapping}
                  ribbon={store.ribbon}
                  extras={store.extras}
                  onFlowerDrag={store.updateFlowerPosition}
                  selectedFlowerId={store.selectedFlowerId}
                  onFlowerSelect={store.selectFlower}
                />
              </div>
            </div>

            {/* Right Column: Step options */}
            <div className="lg:col-span-7">
              <CurrentStep step={currentStep} />
            </div>
          </div>
        ) : (
          <CurrentStep step={currentStep} />
        )}
      </Suspense>
    </StepWizard>
  );
}
