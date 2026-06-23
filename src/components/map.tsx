"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useTheme } from "next-themes";
import { Users, Phone, Mail, User } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

// DVC üçün xüsusi Bənövşəyi (Purple) Pulsing Marker
const createCustomIcon = () => {
  return L.divIcon({
    className: "custom-dvc-marker",
    html: `
      <div class="relative flex items-center justify-center w-10 h-10 -ml-2 -mt-2">
        <div class="absolute w-full h-full bg-[#733B96]/40 rounded-full animate-ping"></div>
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="#733B96" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="relative z-10 drop-shadow-lg">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
          <circle cx="12" cy="10" r="3" fill="white"></circle>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

const REGIONS = [
  { id: "baku", name: "Bakı", lat: 40.4093, lng: 49.8671, clubs: 15, head: "Əli Əliyev", phone: "+994 50 123 45 67", email: "baku@dvc.az" },
  { id: "ganja", name: "Gəncə", lat: 40.6828, lng: 46.3606, clubs: 8, head: "Vəli Vəliyev", phone: "+994 50 234 56 78", email: "ganja@dvc.az" },
  { id: "sumgait", name: "Sumqayıt", lat: 40.5897, lng: 49.6686, clubs: 5, head: "Aygün Məmmədova", phone: "+994 50 345 67 89", email: "sumgait@dvc.az" },
  { id: "lankaran", name: "Lənkəran", lat: 38.7529, lng: 48.8511, clubs: 4, head: "Elçin Həsənov", phone: "+994 50 456 78 90", email: "lankaran@dvc.az" },
  { id: "shaki", name: "Şəki", lat: 41.1919, lng: 47.1706, clubs: 3, head: "Aysel Quliyeva", phone: "+994 50 567 89 01", email: "shaki@dvc.az" },
];

export default function Map() {
  const { theme } = useTheme();
  const params = useParams();
  const locale = params?.locale || "az";
  
  const googleMapsUrl = "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";
  const tileClassName = theme === "dark" ? "dark-map-tiles" : "";

  return (
    <div className="w-full h-full rounded-3xl overflow-hidden shadow-xl border border-black/10 dark:border-white/10 relative z-10">
      <style>{`
        .dark-map-tiles {
          filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
        }
        
        /* Premium Popup Styling */
        .leaflet-container {
          font-family: inherit !important; /* Ensures Next.js font (Geist/Inter) is inherited correctly, supporting "Ə" */
        }
        .leaflet-popup-content-wrapper {
          background: var(--card) !important;
          color: var(--foreground) !important;
          border-radius: 1.25rem !important;
          padding: 0 !important;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
          border: 1px solid rgba(115, 59, 150, 0.2);
        }
        .leaflet-popup-content {
          margin: 0 !important;
          width: 300px !important;
        }
        .leaflet-popup-tip-container {
          display: none; /* Hide default arrow */
        }
        /* Custom X button */
        .leaflet-container a.leaflet-popup-close-button {
          color: white !important;
          padding: 0 !important;
          width: 28px !important;
          height: 28px !important;
          line-height: 28px !important;
          text-align: center;
          font-size: 24px !important;
          font-weight: 300 !important;
          top: 12px !important;
          right: 12px !important;
          z-index: 20;
          text-shadow: none;
          border-radius: 50%;
          background: rgba(0,0,0,0.15) !important;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .leaflet-container a.leaflet-popup-close-button:hover {
          color: white !important;
          background: rgba(0,0,0,0.3) !important;
          transform: scale(1.05);
        }
      `}</style>
      
      <MapContainer 
        center={[40.1431, 47.5769]} 
        zoom={7} 
        style={{ height: "100%", width: "100%", zIndex: 1 }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url={googleMapsUrl}
          attribution='&copy; Google Maps'
          className={tileClassName}
        />
        {REGIONS.map((region) => (
          <Marker 
            key={region.id} 
            position={[region.lat, region.lng]}
            icon={createCustomIcon()}
          >
            <Popup>
              <div className="flex flex-col w-full bg-card">
                {/* Header Gradient Component */}
                <div className="relative h-20 w-full bg-gradient-to-r from-primary to-primary-neon flex flex-col justify-center px-6 overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                  <h3 className="text-xl font-extrabold text-white m-0 relative z-10 tracking-tight pr-8">
                    {region.name} Mərkəzi
                  </h3>
                </div>
                
                {/* Details Component */}
                <div className="p-6 space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Aktiv Klublar</span>
                      <span className="font-extrabold text-foreground text-lg leading-tight">{region.clubs} müəssisə</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Mərkəz Rəhbəri</span>
                      <span className="font-bold text-foreground text-base leading-tight">{region.head}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-black/5 dark:border-white/5">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <Phone className="w-3.5 h-3.5" /> Telefon
                      </div>
                      <span className="text-sm font-semibold text-foreground truncate" title={region.phone}>{region.phone}</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <Mail className="w-3.5 h-3.5" /> E-poçt
                      </div>
                      <span className="text-sm font-bold text-primary hover:text-primary-neon cursor-pointer truncate transition-colors" title={region.email}>{region.email}</span>
                    </div>
                  </div>
                </div>
                
                {/* Action Component */}
                <div className="px-6 pb-6 mt-1">
                  <Link href={`/${locale}/centers/regional/${region.id}`} className="block w-full py-3 bg-primary/10 border border-primary/20 hover:bg-primary text-primary hover:text-white rounded-xl font-bold transition-all text-sm uppercase tracking-wider text-center">
                    Daha Ətraflı
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
