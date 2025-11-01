'use client';

import { Box, Typography } from "@mui/material";



const PropertiesWithoutLocation = () => {
    const missingProperties = []
    return (
        <Box p={2} borderLeft="1px solid #ddd" height="100%" flex={3} overflow="auto">
            <Typography variant="h6">Missing Location Properties</Typography>
            {missingProperties.map(p => (
                <Box key={p.id} p={1} borderBottom="1px solid #eee">
                    <Typography>{`Loan: ${p.loan?.loanNumber}`}</Typography>
                    <Typography variant="body2">{p.address}</Typography>
                </Box>
            ))}
        </Box>
    );
};

export default PropertiesWithoutLocation;