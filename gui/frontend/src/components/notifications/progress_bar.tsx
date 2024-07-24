import Box from '@mui/material/Box';
import LinearProgress, { type LinearProgressProps } from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';

function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant='determinate' {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography color='text.secondary' variant='body2'>{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

type Props = {
  progress: number;
};

export function LinearWithValueLabel({ progress }: Readonly<Props>) {
  return (
    <Box sx={{ width: '100%' }}>
      <LinearProgressWithLabel value={progress} />
    </Box>
  );
}
