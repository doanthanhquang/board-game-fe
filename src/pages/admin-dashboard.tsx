import { Box } from '@mui/material';
import { AdminSidebar, AdminContentArea } from '@/components/admin';

/**
 * AdminDashboard page
 * Main admin interface with sidebar navigation and content management area
 */
export const AdminDashboard = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar />
      <AdminContentArea />
    </Box>
  );
};
