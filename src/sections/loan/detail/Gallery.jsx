'use client';

import { useEffect, useState } from 'react';
import {
    Box,
    Stack,
    Alert,
    Fab,
    FormControl,
    Select,
    MenuItem,
    Button
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import DownloadOutlined from '@ant-design/icons/DownloadOutlined';
import { enqueueSnackbar } from 'notistack';

import MediaGrid from './MediaGrid';
import {
    fetchMediaRequest,
    downloadConstructionReportPdfRequest
} from 'store/loan/loanSlice';

export default function Gallery({ loanId }) {
    const dispatch = useDispatch();
    const [mediaType, setMediaType] = useState('All');
    const [selectedImages, setSelectedImages] = useState([]);

    const { media, loan, loading } = useSelector((state) => state.loan);

    useEffect(() => {
        if (loanId) {
            dispatch(fetchMediaRequest(loanId));
        }
    }, [loanId, dispatch]);

    const onMediaTypeChange = (value) => {
        setMediaType(value === mediaType ? 'All' : value);
    };

    if (!media || media.length === 0) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%'
                }}
            >
                <Alert severity="info">No media available for this loan</Alert>
            </Box>
        );
    }

    const filteredMedia =
        mediaType === 'All'
            ? media
            : media?.filter((item) =>
                mediaType === 'Photos'
                    ? item.fileType?.includes('image')
                    : item.fileType?.includes('video')
            );



    return (
        <>
            <Stack direction='row' spacing={1} mb={2} alignItems='center' justifyContent={'flex-end'}>
                <Button
                    variant={mediaType === 'All' ? 'contained' : 'outlined'}
                    onClick={() => onMediaTypeChange('All')}
                    size='small'
                >
                    All
                </Button>
                <Button
                    variant={mediaType === 'Photos' ? 'contained' : 'outlined'}
                    onClick={() => onMediaTypeChange('Photos')}
                    size='small'
                >
                    Photos
                </Button>
                <Button
                    variant={mediaType === 'Videos' ? 'contained' : 'outlined'}
                    onClick={() => onMediaTypeChange('Videos')}
                    size='small'
                >
                    Videos
                </Button>
            </Stack>

            <MediaGrid
                media={filteredMedia}
                selectedImages={selectedImages}
                setSelectedImages={setSelectedImages}
                downloadReport={false}
            />
        </>
    );
}