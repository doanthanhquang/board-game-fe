import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  type User,
  type CreateUserData,
  type UpdateUserData,
} from '@/api/users';
import { UserForm, UserDeleteDialog, AdminSidebar } from '@/components/admin';

/**
 * Admin User Management page
 * Provides full CRUD operations for user management
 */
export const AdminUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'client' | 'admin' | 'all'>('all');

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Debounced search
  const [searchDebounce, setSearchDebounce] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listUsers({
        page: page + 1, // API uses 1-based pagination
        pageSize,
        search: searchDebounce || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
      });
      if (response.success && response.data) {
        setUsers(response.data.items);
        setTotal(response.data.total);
      }
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, searchDebounce, roleFilter]);

  const handleCreateUser = async (data: CreateUserData) => {
    setFormLoading(true);
    setFormError(null);
    try {
      const response = await createUser(data);
      if (response.success) {
        setFormOpen(false);
        fetchUsers();
      }
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setFormError(apiError?.message || 'Failed to create user');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateUser = async (data: UpdateUserData) => {
    if (!selectedUser) return;
    setFormLoading(true);
    setFormError(null);
    try {
      const response = await updateUser(selectedUser.id, data);
      if (response.success) {
        setFormOpen(false);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setFormError(apiError?.message || 'Failed to update user');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const response = await deleteUser(selectedUser.id);
      if (response.success) {
        setDeleteDialogOpen(false);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setDeleteError(apiError?.message || 'Failed to delete user');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleOpenCreateForm = () => {
    setSelectedUser(null);
    setFormError(null);
    setFormOpen(true);
  };

  const handleOpenEditForm = (user: User) => {
    setSelectedUser(user);
    setFormError(null);
    setFormOpen(true);
  };

  const handleOpenDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setDeleteError(null);
    setDeleteDialogOpen(true);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: (theme) =>
            theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900],
        }}
      >
        <Container maxWidth="xl">
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 2,
              backgroundColor: (theme) =>
                theme.palette.mode === 'light'
                  ? theme.palette.background.paper
                  : theme.palette.grey[800],
            }}
          >
            {/* Header */}
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}
            >
              <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                User Management
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateForm}>
                Create User
              </Button>
            </Box>

            {/* Filters */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <TextField
                placeholder="Search by username or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{ flexGrow: 1, minWidth: 250 }}
              />
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={roleFilter}
                  label="Role"
                  onChange={(e) => setRoleFilter(e.target.value as 'client' | 'admin' | 'all')}
                >
                  <MenuItem value="all">All Roles</MenuItem>
                  <MenuItem value="client">Client</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Users Table */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Username</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                            <Typography color="text.secondary">No users found</Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((user) => (
                          <TableRow key={user.id} hover>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Chip
                                label={user.role}
                                size="small"
                                color={user.role === 'admin' ? 'primary' : 'default'}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title="Edit User">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenEditForm(user)}
                                  color="primary"
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete User">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenDeleteDialog(user)}
                                  color="error"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={total}
                  page={page}
                  onPageChange={(_, newPage) => setPage(newPage)}
                  rowsPerPage={pageSize}
                  onRowsPerPageChange={(e) => {
                    setPageSize(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                  rowsPerPageOptions={[10, 20, 50, 100]}
                />
              </>
            )}
          </Paper>
        </Container>

        {/* User Form Dialog */}
        <UserForm
          open={formOpen}
          user={selectedUser}
          onClose={() => {
            setFormOpen(false);
            setSelectedUser(null);
            setFormError(null);
          }}
          onSubmit={async (data) => {
            if (selectedUser) {
              await handleUpdateUser(data as UpdateUserData);
            } else {
              await handleCreateUser(data as CreateUserData);
            }
          }}
          loading={formLoading}
          error={formError}
        />

        {/* Delete Confirmation Dialog */}
        <UserDeleteDialog
          open={deleteDialogOpen}
          user={selectedUser}
          onClose={() => {
            setDeleteDialogOpen(false);
            setSelectedUser(null);
            setDeleteError(null);
          }}
          onConfirm={handleDeleteUser}
          loading={deleteLoading}
          error={deleteError}
        />
      </Box>
    </Box>
  );
};
