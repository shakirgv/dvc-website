"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useTheme } from "next-themes";
import { Users, Phone, Mail, Calendar, GraduationCap, MapPin } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslation } from "@/lib/i18n-context";
import { supabase } from "@/lib/supabase";

// DVC üçün xüsusi Bənövşəyi (Purple) Pulsing Marker - Regional
const createRegionalIcon = () => {
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

// DVC Universitet Klubları üçün Marker
const createClubIcon = () => {
  return L.divIcon({
    className: "custom-dvc-club-marker",
    html: `
      <div class="relative flex items-center justify-center w-10 h-10 -ml-2 -mt-2">
        <div class="absolute w-full h-full bg-[#3B2363]/40 rounded-full animate-ping"></div>
        <div class="bg-[#3B2363] border-2 border-white rounded-full w-9 h-9 flex items-center justify-center relative z-10 drop-shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
            <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
          </svg>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

// Leaflet default icon customization for clusters (if needed)
const customClusterIcon = function (cluster: any) {
  return L.divIcon({
    html: `<div class="bg-[#3B2363] text-white font-bold rounded-full w-12 h-12 flex items-center justify-center border-4 border-white shadow-xl relative z-20"><span>${cluster.getChildCount()}</span></div>`,
    className: "custom-marker-cluster",
    iconSize: L.point(48, 48, true),
  });
};

function MapController({ activeTab }: { activeTab: 'regional' | 'club' }) {
  const map = useMap();
  
  useEffect(() => {
    if (activeTab === 'club') {
      // Zoom into Baku
      map.flyTo([40.4093, 49.8671], 10, { duration: 1.5 });
    } else {
      // Zoom out to whole Azerbaijan
      map.flyTo([40.1431, 47.5769], 7, { duration: 1.5 });
    }
  }, [activeTab, map]);

  return null;
}

export default function Map() {
  const { theme } = useTheme();
  const params = useParams();
  const locale = (params?.locale as string) || "az";
  const { t } = useTranslation();
  
  const [centers, setCenters] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'regional' | 'club'>('regional');
  
  useEffect(() => {
    const fetchCenters = async () => {
      const { data } = await supabase.from("centers").select("*");
      if (data) setCenters(data);
    };
    fetchCenters();
  }, []);

  const googleMapsUrl = "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";
  const tileClassName = theme === "dark" ? "dark-map-tiles" : "";
  
  const filteredCenters = centers.filter(c => c.latitude && c.longitude && c.type === activeTab);

  return (
    <div className="w-full flex flex-col gap-8 relative z-10">
      
      {/* MAP TABS */}
      <div className="flex justify-center z-20 w-full relative">
        <div className="bg-muted/80 backdrop-blur p-1.5 rounded-2xl flex items-center gap-1 shadow-sm border border-border/50 inline-flex">
          <button 
            onClick={() => setActiveTab('regional')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'regional' ? 'bg-background shadow-md text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Regional Mərkəzlər
          </button>
          <button 
            onClick={() => setActiveTab('club')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'club' ? 'bg-background shadow-md text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Universitet Klubları
          </button>
        </div>
      </div>

      {/* MAP CONTAINER */}
      <div className="w-full h-[500px] md:h-[600px] rounded-3xl overflow-hidden shadow-xl border border-black/10 dark:border-white/10 relative">
        <style>{`
          .dark-map-tiles {
            filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
          }
          
          /* Premium Popup Styling */
          .leaflet-container {
            font-family: inherit !important;
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
            display: none;
          }
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
          <MapController activeTab={activeTab} />
          <TileLayer
            url={googleMapsUrl}
            attribution='&copy; Google Maps'
            className={tileClassName}
          />
          
          <MarkerClusterGroup 
            chunkedLoading
            iconCreateFunction={customClusterIcon}
            maxClusterRadius={40}
            showCoverageOnHover={false}
          >
            {filteredCenters.map((center) => (
              <Marker 
                key={center.id} 
                position={[center.latitude, center.longitude]}
                icon={activeTab === 'club' ? createClubIcon() : createRegionalIcon()}
              >
                <Popup>
                  <div className="flex flex-col w-full bg-card">
                    {/* Header Gradient Component */}
                    <div className="relative h-20 w-full bg-gradient-to-r from-primary to-primary-neon flex flex-col justify-center px-6 overflow-hidden">
                      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                      <h3 className="text-xl font-extrabold text-white m-0 relative z-10 tracking-tight pr-8">
                        {center[`name_${locale}`]}
                      </h3>
                    </div>
                    
                    {/* Details Component */}
                    <div className="p-6 space-y-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{t('map.active_clubs')} / Üzvlər</span>
                          <span className="font-extrabold text-foreground text-lg leading-tight">{center.members_count || "0"}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Yaranma İli</span>
                          <span className="font-bold text-foreground text-base leading-tight">{center.established_year || "-"}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-black/5 dark:border-white/5">
                        <div className="flex flex-col gap-1.5 overflow-hidden">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                            <Phone className="w-3.5 h-3.5" /> {t('map.phone')}
                          </div>
                          <a href={`tel:${(center.phone || "").replace(/\s+/g, '')}`} className="text-sm font-semibold text-foreground truncate hover:text-primary transition-colors cursor-pointer" title={center.phone}>{center.phone || "-"}</a>
                        </div>
                        <div className="flex flex-col gap-1.5 overflow-hidden">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                            <Mail className="w-3.5 h-3.5" /> {t('map.email')}
                          </div>
                          <a href={`mailto:${center.email}`} className="text-sm font-bold text-primary hover:text-primary-neon cursor-pointer truncate transition-colors" title={center.email}>{center.email || "-"}</a>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Component */}
                    <div className="px-6 pb-6 mt-1">
                      <Link href={`/${locale}/centers/${center.type === 'club' ? 'clubs' : 'regional'}/${center.slug}`} className="block w-full py-3 bg-primary/10 border border-primary/20 hover:bg-primary text-primary hover:text-white rounded-xl font-bold transition-all text-sm uppercase tracking-wider text-center">
                        {t('map.read_more')}
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    </div>
  );
}
