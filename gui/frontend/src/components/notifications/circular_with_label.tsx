import Box from '@mui/material/Box';
import CircularProgress, { type CircularProgressProps } from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

/**
 * https://mui.com/material-ui/react-progress/#circular-with-label
 */
export function CircularProgressWithLabel(props: CircularProgressProps & { progColor?: string; value: number }) {
  const style = { color: props.progColor };

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress style={style} variant='determinate' {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography color='text.secondary' component='div' variant='caption'>{`${Math.round(
          props.value,
        )}%`}</Typography>
      </Box>
    </Box>
  );
}
