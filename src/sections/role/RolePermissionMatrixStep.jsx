'use client';

import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

// project imports
import AnimateButton from 'components/@extended/AnimateButton';
import { Box, Paper } from '@mui/material';

const ACTIONS = ['create', 'read', 'modify', 'delete'];

export default function RolePermissionMatrixStep({ permissionMatrix, setPermissionMatrix, handleBack, handleSubmit }) {
    const { permissions = [], loading } = useSelector((state) => state.rolePermission);

    const handleCheck = (moduleId, action, checked) => {
        setPermissionMatrix((prev) => {
            const existing = prev[moduleId] || {};
            return {
                ...prev,
                [moduleId]: {
                    ...existing,
                    [action]: checked
                }
            };
        });
    };

    return (
        <>
            <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                Set Role Permissions
            </Typography>

            <Box
                sx={{
                    height: '300px',
                    overflowY: 'auto',
                }}
            >

                <Table >
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            {ACTIONS.map((action) => (
                                <TableCell key={action} sx={{ textTransform: 'capitalize' }}>
                                    {action}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {permissions.map((module) => (
                            <TableRow key={module.id}>
                                <TableCell>{module.name}</TableCell>
                                {ACTIONS.map((action) => (
                                    <TableCell key={action}>
                                        <Checkbox
                                            checked={!!permissionMatrix?.[module.id]?.[action]}
                                            onChange={(e) => handleCheck(module.id, action, e.target.checked)}
                                            inputProps={{ 'aria-label': `${module.name}-${action}` }}
                                        />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>

            <Stack direction='row' justifyContent={'space-between'} sx={{ mt: 2 }}>
                <Button onClick={handleBack}>Back</Button>
                <AnimateButton>
                    <Button variant="contained" onClick={handleSubmit}>
                        Save Role
                    </Button>
                </AnimateButton>
            </Stack>
        </>
    );
}

RolePermissionMatrixStep.propTypes = {
    permissionMatrix: PropTypes.object.isRequired,
    setPermissionMatrix: PropTypes.func.isRequired,
    handleBack: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired
};