// File: GMapView.jsx

import React, { useCallback, useRef, useState } from 'react';
import {
    GoogleMap,
    useLoadScript,
    Marker,
} from '@react-google-maps/api';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import axios from 'axios';

const containerStyle = {
    width: '100%',
    height: '600px'
};

const center = {
    lat: 23.5937,
    lng: 80.9629
};

const branchIcon = '/branch-icon.png';
const propertyIcon = '/property-icon.png';

export default function GMapView() {
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    });

    const [branches, setBranches] = useState([]);
    const [properties, setProperties] = useState([]);
    const mapRef = useRef(null);
    const [zoom, setZoom] = useState(5);

    const onLoad = useCallback((map) => {
        mapRef.current = map;
        fetchMapData(map);
    }, []);

    const onIdle = useCallback(() => {
        const map = mapRef.current;
        if (!map) return;
        fetchMapData(map);
    }, []);

    const fetchMapData = async (map) => {
        const bounds = map.getBounds();
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        const zoomLevel = map.getZoom();
        setZoom(zoomLevel);

        const res = await axios.get('/api/map-data', {
            params: {
                neLat: ne.lat(),
                neLng: ne.lng(),
                swLat: sw.lat(),
                swLng: sw.lng(),
                zoom: zoomLevel
            }
        });

        setBranches(res.data.branches || []);
        setProperties(res.data.properties || []);
    };

    if (!isLoaded) return <div>Loading...</div>;

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={5}
            onLoad={onLoad}
            onIdle={onIdle}
        >
            <MarkerClusterer>
                {(clusterer) => (
                    <>
                        {branches.map(b => (
                            <Marker
                                key={`b-${b.id}`}
                                position={{ lat: b.lat, lng: b.lng }}
                                icon={{ url: branchIcon }}
                                clusterer={clusterer}
                                title={zoom >= 14 ? `${b.name} (${b.pincode})` : ''}
                            />
                        ))}
                        {properties.map(p => (
                            <Marker
                                key={`p-${p.id}`}
                                position={{ lat: p.lat, lng: p.lng }}
                                icon={{ url: propertyIcon }}
                                clusterer={clusterer}
                                title={zoom >= 14 && p.loan ? `${p.loan.loanNumber} - ${p.loan.customerName}` : ''}
                            />
                        ))}
                    </>
                )}
            </MarkerClusterer>
        </GoogleMap>
    );
}