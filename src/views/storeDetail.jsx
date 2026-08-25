'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Alert,
  Box,
  Stack,
  Tab,
  Tabs,
  Typography
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import StoreLocationMap from 'sections/stores/StoreLocationMap';
import StoreOrdersCard from 'sections/stores/StoreOrdersCard';
import SellerPayoutsCard from 'sections/stores/SellerPayoutsCard';
import StoreSupportTicketsCard from 'sections/stores/StoreSupportTicketsCard';
import SellerKycDocumentsPanel from 'sections/seller-documents/SellerKycDocumentsPanel';
import PharmacyLicenseReviewPanel from 'sections/seller-documents/PharmacyLicenseReviewPanel';
import StoreDetailSidebar from 'sections/stores/detail/StoreDetailSidebar';
import StoreVariantsTab from 'sections/stores/detail/StoreVariantsTab';
import StoreBulkUploadTab from 'sections/stores/detail/StoreBulkUploadTab';
import { getStore } from 'api/sellersStores';

const TAB_IDS = ['orders', 'variants', 'bulk-upload', 'seller', 'location', 'verification', 'pharmacy', 'payouts', 'support'];

const safe = (v) => (v === null || v === undefined || v === '' ? '—' : String(v));

const KV = ({ label, value }) => (
  <Stack direction="row" spacing={1.5} alignItems="baseline">
    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
      {label}
    </Typography>
    <Typography variant="body2">{safe(value)}</Typography>
  </Stack>
);

