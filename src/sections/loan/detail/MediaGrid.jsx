import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import { CheckCircleFilled, CheckCircleTwoTone, CloseCircleTwoTone, CloseOutlined, ExpandOutlined, LeftCircleTwoTone, PlayCircleTwoTone, PlusCircleFilled, PlusCircleTwoTone, PlusOutlined, RightCircleTwoTone, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
import { enqueueSnackbar } from 'notistack';
import dayjs from 'dayjs';

export default function MediaGrid({
    media = [],
    downloadReport = false,
    selectedImages,
    setSelectedImages,
    showDate = true
}) {
    const [zoom, setZoom] = useState(1);
    const groupedMedia = useMemo(() => {
        const groups = {};
        media?.forEach((item) => {
            const dateKey = dayjs(item.updatedAt).format('DD-MM-YYYY');
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(item);
        });

        // Convert to array of { date, items }
        return Object.entries(groups)
            .map(([date, items]) => ({ date, items }))
            .sort((a, b) => dayjs(b.date).diff(dayjs(a.date))); // latest first
    }, [media]);
    const [viewer, setViewer] = useState({ open: false, index: 0 });

    const handleOpen = (idx) => {
        setViewer({ open: true, index: idx });
    };

    const handleClose = () => {
        setZoom(1);
        setViewer({ open: false, url: '', type: '' })
    };

    const toggleSelectImage = (id) => {
        if (selectedImages.includes(id)) {
            setSelectedImages(selectedImages.filter((imgId) => imgId !== id));
        } else if (selectedImages.length < 6) {
            setSelectedImages([...selectedImages, id]);
        } else {
            enqueueSnackbar('You can only select up to 6 images.', {
                variant: 'warning',
                autoHideDuration: 3000
            });
        }
    };

    const allMedia = groupedMedia.flatMap(g => g.items);
    const currentMedia = allMedia[viewer.index] || {};
    const { url = '', fileType = '' } = currentMedia;

    const handlePrev = useCallback(() => {
        setZoom(1)
        setViewer((v) => ({
            ...v,
            index: (v.index - 1 + allMedia.length) % allMedia.length
        }));
    }, [allMedia.length]);

    const handleNext = useCallback(() => {
        setZoom(1)
        setViewer((v) => ({
            ...v,
            index: (v.index + 1) % allMedia.length
        }));
    }, [allMedia.length]);

    useEffect(() => {
        if (!viewer.open) return;
        setZoom(1);
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'Escape') handleClose();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [viewer.open, handleNext, handlePrev]);


    const handleOpenById = (id, items) => {
        const allMedia = groupedMedia.flatMap(g => g.items);
        const index = allMedia.findIndex(m => m.id === id);
        setViewer({ open: true, index });
    };

    return (
        <>
            <Stack spacing={4} mb={3}>
                {groupedMedia.map(({ date, items }) => (
                    <Box key={date}>
                        {showDate && <Box sx={{ mb: 1, fontWeight: 600 }}>{date}</Box>}
                        <Grid container spacing={2}>
                            {items.map((media, index) => (
                                <Grid xs={3} sm={2} size={3} key={index}>
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            width: '100%',
                                            aspectRatio: '1 / 1',
                                            borderRadius: '16px',
                                            overflow: 'hidden',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => {
                                            handleOpen(index)
                                        }}
                                    >
                                        {media.fileType === 'image' ? (
                                            <>
                                                <Image
                                                    src={media.url}
                                                    alt={`Media ${index + 1}`}
                                                    fill
                                                    style={{ objectFit: 'cover' }}
                                                    sizes="(max-width: 600px) 100vw, 9vw"
                                                />
                                                {downloadReport && (
                                                    <Box
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleSelectImage(media.id);
                                                        }}
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 8,
                                                            right: 8,
                                                            width: 32,
                                                            height: 32,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            borderRadius: '50%',
                                                            // bgcolor: 'rgba(0,0,0,0.4)',
                                                            zIndex: 10,
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {selectedImages.includes(media.id) ? (
                                                            <CheckCircleTwoTone style={{ fontSize: 24 }} />
                                                        ) : (
                                                            <CheckCircleFilled style={{ fontSize: 24 }} />
                                                        )}
                                                    </Box>
                                                )}
                                            </>
                                        ) : (<Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                                            <video
                                                src={media.url}
                                                muted
                                                preload="metadata"
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                }}
                                            />
                                            <PlayCircleTwoTone
                                                style={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '50%',
                                                    transform: 'translate(-50%, -50%)',
                                                    fontSize: 40,
                                                    color: 'white',
                                                    pointerEvents: 'none'
                                                }}
                                            />
                                        </Box>)
                                        }
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                ))}
            </Stack>

            <Dialog open={viewer.open} onClose={handleClose} maxWidth="md" fullWidth>
                <Stack position="relative" bgcolor="black" alignItems="center">
                    {fileType === 'image' && (
                        <Box
                            sx={{
                                width: '100%',
                                height: 500,
                                overflow: 'auto', // allows scrolling
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: 'black',
                            }}
                        >
                            <Image
                                src={url}
                                alt="Full"
                                width={900}
                                height={500}
                                style={{
                                    objectFit: 'contain',
                                    transform: `scale(${zoom})`,
                                    transformOrigin: 'center',
                                    transition: 'transform 0.2s ease-in-out',
                                }}
                            />
                        </Box>
                    )}
                    {fileType === 'video' && (
                        <video
                            key={url}
                            src={url}
                            autoPlay
                            muted
                            controls
                            style={{ width: '90%', height: 500, borderRadius: 8 }}
                        />
                    )}

                    {/* 7-A  CLOSE */}
                    <IconButton
                        onClick={handleClose}
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                    >
                        <CloseCircleTwoTone twoToneColor="white" />
                    </IconButton>

                    {/* 7-B  PREV */}
                    {allMedia.length > 1 && (
                        <IconButton
                            onClick={handlePrev}
                            sx={{ position: 'absolute', top: '50%', left: 8, transform: 'translateY(-50%)' }}
                        >
                            <LeftCircleTwoTone twoToneColor="white" style={{ fontSize: 32 }} />
                        </IconButton>
                    )}

                    {/* 7-C  NEXT */}
                    {allMedia.length > 1 && (
                        <IconButton
                            onClick={handleNext}
                            sx={{ position: 'absolute', top: '50%', right: 8, transform: 'translateY(-50%)' }}
                        >
                            <RightCircleTwoTone twoToneColor="white" style={{ fontSize: 32 }} />
                        </IconButton>
                    )}
                    {fileType === 'image' && (
                        <Stack
                            direction="row"
                            spacing={1}
                            position="absolute"
                            bottom={16}
                            right={16}
                            zIndex={2}
                        >

                            <IconButton
                                onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
                                sx={{ bgcolor: 'grey.100', '&:hover': { bgcolor: 'grey.300' } }}
                                size='small'
                            >
                                <ZoomInOutlined />
                            </IconButton>
                            <IconButton
                                onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
                                sx={{ bgcolor: 'grey.100', '&:hover': { bgcolor: 'grey.300' } }}
                                size='small'
                            >
                                <ZoomOutOutlined />
                            </IconButton>
                            <IconButton
                                onClick={() => setZoom(1)}
                                sx={{ bgcolor: 'grey.100', '&:hover': { bgcolor: 'grey.300' } }}
                                size='small'
                            >
                                <ExpandOutlined />
                            </IconButton>
                        </Stack>
                    )}
                </Stack>
            </Dialog>
        </>
    );
}