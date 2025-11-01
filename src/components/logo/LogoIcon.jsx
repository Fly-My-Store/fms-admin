// material-ui
import { useTheme } from '@mui/material/styles';
import Image from 'next/image';
const logo = '/assets/images/logo.png';


// ==============================|| LOGO ICON ||============================== //

export default function LogoIcon() {
  const theme = useTheme();

  return (
    <Image src={logo} alt="fms" width={100} height={50} style={{
      objectFit: 'contain',
    }} />
  );
}