export default function StoreDetailView() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params?.id;

  const initialTab = searchParams?.get('tab');
  const [tab, setTab] = useState(TAB_IDS.includes(initialTab) ? initialTab : 'orders');
  const [visited, setVisited] = useState(() => new Set([TAB_IDS.includes(initialTab) ? initialTab : 'orders']));

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      setData(null);
      try {
        const resp = await getStore(id);
        if (!cancelled) setData(resp?.data || resp);
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || e?.response?.data?.message || 'Failed to load store');
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    const q = searchParams?.get('tab');
    if (q && TAB_IDS.includes(q) && q !== tab) {
      setTab(q);
      setVisited((prev) => new Set(prev).add(q));
    }
  }, [searchParams, tab]);

  const handleTabChange = (_, value) => {
    setTab(value);
    setVisited((prev) => new Set(prev).add(value));
    router.replace(`/stores/${id}?tab=${value}`, { scroll: false });
  };

  const breadcrumb = useMemo(() => {
    const name = data?.name || id || 'store';
    return {
      heading: 'store',
      links: [
        { title: 'home', to: '/dashboard' },
        { title: 'stores', to: '/stores' },
        { title: name, i18n: false }
      ]
    };
  }, [data?.name, id]);

  const seller = data?.seller || null;
  const sellerUser = seller?.user || null;
  const sellerId = seller?.id;
  const sellerUserId = seller?.user_id || sellerUser?.id;
  const sellerName = seller?.display_name || seller?.legal_name;
  const isDemo = Boolean(data?.is_demo || seller?.is_demo);
  const ownerPhone = sellerUser?.phone
    ? `${sellerUser.country_code ? `${sellerUser.country_code} ` : ''}${sellerUser.phone}`
    : null;

  const showPharmacyTab = Boolean(seller?.is_pharmacy);

  return (
    <>
      <Breadcrumbs custom heading={breadcrumb.heading} links={breadcrumb.links} />

      {loading && <Alert severity="info">Loading store…</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && data && (
        <Grid container spacing={2} alignItems="flex-start">
            <Grid size={{ xs: 12, md: 4, lg: 3 }}>
              <StoreDetailSidebar
                data={data}
                seller={seller}
                sellerUser={sellerUser}
                ownerPhone={ownerPhone}
                onEdit={() => router.push(`/stores/edit/${id}`)}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 8, lg: 9 }}>
              <MainCard content={false} border={false} divider={false} showTitle={false}>
                <Tabs
                  value={tab}
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
                >
                  <Tab label="Orders" value="orders" />
                  <Tab label="Variants" value="variants" />
                  <Tab label="Bulk upload" value="bulk-upload" />
                  <Tab label="Seller" value="seller" />
                  <Tab label="Location" value="location" />
                  <Tab label="Verification" value="verification" />
                  {showPharmacyTab ? <Tab label="Pharmacy" value="pharmacy" /> : null}
                  {sellerId ? <Tab label="Payouts" value="payouts" /> : null}
                  <Tab label="Support" value="support" />
                </Tabs>

                <Box sx={{ p: 2 }}>
                  {visited.has('orders') && (
                    <Box hidden={tab !== 'orders'}>
                      <StoreOrdersCard storeId={id} />
                    </Box>
                  )}

                  {visited.has('variants') && (
                    <Box hidden={tab !== 'variants'}>
                      <StoreVariantsTab storeId={id} isDemo={isDemo} />
                    </Box>
                  )}

                  {visited.has('bulk-upload') && (
                    <Box hidden={tab !== 'bulk-upload'}>
                      <StoreBulkUploadTab storeId={id} isDemo={isDemo} />
                    </Box>
                  )}

                  {visited.has('seller') && (
                    <Box hidden={tab !== 'seller'}>
                      <MainCard title="Seller details">
                        {seller ? (
                          <Stack spacing={1}>
                            <KV label="Display name" value={seller.display_name} />
                            <KV label="Legal name" value={seller.legal_name} />
                            <KV label="GSTIN" value={seller.gstin} />
                            <KV label="PAN" value={seller.pan} />
                            <KV label="CIN" value={seller.cin} />
                            <KV label="Pharmacy seller" value={seller.is_pharmacy ? 'Yes' : 'No'} />
                            <KV label="Support email" value={seller.support_email} />
                            <KV label="Support phone" value={seller.support_phone} />
                          </Stack>
                        ) : (
                          <Alert severity="info" variant="outlined">
                            No seller attached to this store.
                          </Alert>
                        )}
                      </MainCard>
                    </Box>
                  )}

                  {visited.has('location') && (
                    <Box hidden={tab !== 'location'}>
                      <StoreLocationMap store={data} />
                    </Box>
                  )}

                  {visited.has('verification') && sellerId && (
                    <Box hidden={tab !== 'verification'}>
                      <SellerKycDocumentsPanel
                        sellerId={sellerId}
                        sellerKyc={{
                          status: seller?.kyc_status,
                          reason: seller?.kyc_reason
                        }}
                        sellerKyb={{
                          status: seller?.kyb_status,
                          reason: seller?.kyb_reason
                        }}
                        storeKyb={{
                          status: data?.kyb_status,
                          reason: data?.kyb_reason
                        }}
                      />
                    </Box>
                  )}

                  {visited.has('verification') && !sellerId && (
                    <Box hidden={tab !== 'verification'}>
                      <Alert severity="info">No seller linked — verification unavailable.</Alert>
                    </Box>
                  )}

                  {showPharmacyTab && visited.has('pharmacy') && (
                    <Box hidden={tab !== 'pharmacy'}>
                      <PharmacyLicenseReviewPanel
                        sellerId={sellerId}
                        isPharmacy={Boolean(seller?.is_pharmacy)}
                        editable
                      />
                    </Box>
                  )}

                  {sellerId && visited.has('payouts') && (
                    <Box hidden={tab !== 'payouts'}>
                      <SellerPayoutsCard sellerId={sellerId} sellerName={sellerName} />
                    </Box>
                  )}

                  {visited.has('support') && (
                    <Box hidden={tab !== 'support'}>
                      <StoreSupportTicketsCard storeId={id} sellerUserId={sellerUserId} />
                    </Box>
                  )}
                </Box>
              </MainCard>
            </Grid>
          </Grid>
      )}

      {!loading && !data && !error && (
        <Alert severity="warning">Store not found.</Alert>
      )}
    </>
  );
}
