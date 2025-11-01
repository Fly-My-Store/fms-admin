'use client';

import { useMemo } from 'react';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import BasicReactTable from 'components/tables/basicTable';
import AnimateButton from 'components/@extended/AnimateButton';
import { TABLE_STATUS } from 'utils/constants';
import ActivityForm from './ConstructionPlanActivityConfigForm';

export default function ActivityTableStep({ configActivities, handleAddButton, handleEditButton, handleBack, handleSubmit, }) {

    const totalRow = useMemo(() => {
        const totalWeightage = configActivities.reduce((acc, curr) => acc + (curr.weightage || 0), 0);
        const totalPhotos = configActivities.reduce((acc, curr) => acc + (curr.imageCount || 0), 0);
        const totalVideos = configActivities.reduce((acc, curr) => acc + (curr.videoCount || 0), 0);
        return {
            constructionActivity: { name: 'Total', activityType: { name: '' }, activityLevel: { name: '' } },
            weightage: totalWeightage,
            imageCount: totalPhotos,
            videoCount: totalVideos,
            hideEdit: true,
        };
    }, [configActivities]);

    const dataWithTotal = useMemo(() => [...configActivities, totalRow], [configActivities, totalRow]);

    const columns = useMemo(
        () => [
            {
                header: 'Activity Name',
                accessorFn: (row) => `${row.constructionActivity?.name || ''}`.trim()
            },
            {
                header: 'Activity Type',
                accessorFn: (row) => `${row.constructionActivity?.activityType?.name || ''}`.trim()
            },
            {
                header: 'Activity Level',
                accessorFn: (row) => `${row.constructionActivity?.activityLevel?.name || ''}`.trim()
            },
            {
                header: 'Weightage%',
                accessorKey: 'weightage',
                meta: {
                    sx: { textAlign: 'center' }
                }
            },
            {
                header: '#Photos',
                accessorKey: 'imageCount',
                meta: {
                    sx: { textAlign: 'center' }
                }
            },
            {
                header: '#Videos',
                accessorKey: 'videoCount',
                meta: {
                    sx: { textAlign: 'center' }
                }
            }
        ],
        []
    );
    return <>
        <BasicReactTable
            columns={columns}
            data={dataWithTotal}
            title='Construction Plan Activity Configurations'
            ariaLebel='Add Construction Activity Configuration'
            handleAddButton={handleAddButton}
            handleEditButton={handleEditButton}
            showPagination={false}
        />
        <Stack direction='row' justifyContent={'space-between'} sx={{ mt: 2 }}>
            <Button onClick={handleBack}>Back</Button>
            <AnimateButton>
                <Button variant="contained" onClick={handleSubmit}>
                    Submit
                </Button>
            </AnimateButton>
        </Stack>
    </>

}

