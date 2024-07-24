import { Box, CircularProgress } from '@mui/material';

/** This is executed on the server side, so the client's API cannot be used
 * (because it is an alternative page for preparing the Client).
 */
export default function Loading() {
  return (
    <Box
      sx={{
        display: 'grid',
        placeContent: 'center',
        placeItems: 'center',
        height: '100vh',
      }}
    >
      <h1>Loading...</h1>
      <CircularProgress sx={{ marginTop: '20px' }} />
    </Box>
  );
}
