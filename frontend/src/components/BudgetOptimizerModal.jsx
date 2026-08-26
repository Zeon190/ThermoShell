import React, { useState } from 'react';
import { Sparkles, X, Check, DollarSign, ShieldCheck, Leaf, ArrowRight, Loader2 } from 'lucide-react';
import { runBudgetOptimization } from '../api';

export default function BudgetOptimizerModal({ isOpen, onClose, location, dimensions, onApplyRecipe }) {
  const [budgetInr, setBudgetInr] = useState(220000);
  const [budgetMode, setBudgetMode] = useState('total');
  const [sustainability, setSustainability] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [optResult, setOptResult] = useState(null);
  const [selectedTier, setSelectedTier] = useState(0);

  if (!isOpen) return null;

  const handleRunOptimizer = async () => {
    setIsLoading(true);
    try {
      const res = await runBudgetOptimization({
        location,
        dimensions,
        max_budget_inr: budgetInr,
        budget_mode: budgetMode,
        prioritize_sustainability: sustainability,
        min_comfort_score_target: 70.0
      });
      setOptResult(res);
      setSelectedTier(0);
    } catch (err) {
      alert('Optimization failed: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = (recipe) => {
    onApplyRecipe({
      wall_material_id: recipe.wall_id,
      wall_thickness_m: recipe.wall_thickness_m,
      insulation_material_id: recipe.insulation_id,
      insulation_thickness_m: recipe.insulation_thickness_m,
      roof_material_id: recipe.roof_id,
      roof_thickness_m: recipe.roof_thickness_m,
      glazing_system_id: recipe.glazing_id,
      has_trombe_wall: recipe.has_trombe
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Feature A: The Budget-Optimizer Matchmaker
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full">
                  Grid Search AI
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Auto-evaluates material & thickness combinations to maximize thermal comfort strictly under budget
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
            <div>
              <div className="flex justify-between text-xs mb-1 text-slate-300">
                <span>Budget Ceiling</span>
                <span className="font-mono text-amber-400 font-bold">
                  ₹{budgetInr.toLocaleString()} {budgetMode === 'per_m2' ? '/ m²' : 'Total'}
                </span>
              </div>
              <input
                type="range"
                min={budgetMode === 'per_m2' ? 1000 : 80000}
                max={budgetMode === 'per_m2' ? 12000 : 500000}
                step={budgetMode === 'per_m2' ? 200 : 10000}
                value={budgetInr}
                onChange={(e) => setBudgetInr(parseFloat(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Budget Mode</label>
              <div className="flex rounded-lg bg-slate-900 border border-slate-700 p-1 text-xs">
                <button
                  onClick={() => { setBudgetMode('total'); setBudgetInr(220000); }}
                  className={`flex-1 py-1 rounded font-semibold ${budgetMode === 'total' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
                >
                  Total Shelter
                </button>
                <button
                  onClick={() => { setBudgetMode('per_m2'); setBudgetInr(4500); }}
                  className={`flex-1 py-1 rounded font-semibold ${budgetMode === 'per_m2' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
                >
                  Per Sq. Meter
                </button>
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <label className="text-xs text-slate-300 flex items-center gap-1.5 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={sustainability}
                  onChange={(e) => setSustainability(e.target.checked)}
                  className="accent-emerald-500 rounded"
                />
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                <span>Prioritize Zero-Carbon Local</span>
              </label>

              <button
                onClick={handleRunOptimizer}
                disabled={isLoading}
                className="w-full mt-2 py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Grid Searching Combinations...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Find Optimal Material Recipes</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {optResult && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  Evaluated <b>{optResult.total_combinations_evaluated}</b> material combinations against 8,760h climate data
                </span>
                <span className="text-amber-400 font-bold font-mono">
                  Target Budget: ₹{optResult.budget_ceiling_inr.toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {optResult.recommended_recipes.map((item, idx) => {
                  const rec = item.recipe;
                  const isSelected = selectedTier === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedTier(idx)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-slate-800/90 border-amber-500 ring-2 ring-amber-500/20 shadow-xl'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                            {item.tag}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                            {rec.comfort_hours_percentage}% Comfort
                          </span>
                        </div>

                        <h4 className="font-extrabold text-sm text-white mb-1">{item.tier}</h4>
                        <p className="text-xs text-slate-300 leading-relaxed mb-3">{item.summary}</p>

                        <div className="space-y-1.5 text-xs text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
                          <div className="flex justify-between">
                            <span>Wall:</span>
                            <span className="text-slate-200 truncate ml-2">{rec.wall_name} ({(rec.wall_thickness_m*100).toFixed(0)}cm)</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Insulation:</span>
                            <span className="text-slate-200 truncate ml-2">{rec.insulation_name} ({(rec.insulation_thickness_m*100).toFixed(0)}cm)</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Roof:</span>
                            <span className="text-slate-200 truncate ml-2">{rec.roof_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Glazing:</span>
                            <span className="text-slate-200 truncate ml-2">{rec.glazing_name.split(' (')[0]}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Trombe:</span>
                            <span className={rec.has_trombe ? 'text-amber-400' : 'text-slate-500'}>
                              {rec.has_trombe ? 'Active (7h lag)' : 'Disabled'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Total Est. Cost</span>
                          <span className="text-sm font-extrabold text-white font-mono">
                            ₹{rec.estimated_cost_inr.toLocaleString()}
                          </span>
                        </div>

                        <button
                          onClick={(e) => { e.stopPropagation(); handleApply(rec); }}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow"
                        >
                          <span>Apply</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
