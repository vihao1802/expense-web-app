import React from 'react';
import { Box, Typography, styled } from '@mui/material';
import type { SvgIconProps } from '@mui/material';

interface SummaryCardProps {
  title: string;
  amount: string | number;
  icon: React.ReactElement<SvgIconProps>;
  date: string;
}

const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const StyledBox = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
  height: '100%',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '6px',
    height: '100%',
    backgroundColor: theme.palette.primary.main,
    borderTopLeftRadius: theme.shape.borderRadius * 2,
    borderBottomLeftRadius: theme.shape.borderRadius * 2,
  },
  '& .summary-header': {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  '& .summary-icon': {
    marginRight: theme.spacing(2),
    color: theme.palette.primary.main,
    fontSize: '2.5rem',
    backgroundColor: `${theme.palette.primary.light}20`,
    borderRadius: '50%',
    padding: theme.spacing(1.5),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& .MuiSvgIcon-root': {
      fontSize: '1.5rem',
    },
  },
  '& .summary-title': {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 500,
    letterSpacing: '0.5px',
    color: theme.palette.primary.dark,
  },
  '& .summary-amount': {
    margin: 0,
    fontSize: '1.8rem',
    fontWeight: 700,
    letterSpacing: '0.5px',
    color: theme.palette.primary.main,
    marginTop: theme.spacing(1),
  },
  '& .summary-date': {
    marginTop: theme.spacing(0.5),
    color: theme.palette.primary.light,
    fontSize: '0.875rem',
    fontWeight: 500,
  },
}));

const SummaryCard: React.FC<SummaryCardProps> = ({ title, amount, icon, date }) => {
  return (
    <StyledBox>
      <Box className="summary-header" sx={{ display: 'flex', alignItems: 'center' }}>
        <Box className="summary-icon">
          {icon}
        </Box>
        <Box>
          <Typography variant="h6" className="summary-title">
            {title}
          </Typography>
          <Typography variant="body2" className="summary-date">
            {new Date(date).toLocaleDateString('vi-VN', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Typography>
        </Box>
      </Box>
      <Typography variant="h4" className="summary-amount">
        {typeof amount === 'number' ? formatVND(amount) : amount}
      </Typography>
    </StyledBox>
  );
};

export default SummaryCard;
