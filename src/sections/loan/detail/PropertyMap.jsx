import * as React from 'react';
import Box from '@mui/material/Box';
import Map from 'react-map-gl/mapbox';
import MapContainerStyled from 'components/third-party/map/MapContainerStyled';
import MapMarker from 'components/third-party/map/MapMarker';

const size = 20;

const ICON = `M20.2,15.7L20.2,15.7c1.1-1.6,1.8-3.6,1.8-5.7c0-5.6-4.5-10-10-10S2,4.5,2,10c0,2,0.6,3.9,1.6,5.4c0,0.1,0.1,0.2,0.2,0.3
  c0,0,0.1,0.1,0.1,0.2c0.2,0.3,0.4,0.6,0.7,0.9c2.6,3.1,7.4,7.6,7.4,7.6s4.8-4.5,7.4-7.5c0.2-0.3,0.5-0.6,0.7-0.9
  C20.1,15.8,20.2,15.8,20.2,15.7z`;

const PropertyMap = ({ lat, lng }) => {
    return (
        <MapContainerStyled>
            {!isNaN(lat) && !isNaN(lng) && (
                <Map
                    initialViewState={{ latitude: lat, longitude: lng, zoom: 14 }}
                    mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
                    mapStyle="mapbox://styles/mapbox/streets-v11"
                    style={{ width: '100%', height: 240 }}
                    scrollZoom={false}
                    doubleClickZoom={false}
                    touchZoomRotate={false}
                    dragPan={false}
                    keyboard={false}
                    onClick={() => {
                        window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
                    }}
                >
                    <MapMarker latitude={lat} longitude={lng} anchor="bottom" />
                </Map>
            )}
        </MapContainerStyled>
    );
};

export default PropertyMap;