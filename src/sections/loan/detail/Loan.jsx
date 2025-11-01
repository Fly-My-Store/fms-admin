'use client';

// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid2';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// third-party
import Map from 'react-map-gl/mapbox';

// project imports
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';
import LinearWithLabel from 'components/@extended/progress/LinearWithLabel';

// assets
import AimOutlined from '@ant-design/icons/AimOutlined';
import EnvironmentOutlined from '@ant-design/icons/EnvironmentOutlined';
import MailOutlined from '@ant-design/icons/MailOutlined';
import PhoneOutlined from '@ant-design/icons/PhoneOutlined';
import MapContainerStyled from 'components/third-party/map/MapContainerStyled';
import DisbursementTable from '../list/DisbursementTable';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import MapMarker from 'components/third-party/map/MapMarker';
import { width } from '@mui/system';
import { formatCurrency } from 'utils/text-formatter';
import { Button, Checkbox } from '@mui/material';
import PropertyForm from './PropertyForm';
import { useState } from 'react';
import { EditAction } from 'components/tables/basicTable';
import PropertyMap from './PropertyMap';

// ==============================|| ACCOUNT PROFILE - BASIC ||============================== //

export default function LoanDetail() {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const [open, setOpen] = useState(false);

  const { loan } = useSelector((state) => state.loan);
  if (!loan) return null;
  const fullAddress = `${loan.property?.address || ''}, ${loan.property?.city || ''}, ${loan.property?.district || ''}, ${loan.property?.state || ''}, ${loan.property?.pincode || ''}, ${loan.property?.country || 'India'}`.replace(/(, )+/g, ', ').replace(/^, |, $/g, '').trim();

  const handleDialogToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleEditButton = () => {
    setOpen(true);
  };

  const lat = Number(loan.property?.lat);
  const lng = Number(loan.property?.lng);

  return (
    <>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 12, md: 12, xl: 12 }}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <MainCard title="Loan Details" >
                <Stack spacing={1}>
                  <Grid container spacing={3}>
                    <Grid size={6}>
                      <Grid container spacing={3}>
                        <Grid size={12}>
                          <Typography color="text.secondary" mb={1}>Sanction Amount</Typography>
                          <Typography >{`₹ ${formatCurrency(loan.sanctionedAmount)}`}</Typography>
                        </Grid>
                        <Grid size={12}>

                          <Typography color="text.secondary" mb={1}>Land Value</Typography>
                          <Typography >{`₹ ${formatCurrency(loan.landValue)}`}</Typography>
                        </Grid>
                        <Grid size={12}>
                          <Typography color="text.secondary" mb={1}>Property Value</Typography>
                          <Typography >{`₹ ${formatCurrency(loan.propertyValue)}`}</Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid size={6}>
                      <Grid container spacing={3}>
                        <Grid size={12}>
                          <Typography color="text.secondary" mb={1}>Sanction Date</Typography>
                          <Typography >{`${dayjs(loan.sanctionedDate).format('DD-MM-YYYY')}`}</Typography>
                        </Grid>
                        <Grid size={12}>
                          <Typography color="text.secondary" mb={1}>Construction Value</Typography>
                          <Typography >{`₹ ${formatCurrency(loan.constructionValue)}`}</Typography>
                        </Grid>
                        <Grid size={12}>
                          <Typography color="text.secondary" mb={1}>LTV</Typography>
                          <Typography >{`${loan.ltv}%`}</Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Stack>
              </MainCard>
            </Grid>
            <Grid size={12}>
              <MainCard title="Customer Details" >
                <Stack spacing={1}>
                  <Grid container spacing={3}>
                    <Grid size={6}>
                      <Grid container spacing={3}>
                        <Grid size={12}>
                          <Typography color="text.secondary" mb={1}>First Name</Typography>
                          <Typography >{`${loan.firstName}`}</Typography>
                        </Grid>
                        <Grid size={12}>
                          <Typography color="text.secondary" mb={1}>Email</Typography>
                          <Typography >{`${loan.email || 'N/A'}`}</Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid size={6}>
                      <Grid container spacing={3}>
                        <Grid size={12}>
                          <Typography color="text.secondary" mb={1}>Last Name</Typography>
                          <Typography >{`${loan.lastName}`}</Typography>
                        </Grid>
                        <Grid size={12}>
                          <Typography color="text.secondary" mb={1}>Mobile</Typography>
                          <Typography >{`${loan.mobile}`}</Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Stack>
              </MainCard>
            </Grid>
            <Grid size={12}>
              <MainCard
                title="Property Details">
                <Stack spacing={1}>
                  <Grid container spacing={3}>
                    <Grid size={6}>
                      <Grid container spacing={3}>
                        <Grid size={12}>
                          <Typography color="text.secondary" mb={1}>Description</Typography>
                          <Typography >{`${loan.property?.name || '-'}`}</Typography>
                        </Grid>
                        <Grid size={12}>
                          <Typography color="text.secondary" mb={1}>Floors</Typography>
                          <Typography >{`${loan.property?.floors || '-'}`}</Typography>
                        </Grid>
                        <Grid size={12}>
                          <Typography color="text.secondary" mb={1}>Basements</Typography>
                          <Typography >{`${loan.property?.basements || '-'}`}</Typography>
                        </Grid>
                        <Grid size={12}>
                          <Stack direction={'row'} alignItems={'center'} justifyContent={'flex-start'}>
                            <Typography>Is ground floor non residential?</Typography>
                            <Checkbox
                              id="isGroundFloorNonResidential"
                              checked={loan.property?.floors - loan?.property?.residentialFloors === 1}
                            />
                          </Stack>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid size={6}>
                      <Grid container spacing={3}>

                        <Grid size={12}>
                          <Typography color="text.secondary" mb={1}>Land Area</Typography>
                          <Typography >{loan.property?.landArea ? `${loan.property?.landArea} sqft.` : '-'}</Typography>
                        </Grid>
                        <Grid size={12}>
                          <Typography color="text.secondary" mb={1}>Built Up Area</Typography>
                          <Typography >{loan.property?.builtUpArea ? `${loan.property?.builtUpArea} sqft.` : '-'}</Typography>
                        </Grid>
                        <Grid size={12}>
                          <Typography color="text.secondary" mb={1}>Structure Type</Typography>
                          <Typography >{`${loan.property?.structureType?.name || '-'}`}</Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Stack>
              </MainCard>
            </Grid>

            <Grid size={12}>
              <MainCard
                title="Property Address"
                secondary={
                  loan.property?.id ? <EditAction handleEditButton={handleEditButton} /> : null
                }>
                <Stack spacing={1}>
                  <Grid container spacing={3}>
                    <Grid size={6} >
                      <Grid container spacing={3}>
                        <Grid size={12}>
                          <PropertyMap lat={lat || 0} lng={lng || 0} />
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid size={6}>
                      <Grid container spacing={3}>
                        <Grid size={12}>
                          <Typography color="text.secondary" mb={1}>Address</Typography>
                          <Typography >{`${fullAddress}`}</Typography>
                        </Grid>
                        <Grid size={6}>
                          <Typography color="text.secondary" mb={1}>Latitude</Typography>
                          <Typography >{`${loan.property?.lat || '-'}`}</Typography>
                        </Grid>
                        <Grid size={6}>
                          <Typography color="text.secondary" mb={1}>Longitude</Typography>
                          <Typography >{`${loan.property?.lng || '-'}`}</Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Stack>
              </MainCard>
            </Grid>
            <Grid size={12}>
              <DisbursementTable
                disbursals={loan.loanDisbursals || []}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <PropertyForm
        open={open}
        onClose={handleDialogToggle}
        initialData={loan.property}
      />
    </>

  );
}
