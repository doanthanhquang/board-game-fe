import { useState } from 'react';
import { Drawer, Box, Typography, IconButton, Tabs, Tab } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { FriendSearch } from './friend-search';
import { FriendList } from './friend-list';
import { FriendRequests } from './friend-requests';

interface FriendModalProps {
  open: boolean;
  onClose: () => void;
  onRequestCountChange?: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`friend-tabpanel-${index}`}
      aria-labelledby={`friend-tab-${index}`}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

export const FriendModal = ({ open, onClose, onRequestCountChange }: FriendModalProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleRequestSent = () => {
    // Refresh requests tab when a request is sent
    setRefreshKey((prev) => prev + 1);
  };

  const handleRequestUpdated = () => {
    // Refresh friends list when a request is accepted
    setRefreshKey((prev) => prev + 1);
    // Notify parent to update request count
    onRequestCountChange?.();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 400, md: 500 },
          boxSizing: 'border-box',
          zIndex: 1300,
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" component="div">
            Friends
          </Typography>
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close" size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="friend tabs">
            <Tab label="Search" id="friend-tab-0" aria-controls="friend-tabpanel-0" />
            <Tab label="Friends" id="friend-tab-1" aria-controls="friend-tabpanel-1" />
            <Tab label="Requests" id="friend-tab-2" aria-controls="friend-tabpanel-2" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <TabPanel value={activeTab} index={0}>
            <FriendSearch onRequestSent={handleRequestSent} />
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <FriendList key={refreshKey} />
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            <FriendRequests
              key={refreshKey}
              onRequestUpdated={handleRequestUpdated}
              onRequestCountChange={onRequestCountChange}
            />
          </TabPanel>
        </Box>
      </Box>
    </Drawer>
  );
};
