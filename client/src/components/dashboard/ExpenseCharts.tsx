import React from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  useTheme, 
  Skeleton, 
  Alert, 
  List, 
  ListItem, 
  ListItemButton 
} from '@mui/material';
import { 
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface ExpenseChartsProps {
  monthlyData: { name: string; amount: number }[];
  monthlyExpenses: number[];
  chartData: ChartData[];
  loading: boolean;
  error: string | null;
}

const ExpenseCharts: React.FC<ExpenseChartsProps> = ({
  monthlyData,
  chartData,
  loading,
  error,
}) => {
  const theme = useTheme();

  // Format Y axis tick
  const formatYAxis = (value: number): string => {
    if (value >= 1000000) return `${value / 1000000}M`;
    if (value >= 1000) return `${value / 1000}K`;
    return value.toString();
  };

  if (loading) return <Skeleton variant="rectangular" height={300} />;
  if (error) return <Alert severity="error">{error}</Alert>;

  // Calculate total for the center of donut chart
  const totalAmount = chartData.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Top Row: Donut Chart and Category List */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {/* Donut Chart */}
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Phân bổ chi tiêu</Typography>
            <Typography variant="body2" color="text.secondary">
              Tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}
            </Typography>
          </Box>
          <Box sx={{ height: 300, position: 'relative' }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius="70%"
                    outerRadius="90%"
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    labelLine={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        stroke="#fff"
                        strokeWidth={1}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [
                      new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                        minimumFractionDigits: 0,
                      }).format(value),
                      'Tổng cộng',
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100%"
                sx={{ color: 'text.secondary' }}
              >
                <Typography>Không có dữ liệu</Typography>
              </Box>
            )}
            {/* Center text for donut chart */}
            {chartData.length > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  pointerEvents: 'none',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Tổng cộng
                </Typography>
                <Typography variant="h6">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    minimumFractionDigits: 0,
                  }).format(totalAmount)}
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>

        {/* Category List */}
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Loại chi tiêu</Typography>
            <Typography variant="body2" color="text.secondary">
              Chi tiết
            </Typography>
          </Box>
          <List sx={{ width: '100%',height: 300, bgcolor: 'background.paper', overflowY: 'auto' }}>
            {chartData.length > 0 ? (
              chartData.map((item, index) => (
                <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton sx={{ borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Box 
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: item.color,
                          mr: 2,
                          flexShrink: 0
                        }}
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1">{item.name}</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="subtitle1">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                            minimumFractionDigits: 0,
                          }).format(item.value)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {((item.value / totalAmount) * 100).toFixed(1)}%
                        </Typography>
                      </Box>
                    </Box>
                  </ListItemButton>
                </ListItem>
              ))
            ) : (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100%"
                sx={{ color: 'text.secondary' }}
              >
                <Typography>Không có dữ liệu</Typography>
              </Box>
            )}
          </List>
        </Paper>
      </Box>

      {/* Bottom Row: Line Chart */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Chi tiêu theo tháng
        </Typography>
        <Box sx={{ height: 300, mt: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={monthlyData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatYAxis} />
              <Tooltip formatter={(value) => [new Intl.NumberFormat('vi-VN').format(Number(value)), 'Tổng tiền']} />
              <Legend />
              <Line
                type="monotone"
                dataKey="amount"
                name="Tổng chi tiêu"
                stroke={theme.palette.primary.main}
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
    </Box>
  );
};

export default ExpenseCharts;
