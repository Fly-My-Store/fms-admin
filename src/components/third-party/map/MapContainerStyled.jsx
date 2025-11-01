// material-ui
import { styled } from '@mui/material/styles';

// ==============================|| MAP BOX - CONTAINER STYLED ||============================== //

const MapContainerStyled = styled('div')({
  zIndex: 0,
  height: 240,
  position: 'relative',
  backgroundColor: 'gray',
  borderRadius: 4,
  '& .mapboxgl-ctrl-logo, .mapboxgl-ctrl-bottom-right': {
    display: 'none'
  }
});



export default MapContainerStyled;
