import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

interface SummaryCardsProps {
  totalExpenses: number;
  currentMonthTotal: number;
  currentYearTotal: number;
  currentYear: number;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalExpenses,
  currentMonthTotal,
  currentYearTotal,
  currentYear,
}) => {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 3 }}>
      {/* Total Expenses Card */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3,
          borderRadius: 2,
          border: '1px solid #e0e0e0',
          background: 'linear-gradient(135deg,rgb(252, 98, 98) 0%,rgb(226, 35, 89) 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box>
          <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>Tổng chi tiêu từ đầu đến nay</Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(totalExpenses)}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 1L3 5V11C3 16.55 6.16 21.74 12 23C17.84 21.74 21 16.55 21 11V5L12 1ZM12 11.99H19C18.47 16.11 15.72 19.78 12 20.93V12H5V6.3L12 3.19V11.99Z" fill="white"/>
            </svg>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Đến {new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Monthly Expenses Card */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3,
          borderRadius: 2,
          border: '1px solid #e0e0e0',
          background: 'linear-gradient(135deg,rgb(251, 0, 113) 0%,rgb(255, 112, 173) 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box>
          <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>Chi tiêu tháng này</Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(currentMonthTotal)}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 3H18V1H16V3H8V1H6V3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V8H19V19Z" fill="white"/>
              <path d="M7 10H9V17H7V10Z" fill="white"/>
              <path d="M15 10H17V17H15V10Z" fill="white"/>
              <path d="M11 10H13V14H11V10Z" fill="white"/>
            </svg>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {new Date().toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Yearly Expenses Card */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3,
          borderRadius: 2,
          border: '1px solid #e0e0e0',
          background: 'linear-gradient(135deg,rgb(247, 95, 161) 0%,rgb(240, 74, 163) 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box>
          <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>Chi tiêu năm {currentYear}</Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(currentYearTotal)}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Năm {currentYear}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default SummaryCards;
