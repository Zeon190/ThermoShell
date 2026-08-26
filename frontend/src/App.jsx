import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MapSelector from './components/MapSelector';
import BlueprintDesigner from './components/BlueprintDesigner';
import MaterialPicker from './components/MaterialPicker';
import SimulationDashboard from './components/SimulationDashboard';
import ThermalChart from './components/ThermalChart';
import DiagnosticEngine from './components/DiagnosticEngine';
import AutoOptimizePanel from './components/AutoOptimizePanel';
import BudgetOptimizerModal from './components/BudgetOptimizerModal';
import MicroclimateUploader from './components/MicroclimateUploader';
import PdfExportModal from './components/PdfExportModal';
import UserGuideModal from './components/UserGuideModal';
import Shelter3DViewer from './components/Shelter3DViewer';
import { fetchMaterialsCatalog, fetchHotspots, runSimulation } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('simulator');
  const [catalog, setCatalog] = useState(null);
  const [hotspots, setHotspots] = useState([]);

  // Location & Shelter Geometry
  const [location, setLocation] = useState({
    latitude: 35.421,
    longitude: 77.108,
    location_name: 'Siachen Glacier Base Camp (DRDO Ops)',
    elevation_m: 4800
  });

  const [dimensions, setDimensions] = useState({
    length_m: 6.0,
    width_m: 4.0,
    height_m: 2.8,
    south_window_ratio: 0.30,
    north_window_ratio: 0.05,
    east_window_ratio: 0.08,
    west_window_ratio: 0.08,
    has_trombe_wall: true,
    occupants_count: 4,
    air_change_rate: 0.5
  });

  const [materials, setMaterials] = useState({
    wall_material_id: 'rammed_earth',
    wall_thickness_m: 0.35,
    insulation_material_id: 'local_sheep_wool',
    insulation_thickness_m: 0.08,
    roof_material_id: 'timber_mud_willow',
    roof_thickness_m: 0.25,
    glazing_system_id: 'double_low_e_argon'
  });

  const [simData, setSimData] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [customWeather, setCustomWeather] = useState(null);

  // Modals state
  const [isOptimizerOpen, setIsOptimizerOpen] = useState(false);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [isUserGuideOpen, setIsUserGuideOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [mats, hots] = await Promise.all([fetchMaterialsCatalog(), fetchHotspots()]);
      if (mats) setCatalog(mats);
      if (hots) {
        setHotspots(hots);
        if (hots.length > 0) {
          setLocation({
            latitude: hots[0].latitude,
            longitude: hots[0].longitude,
            location_name: hots[0].name,
            elevation_m: hots[0].elevation_m
          });
        }
      }
    }
    loadData();
  }, []);

  const triggerSimulation = async () => {
    setIsSimulating(true);
    try {
      const payload = {
        location,
        dimensions,
        materials,
        comfort_temp_min: 18.0,
        comfort_temp_max: 24.0,
        auxiliary_heating_setpoint: 16.0,
        custom_weather_data: customWeather
      };
      const res = await runSimulation(payload);
      setSimData(res);
    } catch (err) {
      console.error('Simulation error', err);
    } finally {
      setIsSimulating(false);
    }
  };

  useEffect(() => {
    triggerSimulation();
  }, [location, dimensions, materials, customWeather]);

  const handleSelectHotspot = (h) => {
    setLocation({
      latitude: h.latitude,
      longitude: h.longitude,
      location_name: h.name,
      elevation_m: h.elevation_m
    });
  };

  const handleApplyOptimizerRecipe = (recipe) => {
    setMaterials({
      wall_material_id: recipe.wall_material_id,
      wall_thickness_m: recipe.wall_thickness_m,
      insulation_material_id: recipe.insulation_material_id,
      insulation_thickness_m: recipe.insulation_thickness_m,
      roof_material_id: recipe.roof_material_id,
      roof_thickness_m: recipe.roof_thickness_m,
      glazing_system_id: recipe.glazing_system_id
    });
    setDimensions(prev => ({
      ...prev,
      has_trombe_wall: recipe.has_trombe_wall
    }));
  };

  const handleApplyCustomWeather = (records, meta) => {
    setCustomWeather(records);
    setLocation(prev => ({
      ...prev,
      location_name: `On-Site Sensor Logger (${meta.filename})`
    }));
  };

  const handleApplyAutoOptimize = (config) => {
    if (config?.materials) {
      setMaterials({
        wall_material_id: config.materials.wall_material_id,
        wall_thickness_m: config.materials.wall_thickness_m,
        insulation_material_id: config.materials.insulation_material_id,
        insulation_thickness_m: config.materials.insulation_thickness_m,
        roof_material_id: config.materials.roof_material_id,
        roof_thickness_m: config.materials.roof_thickness_m,
        glazing_system_id: config.materials.glazing_system_id
      });
    }
    if (config?.dimensions) {
      setDimensions({
        length_m: config.dimensions.length_m,
        width_m: config.dimensions.width_m,
        height_m: config.dimensions.height_m,
        south_window_ratio: config.dimensions.south_window_ratio,
        north_window_ratio: config.dimensions.north_window_ratio,
        east_window_ratio: config.dimensions.east_window_ratio,
        west_window_ratio: config.dimensions.west_window_ratio,
        has_trombe_wall: config.dimensions.has_trombe_wall,
        occupants_count: config.dimensions.occupants_count,
        air_change_rate: config.dimensions.air_change_rate
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenOptimizer={() => setIsOptimizerOpen(true)}
        onOpenUploader={() => setIsUploaderOpen(true)}
        onOpenPdf={() => setIsPdfOpen(true)}
        onOpenUserGuide={() => setIsUserGuideOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {activeTab === 'simulator' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <MapSelector
                location={location}
                setLocation={setLocation}
                hotspots={hotspots}
                onSelectHotspot={handleSelectHotspot}
              />
              <BlueprintDesigner
                dimensions={dimensions}
                setDimensions={setDimensions}
              />
              <MaterialPicker
                catalog={catalog}
                materials={materials}
                setMaterials={setMaterials}
              />
            </div>

            <SimulationDashboard
              simData={simData}
              isSimulating={isSimulating}
              location={location}
              onReposition={handleSelectHotspot}
              materials={materials}
              dimensions={dimensions}
              catalog={catalog}
            />

            <AutoOptimizePanel
              simData={simData}
              location={location}
              dimensions={dimensions}
              materials={materials}
              catalog={catalog}
              onApplyFix={handleApplyAutoOptimize}
            />

            <ThermalChart simData={simData} />
          </>
        )}

        {activeTab === '3d' && (
          <div className="space-y-6">
            <Shelter3DViewer
              dimensions={dimensions}
              materials={materials}
              simData={simData}
            />
            <SimulationDashboard
              simData={simData}
              isSimulating={isSimulating}
              location={location}
              onReposition={handleSelectHotspot}
              materials={materials}
              dimensions={dimensions}
              catalog={catalog}
            />

            <AutoOptimizePanel
              simData={simData}
              location={location}
              dimensions={dimensions}
              materials={materials}
              catalog={catalog}
              onApplyFix={handleApplyAutoOptimize}
            />
          </div>
        )}
      </main>

      <BudgetOptimizerModal
        isOpen={isOptimizerOpen}
        onClose={() => setIsOptimizerOpen(false)}
        location={location}
        dimensions={dimensions}
        onApplyRecipe={handleApplyOptimizerRecipe}
      />

      <MicroclimateUploader
        isOpen={isUploaderOpen}
        onClose={() => setIsUploaderOpen(false)}
        onApplyCustomWeather={handleApplyCustomWeather}
      />

      <PdfExportModal
        isOpen={isPdfOpen}
        onClose={() => setIsPdfOpen(false)}
        location={location}
        dimensions={dimensions}
        materials={materials}
        simData={simData}
      />

      <UserGuideModal
        isOpen={isUserGuideOpen}
        onClose={() => setIsUserGuideOpen(false)}
      />
    </div>
  );
}
