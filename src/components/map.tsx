"use client";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { useState } from "react";

export default function GoogleMapComponent() {
  const position = { lat: -1.286389, lng: 36.817223 };
  const [selected, setSelected] = useState(false);

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "500px" }}
        center={position}
        zoom={13}
      >
        <Marker position={position} onClick={() => setSelected(true)} />
        {selected && (
          <InfoWindow position={position} onCloseClick={() => setSelected(false)}>
            <div>
              <strong>Nairobi CBD</strong>
              <p>Example marker.</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
}
