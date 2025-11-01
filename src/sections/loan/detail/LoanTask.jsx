import { useState } from 'react';
import Image from 'next/image';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import { CloseCircleTwoTone, CloseOutlined, PlayCircleTwoTone } from '@ant-design/icons';
import { Alert } from '@mui/material';

export default function LoanTask() {
    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Alert severity="info">No task available for this loan</Alert>
            </Box>
        </>
    );
}