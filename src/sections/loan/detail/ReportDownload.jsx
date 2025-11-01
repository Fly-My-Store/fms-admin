'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    Box,
    Stack,
    Alert,
    Fab,
    FormControl,
    Select,
    MenuItem,
    Button,
    LinearProgress
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import DownloadOutlined from '@ant-design/icons/DownloadOutlined';
import { enqueueSnackbar } from 'notistack';

import MediaGrid from './MediaGrid';
import {
    fetchMediaRequest,
    downloadConstructionReportPdfRequest,
    fetchConstructionPlansRequest,
    fetchLoanByIdRequest
} from 'store/loan/loanSlice';
import ConstructionPlanTable from 'components/tables/constructionPlanTable';
import ConstructionPlanDetails from './ConstructionPlanDetails';
import ConfirmationDialog from 'components/ConfirmationDialog';

export default function ReportDownload({ loanId }) {
    const dispatch = useDispatch();
    const [mediaType, setMediaType] = useState('Photos');
    const [selectedImages, setSelectedImages] = useState([]);

    const { constructionPlans, media, loan, loading } = useSelector((state) => state.loan);
    const [selectedPlan, setSelectedPlan] = useState();
    const [open, setOpen] = useState(false);

    const fetchConstructionPlans = useCallback((fetchLoan) => {
        dispatch(fetchConstructionPlansRequest({ loanId, progress: 2 }));
        if (fetchLoan) {
            setOpen(false);
            dispatch(fetchLoanByIdRequest(loanId));
        }
    }, [loanId]);

    useEffect(() => {
        if (loanId) {
            fetchConstructionPlans(false);
            dispatch(fetchMediaRequest(loanId));
        }
    }, [loanId, dispatch]);



    const handleDownloadClick = () => {
        if (selectedImages.length === 0) {
            enqueueSnackbar('Please select at least one image to download the report', {
                variant: 'warning'
            });
            return;
        }
        dispatch(
            downloadConstructionReportPdfRequest({
                id: loanId,
                params: { mediaIds: selectedImages, loanNumber: loan?.loanNumber }
            })
        );
    };

    const onMediaTypeChange = (value) => {
        setMediaType(value === mediaType ? 'All' : value);
    };


    const filteredMedia = media?.filter((item) => item.fileType?.includes('image'));

    const handleDrawerClose = () => {
        setSelectedPlan();
    };

    const onRowClick = (data) => {
        setSelectedPlan(data);
    };

    const handleChangePlan = () => {
        setShowConfig(true);
        setOpen(false)
    };

    return (
        <>
            {
                constructionPlans?.length > 0 ? (
                    <>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '100%',
                                mb: 2
                            }}
                        >
                            <Alert severity="info">Please review construction plan and update to download report</Alert>
                        </Box>
                        <ConstructionPlanTable
                            title={constructionPlans[0]?.planName || ''}
                            data={constructionPlans}
                            onRowClick={onRowClick}
                            selectedPlan={selectedPlan}
                        />
                    </>
                ) : !media || media.length === 0 ? (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100%',
                        }}
                    >
                        <Alert severity="info">No media available for this loan</Alert>
                    </Box>
                ) : (
                    <>
                        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                            <Alert severity="info">
                                Select images to download construction report. You can select up to 6 photos.
                            </Alert>
                        </Stack>

                        <Box sx={{ position: 'fixed', bottom: 24, right: 64, zIndex: 9999 }}>
                            <Fab
                                variant="extended"
                                color="primary"
                                disabled={selectedImages.length === 0}
                                onClick={handleDownloadClick}
                            >
                                {`Download Construction Report${selectedImages.length > 0 ? ` (${selectedImages.length})` : ''
                                    }`}
                            </Fab>
                        </Box>

                        <MediaGrid
                            media={filteredMedia}
                            selectedImages={selectedImages}
                            setSelectedImages={setSelectedImages}
                            downloadReport={true}
                        />
                    </>
                )
            }


            <ConstructionPlanDetails open={selectedPlan?.id ? true : false} selectedPlan={selectedPlan} handleDrawerClose={handleDrawerClose} fetchConstructionPlans={fetchConstructionPlans} />
            <ConfirmationDialog
                open={open}
                title={'Reset the construction plan'}
                description={`Are you sure you want to reset the plan? It will delete all the submitted photos and reset the plan.`}
                onConfirm={handleChangePlan}
                onCancel={() => setOpen(false)}
            />
        </>
    );
}