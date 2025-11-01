'use client';

import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  GoogleMap,
  useLoadScript,
  Marker,
  MarkerClusterer
} from '@react-google-maps/api';
import {
  Stack
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';

import Filters from 'sections/geo-map/Filters';
import PropertiesWithoutLocation from 'sections/geo-map/PropertiesWithoutLocation';
import {
  fetchGeoMapBranchesRequest,
  fetchGeoMapPropertiesRequest,
  resetGeoMapBranches,
  resetGeoMapProperties
} from 'store/location/locationSlice';

const home_pin = '/assets/images/icons/home_pin.png';
const account_balance = '/assets/images/icons/account_balance.png';

const containerStyle = {
  width: '100%',
  height: '100%',
  backgroundColor: 'red',
};

const mapOptions = {
  disableDefaultUI: true, // removes all default controls
  streetViewControl: false, // removes Pegman
  mapTypeControl: false,
  fullscreenControl: true,
  zoomControl: true, // optional, keeps zoom +/- buttons
  gestureHandling: 'greedy', // or 'cooperative' to restrict touch gestures
};

export default function GMapView() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  });

  const dispatch = useDispatch();
  const { geoMapProperties, geoMapBranches } = useSelector((state) => state.location);
  const { data: properties } = geoMapProperties;
  const { data: branches } = geoMapBranches;

  const [filters, setFilters] = useState({
    city: null,
    zone: null,
    district: null,
    state: null,
    showBranches: true,
    showProperties: true,
  });

  const mapRef = useRef(null);
  const lastBoundsRef = useRef(null);
  const lastZoomRef = useRef(null);
  const debounceTimer = useRef(null);
  const isFetchingRef = useRef(false);
  const prevFiltersRef = useRef(filters);
  const [mapReady, setMapReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCenter, setCurrentCenter] = useState({ lat: 23.5937, lng: 80.9629 });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          console.warn("Geolocation permission denied or unavailable.");
        }
      );
    }
  }, []);

  const onLoad = useCallback((map) => {
    mapRef.current = map;
    setMapReady(true);
  }, []);

  const debouncedResetAndFetch = useCallback((force = false) => {
    if (!mapRef.current || isFetchingRef.current) return;

    const map = mapRef.current;
    const bounds = map.getBounds();
    const zoom = map.getZoom();

    if (!bounds) return;

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    if (!force && isFetchingRef.current) return;

    isFetchingRef.current = true;
    setIsLoading(true);

    dispatch(resetGeoMapBranches());
    dispatch(resetGeoMapProperties());

    const payload = {
      page: 1,
      neLat: ne.lat(),
      neLng: ne.lng(),
      swLat: sw.lat(),
      swLng: sw.lng(),
      zoomLevel: zoom,
      city: filters?.city?.name,
      district: filters?.district?.name,
      zone: filters?.zone?.name,
      state: filters?.state?.name,
      branchId: filters?.branch?.id,
      autoFetchNext: true,
    };

    if (filters.showBranches) {
      dispatch(fetchGeoMapBranchesRequest(payload));
    }

    if (filters.showProperties) {
      dispatch(fetchGeoMapPropertiesRequest({
        ...payload,
        stateId: filters?.state?.id,
        districtId: filters?.district?.id,
        zoneId: filters?.zone?.id,
      }));
    }

    setTimeout(() => {
      isFetchingRef.current = false;
      setIsLoading(false);
    }, 1000);
  }, [filters]);

  const onIdle = useCallback(() => {
    if (!mapRef.current || isFetchingRef.current) return;

    const map = mapRef.current;
    const bounds = map.getBounds();
    const zoom = map.getZoom();

    if (!bounds) return;

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    const boundsChanged =
      !lastBoundsRef.current ||
      lastBoundsRef.current.ne.lat !== ne.lat() ||
      lastBoundsRef.current.ne.lng !== ne.lng() ||
      lastBoundsRef.current.sw.lat !== sw.lat() ||
      lastBoundsRef.current.sw.lng !== sw.lng();

    const zoomChanged = zoom !== lastZoomRef.current;

    lastBoundsRef.current = {
      ne: { lat: ne.lat(), lng: ne.lng() },
      sw: { lat: sw.lat(), lng: sw.lng() },
    };
    lastZoomRef.current = zoom;

    if (boundsChanged || zoomChanged) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      debounceTimer.current = setTimeout(() => {
        debouncedResetAndFetch(false);
      }, 500);
    }
  }, [filters, debouncedResetAndFetch]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const changed =
      JSON.stringify(prevFiltersRef.current) !== JSON.stringify(filters);

    if (!changed) return;

    prevFiltersRef.current = filters;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      debouncedResetAndFetch(true);
    }, 500);
  }, [filters, mapReady]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <Stack height={'85vh'} width={'100%'} spacing={2}>
      <Filters handleFilterChange={handleFilterChange} filters={filters} />
      <Stack flex={1} direction='row'>
        <Stack flex={7} position="relative">
          {isLoading && <div style={{ position: 'absolute', top: 10, left: 10, background: 'white', padding: '5px 10px', zIndex: 10 }}>Loading Map Data...</div>}
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={currentCenter}
            zoom={10}
            onLoad={onLoad}
            onIdle={onIdle}
            options={mapOptions}
          >
            <MarkerClusterer averageCenter enableRetinaIcons gridSize={60}>
              {(clusterer) => (
                <>
                  {filters.showBranches && branches?.filter(b =>
                    !isNaN(Number(b.lat)) && !isNaN(Number(b.lng))
                  ).map(b => (
                    <Marker
                      key={`branch-${b.id}`}
                      position={{ lat: Number(b.lat), lng: Number(b.lng) }}
                      clusterer={clusterer}
                      title={`${b.name} (${b.pincode})`}
                      icon={{
                        url: account_balance,
                        scaledSize: new window.google.maps.Size(40, 40),
                      }}
                    />
                  ))}

                  {filters.showProperties && properties?.filter(p =>
                    !isNaN(Number(p.lat)) && !isNaN(Number(p.lng))
                  ).map(p => (
                    <Marker
                      key={`property-${p.id}`}
                      position={{ lat: Number(p.lat), lng: Number(p.lng) }}
                      clusterer={clusterer}
                      title={`${p.loan?.loanNumber || ''} - ${p.address || ''}`}
                      icon={{
                        url: home_pin,
                        scaledSize: new window.google.maps.Size(40, 40),
                      }}
                    />
                  ))}
                </>
              )}
            </MarkerClusterer>
          </GoogleMap>
        </Stack>
      </Stack>
    </Stack>
  );
}