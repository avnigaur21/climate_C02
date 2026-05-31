import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers in Leaflet with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface RegionData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  riskScore: number;
  peopleAffected: number;
  primaryRisk: string;
}

interface InteractiveMapProps {
  regions: RegionData[];
  onRegionClick?: (region: RegionData) => void;
  className?: string;
}

export function InteractiveMap({ regions, onRegionClick, className }: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    mapInstanceRef.current = L.map(mapRef.current).setView([20, 0], 2);

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstanceRef.current);

    // Add markers for each region
    regions.forEach((region) => {
      if (!mapInstanceRef.current) return;

      // Determine marker color based on risk score
      const getMarkerColor = (score: number) => {
        if (score >= 80) return "#dc2626"; // high risk - red
        if (score >= 60) return "#ea580c"; // medium-high risk - orange
        if (score >= 40) return "#ca8a04"; // medium risk - yellow
        if (score >= 20) return "#16a34a"; // low-medium risk - green
        return "#059669"; // low risk - dark green
      };

      const markerColor = getMarkerColor(region.riskScore);
      
      // Create custom marker
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background-color: ${markerColor};
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 10px;
            font-weight: bold;
          ">
            ${region.riskScore}
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([region.lat, region.lng], { icon: customIcon })
        .addTo(mapInstanceRef.current);

      // Add popup with region information
      const popupContent = `
        <div class="p-2">
          <h3 class="font-semibold text-sm">${region.name}</h3>
          <p class="text-xs text-gray-600 mb-2">${region.primaryRisk}</p>
          <div class="space-y-1 text-xs">
            <div>Risk Score: <span class="font-semibold">${region.riskScore}/100</span></div>
            <div>People Affected: <span class="font-semibold">${region.peopleAffected.toLocaleString()}</span></div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      // Add click handler
      marker.on('click', () => {
        if (onRegionClick) {
          onRegionClick(region);
        }
      });
    });

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [regions, onRegionClick]);

  return (
    <div className={`h-96 w-full rounded-lg overflow-hidden shadow-md ${className}`}>
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
}
